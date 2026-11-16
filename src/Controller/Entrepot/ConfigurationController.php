<?php

declare(strict_types=1);

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\AppException;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route(
    '/api/datastores/{datastoreId}/configurations',
    name: 'cartesgouvfr_api_configuration_',
    options: ['expose' => true])]
#[OA\Tag(name: '[cartes.gouv.fr] configurations', description: 'Configurations sans offre')]
final class ConfigurationController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly ConfigurationApiService $configurationApiService,
        private readonly CartesServiceApiService $cartesServiceApiService,
    ) {
    }

    #[Route('/{configurationId}', name: 'delete', methods: ['DELETE'], requirements: ['configurationId' => Requirement::UUID_V4])]
    public function delete(string $datastoreId, string $configurationId): Response
    {
        $configuration = $this->configurationApiService->get($datastoreId, $configurationId)->array();

        try {
            $this->cartesServiceApiService->removeConfiguration($datastoreId, $configuration);
        } catch (ApiException $e) {
            if (Response::HTTP_CONFLICT === $e->getStatusCode()) {
                throw new AppException('La configuration est encore publiée : supprimez le flux depuis sa ligne', Response::HTTP_CONFLICT, $e->getDetails(), $e);
            }
            throw $e;
        }

        return new Response(null, Response::HTTP_NO_CONTENT);
    }
}
