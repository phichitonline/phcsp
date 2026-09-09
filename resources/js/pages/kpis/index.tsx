import React from 'react';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Button, Modal, Form } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import { router, Link, useForm, usePage } from '@inertiajs/react';
import { ApexOptions } from 'apexcharts';
import Swal from 'sweetalert2';
import { Grid, _ } from 'gridjs-react';
import { html } from 'gridjs';
import { useEffect, useState } from 'react';
import ReactSelect from 'react-select';

interface Kpi {
    id: number;
    kpi_code: string;
    kpi_name_th: string;
    reporting_period: string;
    unit: string;
    target_value: number | null;
    target_direction: string;
    actual_mock: number;
    is_passed_mock: boolean;
    responsible_person: string;
    // New Fields
    m1?: number; m2?: number; m3?: number; m4?: number;
    m5?: number; m6?: number; m7?: number; m8?: number;
    m9?: number; m10?: number; m11?: number; m12?: number;
    m1_status?: string; m2_status?: string; m3_status?: string; m4_status?: string;
    m5_status?: string; m6_status?: string; m7_status?: string; m8_status?: string;
    m9_status?: string; m10_status?: string; m11_status?: string; m12_status?: string;
    q1?: number; q2?: number; q3?: number; q4?: number;
    q1_status?: string; q2_status?: string; q3_status?: string; q4_status?: string;
    annual_result?: number;
    annual_status?: string;
    status: string;
    is_published: boolean;
    kpi_status?: 'pass' | 'fail' | null;
    note?: string;
    formula_a?: string;
    formula_b?: string;
    formula_c?: string;
    template_file?: string;
}

interface CategoryStats {
    total: number;
    passed: number;
    failed: number;
}

interface Department {
    id: number;
    dp_name: string;
}

interface KpisPageProps {
    kpis: Kpi[];
    stats: {
        total: CategoryStats;
        ap: CategoryStats;
        qmp: CategoryStats;
        qp: CategoryStats;
    };
    currentYear: number;
    departments: Department[];
    selectedDepartment: string;
}

const KpisPage = ({ 
    kpis = [], 
    stats = { 
        total: { total: 0, passed: 0, failed: 0 },
        ap: { total: 0, passed: 0, failed: 0 },
        qmp: { total: 0, passed: 0, failed: 0 },
        qp: { total: 0, passed: 0, failed: 0 }
    }, 
    currentYear = (() => {
        const now = new Date();
        // ปีงบประมาณไทย: ต.ค.(10) - ก.ย.(9)
        // เดือน >= 10 (ต.ค.) → ปีงบ = ปี CE + 544, มิฉะนั้น = ปี CE + 543
        return now.getMonth() + 1 >= 10
            ? now.getFullYear() + 544
            : now.getFullYear() + 543;
    })(),
    departments = [],
    selectedDepartment = ''
}: KpisPageProps) => {
    const [showInputModal, setShowInputModal] = useState(false);
    const [selectedKpi, setSelectedKpi] = useState<Kpi | null>(null);
    const { auth } = usePage().props as any;
    const currentUser = auth.user;
    const isAdminOrHead = currentUser?.role === 'admin' || currentUser?.role === 'head';
    const canCertify = isAdminOrHead;

    const { data, setData, put, processing, reset } = useForm({
        m1: null as number | null, m2: null as number | null, m3: null as number | null, m4: null as number | null, m5: null as number | null, m6: null as number | null,
        m7: null as number | null, m8: null as number | null, m9: null as number | null, m10: null as number | null, m11: null as number | null, m12: null as number | null,
        m1_status: '', m2_status: '', m3_status: '', m4_status: '', m5_status: '', m6_status: '',
        m7_status: '', m8_status: '', m9_status: '', m10_status: '', m11_status: '', m12_status: '',
        q1: null as number | null, q2: null as number | null, q3: null as number | null, q4: null as number | null,
        q1_status: '', q2_status: '', q3_status: '', q4_status: '',
        annual_result: null as number | null,
        annual_status: '',
        note: ''
    });

    const [deptFilter, setDeptFilter] = useState(selectedDepartment);

    const changeYear = (year: number) => {
        router.get('/kpis', { year, department: deptFilter });
    };

    const changeDepartment = (deptId: string) => {
        setDeptFilter(deptId);
        router.get('/kpis', { year: currentYear, department: deptId });
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "ข้อมูลตัวชี้วัดจะถูกลบออกจากระบบและไม่สามารถกู้คืนได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/kpis/${id}`, {
                    onSuccess: () => {
                        Swal.fire(
                            'ลบเรียบร้อย!',
                            'ตัวชี้วัดถูกลบออกจากระบบแล้ว',
                            'success'
                        );
                    },
                    onError: () => {
                        Swal.fire(
                            'เกิดข้อผิดพลาด!',
                            'ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
                            'error'
                        );
                    }
                });
            }
        });
    };

    // Expose handlers to window for GridJs html buttons
    useEffect(() => {
        (window as any).__inertiaRouter = router;
        (window as any).deleteKpi = (id: number) => handleDelete(id);
        (window as any).openKpiInput = (id: number) => {
            const kpi = kpis.find(k => k.id === id);
            if (kpi) {
                setSelectedKpi(kpi);
                setData({
                    m1: kpi.m1, m2: kpi.m2, m3: kpi.m3,
                    m4: kpi.m4, m5: kpi.m5, m6: kpi.m6,
                    m7: kpi.m7, m8: kpi.m8, m9: kpi.m9,
                    m10: kpi.m10, m11: kpi.m11, m12: kpi.m12,
                    m1_status: kpi.m1_status || '', m2_status: kpi.m2_status || '', m3_status: kpi.m3_status || '',
                    m4_status: kpi.m4_status || '', m5_status: kpi.m5_status || '', m6_status: kpi.m6_status || '',
                    m7_status: kpi.m7_status || '', m8_status: kpi.m8_status || '', m9_status: kpi.m9_status || '',
                    m10_status: kpi.m10_status || '', m11_status: kpi.m11_status || '', m12_status: kpi.m12_status || '',
                    q1: kpi.q1, q2: kpi.q2, q3: kpi.q3, q4: kpi.q4,
                    q1_status: kpi.q1_status || '', q2_status: kpi.q2_status || '', q3_status: kpi.q3_status || '', q4_status: kpi.q4_status || '',
                    annual_result: kpi.annual_result,
                    annual_status: kpi.annual_status || '',
                    note: kpi.note || ''
                });
                setShowInputModal(true);
            }
        };
        return () => {
            delete (window as any).__inertiaRouter;
            delete (window as any).deleteKpi;
            delete (window as any).openKpiInput;
        };
    }, [kpis, currentUser]);

    const canEditSelectedKpi = () => {
        if (!selectedKpi || !currentUser) return false;
        if (isAdminOrHead) return true;
        if (!selectedKpi.responsible_person) return true; // ทุกคนกรอกได้ถ้ายังไม่มีเจ้าของ
        return String(selectedKpi.responsible_person) === String(currentUser.id);
    };

    const handleSaveMonthlyData = () => {
        if (!selectedKpi) return;
        
        put(`/kpis/${selectedKpi.id}/monthly`, {
            onSuccess: () => {
                Swal.fire({
                    title: 'สำเร็จ!',
                    text: 'บันทึกข้อมูลเรียบร้อยแล้ว',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true
                });
                setShowInputModal(false);
            },
            onError: () => {
                Swal.fire('ผิดพลาด!', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
            }
        });
    };

    const months = [
        'ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 
        'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'
    ];

    const quarters = ['งวดที่ 1 (ต.ค.-ธ.ค.)', 'งวดที่ 2 (ม.ค.-มี.ค.)', 'งวดที่ 3 (เม.ย.-มิ.ย.)', 'งวดที่ 4 (ก.ค.-ก.ย.)'];

    const getPassedPercentage = (s: CategoryStats) => {
        return s.total > 0 ? Math.round((s.passed / s.total) * 100) : 0;
    };

    const getDynamicColor = (val: number) => {
        return val >= 80 ? '#28a745' : val >= 50 ? '#ffc107' : '#dc3545';
    };

    const cockpitCategories = [
        { label: 'ภาพรวม', stats: stats.total },
        { label: 'AP', stats: stats.ap },
        { label: 'QMP', stats: stats.qmp },
        { label: 'QP', stats: stats.qp }
    ].map(cat => ({
        ...cat,
        color: getDynamicColor(getPassedPercentage(cat.stats))
    }));

    const getChartOptions = (color: string): ApexOptions => ({
        chart: {
            type: 'radialBar',
            offsetY: -20,
            sparkline: { enabled: true }
        },
        plotOptions: {
            radialBar: {
                startAngle: -110,
                endAngle: 110,
                track: {
                    background: "#e7e7e7",
                    strokeWidth: '97%',
                    margin: 2
                },
                dataLabels: {
                    name: { show: false },
                    value: {
                        offsetY: -2,
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }
                }
            }
        },
        grid: { padding: { top: -10 } },
        fill: { colors: [color] },
        labels: ['ผ่าน'],
    });

    const isMonthly = selectedKpi?.reporting_period?.includes('เดือน');
    const isQuarterly = selectedKpi?.reporting_period?.includes('งวด') || selectedKpi?.reporting_period?.includes('ไตรมาส');
    const isYearly = selectedKpi?.reporting_period?.includes('ปี') || (!isMonthly && !isQuarterly);

    const yearSelector = (
        <div className="d-flex align-items-center gap-2 bg-white px-2 py-1 rounded-pill border shadow-sm" style={{ scale: '0.9' }}>
            <Button variant="link" size="sm" className="p-0 text-primary" onClick={() => changeYear(currentYear - 1)}>
                <IconifyIcon icon="tabler:chevron-left" className="fs-20" />
            </Button>
            <span className="mb-0 text-primary fw-bold px-1" style={{ minWidth: '60px', textAlign: 'center' }}>ปีงบ {currentYear}</span>
            <Button variant="link" size="sm" className="p-0 text-primary" onClick={() => changeYear(currentYear + 1)}>
                <IconifyIcon icon="tabler:chevron-right" className="fs-20" />
            </Button>
        </div>
    );

    return (
        <MainLayout>
            <PageTitle title="จัดการตัวชี้วัด (KPI Management)" subTitle="Performance Cockpit" rightContent={yearSelector} />
            
            <div className="mt-0">
                {/* Department Filter */}
                <div className="d-flex align-items-center gap-2 mb-2 p-0">
                    <IconifyIcon icon="solar:buildings-2-bold-duotone" className="fs-20 text-primary flex-shrink-0" />
                    <span className="fw-semibold text-muted text-nowrap">หน่วยงาน:</span>
                    <div style={{ minWidth: '320px', flex: 1, maxWidth: '480px' }}>
                        <ReactSelect
                            isClearable
                            isSearchable
                            placeholder="— ค้นหาหรือเลือกหน่วยงาน —"
                            noOptionsMessage={() => 'ไม่พบหน่วยงาน'}
                            value={
                                deptFilter
                                    ? departments
                                        .map(d => ({ value: String(d.id), label: d.dp_name }))
                                        .find(opt => opt.value === deptFilter) ?? null
                                    : null
                            }
                            options={departments.map(d => ({ value: String(d.id), label: d.dp_name }))}
                            onChange={(selected) => changeDepartment(selected ? selected.value : '')}
                            classNamePrefix="react-select"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderColor: '#dee2e6',
                                    boxShadow: 'none',
                                    '&:hover': { borderColor: '#86b7fe' },
                                }),
                                menu: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                        />
                    </div>
                </div>

                <Row className="row-cols-lg-4 row-cols-sm-2 row-cols-1 mb-0 g-3">
                    {cockpitCategories.map((cat, idx) => (
                        <Col key={idx}>
                            <Card className="shadow-sm h-80 border-0 overflow-hidden">
                                <CardBody className="p-3 text-center">
                                    <h5 className="text-muted fw-bold mb-1 text-uppercase">{cat.label}</h5>
                                    <div className="position-relative" style={{ height: '110px' }}>
                                        <ReactApexChart 
                                            options={getChartOptions(cat.color)} 
                                            series={[getPassedPercentage(cat.stats)]} 
                                            type="radialBar" 
                                            height={200} 
                                        />
                                    </div>
                                    <div className="mt-1 d-flex justify-content-between px-2">
                                        <div className="text-start">
                                            <span className="d-block text-muted small">ทั้งหมด</span>
                                            <span className="fw-bold text-primary fs-14">{cat.stats.total}</span>
                                        </div>
                                        <div className="text-end">
                                            <span className="d-block text-muted small">ผ่าน</span>
                                            <span className="fw-bold text-success fs-14">{cat.stats.passed}</span>
                                        </div>
                                    </div>
                                    <div className="progress mt-2" style={{ height: '4px' }}>
                                        <div 
                                            className="progress-bar" 
                                            style={{ 
                                                width: `${getPassedPercentage(cat.stats)}%`,
                                                backgroundColor: cat.color 
                                            }} 
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row>
                    <Col md={12}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h4  className="card-title mb-0 text-primary">รายการตัวชี้วัดปี {currentYear}</h4>
                                <div className="d-flex gap-2">
                                    <Link href="/kpis/add" className="btn btn-warning btn-sm d-flex align-items-center gap-1">
                                        <IconifyIcon icon="tabler:plus" className="fs-16" /> เพิ่มตัวชี้วัด
                                    </Link>
                                </div>
                            </Card.Header>
                            {/* <CardBody> */}
                                <Grid
                                    data={kpis.map((kpi) => [
                                        kpi.kpi_code,
                                        kpi.id, 
                                        kpi.kpi_name_th,
                                        kpi.unit || '-',
                                        `${kpi.target_direction === 'up' ? '>= ' : '<= '} ${kpi.target_value || '0'} (${kpi.target_direction === 'up' ? 'สูงดี' : 'ต่ำดี'})`,
                                        kpi, 
                                        kpi,
                                        kpi.responsible_user?.name || '-',
                                        kpi.id, 
                                    ])}
                                    columns={[
                                        {
                                            name: 'รหัส',
                                            formatter: (val, row) => {
                                                const kpi = row.cells[5].data;
                                                const isInactive = kpi.is_active === 'inactive';
                                                return html(`<span style="${isInactive ? 'color: red; text-decoration: line-through;' : ''}">${val}</span>`);
                                            }
                                        },
                                        {
                                            name: 'Input',
                                            formatter: (id) => html(
                                                `<div class="text-center">
                                                    <button onclick="openKpiInput(${id})" class="btn btn-sm btn-soft-primary btn-icon rounded-circle">
                                                        <iconify-icon icon="solar:pen-2-bold" class="fs-16"></iconify-icon>
                                                    </button>
                                                </div>`
                                            )
                                        },
                                        { 
                                            name: 'ตัวชี้วัด', 
                                            width: '400px',
                                            formatter: (name, row) => {
                                                const kpi = row.cells[5].data;
                                                const isInactive = kpi.is_active === 'inactive';
                                                const textStyle = isInactive ? 'color: red; text-decoration: line-through;' : '';
                                                
                                                let pdfLink = '';
                                                if (kpi.template_file) {
                                                    pdfLink = `<a href="/storage/${kpi.template_file}" target="_blank" class="ms-2 d-inline-flex align-items-center text-danger" title="ดาวน์โหลด Template">
                                                                <iconify-icon icon="tabler:file-type-pdf" class="fs-20"></iconify-icon>
                                                               </a>`;
                                                }

                                                return html(
                                                    `<div class="text-start text-wrap d-flex align-items-center" style="min-width: 300px; ${textStyle}">
                                                        <a href="#" onclick="event.preventDefault(); window.__inertiaRouter.visit('/kpis/details?id=${row.cells[1].data}')" class="${isInactive ? 'text-danger' : 'text-dark'} fw-medium" style="cursor:pointer; ${textStyle}">
                                                            ${name}
                                                        </a>
                                                        ${pdfLink}
                                                    </div>`
                                                );
                                            }
                                        },
                                        {
                                            name: 'หน่วยวัด',
                                            formatter: (val, row) => {
                                                const kpi = row.cells[5].data;
                                                const isInactive = kpi.is_active === 'inactive';
                                                return html(`<span style="${isInactive ? 'color: red; text-decoration: line-through;' : ''}">${val}</span>`);
                                            }
                                        },
                                        {
                                            name: 'เป้าหมาย',
                                            formatter: (val, row) => {
                                                const kpi = row.cells[5].data;
                                                const isInactive = kpi.is_active === 'inactive';
                                                return html(`<span style="${isInactive ? 'color: red; text-decoration: line-through;' : ''}">${val}</span>`);
                                            }
                                        },
                                        {
                                            name: 'สถานะ',
                                            formatter: (kpi: any) => {
                                                const isActive = kpi.is_active === 'active';
                                                return html(
                                                    `<span class="badge ${isActive ? 'bg-success' : 'bg-danger'} rounded-pill">
                                                        ${isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                    </span>`
                                                );
                                            }
                                        },
                                        {
                                            name: 'ผลงาน',
                                            formatter: (kpi: any) => {
                                                const isPass = kpi.kpi_status === 'pass';
                                                const isFail = kpi.kpi_status === 'fail';
                                                const badgeClass = isPass ? 'bg-success-subtle text-success border border-success-subtle' : 
                                                                 isFail ? 'bg-danger-subtle text-danger border border-danger-subtle' : 
                                                                 'bg-warning-subtle text-warning border border-warning-subtle';
                                                const icon = isPass ? 'solar:check-circle-bold' : 
                                                           isFail ? 'solar:close-circle-bold' : 
                                                           'solar:clock-circle-bold';
                                                
                                                // แสดงค่าจาก kpi.result แทนคำว่า ผ่าน/ไม่ผ่าน
                                                const resultText = kpi.result !== null ? Number(kpi.result).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '-';
                                                
                                                return html(
                                                    `<div class="text-center">
                                                        <span class="badge ${badgeClass} fs-13 px-2 py-1 rounded-pill" style="min-width: 60px;">
                                                            <iconify-icon icon="${icon}" class="me-1 align-middle"></iconify-icon>
                                                            ${resultText}
                                                        </span>
                                                    </div>`
                                                );
                                            }
                                        },
                                        'ผู้รับผิดชอบ',
                                        {
                                            name: 'จัดการ',
                                            formatter: (id) => html(
                                                `<div class="hstack gap-1 justify-content-center">
                                                    <button 
                                                        class="btn btn-sm btn-soft-primary btn-icon rounded-circle" 
                                                        onclick="event.preventDefault(); window.__inertiaRouter.visit('/kpis/details?id=${id}')"
                                                        title="ดูรายละเอียด"
                                                    >
                                                        <iconify-icon icon="solar:eye-bold" class="fs-16"></iconify-icon>
                                                    </button>
                                                    ${isAdminOrHead ? `
                                                    <button 
                                                        class="btn btn-sm btn-soft-success btn-icon rounded-circle" 
                                                        onclick="event.preventDefault(); window.__inertiaRouter.visit('/kpis/${id}/edit')"
                                                        title="แก้ไข"
                                                    >
                                                        <iconify-icon icon="solar:pen-2-bold" class="fs-16"></iconify-icon>
                                                    </button>
                                                    <button 
                                                        class="btn btn-sm btn-soft-danger btn-icon rounded-circle" 
                                                        onclick="deleteKpi(${id})"
                                                        title="ลบ"
                                                    >
                                                        <iconify-icon icon="solar:trash-bin-trash-bold" class="fs-16"></iconify-icon>
                                                    </button>
                                                    ` : ''}
                                                </div>`
                                            )
                                        },
                                    ]}
                                    search={true}
                                    pagination={{
                                        limit: 10,
                                    }}
                                    sort={true}
                                    language={{
                                        'search': {
                                            'placeholder': 'ค้นหา...'
                                        },
                                        'pagination': {
                                            'previous': 'ก่อนหน้า',
                                            'next': 'ถัดไป',
                                            'showing': 'แสดง',
                                            'results': () => 'รายการ'
                                        }
                                    }}
                                    className={{
                                        table: 'table table-hover align-middle mb-0 text-nowrap text-center',
                                        thead: 'bg-light text-muted fw-bold',
                                        pagination: 'mt-0 mb-0 p-1',
                                        container: 'mt-1 mb-1 p-1'
                                    }}
                                />
                            {/* </CardBody> */}
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Performance Data Input Modal */}
            <Modal show={showInputModal} onHide={() => setShowInputModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="text-primary fs-18">
                        <IconifyIcon icon="solar:pen-2-bold-duotone" className="me-2" />
                        บันทึกข้อมูลผลงาน ({selectedKpi?.reporting_period}): {selectedKpi?.kpi_code}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="mb-4">
                        <h5 className="fw-bold text-dark mb-1">{selectedKpi?.kpi_name_th}</h5>
                        <p className="text-danger small mb-0">
                            <span className="fw-bold">สูตรการคำนวณ:</span> ({selectedKpi?.formula_a || 'A'} x {selectedKpi?.formula_c || 'C'}) / {selectedKpi?.formula_b || 'B'}
                        </p>
                        <p className="text-muted small mb-0">
                            <span className="fw-bold">เกณฑ์การประเมิน:</span> เป้าหมาย {selectedKpi?.target_direction === 'up' ? '>= ' : '<= '} {selectedKpi?.target_value} {selectedKpi?.unit} ({selectedKpi?.target_direction === 'up' ? 'สูงดี' : 'ต่ำดี'})
                        </p>
                    </div>

                    {isMonthly && (
                        <Row className="g-3">
                            {months.map((month, index) => {
                                const fieldName = `m${index + 1}` as keyof typeof data;
                                return (
                                    <Col lg={2} md={4} xs={6} key={index}>
                                        <div className="card shadow-none border p-2 mb-0 h-100">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="fw-bold text-primary fs-13">{month}</span>
                                                <div className="form-check m-0">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id={`cert-${index}`} 
                                                        style={{ transform: 'scale(0.8)' }} 
                                                        checked={data[`m${index + 1}_status` as keyof typeof data] === 'certified'}
                                                        onChange={(e) => setData(`m${index + 1}_status` as keyof typeof data, e.target.checked ? 'certified' : '')}
                                                        disabled={!canCertify}
                                                    />
                                                    <label className="form-check-label fs-11 text-muted" htmlFor={`cert-${index}`}>รับรอง</label>
                                                </div>
                                            </div>
                                            <input 
                                                type="number" 
                                                className={`form-control form-control-sm text-center ${data[`m${index + 1}_status` as keyof typeof data] === 'certified' ? 'bg-light text-muted fw-bold' : ''}`}
                                                placeholder="ผลงาน" 
                                                value={data[fieldName] ?? ''}
                                                onChange={(e) => setData(fieldName, e.target.value === '' ? null : parseFloat(e.target.value))}
                                                disabled={data[`m${index + 1}_status` as keyof typeof data] === 'certified' || !canEditSelectedKpi()}
                                            />
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}

                    {isQuarterly && (
                        <Row className="g-3">
                            {quarters.map((q, index) => {
                                const fieldName = `q${index + 1}` as keyof typeof data;
                                return (
                                    <Col md={6} key={index}>
                                        <div className="card shadow-none border p-3 mb-0 h-100">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <Form.Label className="fw-bold text-primary m-0">{q}</Form.Label>
                                                <div className="form-check m-0">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id={`q-cert-${index}`} 
                                                        checked={data[`q${index + 1}_status` as keyof typeof data] === 'certified'}
                                                        onChange={(e) => setData(`q${index + 1}_status` as keyof typeof data, e.target.checked ? 'certified' : '')}
                                                        disabled={!canCertify}
                                                    />
                                                    <label className="form-check-label fs-12 text-muted" htmlFor={`q-cert-${index}`}>รับรอง</label>
                                                </div>
                                            </div>
                                            <Form.Control 
                                                type="number" 
                                                placeholder="ระบุผลงานประจำงวด" 
                                                value={data[fieldName] ?? ''}
                                                onChange={(e) => setData(fieldName, e.target.value === '' ? null : parseFloat(e.target.value))}
                                                disabled={data[`q${index + 1}_status` as keyof typeof data] === 'certified' || !canEditSelectedKpi()}
                                                className={data[`q${index + 1}_status` as keyof typeof data] === 'certified' ? 'bg-light text-muted fw-bold' : ''}
                                            />
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}

                    {isYearly && (
                        <Card className="shadow-none border p-4 bg-light">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <Form.Label className="fw-bold text-primary fs-16 mb-0">ผลงานรวมรายปี (พ.ศ. {currentYear})</Form.Label>
                                <div className="form-check m-0">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id="annual-cert" 
                                        checked={data.annual_status === 'certified'}
                                        onChange={(e) => setData('annual_status', e.target.checked ? 'certified' : '')}
                                        disabled={!canCertify}
                                    />
                                    <label className="form-check-label text-muted" htmlFor="annual-cert">รับรองผลงาน</label>
                                </div>
                            </div>
                            <Form.Control 
                                type="number" 
                                size="lg" 
                                className={`text-center fw-bold fs-24 ${data.annual_status === 'certified' ? 'bg-light text-muted' : ''}`}
                                placeholder="ระบุผลงานสุทธิ" 
                                value={data.annual_result ?? ''}
                                onChange={(e) => setData('annual_result', e.target.value === '' ? null : parseFloat(e.target.value))}
                                disabled={data.annual_status === 'certified' || !canEditSelectedKpi()}
                            />
                            <p className="text-muted small mt-2 mb-0 text-center italic">
                                * สำหรับตัวชี้วัดที่มีความถี่รายงานเป็นรายปีเท่านั้น
                            </p>
                        </Card>
                    )}

                    <div className="mt-4">
                        <Form.Label className="fw-bold">Note / หมายเหตุ...</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="ระบุรายละเอียดเพิ่มเติม..." 
                            value={data.note || ''}
                            onChange={(e) => setData('note', e.target.value)}
                            disabled={!canEditSelectedKpi()}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" onClick={() => setShowInputModal(false)}>ยกเลิก</Button>
                    <Button variant="primary" onClick={handleSaveMonthlyData} className="px-4" disabled={processing || !canEditSelectedKpi()}>
                        <IconifyIcon icon={processing ? "svg-spinners:180-ring-with-halves" : "solar:diskette-bold"} className="me-1" /> 
                        {processing ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </MainLayout>
    );
};

export default KpisPage;
