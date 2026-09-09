<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'jwt' => [
        'secret' => env('JWT_SECRET'),
        'algorithm' => env('JWT_ALGORITHM', 'HS256'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'thaid' => [
        'api_key' => env('THAID_API_KEY', 'mock-api-key'),
        'client_id' => env('THAID_CLIENT_ID', 'mock-client-id'),
        'client_secret' => env('THAID_CLIENT_SECRET', 'mock-client-secret'),
        'redirect' => env('THAID_REDIRECT_URI', '/auth/thaid/callback'),
    ],

    'moph' => [
        'client_id' => env('MOPH_CLIENT_ID', 'mock-moph-client-id'),
        'client_secret' => env('MOPH_CLIENT_SECRET', 'mock-moph-client-secret'),
        'redirect' => env('MOPH_REDIRECT_URI', '/auth/moph/callback'),
        'state' => env('MOPH_STATE_CALLBACK', 'https://hosinfo.tphcp.go.th/auth/moph/callback'),
    ],

];
