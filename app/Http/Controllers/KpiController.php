<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Kpi;
use App\Models\Department;
use App\Models\User;

class KpiController extends Controller
{
    public function kpis(Request $request)
    {
        $user = auth()->user();
        $userRole = $user->role ?? 'guest';
        $userDeptId = $user->department_id;

        // ปีงบประมาณไทย: เริ่ม 1 ต.ค. - 30 ก.ย.
        $month = (int)date('n');
        $currentFiscalYear = (int)date('Y') + ($month >= 10 ? 544 : 543);

        // ใช้ปีจาก query param > session > default
        if ($request->has('year')) {
            $year = $request->query('year');
            session(['kpi_selected_year' => (int)$year]);
        } else {
            $year = session('kpi_selected_year', $currentFiscalYear);
        }

        // ใช้หน่วยงานจาก query param > session > default
        if ($request->has('department')) {
            $selectedDepartment = $request->query('department', '');
            session(['kpi_selected_department' => $selectedDepartment]);
        } else {
            $selectedDepartment = session('kpi_selected_department', '');
        }

        // ค่าเริ่มต้น: ถ้าไม่มีการเลือกหน่วยงาน ให้ใช้หน่วยงานของผู้ใช้ (ถ้ามี)
        if (!$selectedDepartment && $userDeptId) {
            $selectedDepartment = (string)$userDeptId;
        }

        // ข้อบังคับ: ถ้าไม่ใช่ Admin ให้เลือกได้เฉพาะหน่วยงานตัวเอง หรือหน่วยงานประเภทคล่อมสายงาน (dp_type=2) เท่านั้น
        if ($userRole !== 'admin' && $userDeptId && $selectedDepartment) {
            $isAllowed = Department::where('id', $selectedDepartment)
                ->where(function($q) use ($userDeptId) {
                    $q->where('id', $userDeptId)->orWhere('dp_type', 2);
                })->exists();
            
            if (!$isAllowed) {
                $selectedDepartment = (string)$userDeptId;
            }
        }

        $departmentsQuery = Department::active()->orderBy('dp_name');
        
        // กรองรายการหน่วยงานในช่องเลือก (Dropdown)
        // ถ้าไม่ใช่ Admin: ให้เห็นหน่วยงานตัวเอง + หน่วยงานที่เป็น "คล่อมสายงาน" (dp_type = 2)
        if ($userRole !== 'admin' && $userDeptId) {
            $departmentsQuery->where(function($q) use ($userDeptId) {
                $q->where('id', $userDeptId)->orWhere('dp_type', 2);
            });
        }
        
        $departments = $departmentsQuery->get(['id', 'dp_name']);

        // ดึงข้อมูล KPI ตามปีและหน่วยงานที่เลือก
        $query = Kpi::where('kpi_year', $year);
        
        if ($selectedDepartment) {
            $query->where('department', $selectedDepartment);
        } elseif ($userRole !== 'admin' && $userDeptId) {
            // ค่าเริ่มต้น: แสดงเฉพาะหน่วยงานตัวเอง
            $query->where('department', $userDeptId);
        }

        $kpis = $query->with('responsibleUser')->get();

        // คำนวณสถิติจาก kpi_status จริง (นับเฉพาะที่เปิดใช้งาน)
        $activeKpis = $kpis->where('is_active', 'active');

        $calcStats = function ($collection) {
            $total  = $collection->count();
            $passed = $collection->where('kpi_status', 'pass')->count();
            $failed = $total - $passed; // รวม fail และ null (ยังไม่ประเมิน)
            return ['total' => $total, 'passed' => $passed, 'failed' => $failed];
        };

        $stats = [
            'total' => $calcStats($activeKpis),
            'ap'    => $calcStats($activeKpis->where('kpi_type', 'AP')),
            'qmp'   => $calcStats($activeKpis->where('kpi_type', 'QMP')),
            'qp'    => $calcStats($activeKpis->where('kpi_type', 'QP')),
        ];

        return Inertia::render('kpis/index', [
            'kpis' => $kpis,
            'stats' => $stats,
            'currentYear' => (int)$year,
            'departments' => $departments,
            'selectedDepartment' => $selectedDepartment,
            'userRole' => $userRole,
        ]);
    }

    public function kpisDetails(Request $request)
    {
        $id = $request->query('id');
        $kpi = Kpi::findOrFail($id);
        $departments = Department::active()
            ->orderBy('dp_name')
            ->get(['id', 'dp_name']);
        $usersQuery = User::where('is_active', true)->orderBy('name');
        if (auth()->user()->role !== 'admin' && auth()->user()->department_id) {
            $usersQuery->where('department_id', auth()->user()->department_id);
        }
        $users = $usersQuery->get(['id', 'name']);

        return Inertia::render('kpis/view-kpi/index', [
            'kpi' => $kpi,
            'departments' => $departments,
            'users' => $users
        ]);
    }

    public function kpisAdd()
    {
        $departments = Department::active()
            ->orderBy('dp_name')
            ->get(['id', 'dp_name']);
            
        $usersQuery = User::where('is_active', true)->orderBy('name');
        if (auth()->user()->role !== 'admin' && auth()->user()->department_id) {
            $usersQuery->where('department_id', auth()->user()->department_id);
        }
        $users = $usersQuery->get(['id', 'name']);
        
        // Auto-increment KPI Code
        $lastKpi = Kpi::orderBy('id', 'desc')->first();
        $nextKpiCode = 'KPI-001';
        if ($lastKpi && $lastKpi->kpi_code) {
            // Assuming format KPI-XXX
            $parts = explode('-', $lastKpi->kpi_code);
            if (count($parts) > 1 && is_numeric($parts[1])) {
                $num = intval($parts[1]) + 1;
                $nextKpiCode = 'KPI-' . str_pad($num, 3, '0', STR_PAD_LEFT);
            }
        }

        return Inertia::render('kpis/create-kpi/index', [
            'departments' => $departments,
            'nextKpiCode' => $nextKpiCode,
            'users' => $users
        ]);
    }

    public function kpisStore(Request $request)
    {
        $data = $request->validate([
            'kpiCode' => 'required',
            'department' => 'nullable',
            'kpiNameTh' => 'required',
            'kpiNameEn' => 'nullable',
            'description' => 'nullable',
            'objective' => 'nullable',
            'formulaA' => 'nullable',
            'formulaB' => 'nullable',
            'formulaC' => 'nullable',
            'source' => 'nullable',
            'unit' => 'nullable',
            'interpretation' => 'nullable',
            'kpiType' => 'nullable',
            'dataAcquisition' => 'nullable',
            'reportingPeriod' => 'nullable',
            'baselineYear1' => 'nullable|numeric',
            'baselineYear2' => 'nullable|numeric',
            'baselineYear3' => 'nullable|numeric',
            'targetValue' => 'nullable|numeric',
            'targetDirection' => 'nullable|string',
            'weight' => 'nullable|numeric',
            'responsiblePerson' => 'nullable',
            'isActive' => 'nullable|string',
            'publishLevel' => 'nullable|string',
            'kpiTemplate' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $dbData = [
            'kpi_code' => $data['kpiCode'],
            'department' => $data['department'] ?? null,
            'kpi_name_th' => $data['kpiNameTh'],
            'kpi_name_en' => $data['kpiNameEn'] ?? null,
            'description' => $data['description'] ?? null,
            'objective' => $data['objective'] ?? null,
            'formula_a' => $data['formulaA'] ?? null,
            'formula_b' => $data['formulaB'] ?? null,
            'formula_c' => $data['formulaC'] ?? null,
            'source' => $data['source'] ?? null,
            'unit' => $data['unit'] ?? null,
            'interpretation' => $data['interpretation'] ?? null,
            'kpi_type' => $data['kpiType'] ?? null,
            'data_acquisition' => $data['dataAcquisition'] ?? null,
            'reporting_period' => $data['reportingPeriod'] ?? null,
            'baseline_year_1' => $data['baselineYear1'] ?? null,
            'baseline_year_2' => $data['baselineYear2'] ?? null,
            'baseline_year_3' => $data['baselineYear3'] ?? null,
            'target_value' => $data['targetValue'] ?? null,
            'target_direction' => $data['targetDirection'] ?? 'up',
            'weight' => $data['weight'] ?? null,
            'responsible_person' => $data['responsiblePerson'] ?? null,
            'is_active' => $data['isActive'] ?? 'active',
            'publish_level' => $data['publishLevel'] ?? 'level4',
            'kpi_year' => date('Y') + 543,
        ];

        // อัปโหลดไฟล์ PDF Template
        if ($request->hasFile('kpiTemplate')) {
            $dbData['template_file'] = $request->file('kpiTemplate')->store('kpi-templates', 'public');
        }

        Kpi::create($dbData);

        return redirect($this->kpiRedirectUrl());
    }

    public function kpisEdit($id)
    {
        $kpi = Kpi::findOrFail($id);
        $departments = Department::active()
            ->orderBy('dp_name')
            ->get(['id', 'dp_name']);
            
        $usersQuery = User::where('is_active', true)->orderBy('name');
        if (auth()->user()->role !== 'admin' && auth()->user()->department_id) {
            $usersQuery->where('department_id', auth()->user()->department_id);
        }
        $users = $usersQuery->get(['id', 'name']);
            
        return Inertia::render('kpis/edit-kpi/index', [
            'kpi' => $kpi,
            'departments' => $departments,
            'users' => $users
        ]);
    }

    public function generateCode(Request $request)
    {
        $kpiType = $request->query('kpi_type', 'AP');
        $departmentId = $request->query('department_id', '0');

        $prefix = "{$kpiType}-{$departmentId}";

        $lastKpi = Kpi::where('kpi_code', 'like', "{$prefix}-%")
            ->orderBy('kpi_code', 'desc')
            ->first();

        $nextNumber = 1;
        if ($lastKpi && $lastKpi->kpi_code) {
            $parts = explode('-', $lastKpi->kpi_code);
            // AP-708-01 -> parts[0] = AP, parts[1] = 708, parts[2] = 01
            if (count($parts) >= 3 && is_numeric(end($parts))) {
                $nextNumber = intval(end($parts)) + 1;
            }
        }

        $nextKpiCode = "{$prefix}-" . str_pad($nextNumber, 2, '0', STR_PAD_LEFT);

        return response()->json(['code' => $nextKpiCode]);
    }

    public function kpisUpdate(Request $request, $id)
    {
        $kpi = Kpi::findOrFail($id);

        $data = $request->validate([
            'kpiCode' => 'required',
            'department' => 'nullable',
            'kpiNameTh' => 'required',
            'kpiNameEn' => 'nullable',
            'description' => 'nullable',
            'objective' => 'nullable',
            'formulaA' => 'nullable',
            'formulaB' => 'nullable',
            'formulaC' => 'nullable',
            'source' => 'nullable',
            'unit' => 'nullable',
            'interpretation' => 'nullable',
            'kpiType' => 'nullable',
            'dataAcquisition' => 'nullable',
            'reportingPeriod' => 'nullable',
            'baselineYear1' => 'nullable|numeric',
            'baselineYear2' => 'nullable|numeric',
            'baselineYear3' => 'nullable|numeric',
            'targetValue' => 'nullable|numeric',
            'targetDirection' => 'nullable|string',
            'weight' => 'nullable|numeric',
            'responsiblePerson' => 'nullable',
            'isActive' => 'nullable|string',
            'publishLevel' => 'nullable|string',
            'kpiTemplate' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $kpi->update([
            'kpi_code' => $data['kpiCode'],
            'department' => $data['department'] ?? null,
            'kpi_name_th' => $data['kpiNameTh'],
            'kpi_name_en' => $data['kpiNameEn'] ?? null,
            'description' => $data['description'] ?? null,
            'objective' => $data['objective'] ?? null,
            'formula_a' => $data['formulaA'] ?? null,
            'formula_b' => $data['formulaB'] ?? null,
            'formula_c' => $data['formulaC'] ?? null,
            'source' => $data['source'] ?? null,
            'unit' => $data['unit'] ?? null,
            'interpretation' => $data['interpretation'] ?? null,
            'kpi_type' => $data['kpiType'] ?? null,
            'data_acquisition' => $data['dataAcquisition'] ?? null,
            'reporting_period' => $data['reportingPeriod'] ?? null,
            'baseline_year_1' => $data['baselineYear1'] ?? null,
            'baseline_year_2' => $data['baselineYear2'] ?? null,
            'baseline_year_3' => $data['baselineYear3'] ?? null,
            'target_value' => $data['targetValue'] ?? null,
            'target_direction' => $data['targetDirection'] ?? 'up',
            'weight' => $data['weight'] ?? null,
            'responsible_person' => $data['responsiblePerson'] ?? null,
            'is_active' => $data['isActive'] ?? 'active',
            'publish_level' => $data['publishLevel'] ?? 'level4',
        ]);

        // อัปโหลดไฟล์ PDF Template
        if ($request->hasFile('kpiTemplate')) {
            // ลบไฟล์เก่า
            if ($kpi->template_file && \Illuminate\Support\Facades\Storage::disk('public')->exists($kpi->template_file)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($kpi->template_file);
            }
            $kpi->template_file = $request->file('kpiTemplate')->store('kpi-templates', 'public');
            $kpi->save();
        }

        return redirect($this->kpiRedirectUrl());
    }

    public function kpisDestroy($id)
    {
        $kpi = Kpi::findOrFail($id);
        $kpi->delete();
        return redirect($this->kpiRedirectUrl());
    }

    private function kpiRedirectUrl(): string
    {
        $year = session('kpi_selected_year', date('Y') + 543);
        $dept = session('kpi_selected_department', '');
        $url = '/kpis?year=' . $year;
        if ($dept) {
            $url .= '&department=' . $dept;
        }
        return $url;
    }

    public function updateMonthlyData(Request $request, $id)
    {
        $kpi = Kpi::findOrFail($id);
        
        $rules = [];
        for ($i = 1; $i <= 12; $i++) {
            $rules["m$i"] = 'nullable|numeric';
            $rules["m{$i}_status"] = 'nullable|string';
        }
        for ($i = 1; $i <= 4; $i++) {
            $rules["q$i"] = 'nullable|numeric';
            $rules["q{$i}_status"] = 'nullable|string';
        }
        $rules['annual_result'] = 'nullable|numeric';
        $rules['annual_status'] = 'nullable|string';
        $rules['note'] = 'nullable|string';
        
        $data = $request->validate($rules);

        // หาค่าจากเดือนสุดท้าย หรืองวดสุดท้ายที่มีการกรอกข้อมูล
        $latestValue = null;

        // ตรวจสอบรายเดือน (m12 ย้อนกลับไป m1)
        for ($i = 12; $i >= 1; $i--) {
            if (isset($data["m$i"]) && ($data["m$i"] !== null && $data["m$i"] !== '')) {
                $latestValue = $data["m$i"];
                break;
            }
        }

        // ถ้าไม่มีรายเดือน ให้ตรวจสอบรายงวด (q4 ย้อนกลับไป q1)
        if ($latestValue === null) {
            for ($i = 4; $i >= 1; $i--) {
                if (isset($data["q$i"]) && ($data["q$i"] !== null && $data["q$i"] !== '')) {
                    $latestValue = $data["q$i"];
                    break;
                }
            }
        }

        // ถ้ายังไม่มี ให้ตรวจสอบผลรวมรายปี
        if ($latestValue === null) {
            if (isset($data['annual_result']) && ($data['annual_result'] !== null && $data['annual_result'] !== '')) {
                $latestValue = $data['annual_result'];
            }
        }

        // อัปเดตฟิลด์ result และ kpi_status
        if ($latestValue !== null) {
            $data['result'] = $latestValue;
            
            $target = $kpi->target_value;
            $direction = $kpi->target_direction ?? 'up';
            
            if ($target !== null) {
                if ($direction === 'up') {
                    $data['kpi_status'] = ($latestValue >= $target) ? 'pass' : 'fail';
                } else {
                    $data['kpi_status'] = ($latestValue <= $target) ? 'pass' : 'fail';
                }
            }
        }
        
        $currentUser = auth()->user();
        
        // กฎการเข้าถึง:
        // 1. Admin หรือ Head แก้ไขได้ทุกคน
        // 2. ถ้า KPI ยังไม่ระบุผู้รับผิดชอบ ทุกคนแก้ไขได้
        // 3. ถ้าระบุผู้รับผิดชอบแล้ว เฉพาะผู้รับผิดชอบเท่านั้นที่แก้ไขได้
        $isResponsible = $kpi->responsible_person == $currentUser->id;
        $isAdminOrHead = in_array($currentUser->role, ['admin', 'head']);
        $noOneAssigned = empty($kpi->responsible_person);

        if (!$isAdminOrHead && !$noOneAssigned && !$isResponsible) {
            return redirect()->back()->with('error', 'คุณไม่มีสิทธิ์บันทึกข้อมูลผลงานของตัวชี้วัดนี้');
        }

        $kpi->update($data);
        
        return redirect()->back()->with('success', 'บันทึกข้อมูลผลงานเรียบร้อยแล้ว');
    }

    public function monitoring(Request $request)
    {
        $user = auth()->user();
        $userRole = $user->role ?? 'guest';
        $userDeptId = $user->department_id;

        // ปีงบประมาณไทย
        $month = (int)date('n');
        $currentFiscalYear = (int)date('Y') + ($month >= 10 ? 544 : 543);
        
        // ใช้ปีจาก query param > session > default
        if ($request->has('year')) {
            $year = $request->query('year');
            session(['kpi_selected_year' => (int)$year]);
        } else {
            $year = session('kpi_selected_year', $currentFiscalYear);
        }

        // ใช้หน่วยงานจาก query param > session > default
        if ($request->has('department')) {
            $selectedDepartment = $request->query('department', '');
            session(['kpi_monitoring_selected_dept' => $selectedDepartment]);
        } else {
            $selectedDepartment = session('kpi_monitoring_selected_dept', '');
        }

        // ค่าเริ่มต้น: ถ้าไม่ใช่ Admin และไม่มีการเลือกหน่วยงาน ให้ใช้หน่วยงานตัวเอง
        if (!$selectedDepartment && $userRole !== 'admin' && $userDeptId) {
            $selectedDepartment = (string)$userDeptId;
        }

        $departmentsQuery = Department::active()->orderBy('dp_name');
        if ($userRole !== 'admin' && $userDeptId) {
            $departmentsQuery->where(function($q) use ($userDeptId) {
                $q->where('id', $userDeptId)->orWhere('dp_type', 2);
            });
        }
        $departments = $departmentsQuery->get(['id', 'dp_name']);

        $query = Kpi::where('kpi_year', $year);
        if ($selectedDepartment) {
            $query->where('department', $selectedDepartment);
        } elseif ($userRole !== 'admin' && $userDeptId) {
            $query->where('department', $userDeptId);
        }

        $kpis = $query->with('responsibleUser')->get();

        return Inertia::render('kpis/monitoring/index', [
            'kpis' => $kpis,
            'currentYear' => (int)$year,
            'departments' => $departments,
            'selectedDepartment' => $selectedDepartment,
        ]);
    }

    public function summary(Request $request)
    {
        $user = auth()->user();
        $userRole = $user->role ?? 'guest';
        // $userDeptId = $user->department_id;

        // ปีงบประมาณไทย
        $month = (int)date('n');
        $currentFiscalYear = (int)date('Y') + ($month >= 10 ? 544 : 543);
        $year = $request->query('year', session('kpi_selected_year', $currentFiscalYear));
        if ($request->has('year')) {
            session(['kpi_selected_year' => $year]);
        }

        // 1. ดึงหน่วยงานที่ต้องการแสดง (แสดงทั้งหมดทุกหน่วยงาน)
        $departments = \App\Models\Department::active()->get();

        // 2. ดึง KPI ทั้งหมดในปีที่เลือก พร้อมข้อมูลประเภทหน่วยงาน
        $allKpis = \App\Models\Kpi::select('kpis.*', 'departments.dp_type')
            ->join('departments', 'kpis.department', '=', 'departments.id')
            ->where('kpis.kpi_year', $year)
            ->where('kpis.is_active', 'active')
            ->get();

        // 3. คำนวณ Cockpit Stats (ภาพรวม)
        $calcStats = function ($collection) {
            $total  = $collection->count();
            $passed = $collection->where('kpi_status', 'pass')->count();
            $failed = $collection->where('kpi_status', 'fail')->count();
            return ['total' => $total, 'passed' => $passed, 'failed' => $failed];
        };

        $stats = [
            'total' => $calcStats($allKpis),
            'ap'    => $calcStats($allKpis->where('kpi_type', 'AP')),
            'qmp'   => $calcStats($allKpis->where('kpi_type', 'QMP')),
            'qp'    => $calcStats($allKpis->where('kpi_type', 'QP')),
        ];

        // 4. สรุปรายหน่วยงาน
        $summaryData = $departments->map(function ($dept) use ($allKpis) {
            $deptKpis = $allKpis->where('department', $dept->id);
            $total = $deptKpis->count();
            $passed = $deptKpis->where('kpi_status', 'pass')->count();
            $failed = $deptKpis->where('kpi_status', 'fail')->count();
            $performance = $total > 0 ? round(($passed / $total) * 100, 2) : 0;

            return [
                'id' => $dept->id,
                'name' => $dept->dp_name,
                'type' => $dept->dp_type,
                'total' => $total,
                'passed' => $passed,
                'failed' => $failed,
                'performance' => $performance
            ];
        })->values();

        return Inertia::render('kpis/summary/index', [
            'summary' => $summaryData,
            'stats' => $stats,
            'kpis' => $allKpis, // ส่ง KPI ทั้งหมดไปให้ Frontend คำนวณ Cockpit ใหม่เมื่อกรอง
            'currentYear' => (int)$year
        ]);
    }

}
