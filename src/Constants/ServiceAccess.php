<?php

declare(strict_types=1);

namespace App\Constants;

/**
 * Accès d’un flux choisi dans le formulaire de publication.
 * La communauté propre de l’entrepôt reçoit une permission sur les deux accès restreints.
 */
enum ServiceAccess: string
{
    // endpoint ouvert
    case Public = 'public';
    // endpoint privé + permission pour la communauté cartes.gouv.fr (visualisable sur Explorer les cartes)
    case RestrictedVisible = 'restricted_visible';
    // endpoint privé, aucune permission pour la communauté cartes.gouv.fr
    case Restricted = 'restricted';

    public function isOpen(): bool
    {
        return self::Public === $this;
    }

    public function allowsCartesGouvView(): bool
    {
        return self::RestrictedVisible === $this;
    }
}
