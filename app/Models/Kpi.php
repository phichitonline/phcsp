<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kpi extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * ความสัมพันธ์กับ User (ผู้รับผิดชอบ)
     */
    public function responsibleUser()
    {
        return $this->belongsTo(User::class, 'responsible_person', 'id');
    }
}
