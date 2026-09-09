import React, { useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Card, CardBody, Col, Row, Button, Form, Badge, Table, InputGroup, ProgressBar } from 'react-bootstrap';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Swal from 'sweetalert2';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface DocumentItem {
    id: number;
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
    auth_user?: {
        id: number;
        name: string;
        email: string;
        role?: string;
    } | null;
}

const DocumentsPage = ({ documents = [], auth_user }: PageProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        title: string;
        uploader_name: string;
        description: string;
        document_file: File | null;
    }>({
        title: '',
        uploader_name: auth_user?.name || '',
        description: '',
        document_file: null,
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

    // Format file size in bytes to human readable
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

    // Handle file selection
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

        // Auto-fill title if empty
        if (!data.title.trim()) {
            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            setData('title', fileNameWithoutExt);
        }
    };

    // Handle form submit
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

        post('/documents', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'อัปโหลดสำเร็จ!',
                    text: 'เอกสารของคุณถูกบันทึกและแสดงในรายการเรียบร้อยแล้ว',
                    timer: 2000,
                    showConfirmButton: false,
                });
                reset('title', 'description', 'document_file');
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: (err) => {
                const firstError = Object.values(err)[0];
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: firstError || 'ไม่สามารถอัปโหลดเอกสารได้ กรุณาลองใหม่อีกครั้ง',
                    confirmButtonColor: '#465dff',
                });
            },
        });
    };

    // Handle document delete
    const handleDelete = (doc: DocumentItem) => {
        Swal.fire({
            title: 'ยืนยันการลบเอกสาร?',
            html: `คุณต้องการลบเอกสาร <strong>"${doc.title}"</strong> หรือไม่?<br/><small class="text-muted">ไฟล์และข้อมูลจะถูกลบออกจากระบบอย่างถาวร</small>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6d43',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'ใช่, ลบเอกสาร',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/documents/${doc.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'ลบสำเร็จ',
                            text: 'ลบเอกสารออกจากระบบเรียบร้อยแล้ว',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: 'ไม่สามารถลบเอกสารได้',
                            confirmButtonColor: '#465dff',
                        });
                    },
                });
            }
        });
    };

    // Drag & drop handlers
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

    // Filtered documents by search term
    const filteredDocuments = documents.filter((doc) => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        return (
            doc.title.toLowerCase().includes(query) ||
            doc.uploader_name.toLowerCase().includes(query) ||
            doc.file_name.toLowerCase().includes(query) ||
            (doc.description && doc.description.toLowerCase().includes(query))
        );
    });

    // Summary statistics
    const totalFiles = documents.length;
    const totalBytes = documents.reduce((sum, d) => sum + (Number(d.file_size) || 0), 0);
    const latestDoc = documents.length > 0 ? documents[0] : null;

    return (
        <MainLayout>
            <PageTitle title="เอกสาร" subTitle="ระบบจัดการเอกสาร" />

            {/* Quick Stats Overview */}
            <Row className="g-3 mt-1 mb-4">
                <Col xl={4} md={6}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 48, height: 48 }}>
                                <IconifyIcon icon="solar:documents-bold-duotone" className="fs-24" />
                            </div>
                            <div>
                                <h6 className="text-muted fw-semibold mb-1 fs-13">จำนวนเอกสารทั้งหมด</h6>
                                <h3 className="mb-0 fw-bold text-dark">{totalFiles} <span className="fs-14 fw-normal text-muted">ฉบับ</span></h3>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col xl={4} md={6}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 48, height: 48 }}>
                                <IconifyIcon icon="solar:database-bold-duotone" className="fs-24" />
                            </div>
                            <div>
                                <h6 className="text-muted fw-semibold mb-1 fs-13">พื้นที่จัดเก็บเอกสาร</h6>
                                <h3 className="mb-0 fw-bold text-dark">{formatBytes(totalBytes)}</h3>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col xl={4} md={12}>
                    <Card className="shadow-sm border-0 h-100 overflow-hidden">
                        <CardBody className="p-3 d-flex align-items-center">
                            <div className="avatar-md rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 48, height: 48 }}>
                                <IconifyIcon icon="solar:clock-circle-bold-duotone" className="fs-24" />
                            </div>
                            <div className="overflow-hidden">
                                <h6 className="text-muted fw-semibold mb-1 fs-13">อัปโหลดล่าสุด</h6>
                                <h4 className="mb-0 fw-bold text-dark text-truncate fs-16">
                                    {latestDoc ? formatThaiDateTime(latestDoc.created_at) : 'ยังไม่มีเอกสาร'}
                                </h4>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* ส่วนที่ 1: แบบฟอร์มสำหรับอัปโหลดเอกสาร */}
            <Card className="shadow-sm border-0 mb-4 overflow-hidden">
                <Card.Header className="bg-light-subtle py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <div className="avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                            <IconifyIcon icon="solar:cloud-upload-bold-duotone" className="fs-20" />
                        </div>
                        <div>
                            <h5 className="card-title mb-0 fw-bold text-dark fs-16">อัปโหลดเอกสารใหม่ (PDF)</h5>
                            <small className="text-muted">กรอกข้อมูลและเลือกไฟล์เอกสาร PDF เพื่อจัดเก็บเข้าระบบ</small>
                        </div>
                    </div>
                    <Badge bg="primary-subtle" className="text-primary px-3 py-2 rounded-pill fs-12 fw-medium border border-primary-subtle">
                        <IconifyIcon icon="tabler:file-type-pdf" className="me-1 fs-14 align-middle" />
                        รองรับเฉพาะไฟล์ .PDF (สูงสุด {MAX_FILE_SIZE_MB} MB)
                    </Badge>
                </Card.Header>

                <CardBody className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            {/* ชื่อเอกสาร */}
                            <Col md={6}>
                                <Form.Group controlId="documentTitle">
                                    <Form.Label className="fw-semibold text-dark fs-14">
                                        ชื่อเอกสาร <span className="text-danger">*</span>
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <IconifyIcon icon="solar:document-text-bold-duotone" className="text-primary fs-18" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="เช่น ประกาศแต่งตั้งคณะทำงานฯ, ระเบียบปฏิบัติงาน..."
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            isInvalid={!!errors.title}
                                            className="border-start-0"
                                            required
                                        />
                                        {errors.title && (
                                            <Form.Control.Feedback type="invalid">
                                                {errors.title}
                                            </Form.Control.Feedback>
                                        )}
                                    </InputGroup>
                                    <Form.Text className="text-muted fs-12">
                                        ชื่อหัวข้อที่จะแสดงในรายการเอกสาร
                                    </Form.Text>
                                </Form.Group>
                            </Col>

                            {/* ชื่อผู้อัปโหลด */}
                            <Col md={6}>
                                <Form.Group controlId="uploaderName">
                                    <Form.Label className="fw-semibold text-dark fs-14">
                                        ชื่อผู้อัปโหลด <span className="text-danger">*</span>
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-end-0">
                                            <IconifyIcon icon="solar:user-bold-duotone" className="text-success fs-18" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="ระบุชื่อ-นามสกุล หรือแผนก/ฝ่าย"
                                            value={data.uploader_name}
                                            onChange={(e) => setData('uploader_name', e.target.value)}
                                            isInvalid={!!errors.uploader_name}
                                            className="border-start-0"
                                            required
                                        />
                                        {errors.uploader_name && (
                                            <Form.Control.Feedback type="invalid">
                                                {errors.uploader_name}
                                            </Form.Control.Feedback>
                                        )}
                                    </InputGroup>
                                    <Form.Text className="text-muted fs-12">
                                        บันทึกชื่อผู้รับผิดชอบที่นำเอกสารเข้าระบบ
                                    </Form.Text>
                                </Form.Group>
                            </Col>

                            {/* คำอธิบายเพิ่มเติม */}
                            <Col md={12}>
                                <Form.Group controlId="documentDescription">
                                    <Form.Label className="fw-semibold text-dark fs-14">
                                        รายละเอียดเพิ่มเติม / หมายเหตุ <span className="text-muted fw-normal fs-12">(ถ้ามี)</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="ระบุรายละเอียดโดยย่อเกี่ยวกับเอกสารฉบับนี้..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        isInvalid={!!errors.description}
                                    />
                                    {errors.description && (
                                        <Form.Control.Feedback type="invalid">
                                            {errors.description}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* พื้นที่เลือกไฟล์ PDF (Dropzone Style) */}
                            <Col md={12}>
                                <Form.Group controlId="documentFile">
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

                            {/* ปุ่มดำเนินการ */}
                            <Col md={12} className="d-flex justify-content-end gap-2 pt-2 border-top">
                                <Button
                                    variant="light"
                                    type="button"
                                    disabled={processing}
                                    onClick={() => {
                                        reset('title', 'description', 'document_file');
                                        setSelectedFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                >
                                    <IconifyIcon icon="solar:eraser-bold" className="me-1" />
                                    ล้างแบบฟอร์ม
                                </Button>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={processing || !selectedFile}
                                    className="px-4 fw-semibold"
                                >
                                    {processing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            กำลังอัปโหลด...
                                        </>
                                    ) : (
                                        <>
                                            <IconifyIcon icon="solar:upload-track-2-bold-duotone" className="me-2 fs-16 align-middle" />
                                            บันทึกและอัปโหลดเอกสาร
                                        </>
                                    )}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>

            {/* ส่วนที่ 2: แสดงรายการเอกสารที่อัปโหลดแล้ว (ด้านล่างแบบฟอร์ม) */}
            <Card className="shadow-sm border-0 overflow-hidden">
                <Card.Header className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <div className="avatar-sm rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                            <IconifyIcon icon="solar:documents-minimalistic-bold-duotone" className="fs-20" />
                        </div>
                        <div>
                            <h5 className="card-title mb-0 fw-bold text-dark fs-16">
                                รายการเอกสารที่อัปโหลดแล้ว
                            </h5>
                            <small className="text-muted">
                                แสดงเอกสารทั้งหมดที่ถูกบันทึกเข้าระบบ
                            </small>
                        </div>
                        <Badge bg="light" className="text-dark border ms-2 fs-12 px-2 py-1">
                            {filteredDocuments.length} / {documents.length} ฉบับ
                        </Badge>
                    </div>

                    {/* ช่องค้นหาเอกสารแบบเรียลไทม์ */}
                    <div style={{ minWidth: 260 }}>
                        <InputGroup size="sm">
                            <InputGroup.Text className="bg-light border-end-0">
                                <IconifyIcon icon="solar:magnifer-linear" className="text-muted fs-16" />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="ค้นหาตามชื่อเอกสาร / ผู้อัปโหลด..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-start-0"
                            />
                            {searchTerm && (
                                <Button
                                    variant="light"
                                    className="border border-start-0"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <IconifyIcon icon="solar:close-circle-bold" className="text-muted" />
                                </Button>
                            )}
                        </InputGroup>
                    </div>
                </Card.Header>

                <CardBody className="p-0">
                    {filteredDocuments.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="avatar-xl mx-auto mb-3 text-muted">
                                <IconifyIcon icon="solar:document-medicine-bold-duotone" className="display-4 text-secondary-subtle" />
                            </div>
                            <h6 className="fw-bold text-dark fs-16 mb-1">
                                {searchTerm ? 'ไม่พบเอกสารที่ตรงกับคำค้นหา' : 'ยังไม่มีเอกสารในระบบ'}
                            </h6>
                            <p className="text-muted fs-13 mb-3">
                                {searchTerm
                                    ? `ไม่พบเอกสารสำหรับคำค้นหา "${searchTerm}" กรุณาลองใช้คำค้นอื่น`
                                    : 'คุณสามารถเริ่มอัปโหลดเอกสารฉบับแรกได้โดยใช้แบบฟอร์มด้านบน'}
                            </p>
                            {searchTerm && (
                                <Button variant="outline-primary" size="sm" onClick={() => setSearchTerm('')}>
                                    ล้างการค้นหา
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle mb-0">
                                <thead className="bg-light-subtle text-muted text-uppercase fs-12">
                                    <tr>
                                        <th style={{ width: 60 }} className="text-center">#</th>
                                        <th>ชื่อเอกสาร / ไฟล์</th>
                                        <th style={{ minWidth: 160 }}>ชื่อผู้อัปโหลด</th>
                                        <th style={{ minWidth: 170 }}>วันและเวลาที่อัปโหลด</th>
                                        <th style={{ width: 110 }} className="text-center">ขนาดไฟล์</th>
                                        <th style={{ width: 170 }} className="text-center">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDocuments.map((doc, idx) => (
                                        <tr key={doc.id}>
                                            <td className="text-center text-muted fw-semibold">
                                                {idx + 1}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-start gap-3">
                                                    <div className="avatar-sm rounded bg-danger-subtle text-danger d-flex align-items-center justify-content-center flex-shrink-0 mt-1" style={{ width: 38, height: 38 }}>
                                                        <IconifyIcon icon="tabler:file-type-pdf" className="fs-22" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <a
                                                            href={doc.view_url || `/documents/${doc.id}/view`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="fw-bold text-dark text-decoration-none hover-primary d-block fs-14"
                                                            title="คลิกเพื่อเปิดดูเอกสาร PDF"
                                                        >
                                                            {doc.title}
                                                        </a>
                                                        {doc.description && (
                                                            <p className="text-muted fs-12 mb-1 text-truncate" style={{ maxWidth: 420 }}>
                                                                {doc.description}
                                                            </p>
                                                        )}
                                                        <span className="text-muted fs-11 d-flex align-items-center gap-1">
                                                            <IconifyIcon icon="solar:paperclip-linear" />
                                                            {doc.file_name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="avatar-xs rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold fs-12" style={{ width: 28, height: 28 }}>
                                                        {doc.uploader_name ? doc.uploader_name.charAt(0) : 'U'}
                                                    </div>
                                                    <span className="fw-medium text-dark fs-13">
                                                        {doc.uploader_name || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center text-dark fs-13">
                                                    <IconifyIcon icon="solar:calendar-linear" className="me-1 text-muted fs-14" />
                                                    {formatThaiDateTime(doc.created_at)}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <Badge bg="light" className="text-dark border px-2 py-1 fs-12">
                                                    {doc.formatted_file_size || formatBytes(doc.file_size)}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-1">
                                                    {/* ดูเอกสารในแท็บใหม่ */}
                                                    <a
                                                        href={doc.view_url || `/documents/${doc.id}/view`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-soft-primary btn-icon"
                                                        title="เปิดดูเอกสาร PDF บนเบราว์เซอร์"
                                                    >
                                                        <IconifyIcon icon="solar:eye-bold" className="fs-16" />
                                                    </a>

                                                    {/* ดาวน์โหลดเอกสาร */}
                                                    <a
                                                        href={`/documents/${doc.id}/download`}
                                                        className="btn btn-sm btn-soft-success btn-icon"
                                                        title="ดาวน์โหลดไฟล์ PDF"
                                                    >
                                                        <IconifyIcon icon="solar:download-minimalistic-bold" className="fs-16" />
                                                    </a>

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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </CardBody>
            </Card>
        </MainLayout>
    );
};

export default DocumentsPage;
