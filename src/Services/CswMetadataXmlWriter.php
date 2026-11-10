<?php

namespace App\Services;

use App\Dto\Metadata\CswMetadata;
use Psr\Clock\ClockInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Uid\Uuid;
use Twig\Environment as Twig;

/**
 * Écrit une CswMetadata en fichier de métadonnée ISO 19139 (gabarit metadata/metadata_dataset_iso.xml.twig).
 */
class CswMetadataXmlWriter
{
    public function __construct(
        private readonly Twig $twig,
        private readonly NormalizerInterface $normalizer,
        private readonly ParameterBagInterface $params,
        private readonly Filesystem $fs,
        private readonly ClockInterface $clock,
    ) {
    }

    public function toXml(CswMetadata $metadata): string
    {
        /** @var array<string, mixed> $variables le gabarit lit les clés snake_case du sérialiseur */
        $variables = $this->normalizer->normalize($metadata);
        // gmd:dateStamp : date de la métadonnée, posée à chaque écriture et jamais relue
        $variables['date_stamp'] = $this->clock->now()->format('Y-m-d\TH:i:s');

        return $this->twig->render('metadata/metadata_dataset_iso.xml.twig', $variables);
    }

    // fichier temporaire sous metadata_path, supprimé par MetadataApiService après envoi
    public function saveToFile(CswMetadata $metadata): string
    {
        $filePath = $this->params->get('metadata_path').DIRECTORY_SEPARATOR.Uuid::v4().'.xml';
        $this->fs->dumpFile($filePath, $this->toXml($metadata));

        return $filePath;
    }
}
