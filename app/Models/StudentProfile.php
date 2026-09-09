<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_code',
        'national_id',
        'title_prefix',
        'first_name_th',
        'last_name_th',
        'first_name_en',
        'last_name_en',
        'gender',
        'birth_date',
        'blood_group',
        'religion',
        'ethnicity',
        'nationality',
        'phone',
        'line_id',
        'faculty',
        'major',
        'academic_year',
        'class_year',
        'advisor_name',
        'student_status',
        'gpa',
        'practicum_hospital',
        'address',
        'current_address',
        'emergency_contact_name',
        'emergency_relationship',
        'emergency_phone',
        'health_conditions',
        'avatar_path',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'gpa' => 'float',
    ];

    /**
     * Relationship: StudentProfile belongs to User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper to get full Thai name
     */
    public function getFullNameThAttribute()
    {
        $prefix = $this->title_prefix ? $this->title_prefix . '' : '';
        return trim("{$prefix}{$this->first_name_th} {$this->last_name_th}");
    }

    /**
     * Helper to get full English name
     */
    public function getFullNameEnAttribute()
    {
        return trim("{$this->first_name_en} {$this->last_name_en}");
    }

    /**
     * Relationship: StudentProfile has many CourseGrades
     */
    public function courseGrades()
    {
        return $this->hasMany(StudentCourseGrade::class, 'student_profile_id');
    }
}
