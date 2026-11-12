<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Controller\ApiControllerInterface;
use App\Dto\Services\Form\WfsFormDTO;
use App\Dto\Services\Form\WfsTableFormDTO;
use App\Dto\Services\Wfs\WfsServiceDTO;
use App\Dto\Services\Wfs\WfsTableDTO;
use App\Services\EntrepotApi\CartesServiceApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\ServiceConfigurationRequestBuilder;
use App\Services\EntrepotApi\ServiceImageAnnexeService;
use App\Services\MultipartPayloadMapper;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Exception\ValidationFailedException;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route(
    '/api/datastores/{datastoreId}/stored_data/{storedDataId}/wfs',
    name: 'cartesgouvfr_api_wfs_',
    options: ['expose' => true])]
#[OA\Tag(name: '[cartes.gouv.fr] WFS', description: 'Création/modification des services WFS')]
final class WfsController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private readonly ConfigurationApiService $configurationApiService,
        private readonly CartesServiceApiService $cartesServiceApiService,
        private readonly MultipartPayloadMapper $multipartPayloadMapper,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /**
     * Publication depuis le nouveau formulaire : multipart avec le champ JSON `data` (WfsFormDTO) et les fichiers `thumbnail`, `attribution_logo`.
     */
    #[Route('/publish', name: 'publish', methods: ['POST'])]
    public function publish(string $datastoreId, string $storedDataId, Request $request): JsonResponse
    {
        $dto = $this->multipartPayloadMapper->map($request, WfsFormDTO::class);
        [$thumbnail, $attributionLogo] = $this->imageFiles($request, 'thumbnail', 'attribution_logo');

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
     * Fichiers image facultatifs de la requête, validés ensemble : 422 au chemin du champ, comme les erreurs du DTO.
     *
     * @return list<UploadedFile|null>
     */
    private function imageFiles(Request $request, string ...$fields): array
    {
        $files = [];
        $validator = $this->validator->startContext();
        foreach ($fields as $field) {
            $file = $request->files->get($field);
            $file = $file instanceof UploadedFile ? $file : null;
            $files[] = $file;
            if ($file instanceof UploadedFile) {
                // minWidth oblige à lire les dimensions : un fichier au bon type mais illisible est refusé
                $validator->atPath($field)->validate($file, new Assert\Image(
                    maxSize: ServiceImageAnnexeService::MAX_SIZE,
                    mimeTypes: ServiceImageAnnexeService::MIME_TYPES,
                    minWidth: 1,
                    maxSizeMessage: 'L’image ne peut pas dépasser {{ limit }} {{ suffix }}',
                    mimeTypesMessage: 'L’image doit être au format jpg ou png',
                    sizeNotDetectedMessage: 'L’image est illisible',
                ));
            }
        }

        $violations = $validator->getViolations();
        if (count($violations) > 0) {
            throw new UnprocessableEntityHttpException('Validation Failed', new ValidationFailedException($files, $violations));
        }

        return $files;
    }

    /**
     * @return array<mixed>
     */
    private function getFormConfigTypeInfos(WfsFormDTO $dto, string $storedDataId): array
    {
        $relations = array_map(fn (WfsTableFormDTO $table) => array_filter([
            'native_name' => $table->native_name,
            'public_name' => $table->public_name,
            'title' => $table->title,
            'abstract' => $table->description,
            'keywords' => $table->keywords,
        ], fn ($value) => [] !== $value), $dto->tables);

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
        // création de requête pour la config
        $typeInfos = $this->getConfigTypeInfos($dto, $storedDataId);
        $configRequestBody = ServiceConfigurationRequestBuilder::buildFromCommonDto(ConfigurationTypes::WFS, $dto, $typeInfos);

        $offering = $this->cartesServiceApiService->saveService($datastoreId, $storedDataId, $dto, ConfigurationTypes::WFS, $configRequestBody);

        return $this->json($offering);
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
        // récup config et offering existants
        $oldOffering = $this->configurationApiService->getOffering($datastoreId, $offeringId)->array();
        $oldConfiguration = $this->configurationApiService->get($datastoreId, $oldOffering['configuration']['_id'])->array();
        $oldOffering['configuration'] = $oldConfiguration;

        // création de requête pour la config
        $typeInfos = $this->getConfigTypeInfos($dto, $storedDataId);
        $configRequestBody = ServiceConfigurationRequestBuilder::buildFromCommonDto(ConfigurationTypes::WFS, $dto, $typeInfos, $oldConfiguration);

        $offering = $this->cartesServiceApiService->saveService($datastoreId, $storedDataId, $dto, ConfigurationTypes::WFS, $configRequestBody, $oldOffering);

        return $this->json($offering);
    }

    /**
     * @return array<mixed>
     */
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

            if ($table->keywords) {
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
