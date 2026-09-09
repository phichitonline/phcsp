<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $socialite = $this->app->make(\Laravel\Socialite\Contracts\Factory::class);
        
        $socialite->extend('thaid', function ($app) use ($socialite) {
            $config = $app['config']['services.thaid'];
            return $socialite->buildProvider(\App\Services\Auth\ThaiDProvider::class, $config);
        });

        $socialite->extend('moph', function ($app) use ($socialite) {
            $config = $app['config']['services.moph'];
            return $socialite->buildProvider(\App\Services\Auth\MophProvider::class, $config);
        });

        if (str_starts_with(config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }
    }
}
