<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Dto\WfsAddDTO;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\CartesServiceApi;
use App\Services\EntrepotApiService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route(
    '/api/datastores/{datastoreId}/stored_data/{storedDataId}/wfs',
    name: 'cartesgouvfr_api_wfs_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class WfsController extends ServiceController implements ApiControllerInterface
{
    public function __construct(
        private EntrepotApiService $entrepotApiService,
        private CartesServiceApi $cartesServiceApi,
    ) {
        parent::__construct($entrepotApiService, $cartesServiceApi);
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(
        string $datastoreId,
        string $storedDataId,
        #[MapRequestPayload] WfsAddDTO $dto): JsonResponse
    {
        try {
            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $storedDataId);

            $storedData = $this->entrepotApiService->storedData->get($datastoreId, $storedDataId);

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WFS, $dto->share_with);

            // Ajout de la configuration
            $configuration = $this->entrepotApiService->configuration->add($datastoreId, $configRequestBody);
            $configuration = $this->entrepotApiService->configuration->addTags($datastoreId, $configuration['_id'], [
                CommonTags::DATASHEET_NAME => $storedData['tags'][CommonTags::DATASHEET_NAME],
            ]);

            // Creation d'une offering
            $offering = $this->entrepotApiService->configuration->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open']);
            $offering['configuration'] = $configuration;

            return $this->json($offering);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * Crée de nouveaux config et offering et supprime les anciens.
     */
    #[Route('/{offeringId}/edit', name: 'edit', methods: ['POST'])]
    public function edit(
        string $datastoreId,
        string $storedDataId,
        string $offeringId,
        #[MapRequestPayload] WfsAddDTO $dto): JsonResponse
    {
        try {
            // récup anciens config et offering
            $oldOffering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);
            $oldConfiguration = $this->entrepotApiService->configuration->get($datastoreId, $oldOffering['configuration']['_id']);

            // suppression anciens configs et offering
            $this->cartesServiceApi->wfsUnpublish($datastoreId, $oldOffering, false);

            // création de requête pour la config
            $configRequestBody = $this->getConfigRequestBody($dto, $storedDataId);

            $endpoint = $this->getEndpointByShareType($datastoreId, ConfigurationTypes::WFS, $dto->share_with);

            // Ajout de la configuration
            $configuration = $this->entrepotApiService->configuration->add($datastoreId, $configRequestBody);
            $configuration = $this->entrepotApiService->configuration->addTags($datastoreId, $configuration['_id'], $oldConfiguration['tags']);

            // Creation d'une offering
            $offering = $this->entrepotApiService->configuration->addOffering($datastoreId, $configuration['_id'], $endpoint['_id'], $endpoint['open']);
            $offering['configuration'] = $configuration;

            return $this->json($offering);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    private function getConfigRequestBody(WfsAddDTO $dto, string $storedDataId): array
    {
        $relations = [];
        foreach ($dto->table_infos as $table) {
            $relation = [
                'native_name' => $table->native_name,
                'title' => $table->title,
                'abstract' => $table->description,
            ];
            if ($table->public_name) {
                $relation['public_name'] = $table->public_name;
            }

            if ($table->keywords && 0 !== count($table->keywords)) {
                $relation['keywords'] = $table->keywords;
            }
            $relations[] = $relation;
        }

        $body = [
            'type' => ConfigurationTypes::WFS,
            'name' => $dto->public_name,
            'layer_name' => $dto->technical_name,
            'attribution' => [
                'title' => $dto->attribution_text,
                'url' => $dto->attribution_url,
            ],
            'type_infos' => [
                'used_data' => [[
                    'relations' => $relations,
                    'stored_data' => $storedDataId,
                ]],
            ],
        ];

        return $body;
    }
}
