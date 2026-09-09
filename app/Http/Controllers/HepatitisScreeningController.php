<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\HepatitisScreening;
use App\Imports\HepatitisScreeningImport;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class HepatitisScreeningController extends Controller
{
    public function index()
    {
        $screenings = HepatitisScreening::orderBy('id', 'desc')->get();
        $hospitals = \App\Models\Department::where('dp_type', 3)
            ->where('dp_status', 1)
            ->orderBy('dp_name', 'asc')
            ->get();
        return Inertia::render('hepatitis/index', [
            'screenings' => $screenings,
            'hospitals' => $hospitals
        ]);
    }

    public function create()
    {
        return Inertia::render('hepatitis/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
        ]);
        
        HepatitisScreening::create($request->except('_token', '_method'));

        return redirect()->route('hepatitis.index')->with('success', 'บันทึกข้อมูลสำเร็จ');
    }

    public function edit($id)
    {
        $screening = HepatitisScreening::findOrFail($id);
        return Inertia::render('hepatitis/edit', [
            'screening' => $screening
        ]);
    }

    public function update(Request $request, $id)
    {
        $screening = HepatitisScreening::findOrFail($id);
        $screening->update($request->except('_token', '_method'));
        
        return redirect()->route('hepatitis.index')->with('success', 'แก้ไขข้อมูลสำเร็จ');
    }

    public function destroy($id)
    {
        $screening = HepatitisScreening::findOrFail($id);
        $screening->delete();
        
        return redirect()->route('hepatitis.index')->with('success', 'ลบข้อมูลสำเร็จ');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        Excel::import(new HepatitisScreeningImport, $request->file('file'));

        return redirect()->route('hepatitis.index')->with('success', 'นำเข้าข้อมูลสำเร็จ');
    }

    public function summary()
    {
        $total = HepatitisScreening::count();
        // Check for positive results, typically checking if field has a value like 'บวก', 'Positive', '+', etc.
        // Assuming any non-empty value that's not '-' means positive or we just count all non-empty for now
        $hbvPositive = HepatitisScreening::whereNotNull('hbv_positive')
            ->where('hbv_positive', '!=', '')
            ->where('hbv_positive', '!=', '-')
            ->count();
            
        $hcvPositive = HepatitisScreening::whereNotNull('hcv_positive')
            ->where('hcv_positive', '!=', '')
            ->where('hcv_positive', '!=', '-')
            ->count();

        // Entered treatment
        $enteredTreatment = HepatitisScreening::where('hospital_entry_status', 'มา')->count();
        
        $screenings = HepatitisScreening::all();
        
        return Inertia::render('hepatitis/summary/index', [
            'stats' => [
                'total' => $total,
                'hbvPositive' => $hbvPositive,
                'hcvPositive' => $hcvPositive,
                'enteredTreatment' => $enteredTreatment
            ],
            'screenings' => $screenings
        ]);
    }
}
