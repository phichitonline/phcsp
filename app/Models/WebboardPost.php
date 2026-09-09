<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebboardPost extends Model
{
    use HasFactory;

    protected $table = 'webboard_posts';

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'category',
        'status',
        'answer',
        'answered_by',
        'answered_at',
    ];

    protected $casts = [
        'answered_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function responder()
    {
        return $this->belongsTo(User::class, 'answered_by');
    }
}
