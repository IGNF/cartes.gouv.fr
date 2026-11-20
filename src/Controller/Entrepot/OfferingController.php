<?php

namespace App\Controller\Entrepot;

use App\Controller\ApiControllerInterface;
use App\Services\EntrepotApi\ConfigurationApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route(
    '/api/datastores/{datastoreId}/offerings',
    name: 'cartesgouvfr_api_offering_',
    options: ['expose' => true])]
#[OA\Tag(name: '[cartes.gouv.fr] offerings', description: 'Offres brutes de l’Entrepôt : liste de l’entrepôt et statistiques')]
final class OfferingController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly ConfigurationApiService $configurationApiService,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function getOfferings(string $datastoreId, #[MapQueryParameter] bool $detailed = false, #[MapQueryParameter] bool $detailedConfiguration = false): JsonResponse
    {
        if ($detailed) {
            $offerings = $this->configurationApiService->getAllOfferingsDetailed($datastoreId)->resolve();
        } else {
            $offerings = $this->configurationApiService->getAllOfferings($datastoreId)->resolve();
        }

        if ($detailedConfiguration) {
            $pendingConfigurationsById = [];

            foreach ($offerings as $offering) {
                $configId = $offering['configuration']['_id'];
                $pendingConfigurationsById[$configId] = $this->configurationApiService->get($datastoreId, $configId);
            }

            $configurationsById = $this->configurationApiService->api->resolveAll($pendingConfigurationsById);

            foreach ($offerings as &$offering) {
                $configId = $offering['configuration']['_id'];
                $offering['configuration'] = $configurationsById[$configId];
            }
            unset($offering);
        }

        return $this->json($offerings);
    }

    #[Route('/{offeringId}/stats', name: 'stats', methods: ['GET'], requirements: ['offeringId' => Requirement::UUID_V4])]
    public function getOfferingStats(string $datastoreId, string $offeringId, Request $request): JsonResponse
    {
        $query = $request->query->all();
        $stats = $this->configurationApiService->getOfferingStats($datastoreId, $offeringId, $query)->resolve();

        return $this->json($stats);
    }
}
