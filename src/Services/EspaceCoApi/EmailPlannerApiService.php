<?php

namespace App\Services\EspaceCoApi;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class EmailPlannerApiService extends BaseEspaceCoApiService
{
    public function __construct(HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        RequestStack $requestStack,
        LoggerInterface $logger
    ) {
        parent::__construct($httpClient, $parameters, $filesystem, $requestStack, $logger);
    }

    /**
     * @return array<mixed>
     */
    public function getAll(int $communityId): array
    {
        return $this->requestAll("communities/$communityId/emailplanners");
    }

    /**
     * @param array<mixed> $data
     */
    public function add(int $communityId, array $data): array
    {
        return $this->request('POST', "communities/$communityId/emailplanners", $data);
    }

    public function remove(int $communityId, int $emailPlannerId): array
    {
        return $this->request('DELETE', "communities/$communityId/emailplanners/$emailPlannerId");
    }
}
