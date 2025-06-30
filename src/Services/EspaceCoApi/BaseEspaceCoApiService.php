<?php

namespace App\Services\EspaceCoApi;

use App\Exception\ApiException;
use App\Services\AbstractApiService;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class BaseEspaceCoApiService extends AbstractApiService
{
    public function __construct(
        HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        RequestStack $requestStack,
        LoggerInterface $logger,
    ) {
        parent::__construct($httpClient, $parameters, $filesystem, $requestStack, $logger, 'api_espaceco_url');
    }

    /**
     * @SuppressWarnings(ElseExpression)
     */
    protected function handleResponse(ResponseInterface $response, bool $expectJson): mixed
    {
        $content = null;
        $statusCode = $response->getStatusCode();

        if ($statusCode >= 200 && $statusCode < 300) { // requête réussie
            if (Response::HTTP_NO_CONTENT === $statusCode || '' === $response->getContent()) {
                $content = [];
            } else {
                // si on attend une réponse au format JSON
                $content = $expectJson ? $response->toArray() : $response->getContent();
            }

            return $content;
        } else {
            $errorResponse = $response->toArray(false);
            throw new ApiException($errorResponse['message'], $statusCode);
        }
    }
}
