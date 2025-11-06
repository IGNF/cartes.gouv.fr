<?php

namespace App\Controller\Entrepot;

use App\Constants\EntrepotApi\CommonTags;
use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EntrepotApi\AnnexeApiService;
use App\Services\EntrepotApi\CartesMetadataApiService;
use App\Services\EntrepotApi\CartesStylesApiService;
use App\Services\EntrepotApi\ConfigurationApiService;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Utils;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
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
    private string $varDataPath;

    public function __construct(
        private DatastoreApiService $datastoreApiService,
        private ConfigurationApiService $configurationApiService,
        private AnnexeApiService $annexeApiService,
        private CartesMetadataApiService $cartesMetadataApiService,
        private CartesStylesApiService $cartesStylesApiService,
        private Filesystem $fs,
        ParameterBagInterface $parameters,
    ) {
        $this->varDataPath = $parameters->get('style_files_path');
    }

    #[Route('/{offeringId}/add', name: 'add', methods: ['POST'])]
    public function add(string $datastoreId, string $offeringId, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            $styleName = $data['style_name'];
            $styleTechnicalName = $data['style_technical_name'];

            /** @var array<string,mixed> */
            $styleFiles = $data['style_files'];

            $datastore = $this->datastoreApiService->get($datastoreId);
            $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
            $configuration = $this->configurationApiService->get($datastoreId, $offering['configuration']['_id']);
            $datasheetName = $configuration['tags'][CommonTags::DATASHEET_NAME];

            $styles = $this->cartesStylesApiService->getStyles($datastoreId, $configuration);
            $this->cleanStyleTags($styles);

            $layers = [];
            foreach ($styleFiles as $layerName => $layer) {
                $annexe = $this->saveStyleInAnnexe($datastoreId, $datasheetName, $styleTechnicalName, $layer['style'], 'mapbox' === $layerName ? 'json' : $layer['format']);
                $layerData = [
                    'annexe_id' => $annexe['_id'],
                    'url' => $this->getAnnexeUrl($datastore, $annexe),
                ];

                if ('mapbox' !== $layerName) {
                    $layerData['name'] = $layerName;
                }

                $layers[] = $layerData;
            }

            $styles[] = [
                'name' => $styleName,
                'technical_name' => $styleTechnicalName,
                'current' => true,
                'layers' => $layers,
            ];
            $this->cartesStylesApiService->updateStyles($datastoreId, $configuration['_id'], $styles);
            $this->cartesStylesApiService->updateStylesTmsMetadata($datastoreId, $configuration, $offeringId, $styles);

            try {
                $this->cartesMetadataApiService->updateStyleFiles($datastoreId, $datasheetName);
            } catch (\Throwable) {
                // ne rien faire si erreur
            }

            return new JsonResponse($styles);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}/modify', name: 'modify', methods: ['PATCH'])]
    public function modify(string $datastoreId, string $offeringId, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            $styleName = $data['style_name'];
            $styleTechnicalName = $data['style_technical_name'];

            /** @var array<string,mixed> */
            $styleFiles = $data['style_files'];

            $datastore = $this->datastoreApiService->get($datastoreId);
            $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId);
            $configId = $offering['configuration']['_id'];
            $configuration = $this->configurationApiService->get($datastoreId, $configId);
            $datasheetName = $configuration['tags'][CommonTags::DATASHEET_NAME];

            // Recuperation des styles de la configuration
            $styles = $this->cartesStylesApiService->getStyles($datastoreId, $configuration);
            $this->cleanStyleTags($styles);

            $existingStyleKey = Utils::array_find_key($styles, fn ($style) => ($style['technical_name'] ?? $style['name']) == $styleTechnicalName);
            if (null === $existingStyleKey) {
                throw new CartesApiException("Style $styleTechnicalName n'existe pas", JsonResponse::HTTP_BAD_REQUEST);
            }
            $existingStyle = &$styles[$existingStyleKey];
            $existingStyle['current'] = true;
            $existingStyle['name'] = $styleName;

            // Mapbox : donc une seule couche et elle existe forcément
            if ('mapbox' === array_key_first($styleFiles)) {
                $mapboxLayer = &$existingStyle['layers'][0];
                $annexe = $this->saveStyleInAnnexe($datastoreId, $datasheetName, $styleTechnicalName, $styleFiles['mapbox']['style'], 'json', $mapboxLayer['annexe_id']);
                $mapboxLayer['url'] = $this->getAnnexeUrl($datastore, $annexe);
            } else {
                foreach ($styleFiles as $layerName => $layer) {
                    $existingStyleLayerKey = Utils::array_find_key($existingStyle['layers'], fn ($l) => $l['name'] === $layerName);
                    if (null !== $existingStyleLayerKey) {
                        // Si le layer existe, on met à jour son contenu
                        $existingStyleLayer = &$existingStyle['layers'][$existingStyleLayerKey];
                        $annexe = $this->saveStyleInAnnexe($datastoreId, $datasheetName, $styleTechnicalName, $layer['style'], $layer['format'], $existingStyleLayer['annexe_id']);
                        $existingStyleLayer['url'] = $this->getAnnexeUrl($datastore, $annexe);
                    } else {
                        // Si le layer n'existe pas, on l'ajoute
                        $annexe = $this->saveStyleInAnnexe($datastoreId, $datasheetName, $styleTechnicalName, $layer['style'], $layer['format']);

                        $layerData = [
                            'annexe_id' => $annexe['_id'],
                            'url' => $this->getAnnexeUrl($datastore, $annexe),
                            'name' => $layerName,
                        ];

                        $existingStyle['layers'][] = $layerData;
                    }
                }
            }

            $this->cartesStylesApiService->updateStyles($datastoreId, $configuration['_id'], $styles);
            $this->cartesStylesApiService->updateStylesTmsMetadata($datastoreId, $configuration, $offeringId, $styles);

            try {
                $this->cartesMetadataApiService->updateStyleFiles($datastoreId, $datasheetName);
            } catch (\Throwable) {
                // ne rien faire si erreur
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
            $styleTechnicalName = $data['style_technical_name'];

            $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId);

            $configId = $offering['configuration']['_id'];
            $configuration = $this->configurationApiService->get($datastoreId, $configId);
            $datasheetName = $configuration['tags'][CommonTags::DATASHEET_NAME];

            // Recuperation des styles de la configuration
            $styles = $this->cartesStylesApiService->getStyles($datastoreId, $configuration);

            // Recuperation du style
            $style = array_values(array_filter($styles, static function ($style) use ($styleTechnicalName) {
                return ($style['technical_name'] ?? $style['name']) == $styleTechnicalName;
            }));
            if (0 == count($style)) {
                throw new CartesApiException("Style $styleTechnicalName does not exist", JsonResponse::HTTP_BAD_REQUEST);
            }

            // Suppression de toutes les annexes liees au style
            foreach ($style[0]['layers'] as $layer) {
                $annexeId = $layer['annexe_id'];
                $this->annexeApiService->remove($datastoreId, $annexeId);
            }

            // On enleve le style
            $styles = array_values(array_filter($styles, static function ($style) use ($styleTechnicalName) {
                return ($style['technical_name'] ?? $style['name']) != $styleTechnicalName;
            }));

            // Y-a-t-il un style courant
            $current = array_filter($styles, static function ($style) {
                return isset($style['current']);
            });

            // Plus de style courant, on en met un (le premier)
            if (0 == count($current) && 0 != count($styles)) {
                $styles[0]['current'] = true;
            }

            $this->cartesStylesApiService->updateStyles($datastoreId, $configuration['_id'], $styles);
            $this->cartesStylesApiService->updateStylesTmsMetadata($datastoreId, $configuration, $offeringId, $styles);

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
            $styleTechnicalName = $data['style_technical_name'];

            $offering = $this->configurationApiService->getOffering($datastoreId, $offeringId);

            $configId = $offering['configuration']['_id'];
            $configuration = $this->configurationApiService->get($datastoreId, $configId);

            // Recuperation des styles de la configuration
            $styles = $this->cartesStylesApiService->getStyles($datastoreId, $configuration);

            // Recuperation du style
            $style = array_filter($styles, static function ($style) use ($styleTechnicalName) {
                return ($style['technical_name'] ?? $style['name']) == $styleTechnicalName;
            });
            if (0 == count($style)) {
                throw new CartesApiException("Style $styleTechnicalName does not exists", JsonResponse::HTTP_BAD_REQUEST);
            }

            // Suppression du style courant et mise a jour du style
            $this->cleanStyleTags($styles);
            $this->setCurrent($styles, $styleTechnicalName);

            // Ecriture des styles mis a jour
            $this->cartesStylesApiService->updateStyles($datastoreId, $configuration['_id'], $styles);

            return new JsonResponse($styles);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<mixed> $datastore
     * @param array<mixed> $annexe
     */
    private function getAnnexeUrl(array $datastore, array $annexe): string
    {
        return $this->getParameter('annexes_url').'/'.$datastore['technical_name'].$annexe['paths'][0];
    }

    /**
     * Ajout d'un fichier de style sous forme d'annexe.
     */
    private function saveStyleInAnnexe(string $datastoreId, string $datasheetName, string $styleTechnicalName, string $content, string $extension, ?string $existingAnnexeId = null): array
    {
        $uuid = Uuid::v4();

        $filename = sprintf('%s_%s.%s', $uuid, $styleTechnicalName, $extension);
        $filePath = join('/', [$this->varDataPath, $uuid, $filename]);
        $this->fs->mkdir(dirname($filePath));
        $this->fs->dumpFile($filePath, $content);

        $annexePath = join('/', ['style', $filename]);

        $labels = [
            CommonTags::DATASHEET_NAME.'='.$datasheetName,
            'type=style',
        ];

        if (null !== $existingAnnexeId) {
            $this->annexeApiService->replaceFile($datastoreId, $existingAnnexeId, $filePath);

            return $this->annexeApiService->modify($datastoreId, $existingAnnexeId, [$annexePath]);
        }

        // on crée une nouvelle annexe parce qu'il n'y avait pas d'annexe existante
        return $this->annexeApiService->add($datastoreId, $filePath, [$annexePath], $labels);
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
     * @param string       $styleTechnicalName
     *
     * @return void
     */
    private function setCurrent(&$styles, $styleTechnicalName)
    {
        foreach ($styles as &$style) {
            if (($style['technical_name'] ?? $style['name']) == $styleTechnicalName) {
                $style['current'] = true;
                break;
            }
        }
    }
}
