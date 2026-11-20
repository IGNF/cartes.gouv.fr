<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Security\KeycloakTokenManager;
use App\Services\DatastorePrefixValidator;
use App\Services\EntrepotApi\DatastoreApiService;
use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Double\FakeKeycloakClient;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Validator\Exception\ValidationFailedException;

final class DatastorePrefixValidatorTest extends KernelTestCase
{
    private const DATASTORE_ID = EntrepotMockResponseFactory::DATASTORE_ID;

    private DatastorePrefixValidator $validator;

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();

        $request = new Request();
        $request->attributes->set((string) (new \ReflectionClassConstant(KeycloakTokenManager::class, 'REQUEST_ATTR_TOKEN'))->getValue(), FakeKeycloakClient::createAccessToken());
        self::getContainer()->get('request_stack')->push($request);

        // la réponse du datastore est mise en cache entre les tests
        self::getContainer()->get(DatastoreApiService::class)->invalidate(self::DATASTORE_ID);
        $this->validator = self::getContainer()->get(DatastorePrefixValidator::class);
    }

    protected function tearDown(): void
    {
        self::getContainer()->get(DatastoreApiService::class)->invalidate(self::DATASTORE_ID);
        parent::tearDown();
    }

    public function testAcceptsThePrefixFollowedByAnUnderscore(): void
    {
        EntrepotMockResponseFactory::setDatastorePrefixes(['metadata_file_identifier_prefix' => 'SANDBOX', 'configuration_layer_name_prefix' => 'SANDBOX']);

        $this->validator->assertFileIdentifier(self::DATASTORE_ID, 'SANDBOX_fiche');
        $this->validator->assertLayerName(self::DATASTORE_ID, 'SANDBOX_flux');
        $this->addToAssertionCount(2);
    }

    public function testRefusesADotTheWrongCaseOrThePrefixAlone(): void
    {
        EntrepotMockResponseFactory::setDatastorePrefixes(['metadata_file_identifier_prefix' => 'SANDBOX', 'configuration_layer_name_prefix' => 'SANDBOX']);

        foreach (['SANDBOX.fiche', 'sandbox_fiche', 'SANDBOX_', 'fiche'] as $value) {
            $this->assertRefused('file_identifier', 'L’identifiant de fichier doit commencer par « SANDBOX_ »', fn () => $this->validator->assertFileIdentifier(self::DATASTORE_ID, $value));
            $this->assertRefused('technical_name', 'Le nom technique doit commencer par « SANDBOX_ »', fn () => $this->validator->assertLayerName(self::DATASTORE_ID, $value));
        }
    }

    public function testChecksNothingWithoutPrefix(): void
    {
        $this->validator->assertFileIdentifier(self::DATASTORE_ID, 'fiche');
        $this->validator->assertLayerName(self::DATASTORE_ID, 'flux');
        $this->addToAssertionCount(2);
    }

    private function assertRefused(string $field, string $message, \Closure $call): void
    {
        try {
            $call();
            self::fail("$field accepté à tort");
        } catch (UnprocessableEntityHttpException $e) {
            $previous = $e->getPrevious();
            self::assertInstanceOf(ValidationFailedException::class, $previous);
            $violations = $previous->getViolations();
            self::assertCount(1, $violations);
            self::assertSame($field, $violations->get(0)->getPropertyPath());
            self::assertSame($message, $violations->get(0)->getMessage());
        }
    }
}
