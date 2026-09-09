<?php

namespace App\Services\Auth;

use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\ProviderInterface;
use Laravel\Socialite\Two\User;

class ThaiDProvider extends AbstractProvider implements ProviderInterface
{
    /**
     * The scopes being requested.
     *
     * @var array
     */
    protected $scopes = ['pid', 'title', 'given_name', 'family_name', 'birthdate'];

    /**
     * The separating character for the requested scopes.
     *
     * @var string
     */
    protected $scopeSeparator = ' ';

    /**
     * Get the authentication URL for the provider.
     *
     * @param  string  $state
     * @return string
     */
    protected function getAuthUrl($state)
    {
        return $this->buildAuthUrlFromBase('https://imauth.bora.dopa.go.th/api/v2/oauth2/auth/', $state);
    }

    /**
     * Get the token URL for the provider.
     *
     * @return string
     */
    protected function getTokenUrl()
    {
        return 'https://imauth.bora.dopa.go.th/api/v2/oauth2/token/';
    }

    /**
     * Get the headers for the access token request.
     *
     * @param  string  $code
     * @return array
     */
    protected function getTokenHeaders($code)
    {
        return [
            'Accept' => 'application/json',
            'x-Imauth-Apikey' => config('services.thaid.api_key'),
            'Authorization' => 'Basic ' . base64_encode($this->clientId . ':' . $this->clientSecret),
        ];
    }

    /**
     * Get the raw user for the given access token.
     *
     * @param  string  $token
     * @return array
     */
    protected function getUserByToken($token)
    {
        // Mocked response for development since credentials are mock
        if (config('services.thaid.client_id') === 'mock-client-id') {
            return [
                'pid' => '1234567890123',
                'name' => 'Mock User',
                'given_name' => 'Mock',
                'family_name' => 'User',
            ];
        }

        $response = $this->getHttpClient()->post('https://imauth.bora.dopa.go.th/api/v2/oauth2/userinfo/', [
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
                'x-Imauth-Apikey' => config('services.thaid.api_key'),
            ],
        ]);

        return json_decode($response->getBody(), true);
    }

    /**
     * Map the raw user array to a Socialite User instance.
     *
     * @param  array  $user
     * @return \Laravel\Socialite\Two\User
     */
    protected function mapUserToObject(array $user)
    {
        return (new User)->setRaw($user)->map([
            'id' => $user['pid'] ?? null,
            'nickname' => null,
            'name' => $user['name'] ?? trim(($user['title'] ?? '') . ($user['given_name'] ?? '') . ' ' . ($user['family_name'] ?? '')),
            'email' => null,
            'avatar' => null,
        ]);
    }
}
