<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $wards = Cache::get('hosxp_active_wards');
        if (empty($wards)) {
            $apiUrl = env('VITE_EXTERNAL_API_URL', 'http://127.0.0.1:8800');
            try {
                $response = Http::timeout(5)->get($apiUrl . '/api/v1/ward/active-wards');
                if ($response->successful()) {
                    $fetchedWards = $response->json('data') ?? [];
                    if (!empty($fetchedWards)) {
                        $wards = $fetchedWards;
                        Cache::put('hosxp_active_wards', $wards, 86400);
                    }
                }
            } catch (\Exception $e) {}
        }
        $wards = $wards ?? [];

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'hospital' => [
                'name' => config('hospital.name'),
                'code' => config('hospital.code'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'wards' => $wards,
        ];
    }
}
