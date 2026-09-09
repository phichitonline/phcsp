<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class MophAuthController extends Controller
{
    /**
     * Redirect the user to the MOPH ProviderID authentication page.
     *
     * @return \Illuminate\Http\Response
     */
    public function redirect()
    {
        return Socialite::driver('moph')
            ->stateless()
            ->with(['state' => config('services.moph.state')])
            ->redirect();
    }

    /**
     * Obtain the user information from MOPH ProviderID.
     *
     * @return \Illuminate\Http\Response
     */
    public function callback(Request $request)
    {
        // Add logging to see what provider.tphcp.go.th sends
        \Illuminate\Support\Facades\Log::info('MOPH Callback Payload: ', $request->all());

        try {
            // Check if the payload contains user data directly instead of a code
            if ($request->has('providerid') || $request->has('moph_id')) {
                // If the proxy already exchanged the token and sent user data directly
                $mophId = $request->input('providerid') ?? $request->input('moph_id');
                $pid = null; // The proxy sends hash_cid instead of raw pid
                $name = trim($request->input('fname') . ' ' . $request->input('lname'));
                if (empty($name)) {
                    $name = 'MOPH User';
                }
                $email = $request->input('email');
            } else {
                // Otherwise, try standard Socialite flow (assuming it sent a code)
                $mophUser = Socialite::driver('moph')->stateless()->user();
                $rawUser = $mophUser->user;
                $mophId = $rawUser['moph_id'] ?? null;
                $pid = $rawUser['pid'] ?? null;
                $name = $mophUser->getName();
                $email = $mophUser->getEmail();
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('MOPH Auth Error: ' . $e->getMessage());
            return redirect('/auth/login')->withErrors(['error' => 'การเข้าสู่ระบบด้วย MOPH ProviderID ล้มเหลว กรุณาลองใหม่อีกครั้ง']);
        }

        // Find existing user by moph_id, pid, or email
        $query = User::query();
        if ($mophId) {
            $query->where('moph_id', $mophId);
        }
        if ($pid) {
            $query->orWhere('pid', $pid);
        }
        if (!empty($email)) {
            $query->orWhere('email', $email);
        }
        
        $user = $query->first();

        if (!$user) {
            // Create a new user
            $user = User::create([
                'name' => $name,
                'email' => !empty($email) ? $email : $mophId . '@moph.local',
                'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                'pid' => $pid,
                'moph_id' => $mophId,
                'role' => 'guest', // default role
            ]);
        } else {
            // Update moph_id if they previously registered without it but PID matches
            if (!$user->moph_id && $mophId) {
                $user->update(['moph_id' => $mophId]);
            }
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
}
