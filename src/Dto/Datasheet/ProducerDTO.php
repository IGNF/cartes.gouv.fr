<?php

namespace App\Dto\Datasheet;

use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Un producteur / contact de la fiche de données (section producteur du formulaire).
 */
class ProducerDTO
{
    /** @var string[] */
    public const ROLES = ['pointOfContact', 'custodian', 'author', 'owner', 'resourceProvider'];

    public function __construct(
        #[SerializedName('organization_name')]
        #[Assert\NotBlank(message: "Le nom de l'organisme est obligatoire")]
        public readonly string $organization_name = '',

        #[SerializedName('organization_email')]
        #[Assert\NotBlank(message: "L'adresse électronique de l'organisme est obligatoire")]
        #[Assert\Email(message: "L'adresse électronique {{ value }} n'est pas valide")]
        public readonly string $organization_email = '',

        #[Assert\NotBlank(message: 'Le rôle du producteur est obligatoire')]
        #[Assert\Choice(choices: self::ROLES, message: 'Le rôle du producteur est invalide')]
        public readonly string $role = '',

        #[SerializedName('address_number_and_streetname')]
        public readonly ?string $address_number_and_streetname = null,

        #[SerializedName('address_postal_code')]
        public readonly ?string $address_postal_code = null,

        #[SerializedName('address_city')]
        public readonly ?string $address_city = null,
    ) {
    }
}
