<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\ApiClient\ApiClient;
use App\ApiClient\ErrorParser\GeocaptchaErrorParser;
use App\Services\GeocaptchaService;
use PHPUnit\Framework\TestCase;
use Psr\Log\AbstractLogger;
use Psr\Log\NullLogger;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

final class GeocaptchaServiceTest extends TestCase
{
    public function testUnresolvedChallengeLogsOnlySuccessAndAttempts(): void
    {
        $logger = new class extends AbstractLogger {
            /** @var list<array{string, string, array<mixed>}> */
            public array $records = [];

            public function log($level, \Stringable|string $message, array $context = []): void
            {
                $this->records[] = [(string) $level, (string) $message, $context];
            }
        };
        $body = ['result' => false, 'msg' => ['success' => false, 'attempts' => 3, 'ip' => '192.0.2.10', 'referer' => 'https://example.test/', 'appId' => 'app']];
        $client = new ApiClient(new MockHttpClient(new MockResponse((string) json_encode($body), ['response_headers' => ['content-type' => 'application/json']]), 'https://geocaptcha.test/api/v1/'), new GeocaptchaErrorParser(), new NullLogger());
        $service = new GeocaptchaService(true, fn (): ApiClient => $client, $logger);

        try {
            $service->check('jeton');
            self::fail('400 attendue');
        } catch (BadRequestHttpException $e) {
            self::assertSame(GeocaptchaService::INVALID_MESSAGE, $e->getMessage());
        }

        self::assertSame([['warning', 'geocaptcha.validation.rejected', ['result' => false, 'msg' => ['success' => false, 'attempts' => 3]]]], $logger->records);
    }
}
