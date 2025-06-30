<?php

namespace App;

class Utils
{
    public static function deep_array_equals(mixed $a, mixed $b): bool
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
                if (!array_key_exists($key, $b) || !self::deep_array_equals($value, $b[$key])) {
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
                    if (self::deep_array_equals($item, $bItem)) {
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
}
