<?php

namespace App\Tests\Support;

use App\Security\State\LoginStateSerializer;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;

/**
 * Connexion par le retour Keycloak doublé (FakeKeycloakClient) : le client reçoit le cookie d’authentification.
 */
trait KeycloakLoginTrait
{
    // https : le cookie est Secure, le navigateur de test ne le renvoie qu’en https
    private const BASE = 'https://localhost';

    private function logIn(KernelBrowser $client): void
    {
        $state = self::getContainer()->get(LoginStateSerializer::class)->encode(['referer' => null]);
        $client->request('GET', self::BASE.'/login/check?code=fake-code&state='.urlencode($state));
        self::assertResponseRedirects(self::BASE.'/');
    }

    /** @return array<mixed> */
    private function jsonResponse(KernelBrowser $client): array
    {
        $json = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertIsArray($json);

        return $json;
    }
}
