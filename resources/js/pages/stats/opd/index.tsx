import MainLayout from '@/layouts/MainLayout';
import { Col, Row, Card, Table } from 'react-bootstrap';
import { Head } from '@inertiajs/react';
import ReactApexChart from 'react-apexcharts';
import PageTitle from '@/components/PageTitle';

interface OpdStatsProps {
    monthlyStats: any[];
    specialtyStats: any[];
    pttypeStats: any[];
    selectedYear: number;
}

const OpdStatsPage = ({ monthlyStats, specialtyStats, pttypeStats, selectedYear }: OpdStatsProps) => {
    
    const chartOptions: any = {
        chart: {
            type: 'bar',
            stacked: true,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: monthlyStats.map(s => s.AMONTH),
            title: {
                text: 'เดือน'
            }
        },
        yaxis: {
            title: {
                text: 'จำนวน (ราย)'
            }
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            y: {
                formatter: function (val: number) {
                    return val + " ราย"
                }
            }
        },
        colors: ['#3399cc', '#ff0000']
    };

    const chartSeries = [
        {
            name: 'ผู้ป่วยนอก (OPD)',
            data: monthlyStats.map(s => parseFloat(s.opd))
        },
        {
            name: 'ผู้ป่วยใน (IPD)',
            data: monthlyStats.map(s => parseFloat(s.ipd))
        }
    ];

    return (
        <MainLayout>
            <Head title="สถิติผู้รับบริการ" />
            <PageTitle title="ผู้รับบริการ" subTitle="ข้อมูลและสถิติ" />

            <Row>
                <Col xl={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white py-3">
                            <h4 className="card-title mb-0">สถิติผู้รับบริการรายเดือน ปีงบประมาณ {selectedYear}</h4>
                        </Card.Header>
                        <Card.Body>
                            <div dir="ltr">
                                <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={400} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col xl={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white py-3">
                            <h4 className="card-title mb-0">สถิติจำแนกตามแผนก (Specialty)</h4>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive hover className="table-centered mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>แผนก</th>
                                        <th className="text-end">จำนวน (ราย)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {specialtyStats.map((s, idx) => (
                                        <tr key={idx}>
                                            <td>{s.spclty_name || 'ไม่ระบุ'}</td>
                                            <td className="text-end fw-bold text-primary">{parseFloat(s.visit_count).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={6}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white py-3">
                            <h4 className="card-title mb-0">สถิติจำแนกตามสิทธิการรักษา (Pttype)</h4>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive hover className="table-centered mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>สิทธิการรักษา</th>
                                        <th className="text-end">จำนวน (ราย)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pttypeStats.map((s, idx) => (
                                        <tr key={idx}>
                                            <td>{s.pttype_name}</td>
                                            <td className="text-end fw-bold text-success">{parseFloat(s.visit_count).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default OpdStatsPage;
