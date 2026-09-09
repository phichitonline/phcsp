import React from 'react';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Button, Card, CardBody, Col, Container, Row, Form } from 'react-bootstrap';
import { useForm, SubmitHandler } from 'react-hook-form';
import SelectFormInput from '@/components/form/SelectFormInput';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

interface IKpiFormInput {
    kpiCode: string;
    department: string;
    kpiNameTh: string;
    kpiNameEn: string;
    description: string;
    objective: string;
    formulaA: string;
    formulaB: string;
    formulaC: string;
    source: string;
    unit: string;
    interpretation: string;
    kpiType: string;
    dataAcquisition: string;
    reportingPeriod: string;
    baselineYear1: number;
    baselineYear2: number;
    baselineYear3: number;
    targetValue: number;
    targetDirection: string;
    weight: number;
    responsiblePerson: string;
    kpiTemplate: FileList;
}

interface Department {
    id: number;
    dp_name: string;
}

interface User {
    id: number;
    name: string;
}

interface ViewKpiPageProps {
    kpi: any; // We'll just use any for simplicity, or we can define a proper type
    departments: Department[];
    users: User[];
}

const ViewKpiPage = ({ kpi, departments = [], users = [] }: ViewKpiPageProps) => {
    const currentYearBE = new Date().getFullYear() + 543;
    const pastYears = [currentYearBE - 3, currentYearBE - 2, currentYearBE - 1];

    const departmentOptions = departments.map(dept => ({ value: dept.id.toString(), label: dept.dp_name }));
    const userOptions = users.map(user => ({ value: user.id.toString(), label: user.name }));

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<IKpiFormInput>({
        defaultValues: {
            kpiCode: kpi.kpi_code || '',
            department: kpi.department || '',
            kpiNameTh: kpi.kpi_name_th || '',
            kpiNameEn: kpi.kpi_name_en || '',
            description: kpi.description || '',
            objective: kpi.objective || '',
            formulaA: kpi.formula_a || '',
            formulaB: kpi.formula_b || '',
            formulaC: kpi.formula_c || '',
            source: kpi.source || '',
            unit: kpi.unit || '',
            interpretation: kpi.interpretation || '',
            kpiType: kpi.kpi_type || '',
            dataAcquisition: kpi.data_acquisition || '',
            reportingPeriod: kpi.reporting_period || '',
            baselineYear1: kpi.baseline_year_1 || '',
            baselineYear2: kpi.baseline_year_2 || '',
            baselineYear3: kpi.baseline_year_3 || '',
            targetValue: kpi.target_value || '',
            targetDirection: kpi.target_direction || 'up',
            weight: kpi.weight || '',
            responsiblePerson: kpi.responsible_person || ''
        }
    });



    const onSubmit: SubmitHandler<IKpiFormInput> = (data) => {
        // We omit kpiTemplate since we haven't handled file uploads in DB yet
        const { kpiTemplate, ...submitData } = data;
        
        router.put(`/kpis/${kpi.id}`, submitData as any, {
            onSuccess: () => {
                Swal.fire({
                    title: 'สำเร็จ!',
                    text: 'แก้ไขข้อมูลตัวชี้วัดเรียบร้อยแล้ว',
                    icon: 'success',
                    confirmButtonText: 'ตกลง'
                });
            },
            onError: (errors) => {
                console.error("Validation Errors:", errors);
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด!',
                    text: 'กรุณาตรวจสอบข้อมูลอีกครั้ง',
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                });
            }
        });
    };

    return (
        <MainLayout>
            <PageTitle title="View KPI" subTitle="KPI Management" />
            <div className="mt-4">
                <Form >
                    <Row>
                        <Col xs={12}>
                            <Card className="shadow-sm">
                                <Card.Header className="bg-light">
                                    <h5 className="card-title mb-0 text-primary">1. ข้อมูลทั่วไป (General Information)</h5>
                                </Card.Header>
                                <CardBody>
                                    <Row className="mb-3">
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium d-block">ประเภทตัวชี้วัด <span className="text-danger">*</span></Form.Label>
                                                <div className="d-flex gap-3 mt-2">
                                                    <Form.Check disabled type="radio" label="AP" value="AP" id="type-ap" {...register('kpiType')} />
                                                    <Form.Check disabled type="radio" label="QMP" value="QMP" id="type-qmp" {...register('kpiType')} />
                                                    <Form.Check disabled type="radio" label="QP" value="QP" id="type-qp" {...register('kpiType')} />
                                                    <Form.Check disabled type="radio" label="BSC" value="BSC" id="type-bsc" {...register('kpiType')} />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">หน่วยงาน <span className="text-danger">*</span></Form.Label>
                                                <SelectFormInput isDisabled={true} 
                                                    name="department" 
                                                    control={control} 
                                                    options={departmentOptions} 
                                                    placeholder="-- เลือกหน่วยงาน --"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">รหัสตัวชี้วัด</Form.Label>
                                                <Form.Control disabled type="text" {...register('kpiCode')} readOnly className="bg-light" />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">ชื่อตัวชี้วัด (ภาษาไทย) <span className="text-danger">*</span></Form.Label>
                                                <Form.Control disabled 
                                                    type="text" 
                                                    {...register('kpiNameTh', { required: 'กรุณากรอกชื่อตัวชี้วัด (ภาษาไทย)' })} 
                                                    isInvalid={!!errors.kpiNameTh} 
                                                    placeholder="เช่น อัตราการรอดชีวิตของผู้ป่วย..."
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.kpiNameTh?.message}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">ชื่อตัวชี้วัด (English)</Form.Label>
                                                <Form.Control disabled type="text" {...register('kpiNameEn')} placeholder="e.g. Survival Rate..." />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">คำอธิบายความหมายของตัวชี้วัด <span className="text-danger">*</span></Form.Label>
                                                <Form.Control disabled 
                                                    as="textarea" 
                                                    rows={3} 
                                                    {...register('description', { required: 'กรุณากรอกคำอธิบายความหมาย' })} 
                                                    isInvalid={!!errors.description}
                                                    placeholder="อธิบายรายละเอียดเกี่ยวกับตัวชี้วัดนี้..."
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">วัตถุประสงค์ <span className="text-danger">*</span></Form.Label>
                                                <Form.Control disabled 
                                                    type="text" 
                                                    {...register('objective', { required: 'กรุณากรอกวัตถุประสงค์' })} 
                                                    isInvalid={!!errors.objective}
                                                    placeholder="เพื่อวัดประสิทธิภาพในการ..."
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.objective?.message}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>

                            <Card className="mt-3 shadow-sm">
                                <Card.Header className="bg-light">
                                    <h5 className="card-title mb-0 text-primary">2. สูตรคำนวณและแหล่งที่มา (Calculation & Source)</h5>
                                </Card.Header>
                                <CardBody>
                                    <Row className="mb-3">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">สูตรคำนวณ A ตัวตั้ง</Form.Label>
                                                <Form.Control disabled as="textarea" rows={3} {...register('formulaA')} placeholder="ระบุตัวตั้งในการคำนวณ..." />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">สูตรคำนวณ B ตัวหาร</Form.Label>
                                                <Form.Control disabled as="textarea" rows={3} {...register('formulaB')} placeholder="ระบุตัวหารในการคำนวณ..." />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">สูตรคำนวณ C ตัวคูณ</Form.Label>
                                                <Form.Select disabled {...register('formulaC')}>
                                                    <option value="">-- เลือกตัวคูณ --</option>
                                                    <option value="ร้อยละ">ร้อยละ</option>
                                                    <option value="ต่อพัน">ต่อพัน</option>
                                                    <option value="ต่อแสน">ต่อแสน</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">แหล่งที่มาของข้อมูล</Form.Label>
                                                <Form.Control disabled type="text" {...register('source')} placeholder="เช่น ระบบ HOSxP, ฐานข้อมูล HR..." />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">หน่วยวัด <span className="text-danger">*</span></Form.Label>
                                                <Form.Control disabled 
                                                    type="text" 
                                                    {...register('unit', { required: 'กรุณากรอกหน่วยวัด' })} 
                                                    isInvalid={!!errors.unit}
                                                    placeholder="เช่น ร้อยละ, อัตราต่อแสนประชากร, วัน"
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.unit?.message}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">การแปรผล <span className="text-danger">*</span></Form.Label>
                                                <Form.Control disabled 
                                                    type="text" 
                                                    {...register('interpretation', { required: 'กรุณากรอกการแปรผล' })} 
                                                    isInvalid={!!errors.interpretation}
                                                    placeholder="เช่น มากกว่าเป้าหมายคือผ่าน, น้อยกว่าคือผ่าน"
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.interpretation?.message}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>

                            <Card className="mt-3 shadow-sm">
                                <Card.Header className="bg-light">
                                    <h5 className="card-title mb-0 text-primary">3. การจัดประเภทและระยะเวลา (Classification)</h5>
                                </Card.Header>
                                <CardBody>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-medium d-block">การได้มาของข้อมูล</Form.Label>
                                                <div className="d-flex gap-3 mt-2">
                                                    <Form.Check disabled type="radio" label="ประมวลผล" value="ประมวลผล" id="acq-process" {...register('dataAcquisition')} />
                                                    <Form.Check disabled type="radio" label="Key In" value="Key In" id="acq-keyin" {...register('dataAcquisition')} />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-medium d-block">ระยะเวลารายงาน</Form.Label>
                                                <div className="d-flex gap-3 mt-2">
                                                    <Form.Check disabled type="radio" label="รายปี" value="รายปี" id="period-year" {...register('reportingPeriod')} />
                                                    <Form.Check disabled type="radio" label="รายงวด" value="รายงวด" id="period-term" {...register('reportingPeriod')} />
                                                    <Form.Check disabled type="radio" label="รายเดือน" value="รายเดือน" id="period-month" {...register('reportingPeriod')} />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>

                            <Card className="mt-3 shadow-sm">
                                <Card.Header className="bg-light">
                                    <h5 className="card-title mb-0 text-primary">4. เกณฑ์และเป้าหมาย (Baseline & Targets)</h5>
                                </Card.Header>
                                <CardBody>
                                    <Row className="mb-3">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Baseline ปี {pastYears[0]}</Form.Label>
                                                <Form.Control disabled type="number" step="any" {...register('baselineYear1')} placeholder="ระบุค่า..." />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Baseline ปี {pastYears[1]}</Form.Label>
                                                <Form.Control disabled type="number" step="any" {...register('baselineYear2')} placeholder="ระบุค่า..." />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Baseline ปี {pastYears[2]}</Form.Label>
                                                <Form.Control disabled type="number" step="any" {...register('baselineYear3')} placeholder="ระบุค่า..." />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium text-primary">ทิศทางตัวชี้วัด</Form.Label>
                                                <Form.Select disabled {...register('targetDirection')}>
                                                    <option value="up">สูงดี (Higher is Better)</option>
                                                    <option value="down">ต่ำดี (Lower is Better)</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium text-primary">เป้าหมาย (ตามหน่วยวัด)</Form.Label>
                                                <Form.Control disabled type="number" step="any" {...register('targetValue')} placeholder="ระบุค่าเป้าหมาย..." />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">น้ำหนัก (คะแนน)</Form.Label>
                                                <Form.Control disabled type="number" step="any" {...register('weight')} placeholder="ระบุน้ำหนักคะแนน..." />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>

                            <Card className="mt-3 mb-4 shadow-sm">
                                <Card.Header className="bg-light">
                                    <h5 className="card-title mb-0 text-primary">5. ผู้รับผิดชอบและเอกสารแนบ (Responsibility & File)</h5>
                                </Card.Header>
                                <CardBody>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">กำหนดผู้รับผิดชอบ</Form.Label>
                                                <SelectFormInput isDisabled={true} 
                                                    name="responsiblePerson" 
                                                    control={control} 
                                                    options={userOptions} 
                                                    placeholder="-- เลือกผู้รับผิดชอบ --"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium d-block">ไฟล์ KPI Template (.pdf)</Form.Label>
                                                {kpi.template_file ? (
                                                    <a href={`/storage/${kpi.template_file}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger d-inline-flex align-items-center gap-2 mt-1">
                                                        <IconifyIcon icon="tabler:file-type-pdf" className="fs-20" /> คลิกเพื่อเปิดดูไฟล์ Template
                                                    </a>
                                                ) : (
                                                    <div className="text-muted mt-2 d-flex align-items-center gap-1">
                                                        <IconifyIcon icon="tabler:file-x" className="fs-18" /> ไม่มีข้อมูลไฟล์แนบ
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>

                            <div className="mb-5 d-flex justify-content-end gap-2">
                                <Button variant="secondary" type="button" onClick={() => window.history.back()} className="d-flex align-items-center gap-1 px-4">
                                    <IconifyIcon icon="tabler:x" className="fs-16" /> กลับ
                                </Button>
                                
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>
        </MainLayout>
    );
};

export default ViewKpiPage;
