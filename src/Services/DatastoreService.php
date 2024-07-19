<?php

namespace App\Services;

use App\Services\EntrepotApi\CommunityApiService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class DatastoreService
{
    /** @var string|null */
    private $sandboxDatastoreId;

    public function __construct(
        private ParameterBagInterface $parameterBag,
        private CommunityApiService $communityApiService
    ) {
        $this->sandboxDatastoreId = null;

        $sandbox = $this->parameterBag->get('sandbox');
        $sandboxId = isset($sandbox['community_id']) ? $sandbox['community_id'] : null;

        if ($sandboxId) {
            try {
                $sandboxCommunity = $this->communityApiService->get($sandboxId);
                $this->sandboxDatastoreId = $sandboxCommunity['datastore']['_id'];
            } catch (\Throwable $e) {
            }
        }
    }

    public function getProcIntegrateVectorFilesInBase(string $datastoreId): string
    {
        $apiEntrepot = $datastoreId === $this->sandboxDatastoreId ? 'sandbox' : 'api_entrepot';
        $processings = $this->parameterBag->get($apiEntrepot)['processings'];

        return $processings['int_vect_files_db'];
    }

    public function getProcGeneratePyramid(string $datastoreId): string
    {
        $apiEntrepot = $datastoreId === $this->sandboxDatastoreId ? 'sandbox' : 'api_entrepot';
        $processings = $this->parameterBag->get($apiEntrepot)['processings'];

        return $processings['create_vect_pyr'];
    }
}
