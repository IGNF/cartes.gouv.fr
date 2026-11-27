<?php

namespace App\Controller;

use App\Services\RSSFeed\RSSFeed;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\Cache;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/rss',
    name: 'cartesgouvfr_rss_feed_',
    options: ['expose' => true],
    methods: ['GET']
)]
class RSSFeedController extends AbstractController
{
    #[Route('/alertes', name: 'alerts')]
    #[Cache(public: true, maxage: 3600, mustRevalidate: true)]
    public function alerts(RSSFeed $rssFeed): Response
    {
        try {
            $xml = $rssFeed->renderRssAlerts();

            return new Response($xml, Response::HTTP_OK, [
                'Content-Type' => 'application/xml',
            ]);
        } catch (\Throwable $th) {
            return new Response($th->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/actualites', name: 'articles')]
    #[Route('/actualites.json', name: 'articles_json')]
    public function articles(): Response
    {
        // Le scraper des articles dépose ce fichier sur le S3 ; la passerelle S3 fournit le cache et le 404
        $response = $this->forward(CartesS3Controller::class.'::getContent', ['path' => 'articles/rss.json']);

        if ($response->isSuccessful()) {
            $response->headers->set('Content-Type', 'application/feed+json');
        }

        return $response;
    }
}
