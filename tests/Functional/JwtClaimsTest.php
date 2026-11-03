<?php

namespace App\Tests\Functional;

use App\Security\Token\JwtClaims;
use App\Tests\Double\FakeKeycloakClient;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class JwtClaimsTest extends TestCase
{
    public function testReadsTheClaimsOfACompactJwt(): void
    {
        $claims = ['sub' => 'abc', 'email' => 'a@example.test', 'n' => 1];

        self::assertSame($claims, JwtClaims::fromJwt(FakeKeycloakClient::jwt($claims)));
    }

    /** @return iterable<string, array{string}> */
    public static function unreadableTokens(): iterable
    {
        yield 'opaque' => ['fake-access-token'];
        yield 'JWE à cinq parties' => ['a.b.c.d.e'];
        yield 'base64 invalide' => ['a.%%%.c'];
        yield 'charge non objet' => ['a.'.rtrim(strtr(base64_encode('[1,2]'), '+/', '-_'), '=').'.c'];
        yield 'charge non JSON' => ['a.'.rtrim(strtr(base64_encode('pas du json'), '+/', '-_'), '=').'.c'];
    }

    #[DataProvider('unreadableTokens')]
    public function testUnreadableTokenGivesNoClaims(string $jwt): void
    {
        self::assertSame([], JwtClaims::fromJwt($jwt));
    }
}
