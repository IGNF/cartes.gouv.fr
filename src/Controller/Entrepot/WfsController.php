<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\Form\WfsFormDTO;
use App\Dto\Services\Form\WfsTableFormDTO;
use App\Dto\Services\Wfs\WfsServiceDTO;
use App\Dto\Services\Wfs\WfsTableDTO;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\CapabilitiesService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Services\MultipartPayloadMapper;
use App\Services\SandboxService;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/stored_data/{storedDataId}/wfs',
    name: 'cartesgouvfr_api_wfs_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[cartes.gouv.fr] WFS', description: 'Création/modification des services WFS')]
class WfsController extends ServiceController implements ApiControllerInterface
{
    public function __construct(
        DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private CartesServiceApiService $cartesServiceApiService,
        CapabilitiesService $capabilitiesService,
        CartesMetadataApiService $cartesMetadataApiService,
        SandboxService $sandboxService,
        private MultipartPayloadMapper $payloadMapper,
    ) {
        parent::__construct($datastoreApiService, $configurationApiService, $cartesServiceApiService, $capabilitiesService, $cartesMetadataApiService, $sandboxService);
    }

    /**
     * Publication depuis le nouveau formulaire : champ JSON `data` (WfsFormDTO) et fichiers `thumbnail`, `attribution_logo`.
     */
    #[Route('/publish', name: 'publish', methods: ['POST'])]
    public function publish(string $datastoreId, string $storedDataId, Request $request): JsonResponse
    {
        $dto = $this->payloadMapper->map($request, WfsFormDTO::class);
        $thumbnail = $request->files->get('thumbnail');
        $attributionLogo = $request->files->get('attribution_logo');

        try {
            $offering = $this->cartesServiceApiService->publishFromForm(
                $datastoreId,
                $storedDataId,
                $dto,
                ConfigurationTypes::WFS,
                $this->getFormConfigTypeInfos($dto, $storedDataId),
                $thumbnail instanceof UploadedFile ? $thumbnail : null,
                $attributionLogo instanceof UploadedFile ? $attributionLogo : null,
            );

            return $this->json($offering, Response::HTTP_CREATED);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @return array<mixed>
     */
    private function getFormConfigTypeInfos(WfsFormDTO $dto, string $storedDataId): array
    {
        $relations = [];

        /** @var WfsTableFormDTO $table */
        foreach ($dto->tables as $table) {
            $relation = [
                'native_name' => $table->native_name,
                'public_name' => $table->public_name,
                'title' => $table->title,
                'abstract' => $table->description,
            ];
            if ([] !== $table->keywords) {
                $relation['keywords'] = $table->keywords;
            }
            $relations[] = $relation;
        }

        return [
            'used_data' => [[
                'relations' => $relations,
                'stored_data' => $storedDataId,
            ]],
        ];
    }

    #[Route('/', name: 'add', methods: ['POST'])]
    public function add(
        string $datastoreId,
        string $storedDataId,
        #[MapRequestPayload] WfsServiceDTO $dto,
    ): JsonResponse {
        try {
            // création de requête pour la config
            $typeInfos = $this->getConfigTypeInfos($dto, $storedDataId);
            $configRequestBody = $this->getConfigRequestBody(ConfigurationTypes::WFS, $dto, $typeInfos);

            $offering = $this->cartesServiceApiService->saveService($datastoreId, $storedDataId, $dto, ConfigurationTypes::WFS, $configRequestBody);

            return $this->json($offering);
        } catch (ApiException $ex) {
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
        #[MapRequestPayload] WfsServiceDTO $dto,
    ): JsonResponse {
        try {
            // récup config et offering existants
            $oldOffering = $this->configurationApiService->getOffering($datastoreId, $offeringId)->array();
            $oldConfiguration = $this->configurationApiService->get($datastoreId, $oldOffering['configuration']['_id'])->array();
            $oldOffering['configuration'] = $oldConfiguration;

            // création de requête pour la config
            $typeInfos = $this->getConfigTypeInfos($dto, $storedDataId);
            $configRequestBody = $this->getConfigRequestBody(ConfigurationTypes::WFS, $dto, $typeInfos, $oldConfiguration);

            $offering = $this->cartesServiceApiService->saveService($datastoreId, $storedDataId, $dto, ConfigurationTypes::WFS, $configRequestBody, $oldOffering);

            return $this->json($offering);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    private function getConfigTypeInfos(WfsServiceDTO $dto, string $storedDataId): array
    {
        $relations = [];

        /** @var WfsTableDTO $table */
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

        return [
            'used_data' => [[
                'relations' => $relations,
                'stored_data' => $storedDataId,
            ]],
        ];
    }
}
