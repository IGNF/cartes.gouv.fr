<?php

namespace App\Controller;

use App\Entity\CswMetadata\CswMetadata;
use App\Services\CswMetadataHelper;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/metadata-generator',
    name: 'metadata_generator_',
    options: ['expose' => true]
)]
class MetadataGeneratorController extends AbstractController
{
    #[Route('/generate', name: 'generate', methods: ['POST'])]
    public function generate(
        #[MapRequestPayload ] CswMetadata $cswMetadata,
        CswMetadataHelper $cswMetadataHelper,
    ): Response {
        $xml = $cswMetadataHelper->toXml($cswMetadata);

        return new Response(
            $xml,
            Response::HTTP_OK,
            [
                'Content-Type' => 'application/xml',
                'Content-Disposition' => sprintf('attachment; filename="%s.xml"', $cswMetadata->fileIdentifier),
            ]
        );
    }
}
