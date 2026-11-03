<?php

namespace App\Security\Token;

/**
 * Claims d’un JWT compact, lus sans vérifier la signature : les jetons viennent de l’échange de code fait par
 * notre serveur et dorment dans un cookie que nous chiffrons, personne d’autre ne peut les écrire.
 */
final class JwtClaims
{
    /**
     * @return array<string, mixed> vide si la chaîne n’est pas un JWT à trois parties portant un objet JSON
     */
    public static function fromJwt(string $jwt): array
    {
        $parts = explode('.', $jwt);
        if (3 !== \count($parts)) {
            return [];
        }

        $payload = base64_decode(strtr($parts[1], '-_', '+/').str_repeat('=', (4 - \strlen($parts[1]) % 4) % 4), true);
        if (false === $payload) {
            return [];
        }

        $claims = json_decode($payload, true);

        return \is_array($claims) && !array_is_list($claims) ? $claims : [];
    }
}
