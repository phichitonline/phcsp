<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'file_name',
        'file_path',
        'file_size',
        'file_type',
        'uploader_name',
        'user_id',
    ];

    protected $appends = [
        'file_url',
        'view_url',
        'formatted_file_size',
    ];

    /**
     * Get the inline view URL for the document.
     */
    public function getViewUrlAttribute(): string
    {
        return url("/documents/{$this->id}/view");
    }

    /**
     * Get the publicly accessible URL for the document file.
     */
    public function getFileUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }

    /**
     * Get human-readable formatted file size.
     */
    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = $this->file_size;
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }

    /**
     * Relationship: Document uploaded by a User (optional)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
