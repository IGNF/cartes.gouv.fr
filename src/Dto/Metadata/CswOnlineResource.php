<?php

namespace App\Dto\Metadata;

use App\Utils;

/**
 * Ressource en ligne de la fiche (gmd:CI_OnlineResource) : couche de service, fichier de style, GetCapabilities ou document.
 *
 * Les protocoles suivent le vocabulaire OSGeo/GeoNetwork ; ils portent la nature de la ressource dans le XML.
 */
class CswOnlineResource
{
    /** @var list<string> */
    public const LAYER_PROTOCOLS = ['OGC:WMS', 'OGC:WFS', 'OGC:WMTS', 'TMS'];
    public const STYLE_PROTOCOL = 'WWW:DOWNLOAD-1.0-http--download';
    public const DOCUMENT_PROTOCOL = 'WWW:LINK-1.0-http--link';
    public const CAPABILITIES_PROTOCOL_SUFFIX = 'http-get-capabilities';
    private const DEFAULT_VERSIONS = ['WFS' => '2.0.0', 'WMS' => '1.3.0', 'WMTS' => '1.0.0'];

    public function __construct(
        public CswOnlineResourceType $type,
        public string $name,
        public string $url,
        public ?string $protocol = null,
        public ?string $description = null,
        // accès restreint seulement pour une couche
        public bool $open = true,
    ) {
    }

    public static function layer(string $name, string $protocol, string $url, bool $open, ?string $description = null): self
    {
        return new self(CswOnlineResourceType::Layer, $name, $url, $protocol, $description, $open);
    }

    public static function style(string $name, string $description, string $url): self
    {
        return new self(CswOnlineResourceType::Style, $name, $url, self::STYLE_PROTOCOL, $description);
    }

    /**
     * @param 'WFS'|'WMS'|'WMTS' $service
     * @param list<string>       $serviceUrls URL du service, lues pour leur paramètre version=
     */
    public static function capabilities(string $name, string $description, string $url, string $service, array $serviceUrls = []): self
    {
        return new self(CswOnlineResourceType::Capabilities, $name, $url, self::capabilitiesProtocol($service, $serviceUrls), $description);
    }

    /**
     * Protocole OSGeo du GetCapabilities ; la version vient de la première URL qui en porte une, sinon de la version par défaut du service.
     *
     * @param 'WFS'|'WMS'|'WMTS' $service
     * @param list<string>       $serviceUrls
     */
    public static function capabilitiesProtocol(string $service, array $serviceUrls = []): string
    {
        $version = self::DEFAULT_VERSIONS[$service];
        foreach ($serviceUrls as $serviceUrl) {
            $found = Utils::get_version_from_service_url($serviceUrl);
            if ('' !== $found) {
                $version = $found;
                break;
            }
        }

        return sprintf('OGC:%s-%s-%s', $service, $version, self::CAPABILITIES_PROTOCOL_SUFFIX);
    }

    public static function document(string $name, ?string $description, string $url): self
    {
        return new self(CswOnlineResourceType::Document, $name, $url, self::DOCUMENT_PROTOCOL, $description);
    }
}
