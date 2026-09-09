<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * Scope: เฉพาะหน่วยงานที่เปิดใช้งาน (dp_status = 1)
     */
    public function scopeActive($query)
    {
        return $query->where('dp_status', 1);
    }

    /**
     * ความสัมพันธ์กับ KPI
     */
    public function kpis()
    {
        return $this->hasMany(Kpi::class, 'department', 'id');
    }

    /**
     * ความสัมพันธ์กับ User (สมาชิกในหน่วยงาน)
     */
    public function users()
    {
        return $this->hasMany(User::class, 'department_id', 'id');
    }
}
