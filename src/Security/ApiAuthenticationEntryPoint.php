<?php

namespace App\Security;

use App\Exception\ApiErrorType;
use App\Exception\AppException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;

/**
 * Point d’entrée du pare-feu `api` : seul producteur du 401 `/errors/anonymous`, pour toute requête d’API sans cookie valide (un 401 amont relayé n’en porte pas le type).
 *
 * @SuppressWarnings(UnusedFormalParameter) signature imposée par l'interface
 */
final class ApiAuthenticationEntryPoint implements AuthenticationEntryPointInterface
{
    public const DETAIL = 'Connexion requise';

    // lever plutôt que répondre : le pare-feu relaie l’exception au rendu d’erreur, qui produit le corps Problem Details
    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        throw new AppException(self::DETAIL, Response::HTTP_UNAUTHORIZED, type: ApiErrorType::ANONYMOUS);
    }
}
