<?php

namespace App\Services\FileUploader\Srid;

final class WktAuthorityParser
{
    public function extractAuthority(string $definition): ?string
    {
        $wkt = preg_replace_callback('/[A-Z][A-Z\d_]+\[/i', function ($matches) {
            return '["'.substr($matches[0], 0, strlen($matches[0]) - 1).'",';
        }, $definition);

        $wkt = preg_replace_callback('/, ?([A-Z][A-Z\d_]+[,\]])/', function ($matches) {
            $v = substr($matches[0], 1, strlen($matches[0]) - 2);

            return ',"'.$v.'"]';
        }, $wkt);

        $json = json_decode($wkt, true);
        if (!is_array($json)) {
            return null;
        }

        foreach ($json as $v) {
            if (is_array($v) && isset($v[0], $v[1], $v[2]) && 'AUTHORITY' == $v[0]) {
                return $v[1].':'.$v[2];
            }
        }

        return null;
    }
}
