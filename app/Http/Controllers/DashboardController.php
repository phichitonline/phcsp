<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\JwtService;
use App\Models\WebboardPost;
use App\Models\Activity;
use App\Models\Curriculum;

class DashboardController extends Controller
{
    public function index()
    {
        $today = now()->startOfDay()->toDateString();

        // 1. ดึงกิจกรรมที่กำลังจะเกิดขึ้น (Upcoming Activities)
        $upcomingActivities = Activity::withCount('registrations')
            ->with(['creator:id,name'])
            ->where(function ($q) use ($today) {
                $q->where('activity_date', '>=', $today)
                  ->orWhere('status', 'ongoing');
            })
            ->where('status', '!=', 'cancelled')
            ->orderBy('activity_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        $upcomingCount = $upcomingActivities->count();

        // 2. ดึงหลักสูตรที่เปิดเรียนทั้งหมด (Curriculums)
        $curriculums = Curriculum::withCount(['courses', 'studentProfiles'])
            ->orderBy('is_active', 'desc')
            ->orderBy('academic_year_start', 'desc')
            ->orderBy('id', 'asc')
            ->get();

        $activeCurriculumsCount = $curriculums->where('is_active', true)->count();

        // 3. กระดานถามตอบ / ปัญหา
        $webboardPosts = WebboardPost::with(['user:id,name,avatar,role', 'responder:id,name,avatar,role'])->latest()->get();

        return Inertia::render('dashboard/hosinfo/index', [
            'webboardPosts' => $webboardPosts,
            'upcomingActivities' => $upcomingActivities,
            'upcomingActivitiesCount' => $upcomingCount,
            'curriculums' => $curriculums,
            'activeCurriculumsCount' => $activeCurriculumsCount,
        ]);
    }

    public function clinic()
    {
        return Inertia::render('dashboard/clinic/index');
    }

    public function wallet()
    {
        return Inertia::render('dashboard/wallet/index');
    }

    public function sales()
    {
        return Inertia::render('dashboard/sales/index');
    }
}
