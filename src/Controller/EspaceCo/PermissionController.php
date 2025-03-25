<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\DatabaseApiService;
use App\Services\EspaceCoApi\PermissionApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/permission',
    name: 'cartesgouvfr_api_espaceco_permission_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
class PermissionController extends AbstractController implements ApiControllerInterface
{
    public const LEVELS = [
        'NONE' => 0,
        'VIEW' => 1,
        'EXPORT' => 2,
        'EDIT' => 3,
        'ADMIN' => 4,
    ];

    public function __construct(
        private PermissionApiService $permissionApiService,
        private DatabaseApiService $databaseApiService,
    ) {
    }

    /**
     * Recupere les tables pouvant être utilisées pour theme d'une communauté.
     */
    #[Route('/get_themable_tables/{communityId}', name: 'get_themable_tables_by_community', methods: ['GET'])]
    public function getThemableTables(int $communityId): JsonResponse
    {
        try {
            $tables = [];
            $tablesToremove = [];

            $permissions = $this->permissionApiService->getAllByCommunity($communityId);
            foreach ($permissions as $permission) {
                $tableId = $permission['table'];

                // On doit avoir au moins une permission en lecture et non ADMIN
                $isOK = 'NONE' !== $permission['level'] && 'ADMIN' !== $permission['level'];

                if (is_null($tableId) && $isOK) {	// Permission sur une base de données
                    // Ajout de toutes les tables
                    $allTables = $this->databaseApiService->getAllTables($permission['database'], ['id', 'database_id', 'full_name']);
                    foreach ($allTables as $table) {
                        $tables[] = $table['full_name'];
                    }
                } elseif (!is_null($tableId) && !$isOK) { // Permission sur une table non désirée
                    $fullName = $this->databaseApiService->getTableFullName($permission['database'], $tableId);
                    if (!in_array($fullName, $tablesToremove)) {
                        $tablesToremove[] = $fullName;
                    }
                }
            }

            $tables = array_filter($tables, function ($fullName) use ($tablesToremove) {
                return !in_array($fullName, $tablesToremove);
            });
            asort($tables);
            $t = array_unique($tables);

            return new JsonResponse(array_values($t));
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<string> $dbIds
     */
    #[Route('/get/{communityId}', name: 'get_databases_permissions', methods: ['GET'])]
    public function getDatabasesPermissions(
        int $communityId,
        #[MapQueryParameter] array $dbIds,
    ): JsonResponse {
        try {
            $permissions = [];
            foreach ($dbIds as $databaseId) {
                $dbPermissions = $this->permissionApiService->getAllPermissionsForDatabase($communityId, (int) $databaseId);
                $p = array_values(array_filter($dbPermissions, function ($p) {
                    return 'ADMIN' !== $p['level'];
                }));
                $permissions = array_merge($permissions, $p);
            }

            return new JsonResponse($permissions);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }
}
