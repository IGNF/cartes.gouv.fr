<?php

namespace App\Services;

use App\Constants\MetadataFields;
use App\Exception\AppException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Uid\Uuid;
use Twig\Environment as Twig;

class MetadataBuilder
{
    private Filesystem $fs;

    public function __construct(
        private Twig $twig,
        private ParameterBagInterface $params
    ) {
        $this->fs = new Filesystem();
    }

    /**
     * @param array<string,mixed> $args
     */
    public function buildXml(array $args): string
    {
        $requiredFields = [
            MetadataFields::FILE_IDENTIFIER,
            MetadataFields::HIERARCHY_LEVEL,
            MetadataFields::LANGUAGE,
            MetadataFields::CHARSET,
        ];

        foreach ($requiredFields as $fieldName) {
            if (!array_key_exists($fieldName, $args)) {
                throw new AppException(sprintf('Required field "%s" not provided', $fieldName));
            }
        }

        $content = $this->twig->render('metadata/metadata_dataset_iso.xml.twig', $args);

        return $content;
    }

    public function saveToFile(string $content): string
    {
        $directory = $this->params->get('metadata_path');
        $uuid = Uuid::v4();
        $filePath = $directory.DIRECTORY_SEPARATOR."{$uuid}.xml";

        $this->fs->dumpFile($filePath, $content);

        return $filePath;
    }
}
