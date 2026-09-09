import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, CardBody, Col, Row, Button } from 'react-bootstrap';
import { router } from '@inertiajs/react';
import ReactSelect from 'react-select';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';

interface Kpi {
    id: number;
    kpi_code: string;
    kpi_name_th: string;
    unit: string;
    target_value: number;
    target_direction: string;
    reporting_period?: string;
    m1?: number; m2?: number; m3?: number; m4?: number; m5?: number; m6?: number;
    m7?: number; m8?: number; m9?: number; m10?: number; m11?: number; m12?: number;
    q1?: number; q2?: number; q3?: number; q4?: number;
    annual_result?: number;
    kpi_status?: 'pass' | 'fail' | null;
    responsible_user?: { name: string };
    [key: string]: any; 
}

interface Department {
    id: number;
    dp_name: string;
}

interface MonitoringPageProps {
    kpis: Kpi[];
    currentYear: number;
    departments: Department[];
    selectedDepartment: string;
}

const MonitoringPage = ({ kpis = [], currentYear, departments = [], selectedDepartment = '' }: MonitoringPageProps) => {
    const [deptFilter, setDeptFilter] = useState(selectedDepartment);
    const [periodFilter, setPeriodFilter] = useState('all');

    const changeYear = (year: number) => {
        router.get('/kpis/monitoring', { year, department: deptFilter });
    };

    const changeDepartment = (deptId: string) => {
        setDeptFilter(deptId);
        router.get('/kpis/monitoring', { year: currentYear, department: deptId });
    };

    const formatNum = (val: any) => {
        if (val === null || val === undefined || val === '') return '-';
        return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    const renderVal = (val: any, status: string | undefined) => {
        const formatted = formatNum(val);
        if (status === 'certified' && formatted !== '-') {
            return html(`<span class="badge rounded-pill bg-info shadow-sm fs-12">${formatted}</span>`);
        }
        return formatted;
    };

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

    const filteredData = kpis.filter(k => periodFilter === 'all' || k.reporting_period === periodFilter);

    const tableColumns = [
        { name: 'รหัส', width: '80px' },
        { 
            name: 'ตัวชี้วัด', 
            width: '250px',
            formatter: (cell: any) => html(`<div class="text-start text-wrap">${cell}</div>`)
        },
        { name: 'หน่วย', width: '80px' },
        { name: 'เป้าหมาย', width: '100px' },
        { 
            name: 'สถานะ', 
            width: '80px',
            formatter: (cell: any) => {
                if (cell === 'pass') return html('<span class="badge bg-success-subtle text-success">ผ่าน</span>');
                if (cell === 'fail') return html('<span class="badge bg-danger-subtle text-danger">ไม่ผ่าน</span>');
                return html('<span class="text-muted small">-</span>');
            }
        },
        { name: 'ผู้รับผิดชอบ', width: '150px' },
    ];

    // เงื่อนไขการแสดงคอลัมน์ ปี, งวด, เดือน
    const showYear = periodFilter === 'all' || periodFilter === 'รายปี';
    const showQuarters = periodFilter === 'all' || periodFilter === 'รายงวด';
    const showMonths = periodFilter === 'all' || periodFilter === 'รายเดือน';

    if (showYear) tableColumns.push({ name: 'ปี', width: '60px' });
    
    if (showQuarters) {
        tableColumns.push(
            { name: 'Q1', width: '50px' }, { name: 'Q2', width: '50px' }, { name: 'Q3', width: '50px' }, { name: 'Q4', width: '50px' }
        );
    }

    if (showMonths) {
        tableColumns.push(
            { name: 'ต.ค.', width: '50px' }, { name: 'พ.ย.', width: '50px' }, { name: 'ธ.ค.', width: '50px' },
            { name: 'ม.ค.', width: '50px' }, { name: 'ก.พ.', width: '50px' }, { name: 'มี.ค.', width: '50px' },
            { name: 'เม.ย.', width: '50px' }, { name: 'พ.ค.', width: '50px' }, { name: 'มิ.ย.', width: '50px' },
            { name: 'ก.ค.', width: '50px' }, { name: 'ส.ค.', width: '50px' }, { name: 'ก.ย.', width: '50px' }
        );
    }

    const tableData = filteredData.map(k => {
        let row = [
            k.kpi_code,
            k.kpi_name_th,
            k.unit,
            `${k.target_direction === 'up' ? '>= ' : '<= '} ${k.target_value}`,
            k.kpi_status,
            k.responsible_user?.name || '-',
        ];
        
        if (showYear) row.push(renderVal(k.annual_result, k.annual_status));
        
        if (showQuarters) {
            row = [
                ...row, 
                renderVal(k.q1, k.q1_status), 
                renderVal(k.q2, k.q2_status), 
                renderVal(k.q3, k.q3_status), 
                renderVal(k.q4, k.q4_status)
            ];
        }

        if (showMonths) {
            row = [
                ...row,
                renderVal(k.m1, k.m1_status), renderVal(k.m2, k.m2_status), renderVal(k.m3, k.m3_status), renderVal(k.m4, k.m4_status),
                renderVal(k.m5, k.m5_status), renderVal(k.m6, k.m6_status), renderVal(k.m7, k.m7_status), renderVal(k.m8, k.m8_status),
                renderVal(k.m9, k.m9_status), renderVal(k.m10, k.m10_status), renderVal(k.m11, k.m11_status), renderVal(k.m12, k.m12_status)
            ];
        }
        return row;
    });

    return (
        <MainLayout>
            <PageTitle title="รายงานการติดตามตัวชี้วัด" subTitle="Monitoring Report" rightContent={yearSelector} />

            <div className="mt-0">
                <div className="mb-3 d-flex align-items-center gap-4 flex-wrap">
                    <div className="d-flex align-items-center gap-2">
                        <IconifyIcon icon="solar:buildings-2-bold-duotone" className="fs-20 text-primary flex-shrink-0" />
                        <span className="fw-semibold text-muted text-nowrap">หน่วยงาน:</span>
                        <div style={{ minWidth: '380px', maxWidth: '480px' }}>
                            <ReactSelect
                                isClearable
                                isSearchable
                                placeholder="— ค้นหาหรือเลือกหน่วยงาน —"
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
                            />
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <IconifyIcon icon="solar:filter-bold-duotone" className="fs-20 text-primary flex-shrink-0" />
                        <span className="fw-semibold text-muted text-nowrap">แสดงผลตามประเภท:</span>
                        <div className="d-flex gap-1 bg-light p-1 rounded-pill border">
                            {[
                                { id: 'all', label: 'ทั้งหมด' },
                                { id: 'รายปี', label: 'รายปี' },
                                { id: 'รายงวด', label: 'รายงวด' },
                                { id: 'รายเดือน', label: 'รายเดือน' }
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setPeriodFilter(p.id)}
                                    className={`btn btn-sm rounded-pill px-3 py-1 border-0 ${periodFilter === p.id ? 'btn-primary shadow-sm' : 'text-muted'}`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <Card className="shadow-sm border-0">
                    <CardBody className="p-0">
                        <Grid
                            key={periodFilter}
                            data={tableData}
                            columns={tableColumns}
                            search={true}
                            pagination={{ limit: 20 }}
                            sort={true}
                            language={{
                                'search': { 'placeholder': 'ค้นหาตัวชี้วัด...' },
                                'pagination': { 'previous': 'ก่อนหน้า', 'next': 'ถัดไป', 'showing': 'แสดง', 'results': () => 'รายการ' }
                            }}
                            className={{
                                table: 'table table-hover table-bordered align-middle mb-0 text-center fs-12',
                                thead: 'bg-light text-muted fw-bold',
                                pagination: 'mt-0 mb-0 p-1',
                                container: 'mt-1 mb-1 p-1'
                            }}
                        />
                    </CardBody>
                </Card>
            </div>
        </MainLayout>
    );
};

export default MonitoringPage;
