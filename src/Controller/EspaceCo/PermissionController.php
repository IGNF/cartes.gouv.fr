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
            $tablesToremove = [];   // Les tables a supprimer (celles qui ont une permission NONE ou ADMIN)

            $response = [];

            $permissions = $this->permissionApiService->getAllByCommunity($communityId);
            foreach ($permissions as $permission) {
                $tableId = $permission['table'];
                if ('NONE' === $permission['level'] || 'ADMIN' === $permission['level']) {
                    if (!is_null($tableId)) {
                        // Table a supprimer
                        $fullName = $this->databaseApiService->getTableFullName($permission['database'], $tableId);
                        if (!in_array($fullName, $tablesToremove)) {
                            $tablesToremove[] = $fullName;
                        }
                    }
                    continue;
                }

                if (is_null($permission['table'])) {   // Ajout de toutes les tables
                    // TODO Ajouter columns
                    $tables = $this->databaseApiService->getAllTables($permission['database'], ['id', 'database_id', 'full_name'/* , 'columns' */]);
                    foreach ($tables as $table) {
                        $response[] = $table;
                    }
                }
            }

            $response = array_filter($response, function ($table, $name) use ($tablesToremove) {
                return !in_array($name, $tablesToremove);
            }, ARRAY_FILTER_USE_BOTH);

            usort($response, function ($a, $b) {
                $fna = $a['full_name'];
                $fnb = $b['full_name'];
                if ($fna === $fnb) {
                    return 0;
                }

                return ($fna < $fnb) ? -1 : 1;
            });

            $t = array_values(array_unique($response, SORT_REGULAR));

            return new JsonResponse($t);
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
