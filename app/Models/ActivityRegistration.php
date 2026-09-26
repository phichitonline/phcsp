<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_id',
        'user_id',
        'student_code',
        'registration_status',
        'registered_at',
        'check_in_time',
        'check_out_time',
        'check_in_method',
        'check_in_lat',
        'check_in_lng',
        'check_in_distance',
        'check_in_photo',
        'face_match_score',
        'actual_hours',
        'attendance_type',
        'admin_override',
        'override_by',
        'override_reason',
        'notes',
    ];

    protected $casts = [
        'registered_at' => 'datetime',
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
        'check_in_lat' => 'float',
        'check_in_lng' => 'float',
        'check_in_distance' => 'float',
        'face_match_score' => 'float',
        'actual_hours' => 'float',
        'admin_override' => 'boolean',
    ];

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function overrideUser()
    {
        return $this->belongsTo(User::class, 'override_by');
    }
}
