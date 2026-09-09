<?php

namespace App\Http\Controllers;

use App\Models\StandardDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StandardDocumentController extends Controller
{
    /**
     * Store a newly created standard document in storage.
     */
    public function store(Request $request)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถจัดการเอกสารมาตรฐานได้');
        }

        $request->validate([
            'thesis_category_id' => 'nullable|exists:thesis_categories,id',
            'item_no' => 'required|integer|min:1',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'required' => 'boolean',
        ], [
            'item_no.required' => 'กรุณาระบุลำดับที่ของเอกสาร',
            'item_no.integer' => 'ลำดับที่ต้องเป็นตัวเลขจำนวนเต็ม',
            'item_no.min' => 'ลำดับที่ต้องมีค่าตั้งแต่ 1 ขึ้นไป',
            'title.required' => 'กรุณาระบุชื่อเอกสารมาตรฐาน',
        ]);

        StandardDocument::create([
            'thesis_category_id' => $request->thesis_category_id,
            'item_no' => $request->item_no,
            'title' => $request->title,
            'description' => $request->description,
            'required' => $request->boolean('required', false),
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'เพิ่มรายการเอกสารมาตรฐานเรียบร้อยแล้ว');
    }

    /**
     * Update the specified standard document in storage.
     */
    public function update(Request $request, $id)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถจัดการเอกสารมาตรฐานได้');
        }

        $standardDoc = StandardDocument::findOrFail($id);

        $request->validate([
            'thesis_category_id' => 'nullable|exists:thesis_categories,id',
            'item_no' => 'required|integer|min:1',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'required' => 'boolean',
        ], [
            'item_no.required' => 'กรุณาระบุลำดับที่ของเอกสาร',
            'item_no.integer' => 'ลำดับที่ต้องเป็นตัวเลขจำนวนเต็ม',
            'item_no.min' => 'ลำดับที่ต้องมีค่าตั้งแต่ 1 ขึ้นไป',
            'title.required' => 'กรุณาระบุชื่อเอกสารมาตรฐาน',
        ]);

        $standardDoc->update([
            'thesis_category_id' => $request->thesis_category_id,
            'item_no' => $request->item_no,
            'title' => $request->title,
            'description' => $request->description,
            'required' => $request->boolean('required', false),
        ]);

        return redirect()->back()->with('success', 'ปรับปรุงรายการเอกสารมาตรฐานเรียบร้อยแล้ว');
    }

    /**
     * Remove the specified standard document from storage.
     */
    public function destroy($id)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถจัดการเอกสารมาตรฐานได้');
        }

        $standardDoc = StandardDocument::findOrFail($id);
        $standardDoc->delete();

        return redirect()->back()->with('success', 'ลบรายการเอกสารมาตรฐานเรียบร้อยแล้ว');
    }

    /**
     * Batch reorder standard documents.
     */
    public function reorder(Request $request)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถจัดการเอกสารมาตรฐานได้');
        }

        $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|integer|exists:standard_documents,id',
            'orders.*.item_no' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->orders as $item) {
                StandardDocument::where('id', $item['id'])->update(['item_no' => $item['item_no']]);
            }
        });

        return redirect()->back()->with('success', 'บันทึกการจัดเรียงลำดับเอกสารเรียบร้อยแล้ว');
    }
}
