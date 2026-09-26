import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardBody, Col, Row, Button, Badge, Table, Form } from 'react-bootstrap';
import MainLayout from '@/layouts/MainLayout';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface RegistrationHistoryItem {
    id: number;
    activity_id: number;
    actual_hours: number;
    attendance_type: string;
    check_in_time?: string | null;
    check_out_time?: string | null;
    check_in_method?: string | null;
    admin_override: boolean;
    activity: {
        id: number;
        activity_code: string;
        activity_name: string;
        activity_type: string;
        academic_year: number;
        semester: number;
        activity_date: string;
        total_hours: number;
        location_name: string;
    };
}

interface PageProps {
    studentProfile?: {
        student_code: string;
        title_prefix?: string;
        first_name_th: string;
        last_name_th: string;
        faculty: string;
        major: string;
        class_year: string;
    } | null;
    registrations: RegistrationHistoryItem[];
    hoursByYear: Record<string, number>;
    totalHours: number;
}

export default function StudentActivityHistory({
    studentProfile,
    registrations,
    hoursByYear,
    totalHours,
}: PageProps) {
    const [selectedYear, setSelectedYear] = useState<string>('');

    const filteredRegistrations = registrations.filter((item) => {
        if (!selectedYear) return true;
        return String(item.activity.academic_year) === selectedYear;
    });

    const years = Object.keys(hoursByYear).sort((a, b) => Number(b) - Number(a));

    return (
        <MainLayout>
            <Head title="ประวัติการเข้าร่วมกิจกรรม" />
            <PageTitle title="ประวัติการเข้าร่วมกิจกรรม" subTitle="สรุปชั่วโมงกิจกรรมสะสมและพิมพ์ใบรับรอง e-Certificate" />

            {/* Top Stat Cards */}
            <Row className="g-3 mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm text-white h-100" style={{ background: 'linear-gradient(135deg, #465dff 0%, #783bff 100%)' }}>
                        <CardBody className="p-4 d-flex flex-column justify-content-between">
                            <div>
                                <h6 className="text-white-50 text-uppercase fs-13 mb-1">ชั่วโมงกิจกรรมสะสมตลอดหลักสูตร</h6>
                                <div className="display-5 fw-bold mb-0">
                                    {Number(totalHours).toFixed(1)} <span className="fs-16 fw-normal text-white-50">ชม.</span>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-top border-white border-opacity-25 fs-13 text-white-50">
                                นักศึกษา: {studentProfile?.title_prefix || ''}{studentProfile?.first_name_th} {studentProfile?.last_name_th} ({studentProfile?.student_code || '-'})
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <CardBody className="p-4">
                            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-1">
                                <IconifyIcon icon="tabler:chart-bar" className="text-primary fs-18" /> สรุปชั่วโมงกิจกรรมแยกตามปีการศึกษา
                            </h6>
                            <Row className="g-3">
                                {years.length === 0 ? (
                                    <Col xs={12}>
                                        <div className="text-muted fs-13">ยังไม่มีข้อมูลชั่วโมงสะสม</div>
                                    </Col>
                                ) : (
                                    years.map((y) => (
                                        <Col sm={4} key={y}>
                                            <div className="p-3 bg-light rounded-3 border">
                                                <div className="text-muted fs-12 mb-1">ปีการศึกษา {y}</div>
                                                <div className="fs-20 fw-bold text-primary">
                                                    {Number(hoursByYear[y]).toFixed(1)} <span className="fs-12 text-muted fw-normal">ชั่วโมง</span>
                                                </div>
                                            </div>
                                        </Col>
                                    ))
                                )}
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Filter and History Table */}
            <Card className="border-0 shadow-sm">
                <CardBody className="p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold text-dark fs-14">ตัวกรอง:</span>
                        <Form.Select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={{ width: 180 }}
                        >
                            <option value="">ปีการศึกษาทั้งหมด</option>
                            {years.map((y) => (
                                <option key={y} value={y}>ปีการศึกษา {y}</option>
                            ))}
                        </Form.Select>
                    </div>

                    <span className="text-muted fs-13">
                        เข้าร่วมแล้วทั้งหมด {filteredRegistrations.length} กิจกรรม
                    </span>
                </CardBody>

                <CardBody className="p-0">
                    <div className="table-responsive">
                        <Table hover className="table-nowrap mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '60px' }}>#</th>
                                    <th>รหัส / กิจกรรม</th>
                                    <th>ปีการศึกษา</th>
                                    <th>วันเวลาที่จัด</th>
                                    <th>เวลาที่เช็กอิน - เช็กเอาต์</th>
                                    <th className="text-center">ชั่วโมงที่ได้รับ</th>
                                    <th>ผลการเข้าร่วม</th>
                                    <th className="text-center" style={{ width: '150px' }}>ใบรับรอง</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5 text-muted">
                                            <IconifyIcon icon="tabler:history-off" className="fs-48 text-secondary mb-2" />
                                            <div>ยังไม่มีประวัติการเข้าร่วมกิจกรรมที่บันทึกไว้</div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegistrations.map((item, idx) => {
                                        return (
                                            <tr key={item.id}>
                                                <td>{idx + 1}</td>
                                                <td>
                                                    <span className="badge bg-light text-dark border me-1">
                                                        {item.activity.activity_code || `A${item.activity.id}`}
                                                    </span>
                                                    <span className="fw-semibold text-dark">
                                                        {item.activity.activity_name}
                                                    </span>
                                                    <small className="d-block text-muted">
                                                        <IconifyIcon icon="tabler:map-pin" /> {item.activity.location_name}
                                                    </small>
                                                </td>
                                                <td>
                                                    ปี {item.activity.academic_year} ภาค {item.activity.semester}
                                                </td>
                                                <td>
                                                    <div>{new Date(item.activity.activity_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                                                    <small className="text-muted">
                                                        {item.activity.total_hours} ชม. ที่กำหนด
                                                    </small>
                                                </td>
                                                <td>
                                                    <div className="text-success fs-12">
                                                        เข้า: {item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'} น.
                                                    </div>
                                                    <div className="text-primary fs-12">
                                                        ออก: {item.check_out_time ? new Date(item.check_out_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'} น.
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-primary-subtle text-primary fs-13 px-2 py-1">
                                                        {Number(item.actual_hours).toFixed(1)} ชม.
                                                    </span>
                                                </td>
                                                <td>
                                                    {item.attendance_type === 'full' ? (
                                                        <Badge bg="success-subtle" className="text-success border border-success-subtle rounded-pill">
                                                            <IconifyIcon icon="tabler:check" className="me-1" /> เต็มเวลา
                                                        </Badge>
                                                    ) : (
                                                        <Badge bg="warning-subtle" className="text-warning border border-warning-subtle rounded-pill">
                                                            <IconifyIcon icon="tabler:alert-triangle" className="me-1" /> ไม่เต็มเวลา
                                                        </Badge>
                                                    )}
                                                    {item.admin_override && (
                                                        <small className="d-block text-danger">
                                                            (อาจารย์ปรับแก้)
                                                        </small>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    {item.actual_hours > 0 ? (
                                                        <Link
                                                            href={`/student/activity-certificate/${item.id}`}
                                                            target="_blank"
                                                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                                        >
                                                            <IconifyIcon icon="tabler:certificate" /> ดูใบรับรอง
                                                        </Link>
                                                    ) : (
                                                        <span className="text-muted fs-12">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>
                    </div>
                </CardBody>
            </Card>
        </MainLayout>
    );
}
