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
)]
class RSSFeedController extends AbstractController
{
    #[Route('/alerts', name: 'alerts')]
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
}
