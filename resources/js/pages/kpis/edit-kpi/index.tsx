import React from 'react';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import MainLayout from '@/layouts/MainLayout';
import { Button, Card, CardBody, Col, Container, Row, Form, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { useForm, SubmitHandler } from 'react-hook-form';
import SelectFormInput from '@/components/form/SelectFormInput';
import { router, usePage } from '@inertiajs/react';
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
    isActive: string;
    publishLevel: string;
}

interface Department {
    id: number;
    dp_name: string;
}

interface User {
    id: number;
    name: string;
}

interface EditKpiPageProps {
    kpi: any; // We'll just use any for simplicity, or we can define a proper type
    departments: Department[];
    users: User[];
}

const EditKpiPage = ({ kpi, departments = [], users = [] }: EditKpiPageProps) => {
    const { auth } = usePage().props as any;
    const canEditMaster = auth.user?.role === 'admin' || auth.user?.role === 'head';
    
    const currentYearBE = new Date().getFullYear() + 543;
    const pastYears = [currentYearBE - 3, currentYearBE - 2, currentYearBE - 1];

    const departmentOptions = departments.map(dept => ({ value: dept.id.toString(), label: dept.dp_name }));
    const userOptions = [
        { value: '', label: '-- ไม่กำหนด --' },
        ...users.map(user => ({ value: user.id.toString(), label: user.name }))
    ];

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
            responsiblePerson: kpi.responsible_person || '',
            isActive: kpi.is_active || 'active',
            publishLevel: kpi.publish_level || 'level4'
        }
    });



    const onSubmit: SubmitHandler<IKpiFormInput> = (data) => {
        const submitData: any = { ...data, _method: 'PUT' };
        // แนบไฟล์ PDF Template ถ้ามี
        if (data.kpiTemplate && data.kpiTemplate.length > 0) {
            submitData.kpiTemplate = data.kpiTemplate[0];
        } else {
            delete submitData.kpiTemplate;
        }
        
        router.post(`/kpis/${kpi.id}`, submitData, {
            forceFormData: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'สำเร็จ!',
                    text: 'แก้ไขข้อมูลตัวชี้วัดเรียบร้อยแล้ว',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true
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
            <PageTitle title="Edit KPI" subTitle="KPI Management" />
            <div className="mt-4">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                        <Col xs={12}>
                            <Card className="shadow-sm">
                                <Card.Header className="bg-light">
                                    <h5 className="card-title mb-0 text-primary">1. ข้อมูลทั่วไป (General Information)</h5>
                                </Card.Header>
                                <CardBody>
                                    <Row className="mb-4">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold d-block text-danger mb-2">
                                                    <IconifyIcon icon="tabler:check" className="me-1 align-middle" />
                                                    สถานะการใช้งาน
                                                </Form.Label>
                                                <div className="mt-2">
                                                    <ButtonGroup>
                                                        <ToggleButton
                                                            id="status-active"
                                                            type="radio"
                                                            variant={watch('isActive') === 'active' ? 'success' : 'outline-success'}
                                                            name="isActive"
                                                            value="active"
                                                            checked={watch('isActive') === 'active'}
                                                            onChange={(e) => setValue('isActive', e.currentTarget.value, { shouldValidate: true })}
                                                        >
                                                            <span className="fw-medium d-flex align-items-center"><IconifyIcon icon="tabler:check" className="me-1" />เปิดใช้งาน</span>
                                                        </ToggleButton>
                                                        <ToggleButton
                                                            id="status-inactive"
                                                            type="radio"
                                                            variant={watch('isActive') === 'inactive' ? 'danger' : 'outline-danger'}
                                                            name="isActive"
                                                            value="inactive"
                                                            checked={watch('isActive') === 'inactive'}
                                                            onChange={(e) => setValue('isActive', e.currentTarget.value, { shouldValidate: true })}
                                                        >
                                                            <span className="fw-medium d-flex align-items-center"><IconifyIcon icon="tabler:ban" className="me-1" />ปิดใช้งาน</span>
                                                        </ToggleButton>
                                                    </ButtonGroup>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={8}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold d-block text-danger mb-2">
                                                    <IconifyIcon icon="tabler:check" className="me-1 align-middle" />
                                                    การเผยแพร่
                                                </Form.Label>
                                                <div>
                                                    <ButtonGroup>
                                                        <ToggleButton id="publish-1" type="radio" variant={watch('publishLevel') === 'level1' ? 'danger' : 'outline-danger'} name="publishLevel" value="level1" checked={watch('publishLevel') === 'level1'} onChange={(e) => setValue('publishLevel', e.currentTarget.value, { shouldValidate: true })}>ผู้ดูแลระบบ</ToggleButton>
                                                        <ToggleButton id="publish-2" type="radio" variant={watch('publishLevel') === 'level2' ? 'warning' : 'outline-warning'} name="publishLevel" value="level2" checked={watch('publishLevel') === 'level2'} onChange={(e) => setValue('publishLevel', e.currentTarget.value, { shouldValidate: true })}>หัวหน้า</ToggleButton>
                                                        <ToggleButton id="publish-3" type="radio" variant={watch('publishLevel') === 'level3' ? 'primary' : 'outline-primary'} name="publishLevel" value="level3" checked={watch('publishLevel') === 'level3'} onChange={(e) => setValue('publishLevel', e.currentTarget.value, { shouldValidate: true })}>เจ้าหน้าที่</ToggleButton>
                                                        <ToggleButton id="publish-4" type="radio" variant={watch('publishLevel') === 'level4' ? 'success' : 'outline-success'} name="publishLevel" value="level4" checked={watch('publishLevel') === 'level4'} onChange={(e) => setValue('publishLevel', e.currentTarget.value, { shouldValidate: true })}>สาธารณะ</ToggleButton>
                                                    </ButtonGroup>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <hr className="text-muted opacity-25 mb-4" />

                                    <Row className="mb-3">
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium d-block">ประเภทตัวชี้วัด <span className="text-danger">*</span></Form.Label>
                                                <div className="mt-2">
                                                    <ButtonGroup>
                                                        <ToggleButton disabled={!canEditMaster} id="type-ap" type="radio" variant={watch('kpiType') === 'AP' ? 'primary' : 'outline-primary'} name="kpiType" value="AP" checked={watch('kpiType') === 'AP'} onChange={(e) => setValue('kpiType', e.currentTarget.value, { shouldValidate: true })}>AP</ToggleButton>
                                                        <ToggleButton disabled={!canEditMaster} id="type-qmp" type="radio" variant={watch('kpiType') === 'QMP' ? 'primary' : 'outline-primary'} name="kpiType" value="QMP" checked={watch('kpiType') === 'QMP'} onChange={(e) => setValue('kpiType', e.currentTarget.value, { shouldValidate: true })}>QMP</ToggleButton>
                                                        <ToggleButton disabled={!canEditMaster} id="type-qp" type="radio" variant={watch('kpiType') === 'QP' ? 'primary' : 'outline-primary'} name="kpiType" value="QP" checked={watch('kpiType') === 'QP'} onChange={(e) => setValue('kpiType', e.currentTarget.value, { shouldValidate: true })}>QP</ToggleButton>
                                                    </ButtonGroup>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">หน่วยงาน <span className="text-danger">*</span></Form.Label>
                                                <SelectFormInput 
                                                    name="department" 
                                                    control={control} 
                                                    options={departmentOptions} 
                                                    placeholder="-- เลือกหน่วยงาน --"
                                                    isDisabled={!canEditMaster}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">รหัสตัวชี้วัด</Form.Label>
                                                <Form.Control type="text" {...register('kpiCode')} readOnly className="bg-light" />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">ชื่อตัวชี้วัด (ภาษาไทย) <span className="text-danger">*</span></Form.Label>
                                                <Form.Control 
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
                                                <Form.Control type="text" {...register('kpiNameEn')} placeholder="e.g. Survival Rate..." />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">คำอธิบายความหมายของตัวชี้วัด <span className="text-danger">*</span></Form.Label>
                                                <Form.Control 
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
                                                <Form.Control 
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
                                                <Form.Control as="textarea" rows={3} {...register('formulaA')} placeholder="ระบุตัวตั้งในการคำนวณ..." />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">สูตรคำนวณ B ตัวหาร</Form.Label>
                                                <Form.Control as="textarea" rows={3} {...register('formulaB')} placeholder="ระบุตัวหารในการคำนวณ..." />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">สูตรคำนวณ C ตัวคูณ</Form.Label>
                                                <Form.Select {...register('formulaC')}>
                                                    <option value="">-- เลือกตัวคูณ --</option>
                                                    <option value="1">หนึ่ง (1)</option>
                                                    <option value="100">ร้อยละ (100)</option>
                                                    <option value="1000">ต่อพัน (1,000)</option>
                                                    <option value="100000">ต่อแสน (100,000)</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">แหล่งที่มาของข้อมูล</Form.Label>
                                                <Form.Control type="text" {...register('source')} placeholder="เช่น ระบบ HOSxP, ฐานข้อมูล HR..." />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">หน่วยวัด <span className="text-danger">*</span></Form.Label>
                                                <Form.Control 
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
                                                <Form.Control 
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
                                                <div className="mt-2">
                                                    <ButtonGroup>
                                                        <ToggleButton id="acq-process" type="radio" variant={watch('dataAcquisition') === 'ประมวลผล' ? 'primary' : 'outline-primary'} name="dataAcquisition" value="ประมวลผล" checked={watch('dataAcquisition') === 'ประมวลผล'} onChange={(e) => setValue('dataAcquisition', e.currentTarget.value, { shouldValidate: true })}>ประมวลผล</ToggleButton>
                                                        <ToggleButton id="acq-keyin" type="radio" variant={watch('dataAcquisition') === 'Key In' ? 'primary' : 'outline-primary'} name="dataAcquisition" value="Key In" checked={watch('dataAcquisition') === 'Key In'} onChange={(e) => setValue('dataAcquisition', e.currentTarget.value, { shouldValidate: true })}>Key In</ToggleButton>
                                                    </ButtonGroup>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-medium d-block">ระยะเวลารายงาน</Form.Label>
                                                <div className="mt-2">
                                                    <ButtonGroup>
                                                        <ToggleButton id="period-year" type="radio" variant={watch('reportingPeriod') === 'รายปี' ? 'primary' : 'outline-primary'} name="reportingPeriod" value="รายปี" checked={watch('reportingPeriod') === 'รายปี'} onChange={(e) => setValue('reportingPeriod', e.currentTarget.value, { shouldValidate: true })}>รายปี</ToggleButton>
                                                        <ToggleButton id="period-term" type="radio" variant={watch('reportingPeriod') === 'รายงวด' ? 'primary' : 'outline-primary'} name="reportingPeriod" value="รายงวด" checked={watch('reportingPeriod') === 'รายงวด'} onChange={(e) => setValue('reportingPeriod', e.currentTarget.value, { shouldValidate: true })}>รายงวด</ToggleButton>
                                                        <ToggleButton id="period-month" type="radio" variant={watch('reportingPeriod') === 'รายเดือน' ? 'primary' : 'outline-primary'} name="reportingPeriod" value="รายเดือน" checked={watch('reportingPeriod') === 'รายเดือน'} onChange={(e) => setValue('reportingPeriod', e.currentTarget.value, { shouldValidate: true })}>รายเดือน</ToggleButton>
                                                    </ButtonGroup>
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
                                                <Form.Control type="number" step="any" {...register('baselineYear1')} placeholder="ระบุค่า..." />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Baseline ปี {pastYears[1]}</Form.Label>
                                                <Form.Control type="number" step="any" {...register('baselineYear2')} placeholder="ระบุค่า..." />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Baseline ปี {pastYears[2]}</Form.Label>
                                                <Form.Control type="number" step="any" {...register('baselineYear3')} placeholder="ระบุค่า..." />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium text-primary d-block">ทิศทางตัวชี้วัด</Form.Label>
                                                <div className="mt-2">
                                                    <ButtonGroup>
                                                        <ToggleButton
                                                            id="dir-up"
                                                            type="radio"
                                                            variant={watch('targetDirection') === 'up' ? 'primary' : 'outline-primary'}
                                                            name="targetDirection"
                                                            value="up"
                                                            checked={watch('targetDirection') === 'up'}
                                                            onChange={(e) => setValue('targetDirection', e.currentTarget.value, { shouldValidate: true })}
                                                        >
                                                            <IconifyIcon icon="tabler:arrow-up" className="me-1" />
                                                            สูงดี
                                                        </ToggleButton>
                                                        <ToggleButton
                                                            id="dir-down"
                                                            type="radio"
                                                            variant={watch('targetDirection') === 'down' ? 'danger' : 'outline-danger'}
                                                            name="targetDirection"
                                                            value="down"
                                                            checked={watch('targetDirection') === 'down'}
                                                            onChange={(e) => setValue('targetDirection', e.currentTarget.value, { shouldValidate: true })}
                                                        >
                                                            <IconifyIcon icon="tabler:arrow-down" className="me-1" />
                                                            ต่ำดี
                                                        </ToggleButton>
                                                    </ButtonGroup>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium text-primary">เป้าหมาย (ตามหน่วยวัด) <span className="text-danger">*</span></Form.Label>
                                                <Form.Control 
                                                    type="number" 
                                                    step="any" 
                                                    {...register('targetValue', { required: 'กรุณากรอกค่าเป้าหมาย' })} 
                                                    isInvalid={!!errors.targetValue}
                                                    placeholder="ระบุค่าเป้าหมาย..." 
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.targetValue?.message}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">น้ำหนัก (คะแนน)</Form.Label>
                                                <Form.Control type="number" step="any" {...register('weight')} placeholder="ระบุน้ำหนักคะแนน..." />
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
                                                <SelectFormInput 
                                                    name="responsiblePerson" 
                                                    control={control} 
                                                    options={userOptions} 
                                                    placeholder="-- เลือกผู้รับผิดชอบ --"
                                                    isDisabled={!canEditMaster}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">แนบไฟล์ KPI Template (.pdf)</Form.Label>
                                                
                                                {kpi.template_file && (
                                                    <div className="mb-2 p-2 border rounded bg-light-subtle d-flex align-items-center justify-content-between">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <IconifyIcon icon="tabler:file-type-pdf" className="text-danger fs-20" />
                                                            <a href={`/storage/${kpi.template_file}`} target="_blank" rel="noopener noreferrer" className="text-primary fw-medium text-decoration-underline">
                                                                ดูไฟล์ Template ปัจจุบัน
                                                            </a>
                                                        </div>
                                                        <span className="badge bg-success-subtle text-success">มีไฟล์แล้ว</span>
                                                    </div>
                                                )}

                                                <Form.Control type="file" accept=".pdf" {...register('kpiTemplate')} />
                                                <Form.Text className="text-muted">
                                                    {kpi.template_file ? 'เลือกไฟล์ใหม่หากต้องการเปลี่ยน (รองรับ .pdf เท่านั้น)' : 'รองรับเฉพาะไฟล์ .pdf เท่านั้น'}
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>

                            <div className="mb-5 d-flex justify-content-end gap-2">
                                <Button variant="secondary" type="button" onClick={() => window.history.back()} className="d-flex align-items-center gap-1 px-4">
                                    <IconifyIcon icon="tabler:x" className="fs-16" /> ยกเลิก
                                </Button>
                                <Button variant="success" type="submit" className="d-flex align-items-center gap-1 px-4">
                                    <IconifyIcon icon="tabler:device-floppy" className="fs-16" /> บันทึกข้อมูล
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>
        </MainLayout>
    );
};

export default EditKpiPage;
