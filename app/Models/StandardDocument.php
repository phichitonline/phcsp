<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StandardDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'thesis_category_id',
        'item_no',
        'title',
        'description',
        'required',
        'is_active',
    ];

    protected $casts = [
        'thesis_category_id' => 'integer',
        'item_no' => 'integer',
        'required' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Relationship: StandardDocument belongs to ThesisCategory
     */
    public function thesisCategory()
    {
        return $this->belongsTo(ThesisCategory::class, 'thesis_category_id');
    }
}
