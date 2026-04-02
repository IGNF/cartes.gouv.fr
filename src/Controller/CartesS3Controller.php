<?php

namespace App\Controller;

use League\Flysystem\FilesystemOperator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/files',
    name: 'cartesgouvfr_s3_gateway_',
    options: ['expose' => true],
)]
class CartesS3Controller extends AbstractController
{
    public function __construct(
        private FilesystemOperator $s3Storage,
    ) {
    }

    #[Route(
        '/{path}',
        name: 'get_content',
        methods: ['GET'],
        requirements: ['path' => '.+'],
        defaults: ['path' => '']
    )]
    public function getContent(string $path, Request $request): Response
    {
        if (empty($path) || !$this->s3Storage->fileExists($path)) {
            return new Response(null, Response::HTTP_NOT_FOUND);
        }

        $lastModifiedTs = $this->s3Storage->lastModified($path);
        $fileSize = $this->s3Storage->fileSize($path);

        $lastModified = new \DateTimeImmutable('@'.$lastModifiedTs);
        $etag = md5($lastModifiedTs.'/'.$fileSize);

        $response = new StreamedResponse();
        $response->setEtag($etag);
        $response->setLastModified($lastModified);
        $response->setPublic();
        $response->setMaxAge(3600);
        $response->setSharedMaxAge(3600);
        $response->headers->addCacheControlDirective('must-revalidate');

        if ($response->isNotModified($request)) {
            return $response; // 304
        }

        $stream = $this->s3Storage->readStream($path);

        $response->headers->set('Content-Type', ''.$this->s3Storage->mimeType($path));
        $response->headers->set('Content-Length', ''.$fileSize);
        $response->setCallback(function () use ($stream) {
            if (0 !== ftell($stream)) {
                rewind($stream);
            }
            fpassthru($stream);
            fclose($stream);
        });

        return $response;
    }
}
