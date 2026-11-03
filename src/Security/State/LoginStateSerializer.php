<?php

namespace App\Security\State;

use Symfony\Component\DependencyInjection\Attribute\Autowire;

final readonly class LoginStateSerializer
{
    private string $hmacKey;

    public function __construct(#[Autowire(param: 'kernel.secret')] string $appSecret)
    {
        $this->hmacKey = hash_hkdf('sha256', $appSecret, 32, 'cgfr.login-state.v1');
    }

    /**
     * @param array<string, mixed> $payload
     * @param int                  $lifetime durée de validité en secondes (les tests fabriquent des states déjà expirés)
     */
    public function encode(array $payload, int $lifetime = 300): string
    {
        $payload['nonce'] = bin2hex(random_bytes(16));
        $payload['exp'] = time() + $lifetime;

        $json = json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        $jsonB64 = $this->base64url($json);
        $sig = $this->base64url(hash_hmac('sha256', $json, $this->hmacKey, true));

        return $jsonB64.'.'.$sig;
    }

    /**
     * Charge signée par nous, expirée ou non : un state expiré reste digne de confiance pour choisir où rediriger l’échec.
     *
     * @return array<string, mixed>|null null si la signature ne correspond pas
     */
    public function verify(string $blob): ?array
    {
        $parts = explode('.', $blob, 2);
        if (2 !== \count($parts)) {
            return null;
        }

        [$jsonB64, $sigB64] = $parts;

        $json = base64_decode(strtr($jsonB64, '-_', '+/'), true);
        if (false === $json) {
            return null;
        }

        $expectedSig = $this->base64url(hash_hmac('sha256', $json, $this->hmacKey, true));
        if (!hash_equals($expectedSig, $sigB64)) {
            return null;
        }

        try {
            $payload = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return null;
        }

        return \is_array($payload) ? $payload : null;
    }

    /** @param array<string, mixed> $payload */
    public function isExpired(array $payload): bool
    {
        return !isset($payload['exp']) || !\is_int($payload['exp']) || time() > $payload['exp'];
    }

    /**
     * @return array<string, mixed>|null null si la signature ne correspond pas ou si le state a expiré
     */
    public function decode(string $blob): ?array
    {
        $payload = $this->verify($blob);

        return null === $payload || $this->isExpired($payload) ? null : $payload;
    }

    private function base64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
