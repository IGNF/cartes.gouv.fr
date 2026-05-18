<?php

namespace App\Security\Cookie;

use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class AuthCookieCipher
{
    private string $key;

    public function __construct(#[Autowire('%kernel.secret%')] string $appSecret)
    {
        $this->key = hash_hkdf('sha256', $appSecret, SODIUM_CRYPTO_SECRETBOX_KEYBYTES, 'cgfr.auth-cookie.v1');
    }

    public function encrypt(string $plaintext): string
    {
        $compressed = gzdeflate($plaintext, 6);
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $ciphertext = sodium_crypto_secretbox($compressed, $nonce, $this->key);

        return rtrim(strtr(base64_encode($nonce.$ciphertext), '+/', '-_'), '=');
    }

    public function decrypt(string $blob): ?string
    {
        $raw = base64_decode(strtr($blob, '-_', '+/'), true);
        if (false === $raw || \strlen($raw) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES) {
            return null;
        }

        $nonce = substr($raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $ciphertext = substr($raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);

        $compressed = sodium_crypto_secretbox_open($ciphertext, $nonce, $this->key);
        if (false === $compressed) {
            return null;
        }

        $plaintext = gzinflate($compressed);

        return false === $plaintext ? null : $plaintext;
    }
}
