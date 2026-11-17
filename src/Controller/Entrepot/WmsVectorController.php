<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\Form\WmsVectorFormDTO;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\StaticApiService;
use App\Services\EntrepotApi\WmsVectorStyleFileService;
use App\Services\MultipartPayloadMapper;
use App\Services\ServiceFormFileValidator;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route(
    '/api/datastores/{datastoreId}/stored_data/{storedDataId}/wmsvector',
    name: 'cartesgouvfr_api_wmsvector_',
    options: ['expose' => true])]
#[OA\Tag(name: '[cartes.gouv.fr] WMS-VECTOR', description: 'Création des services WMS-VECTOR')]
final class WmsVectorController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly CartesServiceApiService $cartesServiceApiService,
        private readonly StaticApiService $staticApiService,
        private readonly MultipartPayloadMapper $multipartPayloadMapper,
        private readonly ServiceFormFileValidator $serviceFormFileValidator,
        private readonly WmsVectorStyleFileService $wmsVectorStyleFileService,
    ) {
    }

    /**
     * Publication depuis le nouveau formulaire : multipart avec le champ JSON `data` (WmsVectorFormDTO), un fichier SLD `style_files[<table>]` par table et les fichiers `thumbnail`, `attribution_logo`.
     */
    #[Route('/publish', name: 'publish', methods: ['POST'])]
    public function publish(string $datastoreId, string $storedDataId, Request $request): JsonResponse
    {
        $dto = $this->multipartPayloadMapper->map($request, WmsVectorFormDTO::class);
        [$thumbnail, $attributionLogo] = $this->serviceFormFileValidator->images($request, 'thumbnail', 'attribution_logo');
        $styleFiles = $this->serviceFormFileValidator->styleFiles($request, $dto->selected_tables);

        // nom temporaire : l’identifiant de la configuration n’existe pas encore
        $staticIds = $this->wmsVectorStyleFileService->upload($datastoreId, $styleFiles, 'tmp_'.Uuid::v4());

        $offering = $this->cartesServiceApiService->publishFromForm(
            $datastoreId,
            $storedDataId,
            $dto,
            ConfigurationTypes::WMSVECTOR,
            $this->getFormConfigTypeInfos($dto, $staticIds, $storedDataId),
            $thumbnail,
            $attributionLogo,
            // renommage avant l’offre : un échec annule encore la configuration
            function (string $configurationId) use ($datastoreId, $staticIds): void {
                foreach ($staticIds as $tableName => $staticId) {
                    $this->staticApiService->modifyInfo($datastoreId, $staticId, [
                        'name' => WmsVectorStyleFileService::name($configurationId, $tableName),
                    ])->await();
                }
            },
            // après l’offre, les fichiers restent : le flux les utilise
            fn () => $this->wmsVectorStyleFileService->removeQuietly($datastoreId, $staticIds),
        );

        return $this->json($offering, Response::HTTP_CREATED);
    }

    /**
     * @param array<string, string> $staticIds
     *
     * @return array<mixed>
     */
    private function getFormConfigTypeInfos(WmsVectorFormDTO $dto, array $staticIds, string $storedDataId): array
    {
        return [
            'title' => $dto->title,
            'abstract' => $dto->description,
            'keywords' => $dto->themes,
            'used_data' => [[
                'relations' => array_map(fn (string $tableName) => ['name' => $tableName, 'style' => $staticIds[$tableName]], $dto->selected_tables),
                'stored_data' => $storedDataId,
            ]],
        ];
    }
}
