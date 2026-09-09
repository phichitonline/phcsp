import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, Col, Row, ProgressBar, Spinner } from 'react-bootstrap';
import { Link } from '@inertiajs/react';

const IpdStatsSection = ({ stats, wards, loading }: { stats: any, wards: any[], loading?: boolean }) => {
    const format = (val: any) => new Intl.NumberFormat().format(val || 0);

    return (
        <Row className="mt-2">
            <Col md={4}>
                <Card className="border-0 shadow-sm overflow-hidden h-100" style={{ borderRadius: '0' }}>
                    <div className="bg-danger p-3 d-flex align-items-center gap-3">
                        <IconifyIcon icon="tabler:bed-filled" className="text-white" width="60" height="60" />
                        <div>
                            <h4 className="text-white fw-bold mb-0">สถิติผู้ป่วยในวันนี้</h4>
                            <span className="text-white-50 small">
                                {loading ? <Spinner animation="border" size="sm" variant="light" /> : `จำนวนเตียงทั้งหมด ${format(stats?.ward_summary?.bedcount)} เตียง`}
                            </span>
                        </div>
                    </div>
                    <Card.Body className="p-0">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                                <span>รับใหม่วันนี้</span>
                                {loading ? <Spinner animation="border" size="sm" variant="danger" /> : <span className="badge bg-danger rounded-pill">{format(stats?.ipd_today?.admittoday)} เตียง</span>}
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                                <span>จำหน่ายวันนี้</span>
                                {loading ? <Spinner animation="border" size="sm" variant="warning" /> : <span className="badge bg-warning rounded-pill text-dark">{format(stats?.ipd_today?.dchtoday)} เตียง</span>}
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                                <span>Admit อยู่</span>
                                {loading ? <Spinner animation="border" size="sm" variant="primary" /> : <span className="badge bg-primary rounded-pill">{format(stats?.ward_summary?.wtotal)} เตียง</span>}
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                                <span>เตียงว่าง</span>
                                {loading ? <Spinner animation="border" size="sm" variant="success" /> : <span className="badge bg-success rounded-pill">{format(stats?.ward_summary?.wblank)} เตียง</span>}
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                                <span className="fw-bold">อัตราการครองเตียง</span>
                                {loading ? <Spinner animation="border" size="sm" variant="danger" /> : (
                                    <span className="badge bg-danger rounded-pill">
                                        {stats?.ward_summary?.bedcount > 0 ? ((stats?.ward_summary?.wtotal * 100) / stats?.ward_summary?.bedcount).toFixed(2) : 0} %
                                    </span>
                                )}
                            </li>
                        </ul>
                    </Card.Body>
                </Card>
            </Col>
            
            <Col md={8}>
                <Row className="g-3">
                    {loading ? (
                        <Col xs={12} className="text-center py-5">
                            <Spinner animation="grow" variant="danger" />
                            <p className="mt-2 text-muted">กำลังโหลดข้อมูลตึกผู้ป่วย...</p>
                        </Col>
                    ) : wards.length > 0 ? (
                        wards.map((ward) => {
                            const occupancy = ward.bedcount > 0 ? (ward.admitnow * 100 / ward.bedcount) : 0;
                            let variant = 'success';
                            if (occupancy >= 100) variant = 'danger';
                            else if (occupancy >= 75) variant = 'warning';
                            else if (occupancy >= 50) variant = 'info';

                            return (
                                <Col md={6} key={ward.ward}>
                                    <Link href={`${route('hosinfo.ipd')}?ward=${ward.ward}`} className="text-decoration-none">
                                        <Card className="border-0 shadow-sm overflow-hidden mb-0" style={{ borderRadius: '0' }}>
                                            <div className="d-flex align-items-center p-2 px-3 bg-white border-start border-4" style={{ borderColor: variant === 'success' ? '#198754' : variant === 'danger' ? '#dc3545' : variant === 'warning' ? '#ffc107' : '#0dcaf0' }}>
                                                <div className={`bg-${variant}-subtle p-2 rounded-circle me-3 d-flex align-items-center justify-content-center`} style={{ width: '56px', height: '56px' }}>
                                                    <IconifyIcon icon="tabler:bed-filled" className={`text-${variant}`} width="36" height="36" />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span className="fw-bold fs-14 text-dark">{ward.name}</span>
                                                        <span className="text-muted fs-12">ครองเตียง {occupancy.toFixed(2)}%</span>
                                                    </div>
                                                    <div className="fs-13 text-muted mb-1">
                                                        Admit {format(ward.admitnow)} / {format(ward.bedcount)} เตียง 
                                                        <span className="ms-1 fw-medium">
                                                            ({ward.bedcount - ward.admitnow <= 0 ? 'เต็ม' : `ว่าง ${ward.bedcount - ward.admitnow}`})
                                                        </span>
                                                    </div>
                                                    <ProgressBar now={occupancy} variant={variant} style={{ height: '6px' }} />
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                </Col>
                            );
                        })
                    ) : (
                        <Col xs={12} className="text-center py-5 text-muted">
                            <IconifyIcon icon="tabler:database-x" className="fs-48 mb-2 opacity-25" />
                            <p>ไม่พบข้อมูลตึกผู้ป่วย</p>
                        </Col>
                    )}
                </Row>
            </Col>
        </Row>
    );
};

export default IpdStatsSection;
