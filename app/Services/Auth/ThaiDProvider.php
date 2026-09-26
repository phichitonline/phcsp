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
    protected $scopes = ['pid', 'name'];

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
     * Override user method to bypass userinfo endpoint, 
     * since ThaiD returns user data directly in the token response.
     *
     * @return \Laravel\Socialite\Two\User
     */
    public function user()
    {
        if ($this->hasInvalidState()) {
            throw new \Laravel\Socialite\Two\InvalidStateException;
        }

        $response = $this->getAccessTokenResponse($this->getCode());

        // Mocked response for development since credentials are mock
        if (config('services.thaid.client_id') === 'mock-client-id') {
            $response = array_merge($response, [
                'pid' => '1234567890123',
                'name' => 'Mock User',
                'given_name' => 'Mock',
                'family_name' => 'User',
            ]);
        }

        $user = $this->mapUserToObject($response);

        $token = \Illuminate\Support\Arr::get($response, 'access_token');

        return $user->setToken($token)
                    ->setRefreshToken(\Illuminate\Support\Arr::get($response, 'refresh_token'))
                    ->setExpiresIn(\Illuminate\Support\Arr::get($response, 'expires_in'))
                    ->setApprovedScopes(explode($this->scopeSeparator, \Illuminate\Support\Arr::get($response, 'scope', '')));
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

    /**
     * Get the raw user for the given access token.
     * Required by AbstractProvider but bypassed since we override user().
     *
     * @param  string  $token
     * @return array
     */
    protected function getUserByToken($token)
    {
        return [];
    }
}
