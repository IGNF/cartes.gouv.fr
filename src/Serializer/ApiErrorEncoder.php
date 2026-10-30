<?php

namespace App\Serializer;

use Symfony\Component\Serializer\Encoder\EncoderInterface;
use Symfony\Component\Serializer\Encoder\JsonEncode;

/**
 * Encode le format `problem` (application/problem+json), choisi par `ApiErrorFormatListener` sur les routes d'API.
 *
 * @SuppressWarnings(UnusedFormalParameter) signature imposée par l'interface
 */
final readonly class ApiErrorEncoder implements EncoderInterface
{
    public const FORMAT = 'problem';

    private JsonEncode $jsonEncode;

    public function __construct()
    {
        $this->jsonEncode = new JsonEncode();
    }

    /**
     * @param array<string, mixed> $context
     */
    public function encode(mixed $data, string $format, array $context = []): string
    {
        return $this->jsonEncode->encode($data, 'json', $context);
    }

    public function supportsEncoding(string $format): bool
    {
        return self::FORMAT === $format;
    }
}
