import React from 'react';
import { Head } from '@inertiajs/react';
import { Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { QRCodeSVG } from 'qrcode.react';

interface RegistrationDetail {
    id: number;
    actual_hours: number;
    attendance_type: string;
    check_in_time: string;
    check_out_time?: string;
    activity: {
        id: number;
        activity_code: string;
        activity_name: string;
        academic_year: number;
        semester: number;
        activity_date: string;
        total_hours: number;
        location_name: string;
    };
    user: {
        name: string;
        student_profile?: {
            title_prefix: string;
            first_name_th: string;
            last_name_th: string;
            student_code: string;
            major: string;
            faculty: string;
        } | null;
    };
}

interface PageProps {
    registration: RegistrationDetail;
    verifyUrl: string;
}

export default function ActivityCertificate({ registration, verifyUrl }: PageProps) {
    const profile = registration.user.student_profile;
    const fullName = profile
        ? `${profile.title_prefix || ''}${profile.first_name_th} ${profile.last_name_th}`
        : registration.user.name;

    const studentCode = profile?.student_code || '-';
    const major = profile?.major || 'สาธารณสุขศาสตรบัณฑิต';
    const act = registration.activity;

    const certDate = new Date(act.activity_date).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const certNo = `CERT-${act.academic_year}-${act.activity_code || act.id}-${String(registration.id).padStart(5, '0')}`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-light min-vh-100 py-4 d-flex flex-column align-items-center">
            <Head title={`ใบรับรองกิจกรรม - ${fullName}`} />

            {/* Action Bar (hidden on print) */}
            <div className="d-print-none mb-4 d-flex gap-2">
                <Button variant="primary" size="lg" onClick={handlePrint} className="d-flex align-items-center gap-2 shadow">
                    <IconifyIcon icon="tabler:printer" className="fs-20" /> พิมพ์หรือบันทึกเป็น PDF (Print / Save as PDF)
                </Button>
                <Button variant="outline-secondary" size="lg" onClick={() => window.close()} className="d-flex align-items-center gap-1">
                    <IconifyIcon icon="tabler:x" /> ปิดหน้าต่าง
                </Button>
            </div>

            {/* Certificate Container (A4 Landscape aspect) */}
            <div
                className="certificate-sheet bg-white p-5 shadow-lg position-relative text-center"
                style={{
                    width: '1000px',
                    minHeight: '700px',
                    border: '14px solid #1a365d',
                    outline: '3px solid #b7791f',
                    outlineOffset: '-8px',
                    boxSizing: 'border-box',
                    fontFamily: "'Sarabun', 'Inter', sans-serif",
                }}
            >
                {/* Decorative Corner Ornaments */}
                <div className="position-absolute top-0 start-0 m-2 text-warning fs-28 opacity-75">✦</div>
                <div className="position-absolute top-0 end-0 m-2 text-warning fs-28 opacity-75">✦</div>
                <div className="position-absolute bottom-0 start-0 m-2 text-warning fs-28 opacity-75">✦</div>
                <div className="position-absolute bottom-0 end-0 m-2 text-warning fs-28 opacity-75">✦</div>

                {/* Header */}
                <div className="mb-4">
                    <div className="mb-2">
                        <img
                            src="/images/logo-sm.png"
                            alt="Logo"
                            style={{ height: 75 }}
                            onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                            }}
                        />
                    </div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '1px' }}>
                        วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี
                    </h3>
                    <div className="text-muted fs-14 fw-semibold">
                        สถาบันพระบรมราชชนก กระทรวงสาธารณสุข
                    </div>
                    <div className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-1 fs-12 mt-2">
                        หนังสือรับรองการเข้าร่วมกิจกรรมนักศึกษา (e-Certificate)
                    </div>
                </div>

                {/* Body Content */}
                <div className="my-4">
                    <p className="fs-16 text-muted mb-2">หนังสือรับรองฉบับนี้ให้ไว้เพื่อแสดงว่า</p>

                    <h2 className="fw-bold text-primary my-3" style={{ fontSize: '32px' }}>
                        {fullName}
                    </h2>

                    <p className="fs-16 text-dark mb-3">
                        รหัสนักศึกษา <strong>{studentCode}</strong> สาขาวิชา <strong>{major}</strong>
                    </p>

                    <p className="fs-18 text-dark my-3 px-5 lh-lg">
                        ได้เข้าร่วมและผ่านการประเมินกิจกรรม <strong>"{act.activity_name}"</strong><br />
                        จัดขึ้น ณ {act.location_name} เมื่อวันที่ <strong>{certDate}</strong><br />
                        ได้รับการรับรองจำนวนชั่วโมงกิจกรรมรวม <strong>{Number(registration.actual_hours).toFixed(1)} ชั่วโมง</strong>
                    </p>
                </div>

                {/* Footer with Signatures & QR Code */}
                <div className="mt-5 pt-4 d-flex justify-content-between align-items-end px-5">
                    {/* QR Code Verification */}
                    <div className="text-start">
                        <div className="p-2 border rounded-2 d-inline-block bg-white shadow-sm">
                            <QRCodeSVG value={verifyUrl} size={90} level="M" />
                        </div>
                        <div className="fs-11 text-muted mt-1">
                            รหัสรับรอง: <strong>{certNo}</strong><br />
                            สแกนตรวจสอบความถูกต้อง
                        </div>
                    </div>

                    {/* Official Seal / Status */}
                    <div className="text-center">
                        <div
                            className="rounded-circle border border-2 border-danger d-inline-flex flex-column align-items-center justify-content-center text-danger"
                            style={{ width: 85, height: 85, transform: 'rotate(-8deg)' }}
                        >
                            <span style={{ fontSize: 9 }} className="fw-bold">วสส.สุพรรณบุรี</span>
                            <span style={{ fontSize: 13 }} className="fw-bold">รับรองแล้ว</span>
                            <span style={{ fontSize: 9 }}>{act.academic_year}</span>
                        </div>
                    </div>

                    {/* Director / Academic Dean Signature */}
                    <div className="text-center" style={{ minWidth: 220 }}>
                        <div className="mb-2" style={{ height: 40, borderBottom: '1px dashed #666' }} />
                        <div className="fw-bold text-dark fs-14">ผู้อำนวยการ / รองผู้อำนวยการฝ่ายวิชาการ</div>
                        <div className="text-muted fs-12">วิทยาลัยการสาธารณสุขสิรินธร จังหวัดสุพรรณบุรี</div>
                    </div>
                </div>
            </div>

            {/* Print Stylesheet */}
            <style>{`
                @media print {
                    body {
                        background: none !important;
                        padding: 0 !important;
                    }
                    .certificate-sheet {
                        box-shadow: none !important;
                        border-width: 10px !important;
                        width: 100% !important;
                        height: 100vh !important;
                        page-break-after: always;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 8mm;
                    }
                }
            `}</style>
        </div>
    );
}
