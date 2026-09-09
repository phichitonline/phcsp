<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Auth;

class JwtService
{
    /**
     * สร้าง JWT สำหรับผู้ใช้ที่ Login อยู่
     */
    public static function generateToken()
    {
        $user = Auth::user();
        if (!$user) {
            return null;
        }

        $secret = config('services.jwt.secret');
        $algo = config('services.jwt.algorithm', 'HS256');

        $payload = [
            'iss' => config('app.url'),
            'sub' => (string)$user->id,
            'name' => $user->name,
            'role' => $user->role ?? 'user',
            'iat' => time(),
            'exp' => time() + (60 * 60 * 2), // หมดอายุใน 2 ชั่วโมง
        ];

        return JWT::encode($payload, $secret, $algo);
    }
}
