<?php

namespace App\ApiClient;

use App\ApiClient\ErrorParser\ErrorParserInterface;
use App\Exception\ApiException;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

final class ResponsePromise
{
    public function __construct(
        private ResponseInterface $response,
        private ErrorParserInterface $errorParser,
    ) {
    }

    /**
     * Consomme la réponse comme un tableau JSON parsé.
     *
     * @return array<mixed>
     *
     * @throws ApiException
     */
    public function array(): array
    {
        $this->assertSuccess();

        if ('' === $this->response->getContent()) {
            return [];
        }

        return $this->response->toArray();
    }

    /**
     * Consomme la réponse comme une chaîne de texte brute.
     *
     * @throws ApiException
     */
    public function text(): string
    {
        $this->assertSuccess();

        return $this->response->getContent();
    }

    /**
     * Consomme la réponse comme un tableau JSON parsé, et retourne aussi les headers de la réponse (pour les endpoints paginés).
     *
     * @throws ApiException
     */
    public function arrayWithHeaders(): PaginatedResponse
    {
        return new PaginatedResponse($this->array(), $this->response->getHeaders(false));
    }

    /**
     * Alias de array(), plus lisible dans les contextes synchrones/bloquants.
     *
     * @return array<mixed>
     *
     * @throws ApiException
     */
    public function await(): array
    {
        return $this->array();
    }

    /**
     * Applique une transformation à la réponse JSON, en restant lazy jusqu'à la consommation. Utile pour les cas où on veut faire du mapping ou filtrage avant de consommer la réponse.
     *
     * @param callable(array<mixed>): mixed $transform
     */
    public function then(callable $transform): mixed
    {
        return $transform($this->array());
    }

    public function getResponse(): ResponseInterface
    {
        return $this->response;
    }

    /**
     * Consomme plusieurs ResponsePromises en parallèle (équivalent de Promise.all).
     * Toutes les réponses doivent provenir de la même instance de HttpClient pour permettre le streaming.
     * Les erreurs sont ignorées si $continueOnError=true, auquel cas les réponses en erreur auront une valeur null dans le tableau de résultats.
     *
     * @param array<int|string, ResponsePromise> $pendingsByKey
     *
     * @return array<int|string, array<mixed>>
     */
    public static function all(
        HttpClientInterface $httpClient,
        array $pendingsByKey,
        bool $continueOnError = false,
        ?LoggerInterface $logger = null,
    ): array {
        if ([] === $pendingsByKey) {
            return [];
        }

        $resolved = [];
        $responseKeyMap = [];
        $responseList = [];

        foreach ($pendingsByKey as $key => $pending) {
            $response = $pending->getResponse();
            $responseList[] = $response;
            $responseKeyMap[spl_object_id($response)] = ['key' => $key, 'pending' => $pending];
        }

        foreach ($httpClient->stream($responseList) as $response => $chunk) {
            $responseId = spl_object_id($response);
            $entry = $responseKeyMap[$responseId] ?? null;

            if (null === $entry) {
                continue;
            }

            if ($chunk->isTimeout()) {
                if (!$continueOnError) {
                    throw new ApiException('Timeout de stream lors de la résolution asynchrone', Response::HTTP_SERVICE_UNAVAILABLE, ['key' => $entry['key']]);
                }

                $logger?->warning('Timeout de stream détecté lors de la résolution asynchrone', [
                    'key' => $entry['key'],
                ]);

                continue;
            }

            if (!$chunk->isLast()) {
                continue;
            }

            try {
                $resolved[$entry['key']] = $entry['pending']->array();
            } catch (\Throwable $exception) {
                if (!$continueOnError) {
                    throw $exception;
                }

                $logger?->warning('Requête asynchrone ignorée après échec', [
                    'key' => $entry['key'],
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        ksort($resolved);

        return $resolved;
    }

    /**
     * Vérifie le statut de la réponse et lève une ApiException si ce n'est pas un code 2xx.
     *
     * @throws ApiException
     */
    private function assertSuccess(): void
    {
        try {
            $statusCode = $this->response->getStatusCode();
        } catch (TransportExceptionInterface $e) {
            throw new ApiException(sprintf('Erreur réseau: %s', $e->getMessage()), Response::HTTP_SERVICE_UNAVAILABLE, previous: $e);
        }

        if ($statusCode >= 200 && $statusCode < 300) {
            if (Response::HTTP_NO_CONTENT === $statusCode) {
                return;
            }

            return;
        }

        $errorResponse = $this->errorParser->extractErrorResponse($this->response);
        $errorMessage = $this->errorParser->extractErrorMessage($errorResponse, $this->response);

        throw $this->errorParser->createApiException($errorMessage, $statusCode, $errorResponse);
    }
}
