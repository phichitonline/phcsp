import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import { Link } from '@inertiajs/react';

const SmallStatCard = ({ title, today, month, icon, bgClass, loading, href }: { title: string, today: string | number, month: string, icon: string, bgClass: string, loading?: boolean, href?: string }) => {
    return (
        <Link href={href || "#"} className="text-decoration-none">
            <Card className="border-0 shadow-sm mb-0 overflow-hidden" style={{ borderRadius: '0' }}>
                <div className="d-flex h-100">
                    <div className={`${bgClass} d-flex align-items-center justify-content-center`} style={{ width: '80px' }}>
                        <IconifyIcon icon={icon} className="text-white" width="48" height="48" />
                    </div>
                    <div className="p-2 px-3 d-flex flex-column justify-content-center bg-white flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                            {loading ? (
                                <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                            ) : (
                                <span className="fw-bold fs-16 me-2 text-dark">วันนี้ {today}</span>
                            )}
                            <span className="text-muted fs-12">{title}</span>
                        </div>
                        <div className="text-muted fs-12">{month}</div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

const MiddleStatsGrid = ({ stats, loading }: { stats: any, loading?: boolean }) => {
    const format = (val: any) => new Intl.NumberFormat().format(val || 0);

    return (
        <Row className="g-3">
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="ทันตกรรม" 
                    today={format(stats?.dent?.pt_dent_today)} 
                    month={`เดือนนี้ ${format(stats?.dent?.ptm_dent_hn)} คน / ${format(stats?.dent?.ptm_dent_vn)} ครั้ง`}
                    icon="mdi:tooth" 
                    bgClass="bg-warning" 
                    loading={loading}
                    href={route('hosinfo.dent')}
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="ผู้ป่วยผ่าตัด" 
                    today={format(stats?.or?.pt_or_today)}
                    month={`เดือนนี้ ${format(stats?.or?.ptm_or_hn)} คน / ${format(stats?.or?.ptm_or_vn)} ครั้ง`} 
                    icon="tabler:heartbeat" 
                    bgClass="bg-danger" 
                    loading={loading}
                    href={route('hosinfo.or')}
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="กายภาพบำบัด" 
                    today={format(stats?.phy?.pt_phy_today)} 
                    month={`เดือนนี้ ${format(stats?.phy?.ptm_phy_hn)} คน / ${format(stats?.phy?.ptm_phy_vn)} ครั้ง`} 
                    icon="tabler:wheelchair" 
                    bgClass="bg-success" 
                    loading={loading}
                    href={route('hosinfo.pts')}
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="แพทย์แผนไทย" 
                    today={format(stats?.ttm?.pt_ttm_today)} 
                    month={`เดือนนี้ ${format(stats?.ttm?.ptm_ttm_hn)} คน / ${format(stats?.ttm?.ptm_ttm_vn)} ครั้ง`} 
                    icon="tabler:massage" 
                    bgClass="bg-success" 
                    loading={loading}
                    href={route('hosinfo.ppt')}
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="X-RAY" 
                    today={format(stats?.xray?.pt_xray_today)} 
                    month={`เดือนนี้ ${format(stats?.xray?.ptm_xray_hn)} คน / ${format(stats?.xray?.ptm_xray_vn)} ครั้ง`} 
                    icon="mdi:radiology-box" 
                    bgClass="bg-info" 
                    loading={loading}
                    href={route('hosinfo.xray')}
                />
            </Col>

            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="ยาเสพติด" 
                    today={format(stats?.drug?.pt_drug_today)} 
                    month={`เดือนนี้ ${format(stats?.drug?.ptm_drug_hn)} คน / ${format(stats?.drug?.ptm_drug_vn)} ครั้ง`} 
                    icon="tabler:leaf" 
                    bgClass="bg-secondary" 
                    loading={loading}
                    href={route('hosinfo.drug')}
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="จิตเวช" 
                    today={format(stats?.psy?.pt_psy_today)} 
                    month={`เดือนนี้ ${format(stats?.psy?.ptm_psy_hn)} คน / ${format(stats?.psy?.ptm_psy_vn)} ครั้ง`} 
                    icon="tabler:brain" 
                    bgClass="bg-primary" 
                    loading={loading}
                    href={route('hosinfo.psy')}
                />
            </Col>
            <Col xl={3} md={6}>
                <SmallStatCard 
                    title="ผู้รับบริการ PCC" 
                    today={format(stats?.opd?.ptm_pcc_today)} 
                    month={`เดือนนี้ ${format(stats?.opd?.ptm_pcc_hn)} คน / ${format(stats?.opd?.ptm_pcc_vn)} ครั้ง`} 
                    icon="tabler:stethoscope" 
                    bgClass="bg-primary" 
                    loading={loading}
                    href={route('hosinfo.pcc')}
                />
            </Col>

        </Row>
    );
};

export default MiddleStatsGrid;
