<?php

namespace App\Security;

use App\Security\Cookie\AuthCookieCipher;
use App\Security\Cookie\AuthCookieResponseListener;
use League\OAuth2\Client\Token\AccessToken;
use Symfony\Component\HttpFoundation\RequestStack;

final class KeycloakTokenManager
{
    private const REQUEST_ATTR_TOKEN = '_keycloak_token_cache';

    public function __construct(
        private RequestStack $requestStack,
        private AuthCookieCipher $cipher,
    ) {
    }

    public function getAccessToken(): ?AccessToken
    {
        $request = $this->requestStack->getCurrentRequest();
        if (null === $request) {
            return null;
        }

        if ($request->attributes->has(self::REQUEST_ATTR_TOKEN)) {
            return $request->attributes->get(self::REQUEST_ATTR_TOKEN);
        }

        $cookieValue = $request->cookies->get(AuthCookieResponseListener::COOKIE_NAME);
        if (null === $cookieValue) {
            return null;
        }

        $plain = $this->cipher->decrypt($cookieValue);
        if (null === $plain) {
            return null;
        }

        $token = unserialize($plain, ['allowed_classes' => [AccessToken::class]]);
        if (!$token instanceof AccessToken) {
            return null;
        }

        $request->attributes->set(self::REQUEST_ATTR_TOKEN, $token);

        return $token;
    }

    public function getIdToken(): ?string
    {
        return $this->getAccessToken()?->getValues()['id_token'] ?? null;
    }

    public function setAccessToken(AccessToken $token): void
    {
        $request = $this->requestStack->getCurrentRequest();
        if (null === $request) {
            throw new \RuntimeException('Impossible de persister le token Keycloak : aucune requête HTTP en cours.');
        }

        $request->attributes->set(self::REQUEST_ATTR_TOKEN, $token);
        $request->attributes->set(AuthCookieResponseListener::REQUEST_ATTR_INTENT, $token);
    }

    public function clearAccessToken(): void
    {
        $request = $this->requestStack->getCurrentRequest();
        if (null === $request) {
            return;
        }

        $request->attributes->remove(self::REQUEST_ATTR_TOKEN);
        $request->attributes->set(
            AuthCookieResponseListener::REQUEST_ATTR_INTENT,
            AuthCookieResponseListener::INTENT_CLEAR
        );
    }
}
