<?php

namespace App\Controller\EspaceCo;

use App\Controller\ApiControllerInterface;
use App\Exception\ApiException;
use App\Exception\CartesApiException;
use App\Services\EspaceCoApi\DatabaseApiService;
use App\Services\EspaceCoApi\PermissionApiService;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route(
    '/api/espaceco/permission',
    name: 'cartesgouvfr_api_espaceco_permission_',
    options: ['expose' => true],
    condition: 'request.isXmlHttpRequest()'
)]
#[OA\Tag(name: '[espaceco] permissions', description: "Permissions d'accès")]
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

    #[Route('/get_viewable_tables/{communityId}', name: 'get_viewable_tables_by_community', methods: ['GET'])]
    public function getViewableTables(int $communityId): JsonResponse
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
                    $allTables = $this->databaseApiService->getAllTables($permission['database']);
                    foreach ($allTables as $table) {
                        $tables[$table['full_name']] = $table;
                    }
                    continue;
                }

                if ($tableId) {
                    $table = $this->databaseApiService->getTable($permission['database'], $tableId);
                    if ($isOK) {
                        if (!array_key_exists($table['full_name'], $tables)) {
                            $tables[$table['full_name']] = $table;
                        }
                    } elseif ('NONE' == $permission['level']) {
                        $tablesToremove[] = $table['full_name'];
                    }
                }
            }

            $tables = array_filter($tables, function ($fullName) use ($tablesToremove) {
                return !in_array($fullName, $tablesToremove);
            }, ARRAY_FILTER_USE_KEY);

            ksort($tables);

            return new JsonResponse($tables);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
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
                    $table = $this->databaseApiService->getTable($permission['database'], $tableId, ['full_name']);
                    $fullName = $table['full_name'];
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

    #[Route('/get/{communityId}', name: 'get', methods: ['GET'])]
    public function get(int $communityId): JsonResponse
    {
        try {
            $permissions = $this->permissionApiService->getAllByCommunity(
                $communityId,
                ['NONE', 'VIEW', 'EDIT', 'EXPORT'],
                ['database', 'table', 'column', 'level', 'database_title', 'table_name', 'table_title', 'column_name', 'column_title']
            );
            $groupBy = $this->_groupBy($permissions);

            return new JsonResponse($groupBy);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    #[Route('/update/{communityId}', name: 'update', methods: ['PATCH'])]
    public function update(int $communityId, Request $request): JsonResponse
    {
        try {
            $permissions = $this->permissionApiService->getAllByCommunity(
                $communityId,
                ['NONE', 'VIEW', 'EDIT', 'EXPORT']
            );

            $oldPermissionsByKey = [];

            // On regroupe par cle (database:table:column)
            foreach ($permissions as $permission) {
                $key = $this->_composeKey($permission);
                $oldPermissionsByKey[$key] = ['id' => $permission['id'], 'level' => $permission['level']];
            }

            // On regroupe par cle (database:table:column)
            $datas = json_decode($request->getContent(), true);
            $newPermissionsByKey = $this->_groupByKey($datas);

            // Les cles communes
            $commons = array_keys(array_intersect_key($oldPermissionsByKey, $newPermissionsByKey));

            if (0 != count($commons)) {
                // Recherche des modifications
                foreach ($commons as $key) {
                    $oldPermissionConfig = $oldPermissionsByKey[$key];
                    $newPermission = $newPermissionsByKey[$key];
                    if ($newPermission['level'] != $oldPermissionConfig['level']) {
                        $this->permissionApiService->update($oldPermissionConfig['id'], ['level' => $newPermission['level']]);
                    }
                }
            }

            $diff = array_diff_key($oldPermissionsByKey, $newPermissionsByKey);
            if (0 != count($diff)) {    // Suppressions
                foreach ($oldPermissionsByKey as $key => $config) {
                    $this->permissionApiService->remove($config['id']);
                }
            }

            $diff = array_diff_key($newPermissionsByKey, $oldPermissionsByKey);
            if (0 != count($diff)) {    // Ajouts
                foreach ($newPermissionsByKey as $key => $config) {
                    $this->permissionApiService->add($config);
                }
            }

            $permissions = $this->permissionApiService->getAllByCommunity(
                $communityId,
                ['NONE', 'VIEW', 'EDIT', 'EXPORT'],
                ['database', 'table', 'column', 'level', 'database_title', 'table_name', 'table_title', 'column_name', 'column_title']
            );
            $groupBy = $this->_groupBy($permissions);

            return new JsonResponse($groupBy);
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<mixed> $permissions
     *
     * @return array<mixed>
     */
    private function _groupBy(array $permissions): array
    {
        $groupBy = [];
        foreach ($permissions as $permission) {
            if (is_null($permission['table'])) {
                $this->_addDatabasePermission($permission, $groupBy);
            } elseif (is_null($permission['column'])) {
                $this->_addTablePermission($permission, $groupBy);
            } else {
                $this->_addColumnPermission($permission, $groupBy);
            }
        }

        return $groupBy;
    }

    /**
     * @param array<mixed> $permission
     * @param array<mixed> $groupBy
     *
     * @return void
     */
    private function _addDatabasePermission($permission, &$groupBy)
    {
        $database = $permission['database'];
        $level = 'EXPORT' == $permission['level'] ? 'VIEW' : $permission['level'];

        $index = $this->_findDatabase($database, $groupBy);
        if ($index < 0) {
            $groupBy[] = ['id' => $database, 'title' => $permission['database_title'], 'level' => $level, 'tables' => []];
        } else {
            $groupBy[$index]['level'] = $level;
        }
    }

    /**
     * @param array<mixed> $permission
     * @param array<mixed> $groupBy
     *
     * @return void
     */
    private function _addTablePermission($permission, &$groupBy)
    {
        $database = $permission['database'];
        $table = $permission['table'];

        $level = 'EXPORT' == $permission['level'] ? 'VIEW' : $permission['level'];

        $index = $this->_findDatabase($database, $groupBy);
        if ($index < 0) {   // la base de donnes n'existe pas
            $groupBy[] = ['id' => $database, 'title' => $permission['database_title'], 'level' => 'NONE', 'tables' => []];
            $index = $this->_findDatabase($database, $groupBy);
        }

        $tableIndex = $this->_findTable($table, $groupBy[$index]['tables']);
        if ($tableIndex < 0) {
            $title = is_null($permission['table_title']) ? $permission['table_name'] : $permission['table_title'];
            $groupBy[$index]['tables'][] = ['id' => $table, 'title' => $title, 'level' => 'NONE', 'columns' => []];
        } else {
            $groupBy[$index]['tables'][$tableIndex]['level'] = $level;
        }
    }

    /**
     * @param array<mixed> $permission
     * @param array<mixed> $groupBy
     *
     * @return void
     */
    private function _addColumnPermission($permission, &$groupBy)
    {
        $database = $permission['database'];
        $table = $permission['table'];
        $column = $permission['column'];

        $level = 'EXPORT' == $permission['level'] ? 'VIEW' : $permission['level'];

        $index = $this->_findDatabase($database, $groupBy);
        if ($index < 0) {
            $groupBy[] = ['id' => $database, 'title' => $permission['database_title'], 'level' => 'NONE', 'tables' => []];
            $index = $this->_findDatabase($database, $groupBy);
        }

        $tableIndex = $this->_findTable($table, $groupBy[$index]['tables']);
        if ($tableIndex < 0) {
            $title = is_null($permission['table_title']) ? $permission['table_name'] : $permission['table_title'];
            $groupBy[$index]['tables'][] = ['id' => $table, 'title' => $title, 'level' => 'NONE', 'columns' => []];
            $tableIndex = $this->_findTable($table, $groupBy[$index]['tables']);
        }

        $title = is_null($permission['column_title']) ? $permission['column_name'] : $permission['column_title'];
        $groupBy[$index]['tables'][$tableIndex]['columns'][] = ['id' => $column, 'title' => $title, 'level' => $level];
    }

    /**
     * @param array<mixed> $groupBy
     */
    private function _findDatabase(int $databaseId, array $groupBy): int
    {
        foreach ($groupBy as $index => $database) {
            if ($database['id'] == $databaseId) {
                return $index;
            }
        }

        return -1;
    }

    /**
     * @param array<mixed> $tables
     */
    private function _findTable(int $tableId, array $tables): int
    {
        foreach ($tables as $index => $table) {
            if ($table['id'] == $tableId) {
                return $index;
            }
        }

        return -1;
    }

    /**
     * @param array<mixed> $permission
     */
    private function _composeKey(array $permission): string
    {
        $values = [$permission['database']];
        $values[] = $permission['table'] ? $permission['table'] : '';
        $values[] = $permission['column'] ? $permission['column'] : '';

        return implode(':', $values);
    }

    /**
     * @param array<mixed> $permissions
     *
     * @return array<mixed>
     */
    private function _groupByKey(array $permissions): array
    {
        $newPermissionsByKey = [];
        foreach ($permissions as $dbPermission) {
            $database = $dbPermission['id'];
            $newPermissionsByKey["$database::"] = ['database' => $database, 'level' => $dbPermission['level']];
            foreach ($dbPermission['tables'] as $tablePermission) {
                $table = $tablePermission['id'];
                $newPermissionsByKey["$database:$table:"] = ['database' => $database, 'table' => $table, 'level' => $tablePermission['level']];
                foreach ($tablePermission['columns'] as $columnPermission) {
                    $column = $columnPermission['id'];
                    $newPermissionsByKey["$database:$table:$column"] = ['database' => $database, 'table' => $table, 'column' => $column, 'level' => $dbPermission['level']];
                }
            }
        }

        return $newPermissionsByKey;
    }
}
