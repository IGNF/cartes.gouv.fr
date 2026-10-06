<?php

namespace App\Controller;

use AsyncAws\S3\Input\GetObjectRequest;
use AsyncAws\S3\Input\HeadObjectRequest;
use AsyncAws\S3\S3Client;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Passerelle de lecture du S3 privé (docs/developer/passerelle-s3.md) : Caddy sert /files/{clé} et appelle cette route
 * interne pour valider la clé et signer la requête S3, puis relaie les octets lui-même.
 */
#[Route(
    '/s3-sign/files',
    name: 'cartesgouvfr_s3_gateway_',
)]
class CartesS3Controller extends AbstractController
{
    public const SIGN_ROUTE = 'cartesgouvfr_s3_gateway_sign';

    // Validité de l'URL signée : Caddy ouvre la connexion amont dans la foulée, seul le début de requête est contrôlé
    private const PRESIGN_TTL = '+60 seconds';

    // Longueur maximale d'une clé S3 (octets)
    private const MAX_KEY_LENGTH = 1024;

    public function __construct(
        private S3Client $s3Client,
        #[Autowire(env: 'S3_BUCKET_NAME')]
        private string $bucket,
    ) {
    }

    #[Route(
        '/{path}',
        name: 'sign',
        methods: ['GET'],
        requirements: ['path' => '.+'],
    )]
    public function sign(string $path, Request $request): Response
    {
        if (!$this->isValidKey($path)) {
            return new Response(null, Response::HTTP_NOT_FOUND);
        }

        // Sous-requête forward_auth de Caddy (toujours en GET, chemin ré-encodé) : l'URL publique brute (/files/...) et la
        // méthode du client sont dans X-Forwarded-Uri et X-Forwarded-Method
        $rawPath = explode('?', (string) $request->headers->get('X-Forwarded-Uri', $request->getRequestUri()), 2)[0];
        $method = $request->headers->get('X-Forwarded-Method', $request->getMethod());

        // Caddy relaie l'URL du client telle quelle : redirection vers la forme canonique si elle diffère
        $canonicalPath = $this->canonicalPath($rawPath);
        if ($canonicalPath !== $rawPath) {
            return new RedirectResponse($canonicalPath, Response::HTTP_MOVED_PERMANENTLY);
        }

        // La signature couvre la méthode : une URL signée pour GET répond 403 à un HEAD
        $arguments = ['Bucket' => $this->bucket, 'Key' => $path];
        $input = Request::METHOD_HEAD === $method ? new HeadObjectRequest($arguments) : new GetObjectRequest($arguments);
        $signedUrl = $this->s3Client->presign($input, new \DateTimeImmutable(self::PRESIGN_TTL));

        // Caddy recopie les X-S3-* sur la requête relayée vers le S3 (bloc @s3Gateway de .docker/Caddyfile)
        $response = new Response(null, Response::HTTP_NO_CONTENT);
        foreach ($this->signedQueryParameters($signedUrl) as $name => $value) {
            $response->headers->set('X-S3-'.substr($name, \strlen('X-Amz-')), $value);
        }

        return $response;
    }

    // Clé vide, trop longue, caractère de contrôle ou segment « .. » : 404 sans appel amont
    private function isValidKey(string $key): bool
    {
        if ('' === $key || \strlen($key) > self::MAX_KEY_LENGTH || 1 === preg_match('#\p{C}#u', $key)) {
            return false;
        }

        return !in_array('..', explode('/', $key), true);
    }

    /**
     * Forme canonique de l'URL publique brute : segments vides ou « . » retirés (Flysystem les ignorait, le S3 non),
     * « + » brut encodé en %2B (le S3 le lirait comme une espace).
     */
    private function canonicalPath(string $rawPath): string
    {
        $segments = array_filter(
            explode('/', $rawPath),
            fn (string $segment) => !in_array(rawurldecode($segment), ['', '.'], true)
        );

        return '/'.str_replace('+', '%2B', implode('/', $segments));
    }

    /**
     * Paramètres X-Amz-* de l'URL signée, valeurs décodées (Caddy les ré-encode en query string).
     *
     * @return array<string, string>
     */
    private function signedQueryParameters(string $url): array
    {
        parse_str((string) parse_url($url, PHP_URL_QUERY), $parameters);

        return array_filter($parameters, fn ($value, $name) => \is_string($value) && str_starts_with($name, 'X-Amz-'), ARRAY_FILTER_USE_BOTH);
    }
}
