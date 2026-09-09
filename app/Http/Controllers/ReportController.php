<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\EndUserReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\Services\JwtService;
use Exception;

class ReportController extends Controller
{
    /**
     * แสดงรายการรายงาน End Users ทั้งหมด
     */
    public function index(Request $request)
    {
        $departments = Department::orderBy('dp_name')->get();

        $query = EndUserReport::with('department')->orderBy('updated_at', 'desc');

        // หากผู้ใช้งานทั่วไป ไม่ใช่อัปเดต ให้เห็นเฉพาะรายงานที่เปิดใช้งาน (is_active = 1)
        if ($request->user() && $request->user()->role !== 'admin') {
            $query->active();
        }

        if ($request->has('department_id') && $request->department_id != '') {
            $query->where('department_id', $request->department_id);
        }

        $reports = $query->get();

        return Inertia::render('reports/index', [
            'departments' => $departments,
            'reports' => $reports,
            'currentDepartment' => $request->department_id ?? '',
        ]);
    }

    /**
     * หน้าฟอร์มเพิ่มรายงานใหม่ (Admin Only)
     */
    public function create(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return redirect()->route('end-user-reports.index')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }

        $departments = Department::orderBy('dp_name')->get();

        return Inertia::render('reports/create-report/index', [
            'departments' => $departments,
        ]);
    }

    /**
     * บันทึกรายงานใหม่ลงในฐานข้อมูล (Admin Only)
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return redirect()->route('end-user-reports.index')->with('error', 'คุณไม่มีสิทธิ์ทำการนี้');
        }

        $request->validate([
            'rep_name' => 'required|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'rep_sql_query' => 'required|string',
            'rep_description' => 'nullable|string',
            'is_active' => 'nullable|integer|in:0,1',
            'has_date_range' => 'nullable|integer|in:0,1',
            'default_date_range' => 'nullable|string|max:50',
            'has_department' => 'nullable|integer|in:0,1',
            'has_spclty' => 'nullable|integer|in:0,1',
        ]);

        $sql = trim($request->rep_sql_query);
        if (!$this->isReadOnlyQuery($sql)) {
            return back()->withErrors(['rep_sql_query' => 'อนุญาตให้ใช้เฉพาะคำสั่ง SELECT (Read-only) เท่านั้น เพื่อความปลอดภัยของฐานข้อมูล HOSxP'])->withInput();
        }

        EndUserReport::create([
            'rep_code' => $request->rep_code ?: 'REP-' . date('YmdHis'),
            'rep_name' => $request->rep_name,
            'department_id' => $request->department_id ?: null,
            'rep_sql_query' => $sql,
            'rep_description' => $request->rep_description ?: null,
            'is_active' => $request->has('is_active') ? $request->is_active : 1,
            'has_date_range' => $request->has('has_date_range') ? $request->has_date_range : 0,
            'default_date_range' => $request->default_date_range ?: null,
            'has_department' => $request->has('has_department') ? $request->has_department : 0,
            'has_spclty' => $request->has('has_spclty') ? $request->has_spclty : 0,
        ]);

        return redirect()->route('end-user-reports.index')->with('success', 'เพิ่มรายงาน End User ใหม่สำเร็จ');
    }

    /**
     * หน้าแก้ไขรายงาน (Admin Only)
     */
    public function edit(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin') {
            return redirect()->route('end-user-reports.index')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }

        $report = EndUserReport::findOrFail($id);
        $departments = Department::orderBy('dp_name')->get();

        return Inertia::render('reports/edit-report/index', [
            'report' => $report,
            'departments' => $departments,
        ]);
    }

    /**
     * อัปเดตข้อมูลรายงาน (Admin Only)
     */
    public function update(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin') {
            return redirect()->route('end-user-reports.index')->with('error', 'คุณไม่มีสิทธิ์ทำการนี้');
        }

        $report = EndUserReport::findOrFail($id);

        $request->validate([
            'rep_name' => 'required|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'rep_sql_query' => 'required|string',
            'rep_description' => 'nullable|string',
            'is_active' => 'nullable|integer|in:0,1',
            'has_date_range' => 'nullable|integer|in:0,1',
            'default_date_range' => 'nullable|string|max:50',
            'has_department' => 'nullable|integer|in:0,1',
            'has_spclty' => 'nullable|integer|in:0,1',
        ]);

        $sql = trim($request->rep_sql_query);
        if (!$this->isReadOnlyQuery($sql)) {
            return back()->withErrors(['rep_sql_query' => 'อนุญาตให้ใช้เฉพาะคำสั่ง SELECT (Read-only) เท่านั้น เพื่อความปลอดภัยของฐานข้อมูล HOSxP'])->withInput();
        }

        $report->update([
            'rep_name' => $request->rep_name,
            'department_id' => $request->department_id ?: null,
            'rep_sql_query' => $sql,
            'rep_description' => $request->rep_description ?: null,
            'is_active' => $request->has('is_active') ? $request->is_active : $report->is_active,
            'has_date_range' => $request->has('has_date_range') ? $request->has_date_range : $report->has_date_range,
            'default_date_range' => $request->default_date_range ?: null,
            'has_department' => $request->has('has_department') ? $request->has_department : $report->has_department,
            'has_spclty' => $request->has('has_spclty') ? $request->has_spclty : $report->has_spclty,
        ]);

        return redirect()->route('end-user-reports.index')->with('success', 'แก้ไขข้อมูลรายงานสำเร็จ');
    }

    /**
     * ลบรายงาน (Admin Only)
     */
    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin') {
            return redirect()->route('end-user-reports.index')->with('error', 'คุณไม่มีสิทธิ์ทำการนี้');
        }

        $report = EndUserReport::findOrFail($id);
        $report->delete();

        return redirect()->route('end-user-reports.index')->with('success', 'ลบรายงานสำเร็จ');
    }

    /**
     * หน้าแสดงรายละเอียดและรันผลลัพธ์รายงานจากฐานข้อมูล HOSxP (โหลดโครงสร้างหน้าเว็บอย่างรวดเร็ว)
     */
    public function viewReport(Request $request, string $id)
    {
        $report = EndUserReport::with('department')->findOrFail($id);

        // ตรวจสอบสถานะถ้าปิดการใช้งานและผู้ใช้ไม่ใช่ admin
        if ($report->is_active != 1 && $request->user()->role !== 'admin') {
            return redirect()->route('end-user-reports.index')->with('error', 'รายงานนี้ปิดการใช้งานชั่วคราว');
        }

        return Inertia::render('reports/view-report/index', [
            'report' => $report,
            'api_token' => JwtService::generateToken(),
            'external_api_url' => env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800')
        ]);
    }

    /**
     * API สำหรับประมวลผลคำสั่ง SQL รายงานแบบ Asynchronous โดยส่งคำสั่งไปให้ Python Backend API (hosxp-api-py314)
     */
    public function executeReport(Request $request, string $id)
    {
        $report = EndUserReport::findOrFail($id);

        if ($report->is_active != 1 && $request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'รายงานนี้ปิดการใช้งานชั่วคราว'
            ], 403);
        }

        if (!$this->isReadOnlyQuery($report->rep_sql_query)) {
            return response()->json([
                'success' => false,
                'message' => 'ไม่อนุญาตให้ประมวลผลคำสั่งที่ไม่อยู่ในเงื่อนไข Read-Only'
            ], 400);
        }

        try {
            $apiUrl = rtrim(env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800'), '/');
            $token = JwtService::generateToken();

            $params = [];
            if ($request->has('start_date')) {
                $params['start_date'] = $request->input('start_date');
                $params['end_date'] = $request->input('end_date', $params['start_date']);
            }
            if ($request->has('department')) {
                $params['department'] = $request->input('department');
            }
            if ($request->has('spclty')) {
                $params['spclty'] = $request->input('spclty');
            }
            if ($request->has('params') && is_array($request->input('params'))) {
                $params = array_merge($params, $request->input('params'));
            }

            $response = Http::withToken($token)
                ->connectTimeout(3)
                ->timeout(120)
                ->post("{$apiUrl}/api/v1/report/execute", [
                    'query' => $report->rep_sql_query,
                    'params' => (object)$params
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            $errorMsg = $response->json('detail') ?? $response->json('message') ?? 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ HOSxP API';
            return response()->json([
                'success' => false,
                'message' => $errorMsg
            ], $response->status());
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'ไม่สามารถเชื่อมต่อ HOSxP API ฝั่ง Backend ได้: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API สำหรับทดสอบรัน SQL Query เพื่อดูตารางตัวอย่าง (Preview) ก่อนบันทึกรายงาน (Admin Only) โดยส่งคำสั่งไปให้ Python Backend API
     */
    public function testQuery(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $sql = trim($request->input('query', ''));
        if (empty($sql)) {
            return response()->json(['success' => false, 'message' => 'กรุณาระบุคำสั่ง SQL Query ก่อนทำการทดสอบ'], 400);
        }

        if (!$this->isReadOnlyQuery($sql)) {
            return response()->json([
                'success' => false,
                'message' => 'อนุญาตให้ใช้เฉพาะคำสั่ง SELECT (Read-only) เท่านั้น ไม่อนุญาตคำสั่ง INSERT, UPDATE, DELETE, DROP หรือคำสั่งแก้ไขโครงสร้าง'
            ], 400);
        }

        try {
            $apiUrl = rtrim(env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800'), '/');
            $token = JwtService::generateToken();

            $params = [];
            if ($request->has('start_date')) {
                $params['start_date'] = $request->input('start_date');
                $params['end_date'] = $request->input('end_date', $params['start_date']);
            }
            if ($request->has('department')) {
                $params['department'] = $request->input('department');
            }
            if ($request->has('spclty')) {
                $params['spclty'] = $request->input('spclty');
            }
            if ($request->has('params') && is_array($request->input('params'))) {
                $params = array_merge($params, $request->input('params'));
            }

            $response = Http::withToken($token)
                ->connectTimeout(3)
                ->timeout(120)
                ->post("{$apiUrl}/api/v1/report/execute", [
                    'query' => $sql,
                    'params' => (object)$params
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $results = $data['results'] ?? [];
                $columns = $data['columns'] ?? (!empty($results) ? array_keys($results[0]) : []);
                $previewRows = array_slice($results, 0, 10); // แสดงตัวอย่าง 10 แถวแรก

                return response()->json([
                    'success' => true,
                    'columns' => $columns,
                    'preview_rows' => $previewRows,
                    'total_rows' => count($results),
                    'execution_time' => $data['execution_time'] ?? null
                ]);
            }

            $errorMsg = $response->json('detail') ?? $response->json('message') ?? 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ HOSxP API';
            return response()->json([
                'success' => false,
                'message' => $errorMsg
            ], $response->status());
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'ไม่สามารถเชื่อมต่อ HOSxP API ฝั่ง Backend ได้: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ดึงรายการตัวเลือก Master สำหรับตัวกรอง (kskdepartment, spclty) จาก Python Backend
     */
    public function getMasterFilters(Request $request)
    {
        try {
            $apiUrl = rtrim(env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800'), '/');
            $token = JwtService::generateToken();

            $kskRes = Http::withToken($token)->connectTimeout(3)->timeout(10)->get("{$apiUrl}/api/v1/report/master/kskdepartment");
            $spcltyRes = Http::withToken($token)->connectTimeout(3)->timeout(10)->get("{$apiUrl}/api/v1/report/master/spclty");

            return response()->json([
                'success' => true,
                'kskdepartment' => $kskRes->successful() ? ($kskRes->json('data') ?? []) : [],
                'spclty' => $spcltyRes->successful() ? ($spcltyRes->json('data') ?? []) : [],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'ไม่สามารถเชื่อมต่อ HOSxP API ฝั่ง Backend เพื่อดึงข้อมูล Master Filters ได้: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ตรวจสอบว่าคำสั่ง SQL เป็น Read-Only (SELECT) เท่านั้น
     */
    private function isReadOnlyQuery(string $sql): bool
    {
        $sqlClean = trim($sql);
        // ต้องเริ่มต้นด้วยคำว่า SELECT
        if (!preg_match('/^SELECT\s+/i', $sqlClean) && !preg_match('/^\(\s*SELECT\s+/i', $sqlClean) && !preg_match('/^WITH\s+/i', $sqlClean)) {
            return false;
        }

        // ต้องไม่มีคำสั่งที่ปรับเปลี่ยนข้อมูลหรือโครงสร้าง
        $forbiddenKeywords = [
            'INSERT\s+INTO', 'UPDATE\s+', 'DELETE\s+FROM', 'DROP\s+TABLE', 'DROP\s+DATABASE',
            'ALTER\s+TABLE', 'CREATE\s+TABLE', 'CREATE\s+DATABASE', 'TRUNCATE\s+', 'REPLACE\s+INTO',
            'GRANT\s+', 'REVOKE\s+', 'EXEC\s+', 'EXECUTE\s+'
        ];

        foreach ($forbiddenKeywords as $pattern) {
            if (preg_match('/\b' . $pattern . '\b/i', $sqlClean)) {
                return false;
            }
        }

        return true;
    }
}
