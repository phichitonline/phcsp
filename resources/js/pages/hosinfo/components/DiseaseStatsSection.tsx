import { useState, useEffect } from 'react';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import axios from 'axios';

const DiseaseStatsSection = ({ external_api_url, refreshTrigger = 0 }: { external_api_url?: string; refreshTrigger?: number }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'dengue' | 'diarrhea' | 'others'>('dengue');

    const fetchDiseaseStats = async (silent = false, force = false) => {
        try {
            if (!silent) setLoading(true);
            const apiUrl = external_api_url || import.meta.env.VITE_EXTERNAL_API_URL || 'http://127.0.0.1:8800';
            const url = force ? `${apiUrl}/api/v1/dashboard/disease-stats?force_refresh=true` : `${apiUrl}/api/v1/dashboard/disease-stats`;
            const res = await axios.get(url);
            if (res.data) {
                setData(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard disease stats:', err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiseaseStats(false, false);
        const interval = setInterval(() => {
            fetchDiseaseStats(true, false);
        }, 60000); // refresh every 60 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchDiseaseStats(false, true);
        }
    }, [refreshTrigger]);

    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    const currentChartData = data ? (
        activeTab === 'dengue' ? data.tab_dengue :
        activeTab === 'diarrhea' ? data.tab_diarrhea :
        data.tab_others
    ) : { title: 'กำลังโหลดข้อมูลสถิติโรค...', series: [] };

    const getSeries = () => {
        if (!currentChartData || !currentChartData.series) return [];
        if (activeTab === 'others') {
            return currentChartData.series.map((s: any) => ({
                ...s,
                type: 'line'
            }));
        }
        return currentChartData.series.map((s: any, idx: number) => ({
            ...s,
            type: idx === 0 ? 'area' : 'line'
        }));
    };

    const getChartOptions = (): ApexOptions => ({
        chart: {
            type: 'line',
            height: 380,
            toolbar: { show: false },
            background: 'transparent',
            zoom: { enabled: true }
        },
        theme: {
            mode: 'light'
        },
        title: {
            text: currentChartData?.title || '',
            align: 'center',
            style: {
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        },
        stroke: {
            curve: 'smooth',
            width: activeTab === 'others' ? 3 : [3, 2, 2, 2, 2, 2, 3]
        },
        markers: {
            size: 4,
            hover: { size: 6 }
        },
        colors: activeTab === 'others' 
            ? ['#ef4444', '#3b82f6', '#10b981', '#f59e0b']
            : ['#ff9900', '#3b82f6', '#10b981', '#eab308', '#ef4444', '#6366f1', '#ec4899'],
        fill: activeTab === 'others' 
            ? { type: 'solid', opacity: 1 }
            : {
                type: ['gradient', 'solid', 'solid', 'solid', 'solid', 'solid', 'solid'],
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.5,
                    gradientToColors: ['#ff9900'],
                    inverseColors: false,
                    opacityFrom: 0.4,
                    opacityTo: 0.05,
                    stops: [0, 100]
                }
            },
        xaxis: {
            categories: months,
            labels: {
                style: { colors: '#64748b', fontSize: '12px' }
            },
            axisBorder: { color: '#e2e8f0' },
            axisTicks: { color: '#e2e8f0' }
        },
        yaxis: {
            title: {
                text: 'จำนวนผู้ป่วย (ราย)',
                style: { color: '#64748b', fontSize: '12px' }
            },
            labels: {
                style: { colors: '#64748b', fontSize: '12px' },
                formatter: (val) => Math.round(val).toString()
            }
        },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            labels: { colors: '#475569' },
            markers: { radius: 12 }
        },
        tooltip: {
            theme: 'light',
            shared: true,
            intersect: false
        }
    });

    const ranking = data?.ranking_this_month || [];

    return (
        <div className="mb-3">
            <Row className="mt-4 mb-2">
                <Col>
                    <h4 className="text-dark fw-bold border-start border-4 border-danger ps-2">โรคติดต่อที่สำคัญ</h4>
                </Col>
            </Row>

            <Row className="g-3">
                <Col lg={8} md={12}>
                    <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '0' }}>
                        <Card.Header className="bg-white border-bottom py-3 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div className="d-flex align-items-center">
                                <IconifyIcon icon="tabler:chart-line" className="text-danger me-2 fs-20" />
                                <h5 className="mb-0 fw-bold text-dark">สถานการณ์โรคที่ต้องเฝ้าระวัง</h5>
                            </div>
                            <div className="d-flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('dengue')}
                                    className={`btn btn-sm ${activeTab === 'dengue' ? 'btn-danger fw-bold shadow-sm' : 'btn-light text-muted fw-medium'} px-3`}
                                >
                                    ไข้เลือดออก
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('diarrhea')}
                                    className={`btn btn-sm ${activeTab === 'diarrhea' ? 'btn-danger fw-bold shadow-sm' : 'btn-light text-muted fw-medium'} px-3`}
                                >
                                    อุจจาระร่วง
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('others')}
                                    className={`btn btn-sm ${activeTab === 'others' ? 'btn-danger fw-bold shadow-sm' : 'btn-light text-muted fw-medium'} px-3`}
                                >
                                    โรคอื่นๆ
                                </button>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-3 bg-white position-relative">
                            {loading && !data ? (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: '380px' }}>
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : (
                                <ReactApexChart
                                    options={getChartOptions()}
                                    series={getSeries()}
                                    type="line"
                                    height={380}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4} md={12}>
                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '0' }}>
                        <Card.Header className="bg-white border-bottom py-3 px-3">
                            <h5 className="mb-0 fw-bold text-dark text-center">อันดับโรคติดต่อที่ต้องรายงานเดือนนี้</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="text-center py-2" style={{ width: '80px' }}>รหัส506</th>
                                            <th className="py-2">ชื่อโรค</th>
                                            <th className="text-center py-2" style={{ width: '90px' }}>จำนวน(ราย)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && ranking.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center py-5">
                                                    <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                                                    กำลังโหลดข้อมูลอันดับโรค...
                                                </td>
                                            </tr>
                                        ) : ranking.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center text-muted py-5">
                                                    ไม่พบข้อมูลการรายงานในเดือนนี้
                                                </td>
                                            </tr>
                                        ) : (
                                            ranking.map((row: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="text-center fw-medium text-dark">{row.code506}</td>
                                                    <td>
                                                        <div className="fw-semibold text-dark fs-13 mb-0">{row.namet}</div>
                                                        <small className="text-muted fs-11 d-block text-truncate" style={{ maxWidth: '200px' }} title={row.namee}>
                                                            {row.namee}
                                                        </small>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-danger rounded-pill px-2 py-1 fs-12 fw-bold">
                                                            {row.count506}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DiseaseStatsSection;
