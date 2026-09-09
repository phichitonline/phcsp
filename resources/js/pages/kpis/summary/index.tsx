import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardBody, Col, Row, Button } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Grid } from 'gridjs-react';
import { html } from 'gridjs';
import { router } from '@inertiajs/react';

interface CategoryStats {
    total: number;
    passed: number;
    failed: number;
}

interface SummaryItem {
    id: number;
    name: string;
    type: number; // 1: Unit, 2: Cross-functional
    total: number;
    passed: number;
    failed: number;
    performance: number;
}

interface Kpi {
    id: number;
    kpi_type: string;
    kpi_status: string;
    dp_type: number;
}

interface ClinicPageProps {
    summary: SummaryItem[];
    stats: {
        total: CategoryStats;
        ap: CategoryStats;
        qmp: CategoryStats;
        qp: CategoryStats;
    };
    kpis: Kpi[];
    currentYear: number;
}

const ClinicPage = ({ summary = [], stats, kpis = [], currentYear }: ClinicPageProps) => {
    const [filterType, setFilterType] = React.useState<string>('all'); // 'all', '1', '2'

    const filteredSummary = React.useMemo(() => {
        if (filterType === 'all') return summary;
        return summary.filter(item => String(item.type) === filterType);
    }, [summary, filterType]);

    const dynamicStats = React.useMemo(() => {
        const filteredKpis = filterType === 'all' 
            ? kpis 
            : kpis.filter(k => String(k.dp_type) === filterType);

        const calc = (collection: Kpi[]) => {
            return {
                total: collection.length,
                passed: collection.filter(k => k.kpi_status === 'pass').length,
                failed: collection.filter(k => k.kpi_status === 'fail').length,
            };
        };

        return {
            total: calc(filteredKpis),
            ap: calc(filteredKpis.filter(k => k.kpi_type === 'AP')),
            qmp: calc(filteredKpis.filter(k => k.kpi_type === 'QMP')),
            qp: calc(filteredKpis.filter(k => k.kpi_type === 'QP')),
        };
    }, [kpis, filterType]);

    const getPassedPercentage = (s: CategoryStats) => {
        return s.total > 0 ? Math.round((s.passed / s.total) * 100) : 0;
    };

    const getDynamicColor = (val: number) => {
        return val >= 80 ? '#28a745' : val >= 50 ? '#ffc107' : '#dc3545';
    };

    const cockpitCategories = [
        { label: 'ภาพรวม', stats: dynamicStats.total },
        { label: 'AP', stats: dynamicStats.ap },
        { label: 'QMP', stats: dynamicStats.qmp },
        { label: 'QP', stats: dynamicStats.qp }
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

    const changeYear = (year: number) => {
        router.get('/kpis/summary', { year });
    };

    const topFilterAndYear = (
        <div className="d-flex align-items-center flex-wrap gap-2">
            {/* Dept Type Filter */}
            <div className="btn-group btn-group-sm" role="group">
                <input 
                    type="radio" className="btn-check" name="filter-dept" id="filter-all" 
                    autoComplete="off" checked={filterType === 'all'} 
                    onChange={() => setFilterType('all')} 
                />
                <label className="btn btn-outline-primary px-3" htmlFor="filter-all">ทั้งหมด</label>

                <input 
                    type="radio" className="btn-check" name="filter-dept" id="filter-unit" 
                    autoComplete="off" checked={filterType === '1'} 
                    onChange={() => setFilterType('1')} 
                />
                <label className="btn btn-outline-primary px-3" htmlFor="filter-unit">หน่วยงาน</label>

                <input 
                    type="radio" className="btn-check" name="filter-dept" id="filter-cross" 
                    autoComplete="off" checked={filterType === '2'} 
                    onChange={() => setFilterType('2')} 
                />
                <label className="btn btn-outline-primary px-3" htmlFor="filter-cross">คล่อมสายงาน</label>
            </div>

            {/* Year Selector */}
            <div className="d-flex align-items-center gap-2 bg-white px-2 py-1 rounded-pill border shadow-sm" style={{ scale: '0.9' }}>
                <Button variant="link" size="sm" className="p-0 text-primary" onClick={() => changeYear(currentYear - 1)}>
                    <IconifyIcon icon="tabler:chevron-left" className="fs-20" />
                </Button>
                <span className="mb-0 text-primary fw-bold px-1" style={{ minWidth: '60px', textAlign: 'center' }}>ปีงบ {currentYear}</span>
                <Button variant="link" size="sm" className="p-0 text-primary" onClick={() => changeYear(currentYear + 1)}>
                    <IconifyIcon icon="tabler:chevron-right" className="fs-20" />
                </Button>
            </div>
        </div>
    );

    return (
        <MainLayout>
            <PageTitle title="สรุปตัวชี้วัด (KPI Summary)" subTitle="ภาพรวมผลงานรายหน่วยงาน" rightContent={topFilterAndYear} />

            <Row className="row-cols-lg-4 row-cols-sm-2 row-cols-1 mb-0 g-3">
                {cockpitCategories.map((cat, idx) => (
                    <Col key={idx}>
                        <Card className="shadow-sm border-0 overflow-hidden">
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
                <Col xs={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light-subtle py-3 d-flex justify-content-between align-items-center">
                            <h4 className="card-title mb-0 text-primary">
                                <IconifyIcon icon="solar:chart-2-bold-duotone" className="me-1 fs-20" />
                                รายการตัวชี้วัดแยกตามหน่วยงาน (KPI Indicators by Department)
                            </h4>
                        </Card.Header>
                        <CardBody className="p-0">
                            <Grid
                                data={filteredSummary.map((item) => [
                                    item.id,
                                    item.name,
                                    item.total,
                                    item.passed,
                                    item.failed,
                                    item.performance,
                                ])}
                                columns={[
                                    { name: 'รหัส', width: '80px' },
                                    { 
                                        name: 'ชื่อหน่วยงาน', 
                                        width: '300px',
                                        formatter: (val) => html(`<div class="text-start">${val}</div>`)
                                    },
                                    { name: 'จำนวนตัวชี้วัด', width: '120px' },
                                    { 
                                        name: 'ผ่าน', 
                                        width: '100px',
                                        formatter: (val) => html(`<span class="text-success fw-bold">${val}</span>`)
                                    },
                                    { 
                                        name: 'ไม่ผ่าน', 
                                        width: '100px',
                                        formatter: (val) => html(`<span class="text-danger fw-bold">${val}</span>`)
                                    },
                                    {
                                        name: 'ผลงาน',
                                        formatter: (val) => {
                                            const color = Number(val) >= 80 ? 'success' : Number(val) >= 50 ? 'warning' : 'danger';
                                            return html(`
                                                <div class="d-flex align-items-center justify-content-center gap-2">
                                                    <div class="progress flex-grow-1" style="height: 6px; max-width: 150px;">
                                                        <div class="progress-bar bg-${color}" style="width: ${val}%"></div>
                                                    </div>
                                                    <span class="fw-bold text-${color}">${val}%</span>
                                                </div>
                                            `);
                                        }
                                    }
                                ]}
                                search={true}
                                pagination={{ limit: 20 }}
                                sort={true}
                                className={{
                                    table: 'table table-hover align-middle mb-0 text-center',
                                    thead: 'bg-light-subtle text-muted fw-semibold',
                                    pagination: 'mt-0 mb-0 p-1',
                                    container: 'mt-1 mb-1 p-1'
                                }}
                                language={{
                                    'search': { 'placeholder': 'ค้นหาหน่วยงาน...' },
                                    'pagination': {
                                        'previous': 'ก่อนหน้า',
                                        'next': 'ถัดไป',
                                        'showing': 'แสดง',
                                        'results': () => 'รายการ'
                                    }
                                }}
                            />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default ClinicPage;