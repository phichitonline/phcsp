import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import { Link } from '@inertiajs/react';

const StatCard = ({ title, count, subtitle, icon, bgClass, loading, href }: { title: string, count: string | number, subtitle: string, icon: string, bgClass: string, loading?: boolean, href?: string }) => {
    return (
        <Card className={`text-white overflow-hidden ${bgClass} border-0 shadow-sm mb-0`} style={{ borderRadius: '0' }}>
            <div className="p-3 position-relative">
                {loading ? (
                    <div className="d-flex align-items-center mb-1" style={{ height: '39px' }}>
                        <Spinner animation="border" size="sm" variant="light" />
                    </div>
                ) : (
                    <h3 className="text-white fw-bold mb-1 fs-32">{count}</h3>
                )}
                <h5 className="text-white mb-1 fs-16">{title}</h5>
                <p className="text-white-50 mb-0 fs-13">{subtitle}</p>
                <div className="position-absolute opacity-25" style={{ top: '5px', right: '10px' }}>
                    <IconifyIcon icon={icon} width="100" height="100" />
                </div>
            </div>
            <Link href={href || "#"} className="text-white-50 text-center py-1 d-block" style={{ backgroundColor: 'rgba(0,0,0,0.1)', fontSize: '12px', textDecoration: 'none' }}>
                รายละเอียด <IconifyIcon icon="tabler:arrow-right-circle" className="align-middle" />
            </Link>
        </Card>
    );
};

const TopStatsRow = ({ stats, loading }: { stats: any, loading?: boolean }) => {
    const format = (val: any) => new Intl.NumberFormat().format(val || 0);

    return (
        <Row className="g-3 mb-3">
            <Col xl={3} md={6}>
                <StatCard 
                    title="ผู้รับบริการวันนี้" 
                    count={format(stats?.opd?.pt_opd_today)} 
                    subtitle={`เดือนนี้ ${format(stats?.opd?.ptm_opd_hn)} คน / ${format(stats?.opd?.ptm_opd_vn)} ครั้ง`} 
                    icon="tabler:stethoscope" 
                    bgClass="bg-info" 
                    loading={loading}
                    href={route('hosinfo.opd')}
                />
            </Col>
            <Col xl={3} md={6}>
                <StatCard 
                    title="Admit วันนี้" 
                    count={format(stats?.ipd?.pt_ipd_today)} 
                    subtitle={`เดือนนี้ ${format(stats?.ipd?.ptm_ipd_hn)} คน / ${format(stats?.ipd?.ptm_ipd_an)} ครั้ง`} 
                    icon="tabler:bed-filled" 
                    bgClass="bg-danger" 
                    loading={loading}
                    href={route('hosinfo.ipd')}
                />
            </Col>
            <Col xl={3} md={6}>
                <StatCard 
                    title="อุบัติเหตุ วันนี้" 
                    count={format(stats?.er?.pt_er_today)}  
                    subtitle={`เดือนนี้ ${format(stats?.er?.ptm_er_hn)} คน / ${format(stats?.er?.ptm_er_vn)} ครั้ง`}
                    icon="tabler:car-crash" 
                    bgClass="bg-warning" 
                    loading={loading}
                    href={route('hosinfo.er')}
                />
            </Col>
            <Col xl={3} md={6}>
                <StatCard 
                    title="รับ / ส่งต่อ วันนี้" 
                    count={`${format(stats?.refer?.pt_refer_in_today)} / ${format(stats?.refer?.pt_refer_out_today)}`} 
                    subtitle={`เดือนนี้ รับ ${format(stats?.refer?.ptm_refer_in_vn)} / ส่ง ${format(stats?.refer?.ptm_refer_out_vn)} ครั้ง`} 
                    icon="tabler:ambulance" 
                    bgClass="bg-secondary" 
                    loading={loading}
                    href={route('hosinfo.refer')}
                />
            </Col>
        </Row>
    );
};

export default TopStatsRow;
