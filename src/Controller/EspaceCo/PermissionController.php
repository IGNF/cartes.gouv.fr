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

    #[Route('/get/{communityId}', name: 'get', methods: ['GET'])]
    public function get(int $communityId): JsonResponse
    {
        try {
            $permissions = $this->permissionApiService->getAllByCommunity($communityId, 'VIEW,EDIT,EXPORT');
            $groupBy = $this->_groupBy($permissions);

            // Ajout du nom et title des bases, tables et colonnes
            foreach ($groupBy as $dbId => &$config) {
                $database = $this->databaseApiService->getDatabase($dbId, ['title']);
                $config['title'] = $database['title'];
                if (!count($config['tables'])) {
                    $config['tables'] = null;
                    continue;
                }

                foreach ($config['tables'] as $tableId => &$configTable) {
                    $table = $this->databaseApiService->getTable($dbId, $tableId, ['title']);
                    $configTable['title'] = $table['title'];
                    if (!count($configTable['columns'])) {
                        $config['columns'] = null;
                        continue;
                    }

                    foreach ($configTable['columns'] as $columnId => &$configColumn) {
                        $column = $this->databaseApiService->getColumn($dbId, $tableId, $columnId, ['title']);
                        $configColumn['title'] = $column['title'];
                    }
                }
            }

            return new JsonResponse($groupBy);
            /* $dbs = []; $tables = []; $columns = [];
            foreach($permissions as &$permission) {
                if (! array_key_exists($permission['database'], $dbs)) {
                    $database = $this->databaseApiService->getDatabase($permission['database'], ['title']);

                    $partialDb = ['id' => $permission['database'], 'title' => $database['title']];
                    $dbs[$permission['database']] = $partialDb;
                    $permission['database'] = $partialDb;
                } else {
                    $permission['database'] = $dbs[$permission['database']];
                }

                // Les tables
                if (! is_null($permission['table'])) {
                    $db = $permission['database']['id']; $t = $permission['table'];
                    $id = "$db:$t";
                    if (! array_key_exists($id, $tables)) {
                        $table = $this->databaseApiService->getTable($db, $t, ['title']);

                        $partialTable = ['id' => $permission['table'], 'title' => $table['title']];
                        $tables[$id] = $partialTable;
                        $permission['table'] = $partialTable;
                    } else {
                        $permission['table'] = $tables[$id];
                    }
                }

                // les colonnes
                if (! is_null($permission['column'])) {
                    $db = $permission['database']['id']; $t = $permission['table']['id']; $col = $permission['column'];
                    $id = "$db:$t:$col";
                    if (! array_key_exists($id, $columns)) {
                        $column = $this->databaseApiService->getColumn($db, $t, $permission['column'], ['title']);

                        $partialColumn = ['id' => $permission['column'], 'title' => $column['title']];
                        $columns[$id] = $partialColumn;
                        $permission['column'] = $partialColumn;
                    } else {
                        $partialColumn = $columns[$id];
                        $permission['column'] = $partialColumn;
                    }
                }
            }
            return new JsonResponse($permissions); */
        } catch (ApiException $ex) {
            throw new CartesApiException($ex->getMessage(), $ex->getStatusCode(), $ex->getDetails(), $ex);
        }
    }

    /**
     * @param array<string> $dbIds
     */
    #[Route('/get_on_dbs/{communityId}', name: 'get_databases_permissions', methods: ['GET'])]
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

        if (!array_key_exists($database, $groupBy)) {
            $groupBy[$database] = ['level' => $level, 'tables' => []];
        } else {
            $groupBy[$database]['level'] = $level;
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

        // la base de donnes n'existe pas
        if (!array_key_exists($database, $groupBy)) {
            $groupBy[$database] = ['level' => 'NONE', 'tables' => []];
        }

        // la table n'existe pas
        if (!array_key_exists($table, $groupBy[$database]['tables'])) {
            $groupBy[$database]['tables'][$table] = ['level' => $level, 'columns' => []];
        } else {
            $groupBy[$database]['tables'][$table]['level'] = $level;
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

        // la base de donnes n'existe pas
        if (!array_key_exists($database, $groupBy)) {
            $groupBy[$database] = ['level' => 'NONE', 'tables' => []];
        }

        // la table n'existe pas
        if (!array_key_exists($table, $groupBy[$database]['tables'])) {
            $groupBy[$database]['tables'][$table] = ['level' => 'NONE', 'columns' => []];
        }

        $groupBy[$database]['tables'][$table]['columns'][$column] = ['level' => $level];
    }
}
