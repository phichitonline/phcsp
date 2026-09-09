<?php

namespace App\Services\Auth;

use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\ProviderInterface;
use Laravel\Socialite\Two\User;

class MophProvider extends AbstractProvider implements ProviderInterface
{
    /**
     * Get the authentication URL for the provider.
     *
     * @param  string  $state
     * @return string
     */
    protected function getAuthUrl($state)
    {
        return $this->buildAuthUrlFromBase('https://moph.id.th/oauth/redirect', $state);
    }

    /**
     * Get the token URL for the provider.
     *
     * @return string
     */
    protected function getTokenUrl()
    {
        // Mock Token URL for MOPH ProviderID
        return 'https://id.moph.go.th/api/v1/oauth2/token';
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
        if (config('services.moph.client_id') === 'mock-moph-client-id') {
            return [
                'moph_id' => 'MOPH-123456',
                'pid' => '1234567890123',
                'name' => 'Mock MOPH User',
                'given_name' => 'Mock MOPH',
                'family_name' => 'User',
            ];
        }

        $response = $this->getHttpClient()->post('https://id.moph.go.th/api/v1/oauth2/userinfo', [
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
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
            'id' => $user['moph_id'] ?? $user['pid'] ?? null,
            'nickname' => null,
            'name' => $user['name'] ?? trim(($user['given_name'] ?? '') . ' ' . ($user['family_name'] ?? '')),
            'email' => null,
            'avatar' => null,
        ]);
    }
}
