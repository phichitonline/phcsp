<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\JwtService;
use App\Models\WebboardPost;

class DashboardController extends Controller
{
    public function index()
    {

        $webboardPosts = WebboardPost::with(['user:id,name,avatar,role', 'responder:id,name,avatar,role'])->latest()->get();

        return Inertia::render('dashboard/hosinfo/index', [
            'webboardPosts' => $webboardPosts
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
