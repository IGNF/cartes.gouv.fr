<?php

declare(strict_types=1);

namespace App\Services;

use App\ApiClient\ApiClient;
use App\Exception\ApiException;
use App\Exception\AppException;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\DependencyInjection\Attribute\AutowireServiceClosure;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

final readonly class GeocaptchaService
{
    public const INVALID_MESSAGE = 'La vérification du captcha a échoué';
    public const UNAVAILABLE_MESSAGE = 'La vérification du captcha est indisponible, réessayez plus tard';
    private const TOKEN_MAX_LENGTH = 512;

    /**
     * @param \Closure(): ApiClient $apiClient construit seulement si la vérification est activée
     */
    public function __construct(
        #[Autowire(env: 'bool:GEOCAPTCHA_ENABLED')]
        private bool $enabled,
        #[AutowireServiceClosure('app.api_client.geocaptcha')]
        private \Closure $apiClient,
        private LoggerInterface $logger,
    ) {
    }

    /**
     * Sans effet si GEOCAPTCHA_ENABLED vaut false.
     *
     * @throws BadRequestHttpException jeton absent ou challenge non résolu
     * @throws AppException            503 si l’API GéoCaptcha est injoignable, refuse la clé (401, 403) ou répond en 5xx
     */
    public function check(?string $token): void
    {
        if (!$this->enabled) {
            return;
        }

        $segment = rawurlencode((string) $token);
        // « . » et « .. » survivent à rawurlencode et seraient résolus par le client HTTP
        if ('' === $segment || strlen($segment) > self::TOKEN_MAX_LENGTH || in_array($segment, ['.', '..'], true)) {
            throw new BadRequestHttpException(self::INVALID_MESSAGE);
        }

        try {
            $result = ($this->apiClient)()->get("challenge/{$segment}/validation")->array();
        } catch (ApiException $e) {
            $status = $e->getStatusCode();
            // 401/403 : clé ou accès refusés, une panne de configuration et non un captcha raté
            if ($status < 500 && !in_array($status, [Response::HTTP_UNAUTHORIZED, Response::HTTP_FORBIDDEN], true)) {
                // msg de l’API (ex. « Application unknown » : referer non déclaré), sans le jeton
                $this->logger->warning('geocaptcha.validation.rejected', ['status' => $status, 'msg' => $e->getMessage()]);

                throw new BadRequestHttpException(self::INVALID_MESSAGE);
            }
            // pas le message : il contient l’URL, donc le jeton
            $this->logger->error('geocaptcha.validation.unavailable', ['status' => $status]);

            throw new AppException(self::UNAVAILABLE_MESSAGE, Response::HTTP_SERVICE_UNAVAILABLE);
        }

        if (true !== ($result['result'] ?? null)) {
            // msg porte la session du visiteur (IP, referer) : seuls success et attempts sont gardés
            $msg = $result['msg'] ?? null;
            $this->logger->warning('geocaptcha.validation.rejected', [
                'result' => $result['result'] ?? null,
                'msg' => is_array($msg) ? array_intersect_key($msg, array_flip(['success', 'attempts'])) : $msg,
            ]);

            throw new BadRequestHttpException(self::INVALID_MESSAGE);
        }
    }
}
