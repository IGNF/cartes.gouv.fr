<?php

namespace App;

class Utils
{
    public static function array_deep_equals(mixed $a, mixed $b): bool
    {
        if (!is_array($a) || !is_array($b)) {
            return $a === $b;
        }

        if (count($a) !== count($b)) {
            return false;
        }

        if (array_keys($a) !== range(0, count($a) - 1) || array_keys($b) !== range(0, count($b) - 1)) {
            // arrays associatifs
            ksort($a);
            ksort($b);
            foreach ($a as $key => $value) {
                if (!array_key_exists($key, $b) || !self::array_deep_equals($value, $b[$key])) {
                    return false;
                }
            }

            return true;
        } else {
            // arrays indexés
            $aCopy = $a;
            $bCopy = $b;

            foreach ($aCopy as &$item) {
                $found = false;
                foreach ($bCopy as $i => $bItem) {
                    if (self::array_deep_equals($item, $bItem)) {
                        unset($bCopy[$i]);
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    return false;
                }
            }

            return empty($bCopy);
        }
    }

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
}
