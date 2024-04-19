<?php

namespace App\Services\EspaceCoApi;

use Psr\Log\LoggerInterface;
use App\Services\AbstractApiService;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpClient\Exception\JsonException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;


class BaseEspaceCoApiService extends AbstractApiService
{
    public function __construct(
        HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        RequestStack $requestStack,
        LoggerInterface $logger
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
        } /* else {
            $errorMsg = 'EspaceCo API Error';
            try {
                $errorResponse = $response->toArray(false);
                if (array_key_exists('error_description', $errorResponse)) {
                    $errorMsg = is_array($errorResponse['error_description']) ? implode(', ', $errorResponse['error_description']) : $errorResponse['error_description'];
                }
            } catch (JsonException $ex) {
                $errorResponse = $response->getContent(false);
            }
            TODO throw new ApiException($errorMsg, $statusCode, $errorResponse);
        } */

        // TODO SUPPRIMER
        return [];
    }
}
