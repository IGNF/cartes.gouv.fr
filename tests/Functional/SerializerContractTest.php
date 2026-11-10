<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Dto\Datastore\PermissionDTO;
use App\Dto\Datastore\UpdatePermissionDTO;
use App\Dto\Espaceco\Members\AddMembersDTO;
use App\Dto\Metadata\CswLanguage;
use App\Dto\Metadata\CswMetadata;
use App\Dto\Services\CommonDTO;
use App\Dto\Services\PyramidVector\PyramidVectorCompositionDTO;
use App\Dto\Services\PyramidVector\PyramidVectorGenerateDTO;
use App\Dto\Services\PyramidVector\PyramidVectorTmsServiceDTO;
use App\Dto\Services\Wfs\WfsServiceDTO;
use App\Dto\Services\Wfs\WfsTableDTO;
use App\Dto\Services\WmsVector\WmsVectorServiceDTO;
use App\Dto\User\AccessDTO;
use App\Dto\User\UserKeyDTO;
use App\Tests\Support\CswMetadataFixtures;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Contrat des clés JSON échangées avec le front : snake_case en entrée comme en sortie.
 */
final class SerializerContractTest extends KernelTestCase
{
    public function testCswMetadataIsExposedInSnakeCase(): void
    {
        /** @var array<string, mixed> $json */
        $json = self::getContainer()->get('serializer')->normalize(CswMetadataFixtures::full());

        self::assertSame([
            'file_identifier', 'hierarchy_level', 'language', 'charset', 'name', 'description', 'date_creation', 'resource_genealogy',
            'keywords_inspire', 'keywords_additional', 'themes', 'producers', 'resource_constraints', 'scale',
            'online_resources', 'bbox', 'thumbnail_url', 'update_frequency',
        ], array_keys($json));
        self::assertSame('dataset', $json['hierarchy_level']);
        self::assertSame(['code' => 'fre', 'language' => 'français'], $json['language']);
        self::assertSame([
            'type' => 'layer',
            'name' => 'couche_privee',
            'url' => 'https://data.example.test/wms-v',
            'protocol' => 'OGC:WMS',
            'description' => 'couche_privee - Accès restreint',
            'open' => false,
        ], $json['online_resources'][1]);
        self::assertSame('document', $json['online_resources'][5]['type']);
    }

    // chemin de MetadataController::add : le JSON du front redevient une CswMetadata identique
    public function testCswMetadataSurvivesJsonRoundTrip(): void
    {
        /** @var Serializer $serializer */
        $serializer = self::getContainer()->get('serializer');
        $metadata = CswMetadataFixtures::full();

        self::assertEquals($metadata, $serializer->deserialize($serializer->serialize($metadata, 'json'), CswMetadata::class, 'json'));
    }

    /**
     * @param class-string         $class
     * @param array<string, mixed> $payload
     * @param array<string, mixed> $nestedClasses chemin dans le payload => classe attendue
     */
    #[DataProvider('inputPayloads')]
    public function testInputDtoAcceptsEverySnakeCaseKey(string $class, array $payload, array $nestedClasses = []): void
    {
        /** @var Serializer $serializer */
        $serializer = self::getContainer()->get('serializer');

        // toute clé non reconnue lève une exception au lieu d’être ignorée
        $dto = $serializer->deserialize(json_encode($payload, JSON_THROW_ON_ERROR), $class, 'json', [AbstractNormalizer::ALLOW_EXTRA_ATTRIBUTES => false]);

        self::assertEquals($payload, $serializer->normalize($dto));
        foreach ($nestedClasses as $property => $nestedClass) {
            $value = $dto->$property;
            self::assertInstanceOf($nestedClass, is_array($value) ? $value[0] : $value, $property);
        }
    }

    /**
     * @return iterable<string, array{0: class-string, 1: array<string, mixed>, 2?: array<string, class-string>}>
     */
    public static function inputPayloads(): iterable
    {
        yield 'CommonDTO' => [CommonDTO::class, self::commonPayload(), ['language' => CswLanguage::class]];
        yield 'PyramidVectorTmsServiceDTO' => [PyramidVectorTmsServiceDTO::class, self::commonPayload()];
        yield 'WfsServiceDTO' => [WfsServiceDTO::class, self::commonPayload() + ['table_infos' => [self::wfsTablePayload()]], ['table_infos' => WfsTableDTO::class]];
        yield 'WmsVectorServiceDTO' => [WmsVectorServiceDTO::class, self::commonPayload() + ['selected_tables' => ['t1']]];
        yield 'PyramidVectorGenerateDTO' => [PyramidVectorGenerateDTO::class, [
            'technical_name' => 'pyr',
            'area' => 'POLYGON((0 0,1 0,1 1,0 0))',
            'tippecanoe' => '-zg',
            'vectordb_id' => 'vdb-1',
            'composition' => [['table' => 't1', 'attributes' => ['a'], 'bottom_level' => 14, 'top_level' => 5]],
            'email_notification' => false,
        ], ['composition' => PyramidVectorCompositionDTO::class]];
        yield 'PermissionDTO' => [PermissionDTO::class, [
            'licence' => 'Licence',
            'type' => 'COMMUNITY',
            'end_date' => '2030-01-01',
            'beneficiaries' => ['b1'],
            'offerings' => ['o1'],
            'only_oauth' => true,
        ]];
        yield 'UpdatePermissionDTO' => [UpdatePermissionDTO::class, ['licence' => 'Licence', 'end_date' => '2030-01-01', 'offerings' => ['o1']]];
        yield 'UserKeyDTO' => [UserKeyDTO::class, [
            'name' => 'clé',
            'accesses' => [['permission' => 'p1', 'offerings' => ['o1']]],
            'type' => 'HASH',
            'type_infos' => ['hash' => 'h'],
            'user_agent' => 'agent',
            'referer' => 'https://example.test',
            'ip_list_name' => 'whitelist',
            'ip_list_addresses' => ['10.0.0.0/8'],
        ], ['accesses' => AccessDTO::class]];
        yield 'AddMembersDTO' => [AddMembersDTO::class, ['members' => [42, 'membre@example.test']]];
    }

    public function testViolationPathsUseSnakeCaseKeys(): void
    {
        $container = self::getContainer();
        $payload = ['email_contact' => 'pas-un-email', 'table_infos' => [['native_name' => ''] + self::wfsTablePayload()]] + self::commonPayload();
        $dto = $container->get('serializer')->deserialize(json_encode($payload, JSON_THROW_ON_ERROR), WfsServiceDTO::class, 'json');

        /** @var array{violations: list<array{propertyPath: string}>} $violations */
        $violations = $container->get('serializer')->normalize($container->get(ValidatorInterface::class)->validate($dto));

        self::assertSame(['table_infos[0].native_name', 'email_contact'], array_column($violations['violations'], 'propertyPath'));
    }

    /**
     * @return array<string, mixed>
     */
    private static function commonPayload(): array
    {
        return [
            'technical_name' => 'tech',
            'public_name' => 'Public',
            'service_name' => 'service',
            'description' => 'Description',
            'identifier' => 'id-1',
            'category' => ['cat'],
            'keywords' => ['mot'],
            'free_keywords' => ['libre'],
            'email_contact' => 'contact@example.test',
            'creation_date' => '2024-01-15',
            'organization' => 'Organisation',
            'organization_email' => 'orga@example.test',
            'projection' => 'EPSG:2154',
            'attribution_text' => 'Attribution',
            'attribution_url' => 'https://example.test',
            'language' => ['code' => 'fre', 'language' => 'français'],
            'charset' => 'utf8',
            'resolution' => '100',
            'hierarchy_level' => 'dataset',
            'resource_genealogy' => 'Généalogie',
            'frequency_code' => 'monthly',
            'share_with' => 'all_public',
            'allow_view_data' => true,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function wfsTablePayload(): array
    {
        return ['native_name' => 'table', 'title' => 'Titre', 'description' => 'Description', 'public_name' => 'publique', 'keywords' => ['mot']];
    }
}
