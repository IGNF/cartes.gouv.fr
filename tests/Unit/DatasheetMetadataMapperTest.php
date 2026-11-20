<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Dto\Datasheet\DatasheetMetadataDTO;
use App\Dto\Datasheet\ProducerDTO;
use App\Dto\Datasheet\ResourceConditionDTO;
use App\Dto\Datasheet\SubConstraintDTO;
use App\Dto\Datasheet\TerritoryDTO;
use App\Dto\Metadata\CswHierarchyLevel;
use App\Dto\Metadata\CswLanguage;
use App\Services\DatasheetMetadataMapper;
use App\Tests\Support\CswMetadataFixtures;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;

final class DatasheetMetadataMapperTest extends TestCase
{
    private DatasheetMetadataMapper $mapper;

    protected function setUp(): void
    {
        $this->mapper = new DatasheetMetadataMapper(new MockClock(CswMetadataFixtures::NOW));
    }

    public function testCreationCopiesEveryEnteredField(): void
    {
        $dto = $this->dto();

        $metadata = $this->mapper->map($dto);

        self::assertSame('ign.fiche', $metadata->file_identifier);
        self::assertSame(CswHierarchyLevel::Dataset, $metadata->hierarchy_level);
        self::assertEquals(new CswLanguage('eng', 'english'), $metadata->language);
        self::assertSame('Fiche', $metadata->name);
        self::assertSame('Description', $metadata->description);
        self::assertSame('2026-01-15', $metadata->date_creation);
        self::assertNull($metadata->date_revision);
        self::assertSame(['Occupation des terres'], $metadata->keywords_inspire);
        self::assertSame(['libre'], $metadata->keywords_additional);
        self::assertSame(['environment'], $metadata->themes);
        self::assertSame($dto->producers, $metadata->producers);
        self::assertSame($dto->territories, $metadata->territories);
        self::assertEquals($dto->resource_constraints, $metadata->resource_constraints);
        self::assertSame(25000, $metadata->scale);
        self::assertSame(2.5, $metadata->resolution);
        self::assertSame('monthly', $metadata->update_frequency);
        self::assertSame([], $metadata->online_resources);
    }

    // le formulaire remplace les champs saisis ; ressources, vignette, identifiant et date de publication restent ceux de la fiche
    public function testReplacementKeepsWhatTheServerDerives(): void
    {
        $existing = CswMetadataFixtures::full();

        $metadata = $this->mapper->map($this->dto(), $existing);

        self::assertSame('fid', $metadata->file_identifier);
        self::assertEquals($existing->online_resources, $metadata->online_resources);
        self::assertSame($existing->thumbnail_url, $metadata->thumbnail_url);
        self::assertSame('2024-02-01', $metadata->date_publication);
        self::assertSame('2026-11-09', $metadata->date_revision);
        self::assertSame('Fiche', $metadata->name);
        // la fiche existante n’est pas modifiée
        self::assertSame('Titre', $existing->name);
    }

    // le XML et le lecteur placent les paires d’accès avant celles d’usage : le mappeur écrit dans cet ordre
    public function testAccessPairsComeBeforeUsePairs(): void
    {
        $useRestriction = new SubConstraintDTO('useConstraints', restriction_code: 'license');
        $useText = new SubConstraintDTO('useLimitation', description: 'Licence X');
        $accessRestriction = new SubConstraintDTO('accessConstraints', restriction_code: 'restricted');
        $accessText = new SubConstraintDTO('useLimitation', description: 'Accès réservé');
        $loose = new SubConstraintDTO('useLimitation', description: 'Ajoutée à la main');

        $metadata = $this->mapper->map($this->dto(constraints: [new ResourceConditionDTO('legal', [$loose, $useRestriction, $useText, $accessRestriction, $accessText])]));

        self::assertSame([$accessRestriction, $accessText, $useRestriction, $useText, $loose], $metadata->resource_constraints[0]->constraints);
    }

    public function testEmptyResolutionStaysNull(): void
    {
        self::assertNull($this->mapper->map($this->dto(resolution: null))->resolution);
    }

    /**
     * @param ResourceConditionDTO[]|null $constraints
     */
    private function dto(?float $resolution = 2.5, ?array $constraints = null): DatasheetMetadataDTO
    {
        return new DatasheetMetadataDTO(
            name: 'Fiche',
            description: 'Description',
            themes: ['environment'],
            keywords_inspire: ['Occupation des terres'],
            keywords_additional: ['libre'],
            file_identifier: 'ign.fiche',
            producers: [new ProducerDTO('Organisme', 'orga@example.test', 'pointOfContact')],
            date_creation: '2026-01-15',
            update_frequency: 'monthly',
            territories: [new TerritoryDTO('COMMUNE_TEST_1', 'Commune test', [2.25, 48.8, 2.45, 48.9])],
            scale: 25000,
            resolution: $resolution,
            resource_constraints: $constraints ?? [new ResourceConditionDTO('other', [new SubConstraintDTO('useLimitation', description: 'Usage interne')])],
            resource_genealogy: 'Généalogie',
            hierarchy_level: 'dataset',
            language: new CswLanguage('eng', 'english'),
            charset: 'utf8',
        );
    }
}
