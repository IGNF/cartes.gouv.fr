<?php

namespace App;

class Utils
{
    /**
     * @param array<mixed> $array
     *
     * @see https://github.com/symfony/polyfill-php84/blob/4acd8b3205f17b5811d5e036e89690fe8baad365/Php84.php#L68
     */
    public static function array_find(array $array, callable $callback): mixed
    {
        foreach ($array as $key => $value) {
            if ($callback($value, $key)) {
                return $value;
            }
        }

        return null;
    }

    /**
     * @param array<mixed> $array
     *
     * @see https://github.com/symfony/polyfill-php84/blob/4acd8b3205f17b5811d5e036e89690fe8baad365/Php84.php#L79
     */
    public static function array_find_key(array $array, callable $callback): mixed
    {
        foreach ($array as $key => $value) {
            if ($callback($value, $key)) {
                return $key;
            }
        }

        return null;
    }

    public static function guess_content_type(string $content): string
    {
        return str_starts_with($content, '<?xml') ? 'application/xml' : 'application/json';
    }

    public static function get_version_from_service_url(string $url): string
    {
        $res = [];

        $parsed = parse_url($url);
        if (!is_array($parsed) || !isset($parsed['query'])) {
            return '';
        }

        parse_str($parsed['query'], $res);
        $res = array_change_key_case($res);

        return isset($res['version']) && is_string($res['version']) ? $res['version'] : '';
    }

    /**
     * @param array<mixed>|null $query
     *
     * @return array<mixed>
     */
    public static function normalize_query(?array $query): array
    {
        $query ??= [];

        if (!array_key_exists('sort', $query)) {
            $query['sort'] = 'last_event,desc';
        }

        if (isset($query['fields']) && is_array($query['fields']) && [] !== $query['fields']) {
            $query['fields'] = implode(',', $query['fields']);
        }

        return $query;
    }
}
