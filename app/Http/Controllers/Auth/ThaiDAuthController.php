<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class ThaiDAuthController extends Controller
{
    /**
     * Redirect the user to the ThaiD authentication page.
     *
     * @return \Illuminate\Http\Response
     */
    public function redirect()
    {
        return Socialite::driver('thaid')->redirect();
    }

    /**
     * Obtain the user information from ThaiD.
     *
     * @return \Illuminate\Http\Response
     */
    public function callback()
    {
        try {
            $thaidUser = Socialite::driver('thaid')->user();
        } catch (\Exception $e) {
            return redirect('/auth/login')->withErrors(['error' => 'การเข้าสู่ระบบด้วย ThaiD ล้มเหลว กรุณาลองใหม่อีกครั้ง']);
        }

        // Find existing user by ThaiD ID
        $user = User::where('thaid_id', $thaidUser->getId())->first();

        $isNewUser = false;

        if (!$user) {
            // Create a new user
            $user = User::create([
                'name' => $thaidUser->getName(),
                'email' => $thaidUser->getId() . '@thaid.local', // Dummy email since ThaiD doesn't provide one
                'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                'thaid_id' => $thaidUser->getId(),
                'role' => 'guest', // default role
            ]);
            $isNewUser = true;
        }
        
        // Check if user account is disabled
        if (!$user->is_active) {
            return redirect('/auth/login')->withErrors(['error' => 'บัญชีผู้ใช้งานของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ']);
        }

        Auth::login($user);

        // Redirect to complete registration if department is not set
        if (!$user->department_id) {
            return redirect()->route('complete.registration');
        }

        return redirect()->intended('/');
    }

    /**
     * Show the complete registration page.
     */
    public function completeRegistration()
    {
        // Must be authenticated to see this page
        if (!Auth::check() || Auth::user()->department_id) {
            return redirect('/');
        }

        $departments = \App\Models\Department::all();

        return \Inertia\Inertia::render('auth/complete-registration/index', [
            'departments' => $departments
        ]);
    }

    /**
     * Update the user's registration data (department).
     */
    public function updateRegistration(Request $request)
    {
        $request->validate([
            'department_id' => 'required|exists:departments,id',
        ]);

        $user = Auth::user();
        $user->department_id = $request->department_id;
        $user->save();

        return redirect()->intended('/');
    }
}
