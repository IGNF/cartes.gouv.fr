<?php

namespace App\Controller;

use SplFileInfo;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class UploadController extends AbstractController
{
    private const VALID_FILE_EXTENSIONS = ['csv', 'gpkg'];

    public function __construct(private ParameterBagInterface $parameterBag) 
    {
    }
    
    #[Route('/upload_chunk', name: 'cartesgouvfr_app_upload_chunk', 
        methods: ['POST'],
        // condition: "request.isXmlHttpRequest()", 
        options: ['expose' => true]
    )]
    public function uploadChunk(Request $request): JsonResponse
    {
        $uuid  = $request->get("uuid");
        $index = $request->get("index");

        $directory = $this->parameterBag->get("upload_path") . "/$uuid";
        $chunk = $request->files->get("chunk");
        $size = $chunk->getSize();

        try {
            $this->createDirectory($directory);
            $chunk->move($directory, $chunk->getClientOriginalName());
        } catch (\Exception $e) {
            return new JsonResponse($e->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);    
        }
        
        return new JsonResponse(["index" => $index, "numBytes" => $size]);
    }

    #[Route('/upload_complete', name: 'cartesgouvfr_app_upload_complete', 
        methods: ['POST'],
        // condition: "request.isXmlHttpRequest()", 
        options: ['expose' => true]
    )]
    public function uploadComplete(Request $request) : JsonResponse
    {        
        $uuid = $request->get("uuid");
        $originalFilename = $request->get("originalFilename");

        $directory = $this->parameterBag->get("upload_path") . "/$uuid";
        $files = array_filter(scandir($directory), function($filename) use ($directory) {
            return !is_dir("$directory/$filename");
        });

        try {
            // Tri des fichiers
            usort($files, [$this, "sortFiles"]);

            // Fusion des fichiers
            $filepath = $this->mergeFiles($directory, $originalFilename, $files);

            // Verification du fichier
            return $this->validate($filepath, $uuid);
        } catch (\Exception $e) {
            return new JsonResponse($e->getMessage(), JsonResponse::HTTP_INTERNAL_SERVER_ERROR);    
        }
    }

    /**
     * Fusionne tous les petits fichiers
     *
     * @param string $directory
     * @param string $originalFilename
     * @param array<string> $files
     * @return string
     */
    private function mergeFiles(string $directory, string $originalFilename, array $files) {
        $filepath = "$directory/$originalFilename";

        foreach($files as $filename) {
            $fullName = "$directory/$filename";
            $file = fopen($fullName, 'rb');
            $buff = fread($file, filesize($fullName));
            fclose($file);

            $final = fopen($filepath, 'ab');
            if (FALSE === fwrite($final, $buff)) {
                throw new \Exception("Merging files failed.");
            }
            fclose($final);

            unlink("$directory/$filename");
        }

        return $filepath;
    }

    /**
     * Creation du repertoire temporaire s'il n'existe pas deja
     *
     * @param string $directory
     * @return void
     */
    private function createDirectory(string $directory) : void
    {            
        $fs = new Filesystem();
        if (! $fs->exists($directory)) {
            $fs->mkdir($directory);
        }
    }

    /**
     * Sort files dependeing on index (uuid_<index>)
     *
     * @return int
     */
    private function sortFiles(string $filename1, string $filename2) {
        $index1 = $this->getIndex($filename1);
        $index2 = $this->getIndex($filename2);
        return ($index1 < $index2) ? -1 : 1;   
    }

    /**
     * Scanne le nom du fichier et en deduit l'index
     *
     * @param string $filename
     * @return int
     */
    private function getIndex(string $filename) {
        if (! preg_match("/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}_(\d+)/", $filename, $matches)) {
            throw new \Exception("Filename has no index");      
        }
        return intval($matches[1]);
    }

    /**
     * Validation du fichier, On verifie que le fichier :
     *      - n'est pas vide
     *      - a une extension valide
     *      - Si c'est une archive (.zip) :
     *          - Pas de fichiers de type differents
     *          - Autres (nbre max de fichier ....)
     *
     * @param string $filepath
     * @return JSONResponse
     */
    private function validate(string $filepath, string $uuid)
    {
        $file = new \SplFileInfo($filepath);
        $filename = $file->getFilename();

        if (!$file->getSize()) {
            throw new \Exception("Le fichier $filename ne doit pas être vide");
        }

        $extension = strtolower($file->getExtension());
        
        $validExtensions = array_merge(self::VALID_FILE_EXTENSIONS, ['zip']);
        if (! in_array($extension, $validExtensions)) {
            $filename = $file->getFilename();
            throw new \Exception("L'extension du fichier $filename n'est pas correcte");
        }

        if ('zip' == $extension) {
            $this->cleanArchive($file);
            $this->validateArchive($file);
        }

        // Verification des srid (le srid doit être unique pour toutes couches gpkg et zip avec gpkg)
        $srids = $this->getSrids($file);    // seulement les gpkg et archives gpkg
        $unicity = array_unique($srids);
        if (!empty($unicity) && 1 != count($unicity)) {
            throw new \Exception('Ce fichier contient des données dans des systèmes de projection différents');
        }

        // Si c'est un fichier csv, on le zippe
        if ('csv' == $extension) {
            $this->zip($file);
        }

        return new JsonResponse([
            "srid" => (1 == count($unicity)) ? $unicity[0] : "",
            "filename" => "$uuid/$filename"
        ]);
    }

    /**
     * Supprime les fichiers dont l'extension n'est pas correcte
     *
     * @param \SplFileInfo $file
     * @return void
     */
    private function cleanArchive(\SplFileInfo $file)
    {
        $filename = $file->getFilename();

        $zip = new \ZipArchive();
        if (!$zip->open($file->getPathname())) {
            throw new \Exception("L'ouverture de l'archive $filename a echoué");
        }

        $numDeletedFiles = 0;
        $numFiles = $zip->numFiles;

        for ($i = 0; $i < $zip->numFiles; ++$i) {
            $filename = $zip->getNameIndex($i);
            $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            if (!in_array($extension, self::VALID_FILE_EXTENSIONS)) {
                $zip->deleteName($filename);
                ++$numDeletedFiles;
            }
        }
        $zip->close();

        if ($numDeletedFiles == $numFiles) {
            throw new \Exception("L'archive ne contient aucun fichier acceptable");
        }
    }

    /**
     * Effectue des contrôles sur l'archive zip.
     *
     * Critères de validation :
     * - doit contenir au moins un fichier gpkg ou CSV
     * - ne peut contenir qu'un seul type de fichiers
     * - ne peut contenir plus de 10000 fichiers
     * - taille max du zip : 1 Go
     * - ratio de compression max : 20%
     *
     * @param \SplFileInfo $file
     * @return void
     *
     * @throws \Exception
     */
    private function validateArchive(\SplFileInfo $file)
    {
        $maxFiles = 10000;
        $maxSize = 1000000000; // 1 GB
        $oneGiga = 1000000000;
        $maxRatio = 20; // initialement on avait testé 10% mais c'était trop restrictif (https://github.com/IGNF/geotuileur-site/issues/47)

        $filename = $file->getFilename();

        $zip = new \ZipArchive();
        if (!$zip->open($file->getPathname())) {
            throw new \Exception("L'ouverture de l'archive $filename a echoué");
        }

        $numFiles = 0;
        $extensions = [];

        for ($i = 0; $i < $zip->numFiles; ++$i) {
            $filename = $zip->getNameIndex($i);
            $stats = $zip->statIndex($i);

            // Prevent ZipSlip path traversal (S6096)
            if (false !== strpos($filename, '../') || '/' === substr($filename, 0, 1)) {
                throw new \Exception();
            }

            // C'est un dossier
            if ('/' === substr($filename, -1)) {
                continue;
            }

            ++$numFiles;
            if ($numFiles > $maxFiles) {
                throw new \Exception("Le nombre de fichiers excède $maxFiles");
            }

            $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            $extensions[] = $extension;
            // il n'y a plus besoin de vérifier l'extension parce qu'on a déjà supprimé tous les fichiers qui ne sont pas csv ou gpkg (voir cleanArchive)

            $size = $stats['size'];
            if ($size > $maxSize) {
                throw new \Exception(sprintf("La taille du fichier $filename excède %s GB", $maxSize / $oneGiga));
            }

            if ($stats['comp_size']) {
                $ratio = $stats['size'] / $stats['comp_size'];
                if ($ratio > $maxRatio) {
                    throw new \Exception("Le taux de compression excède $maxRatio");
                }
            }
        }

        $zip->close();
        $unicity = array_unique($extensions);
        if (1 != count($unicity)) {
            throw new \Exception(sprintf("L'archive ne doit contenir qu'un seul type de fichier (%s)", implode(' ou ', self::VALID_FILE_EXTENSIONS)));
        }
    }

    private function zip(\SplFileInfo $file)
    {
        $fs = new Filesystem();

        // Creation de l'archive
        $folder = $file->getPath();

        $extension = $file->getExtension();
        $filename = $file->getBasename(".$extension");
        $zipFile = join(DIRECTORY_SEPARATOR, [$folder, "$filename.zip"]);

        $zip = new \ZipArchive();
        $res = $zip->open($zipFile, \ZipArchive::CREATE);
        if (true === $res) {
            $zip->addFile($file->getRealPath(), $filename);
            $zip->close();
        }

        $fs->remove($filename);
        if (false === $res) {
            throw new \Exception("La création de l'archive a échoué.");
        }
    }

    /**
     * Recuperation des srids a partir des fichiers
     *
     * @param \SplFileInfo $file
     * @return array<string>
     */
    private function getSrids(\SplFileInfo $file)
    {
        $extension = strtolower($file->getExtension());
        if ('csv' == $extension) {
            return [];
        }    // difficile de connaitre le srid d'un fichier CSV

        $srids = [];
        if ('gpkg' == $extension) {
            $this->getSridsFromFile($file, $srids);
        } else {
            $this->getSridsFromArchive($file, $srids);
        }

        return $srids;
    }

    /**
     * Recuperation des srids a partir des fichiers contenus dans l'archive
     *
     * @param \SplFileInfo $file
     * @param array<string> $srids
     * @return void
     */
    private function getSridsFromArchive(\SplFileInfo $file, &$srids)
    {
        $fs = new Filesystem();

        $infos = pathinfo($file->getPathname());
        $dirname = $infos['dirname'];
        $filename = $infos['filename'].'_tmp';

        // Extracting zip file
        $zip = new \ZipArchive();
        if (!$zip->open($file->getPathname())) {
            throw new \Exception("l'ouverture du fichier ZIP a échoué");
        }

        $folder = "$dirname/$filename";
        if (!$zip->extractTo($folder)) {
            throw new \Exception("l'extraction du fichier ZIP a échoué");
        }
        $zip->close();

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($folder, \RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $entry) {
            $extension = strtolower($entry->getExtension());
            if ('gpkg' != $extension) {
                continue;
            }

            $this->getSridsFromFile($entry, $srids);
        }

        $fs->remove($folder);
    }

    /**
     * Recuperation des srids a partir des fichiers contenus dans le fichier gpkg (SQLITE)
     *
     * @param \SplFileInfo $file
     * @param array<string> $srids
     * @return void
     */
    private function getSridsFromFile(\SplFileInfo $file, &$srids)
    {
        $filepath = $file->getPathname();

        $db = new \SQLite3($filepath);
        $res = $db->query('SELECT table_name, srs_id FROM gpkg_geometry_columns');
        while ($row = $res->fetchArray()) {
            $srids[] = 'EPSG:'.$row['srs_id'];
        }
    }
}
