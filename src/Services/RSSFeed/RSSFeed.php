<?php

namespace App\Services\RSSFeed;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Twig\Environment as TwigEnvironment;

class RSSFeed
{
    private string $alertsJsonUrl;
    private HttpClientInterface $httpClient;

    public function __construct(
        private RouterInterface $router,
        private TwigEnvironment $twig,
        private CacheInterface $cache,
        ParameterBagInterface $parameters,
        HttpClientInterface $httpClient,
    ) {
        $this->httpClient = $httpClient->withOptions([
            'proxy' => $parameters->get('http_proxy'),
            'verify_peer' => false,
            'verify_host' => false,
        ]);
        $this->alertsJsonUrl = $parameters->get('annexes_url').'/cartes.gouv.fr-config/public/alerts.json';
    }

    public function renderRssAlerts(): string
    {
        $alerts = $this->getAlerts();

        $alerts = array_map(function (array $alert) {
            // ajout de la racine dans l'URL si non absolue
            $url = $alert['link']['url'];
            if ('/' === mb_substr($url, 0, 1)) {
                $alert['link']['url'] = substr($this->router->generate('cartesgouvfr_app', [], RouterInterface::ABSOLUTE_URL), 0, -1).$url;
            }

            // formattage de date
            $date = new \DateTime($alert['date']);
            $alert['date'] = $date->format(\DateTime::RSS);

            return $alert;
        }, $alerts);

        $link = $this->router->generate('cartesgouvfr_rss_feed_alerts', [], RouterInterface::ABSOLUTE_URL);

        return $this->twig->render('rss/alerts.xml.twig', [
            'alerts' => $alerts,
            'link' => $link,
        ]);
    }

    private function getAlerts(): array
    {
        return $this->cache->get('alerts', function (ItemInterface $item) {
            $item->expiresAfter(3600);

            $response = $this->httpClient->request('GET', $this->alertsJsonUrl);
            if (Response::HTTP_OK !== $response->getStatusCode()) {
                throw new \Exception('Une erreur est survenue, veuillez réessayer ultérieurement');
            }

            return $response->toArray();
        });
    }
}
