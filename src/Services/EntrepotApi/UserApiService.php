<?php

namespace App\Services\EntrepotApi;

use App\Exception\ApiException;
use App\Services\SandboxService;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class UserApiService extends BaseEntrepotApiService
{
    public function __construct(
        HttpClientInterface $httpClient,
        ParameterBagInterface $parameters,
        Filesystem $filesystem,
        RequestStack $requestStack,
        LoggerInterface $logger,
        private DatastoreApiService $datastoreApiService,
        private SandboxService $sandboxService,
        private CacheInterface $cache,
    ) {
        parent::__construct($httpClient, $parameters, $filesystem, $requestStack, $logger);
    }

    public function getMe(): array
    {
        return $this->cache->get('users-me', function (ItemInterface $item) {
            $item->expiresAfter(15);

            $user = $this->request('GET', 'users/me');

            foreach ($user['communities_member'] as &$communitiesMember) {
                if ($this->sandboxService->isSandboxCommunity($communitiesMember['community']['_id'])) {
                    $communitiesMember['community']['is_sandbox'] = true;
                    $communitiesMember['community']['name'] = 'Découverte';
                }
            }

            // tri pour positionner le bac à sable en premier
            $user['communities_member'] = $this->sortCommunitiesMemberBySandbox($user['communities_member']);

            return $user;
        });
    }

    /**
     * @SuppressWarnings(ShortVariable)
     */
    public function getMyDatastores(): array
    {
        $me = $this->getMe();

        $datastoresList = [];
        $communitiesMember = $me['communities_member'];
        foreach ($communitiesMember as $communityMember) {
            $community = $communityMember['community'];
            if (isset($community['datastore'])) {
                $datastoresList[] = $community['datastore'];
            }
        }

        $datastores = [];
        foreach ($datastoresList as $datastoreId) {
            try {
                $datastores[] = $this->datastoreApiService->get($datastoreId);
            } catch (ApiException $ex) {
                // Rien à faire de particulier. On ignore silencieusement l'erreur et pour l'utilisateur c'est comme si ce datastore n'existait pas.
            }
        }

        return $datastores;
    }

    /**
     * @SuppressWarnings(ShortVariable)
     */
    public function getMyCommunityRights(string $communityId): ?array
    {
        $me = $this->getMe();

        foreach ($me['communities_member'] as $communityRights) {
            if ($communityRights['community']['_id'] == $communityId) {
                return $communityRights;
            }
        }

        return null;
    }

    public function getMyKey(string $keyId): array
    {
        return $this->request('GET', "users/me/keys/$keyId");
    }

    public function getMyKeys(): array
    {
        return $this->requestAll('users/me/keys');
    }

    public function getKeyAccesses(string $keyId): array
    {
        return $this->requestAll("users/me/keys/$keyId/accesses");
    }

    public function getMyPermissions(): array
    {
        return $this->requestAll('users/me/permissions');
    }

    public function getPermission(string $permissionId): array
    {
        return $this->request('GET', "users/me/permissions/$permissionId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addKey(array $body): array
    {
        return $this->request('POST', 'users/me/keys', $body);
    }

    /**
     * @param array<mixed> $body
     */
    public function updateKey(string $keyId, array $body): array
    {
        $this->request('PATCH', "users/me/keys/$keyId", $body);

        return $this->getMyKey($keyId);
    }

    public function removeKey(string $keyId): array
    {
        return $this->request('DELETE', "users/me/keys/$keyId");
    }

    /**
     * @param array<mixed> $body
     */
    public function addAccess(string $keyId, array $body): array
    {
        return $this->request('POST', "users/me/keys/$keyId/accesses", $body);
    }

    public function removeAccess(string $keyId, string $accessId): array
    {
        return $this->request('DELETE', "users/me/keys/$keyId/accesses/$accessId");
    }

    /**
     * @param array<mixed> $communitiesMember
     */
    private function sortCommunitiesMemberBySandbox(array $communitiesMember): array
    {
        usort($communitiesMember, function ($a, $b) {
            if (isset($a['community']['is_sandbox']) && true === $a['community']['is_sandbox']) {
                return -1;
            }

            if (isset($b['community']['is_sandbox']) && true === $b['community']['is_sandbox']) {
                return 1;
            }

            return 0;
        });

        return $communitiesMember;
    }
}
