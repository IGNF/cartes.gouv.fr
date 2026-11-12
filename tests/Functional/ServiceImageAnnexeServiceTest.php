<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Dto\Services\Wfs\WfsServiceDTO;
use App\Security\KeycloakTokenManager;
use App\Services\EntrepotApi\ServiceConfigurationRequestBuilder;
use App\Services\EntrepotApi\ServiceImageAnnexeService;
use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Double\FakeKeycloakClient;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;

/**
 * Suppression des annexes vignette et logo d’un flux, et logo conservé par les formulaires classiques.
 */
final class ServiceImageAnnexeServiceTest extends KernelTestCase
{
    private const BASE_URL = 'https://entrepot.test/annexes/entrepot_test';
    private const UUID = '0f8e3c2a-1b2c-4d5e-8f90-123456789abc';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();

        // les appels à l’Entrepôt portent le jeton de l’utilisateur, lu dans la requête courante
        $request = new Request();
        $request->attributes->set((string) (new \ReflectionClassConstant(KeycloakTokenManager::class, 'REQUEST_ATTR_TOKEN'))->getValue(), FakeKeycloakClient::createAccessToken());
        self::getContainer()->get('request_stack')->push($request);
    }

    public function testOnlyRemovesTheAnnexesThisServiceCreated(): void
    {
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'vignette-flux', 'paths' => ['/thumbnail/'.self::UUID.'.png'], 'labels' => ['type=service-thumbnail']]);
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'vignette-fiche', 'paths' => ['/thumbnail/'.self::UUID.'.jpg'], 'labels' => ['type=thumbnail']]);
        EntrepotMockResponseFactory::seed('annexes', ['_id' => 'autre', 'paths' => ['/thumbnail/pas-un-uuid.png'], 'labels' => ['type=service-thumbnail']]);
        $service = self::getContainer()->get(ServiceImageAnnexeService::class);

        // autre entrepôt, annexe de fiche dans le même dossier, chemin qui n’est pas un uuid, puis la vignette du flux
        $service->removeByUrl(EntrepotMockResponseFactory::DATASTORE_ID, 'https://entrepot.test/annexes/autre_entrepot/thumbnail/'.self::UUID.'.png');
        $service->removeByUrl(EntrepotMockResponseFactory::DATASTORE_ID, self::BASE_URL.'/thumbnail/'.self::UUID.'.jpg');
        $service->removeByUrl(EntrepotMockResponseFactory::DATASTORE_ID, self::BASE_URL.'/thumbnail/pas-un-uuid.png');
        $service->removeByUrl(EntrepotMockResponseFactory::DATASTORE_ID, self::BASE_URL.'/thumbnail/'.self::UUID.'.png');

        self::assertSame(['vignette-fiche', 'autre'], array_column(EntrepotMockResponseFactory::stored('annexes'), '_id'));
    }

    public function testClassicEditKeepsTheLogoOfTheConfiguration(): void
    {
        $logo = ['url' => self::BASE_URL.'/attribution-logo/'.self::UUID.'.png', 'width' => 10, 'height' => 10, 'format' => 'image/png'];
        $dto = self::getContainer()->get('serializer')->deserialize(json_encode([
            'technical_name' => 'tech', 'public_name' => 'Public', 'service_name' => 'service', 'description' => 'Description', 'identifier' => 'id-1',
            'attribution_text' => 'IGN', 'attribution_url' => 'https://www.ign.fr', 'table_infos' => [],
        ], JSON_THROW_ON_ERROR), WfsServiceDTO::class, 'json');

        $body = ServiceConfigurationRequestBuilder::buildFromCommonDto(
            'WFS',
            $dto,
            [],
            ['attribution' => ['title' => 'Ancien', 'url' => 'https://ancien.test', 'logo' => $logo]],
        );

        self::assertSame(['title' => 'IGN', 'url' => 'https://www.ign.fr', 'logo' => $logo], $body['attribution']);
    }
}
