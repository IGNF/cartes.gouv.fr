<?php

namespace App\Security;

use League\OAuth2\Client\Token\AccessToken;
use Symfony\Component\HttpFoundation\RequestStack;

final class KeycloakTokenManager
{
    private const SESSION_KEY = 'keycloak_token';
    private const REQUEST_ATTR = '_keycloak_token';

    public function __construct(private RequestStack $requestStack)
    {
    }

    /**
     * Retourne le token, en utilisant le cache de l'attribut de requête si disponible.
     * Au premier appel : lit depuis la session, prime le cache, puis libère
     * immédiatement le verrou fichier de session via save().
     */
    public function getToken(): ?AccessToken
    {
        $request = $this->requestStack->getCurrentRequest();

        /** @var ?AccessToken */
        $cached = $request?->attributes->get(self::REQUEST_ATTR);
        if ($cached instanceof AccessToken) {
            return $cached;
        }

        $session = $this->requestStack->getSession();

        /** @var ?AccessToken */
        $token = $session->get(self::SESSION_KEY);

        $request?->attributes->set(self::REQUEST_ATTR, $token);
        $session->save();

        return $token;
    }

    /**
     * Persiste un token (nouveau ou rafraîchi) en session ET met à jour
     * le cache de l'attribut de requête pour que la requête courante le voie immédiatement.
     * N'appelle PAS save() — la session doit rester ouverte pour que l'écriture persiste.
     */
    public function setToken(AccessToken $token): void
    {
        $this->requestStack->getSession()->set(self::SESSION_KEY, $token);
        $this->requestStack->getCurrentRequest()?->attributes->set(self::REQUEST_ATTR, $token);
    }

    /**
     * Retourne true si le token expire dans moins de 5 minutes.
     */
    public function isExpiringSoon(AccessToken $token): bool
    {
        return ($token->getExpires() - 300) < time();
    }
}
