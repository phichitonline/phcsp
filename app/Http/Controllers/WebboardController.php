<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WebboardPost;

class WebboardController extends Controller
{
    public function store(Request $request)
    {
        if (!auth()->check()) {
            abort(403, 'กรุณาเข้าสู่ระบบก่อนตั้งคำถามหรือฝากข้อความ');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|string|in:question,feedback,problem',
        ]);

        WebboardPost::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'content' => $validated['content'],
            'category' => $validated['category'],
            'status' => 'open',
        ]);

        return redirect()->back()->with('success', 'ตั้งกระทู้/ฝากข้อความเรียบร้อยแล้ว');
    }

    public function answer(Request $request, $id)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถตอบคำถามได้');
        }

        $validated = $request->validate([
            'answer' => 'required|string',
        ]);

        $post = WebboardPost::findOrFail($id);
        $post->update([
            'answer' => $validated['answer'],
            'answered_by' => auth()->id(),
            'answered_at' => now(),
            'status' => 'answered',
        ]);

        return redirect()->back()->with('success', 'บันทึกคำตอบเรียบร้อยแล้ว');
    }

    public function destroy($id)
    {
        $post = WebboardPost::findOrFail($id);

        if (auth()->user()->role !== 'admin' && auth()->id() !== $post->user_id) {
            abort(403, 'คุณไม่มีสิทธิ์ลบกระทู้นี้');
        }

        $post->delete();

        return redirect()->back()->with('success', 'ลบกระทู้เรียบร้อยแล้ว');
    }
}
