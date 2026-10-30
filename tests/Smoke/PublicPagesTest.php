<?php

namespace App\Tests\Smoke;

use App\Exception\ApiErrorType;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class PublicPagesTest extends WebTestCase
{
    public function testHealthRouteAnswersOk(): void
    {
        $client = self::createClient();
        $client->request('GET', '/tableau-de-bord/health');

        self::assertResponseIsSuccessful();
        self::assertSame('OK', $client->getResponse()->getContent());
    }

    public function testPublicPageRendersTheApplicationShell(): void
    {
        $client = self::createClient();
        $client->request('GET', '/publier-une-donnee');

        self::assertResponseIsSuccessful();
        self::assertSelectorExists('#root[data-app-env="test"]');
        self::assertSelectorNotExists('#user');
    }

    public function testAnonymousApiRequestAnswersJsonUnauthorized(): void
    {
        $client = self::createClient();
        $client->xmlHttpRequest('GET', '/api/users/me');

        self::assertResponseStatusCodeSame(401);
        self::assertResponseHeaderSame('content-type', 'application/problem+json');

        $body = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertSame(401, $body['status']);
        self::assertSame(ApiErrorType::ANONYMOUS, $body['type']);
    }
}
