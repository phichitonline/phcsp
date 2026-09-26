<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityTargetGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_id',
        'target_type',
        'target_value',
        'required',
    ];

    protected $casts = [
        'required' => 'boolean',
    ];

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }
}
