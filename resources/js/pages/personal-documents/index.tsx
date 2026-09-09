import React, { useState, useRef, useMemo } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { Card, CardBody, Col, Row, Button, Form, Badge, Table, InputGroup, ProgressBar, Modal, Collapse } from 'react-bootstrap';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Swal from 'sweetalert2';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface ThesisCategoryItem {
    id: number;
    category_no: number;
    name: string;
    suggested_name?: string | null;
    description?: string | null;
    item_reference?: string | null;
}

export interface StandardDocumentItem {
    id?: number;
    item_no: number;
    title: string;
    description?: string | null;
    required: boolean;
    is_active?: boolean;
    thesis_category_id?: number | null;
    thesis_category?: ThesisCategoryItem | null;
}

// รายการเอกสารมาตรฐานสำรอง (Fallback หากยังไม่มีข้อมูลในฐานข้อมูล)
export const STANDARD_DOCUMENTS_FALLBACK: StandardDocumentItem[] = [
    { item_no: 1, title: 'สำเนาบัตรประจำตัวประชาชน', description: 'สำเนาบัตรประจำตัวประชาชน พร้อมลงลายมือชื่อรับรองสำเนาถูกต้อง', required: true },
    { item_no: 2, title: 'สำเนาทะเบียนบ้าน', description: 'สำเนาทะเบียนบ้านหน้าแรกและหน้าที่มีชื่อตนเอง', required: true },
    { item_no: 3, title: 'สำเนาวุฒิการศึกษา / ปริญญาบัตร', description: 'สำเนาปริญญาบัตรหรือประกาศนียบัตรตามคุณวุฒิที่ใช้สมัคร', required: true },
    { item_no: 4, title: 'สำเนาใบแสดงผลการศึกษา (Transcript)', description: 'สำเนาใบรายงานผลการเรียนตลอดหลักสูตรฉบับสมบูรณ์', required: true },
    { item_no: 5, title: 'สำเนาใบอนุญาตประกอบวิชาชีพ', description: 'สำเนาใบอนุญาตประกอบวิชาชีพหรือหลักฐานการต่ออายุ', required: true },
    { item_no: 6, title: 'หนังสือรับรองการทำงาน / ประวัติการทำงาน', description: 'หนังสือรับรองประสบการณ์การทำงานหรือประวัติการทำงานที่ผ่านมา', required: false },
    { item_no: 7, title: 'ใบรับรองแพทย์ตรวจสุขภาพ', description: 'ใบรับรองแพทย์จากสถานพยาบาลของรัฐ (อายุไม่เกิน 1 เดือน)', required: true },
    { item_no: 8, title: 'สำเนาสมุดบัญชีเงินฝากธนาคาร', description: 'หน้าสมุดบัญชีธนาคารสำหรับรับโอนเงินเดือนและค่าตอบแทน', required: true },
    { item_no: 9, title: 'รูปถ่ายหน้าตรงชุดสุภาพ / เครื่องแบบ', description: 'รูปถ่ายหน้าตรง ขนาด 1 หรือ 2 นิ้ว ถ่ายไว้ไม่เกิน 6 เดือน', required: true },
    { item_no: 10, title: 'สำเนาใบเปลี่ยนชื่อ - นามสกุล', description: 'เอกสารการเปลี่ยนชื่อตัวหรือชื่อสกุล (ถ้ามี)', required: false },
    { item_no: 11, title: 'สำเนาทะเบียนสมรส / ทะเบียนการหย่า', description: 'เอกสารแสดงสถานภาพครอบครัว (ถ้ามี)', required: false },
    { item_no: 12, title: 'สำเนาหลักฐานการเกณฑ์ทหาร (สด.8 / สด.43)', description: 'หนังสือสำคัญทางทหารสำหรับบุคลากรเพศชาย', required: false },
    { item_no: 13, title: 'หนังสือรับรองการช่วยชีวิตขั้นพื้นฐาน (BLS / CPR)', description: 'ประกาศนียบัตรการฝึกอบรมการช่วยฟื้นคืนชีพขั้นพื้นฐาน', required: false },
    { item_no: 14, title: 'หนังสือยินยอมการคุ้มครองข้อมูลส่วนบุคคล (PDPA)', description: 'หนังสือให้ความยินยอมเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล', required: true },
    { item_no: 15, title: 'สัญญาจ้างงาน / หนังสือแต่งตั้งปฏิบัติหน้าที่', description: 'สำเนาสัญญาจ้างงานหรือคำสั่งแต่งตั้งการปฏิบัติงาน', required: true },
    { item_no: 16, title: 'บันทึกข้อตกลงการปฏิบัติงาน (PA / Agreement)', description: 'แบบข้อตกลงและเป้าหมายการปฏิบัติงานประจำปี', required: false },
    { item_no: 17, title: 'สำเนาบัตรประจำตัวเจ้าหน้าที่ / ข้าราชการ', description: 'สำเนาบัตรแสดงตนในฐานะบุคลากรสังกัดกระทรวงสาธารณสุข', required: false },
    { item_no: 18, title: 'เอกสารการทดสอบสมรรถนะการปฏิบัติงาน', description: 'ผลการประเมินทักษะหรือสมรรถนะทางวิชาชีพ', required: false },
    { item_no: 19, title: 'หนังสือรับรองความประพฤติ / ตรวจประวัติอาชญากรรม', description: 'เอกสารการตรวจสอบประวัติอาชญากรรมจากสำนักงานตำรวจแห่งชาติ', required: false },
    { item_no: 20, title: 'แผนพัฒนาตนเองรายบุคคล (IDP)', description: 'แบบจัดทำแผนพัฒนาศักยภาพตนเองประจำปีงบประมาณ', required: false },
    { item_no: 21, title: 'ประวัติการฉีดวัคซีนและผลตรวจภูมิคุ้มกัน', description: 'หลักฐานการรับวัคซีนป้องกันโรคตับอักเสบ ไข้หวัดใหญ่ โควิด-19 ฯลฯ', required: true },
    { item_no: 22, title: 'สำเนาใบอนุญาตขับขี่รถยนต์', description: 'สำหรับเจ้าหน้าที่ขับขี่รถพยาบาลหรือยานพาหนะของทางราชการ', required: false },
    { item_no: 23, title: 'คำสั่งแต่งตั้งคณะกรรมการ / คณะทำงาน', description: 'คำสั่งหรือหนังสือแต่งตั้งมอบหมายงานเฉพาะกิจ', required: false },
    { item_no: 24, title: 'สำเนาบัตรประกันสังคม / สิทธิการรักษาพยาบาล', description: 'เอกสารแสดงสิทธิหลักประกันสุขภาพหรือสวัสดิการรักษาพยาบาล', required: false },
    { item_no: 25, title: 'หนังสือยินยอมการหักเงินเดือนและสวัสดิการ', description: 'แบบแสดงความจำนงหักเงินเดือนเข้ากองทุนหรือสวัสดิการ', required: false },
    { item_no: 26, title: 'แบบประเมินค่างานและการกำหนดตำแหน่ง', description: 'เอกสารประเมินภาระงานและมาตรฐานกำหนดตำแหน่ง', required: false },
    { item_no: 27, title: 'แบบฟอร์มแสดงความประสงค์ผู้รับผลประโยชน์', description: 'หนังสือระบุผู้รับผลประโยชน์กรณีเสียชีวิตหรือเงินสงเคราะห์', required: true }
];

interface DocumentItem {
    id: number;
    item_no?: number | null;
    title: string;
    description?: string | null;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    uploader_name: string;
    user_id?: number | null;
    file_url: string;
    view_url?: string;
    download_url?: string;
    formatted_file_size: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface PageProps {
    documents: DocumentItem[];
    standard_documents?: StandardDocumentItem[];
    thesis_categories?: ThesisCategoryItem[];
    auth_user?: {
        id: number;
        name: string;
        email: string;
        role?: string;
    } | null;
    target_user?: {
        id: number;
        name: string;
        email: string;
        role?: string;
        student_profile?: any;
    } | null;
    is_admin?: boolean;
}

const PersonalDocumentsPage = ({
    documents = [],
    standard_documents = [],
    thesis_categories = [],
    auth_user,
    target_user,
    is_admin = false
}: PageProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'uploaded' | 'pending'>('all');
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({});
    const [isDragging, setIsDragging] = useState(false);

    // Toggle collapse for category group
    const toggleCategoryCollapse = (key: string) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Modal state for uploading specific item
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [activeUploadItem, setActiveUploadItem] = useState<StandardDocumentItem | null>(null);

    // Admin state for managing standard documents
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showEditStandardDocModal, setShowEditStandardDocModal] = useState(false);
    const [editingStandardDoc, setEditingStandardDoc] = useState<StandardDocumentItem | null>(null);
    const [isSavingStandardDoc, setIsSavingStandardDoc] = useState(false);
    const [stdFormData, setStdFormData] = useState<{
        item_no: number;
        title: string;
        description: string;
        required: boolean;
        thesis_category_id: number | null;
    }>({
        item_no: 1,
        title: '',
        description: '',
        required: false,
        thesis_category_id: null,
    });

    const isViewingOtherStudent = is_admin && target_user && auth_user && target_user.id !== auth_user.id;
    const defaultUploaderName = isViewingOtherStudent ? (target_user?.name || '') : (auth_user?.name || '');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        item_no: number;
        title: string;
        uploader_name: string;
        description: string;
        document_file: File | null;
        user_id?: number | null;
    }>({
        item_no: 1,
        title: '',
        uploader_name: defaultUploaderName,
        description: '',
        document_file: null,
        user_id: isViewingOtherStudent ? target_user?.id : null,
    });

    // Use standard_documents from database if available, otherwise fallback
    const activeStandardDocs = (standard_documents && standard_documents.length > 0)
        ? standard_documents
        : STANDARD_DOCUMENTS_FALLBACK;

    // Sorted active standard documents by item_no asc
    const sortedStandardDocs = [...activeStandardDocs].sort((a, b) => a.item_no - b.item_no);

    // Map uploaded documents by item_no
    const docsMap: { [key: number]: DocumentItem } = {};
    documents.forEach((doc) => {
        if (doc.item_no) {
            docsMap[doc.item_no] = doc;
        }
    });

    // Format Thai Date and Time
    const formatThaiDateTime = (dateString: string) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;

        return d.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }) + ' น.';
    };

    // Format file size
    const formatBytes = (bytes: number) => {
        if (!bytes || bytes <= 0) return '0 B';
        if (bytes >= 1048576) {
            return (bytes / 1048576).toFixed(2) + ' MB';
        }
        if (bytes >= 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        }
        return bytes + ' B';
    };

    // Open upload modal for a specific standard item
    const handleOpenUploadModal = (item: StandardDocumentItem) => {
        setActiveUploadItem(item);
        setData({
            item_no: item.item_no,
            title: item.title,
            uploader_name: isViewingOtherStudent ? (target_user?.name || '') : (auth_user?.name || ''),
            description: item.description || '',
            document_file: null,
            user_id: isViewingOtherStudent ? target_user?.id : null,
        });
        setSelectedFile(null);
        clearErrors();
        setShowUploadModal(true);
    };

    // Admin: Open edit standard document modal
    const handleOpenEditStandardDoc = (item: StandardDocumentItem) => {
        setEditingStandardDoc(item);
        setStdFormData({
            item_no: item.item_no,
            title: item.title,
            description: item.description || '',
            required: !!item.required,
            thesis_category_id: item.thesis_category_id ?? null,
        });
        setShowEditStandardDocModal(true);
    };

    // Admin: Open create standard document modal
    const handleOpenCreateStandardDoc = () => {
        const nextNo = sortedStandardDocs.length > 0
            ? Math.max(...sortedStandardDocs.map((x) => x.item_no)) + 1
            : 1;
        setEditingStandardDoc(null);
        setStdFormData({
            item_no: nextNo,
            title: '',
            description: '',
            required: false,
            thesis_category_id: null,
        });
        setShowEditStandardDocModal(true);
    };

    // Admin: Save standard document (Create or Update)
    const handleSaveStandardDoc = (e: React.FormEvent) => {
        e.preventDefault();
        if (!stdFormData.title.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'กรุณาระบุชื่อเอกสาร',
                text: 'ชื่อเอกสารมาตรฐานไม่สามารถเว้นว่างได้',
                confirmButtonColor: '#465dff',
            });
            return;
        }

        setIsSavingStandardDoc(true);

        if (editingStandardDoc && editingStandardDoc.id) {
            // Update
            router.put(`/standard-documents/${editingStandardDoc.id}`, stdFormData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSavingStandardDoc(false);
                    setShowEditStandardDocModal(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'ปรับปรุงสำเร็จ!',
                        text: `แก้ไขรายการ "${stdFormData.title}" เรียบร้อยแล้ว`,
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
                onError: (err) => {
                    setIsSavingStandardDoc(false);
                    const msg = Object.values(err)[0] || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล';
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: String(msg),
                        confirmButtonColor: '#465dff',
                    });
                },
            });
        } else {
            // Create
            router.post('/standard-documents', stdFormData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSavingStandardDoc(false);
                    setShowEditStandardDocModal(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'เพิ่มรายการสำเร็จ!',
                        text: `เพิ่มรายการเอกสาร "${stdFormData.title}" เรียบร้อยแล้ว`,
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
                onError: (err) => {
                    setIsSavingStandardDoc(false);
                    const msg = Object.values(err)[0] || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล';
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: String(msg),
                        confirmButtonColor: '#465dff',
                    });
                },
            });
        }
    };

    // Admin: Delete standard document
    const handleDeleteStandardDoc = (item: StandardDocumentItem) => {
        if (!item.id) return;
        Swal.fire({
            icon: 'warning',
            title: `ยืนยันการลบรายการ?`,
            text: `ต้องการลบ "${item.title}" (ลำดับที่ ${item.item_no}) ออกจากรายการเอกสารมาตรฐานใช่หรือไม่?`,
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'ใช่, ต้องการลบ',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/standard-documents/${item.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'ลบรายการสำเร็จ',
                            text: `รายการเอกสารลำดับที่ ${item.item_no} ถูกลบเรียบร้อยแล้ว`,
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    },
                    onError: (err) => {
                        const msg = Object.values(err)[0] || 'ไม่สามารถลบรายการเอกสารได้';
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: String(msg),
                            confirmButtonColor: '#465dff',
                        });
                    },
                });
            }
        });
    };

    // Admin: Move item up or down in sequence
    const handleMoveItem = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sortedStandardDocs.length) return;

        const currentItem = sortedStandardDocs[index];
        const targetItem = sortedStandardDocs[targetIndex];
        if (!currentItem.id || !targetItem.id) return;

        const orders = [
            { id: currentItem.id, item_no: targetItem.item_no },
            { id: targetItem.id, item_no: currentItem.item_no },
        ];

        router.post('/standard-documents/reorder', { orders }, {
            preserveScroll: true,
        });
    };

    // Handle file selection with instant size verification
    const handleFileChange = (file: File | null) => {
        if (!file) {
            setSelectedFile(null);
            setData('document_file', null);
            return;
        }

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            Swal.fire({
                icon: 'error',
                title: 'ชนิดไฟล์ไม่ถูกต้อง',
                text: 'กรุณาเลือกไฟล์เอกสารที่เป็นรูปแบบ PDF (.pdf) เท่านั้น',
                confirmButtonColor: '#465dff',
                confirmButtonText: 'ตกลง',
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            setSelectedFile(null);
            setData('document_file', null);
            return;
        }

        // ตรวจสอบขนาดไฟล์ทันทีก่อนเลือก (แจ้งเตือนล่วงหน้าหากไฟล์ใหญ่เกินไป)
        if (file.size > MAX_FILE_SIZE_BYTES) {
            const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            Swal.fire({
                icon: 'warning',
                title: 'ไฟล์มีขนาดใหญ่เกินกำหนด!',
                html: `
                    <div style="text-align: left; padding: 4px;">
                        <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 10px; margin-bottom: 12px;">
                            <span style="color: #6c757d; font-size: 12px;">ชื่อไฟล์ที่เลือก:</span>
                            <div style="font-weight: bold; color: #212529; word-break: break-all; margin-top: 2px;">${file.name}</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 14px;">
                            <span style="color: #495057;">ขนาดไฟล์ของคุณ:</span>
                            <span style="background-color: #dc3545; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${actualSizeMB} MB</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px;">
                            <span style="color: #495057;">ขนาดสูงสุดที่ระบบอนุญาต:</span>
                            <span style="background-color: #198754; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold;">ไม่เกิน ${MAX_FILE_SIZE_MB} MB</span>
                        </div>
                        <div style="background-color: #fff3cd; color: #664d03; border-radius: 6px; padding: 10px; font-size: 13px; margin-top: 10px;">
                            <strong>💡 คำแนะนำ:</strong> กรุณาลดขนาดไฟล์ (Compress PDF) หรือเลือกไฟล์ PDF ที่มีขนาดไม่เกิน <strong>${MAX_FILE_SIZE_MB} MB</strong>
                        </div>
                    </div>
                `,
                confirmButtonColor: '#465dff',
                confirmButtonText: 'รับทราบ / เลือกไฟล์ใหม่',
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            setSelectedFile(null);
            setData('document_file', null);
            return;
        }

        setSelectedFile(file);
        setData('document_file', file);
        clearErrors('document_file');
    };

    // Handle form submit inside modal
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.document_file) {
            Swal.fire({
                icon: 'warning',
                title: 'ยังไม่ได้เลือกไฟล์',
                text: 'กรุณาเลือกไฟล์ PDF ที่ต้องการอัปโหลด',
                confirmButtonColor: '#465dff',
                confirmButtonText: 'ตกลง',
            });
            return;
        }

        if (data.document_file.size > MAX_FILE_SIZE_BYTES) {
            Swal.fire({
                icon: 'error',
                title: 'ไฟล์มีขนาดใหญ่เกินกำหนด',
                text: `ระบบรองรับไฟล์ขนาดไม่เกิน ${MAX_FILE_SIZE_MB} MB เท่านั้น กรุณาเลือกไฟล์ใหม่`,
                confirmButtonColor: '#465dff',
                confirmButtonText: 'ตกลง',
            });
            return;
        }

        post('/personal-documents', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowUploadModal(false);
                Swal.fire({
                    icon: 'success',
                    title: 'อัปโหลดสำเร็จ!',
                    text: `เอกสารลำดับที่ ${data.item_no} "${data.title}" ถูกบันทึกเรียบร้อยแล้ว`,
                    timer: 2000,
                    showConfirmButton: false,
                });
                reset('document_file');
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: (err) => {
                const errorMsg = Object.values(err)[0] || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์';
                Swal.fire({
                    icon: 'error',
                    title: 'ไม่สามารถอัปโหลดได้',
                    text: String(errorMsg),
                    confirmButtonColor: '#465dff',
                });
            },
        });
    };

    // Handle delete uploaded document
    const handleDelete = (doc: DocumentItem) => {
        Swal.fire({
            icon: 'warning',
            title: 'ยืนยันการลบเอกสาร?',
            html: `คุณแน่ใจหรือไม่ว่าต้องการลบเอกสาร <strong>"${doc.title}"</strong> (ลำดับที่ ${doc.item_no || '-'})?<br/><small class="text-danger">การดำเนินการนี้จะไม่สามารถกู้คืนไฟล์ได้</small>`,
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'ใช่, ต้องการลบ',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/personal-documents/${doc.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'ลบเอกสารสำเร็จ!',
                            text: 'ไฟล์เอกสารได้ถูกลบออกจากระบบเรียบร้อยแล้ว',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    },
                    onError: (err) => {
                        const errorMsg = Object.values(err)[0] || 'เกิดข้อผิดพลาดในการลบเอกสาร';
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: String(errorMsg),
                            confirmButtonColor: '#465dff',
                        });
                    },
                });
            }
        });
    };

    // Drag & drop handlers for modal
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    // Calculate completed count and next active items
    const completedCount = sortedStandardDocs.filter((item) => !!docsMap[item.item_no]).length;
    const totalStandardCount = sortedStandardDocs.length;
    const progressPercent = totalStandardCount > 0 ? Math.round((completedCount / totalStandardCount) * 100) : 0;

    // Helper: รายการหมวดหมู่วิทยานิพนธ์เรียงตาม category_no
    const sortedCategoriesList = useMemo(() => {
        return [...(thesis_categories || [])].sort((a, b) => a.category_no - b.category_no);
    }, [thesis_categories]);

    // Helper: ตรวจสอบสถานะผ่านเกณฑ์ของแต่ละหมวดวิทยานิพนธ์ (Category Satisfied)
    // 1. หมวดที่เงื่อนไขเป็น "หรือ" (เช่น ลำดับที่ 1 หรือ 21): ผ่านเกณฑ์เมื่อมีการอัปโหลดข้อใดข้อหนึ่งในหมวดนั้นแล้ว
    // 2. หมวดที่ 5 (ลำดับที่ 10 และ (11 หรือ 12)): ลำดับที่ 10 ต้องอัปโหลด และ (11 หรือ 12) ต้องอัปโหลดอย่างน้อย 1 ข้อ
    // 3. หมวดที่เงื่อนไขเป็น "ถึง", "และ", หรือข้อเดี่ยว: ผ่านเกณฑ์เมื่อทุกข้อที่เป็น required ในหมวดนั้นได้รับการอัปโหลดครบถ้วน
    const checkIsCategorySatisfied = (cat: ThesisCategoryItem | null): boolean => {
        if (!cat) return true;
        const catDocs = sortedStandardDocs.filter((x) => x.thesis_category_id === cat.id);
        if (catDocs.length === 0) return true;

        const ref = (cat.item_reference || '').trim();

        // กรณีเงื่อนไข composite หมวด 5: ลำดับที่ 10 และ (11 หรือ 12)
        if (ref.includes('10') && (ref.includes('11') || ref.includes('12')) && ref.includes('หรือ')) {
            const doc10 = catDocs.find(d => d.item_no === 10);
            const doc11 = catDocs.find(d => d.item_no === 11);
            const doc12 = catDocs.find(d => d.item_no === 12);

            const is10Done = !!(doc10 && docsMap[10]) || !doc10?.required;
            const is11or12Done = (!!(doc11 && docsMap[11])) || (!!(doc12 && docsMap[12])) || (!doc11?.required && !doc12?.required);
            return is10Done && is11or12Done;
        }

        // กรณีเงื่อนไขเป็น "หรือ" (เช่น ลำดับที่ 1 หรือ 21)
        if (ref.includes('หรือ') && !ref.includes('และ')) {
            return catDocs.some((d) => !!docsMap[d.item_no]) || catDocs.every((d) => !d.required);
        }

        // กรณีเงื่อนไข "ถึง", "และ", หรือรายการเดี่ยว: ต้องอัปโหลดครบทุกข้อที่เป็น Required
        return catDocs.every((d) => !!docsMap[d.item_no] || !d.required);
    };

    // Helper: ตรวจสอบว่าหมวดวิทยานิพนธ์ถูกปลดล็อกให้เริ่มอัปโหลดได้แล้วหรือไม่
    // กฎ: หมวดแรกปลดล็อกเสมอ หมวดถัดไปจะปลดล็อกเมื่อหมวดก่อนหน้าทั้งหมด "ผ่านเกณฑ์ (Satisfied)"
    const checkIsCategoryUnlocked = (cat: ThesisCategoryItem | null): { isUnlocked: boolean; blockingCategory: ThesisCategoryItem | null } => {
        if (!cat) return { isUnlocked: true, blockingCategory: null };
        const catIdx = sortedCategoriesList.findIndex((c) => c.id === cat.id);
        if (catIdx <= 0) return { isUnlocked: true, blockingCategory: null };

        // ตรวจสอบหมวดก่อนหน้าทั้งหมด
        for (let i = 0; i < catIdx; i++) {
            const prevCat = sortedCategoriesList[i];
            if (!checkIsCategorySatisfied(prevCat)) {
                return { isUnlocked: false, blockingCategory: prevCat };
            }
        }
        return { isUnlocked: true, blockingCategory: null };
    };

    // Helper: ตรวจสอบว่าเอกสารแต่ละรายการสามารถอัปโหลดได้หรือไม่
    const checkIsItemUnlocked = (item: StandardDocumentItem): {
        isUnlocked: boolean;
        canUpload: boolean;
        blockingCategory: ThesisCategoryItem | null;
        blockingItem: StandardDocumentItem | null;
        ruleType: 'or' | 'range' | 'and' | 'single' | 'composite';
    } => {
        const isUploaded = !!docsMap[item.item_no];
        if (isUploaded) {
            return {
                isUnlocked: true,
                canUpload: false,
                blockingCategory: null,
                blockingItem: null,
                ruleType: 'single',
            };
        }

        const cat = sortedCategoriesList.find((c) => c.id === item.thesis_category_id) || null;
        const catUnlock = checkIsCategoryUnlocked(cat);

        // ตรวจสอบการปลดล็อก: ปลดล็อกเรียงลำดับตามหมวดเท่านั้น ยกเลิกการตรวจสอบตามลำดับหัวข้อ
        const ref = (cat?.item_reference || '').trim();
        const ruleType: 'or' | 'range' | 'and' | 'single' | 'composite' =
            (ref.includes('10') && (ref.includes('11') || ref.includes('12')) && ref.includes('หรือ'))
                ? 'composite'
                : (ref.includes('หรือ') && !ref.includes('และ'))
                ? 'or'
                : ref.includes('ถึง')
                ? 'range'
                : ref.includes('และ')
                ? 'and'
                : 'single';

        // ถ้าหมวดยังไม่ปลดล็อก เอกสารในหมวดนี้จะถูกล็อกทั้งหมด
        if (!catUnlock.isUnlocked) {
            return {
                isUnlocked: false,
                canUpload: false,
                blockingCategory: catUnlock.blockingCategory,
                blockingItem: null,
                ruleType,
            };
        }

        // หากหมวดปลดล็อกแล้ว (หรือไม่มีหมวด) ให้ enable ปุ่มทุกข้อในหมวดนั้นทันที (ยกเลิกตรวจสอบตามลำดับหัวข้อ)
        return {
            isUnlocked: true,
            canUpload: true,
            blockingCategory: null,
            blockingItem: null,
            ruleType,
        };
    };

    // ค้นหารายการที่พร้อมให้อัปโหลดทั้งหมดในขณะนี้ (ยังไม่ได้อัปโหลด และสถานะปลดล็อกแล้ว)
    const readyToUploadItems = sortedStandardDocs.filter((item) => {
        return !docsMap[item.item_no] && checkIsItemUnlocked(item).canUpload;
    });
    const readyItemNumbers = readyToUploadItems.map((x) => x.item_no);

    // Filter standard items by search, status, and thesis category
    const filteredItems = sortedStandardDocs.filter((item) => {
        const isUploaded = !!docsMap[item.item_no];

        if (filterStatus === 'uploaded' && !isUploaded) return false;
        if (filterStatus === 'pending' && isUploaded) return false;

        if (selectedCategory !== 'all' && item.thesis_category_id !== selectedCategory) {
            return false;
        }

        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase().trim();
            const matchesTitle = item.title.toLowerCase().includes(q);
            const matchesDesc = (item.description || '').toLowerCase().includes(q);
            const matchesCategory = (item.thesis_category?.name || '').toLowerCase().includes(q)
                || (item.thesis_category?.suggested_name || '').toLowerCase().includes(q);
            const matchesItemNo = item.item_no.toString() === q;
            const matchesFile = isUploaded && docsMap[item.item_no].file_name.toLowerCase().includes(q);
            return matchesTitle || matchesDesc || matchesCategory || matchesItemNo || matchesFile;
        }

        return true;
    });

    // จัดกลุ่มเอกสารมาตรฐานตามหมวดหมู่วิทยานิพนธ์ (เรียงลำดับตาม category_no)
    const groupedDocuments = useMemo(() => {
        const sortedCats = [...(thesis_categories || [])].sort((a, b) => a.category_no - b.category_no);

        const groups: {
            key: string;
            category: ThesisCategoryItem | null;
            items: StandardDocumentItem[];
            totalCount: number;
            completedCount: number;
            isAllCompleted: boolean;
            isCategorySatisfied: boolean;
            isCategoryUnlocked: boolean;
            blockingCategory: ThesisCategoryItem | null;
            conditionType: 'or' | 'range' | 'composite' | 'and' | 'single';
            hasActiveItem: boolean;
        }[] = [];

        const filteredSet = new Set(filteredItems.map(i => i.item_no));

        // วนลูปจัดกลุ่มตามหมวดวิทยานิพนธ์ 1-10
        sortedCats.forEach((cat) => {
            const catAllItems = sortedStandardDocs.filter(item => item.thesis_category_id === cat.id);
            const catFilteredItems = catAllItems.filter(item => filteredSet.has(item.item_no));

            if (catFilteredItems.length > 0) {
                const completedInCat = catAllItems.filter(item => !!docsMap[item.item_no]).length;
                const isCatSat = checkIsCategorySatisfied(cat);
                const catUnlock = checkIsCategoryUnlocked(cat);
                const hasActive = catFilteredItems.some(item => readyItemNumbers.includes(item.item_no));

                const ref = (cat.item_reference || '').trim();
                const conditionType: 'or' | 'range' | 'composite' | 'and' | 'single' =
                    (ref.includes('10') && (ref.includes('11') || ref.includes('12')) && ref.includes('หรือ'))
                        ? 'composite'
                        : (ref.includes('หรือ') && !ref.includes('และ'))
                        ? 'or'
                        : ref.includes('ถึง')
                        ? 'range'
                        : ref.includes('และ')
                        ? 'and'
                        : 'single';

                groups.push({
                    key: `cat-${cat.id}`,
                    category: cat,
                    items: catFilteredItems,
                    totalCount: catAllItems.length,
                    completedCount: completedInCat,
                    isAllCompleted: catAllItems.length > 0 && completedInCat === catAllItems.length,
                    isCategorySatisfied: isCatSat,
                    isCategoryUnlocked: catUnlock.isUnlocked,
                    blockingCategory: catUnlock.blockingCategory,
                    conditionType,
                    hasActiveItem: hasActive,
                });
            }
        });

        // เอกสารที่ยังไม่ได้จัดหมวดหมู่ (ถ้ามี)
        const uncatAllItems = sortedStandardDocs.filter(item => !item.thesis_category_id);
        const uncatFilteredItems = uncatAllItems.filter(item => filteredSet.has(item.item_no));
        if (uncatFilteredItems.length > 0) {
            const completedInCat = uncatAllItems.filter(item => !!docsMap[item.item_no]).length;
            const hasActive = uncatFilteredItems.some(item => readyItemNumbers.includes(item.item_no));
            groups.push({
                key: 'cat-uncategorized',
                category: null,
                items: uncatFilteredItems,
                totalCount: uncatAllItems.length,
                completedCount: completedInCat,
                isAllCompleted: uncatAllItems.length > 0 && completedInCat === uncatAllItems.length,
                isCategorySatisfied: true,
                isCategoryUnlocked: true,
                blockingCategory: null,
                conditionType: 'single',
                hasActiveItem: hasActive,
            });
        }

        return groups;
    }, [sortedStandardDocs, filteredItems, thesis_categories, docsMap, readyItemNumbers, sortedCategoriesList]);

    // Expand all or collapse all groups
    const expandAllCategories = () => setCollapsedCategories({});
    const collapseAllCategories = () => {
        const allCollapsed: { [key: string]: boolean } = {};
        groupedDocuments.forEach(g => {
            allCollapsed[g.key] = true;
        });
        setCollapsedCategories(allCollapsed);
    };

    const totalBytes = documents.reduce((sum, d) => sum + (Number(d.file_size) || 0), 0);

    return (
        <MainLayout>
            <PageTitle title="เอกสารประจำตัว" subTitle="ระบบจัดการเอกสารมาตรฐาน" />

            {/* Admin Banner when viewing documents of a specific student */}
            {isViewingOtherStudent && (
                <div className="alert alert-primary border-primary border-opacity-25 bg-primary-subtle d-flex align-items-center justify-content-between flex-wrap gap-3 py-2 px-3 mb-3 shadow-sm rounded-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="avatar-md rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: 42, height: 42 }}>
                            <IconifyIcon icon="tabler:school" className="fs-22" />
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span className="badge bg-primary text-white fs-11 py-1 px-2">
                                    โหมดผู้ดูแลระบบ (Admin View)
                                </span>
                                <h5 className="mb-0 fw-bold text-dark fs-15">
                                    เอกสารประจำตัวของ: {target_user?.name}
                                </h5>
                                {target_user?.student_profile?.student_code && (
                                    <span className="badge bg-light text-primary border border-primary-subtle fs-12">
                                        รหัส: {target_user.student_profile.student_code}
                                    </span>
                                )}
                            </div>
                            <small className="text-muted d-block mt-1">
                                {target_user?.email} {target_user?.student_profile?.major ? `• สาขาวิชา: ${target_user.student_profile.major}` : ''}
                            </small>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Link href="/admin/students" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 shadow-sm">
                            <IconifyIcon icon="solar:arrow-left-linear" className="fs-16" />
                            <span>กลับไปหน้ารายชื่อนักศึกษา</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Quick Stats & Progress Overview */}
            <Row className="g-3 mt-1 mb-4">
                <Col xl={4} md={6}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 50, height: 50 }}>
                                <IconifyIcon icon="tabler:id-badge-2" className="fs-26" />
                            </div>
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <h6 className="text-muted fw-semibold mb-0 fs-13">ความคืบหน้าการอัปโหลด</h6>
                                    <span className="badge bg-primary fs-12">{progressPercent}%</span>
                                </div>
                                <h3 className="mb-2 fw-bold text-dark">
                                    {completedCount} <span className="fs-14 fw-normal text-muted">/ {totalStandardCount} รายการ</span>
                                </h3>
                                <ProgressBar now={progressPercent} variant={progressPercent === 100 ? 'success' : 'primary'} style={{ height: '6px' }} />
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={4} md={6}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 50, height: 50 }}>
                                <IconifyIcon icon="solar:clock-circle-bold-duotone" className="fs-26" />
                            </div>
                            <div>
                                <h6 className="text-muted fw-semibold mb-1 fs-13">สถานะลำดับปัจจุบัน</h6>
                                <h5 className="mb-0 fw-bold text-dark fs-15">
                                    {readyItemNumbers.length > 0 ? (
                                        <span className="text-primary">
                                            ลำดับที่ {readyItemNumbers.length <= 3
                                                ? readyItemNumbers.join(', ')
                                                : `${readyItemNumbers.slice(0, 3).join(', ')}...`} (พร้อมให้อัปโหลด)
                                        </span>
                                    ) : completedCount === totalStandardCount ? (
                                        <span className="text-success">
                                            ✓ อัปโหลดครบถ้วนทุกรายการแล้ว
                                        </span>
                                    ) : (
                                        <span className="text-success">
                                            ✓ อัปโหลดเอกสารจำเป็นครบถ้วนแล้ว
                                        </span>
                                    )}
                                </h5>
                                <small className="text-muted">
                                    {readyItemNumbers.length > 0
                                        ? `เปิดให้อัปโหลด ${readyItemNumbers.length} รายการ (เอกสารทางเลือกข้ามได้)`
                                        : 'เอกสารครบตามเกณฑ์มาตรฐาน'}
                                </small>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={4} md={12}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 50, height: 50 }}>
                                <IconifyIcon icon="solar:database-bold-duotone" className="fs-26" />
                            </div>
                            <div>
                                <h6 className="text-muted fw-semibold mb-1 fs-13">พื้นที่จัดเก็บทั้งหมด</h6>
                                <h3 className="mb-0 fw-bold text-dark">{formatBytes(totalBytes)}</h3>
                                <small className="text-muted">จำกัดขนาดไฟล์ไม่เกิน {MAX_FILE_SIZE_MB} MB / รายการ</small>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Checklist รายการเอกสารมาตรฐาน */}
            <Card className="shadow-sm border-0 overflow-hidden mb-4">
                <Card.Header className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <div className="avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                                <IconifyIcon icon="solar:checklist-bold-duotone" className="fs-20" />
                            </div>
                            <div>
                                <h5 className="card-title mb-0 fw-bold text-dark fs-16 d-flex align-items-center gap-2">
                                    <span>รายการเอกสารประจำตัวตามมาตรฐาน ({totalStandardCount} รายการ)</span>
                                    <Badge bg="info-subtle" className="text-info border border-info-subtle fs-11">ฐานข้อมูล</Badge>
                                </h5>
                                <small className="text-muted">
                                    ระบบจะเปิดให้อัปโหลดเรียงลำดับตามหมวด (ในแต่ละหมวดที่เปิด สามารถเลือกอัปโหลดข้อใดก่อนหลังได้)
                                </small>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        {/* Admin Management Button */}
                        {is_admin && (
                            <Button
                                variant="warning"
                                size="sm"
                                className="d-inline-flex align-items-center gap-1 text-dark fw-semibold shadow-sm"
                                onClick={() => setShowAdminModal(true)}
                            >
                                <IconifyIcon icon="solar:settings-bold-duotone" className="fs-16" />
                                <span>จัดการเอกสารมาตรฐาน (Admin)</span>
                            </Button>
                        )}

                        {/* Expand / Collapse All */}
                        <div className="btn-group btn-group-sm">
                            <Button
                                variant="outline-light text-dark border"
                                onClick={expandAllCategories}
                                title="ขยายทุกหมวด"
                                className="d-inline-flex align-items-center gap-1"
                            >
                                <IconifyIcon icon="solar:maximize-square-minimalistic-linear" className="fs-14" />
                                <span className="d-none d-md-inline">ขยายทุกหมวด</span>
                            </Button>
                            <Button
                                variant="outline-light text-dark border"
                                onClick={collapseAllCategories}
                                title="ยุบทุกหมวด"
                                className="d-inline-flex align-items-center gap-1"
                            >
                                <IconifyIcon icon="solar:minimize-square-minimalistic-linear" className="fs-14" />
                                <span className="d-none d-md-inline">ยุบทุกหมวด</span>
                            </Button>
                        </div>

                        {/* Filter Thesis Category */}
                        {thesis_categories && thesis_categories.length > 0 && (
                            <div style={{ minWidth: 220 }}>
                                <Form.Select
                                    size="sm"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="border"
                                >
                                    <option value="all">ทุกหมวดหมู่วิทยานิพนธ์ (10 หมวด)</option>
                                    {thesis_categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            หมวด {cat.category_no}: {cat.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>
                        )}

                        {/* Filter Status Buttons */}
                        <div className="btn-group btn-group-sm">
                            <Button
                                variant={filterStatus === 'all' ? 'primary' : 'outline-light text-dark border'}
                                onClick={() => setFilterStatus('all')}
                            >
                                ทั้งหมด ({totalStandardCount})
                            </Button>
                            <Button
                                variant={filterStatus === 'uploaded' ? 'success' : 'outline-light text-dark border'}
                                onClick={() => setFilterStatus('uploaded')}
                            >
                                อัปโหลดแล้ว ({completedCount})
                            </Button>
                            <Button
                                variant={filterStatus === 'pending' ? 'warning' : 'outline-light text-dark border'}
                                onClick={() => setFilterStatus('pending')}
                            >
                                รออัปโหลด ({totalStandardCount - completedCount})
                            </Button>
                        </div>

                        {/* Search Input */}
                        <div style={{ minWidth: 180 }}>
                            <InputGroup size="sm">
                                <InputGroup.Text className="bg-light border-end-0">
                                    <IconifyIcon icon="solar:magnifer-linear" className="text-muted fs-15" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="ค้นหาชื่อเอกสาร..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-start-0"
                                />
                                {searchTerm && (
                                    <Button variant="light" className="border border-start-0" onClick={() => setSearchTerm('')}>
                                        <IconifyIcon icon="solar:close-circle-bold" className="text-muted" />
                                    </Button>
                                )}
                            </InputGroup>
                        </div>
                    </div>
                </Card.Header>

                <CardBody className="p-0">
                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                            <thead className="bg-light-subtle text-muted text-uppercase fs-12">
                                <tr>
                                    <th style={{ width: 80 }} className="text-center">ลำดับ</th>
                                    <th>ชื่อเอกสารมาตรฐาน</th>
                                    <th style={{ minWidth: 200 }}>สถานะการอัปโหลด</th>
                                    <th style={{ width: 110 }} className="text-center">ขนาดไฟล์</th>
                                    <th style={{ width: 220 }} className="text-center">การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedDocuments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-5 text-muted">
                                            <div className="avatar-lg mx-auto mb-2 text-muted opacity-50">
                                                <IconifyIcon icon="solar:folder-open-broken" className="display-4" />
                                            </div>
                                            <p className="mb-0 fs-14">ไม่พบรายการเอกสารที่ตรงกับเงื่อนไขการค้นหา</p>
                                        </td>
                                    </tr>
                                ) : (
                                    groupedDocuments.map((group) => {
                                        const isCollapsed = !!collapsedCategories[group.key];

                                        return (
                                            <React.Fragment key={group.key}>
                                                {/* แถบหัวข้อหมวดวิทยานิพนธ์ (Category Header) */}
                                                <tr
                                                    className="user-select-none"
                                                    style={{
                                                        backgroundColor: group.isCategorySatisfied
                                                            ? '#f0fdf4'
                                                            : group.isCategoryUnlocked
                                                            ? '#eff6ff'
                                                            : '#f8fafc',
                                                        borderTop: '2px solid #cbd5e1',
                                                        borderBottom: '1px solid #e2e8f0',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => toggleCategoryCollapse(group.key)}
                                                >
                                                    <td colSpan={5} className="py-2 px-3">
                                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-link p-0 text-dark border-0 me-1"
                                                                    style={{ lineHeight: 1 }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleCategoryCollapse(group.key);
                                                                    }}
                                                                >
                                                                    <IconifyIcon
                                                                        icon={isCollapsed ? "solar:alt-arrow-right-bold" : "solar:alt-arrow-down-bold"}
                                                                        className="fs-16 text-primary"
                                                                    />
                                                                </button>

                                                                <div
                                                                    className={`rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-12 flex-shrink-0 ${
                                                                        group.isCategorySatisfied
                                                                            ? 'bg-success shadow-sm'
                                                                            : group.isCategoryUnlocked
                                                                            ? 'bg-primary shadow-sm'
                                                                            : 'bg-secondary'
                                                                    }`}
                                                                    style={{ width: 28, height: 28 }}
                                                                >
                                                                    {group.category ? group.category.category_no : '#'}
                                                                </div>

                                                                <div>
                                                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                                                        <span className="fw-bold text-dark fs-14">
                                                                            {group.category
                                                                                ? `หมวดที่ ${group.category.category_no}: ${group.category.name}`
                                                                                : 'เอกสารทั่วไป'}
                                                                        </span>
                                                                        {group.category?.item_reference && (
                                                                            <span className="badge bg-secondary-subtle text-secondary border fs-11 py-0 px-2">
                                                                                {group.category.item_reference}
                                                                            </span>
                                                                        )}
                                                                        {group.conditionType === 'or' && (
                                                                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle fs-11 py-0 px-2">
                                                                                เงื่อนไข: เลือกข้อใดข้อหนึ่ง (หรือ)
                                                                            </span>
                                                                        )}
                                                                        {group.conditionType === 'range' && (
                                                                            <span className="badge bg-info-subtle text-info border border-info-subtle fs-11 py-0 px-2">
                                                                                เงื่อนไข: ครบทุกข้อจำเป็นในหมวด
                                                                            </span>
                                                                        )}
                                                                        {group.conditionType === 'composite' && (
                                                                            <span className="badge bg-info-subtle text-info border border-info-subtle fs-11 py-0 px-2">
                                                                                เงื่อนไข: ลำดับที่ 10 และ (11 หรือ 12)
                                                                            </span>
                                                                        )}
                                                                        {group.category?.suggested_name && (
                                                                            <span className="badge bg-light text-muted border fs-11 py-0 px-2">
                                                                                เสนอแนะ: {group.category.suggested_name}
                                                                            </span>
                                                                        )}
                                                                        {group.isCategorySatisfied && (
                                                                            <span className="badge bg-success-subtle text-success border border-success-subtle fs-11 py-0 px-2">
                                                                                ✓ ผ่านเกณฑ์หมวดนี้แล้ว
                                                                            </span>
                                                                        )}
                                                                        {!group.isCategorySatisfied && group.hasActiveItem && (
                                                                            <span className="badge bg-primary text-white fs-11 py-0 px-2 animate-pulse">
                                                                                พร้อมดำเนินการ
                                                                            </span>
                                                                        )}
                                                                        {!group.isCategoryUnlocked && group.blockingCategory && (
                                                                            <span className="badge bg-secondary-subtle text-secondary border fs-11 py-0 px-2">
                                                                                รอหมวดที่ {group.blockingCategory.category_no}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {group.category?.description && (
                                                                        <div className="text-muted fs-12 mt-1">
                                                                            <IconifyIcon icon="solar:info-circle-linear" className="me-1 text-primary align-middle" />
                                                                            <span>{group.category.description}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="d-flex align-items-center gap-2">
                                                                <span
                                                                    className={`badge ${
                                                                        group.isCategorySatisfied
                                                                            ? 'bg-success text-white'
                                                                            : group.completedCount > 0
                                                                            ? 'bg-primary text-white'
                                                                            : 'bg-light text-muted border'
                                                                    } fs-12 px-2 py-1 fw-semibold`}
                                                                >
                                                                    {group.completedCount} / {group.totalCount} รายการ ({group.totalCount > 0 ? Math.round((group.completedCount / group.totalCount) * 100) : 0}%)
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* รายการเอกสารภายใต้หมวด */}
                                                {!isCollapsed && group.items.map((item) => {
                                                    const doc = docsMap[item.item_no];
                                                    const isUploaded = !!doc;
                                                    const itemStatus = checkIsItemUnlocked(item);
                                                    const canUpload = itemStatus.canUpload;
                                                    const isLocked = !isUploaded && !itemStatus.isUnlocked;
                                                    const isCurrentTarget = canUpload;
                                                    const blockingCategory = itemStatus.blockingCategory;
                                                    const blockingItem = itemStatus.blockingItem;

                                                    return (
                                                        <tr
                                                            key={item.item_no}
                                                            className={
                                                                isCurrentTarget
                                                                    ? 'table-primary-subtle'
                                                                    : isLocked
                                                                    ? 'opacity-75 bg-light-subtle'
                                                                    : ''
                                                            }
                                                            style={{ transition: 'all 0.2s ease' }}
                                                        >
                                                            {/* ลำดับที่ */}
                                                            <td className="text-center">
                                                                <div
                                                                    className={`rounded-circle mx-auto d-flex align-items-center justify-content-center fw-bold fs-13 ${
                                                                        isUploaded
                                                                            ? 'bg-success text-white shadow-sm'
                                                                            : isCurrentTarget
                                                                            ? item.required
                                                                                ? 'bg-primary text-white shadow-sm ring-2 ring-primary'
                                                                                : 'bg-info text-white shadow-sm ring-2 ring-info'
                                                                            : 'bg-light text-muted border'
                                                                    }`}
                                                                    style={{ width: 34, height: 34 }}
                                                                >
                                                                    {isUploaded ? (
                                                                        <IconifyIcon icon="solar:check-read-bold" className="fs-18" />
                                                                    ) : (
                                                                        item.item_no
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* ชื่อเอกสารมาตรฐาน */}
                                                            <td>
                                                                <div className="d-flex align-items-start gap-2">
                                                                    <div>
                                                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                                                            <span className={`fw-bold fs-14 ${isUploaded ? 'text-dark' : isLocked ? 'text-muted' : 'text-primary'}`}>
                                                                                {item.title}
                                                                            </span>
                                                                            {item.required ? (
                                                                                <span className="badge bg-danger-subtle text-danger fs-11 py-0 px-1 border border-danger-subtle">
                                                                                    จำเป็น
                                                                                </span>
                                                                            ) : (
                                                                                <span className="badge bg-light text-muted fs-11 py-0 px-1 border">
                                                                                    ทางเลือก
                                                                                </span>
                                                                            )}
                                                                            {isCurrentTarget && (
                                                                                <span className={`badge ${item.required ? 'bg-primary' : 'bg-info'} text-white fs-11 py-0 px-2 animate-pulse`}>
                                                                                    พร้อมให้อัปโหลด
                                                                                </span>
                                                                            )}
                                                                            {/* Admin Direct Quick Edit button */}
                                                                            {is_admin && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-ghost-primary p-0 px-1 text-primary border-0 rounded"
                                                                                    title={`แก้ไขชื่อ/ลำดับเอกสาร ลำดับที่ ${item.item_no} (Admin)`}
                                                                                    onClick={() => handleOpenEditStandardDoc(item)}
                                                                                    style={{ fontSize: '11px', lineHeight: 1 }}
                                                                                >
                                                                                    <IconifyIcon icon="solar:pen-bold" className="me-1 fs-12" />
                                                                                    แก้ไข
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        {item.description && (
                                                                            <small className="text-muted d-block mt-1">
                                                                                {item.description}
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* สถานะการอัปโหลด */}
                                                            <td>
                                                                {isUploaded ? (
                                                                    <div>
                                                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-12 mb-1 d-inline-flex align-items-center gap-1">
                                                                            <IconifyIcon icon="solar:check-circle-bold" className="fs-14" />
                                                                            อัปโหลดแล้ว
                                                                        </span>
                                                                        <div className="text-muted fs-11 d-flex align-items-center gap-1">
                                                                            <IconifyIcon icon="solar:paperclip-linear" />
                                                                            <span className="text-truncate" style={{ maxWidth: 180 }}>{doc.file_name}</span>
                                                                        </div>
                                                                        <div className="text-muted fs-11">
                                                                            <IconifyIcon icon="solar:calendar-linear" className="me-1" />
                                                                            {formatThaiDateTime(doc.created_at)}
                                                                        </div>
                                                                    </div>
                                                                ) : isLocked ? (
                                                                    <div>
                                                                        {blockingCategory ? (
                                                                            <>
                                                                                <span className="badge bg-secondary-subtle text-secondary border px-2 py-1 fs-12 d-inline-flex align-items-center gap-1">
                                                                                    <IconifyIcon icon="solar:lock-bold" className="fs-13 text-muted" />
                                                                                    รอหมวดที่ {blockingCategory.category_no}
                                                                                </span>
                                                                                <small className="text-muted d-block mt-1 fs-11">
                                                                                    รอผ่านเกณฑ์หมวดที่ {blockingCategory.category_no}: {blockingCategory.name}
                                                                                </small>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span className="badge bg-secondary-subtle text-secondary border px-2 py-1 fs-12 d-inline-flex align-items-center gap-1">
                                                                                    <IconifyIcon icon="solar:lock-bold" className="fs-13 text-muted" />
                                                                                    รอดำเนินการหมวดก่อนหน้า
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <span className={`badge ${item.required ? 'bg-primary-subtle text-primary border-primary-subtle' : 'bg-info-subtle text-info border-info-subtle'} border px-2 py-1 fs-12 d-inline-flex align-items-center gap-1`}>
                                                                            <IconifyIcon icon="solar:hourglass-bold" className="fs-13" />
                                                                            {item.required ? 'พร้อมอัปโหลดไฟล์' : 'พร้อมอัปโหลด (ทางเลือก)'}
                                                                        </span>
                                                                        <small className="text-muted d-block mt-1 fs-11">
                                                                            {itemStatus.ruleType === 'or'
                                                                                ? 'เลือกอัปโหลดข้อใดข้อหนึ่งในหมวดนี้'
                                                                                : item.required
                                                                                ? 'เอกสารจำเป็นตามเกณฑ์'
                                                                                : 'ไม่จำเป็นต้องอัปโหลดเพื่อปลดล็อกลำดับถัดไป'}
                                                                        </small>
                                                                    </div>
                                                                )}
                                                            </td>

                                                            {/* ขนาดไฟล์ */}
                                                            <td className="text-center">
                                                                {isUploaded ? (
                                                                    <Badge bg="light" className="text-dark border px-2 py-1 fs-12">
                                                                        {doc.formatted_file_size || formatBytes(doc.file_size)}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-muted fs-12">-</span>
                                                                )}
                                                            </td>

                                                            {/* ปุ่มการดำเนินการ (Active เรียงตามลำดับ) */}
                                                            <td className="text-center">
                                                                {isUploaded ? (
                                                                    <div className="d-flex align-items-center justify-content-center gap-1">
                                                                        {/* เปิดดูเอกสาร PDF */}
                                                                        <a
                                                                            href={doc.view_url || `/personal-documents/${doc.id}/view`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn btn-sm btn-soft-primary btn-icon"
                                                                            title="เปิดดูเอกสาร PDF"
                                                                        >
                                                                            <IconifyIcon icon="solar:eye-bold" className="fs-16" />
                                                                        </a>

                                                                        {/* ดาวน์โหลด */}
                                                                        <a
                                                                            href={`/personal-documents/${doc.id}/download`}
                                                                            className="btn btn-sm btn-soft-success btn-icon"
                                                                            title="ดาวน์โหลดไฟล์ PDF"
                                                                        >
                                                                            <IconifyIcon icon="solar:download-minimalistic-bold" className="fs-16" />
                                                                        </a>

                                                                        {/* อัปโหลดใหม่ / แทนที่ */}
                                                                        <Button
                                                                            variant="soft-warning"
                                                                            size="sm"
                                                                            className="btn-icon"
                                                                            title="อัปโหลดไฟล์ใหม่แทนที่ไฟล์เดิม"
                                                                            onClick={() => handleOpenUploadModal(item)}
                                                                        >
                                                                            <IconifyIcon icon="solar:restart-bold" className="fs-16" />
                                                                        </Button>

                                                                        {/* ลบเอกสาร */}
                                                                        <Button
                                                                            variant="soft-danger"
                                                                            size="sm"
                                                                            className="btn-icon"
                                                                            title="ลบเอกสาร"
                                                                            onClick={() => handleDelete(doc)}
                                                                        >
                                                                            <IconifyIcon icon="solar:trash-bin-trash-bold" className="fs-16" />
                                                                        </Button>
                                                                    </div>
                                                                ) : canUpload ? (
                                                                    /* ปุ่ม ACTIVE สามารถคลิกอัปโหลดได้ตามลำดับ */
                                                                    <Button
                                                                        variant={item.required ? 'primary' : 'outline-primary'}
                                                                        size="sm"
                                                                        className="d-inline-flex align-items-center gap-1 px-3 shadow-sm"
                                                                        onClick={() => handleOpenUploadModal(item)}
                                                                    >
                                                                        <IconifyIcon icon="solar:upload-track-2-bold-duotone" className="fs-16" />
                                                                        <span>อัปโหลดไฟล์ PDF</span>
                                                                    </Button>
                                                                ) : (
                                                                    /* ปุ่ม DISABLED เนื่องจากหมวดก่อนหน้าหรือลำดับก่อนหน้ายังไม่อัปโหลด */
                                                                    <Button
                                                                        variant="light"
                                                                        size="sm"
                                                                        disabled
                                                                        className="text-muted d-inline-flex align-items-center gap-1 px-3 border"
                                                                        title={
                                                                            blockingCategory
                                                                                ? `กรุณาดำเนินการหมวดที่ ${blockingCategory.category_no}: ${blockingCategory.name} ให้ผ่านเกณฑ์ก่อน`
                                                                                : `กรุณาดำเนินการหมวดก่อนหน้าให้ผ่านเกณฑ์ก่อน`
                                                                        }
                                                                    >
                                                                        <IconifyIcon icon="solar:lock-bold" className="fs-14 text-muted" />
                                                                        <span>รอดำเนินการ</span>
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>
                    </div>
                </CardBody>
            </Card>

            {/* Modal สำหรับอัปโหลดเอกสารมาตรฐานทีละลำดับ */}
            <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-light-subtle py-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <div className="avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                            <span className="fw-bold">{activeUploadItem?.item_no}</span>
                        </div>
                        <div>
                            <Modal.Title as="h5" className="fw-bold text-dark fs-16 mb-0">
                                อัปโหลดเอกสารลำดับที่ {activeUploadItem?.item_no}: {activeUploadItem?.title}
                            </Modal.Title>
                            <small className="text-muted">
                                {activeUploadItem?.description}
                            </small>
                        </div>
                    </div>
                </Modal.Header>

                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Row className="g-3">
                            <Col md={7}>
                                <Form.Group controlId="modalDocumentTitle">
                                    <Form.Label className="fw-semibold text-dark fs-14">
                                        ชื่อเอกสาร <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={5}>
                                <Form.Group controlId="modalUploaderName">
                                    <Form.Label className="fw-semibold text-dark fs-14">
                                        ชื่อเจ้าของเอกสาร / ผู้อัปโหลด <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={data.uploader_name}
                                        onChange={(e) => setData('uploader_name', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group controlId="modalDescription">
                                    <Form.Label className="fw-semibold text-dark fs-14">
                                        รายละเอียดเพิ่มเติม / หมายเหตุ <span className="text-muted fw-normal fs-12">(ถ้ามี)</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="เช่น เลขที่เอกสาร, วันหมดอายุ, หรือหมายเหตุอื่นๆ..."
                                    />
                                </Form.Group>
                            </Col>

                            {/* Dropzone Area for PDF in Modal */}
                            <Col md={12}>
                                <Form.Group controlId="modalDocumentFile">
                                    <Form.Label className="fw-semibold text-dark fs-14">
                                        เลือกไฟล์เอกสาร PDF <span className="text-danger">*</span>
                                    </Form.Label>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="application/pdf,.pdf"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleFileChange(e.target.files[0]);
                                            }
                                        }}
                                    />

                                    {!selectedFile ? (
                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`p-4 text-center rounded-3 border-2 border-dashed cursor-pointer transition-all ${
                                                isDragging
                                                    ? 'border-primary bg-primary-subtle'
                                                    : errors.document_file
                                                    ? 'border-danger bg-danger-subtle'
                                                    : 'border-secondary-subtle bg-light hover-border-primary'
                                            }`}
                                            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                        >
                                            <div className="avatar-lg mx-auto mb-2 text-danger">
                                                <IconifyIcon icon="solar:file-text-bold-duotone" className="display-5" />
                                            </div>
                                            <h6 className="fw-bold mb-1 text-dark fs-15">
                                                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์ PDF มาวางที่นี่
                                            </h6>
                                            <p className="text-muted fs-13 mb-0">
                                                รองรับเฉพาะไฟล์รูปแบบ <span className="fw-semibold text-danger">.PDF</span> ขนาดไม่เกิน <strong>{MAX_FILE_SIZE_MB} MB</strong>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-3 border border-success bg-success-subtle d-flex align-items-center justify-content-between flex-wrap gap-2">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="avatar-md rounded bg-danger text-white d-flex align-items-center justify-content-center p-2" style={{ width: 48, height: 48 }}>
                                                    <IconifyIcon icon="tabler:file-type-pdf" className="fs-26" />
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold text-dark mb-1 fs-14">{selectedFile.name}</h6>
                                                    <div className="text-muted fs-12 d-flex align-items-center flex-wrap gap-2">
                                                        <span>ขนาดไฟล์: <strong className={selectedFile.size >= MAX_FILE_SIZE_BYTES * 0.75 ? 'text-warning' : 'text-success'}>{formatBytes(selectedFile.size)}</strong> จากสูงสุด {MAX_FILE_SIZE_MB} MB</span>
                                                        <span>•</span>
                                                        <span className={`badge ${selectedFile.size >= MAX_FILE_SIZE_BYTES * 0.75 ? 'bg-warning text-dark' : 'bg-success text-white'} py-0 px-2`}>
                                                            {Math.min(100, Math.round((selectedFile.size / MAX_FILE_SIZE_BYTES) * 100))}%
                                                        </span>
                                                        <span className="text-success fw-medium">✓ ขนาดผ่านเกณฑ์</span>
                                                    </div>
                                                    <div style={{ maxWidth: '240px', marginTop: '6px' }}>
                                                        <ProgressBar
                                                            now={Math.min(100, Math.round((selectedFile.size / MAX_FILE_SIZE_BYTES) * 100))}
                                                            variant={selectedFile.size >= MAX_FILE_SIZE_BYTES * 0.75 ? 'warning' : 'success'}
                                                            style={{ height: '4px' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <IconifyIcon icon="solar:restart-bold" className="me-1" />
                                                    เปลี่ยนไฟล์
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleFileChange(null)}
                                                >
                                                    <IconifyIcon icon="solar:trash-bin-trash-bold" className="me-1" />
                                                    ยกเลิก
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {errors.document_file && (
                                        <div className="text-danger fs-12 mt-1 fw-medium">
                                            {errors.document_file}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>

                    <Modal.Footer className="bg-light-subtle py-2 border-top">
                        <Button variant="light" onClick={() => setShowUploadModal(false)} disabled={processing}>
                            ปิดหน้าต่าง
                        </Button>
                        <Button variant="primary" type="submit" disabled={processing || !selectedFile} className="px-4 fw-semibold">
                            {processing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    กำลังอัปโหลด...
                                </>
                            ) : (
                                <>
                                    <IconifyIcon icon="solar:upload-track-2-bold-duotone" className="me-2 fs-16 align-middle" />
                                    บันทึกและอัปโหลด
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Admin Modal: จัดการรายการเอกสารมาตรฐานทั้งหมด */}
            {is_admin && (
                <Modal show={showAdminModal} onHide={() => setShowAdminModal(false)} size="xl" centered>
                    <Modal.Header closeButton className="bg-light-subtle py-3 border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <div className="avatar-sm rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                                <IconifyIcon icon="solar:settings-bold" className="fs-18" />
                            </div>
                            <div>
                                <Modal.Title as="h5" className="fw-bold text-dark fs-16 mb-0">
                                    จัดการรายการเอกสารมาตรฐาน (Admin Management)
                                </Modal.Title>
                                <small className="text-muted">
                                    แก้ไขชื่อ ลำดับที่ ความจำเป็น หรือเพิ่ม/ลบรายการเอกสารมาตรฐานในฐานข้อมูล
                                </small>
                            </div>
                        </div>
                    </Modal.Header>

                    <Modal.Body className="p-0">
                        <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <span className="fw-semibold text-dark fs-14">
                                    รายการเอกสารทั้งหมด: <span className="text-primary">{totalStandardCount}</span> รายการ
                                </span>
                            </div>
                            <Button
                                variant="primary"
                                size="sm"
                                className="d-inline-flex align-items-center gap-1 shadow-sm"
                                onClick={handleOpenCreateStandardDoc}
                            >
                                <IconifyIcon icon="solar:add-circle-bold" className="fs-16" />
                                <span>เพิ่มรายการเอกสารมาตรฐานใหม่</span>
                            </Button>
                        </div>

                        <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <Table hover className="align-middle mb-0">
                                <thead className="bg-light text-muted text-uppercase fs-12 sticky-top">
                                    <tr>
                                        <th style={{ width: 100 }} className="text-center">ลำดับที่</th>
                                        <th style={{ minWidth: 200 }}>ชื่อเอกสาร</th>
                                        <th>คำอธิบาย</th>
                                        <th style={{ width: 100 }} className="text-center">ความจำเป็น</th>
                                        <th style={{ width: 160 }} className="text-center">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedStandardDocs.map((item, idx) => (
                                        <tr key={item.id || item.item_no}>
                                            {/* ลำดับที่ & ปุ่มขยับขึ้นลง */}
                                            <td className="text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-1">
                                                    <span className="badge bg-primary fs-12 px-2 py-1">
                                                        {item.item_no}
                                                    </span>
                                                    <div className="d-flex flex-column ms-1">
                                                        <button
                                                            type="button"
                                                            disabled={idx === 0}
                                                            onClick={() => handleMoveItem(idx, 'up')}
                                                            className="btn btn-xs btn-link p-0 text-muted hover-text-primary"
                                                            title="เลื่อนขึ้น"
                                                            style={{ lineHeight: 1, border: 'none', background: 'none' }}
                                                        >
                                                            <IconifyIcon icon="solar:alt-arrow-up-bold" className="fs-12" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={idx === sortedStandardDocs.length - 1}
                                                            onClick={() => handleMoveItem(idx, 'down')}
                                                            className="btn btn-xs btn-link p-0 text-muted hover-text-primary"
                                                            title="เลื่อนลง"
                                                            style={{ lineHeight: 1, border: 'none', background: 'none' }}
                                                        >
                                                            <IconifyIcon icon="solar:alt-arrow-down-bold" className="fs-12" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* ชื่อเอกสาร */}
                                            <td>
                                                <div className="fw-semibold text-dark fs-14">
                                                    {item.title}
                                                </div>
                                                {item.thesis_category && (
                                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle fs-11 mt-1 d-inline-flex align-items-center gap-1">
                                                        <IconifyIcon icon="solar:folder-with-files-bold" className="fs-12" />
                                                        หมวด {item.thesis_category.category_no}: {item.thesis_category.name}
                                                    </span>
                                                )}
                                            </td>

                                            {/* คำอธิบาย */}
                                            <td>
                                                <small className="text-muted">
                                                    {item.description || '-'}
                                                </small>
                                            </td>

                                            {/* ความจำเป็น */}
                                            <td className="text-center">
                                                {item.required ? (
                                                    <Badge bg="danger-subtle" className="text-danger border border-danger-subtle">
                                                        จำเป็น
                                                    </Badge>
                                                ) : (
                                                    <Badge bg="light" className="text-muted border">
                                                        ทางเลือก
                                                    </Badge>
                                                )}
                                            </td>

                                            {/* การจัดการ */}
                                            <td className="text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-1">
                                                    <Button
                                                        variant="soft-primary"
                                                        size="sm"
                                                        className="btn-icon"
                                                        title="แก้ไขรายละเอียดเอกสาร"
                                                        onClick={() => handleOpenEditStandardDoc(item)}
                                                    >
                                                        <IconifyIcon icon="solar:pen-bold" className="fs-15" />
                                                    </Button>
                                                    <Button
                                                        variant="soft-danger"
                                                        size="sm"
                                                        className="btn-icon"
                                                        title="ลบรายการเอกสาร"
                                                        onClick={() => handleDeleteStandardDoc(item)}
                                                    >
                                                        <IconifyIcon icon="solar:trash-bin-trash-bold" className="fs-15" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Modal.Body>

                    <Modal.Footer className="bg-light-subtle py-2 border-top">
                        <Button variant="secondary" onClick={() => setShowAdminModal(false)}>
                            ปิดหน้าต่าง
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Admin Modal: เพิ่ม / แก้ไข รายการเอกสารมาตรฐาน */}
            {is_admin && (
                <Modal show={showEditStandardDocModal} onHide={() => setShowEditStandardDocModal(false)} centered size="lg">
                    <Modal.Header closeButton className="bg-light-subtle py-3 border-bottom">
                        <Modal.Title as="h5" className="fw-bold text-dark fs-16 mb-0">
                            {editingStandardDoc ? `แก้ไขเอกสารมาตรฐาน (ลำดับที่ ${editingStandardDoc.item_no})` : 'เพิ่มรายการเอกสารมาตรฐานใหม่'}
                        </Modal.Title>
                    </Modal.Header>

                    <Form onSubmit={handleSaveStandardDoc}>
                        <Modal.Body className="p-4">
                            <Row className="g-3">
                                <Col md={4}>
                                    <Form.Group controlId="stdFormItemNo">
                                        <Form.Label className="fw-semibold text-dark fs-14">
                                            ลำดับที่ <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            min={1}
                                            value={stdFormData.item_no}
                                            onChange={(e) => setStdFormData({ ...stdFormData, item_no: parseInt(e.target.value) || 1 })}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={8}>
                                    <Form.Group controlId="stdFormTitle">
                                        <Form.Label className="fw-semibold text-dark fs-14">
                                            ชื่อเอกสาร <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="ระบุชื่อเอกสารมาตรฐาน..."
                                            value={stdFormData.title}
                                            onChange={(e) => setStdFormData({ ...stdFormData, title: e.target.value })}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={12}>
                                    <Form.Group controlId="stdFormThesisCategory">
                                        <Form.Label className="fw-semibold text-dark fs-14">
                                            หมวดหมู่วิทยานิพนธ์
                                        </Form.Label>
                                        <Form.Select
                                            value={stdFormData.thesis_category_id ?? ''}
                                            onChange={(e) => setStdFormData({
                                                ...stdFormData,
                                                thesis_category_id: e.target.value ? parseInt(e.target.value) : null
                                            })}
                                        >
                                            <option value="">-- ไม่ระบุหมวดหมู่วิทยานิพนธ์ --</option>
                                            {thesis_categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    หมวด {cat.category_no}: {cat.name} {cat.item_reference ? `(${cat.item_reference})` : ''}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {stdFormData.thesis_category_id && (
                                            (() => {
                                                const curCat = thesis_categories.find((c) => c.id === stdFormData.thesis_category_id);
                                                return curCat ? (
                                                    <div className="bg-light border rounded p-2 mt-2 fs-12 text-muted">
                                                        <div><strong className="text-dark">ชื่อเสนอแนะ:</strong> {curCat.suggested_name || '-'}</div>
                                                        <div><strong className="text-dark">คำอธิบาย/แนวทางการใช้:</strong> {curCat.description || '-'}</div>
                                                        <div><strong className="text-dark">ข้ออ้างอิง:</strong> {curCat.item_reference || '-'}</div>
                                                    </div>
                                                ) : null;
                                            })()
                                        )}
                                    </Form.Group>
                                </Col>

                                <Col md={12}>
                                    <Form.Group controlId="stdFormDescription">
                                        <Form.Label className="fw-semibold text-dark fs-14">
                                            คำอธิบาย / รายละเอียดเพิ่มเติม
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="คำแนะนำในการเตรียมเอกสารหรือเงื่อนไข..."
                                            value={stdFormData.description}
                                            onChange={(e) => setStdFormData({ ...stdFormData, description: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={12}>
                                    <Form.Check
                                        type="switch"
                                        id="stdFormRequired"
                                        label={
                                            <span className="fw-semibold text-dark fs-14">
                                                กำหนดเป็นเอกสารจำเป็น (Required)
                                            </span>
                                        }
                                        checked={stdFormData.required}
                                        onChange={(e) => setStdFormData({ ...stdFormData, required: e.target.checked })}
                                    />
                                    <small className="text-muted d-block mt-1">
                                        หากเลือกเป็นจำเป็น จะแสดงป้ายสีแดงแจ้งเตือนว่าเป็นเอกสารที่ต้องมี
                                    </small>
                                </Col>
                            </Row>
                        </Modal.Body>

                        <Modal.Footer className="bg-light-subtle py-2 border-top">
                            <Button variant="light" onClick={() => setShowEditStandardDocModal(false)} disabled={isSavingStandardDoc}>
                                ยกเลิก
                            </Button>
                            <Button variant="primary" type="submit" disabled={isSavingStandardDoc} className="px-4 fw-semibold">
                                {isSavingStandardDoc ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <IconifyIcon icon="solar:check-circle-bold" className="me-2 fs-16 align-middle" />
                                        บันทึกข้อมูล
                                    </>
                                )}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            )}
        </MainLayout>
    );
};

export default PersonalDocumentsPage;
