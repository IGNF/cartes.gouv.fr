<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class CommonDTO
{
    public function __construct(
        #[Assert\NotBlank(['message' => 'metadatas.technical_name_error'])]
        #[Assert\Regex(['pattern' => '/^[A-Za-z_][A-Za-z0-9_.-]*$/', 'message' => 'metadatas.technical_name_regex'])]
        public readonly string $technical_name,

        #[Assert\NotBlank(['message' => 'metadatas.public_name_error'])]
        public readonly string $public_name,

        #[Assert\NotBlank(['message' => 'metadatas.description_error'])]
        public readonly string $description,

        #[Assert\NotBlank(['message' => 'metadatas.identifier_error'])]
        #[Assert\Regex(['pattern' => '/^[\w\-\.]+$/', 'message' => 'metadatas.identifier_regex'])]
        public readonly string $identifier,

        /** @var array<string> */
        #[Assert\Count(min: 1, minMessage: 'metadatas.category_min_error')]
        public readonly array $category,

        #[Assert\NotBlank(['message' => 'metadatas.email_contact_error'])]
        #[Assert\Email(message: 'email_contact {{ value }} n\'est pas une adresse email valide')]
        public readonly string $email_contact,

        #[Assert\Date(message: 'creation_date {{ value }} n\'est pas une date valide')]
        public readonly string $creation_date,

        #[Assert\NotBlank(['message' => 'metadatas.organization_error'])]
        public readonly string $organization,

        #[Assert\NotBlank(['message' => 'metadatas.organization_email_error'])]
        #[Assert\Email(message: 'organization_email {{ value }} n\est pas une adresse email valide')]
        public readonly string $organization_email,

        #[Assert\NotBlank(['message' => 'metadatas.projection_error'])]
        public readonly string $projection,

        /** @var array<string> */
        #[Assert\Count(min: 1, minMessage: 'metadatas.language_min_error')]
        public readonly array $language,

        #[Assert\NotBlank(['message' => 'metadatas.charset_error'])]
        public readonly string $charset,

        // #[Assert\NotBlank(['message' => 'metadatas.encoding_error'])]
        // public readonly string $encoding,

        #[Assert\Choice([
            'choices' => ['', '200', '500', '1000', '2000', '5000', '10000', '25000', '50000', '100000', '250000', '500000', '1000000', '5000000',  '10000000'], // NOTE : doit correspondre à assets/data/md_resolutions.json
            'message' => 'metadatas.resolution_error',
        ])]
        public readonly string $resolution,

        #[Assert\Choice([
            'choices' => ['', 'dataset', 'series'],
            'message' => 'metadatas.resource_genealogy_error',
        ])]
        public readonly string $resource_genealogy,

        #[Assert\Choice([
            'choices' => ['all_public', 'your_community'], 	// TODO NON EXHAUSTIF
            'message' => 'metadatas.share_with_error',
        ])]
        public readonly string $share_with,
    ) {
    }
}
