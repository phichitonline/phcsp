<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThesisCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_no',
        'name',
        'suggested_name',
        'description',
        'item_reference',
    ];

    protected $casts = [
        'category_no' => 'integer',
    ];

    /**
     * Relationship: ThesisCategory has many StandardDocuments
     */
    public function standardDocuments()
    {
        return $this->hasMany(StandardDocument::class, 'thesis_category_id')->orderBy('item_no', 'asc');
    }
}
