<?php

namespace App\Dto\Pyramid;

use Symfony\Component\Validator\Constraints as Assert;

class PublishPyramidDTO
{
    public function __construct(
        #[Assert\NotBlank(['message' => 'common.technical_name_error'])]
        #[Assert\Regex(['pattern' => '/^[\w\-\.]+$/', 'message' => 'common.technical_name_regex'])]
        public readonly string $technical_name,

        #[Assert\NotBlank(['message' => 'common.public_name_error'])]
        public readonly string $public_name,

        // common
        #[Assert\NotBlank(['message' => 'common.description_error'])]
        public readonly string $description,

        #[Assert\NotBlank(['message' => 'common.identifier_error'])]
        #[Assert\Regex(['pattern' => '/^[\w\-\.]+$/', 'message' => 'common.identifier_regex'])]
        public readonly string $identifier,

        /** @var array<string> */
        #[Assert\Count(min: 1, minMessage: 'common.category_min_error')]
        public readonly array $category,

        /** @var array<string> */
        public readonly array $keywords,

        #[Assert\NotBlank(['message' => 'common.email_contact_error'])]
        #[Assert\Email(message: 'email_contact {{ value }} n\'est pas une adresse email valide')]
        public readonly string $email_contact,

        #[Assert\Date(message: 'creation_date {{ value }} n\'est pas une date valide')]
        public readonly string $creation_date,

        #[Assert\NotBlank(['message' => 'common.organization_error'])]
        public readonly string $organization,

        #[Assert\NotBlank(['message' => 'common.organization_email_error'])]
        #[Assert\Email(message: 'organization_email {{ value }} n\est pas une adresse email valide')]
        public readonly string $organization_email,

        #[Assert\NotBlank(['message' => 'common.projection_error'])]
        public readonly string $projection,

        // #[Assert\NotBlank(['message' => 'common.attribution_text_mandatory_error'])]
        public readonly string $attribution_text,

        // #[Assert\NotBlank(['message' => 'common.attribution_url_mandatory_error'])]
        #[Assert\Url(['message' => 'common.attribution_url_error'])]
        public readonly string $attribution_url,

        /** @var array<mixed> */
        #[Assert\Count(min: 1, minMessage: 'common.language_min_error')]
        public readonly array $languages,

        #[Assert\NotBlank(['message' => 'common.charset_error'])]
        public readonly string $charset,

        // #[Assert\NotBlank(['message' => 'common.encoding_error'])]
        // public readonly string $encoding,

        #[Assert\Choice([
            'choices' => ['', '200', '500', '1000', '2000', '5000', '10000', '25000', '50000', '100000', '250000', '500000', '1000000', '5000000',  '10000000'], // NOTE : doit correspondre à assets/data/md_resolutions.json
            'message' => 'common.resolution_error',
        ])]
        public readonly ?string $resolution,

        #[Assert\Choice([
            'choices' => ['', 'dataset', 'series'],
            'message' => 'common.hierarchy_level_error',
        ])]
        public readonly ?string $hierarchy_level,

        public readonly ?string $resource_genealogy,

        #[Assert\Choice([
            'choices' => ['all_public', 'your_community'], 	// TODO NON EXHAUSTIF
            'message' => 'common.share_with_error',
        ])]
        public readonly string $share_with,
    ) {
    }
}
