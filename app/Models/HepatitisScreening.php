<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HepatitisScreening extends Model
{
    protected $guarded = [];

    protected $casts = [
        'hbv_medication' => 'date:Y-m-d',
        'hbv_follow_up' => 'date:Y-m-d',
        'hcv_medication' => 'date:Y-m-d',
        'hcv_follow_up' => 'date:Y-m-d',
        'ultrasound' => 'date:Y-m-d',
        'referral' => 'date:Y-m-d',
    ];
}
