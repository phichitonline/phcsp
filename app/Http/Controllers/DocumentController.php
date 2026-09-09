<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    /**
     * Display a listing of documents and upload form.
     */
    public function index()
    {
        $documents = Document::with('user:id,name,email')
            ->latest()
            ->get();

        return Inertia::render('documents/index', [
            'documents' => $documents,
            'auth_user' => auth()->user(),
        ]);
    }

    /**
     * Store a newly uploaded document.
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
            'title' => 'required|string|max:255',
            'uploader_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'document_file' => 'required|file|mimes:pdf|max:10240', // max 10MB PDF
        ], [
            'title.required' => 'กรุณาระบุชื่อเอกสาร',
            'uploader_name.required' => 'กรุณาระบุชื่อผู้อัปโหลด',
            'document_file.required' => 'กรุณาเลือกไฟล์เอกสาร PDF',
            'document_file.mimes' => 'ไฟล์ที่อัปโหลดต้องเป็นไฟล์ PDF เท่านั้น',
            'document_file.max' => 'ขนาดไฟล์ต้องไม่เกิน 10 MB',
        ]);

        $file = $request->file('document_file');
        $originalName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $filePath = $file->store('documents', 'public');

        Document::create([
            'title' => $request->title,
            'description' => $request->description,
            'file_name' => $originalName,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'file_type' => 'application/pdf',
            'uploader_name' => $request->uploader_name,
            'user_id' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'อัปโหลดเอกสารเรียบร้อยแล้ว');
    }

    /**
     * Display the specified PDF document inline in browser.
     */
    public function view($id)
    {
        $document = Document::findOrFail($id);
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
     * Download the specified document file.
     */
    public function download($id)
    {
        $document = Document::findOrFail($id);

        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'ไม่พบไฟล์เอกสารในระบบ');
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    /**
     * Remove the specified document from storage.
     */
    public function destroy($id)
    {
        $document = Document::findOrFail($id);

        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return redirect()->back()->with('success', 'ลบเอกสารเรียบร้อยแล้ว');
    }
}
