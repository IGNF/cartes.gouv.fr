<?php

namespace App\OpenApi;

use Nelmio\ApiDocBundle\Describer\DescriberInterface;
use Nelmio\ApiDocBundle\OpenApiPhp\Util;
use OpenApi\Annotations as OA;
use OpenApi\Generator;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

/**
 * Documente le corps d'erreur commun (schéma `ApiError`, RFC 9457) comme réponse par défaut de chaque route d'API.
 */
// après la description des routes (-400), avant les valeurs par défaut de Nelmio (-1000)
#[AutoconfigureTag('nelmio_api_doc.describer', ['priority' => -500])]
final class ApiErrorDescriber implements DescriberInterface
{
    public function describe(OA\OpenApi $api): void
    {
        $schema = Util::getSchema($api, 'ApiError');
        $schema->type = 'object';
        $schema->required = ['status', 'title'];
        Util::getProperty($schema, 'status')->type = 'integer';
        Util::getProperty($schema, 'title')->type = 'string';
        Util::getProperty($schema, 'detail')->type = 'string';
        $type = Util::getProperty($schema, 'type');
        $type->type = 'string';
        $type->description = 'Présent seulement quand le front branche dessus, ex. /errors/session-expired';
        Util::getProperty($schema, 'details')->type = 'object';
        $violations = Util::getProperty($schema, 'violations');
        $violations->type = 'array';
        $violations->description = 'Erreurs de validation (422)';
        Util::getChild($violations, OA\Items::class)->type = 'object';

        if (Generator::isDefault($api->paths)) {
            return;
        }

        foreach ($api->paths as $path) {
            foreach (Util::OPERATIONS as $method) {
                $operation = $path->{$method};
                if (Generator::isDefault($operation)) {
                    continue;
                }

                /** @var OA\Response $response */
                $response = Util::getIndexedCollectionItem($operation, OA\Response::class, 'default');
                $response->description = 'Erreur';
                /** @var OA\MediaType $mediaType */
                $mediaType = Util::getIndexedCollectionItem($response, OA\MediaType::class, 'application/problem+json');
                Util::getChild($mediaType, OA\Schema::class)->ref = '#/components/schemas/ApiError';
            }
        }
    }
}
