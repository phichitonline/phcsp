<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use App\Models\Kpi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }

        $departments = Department::with('users')->orderBy('dp_name')->get();
        
        return Inertia::render('departments/index', [
            'departments' => $departments
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }

        return Inertia::render('departments/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }

        $request->validate([
            'dp_name' => 'required|string|max:255|unique:departments,dp_name',
            'dp_status' => 'required|integer|in:0,1',
            'dp_type' => 'required|integer|in:1,2,3',
        ]);

        Department::create([
            'dp_name' => $request->dp_name,
            'dp_status' => $request->dp_status,
            'dp_type' => $request->dp_type,
        ]);

        return redirect()->route('departments.index')->with('success', 'เพิ่มหน่วยงานสำเร็จ');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }

        $department = Department::findOrFail($id);

        return Inertia::render('departments/edit', [
            'department' => $department
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }

        $department = Department::findOrFail($id);

        $request->validate([
            'dp_name' => 'required|string|max:255|unique:departments,dp_name,' . $department->id,
            'dp_status' => 'required|integer|in:0,1',
            'dp_type' => 'required|integer|in:1,2,3',
        ]);

        $department->update([
            'dp_name' => $request->dp_name,
            'dp_status' => $request->dp_status,
            'dp_type' => $request->dp_type,
        ]);

        return redirect()->route('departments.index')->with('success', 'แก้ไขข้อมูลหน่วยงานสำเร็จ');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }

        $department = Department::findOrFail($id);

        // ตรวจสอบว่ามีผู้ใช้งานผูกกับแผนกนี้อยู่หรือไม่
        if (User::where('department_id', $department->id)->exists()) {
            return redirect()->route('departments.index')->with('error', 'ไม่สามารถลบได้ เนื่องจากมีผู้ใช้งานผูกกับหน่วยงานนี้อยู่');
        }

        // ตรวจสอบว่ามี KPI ผูกกับแผนกนี้อยู่หรือไม่
        if (Kpi::where('department', $department->id)->exists()) {
            return redirect()->route('departments.index')->with('error', 'ไม่สามารถลบได้ เนื่องจากมีตัวชี้วัดผูกกับหน่วยงานนี้อยู่');
        }

        $department->delete();

        return redirect()->route('departments.index')->with('success', 'ลบหน่วยงานสำเร็จ');
    }
}
