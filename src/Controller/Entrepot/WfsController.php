<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\Form\WfsFormDTO;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ServiceConfigurationRequestBuilder;
use App\Services\MultipartPayloadMapper;
use App\Services\ServiceFormFileValidator;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/datastores/{datastoreId}/stored_data/{storedDataId}/wfs',
    name: 'cartesgouvfr_api_wfs_',
    options: ['expose' => true])]
#[OA\Tag(name: '[cartes.gouv.fr] WFS', description: 'Création des services WFS')]
final class WfsController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly CartesServiceApiService $cartesServiceApiService,
        private readonly MultipartPayloadMapper $multipartPayloadMapper,
        private readonly ServiceFormFileValidator $serviceFormFileValidator,
    ) {
    }

    /**
     * Publication depuis le nouveau formulaire : multipart avec le champ JSON `data` (WfsFormDTO) et les fichiers `thumbnail`, `attribution_logo`.
     */
    #[Route('/publish', name: 'publish', methods: ['POST'])]
    public function publish(string $datastoreId, string $storedDataId, Request $request): JsonResponse
    {
        $dto = $this->multipartPayloadMapper->map($request, WfsFormDTO::class);
        [$thumbnail, $attributionLogo] = $this->serviceFormFileValidator->images($request, 'thumbnail', 'attribution_logo');

        $offering = $this->cartesServiceApiService->publishFromForm(
            $datastoreId,
            $storedDataId,
            $dto,
            ConfigurationTypes::WFS,
            $this->getFormConfigTypeInfos($dto, $storedDataId),
            $thumbnail,
            $attributionLogo,
        );

        return $this->json($offering, Response::HTTP_CREATED);
    }

    /**
     * @return array<mixed>
     */
    private function getFormConfigTypeInfos(WfsFormDTO $dto, string $storedDataId): array
    {
        return [
            'used_data' => [[
                'relations' => ServiceConfigurationRequestBuilder::buildWfsRelations($dto->tables),
                'stored_data' => $storedDataId,
            ]],
        ];
    }
}
