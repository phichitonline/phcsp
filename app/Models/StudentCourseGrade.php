<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentCourseGrade extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_profile_id',
        'course_id',
        'academic_year',
        'semester',
        'grade',
        'grade_point',
        'is_passed',
        'recorded_by_user_id',
        'remark',
    ];

    protected $casts = [
        'semester' => 'integer',
        'grade_point' => 'float',
        'is_passed' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function studentProfile()
    {
        return $this->belongsTo(StudentProfile::class, 'student_profile_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }

    /**
     * Helper to compute grade point and passed status from grade string.
     */
    public static function evaluateGrade(?string $grade): array
    {
        $grade = strtoupper(trim($grade ?? ''));
        return match ($grade) {
            'A' => ['point' => 4.00, 'passed' => true, 'counts_in_gpa' => true],
            'B+' => ['point' => 3.50, 'passed' => true, 'counts_in_gpa' => true],
            'B' => ['point' => 3.00, 'passed' => true, 'counts_in_gpa' => true],
            'C+' => ['point' => 2.50, 'passed' => true, 'counts_in_gpa' => true],
            'C' => ['point' => 2.00, 'passed' => true, 'counts_in_gpa' => true],
            'D+' => ['point' => 1.50, 'passed' => false, 'counts_in_gpa' => true],
            'D' => ['point' => 1.00, 'passed' => false, 'counts_in_gpa' => true],
            'F' => ['point' => 0.00, 'passed' => false, 'counts_in_gpa' => true],
            'S' => ['point' => null, 'passed' => true, 'counts_in_gpa' => false],
            'U' => ['point' => null, 'passed' => false, 'counts_in_gpa' => false],
            'P' => ['point' => null, 'passed' => true, 'counts_in_gpa' => false],
            'I', 'IP', 'W' => ['point' => null, 'passed' => false, 'counts_in_gpa' => false],
            default => ['point' => null, 'passed' => false, 'counts_in_gpa' => false],
        };
    }
}
