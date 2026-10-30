<?php

declare(strict_types=1);

use Rector\CodeQuality\Rector\Attribute\SortAttributeNamedArgsRector;
use Rector\CodeQuality\Rector\Catch_\ThrowWithPreviousExceptionRector;
use Rector\Config\RectorConfig;
use Rector\Php74\Rector\Closure\ClosureToArrowFunctionRector;
use Rector\Php74\Rector\Property\RestoreDefaultNullToNullableTypePropertyRector;
use Rector\Set\ValueObject\SetList;
use Rector\Symfony\Set\SymfonySetList;
use Rector\TypeDeclaration\Rector\StmtsAwareInterface\SafeDeclareStrictTypesRector;

return RectorConfig::configure()
    ->withPaths([__DIR__.'/src', __DIR__.'/tests'])
    ->withPhpSets()
    ->withComposerBased(symfony: true)
    ->withSets([
        SetList::DEAD_CODE,
        SetList::CODE_QUALITY,
        SymfonySetList::SYMFONY_CODE_QUALITY,
        SymfonySetList::SYMFONY_CONSTRUCTOR_INJECTION,
    ])
    ->withImportNames(importShortClasses: false, removeUnusedImports: true)
    ->withSkip([
        // coercion implicite des valeurs API/requête, non couverte par les tests
        SafeDeclareStrictTypesRector::class,
        // bug Rector : remplit $details avec l’exception quand l’appel n’a que deux arguments
        ThrowWithPreviousExceptionRector::class,
        // le XML ISO teste `is defined` sur les propriétés laissées non initialisées
        RestoreDefaultNullToNullableTypePropertyRector::class,
        // réordonne les attributs et les met sur une seule ligne, diff illisible
        SortAttributeNamedArgsRector::class,
        // produit des fonctions fléchées de plus de 300 caractères
        ClosureToArrowFunctionRector::class,
    ]);
