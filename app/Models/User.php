<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'avatar',
        'password',
        'role',
        'department_id',
        'thaid_id',
        'pid',
        'moph_id',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relationship: User belongs to a Department
     */
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Relationship: User has one StudentProfile
     */
    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }

    /**
     * Relationship: User has many PersonalDocuments
     */
    public function personalDocuments()
    {
        return $this->hasMany(PersonalDocument::class);
    }

    /**
     * Relationship: User has many CourseGrades
     */
    public function courseGrades()
    {
        return $this->hasMany(StudentCourseGrade::class, 'user_id');
    }

    /**
     * Relationship: User has many ActivityRegistrations
     */
    public function activityRegistrations()
    {
        return $this->hasMany(ActivityRegistration::class);
    }

    /**
     * Relationship: User has created many Activities
     */
    public function createdActivities()
    {
        return $this->hasMany(Activity::class, 'created_by');
    }

    /**
     * Check if user is an administrator
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin'
            || ($this->department && trim($this->department->dp_name) === 'Admin');
    }

    /**
     * Check if user is a teacher / lecturer
     */
    public function isTeacher(): bool
    {
        return $this->role === 'teacher'
            || ($this->department && trim($this->department->dp_name) === 'อาจารย์');
    }

    /**
     * Check if user is a student
     */
    public function isStudent(): bool
    {
        if ($this->department && trim($this->department->dp_name) === 'นักศึกษา') {
            return true;
        }
        return !$this->isAdmin() && !$this->isTeacher();
    }

    /**
     * Check if user is staff (Admin or Teacher) - not a student
     */
    public function isStaff(): bool
    {
        return $this->isAdmin() || $this->isTeacher() || !$this->isStudent();
    }
}
