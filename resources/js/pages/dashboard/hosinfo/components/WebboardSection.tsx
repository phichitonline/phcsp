import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Modal, Form, Badge, Row, Col } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useForm, usePage, router, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface Post {
    id: number;
    user_id: number;
    title: string;
    content: string;
    category: 'question' | 'feedback' | 'problem';
    status: 'open' | 'answered';
    answer: string | null;
    answered_by: number | null;
    answered_at: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
        avatar?: string;
        role?: string;
    };
    responder?: {
        id: number;
        name: string;
        avatar?: string;
        role?: string;
    };
}

const WebboardSection = ({ posts = [] }: { posts?: Post[] }) => {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isLogged = !!user;
    const isAdmin = user?.role === 'admin';

    const [selectedCategory, setSelectedCategory] = useState<'all' | 'question' | 'feedback' | 'problem'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAnswerModal, setShowAnswerModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // Form สำหรับตั้งกระทู้ใหม่
    const {
        data: createData,
        setData: setCreateData,
        post: postCreate,
        processing: creating,
        reset: resetCreate,
        errors: createErrors,
        clearErrors: clearCreateErrors
    } = useForm({
        title: '',
        content: '',
        category: 'question' as 'question' | 'feedback' | 'problem',
    });

    // Form สำหรับตอบคำถามโดย Admin
    const {
        data: answerData,
        setData: setAnswerData,
        post: postAnswer,
        processing: answering,
        reset: resetAnswer,
        errors: answerErrors,
        clearErrors: clearAnswerErrors
    } = useForm({
        answer: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postCreate('/webboard/store', {
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreate();
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    text: 'ตั้งกระทู้ / ฝากข้อความเรียบร้อยแล้ว',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
        });
    };

    const handleAnswerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPost) return;
        postAnswer(`/webboard/${selectedPost.id}/answer`, {
            onSuccess: () => {
                setShowAnswerModal(false);
                resetAnswer();
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    text: 'บันทึกคำตอบเรียบร้อยแล้ว',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
        });
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'ยืนยันการลบกระทู้?',
            text: 'ข้อมูลกระทู้และคำตอบนี้จะถูกลบอย่างถาวร',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/webboard/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'ลบสำเร็จ',
                            text: 'กระทู้ถูกลบเรียบร้อยแล้ว',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    },
                });
            }
        });
    };

    const openAnswerModal = (post: Post) => {
        setSelectedPost(post);
        setAnswerData('answer', post.answer || '');
        clearAnswerErrors();
        setShowAnswerModal(true);
    };

    const getCategoryBadge = (cat: string) => {
        switch (cat) {
            case 'question':
                return <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 py-1 px-2">ถาม-ตอบทั่วไป</Badge>;
            case 'feedback':
                return <Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 py-1 px-2">ติชม / ข้อเสนอแนะ</Badge>;
            case 'problem':
                return <Badge bg="warning" className="bg-opacity-10 text-warning border border-warning border-opacity-25 py-1 px-2">แจ้งปัญหาการใช้งาน</Badge>;
            default:
                return null;
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredPosts = posts.filter((p) => {
        if (selectedCategory === 'all') return true;
        return p.category === selectedCategory;
    });

    return (
        <Card className="shadow-sm border-0 rounded-3 overflow-hidden mt-4 mb-4">
            <CardHeader className="bg-white p-3 p-md-4 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                    <h5 className="mb-1 fw-bold text-dark d-flex align-items-center">
                        <span className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3 p-2 me-2">
                            <IconifyIcon icon="tabler:messages" width={24} height={24} />
                        </span>
                        กระดานข่าวถามตอบ & แจ้งปัญหา (Q&A & Feedback Webboard)
                    </h5>
                    <p className="text-muted mb-0 fs-13">
                        ช่องทางสำหรับสมาชิกในการฝากข้อความ ติชม หรือแจ้งปัญหาการใช้งานเว็บไซต์ (สาธารณะสามารถเข้าชมได้)
                    </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                    {isLogged ? (
                        <Button
                            variant="primary"
                            className="d-inline-flex align-items-center px-3 py-2 fw-medium rounded-pill shadow-sm"
                            onClick={() => {
                                resetCreate();
                                clearCreateErrors();
                                setShowCreateModal(true);
                            }}
                        >
                            <IconifyIcon icon="tabler:plus" className="me-1" />
                            ตั้งกระทู้ / ฝากข้อความ
                        </Button>
                    ) : (
                        <Button
                            variant="outline-secondary"
                            className="d-inline-flex align-items-center px-3 py-2 fw-medium rounded-pill"
                            onClick={() => {
                                Swal.fire({
                                    icon: 'info',
                                    title: 'จำกัดสิทธิ์เฉพาะสมาชิก',
                                    text: 'กรุณาเข้าสู่ระบบก่อนตั้งคำถามหรือฝากข้อความในกระดานข่าวครับ',
                                    confirmButtonText: 'ตกลง',
                                });
                            }}
                        >
                            <IconifyIcon icon="tabler:lock" className="me-1" />
                            เข้าสู่ระบบเพื่อตั้งกระทู้
                        </Button>
                    )}
                </div>
            </CardHeader>

            <div className="bg-light-subtle px-3 px-md-4 py-2 border-bottom d-flex align-items-center flex-wrap gap-2">
                <span className="text-muted fs-13 fw-medium me-1">
                    <IconifyIcon icon="tabler:filter" className="me-1" />
                    หมวดหมู่:
                </span>
                <Button
                    size="sm"
                    variant={selectedCategory === 'all' ? 'dark' : 'outline-secondary'}
                    className="rounded-pill px-3 fs-13"
                    onClick={() => setSelectedCategory('all')}
                >
                    ทั้งหมด ({posts.length})
                </Button>
                <Button
                    size="sm"
                    variant={selectedCategory === 'question' ? 'primary' : 'outline-primary'}
                    className="rounded-pill px-3 fs-13"
                    onClick={() => setSelectedCategory('question')}
                >
                    คำถาม ({posts.filter((p) => p.category === 'question').length})
                </Button>
                <Button
                    size="sm"
                    variant={selectedCategory === 'feedback' ? 'info' : 'outline-info'}
                    className="rounded-pill px-3 fs-13"
                    onClick={() => setSelectedCategory('feedback')}
                >
                    ติชม/ข้อเสนอแนะ ({posts.filter((p) => p.category === 'feedback').length})
                </Button>
                <Button
                    size="sm"
                    variant={selectedCategory === 'problem' ? 'warning' : 'outline-warning'}
                    className="rounded-pill px-3 fs-13"
                    onClick={() => setSelectedCategory('problem')}
                >
                    แจ้งปัญหา ({posts.filter((p) => p.category === 'problem').length})
                </Button>
            </div>

            <CardBody className="p-3 p-md-4 bg-light bg-opacity-50">
                {filteredPosts.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="d-inline-flex align-items-center justify-content-center bg-secondary bg-opacity-10 text-secondary rounded-circle mb-3" style={{ width: '64px', height: '64px' }}>
                            <IconifyIcon icon="tabler:inbox" width={32} height={32} />
                        </div>
                        <h6 className="text-dark fw-bold mb-1">ยังไม่มีกระทู้ในหมวดหมู่นี้</h6>
                        <p className="text-muted fs-13 mb-0">คุณสามารถเป็นคนแรกที่ตั้งคำถามหรือฝากข้อความได้โดยกดปุ่ม "ตั้งกระทู้ / ฝากข้อความ"</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {filteredPosts.map((post) => {
                            const isOwner = user && user.id === post.user_id;
                            const canDelete = isAdmin || isOwner;

                            return (
                                <Card key={post.id} className="border shadow-sm rounded-3 overflow-hidden bg-white">
                                    <CardBody className="p-3 p-md-4">
                                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    className="d-flex align-items-center justify-content-center bg-primary text-white fw-bold rounded-circle flex-shrink-0"
                                                    style={{ width: '38px', height: '38px', fontSize: '15px' }}
                                                >
                                                    {post.user?.avatar ? (
                                                        <img src={`/storage/${post.user.avatar}`} alt="Avatar" className="w-100 h-100 rounded-circle object-fit-cover" />
                                                    ) : (
                                                        <span>{(post.user?.name || 'U').charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark fs-14 d-flex align-items-center gap-2">
                                                        <span>{post.user?.name || 'สมาชิกทั่วไป'}</span>
                                                        {post.user?.role === 'admin' && (
                                                            <Badge bg="danger" className="fs-10 px-1 py-0">ADMIN</Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-muted fs-12 d-flex align-items-center gap-1">
                                                        <IconifyIcon icon="tabler:clock" />
                                                        <span>{formatDate(post.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center gap-2">
                                                {getCategoryBadge(post.category)}
                                                {post.status === 'answered' ? (
                                                    <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 py-1 px-2 d-inline-flex align-items-center gap-1">
                                                        <IconifyIcon icon="tabler:check" />
                                                        ตอบแล้ว
                                                    </Badge>
                                                ) : (
                                                    <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 py-1 px-2 d-inline-flex align-items-center gap-1">
                                                        <IconifyIcon icon="tabler:clock-hour-4" />
                                                        รอคำตอบ
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <h6 className="fw-bold fs-16 text-dark mb-2">{post.title}</h6>
                                            <p className="text-secondary mb-0 fs-14" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                                                {post.content}
                                            </p>
                                        </div>

                                        {/* กล่องแสดงคำตอบจาก Admin */}
                                        {post.answer && (
                                            <div className="mt-3 p-3 bg-success bg-opacity-10 rounded-3 border-start border-4 border-success">
                                                <div className="d-flex align-items-center justify-content-between mb-1">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div
                                                            className="d-flex align-items-center justify-content-center bg-success text-white fw-bold rounded-circle flex-shrink-0"
                                                            style={{ width: '28px', height: '28px', fontSize: '12px' }}
                                                        >
                                                            <IconifyIcon icon="tabler:shield-check" width={16} height={16} />
                                                        </div>
                                                        <span className="fw-bold text-success fs-13">
                                                            ตอบกลับโดย: {post.responder?.name || 'ผู้ดูแลระบบ (Admin)'}
                                                        </span>
                                                    </div>
                                                    <span className="text-muted fs-11">
                                                        {post.answered_at ? formatDate(post.answered_at) : ''}
                                                    </span>
                                                </div>
                                                <p className="mb-0 mt-2 text-dark fs-13 ps-4" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                                                    {post.answer}
                                                </p>
                                            </div>
                                        )}

                                        {/* ปุ่มจัดการสำหรับ Admin หรือเจ้าของโพสต์ */}
                                        {(isAdmin || canDelete) && (
                                            <div className="mt-3 pt-2 border-top d-flex justify-content-end align-items-center gap-2">
                                                {isAdmin && (
                                                    <Button
                                                        size="sm"
                                                        variant={post.answer ? 'outline-success' : 'primary'}
                                                        className="d-inline-flex align-items-center px-3 py-1 rounded-pill fs-12"
                                                        onClick={() => openAnswerModal(post)}
                                                    >
                                                        <IconifyIcon icon="tabler:message-reply" className="me-1" />
                                                        {post.answer ? 'แก้ไขคำตอบ' : 'ตอบกลับ (Admin)'}
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        className="d-inline-flex align-items-center px-3 py-1 rounded-pill fs-12"
                                                        onClick={() => handleDelete(post.id)}
                                                    >
                                                        <IconifyIcon icon="tabler:trash" className="me-1" />
                                                        ลบกระทู้
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </CardBody>

            {/* Modal ตั้งกระทู้ใหม่ */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title as="h5" className="fw-bold text-dark d-flex align-items-center">
                        <IconifyIcon icon="tabler:pencil-plus" className="text-primary me-2" />
                        ตั้งกระทู้ / ฝากข้อความใหม่
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateSubmit}>
                    <Modal.Body className="p-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold fs-14">หมวดหมู่ <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                value={createData.category}
                                onChange={(e: any) => setCreateData('category', e.target.value)}
                                isInvalid={!!createErrors.category}
                            >
                                <option value="question">ถาม-ตอบทั่วไป (Question)</option>
                                <option value="feedback">ติชม / ข้อเสนอแนะ (Feedback)</option>
                                <option value="problem">แจ้งปัญหาการใช้งาน (Problem / Bug Report)</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{createErrors.category}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold fs-14">หัวเรื่อง / สรุปประเด็น <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="เช่น สอบถามการเพิ่มตัวชี้วัด, ขอเสนอแนะเรื่องสีเมนู..."
                                value={createData.title}
                                onChange={(e) => setCreateData('title', e.target.value)}
                                isInvalid={!!createErrors.title}
                                maxLength={255}
                            />
                            <Form.Control.Feedback type="invalid">{createErrors.title}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label className="fw-bold fs-14">รายละเอียดข้อความ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                placeholder="อธิบายรายละเอียดคำถาม ข้อเสนอแนะ หรือปัญหาที่พบให้ชัดเจน..."
                                value={createData.content}
                                onChange={(e) => setCreateData('content', e.target.value)}
                                isInvalid={!!createErrors.content}
                            />
                            <Form.Control.Feedback type="invalid">{createErrors.content}</Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="bg-light">
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={creating}>
                            ยกเลิก
                        </Button>
                        <Button variant="primary" type="submit" disabled={creating} className="d-inline-flex align-items-center">
                            {creating ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    กำลังบันทึก...
                                </>
                            ) : (
                                <>
                                    <IconifyIcon icon="tabler:send" className="me-1" />
                                    บันทึกข้อความ
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal ตอบกลับโดย Admin */}
            <Modal show={showAnswerModal} onHide={() => setShowAnswerModal(false)} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title as="h5" className="fw-bold text-success d-flex align-items-center">
                        <IconifyIcon icon="tabler:message-reply" className="me-2" />
                        ตอบกลับกระทู้โดยผู้ดูแลระบบ
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAnswerSubmit}>
                    <Modal.Body className="p-4">
                        {selectedPost && (
                            <div className="mb-3 p-3 bg-light rounded border">
                                <div className="fw-bold fs-13 text-dark mb-1">หัวข้อ: {selectedPost.title}</div>
                                <div className="text-muted fs-12 mb-0" style={{ whiteSpace: 'pre-line' }}>{selectedPost.content}</div>
                            </div>
                        )}

                        <Form.Group className="mb-2">
                            <Form.Label className="fw-bold fs-14">คำตอบจาก Admin <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={6}
                                placeholder="พิมพ์คำตอบ คำแนะนำ หรือการแก้ไขปัญหาสำหรับกระทู้นี้..."
                                value={answerData.answer}
                                onChange={(e) => setAnswerData('answer', e.target.value)}
                                isInvalid={!!answerErrors.answer}
                            />
                            <Form.Control.Feedback type="invalid">{answerErrors.answer}</Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="bg-light">
                        <Button variant="secondary" onClick={() => setShowAnswerModal(false)} disabled={answering}>
                            ยกเลิก
                        </Button>
                        <Button variant="success" type="submit" disabled={answering} className="d-inline-flex align-items-center">
                            {answering ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    กำลังบันทึกคำตอบ...
                                </>
                            ) : (
                                <>
                                    <IconifyIcon icon="tabler:check" className="me-1" />
                                    บันทึกคำตอบ
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Card>
    );
};

export default WebboardSection;
