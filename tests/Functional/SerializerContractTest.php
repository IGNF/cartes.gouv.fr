<?php

namespace App\Tests\Functional;

use App\Dto\Datastore\PermissionDTO;
use App\Dto\Datastore\UpdatePermissionDTO;
use App\Dto\Espaceco\Members\AddMembersDTO;
use App\Dto\Services\CommonDTO;
use App\Dto\Services\PyramidVector\PyramidVectorCompositionDTO;
use App\Dto\Services\PyramidVector\PyramidVectorGenerateDTO;
use App\Dto\Services\PyramidVector\PyramidVectorTmsServiceDTO;
use App\Dto\Services\Wfs\WfsServiceDTO;
use App\Dto\Services\Wfs\WfsTableDTO;
use App\Dto\Services\WmsVector\WmsVectorServiceDTO;
use App\Dto\User\AccessDTO;
use App\Dto\User\UserKeyDTO;
use App\Entity\CswMetadata\CswCapabilitiesFile;
use App\Entity\CswMetadata\CswDocument;
use App\Entity\CswMetadata\CswHierarchyLevel;
use App\Entity\CswMetadata\CswLanguage;
use App\Entity\CswMetadata\CswMetadata;
use App\Entity\CswMetadata\CswMetadataLayer;
use App\Entity\CswMetadata\CswStyleFile;
use App\Services\CswMetadataHelper;
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
        self::assertSame([
            'file_identifier' => 'fid',
            'hierarchy_level' => 'dataset',
            'language' => ['code' => 'fre', 'language' => 'français'],
            'charset' => 'utf8',
            'title' => 'Titre',
            'abstract' => 'Résumé',
            'creation_date' => '2024-01-15',
            'update_date' => '2024-02-01T10:00:00',
            'resource_genealogy' => 'Généalogie',
            'inspire_keywords' => ['Occupation des terres'],
            'free_keywords' => ['libre'],
            'topic_categories' => ['planningCadastre'],
            'contact_email' => 'contact@example.test',
            'organisation_name' => 'Organisation',
            'organisation_email' => 'orga@example.test',
            'resolution' => '100',
            'layers' => [[
                'name' => 'ns:couche',
                'gmd_online_resource_protocol' => 'OGC:WFS',
                'gmd_online_resource_url' => 'https://data.example.test/wfs',
                'offering_id' => 'off-1',
                'open' => true,
                'description' => 'Couche',
            ]],
            'bbox' => ['west' => -5.5, 'east' => 9.5, 'south' => 41.5, 'north' => 51.5],
            'style_files' => [['name' => 'style', 'description' => 'Style', 'url' => 'https://example.test/style.json']],
            'capabilities_files' => [['name' => 'caps', 'description' => 'Caps', 'url' => 'https://example.test/caps.xml']],
            'documents' => [['name' => 'doc', 'description' => null, 'url' => 'https://example.test/doc.pdf']],
            'thumbnail_url' => 'https://example.test/thumb.png',
            'frequency_code' => 'monthly',
        ], self::getContainer()->get('serializer')->normalize($this->fullCswMetadata()));
    }

    public function testCswMetadataSurvivesArrayRoundTrip(): void
    {
        $helper = self::getContainer()->get(CswMetadataHelper::class);
        $metadata = $this->fullCswMetadata();

        self::assertEquals($metadata, $helper->fromArray($helper->toArray($metadata)));
    }

    // le gabarit twig du XML lit les clés produites par le sérialiseur
    public function testCswMetadataSurvivesXmlRoundTrip(): void
    {
        $helper = self::getContainer()->get(CswMetadataHelper::class);
        $metadata = $helper->fromXml((string) file_get_contents(__DIR__.'/../Fixture/metadata/md-1.xml'));

        self::assertEquals($metadata, $helper->fromXml($helper->toXml($metadata)));
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

    private function fullCswMetadata(): CswMetadata
    {
        $metadata = new CswMetadata();
        $metadata->fileIdentifier = 'fid';
        $metadata->hierarchyLevel = CswHierarchyLevel::Dataset;
        $metadata->title = 'Titre';
        $metadata->abstract = 'Résumé';
        $metadata->creationDate = '2024-01-15';
        $metadata->updateDate = '2024-02-01T10:00:00';
        $metadata->resourceGenealogy = 'Généalogie';
        $metadata->inspireKeywords = ['Occupation des terres'];
        $metadata->freeKeywords = ['libre'];
        $metadata->topicCategories = ['planningCadastre'];
        $metadata->contactEmail = 'contact@example.test';
        $metadata->organisationName = 'Organisation';
        $metadata->organisationEmail = 'orga@example.test';
        $metadata->resolution = '100';
        $metadata->layers = [new CswMetadataLayer('ns:couche', 'OGC:WFS', 'https://data.example.test/wfs', 'off-1', true, 'Couche')];
        $metadata->bbox = ['west' => -5.5, 'east' => 9.5, 'south' => 41.5, 'north' => 51.5];
        $metadata->styleFiles = [new CswStyleFile('style', 'Style', 'https://example.test/style.json')];
        $metadata->capabilitiesFiles = [new CswCapabilitiesFile('caps', 'Caps', 'https://example.test/caps.xml')];
        $metadata->documents = [new CswDocument('doc', null, 'https://example.test/doc.pdf')];
        $metadata->thumbnailUrl = 'https://example.test/thumb.png';
        $metadata->frequencyCode = 'monthly';

        return $metadata;
    }
}
