<?php

namespace App\Tests\Functional;

use App\Dto\Datasheet\DatasheetMetadataDTO;
use App\Dto\Datasheet\ProducerDTO;
use App\Dto\Upload\UploadAddDTO;
use App\Services\MultipartPayloadMapper;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\ErrorHandler\Exception\FlattenException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Exception\ValidationFailedException;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Le mappeur multipart produit le même 422 que #[MapRequestPayload] : Problem Details avec `violations`.
 */
final class MultipartPayloadMapperTest extends KernelTestCase
{
    private MultipartPayloadMapper $mapper;

    protected function setUp(): void
    {
        $container = self::getContainer();
        /** @var SerializerInterface $serializer */
        $serializer = $container->get(SerializerInterface::class);
        /** @var ValidatorInterface $validator */
        $validator = $container->get(ValidatorInterface::class);
        $this->mapper = new MultipartPayloadMapper($serializer, $validator);
    }

    public function testInvalidPayloadAnswers422WithViolations(): void
    {
        $payload = [
            'name' => 'Fiche',
            'producers' => [['organization_name' => 'Organisme', 'organization_email' => 'pas-un-email', 'role' => 'pointOfContact']],
            'territories' => [['id' => 'FXX', 'title' => 'France métropolitaine', 'bbox' => []]],
        ];

        try {
            $this->mapper->map($this->request($payload), DatasheetMetadataDTO::class);
            self::fail('Une UnprocessableEntityHttpException était attendue');
        } catch (UnprocessableEntityHttpException $e) {
            $previous = $e->getPrevious();
            self::assertInstanceOf(ValidationFailedException::class, $previous);
            self::assertInstanceOf(ProducerDTO::class, $previous->getValue()->producers[0]);

            /** @var NormalizerInterface $serializer */
            $serializer = self::getContainer()->get(SerializerInterface::class);
            $body = $serializer->normalize(FlattenException::createFromThrowable($e), 'json', ['exception' => $e]);
            self::assertIsArray($body);
            self::assertSame(422, $body['status']);
            self::assertIsArray($body['violations']);
            $paths = array_column($body['violations'], 'propertyPath');
            self::assertContains('producers[0].organization_email', $paths);
            self::assertContains('territories[0].bbox', $paths);
            self::assertContains('description', $paths);
        }
    }

    public function testValidPayloadIsMapped(): void
    {
        $dto = $this->mapper->map($this->request([
            'datasheet_name' => 'Fiche',
            'data_upload_path' => '0b8a4f1e-2c3d-4e5f-8a9b-0c1d2e3f4a5b/donnees.gpkg',
            'name' => 'jeu_de_donnees',
            'description' => 'Description',
            'srid' => 'EPSG:2154',
            'producer' => 'Organisme',
            'themes' => ['Transports'],
            'production_date' => '2026-01-15',
            'zone' => 'France',
        ]), UploadAddDTO::class);

        self::assertSame(2026, $dto->getProductionYear());
    }

    public function testMissingDataFieldAnswers400(): void
    {
        $this->expectException(BadRequestHttpException::class);

        $this->mapper->map(new Request(), UploadAddDTO::class);
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function request(array $payload): Request
    {
        return new Request(request: ['data' => json_encode($payload, JSON_THROW_ON_ERROR)]);
    }
}
