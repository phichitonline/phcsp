<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_code',
        'academic_year',
        'semester',
        'activity_name',
        'activity_type',
        'activity_date',
        'start_time',
        'end_time',
        'total_hours',
        'location_name',
        'latitude',
        'longitude',
        'radius_limit',
        'qr_secret_token',
        'qr_refresh_interval',
        'status',
        'max_participants',
        'description',
        'created_by',
    ];

    protected $casts = [
        'activity_date' => 'date',
        'total_hours' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
        'radius_limit' => 'integer',
        'qr_refresh_interval' => 'integer',
        'academic_year' => 'integer',
        'semester' => 'integer',
        'max_participants' => 'integer',
    ];

    /**
     * อาจารย์ผู้สร้างกิจกรรม
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * กลุ่มเป้าหมายที่ต้องเข้าร่วม
     */
    public function targetGroups()
    {
        return $this->hasMany(ActivityTargetGroup::class);
    }

    /**
     * รายการลงทะเบียนและเช็กอิน
     */
    public function registrations()
    {
        return $this->hasMany(ActivityRegistration::class);
    }

    /**
     * ดึง token สแกน QR ประจำกิจกรรม (ถ้ายังไม่มีให้สร้าง)
     */
    public function ensureQrToken(): string
    {
        if (empty($this->qr_secret_token)) {
            $this->qr_secret_token = bin2hex(random_bytes(16));
            $this->saveQuietly();
        }
        return $this->qr_secret_token;
    }
}
