<?php

namespace App\Controller;

use League\Flysystem\FilesystemOperator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Attribute\Cache;
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
    #[Cache(public: true, maxage: 3600, mustRevalidate: true)]
    public function getContent(string $path): Response
    {
        if (empty($path) || !$this->s3Storage->has($path) || !$this->s3Storage->fileExists($path)) {
            return new Response(null, Response::HTTP_NOT_FOUND);
        }

        // $cacheKey = str_replace('/', '-', $path);

        // $content = $this->cache->get($cacheKey, function (ItemInterface $item) use ($path) {
        //     $item->expiresAfter(3600);

        //     $content = $this->s3Storage->read($path);

        //     return $content;
        // });

        // $response = new Response($content);

        $stream = $this->s3Storage->readStream($path);

        $response = new StreamedResponse();
        $response->headers->set('Content-Type', ''.$this->s3Storage->mimeType($path));
        $response->headers->set('Content-Length', ''.$this->s3Storage->fileSize($path));
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
