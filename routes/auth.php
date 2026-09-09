<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    // Route::get('register', [RegisteredUserController::class, 'create'])
    //     ->name('register');

    // Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    // Complete Registration Route
    Route::get('complete-registration', [\App\Http\Controllers\Auth\ThaiDAuthController::class, 'completeRegistration'])
        ->name('complete.registration');
    Route::post('complete-registration', [\App\Http\Controllers\Auth\ThaiDAuthController::class, 'updateRegistration'])
        ->name('complete.registration.update');
});

// ThaiD OAuth Routes
Route::middleware('guest')->group(function () {
    Route::get('auth/thaid/redirect', [\App\Http\Controllers\Auth\ThaiDAuthController::class, 'redirect'])
        ->name('thaid.redirect');
    Route::get('auth/thaid/callback', [\App\Http\Controllers\Auth\ThaiDAuthController::class, 'callback'])
        ->name('thaid.callback');

    // MOPH ProviderID Routes
    Route::get('auth/moph/redirect', [\App\Http\Controllers\Auth\MophAuthController::class, 'redirect'])
        ->name('moph.redirect');
    Route::any('auth/moph/callback', [\App\Http\Controllers\Auth\MophAuthController::class, 'callback'])
        ->name('moph.callback');
});

