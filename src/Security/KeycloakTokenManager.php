<?php

namespace App\Security;

use League\OAuth2\Client\Token\AccessToken;
use Symfony\Component\HttpFoundation\RequestStack;

final class KeycloakTokenManager
{
    private const SESSION_KEY = '_keycloak_token';

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

        if (null === $request) {
            return null;
        }

        if ($request->attributes->has(self::SESSION_KEY)) {
            return $request->attributes->get(self::SESSION_KEY);
        }

        if (!$request->hasSession()) {
            return null;
        }

        $session = $request->getSession();

        /** @var ?AccessToken */
        $token = $session->get(self::SESSION_KEY);

        $request->attributes->set(self::SESSION_KEY, $token);
        $session->save();

        return $token;
    }

    /**
     * Persiste un token en session ET met à jour le cache de l'attribut
     * de requête pour que la requête courante le voie immédiatement.
     * N'appelle PAS save() — on laisse le SessionListener (ou un save explicite ailleurs)
     * gérer la sauvegarde en fin de requête, afin de ne pas manipuler le verrou de session ici.
     */
    public function setToken(AccessToken $token): void
    {
        $request = $this->requestStack->getCurrentRequest();

        if (null === $request) {
            throw new \RuntimeException('Impossible de persister le token Keycloak : aucune requête HTTP en cours.');
        }

        if (!$request->hasSession()) {
            throw new \RuntimeException('Impossible de persister le token Keycloak : aucune session disponible pour la requête courante.');
        }

        $request->getSession()->set(self::SESSION_KEY, $token);
        $request->attributes->set(self::SESSION_KEY, $token);
    }
}
