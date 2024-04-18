<?php

namespace App\Services;

use App\Exception\ApiException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Response;

class EntrepotApiFakeService
{
    private string $mockDataDir;

    public function __construct(
        ParameterBagInterface $parameterBag,
        private Filesystem $fs
    ) {
        $this->mockDataDir = $parameterBag->get('kernel.project_dir').'/tests/mock/entrepot';
    }

    /**
     * @param array<mixed> $query
     */
    public function fakeRequest(string $method, string $url, array $query = [], int $statusCode = 200): mixed
    {
        $filePath = $this->mockDataDir.'/'.$url.'.json';

        if (!$this->fs->exists($filePath)) {
            throw new ApiException('Resource not found', Response::HTTP_NOT_FOUND, ['url' => $url, 'method' => $method, 'query' => $query, 'status_code' => $statusCode]);
        }

        $pathData = json_decode(file_get_contents($filePath), true);

        $queryKey = json_encode($query);

        return $pathData[$queryKey][$method][$statusCode];
    }

    /**
     * @param array<mixed> $query
     */
    public function storeResponse(mixed $response, string $method, string $url, array $query = [], int $statusCode = 200): void
    {
        $filePath = $this->mockDataDir.'/'.$url.'.json';

        $fileContent = [];

        if ($this->fs->exists($filePath)) {
            $fileContent = json_decode(file_get_contents($filePath), true);
        }
        $queryKey = json_encode($query);
        $fileContent[$queryKey][$method][$statusCode] = $response;

        $this->fs->dumpFile($filePath, json_encode($fileContent, JSON_PRETTY_PRINT));
    }
}
