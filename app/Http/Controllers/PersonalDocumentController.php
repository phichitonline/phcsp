<?php

namespace App\Http\Controllers;

use App\Models\PersonalDocument;
use App\Models\StandardDocument;
use App\Models\ThesisCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PersonalDocumentController extends Controller
{
    /**
     * Display a listing of personal documents and upload form.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user && $user->role === 'admin';

        $targetUser = $user;
        if ($isAdmin && $request->filled('user_id')) {
            $foundUser = \App\Models\User::with('studentProfile')->find($request->user_id);
            if ($foundUser) {
                $targetUser = $foundUser;
            }
        }

        $query = PersonalDocument::with('user:id,name,email')->orderBy('item_no', 'asc');

        // หากเป็นผู้ใช้ทั่วไป หรือ admin กำลังดูของนักศึกษาคนใดคนหนึ่ง ให้กรองตาม user_id
        if (!$isAdmin || $request->filled('user_id')) {
            $query->where('user_id', $targetUser->id);
        }

        $documents = $query->get();
        $standardDocuments = StandardDocument::with('thesisCategory')
            ->where('is_active', true)
            ->orderBy('item_no', 'asc')
            ->get();
        $thesisCategories = ThesisCategory::orderBy('category_no', 'asc')->get();

        return Inertia::render('personal-documents/index', [
            'documents' => $documents,
            'standard_documents' => $standardDocuments,
            'thesis_categories' => $thesisCategories,
            'auth_user' => $user,
            'target_user' => $targetUser,
            'is_admin' => $isAdmin,
        ]);
    }

    /**
     * Store a newly uploaded personal document.
     */
    public function store(Request $request)
    {
        // ตรวจสอบกรณีไฟล์ขนาดใหญ่เกิน php.ini upload_max_filesize
        if ($request->hasFile('document_file')) {
            $uploadedFile = $request->file('document_file');
            if ($uploadedFile && !$uploadedFile->isValid()) {
                $errorMsg = match ($uploadedFile->getError()) {
                    UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'ไฟล์มีขนาดใหญ่เกินกว่าขีดจำกัดของระบบ (สูงสุด 10 MB)',
                    UPLOAD_ERR_PARTIAL => 'การอัปโหลดไฟล์ไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง',
                    UPLOAD_ERR_NO_FILE => 'ไม่พบไฟล์ที่อัปโหลด',
                    default => 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์ (' . $uploadedFile->getErrorMessage() . ')',
                };
                return redirect()->back()->withErrors(['document_file' => $errorMsg]);
            }
        }

        $request->validate([
            'item_no' => 'required|integer|min:1',
            'title' => 'required|string|max:255',
            'uploader_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'document_file' => 'required|file|mimes:pdf|max:10240', // max 10MB PDF
        ], [
            'item_no.required' => 'กรุณาระบุลำดับเอกสาร',
            'title.required' => 'กรุณาระบุชื่อเอกสารประจำตัว',
            'uploader_name.required' => 'กรุณาระบุชื่อเจ้าของเอกสาร / ผู้อัปโหลด',
            'document_file.required' => 'กรุณาเลือกไฟล์เอกสาร PDF',
            'document_file.mimes' => 'ไฟล์ที่อัปโหลดต้องเป็นไฟล์ PDF เท่านั้น',
            'document_file.max' => 'ขนาดไฟล์ต้องไม่เกิน 10 MB',
        ]);

        // ตรวจสอบว่ามีรายการเอกสารมาตรฐานนี้ในฐานข้อมูลหรือไม่
        $standardDoc = StandardDocument::where('item_no', $request->item_no)
            ->where('is_active', true)
            ->first();

        if (!$standardDoc) {
            return redirect()->back()->withErrors([
                'document_file' => 'ไม่พบรายการเอกสารมาตรฐานลำดับที่ ' . $request->item_no . ' ในระบบ'
            ]);
        }

        $user = auth()->user();
        $isAdmin = $user && $user->role === 'admin';
        $targetUserId = ($isAdmin && $request->filled('user_id'))
            ? (int)$request->user_id
            : $user->id;

        // ตรวจสอบการปลดล็อกเรียงลำดับตามหมวดเท่านั้น (ยกเลิกตรวจสอบตามลำดับหัวข้อ):
        // หากเอกสารสังกัดหมวดวิทยานิพนธ์ หมวดก่อนหน้าทั้งหมดจะต้องผ่านเกณฑ์ (satisfied) แล้ว
        if ($standardDoc->thesis_category_id) {
            $currentCat = ThesisCategory::find($standardDoc->thesis_category_id);
            if ($currentCat) {
                $precedingCats = ThesisCategory::where('category_no', '<', $currentCat->category_no)
                    ->orderBy('category_no', 'asc')
                    ->get();

                foreach ($precedingCats as $prevCat) {
                    if (!$this->isCategorySatisfied($prevCat, $targetUserId)) {
                        return redirect()->back()->withErrors([
                            'document_file' => 'ไม่สามารถอัปโหลดได้ เนื่องจากหมวดที่ ' . $prevCat->category_no . ' (' . $prevCat->name . ') ยังไม่ผ่านเกณฑ์การอัปโหลดเอกสาร'
                        ]);
                    }
                }
            }
        }

        $file = $request->file('document_file');
        $originalName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $filePath = $file->store('personal-documents', 'public');

        // หากมีเอกสารในลำดับนี้อยู่แล้ว ให้ลบไฟล์เดิมและอัปเดตข้อมูลใหม่
        $existing = PersonalDocument::where('user_id', $targetUserId)
            ->where('item_no', $request->item_no)
            ->first();

        if ($existing) {
            if ($existing->file_path && Storage::disk('public')->exists($existing->file_path)) {
                Storage::disk('public')->delete($existing->file_path);
            }
            $existing->update([
                'title' => $request->title,
                'description' => $request->description,
                'file_name' => $originalName,
                'file_path' => $filePath,
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'uploader_name' => $request->uploader_name,
            ]);
        } else {
            PersonalDocument::create([
                'item_no' => $request->item_no,
                'title' => $request->title,
                'description' => $request->description,
                'file_name' => $originalName,
                'file_path' => $filePath,
                'file_size' => $fileSize,
                'file_type' => 'application/pdf',
                'uploader_name' => $request->uploader_name,
                'user_id' => $targetUserId,
            ]);
        }

        return redirect()->back()->with('success', 'อัปโหลดเอกสารลำดับที่ ' . $request->item_no . ' เรียบร้อยแล้ว');
    }

    /**
     * Display the specified PDF document inline in browser.
     */
    public function view($id)
    {
        $document = PersonalDocument::findOrFail($id);
        $user = auth()->user();

        // ตรวจสอบสิทธิ์การเข้าถึงเอกสาร
        if ($user && $user->role !== 'admin' && $document->user_id && $document->user_id !== $user->id) {
            abort(403, 'คุณไม่มีสิทธิ์เข้าถึงเอกสารประจำตัวนี้');
        }

        $path = Storage::disk('public')->path($document->file_path);

        if (!file_exists($path)) {
            abort(404, 'ไม่พบไฟล์เอกสารในระบบ');
        }

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . rawurlencode($document->file_name) . '"'
        ]);
    }

    /**
     * Download the specified personal document file.
     */
    public function download($id)
    {
        $document = PersonalDocument::findOrFail($id);
        $user = auth()->user();

        if ($user && $user->role !== 'admin' && $document->user_id && $document->user_id !== $user->id) {
            abort(403, 'คุณไม่มีสิทธิ์ดาวน์โหลดเอกสารประจำตัวนี้');
        }

        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'ไม่พบไฟล์เอกสารในระบบ');
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    /**
     * Remove the specified personal document from storage.
     */
    public function destroy($id)
    {
        $document = PersonalDocument::findOrFail($id);
        $user = auth()->user();

        if ($user && $user->role !== 'admin' && $document->user_id && $document->user_id !== $user->id) {
            abort(403, 'คุณไม่มีสิทธิ์ลบเอกสารประจำตัวนี้');
        }

        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return redirect()->back()->with('success', 'ลบเอกสารประจำตัวเรียบร้อยแล้ว');
    }

    /**
     * ตรวจสอบว่าหมวดวิทยานิพนธ์ที่กำหนดผ่านเกณฑ์การอัปโหลดสำหรับผู้ใช้แล้วหรือไม่
     */
    private function isCategorySatisfied(ThesisCategory $category, int $userId): bool
    {
        $catDocs = StandardDocument::where('is_active', true)
            ->where('thesis_category_id', $category->id)
            ->get();

        if ($catDocs->isEmpty()) {
            return true;
        }

        $uploadedItemNos = PersonalDocument::where('user_id', $userId)
            ->whereIn('item_no', $catDocs->pluck('item_no'))
            ->pluck('item_no')
            ->toArray();

        $ref = trim($category->item_reference ?? '');

        // 1. กรณีเงื่อนไข composite หมวด 5: ลำดับที่ 10 และ (11 หรือ 12)
        if (str_contains($ref, '10') && (str_contains($ref, '11') || str_contains($ref, '12')) && str_contains($ref, 'หรือ')) {
            $doc10 = $catDocs->firstWhere('item_no', 10);
            $doc11 = $catDocs->firstWhere('item_no', 11);
            $doc12 = $catDocs->firstWhere('item_no', 12);

            $is10Done = ($doc10 && in_array(10, $uploadedItemNos)) || ($doc10 && !$doc10->required);
            $is11or12Done = ($doc11 && in_array(11, $uploadedItemNos))
                || ($doc12 && in_array(12, $uploadedItemNos))
                || (!$doc11?->required && !$doc12?->required);

            return $is10Done && $is11or12Done;
        }

        // 2. กรณีเงื่อนไข "หรือ" (เช่น ลำดับที่ 1 หรือ 21): อัปโหลดข้อใดข้อหนึ่ง หรือทุกข้อไม่เป็น required
        if (str_contains($ref, 'หรือ') && !str_contains($ref, 'และ')) {
            $hasAnyUploaded = count($uploadedItemNos) > 0;
            $allNotRequired = $catDocs->every(fn($d) => !$d->required);
            return $hasAnyUploaded || $allNotRequired;
        }

        // 3. กรณีเงื่อนไข "ถึง", "และ", หรือรายการเดี่ยว: ต้องอัปโหลดครบทุกข้อที่เป็น Required
        foreach ($catDocs as $doc) {
            if ($doc->required && !in_array($doc->item_no, $uploadedItemNos)) {
                return false;
            }
        }

        return true;
    }
}
