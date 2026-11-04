<?php

namespace App\Constants;

/**
 * Accès d’un flux tel que choisi dans le formulaire de publication :
 * - public : endpoint ouvert ;
 * - restricted_visible : endpoint privé + permission pour la communauté cartes.gouv.fr (visualisable sur Explorer les cartes) ;
 * - restricted : endpoint privé, aucune permission pour la communauté cartes.gouv.fr.
 * La communauté propre de l’entrepôt reçoit une permission sur les deux options restreintes.
 */
final class ServiceAccess
{
    public const PUBLIC = 'public';
    public const RESTRICTED_VISIBLE = 'restricted_visible';
    public const RESTRICTED = 'restricted';

    public const ALL = [self::PUBLIC, self::RESTRICTED_VISIBLE, self::RESTRICTED];

    public static function isOpen(string $access): bool
    {
        return self::PUBLIC === $access;
    }

    public static function allowsCartesGouvView(string $access): bool
    {
        return self::RESTRICTED_VISIBLE === $access;
    }
}
