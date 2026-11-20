<?php

declare(strict_types=1);

namespace App\Dto\Datasheet;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Un producteur / contact de la fiche de données (section producteur du formulaire).
 */
class ProducerDTO
{
    /** @var string[] */
    public const ROLES = ['pointOfContact', 'contact', 'custodian', 'author', 'owner', 'resourceProvider'];

    public function __construct(
        #[Assert\NotBlank(message: 'Le nom de l’organisme est obligatoire')]
        public readonly string $organization_name = '',

        #[Assert\NotBlank(message: 'L’adresse électronique de l’organisme est obligatoire')]
        #[Assert\Email(message: 'L’adresse électronique {{ value }} n’est pas valide')]
        public readonly string $organization_email = '',

        #[Assert\NotBlank(message: 'Le rôle du producteur est obligatoire')]
        #[Assert\Choice(choices: self::ROLES, message: 'Le rôle du producteur est invalide')]
        public readonly string $role = '',

        public readonly ?string $address_number_and_streetname = null,

        public readonly ?string $address_postal_code = null,

        public readonly ?string $address_city = null,
    ) {
    }

    // même organisme, adresse comprise, quel que soit le rôle
    public function sameOrganizationAs(self $other): bool
    {
        return [$this->organization_name, $this->organization_email, $this->address_number_and_streetname, $this->address_postal_code, $this->address_city]
            === [$other->organization_name, $other->organization_email, $other->address_number_and_streetname, $other->address_postal_code, $other->address_city];
    }
}
