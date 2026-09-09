<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display the authenticated user's profile.
     */
    public function profile()
    {
        $user = auth()->user()->load('department');
        return Inertia::render('users/profile', [
            'user' => $user
        ]);
    }

    /**
     * Update the authenticated user's avatar.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $user = auth()->user();

        // ลบรูปเก่าถ้ามี
        if ($user->avatar && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->avatar)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
        }

        // อัปโหลดรูปใหม่
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar = $path;
        $user->save();

        return redirect()->back()->with('success', 'อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }
        $users = User::with('department')->orderBy('name')->get();
        return Inertia::render('users/index', [
            'users' => $users
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
        $departments = Department::active()->orderBy('dp_name')->get();
        return Inertia::render('users/create', [
            'departments' => $departments
        ]);
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:admin,head,user,guest',
            'department_id' => 'nullable|exists:departments,id',
            'is_active' => 'required|boolean',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'department_id' => $request->department_id,
            'is_active' => $request->is_active,
        ]);

        return redirect()->route('users.index')->with('success', 'เพิ่มผู้ใช้สำเร็จ');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::findOrFail($id);
        
        // อนุญาตถ้าเป็น Admin หรือ แก้ไขตัวเอง
        if (auth()->user()->role !== 'admin' && auth()->id() !== $user->id) {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้อื่น');
        }

        $departments = Department::active()->orderBy('dp_name')->get();
        return Inertia::render('users/edit', [
            'user' => $user,
            'departments' => $departments
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $currentUser = auth()->user();

        // อนุญาตถ้าเป็น Admin หรือ แก้ไขตัวเอง
        if ($currentUser->role !== 'admin' && $currentUser->id !== $user->id) {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้อื่น');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|in:admin,head,user,guest',
            'department_id' => 'nullable|exists:departments,id',
            'password' => 'nullable|string|min:8|confirmed',
            'is_active' => 'required|boolean',
        ]);

        $data = [
            'name' => $request->name,
        ];

        // ถ้าไม่ใช่ Admin จะเปลี่ยน Role, Department, is_active ไม่ได้ แต่เปลี่ยน Email ได้
        if ($currentUser->role === 'admin') {
            $data['email'] = $request->email;
            $data['role'] = $request->role;
            $data['department_id'] = $request->department_id;
            $data['is_active'] = $request->is_active;
        } else {
            // อนุญาตให้แก้ไข Email ของตัวเองได้
            $data['email'] = $request->email;
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        if ($currentUser->role === 'admin') {
            return redirect()->route('users.index')->with('success', 'แก้ไขข้อมูลผู้ใช้สำเร็จ');
        } else {
            return redirect()->route('dashboard')->with('success', 'แก้ไขข้อมูลส่วนตัวสำเร็จ');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }

        $user = User::findOrFail($id);
        
        if ($user->id === auth()->id()) {
            return redirect()->route('users.index')->with('error', 'ไม่สามารถลบตัวเองได้');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'ลบผู้ใช้สำเร็จ');
    }
}
