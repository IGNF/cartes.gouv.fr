<?php

namespace App\ApiClient\Auth;

/**
 * Le compte de service n'a pas pu obtenir de token auprès de Keycloak.
 */
final class ServiceAccountAuthenticationException extends \RuntimeException
{
}
