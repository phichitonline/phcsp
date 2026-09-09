<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EndUserReport extends Model
{
    use HasFactory;

    protected $table = 'end_user_reports';

    protected $guarded = [];

    /**
     * Scope: เฉพาะรายงานที่เปิดใช้งาน (is_active = 1)
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }

    /**
     * ความสัมพันธ์กับ Department (หน่วยงานที่ขอรายงาน)
     */
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }
}
