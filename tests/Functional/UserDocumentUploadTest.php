<?php

namespace App\Tests\Functional;

use App\Tests\Double\EntrepotMockResponseFactory;
use App\Tests\Support\KeycloakLoginTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Dépôt d’un document utilisateur : champs du formulaire transmis à l’Entrepôt en multipart.
 */
final class UserDocumentUploadTest extends WebTestCase
{
    use KeycloakLoginTrait;

    private const DOCUMENTS_URL = self::BASE.'/api/users/me/documents';

    protected function setUp(): void
    {
        EntrepotMockResponseFactory::reset();
    }

    public function testFormFieldsAreForwardedUpstream(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        // case cochée : le navigateur envoie « on »
        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, [
            'name' => 'Notice',
            'description' => 'Description test',
            'labels' => 'a,b',
            'public_url' => 'on',
        ], ['file' => $this->uploadedFile()]);

        self::assertResponseIsSuccessful();
        $body = $this->forwardedBody();
        $this->assertMultipartField('name', 'Notice', $body);
        $this->assertMultipartField('description', 'Description test', $body);
        $this->assertMultipartField('labels', 'a,b', $body);
        $this->assertMultipartField('public_url', 'true', $body);
        self::assertStringContainsString('filename="notice.txt"', $body);
    }

    public function testUncheckedPublicUrlIsForwardedAsFalseAndAbsentDescriptionIsOmitted(): void
    {
        $client = self::createClient();
        $this->logIn($client);

        $client->xmlHttpRequest('POST', self::DOCUMENTS_URL, ['name' => 'Notice'], ['file' => $this->uploadedFile()]);

        self::assertResponseIsSuccessful();
        $body = $this->forwardedBody();
        $this->assertMultipartField('public_url', 'false', $body);
        self::assertStringNotContainsString('name="description"', $body);
        self::assertStringNotContainsString('name="labels"', $body);
    }

    private function uploadedFile(): UploadedFile
    {
        $path = (string) tempnam(sys_get_temp_dir(), 'doc');
        file_put_contents($path, 'contenu test');

        return new UploadedFile($path, 'notice.txt', 'text/plain', null, true);
    }

    private function forwardedBody(): string
    {
        $requests = EntrepotMockResponseFactory::writeRequests();
        self::assertCount(1, $requests);

        return $requests[0]['body'];
    }

    private function assertMultipartField(string $name, string $value, string $body): void
    {
        self::assertMatchesRegularExpression('/name="'.preg_quote($name, '/').'"\r\n(?:[^\r\n]+\r\n)*\r\n'.preg_quote($value, '/').'\r\n/', $body);
    }
}
