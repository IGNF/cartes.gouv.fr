<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Dto\Datastore\PermissionDTO;
use App\Dto\Datastore\UpdatePermissionDTO;
use App\Dto\Espaceco\Members\AddMembersDTO;
use App\Dto\Services\Form\ServiceAttributionFormDTO;
use App\Dto\Services\Form\WfsFormDTO;
use App\Dto\Services\Form\WfsTableFormDTO;
use App\Dto\Services\PyramidVector\PyramidVectorCompositionDTO;
use App\Dto\Services\PyramidVector\PyramidVectorGenerateDTO;
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
            'file_identifier', 'hierarchy_level', 'language', 'charset', 'name', 'description', 'date_creation', 'date_publication', 'date_revision',
            'resource_genealogy', 'keywords_inspire', 'keywords_additional', 'themes', 'producers', 'resource_constraints', 'scale', 'resolution',
            'online_resources', 'territories', 'thumbnail_url', 'update_frequency',
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
        yield 'WfsFormDTO' => [WfsFormDTO::class, [
            'title' => 'Flux',
            'technical_name' => 'tech',
            'themes' => ['Hydrographie'],
            'access' => 'restricted_visible',
            'attribution' => ['title' => 'IGN', 'url' => 'https://www.ign.fr'],
            'tables' => [['native_name' => 't1', 'title' => 'Table', 'public_name' => 't1', 'description' => 'Résumé', 'keywords' => ['mot']]],
        ], ['attribution' => ServiceAttributionFormDTO::class, 'tables' => WfsTableFormDTO::class]];
        yield 'PyramidVectorGenerateDTO' => [PyramidVectorGenerateDTO::class, [
            'technical_name' => 'pyr',
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
        $payload = [
            'title' => 'Flux',
            'technical_name' => 'nom technique',
            'themes' => ['Hydrographie'],
            'tables' => [['native_name' => '', 'title' => 'Table', 'public_name' => 't1', 'description' => 'Résumé']],
        ];
        $dto = $container->get('serializer')->deserialize(json_encode($payload, JSON_THROW_ON_ERROR), WfsFormDTO::class, 'json');

        /** @var array{violations: list<array{propertyPath: string}>} $violations */
        $violations = $container->get('serializer')->normalize($container->get(ValidatorInterface::class)->validate($dto));

        self::assertSame(['tables[0].native_name', 'technical_name'], array_column($violations['violations'], 'propertyPath'));
    }
}
