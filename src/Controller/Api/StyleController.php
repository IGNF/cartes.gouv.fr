<?php

namespace App\Controller\Api;

use App\Constants\EntrepotApi\CommonTags;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Services\EntrepotApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Uid\Uuid;

#[Route(
    '/api/datastore/{datastoreId}/style',
    name: 'cartesgouvfr_api_style_'
)]
class StyleController extends AbstractController implements ApiControllerInterface
{
    public function __construct(
        private EntrepotApiService $entrepotApiService
    ) {
    }

    #[Route('/{offeringId}/add', name: 'add', methods: ['POST'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function add(string $datastoreId, string $offeringId, Request $request): JsonResponse
    {
        try {
            $styleName = $request->request->get("style_name");
            
            $datastore = $this->entrepotApiService->datastore->get($datastoreId);
            $offering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);

            $configId = $offering['configuration']['_id'];
            $configuration = $this->entrepotApiService->configuration->get($datastoreId, $configId);
            $datasheetName = $configuration['tags'][CommonTags::DATASHEET_NAME];

            // Recuperation des styles de la configuration
            $path = "/configuration/$configId/styles.json";
            $styleAnnexes = $this->entrepotApiService->annexe->getAll($datastoreId, null, $path);

            $styles = [];
            if (count($styleAnnexes)) {
                $content = $this->entrepotApiService->annexe->download($datastoreId, $styleAnnexes[0]['_id']);
                $styles = json_decode($content, true);
            }

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

            // Re ecriture dans le fichier
            $annexeId = count($styleAnnexes) ? $styleAnnexes[0]['_id'] : null;
            $this->writeStyleFile($datastoreId, $annexeId, $styles, $path);

            return new JsonResponse($styles);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}/remove', name: 'remove', methods: ['POST'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function remove(string $datastoreId, string $offeringId, Request $request): JsonResponse
    {
        try {
            // NOTE array_values re indexe les arrays
            $data = json_decode($request->getContent(), true);
            $styleName = $data['style_name'];

            $datastore = $this->entrepotApiService->datastore->get($datastoreId);
            $offering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);
            
            $configId = $offering['configuration']['_id'];

            // Recuperation des styles de la configuration
            $path = "/configuration/$configId/styles.json";
            $styleAnnexes = $this->entrepotApiService->annexe->getAll($datastoreId, null, $path);

            $styles = [];
            if (0 != count($styleAnnexes)) {
                $content = $this->entrepotApiService->annexe->download($datastoreId, $styleAnnexes[0]['_id']);
                $styles = json_decode($content, true);
            }

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
                $this->entrepotApiService->annexe->remove($datastoreId, $annexeId);
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

            // Plus de style, on supprime le fichier
            $annexeId = count($styleAnnexes) ? $styleAnnexes[0]['_id'] : null;
            if ($annexeId && 0 == count($styles)) {
                $this->entrepotApiService->annexe->remove($datastoreId, $styleAnnexes[0]['_id']);

                return new JsonResponse([]);
            }

            // Ecriture des styles mis a jour
            $this->writeStyleFile($datastoreId, $annexeId, $styles, $path);

            return new JsonResponse($styles);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/{offeringId}/setcurrent', name: 'setcurrent', methods: ['POST'],
        options: ['expose' => true],
        condition: 'request.isXmlHttpRequest()')
    ]
    public function setCurrentStyle(string $datastoreId, string $offeringId, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $styleName = $data['style_name'];

            $datastore = $this->entrepotApiService->datastore->get($datastoreId);
            $offering = $this->entrepotApiService->configuration->getOffering($datastoreId, $offeringId);
            
            $configId = $offering['configuration']['_id'];

            // Recuperation des styles de la configuration
            $path = "/configuration/$configId/styles.json";
            $styleAnnexes = $this->entrepotApiService->annexe->getAll($datastoreId, null, $path);

            $styles = [];
            if (0 != count($styleAnnexes)) {
                $content = $this->entrepotApiService->annexe->download($datastoreId, $styleAnnexes[0]['_id']);
                $styles = json_decode($content, true);
            }

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

            $annexeId = count($styleAnnexes) ? $styleAnnexes[0]['_id'] : null;

            // Ecriture des styles mis a jour
            $this->writeStyleFile($datastoreId, $annexeId, $styles, $path);

            return new JsonResponse($styles);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
    
    /**
     * Ajout des urls des annexes
     * 
     * @param array<mixed> $datastore
     * @param array<mixed> $styles
     * @return void
     */
    private function _addUrls($datastore, &$styles)
    {
        $annexeUrl = $this->getParameter('annexes_url');

        foreach($styles as &$style) {
            foreach($style['layers'] as &$layer) {
                $annexe = $this->entrepotApiService->annexe->get($datastore['_id'], $layer['annexe_id']);
                $layer['url'] = $annexeUrl . '/' . $datastore['technical_name'] . $annexe['paths'][0];
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

        return $this->entrepotApiService->annexe->add($datastoreId, $file->getRealPath(), [$path], $labels);
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
     * Ecriture du nouveau fichier de style.
     *
     * @param string       $datastoreId
     * @param string       $annexeId
     * @param array<mixed> $styles
     * @param string       $path
     */
    private function writeStyleFile($datastoreId, $annexeId, $styles, $path): void
    {
        $fs = new Filesystem();

        $directory = $this->getParameter('style_files_path');
        if (!$fs->exists($directory)) {
            $fs->mkdir($directory);
        }

        $uuid = uniqid();
        $filePath = join(DIRECTORY_SEPARATOR, [realpath($directory), "style-$uuid.json"]);

        // Creation du fichier
        file_put_contents($filePath, json_encode($styles));

        if ($annexeId) {    // PUT
            $this->entrepotApiService->annexe->replaceFile($datastoreId, $annexeId, $filePath);
        } else {
            $this->entrepotApiService->annexe->add($datastoreId, $filePath, [$path], null);
        }
    }
}
