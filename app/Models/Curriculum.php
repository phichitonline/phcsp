<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curriculum extends Model
{
    use HasFactory;

    protected $table = 'curriculums';

    protected $fillable = [
        'code',
        'name',
        'degree_level',
        'total_credits',
        'core_credits_required',
        'elective_credits_required',
        'thesis_credits_required',
        'min_gpa_graduate',
        'academic_year_start',
        'description',
        'is_active',
    ];

    protected $casts = [
        'total_credits' => 'integer',
        'core_credits_required' => 'integer',
        'elective_credits_required' => 'integer',
        'thesis_credits_required' => 'integer',
        'min_gpa_graduate' => 'float',
        'is_active' => 'boolean',
    ];

    public function courses()
    {
        return $this->hasMany(Course::class, 'curriculum_id')->orderBy('order_no', 'asc');
    }
}
