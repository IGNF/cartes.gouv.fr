<?php

namespace App\Controller\Api;

use Symfony\Component\Uid\Uuid;
use App\Services\EntrepotApiService;
use App\Exception\CartesApiException;
use App\Exception\EntrepotApiException;
use App\Constants\EntrepotApi\CommonTags;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;


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
    public function add(string $datastoreId, string $offeringId, Request $request) : JsonResponse{
        try {
            $styleName = $request->request->get("style_name");

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
            foreach($files['style_files'] as $layer => $file) {
                $annexe = $this->_addFile($datastoreId, $datasheetName, $file);
                if ($layer === 'no-layer') {
                    $newStyle['layers'][] = ['annexe_id' => $annexe['_id']];  
                } else {
                    $newStyle['layers'][] = ['name' => $layer, 'annexe_id' => $annexe['_id']];      
                }
            }

            $styles[] = $newStyle;

            // Re ecriture dans le fichier
            $annexeId = count($styleAnnexes) ? $styleAnnexes[0]['_id'] : null;
            $this->writeStyleFile($datastoreId, $annexeId, $styles, $path);

            return new JsonResponse($styles);
        } catch (EntrepotApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * Ajout d'un fichier de style sous forme d'annexe
     *
     * @param string $datastoreId
     * @param string $datasheetName
     * @param UploadedFile $file
     * @return array
     */
    private function _addFile($datastoreId, $datasheetName, $file) : array 
    {
        $uuid = Uuid::v4();
        
        $extension = $file->getClientOriginalExtension();
        $path = join('/', ['style', "$uuid.$extension"]);

        $labels = [
            CommonTags::DATASHEET_NAME . '=' .$datasheetName,
            'type=style'
        ];

        return $this->entrepotApiService->annexe->add($datastoreId, $file->getRealPath(), [$path], $labels);
    }

    /**
     * Suppression de la cle current
     *
     * @param array<mixed> $styles
     * @return void
     */
    private function cleanStyleTags(&$styles) : void {
        foreach($styles as &$style) {
            unset($style['current']);
        }
    }

    /**
     * Ecriture du nouveau fichier de style
     *
     * @param string $datastoreId
     * @param string $annexeId
     * @param array<mixed> $styles
     * @param string $path
     * @return void
     */
    private function writeStyleFile($datastoreId, $annexeId, $styles, $path) : void
    {
        $fs = new Filesystem();

        $directory = $this->getParameter('style_files_path'); 
        if (! $fs->exists($directory)) {
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