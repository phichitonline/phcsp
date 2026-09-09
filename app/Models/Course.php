<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'curriculum_id',
        'course_code',
        'course_name_th',
        'course_name_en',
        'credits',
        'lecture_hours',
        'lab_hours',
        'self_study_hours',
        'category',
        'term_suggested',
        'year_suggested',
        'is_active',
        'order_no',
    ];

    protected $casts = [
        'credits' => 'integer',
        'lecture_hours' => 'integer',
        'lab_hours' => 'integer',
        'self_study_hours' => 'integer',
        'term_suggested' => 'integer',
        'year_suggested' => 'integer',
        'is_active' => 'boolean',
        'order_no' => 'integer',
    ];

    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class, 'curriculum_id');
    }

    public function grades()
    {
        return $this->hasMany(StudentCourseGrade::class, 'course_id');
    }

    /**
     * Category label in Thai
     */
    public function getCategoryLabelAttribute(): string
    {
        return match ($this->category) {
            'core' => 'วิชาบังคับ',
            'elective' => 'วิชาเลือก',
            'thesis' => 'วิทยานิพนธ์/IS',
            'remedial' => 'วิชาปรับพื้นฐาน',
            default => 'ทั่วไป',
        };
    }
}
