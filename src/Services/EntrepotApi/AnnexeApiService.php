<?php

namespace App\Services\EntrepotApi;

use Symfony\Component\HttpFoundation\File\UploadedFile;

class AnnexeApiService extends AbstractEntrepotApiService
{
    public function getAll(string $datastoreId): array
    {
        return $this->requestAll("datastores/$datastoreId/annexes");
    }

    public function get(string $datastoreId, string $annexeId): array
    {
        // TODO : mettre à jour l'url annexe
        $apiPlageAnnexeUrl = $this->parameters->get('api_plage_annexe_url');
        $response = $this->request('GET', "datastores/$datastoreId/annexes/$annexeId");
        $response['paths'][0] = $apiPlageAnnexeUrl.$response['paths'][0];

        return $response;
    }

    public function add(string $datastoreId, UploadedFile $annexeFile, string $path): array
    {
        $directory = $this->parameters->get('upload_path');
        $filepath = $directory.'/'.$annexeFile->getClientOriginalName();
        $annexeFile->move($directory, $annexeFile->getClientOriginalName());

        $response = $this->postFile("datastores/$datastoreId/annexes", $filepath, [
            'published' => 'true',
            'paths' => $path,
        ]);

        $this->filesystem->remove($filepath);

        return $response;
    }

    public function publish(string $datastoreId, string $annexeId): array
    {
        return $this->request('PATCH', "datastores/$datastoreId/annexes/$annexeId", [
            'published' => true,
        ]);
    }

    public function remove(string $datastoreId, string $annexeId): void
    {
        $this->request('DELETE', "datastores/$datastoreId/annexes/$annexeId");
    }
}
