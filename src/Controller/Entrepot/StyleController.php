<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\ConfigurationMetadataTypes;
use App\Constants\EntrepotApi\ConfigurationTypes;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesStylesApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route(
    '/api/datastores/{datastoreId}/style',
    name: 'cartesgouvfr_api_style_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[cartes.gouv.fr] styles', description: 'Stockage des fichiers de styles en tant qu\'annexes')]
class StyleController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private AnnexeApiService $annexeApiService,
        private CartesMetadataApiService $cartesMetadataApiService,
        private CartesStylesApiService $cartesStylesApiService,
    ) {
    }

    #[Route('/{offeringId}/add', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, string $offeringId, Request $request): JsonResponse
    {
        try {
            $styleName = $request->request->get('style_name');

            $datastore = $this->datastoreApiService->get($datastoreId);
            $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId);

            $configId = $offering['configuration']['_id'];
            $configuration = $this->configurationApiService->get($datastoreId, $configId);
            $datasheetName = $configuration['tags'][CommonTags::DATASHEET_NAME];

            // Recuperation des styles de la configuration
            $styles = $this->cartesStylesApiService->getStyles($datastoreId, $configuration);

            // Suppression du style courant
            $this->cleanStyleTags($styles);

            // Creation du nouveau style
            $newStyle = ['name' => $styleName, 'current' => true, 'layers' => []];

            $files = $request->files->all();
            foreach ($files['style_files'] as $layer => $file) {
                $annexe = $this->_addFile($datastoreId, $datasheetName, $file);
                if ('no_layer' === $layer) {
                    $newStyle['layers'][] = ['annexe_id' => $annexe['_id']];
                } else {
                    $newStyle['layers'][] = ['name' => $layer, 'annexe_id' => $annexe['_id']];
                }
            }

            $styles[] = $newStyle;
            $this->_addUrls($datastore, $styles);

            $this->updateStyles($datastoreId, $configuration['_id'], $styles);
            $this->updateStylesTmsMetadata($datastoreId, $configuration, $offeringId, $styles);

            try {
                $this->cartesMetadataApiService->updateStyleFiles($datastoreId, $datasheetName);
            } catch (\Throwable $th) {
                //  ne rien faire si erreur
            }

            return new JsonResponse($styles);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}/remove', name: 'remove', methods: ['POST'])]
    public function remove(string $datastoreId, string $offeringId, Request $request): JsonResponse
    {
        try {
            // NOTE array_values re indexe les arrays
            $data = json_decode($request->getContent(), true);
            $styleName = $data['style_name'];

            $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId);

            $configId = $offering['configuration']['_id'];
            $configuration = $this->configurationApiService->get($datastoreId, $configId);
            $datasheetName = $configuration['tags'][CommonTags::DATASHEET_NAME];

            // Recuperation des styles de la configuration
            $styles = $this->cartesStylesApiService->getStyles($datastoreId, $configuration);

            // Recuperation du style
            $style = array_values(array_filter($styles, static function ($style) use ($styleName) {
                return $style['name'] == $styleName;
            }));
            if (0 == count($style)) {
                throw new CartesApiException("Style $styleName does not exists", JsonResponse::HTTP_BAD_REQUEST);
            }

            // Suppression de toutes les annexes liees au style
            foreach ($style[0]['layers'] as $layer) {
                $annexeId = $layer['annexe_id'];
                $this->annexeApiService->remove($datastoreId, $annexeId);
            }

            // On enleve le style
            $styles = array_values(array_filter($styles, static function ($style) use ($styleName) {
                return $style['name'] != $styleName;
            }));

            // Y-a-t-il un style courant
            $current = array_filter($styles, static function ($style) {
                return isset($style['current']);
            });

            // Plus de style courant, on en met un (le premier)
            if (0 == count($current) && 0 != count($styles)) {
                $styles[0]['current'] = true;
            }

            $this->updateStyles($datastoreId, $configuration['_id'], $styles);
            $this->updateStylesTmsMetadata($datastoreId, $configuration, $offeringId, $styles);

            try {
                $this->cartesMetadataApiService->updateStyleFiles($datastoreId, $datasheetName);
            } catch (\Throwable $th) {
                //  ne rien faire si erreur
            }

            return new JsonResponse($styles);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}/setcurrent', name: 'setcurrent', methods: ['POST'])]
    public function setCurrentStyle(string $datastoreId, string $offeringId, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $styleName = $data['style_name'];

            $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId);

            $configId = $offering['configuration']['_id'];
            $configuration = $this->configurationApiService->get($datastoreId, $configId);

            // Recuperation des styles de la configuration
            $styles = $this->cartesStylesApiService->getStyles($datastoreId, $configuration);

            // Recuperation du style
            $style = array_filter($styles, static function ($style) use ($styleName) {
                return $style['name'] == $styleName;
            });
            if (0 == count($style)) {
                throw new CartesApiException("Style $styleName does not exists", JsonResponse::HTTP_BAD_REQUEST);
            }

            // Suppression du style courant et mise a jour du style
            $this->cleanStyleTags($styles);
            $this->setCurrent($styles, $styleName);

            // Ecriture des styles mis a jour
            $this->updateStyles($datastoreId, $configuration['_id'], $styles);

            return new JsonResponse($styles);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * Ajout des urls des annexes.
     *
     * @param array<mixed> $datastore
     * @param array<mixed> $styles
     *
     * @return void
     */
    private function _addUrls($datastore, &$styles)
    {
        $annexeUrl = $this->getParameter('annexes_url');

        foreach ($styles as &$style) {
            foreach ($style['layers'] as &$layer) {
                $annexe = $this->annexeApiService->get($datastore['_id'], $layer['annexe_id']);
                $layer['url'] = $annexeUrl.'/'.$datastore['technical_name'].$annexe['paths'][0];
            }
        }
    }

    /**
     * Ajout d'un fichier de style sous forme d'annexe.
     *
     * @param string       $datastoreId
     * @param string       $datasheetName
     * @param UploadedFile $file
     */
    private function _addFile($datastoreId, $datasheetName, $file): array
    {
        $uuid = Uuid::v4();

        $extension = $file->getClientOriginalExtension();
        $path = join('/', ['style', "$uuid.$extension"]);

        $labels = [
            CommonTags::DATASHEET_NAME.'='.$datasheetName,
            'type=style',
        ];

        return $this->annexeApiService->add($datastoreId, $file->getRealPath(), [$path], $labels);
    }

    /**
     * Suppression de la cle current.
     *
     * @param array<mixed> $styles
     */
    private function cleanStyleTags(&$styles): void
    {
        foreach ($styles as &$style) {
            unset($style['current']);
        }
    }

    /**
     * Suppression de la cle current.
     *
     * @param array<mixed> $styles
     * @param string       $styleName
     *
     * @return void
     */
    private function setCurrent(&$styles, $styleName)
    {
        foreach ($styles as &$style) {
            if ($style['name'] == $styleName) {
                $style['current'] = true;
                break;
            }
        }
    }

    /**
     * Mise à jour des styles dans extra.
     *
     * @param array<mixed> $styles
     */
    private function updateStyles(string $datastoreId, string $configurationId, array $styles): void
    {
        $extra = ['styles' => $styles];
        $this->configurationApiService->modify($datastoreId, $configurationId, ['extra' => $extra]);
    }

    /**
     * @param array<mixed> $configuration
     * @param array<mixed> $styles
     */
    private function updateStylesTmsMetadata(string $datastoreId, array $configuration, string $offeringId, array $styles): void
    {
        if (ConfigurationTypes::WMTSTMS !== $configuration['type']) {
            return;
        }

        $requestBody = [
            'type' => $configuration['type'],
            'name' => $configuration['name'],
            'type_infos' => [
                'title' => $configuration['type_infos']['title'],
                'abstract' => $configuration['type_infos']['abstract'],
                'keywords' => $configuration['type_infos']['keywords'],
                'used_data' => $configuration['type_infos']['used_data'],
            ],
        ];

        if (isset($configuration['attribution']['title']) && isset($configuration['attribution']['url'])) {
            $requestBody['attribution'] = [
                'title' => $configuration['attribution']['title'],
                'url' => $configuration['attribution']['url'],
            ];
        }

        $styleUrlRegex = '/^https?:\/\/[^\s\/$.?#].[^\s]*\/style\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.json$/';

        $metadataList = $configuration['metadata'];

        // suppression des fichiers de style venant de cartes.gouv.fr (voir styleUrlRegex)
        $metadataList = array_values(array_filter($metadataList, function ($metadata) use ($styleUrlRegex) {
            return !('application/json' === $metadata['format'] && preg_match($styleUrlRegex, $metadata['url']) && ConfigurationMetadataTypes::OTHER === $metadata['type']);
        }));

        // ajout des fichiers de style à jour dans la metadata de la configuration
        foreach ($styles as $style) {
            foreach ($style['layers'] as $layer) {
                $metadataList[] = [
                    'format' => 'application/json',
                    'url' => $layer['url'],
                    'type' => ConfigurationMetadataTypes::OTHER,
                ];
            }
        }

        $requestBody['metadata'] = $metadataList;

        $this->configurationApiService->replace($datastoreId, $configuration['_id'], $requestBody);
        $this->configurationApiService->syncOffering($datastoreId, $offeringId);
    }
}
