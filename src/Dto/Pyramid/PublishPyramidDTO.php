<?php

namespace App\Dto\Pyramid;
 
use Symfony\Component\Validator\Constraints as Assert;

class PublishPyramidDTO {
    public function __construct(
		#[Assert\NotBlank(['message' => 'pyramid_publish.technical_name_error'])]
		#[Assert\Regex(['pattern' => '/^[\w\-\.]+$/', 'message' => 'pyramid_publish.technical_name_regex'])]
		public readonly string $technical_name,

		#[Assert\NotBlank(['message' => 'pyramid_publish.public_name_error'])]
		public readonly string $public_name,

		#[Assert\NotBlank(['message' => 'pyramid_publish.description_error'])]
		public readonly string $description,

		#[Assert\NotBlank(['message' => 'pyramid_publish.identifier_error'])]
		#[Assert\Regex(['pattern' => '/^[\w\-\.]+$/', 'message' => 'pyramid_publish.identifier_regex'])]
		public readonly string $identifier,

		/** @var array<string> */
		#[Assert\Count(min: 1, minMessage: 'pyramid_publish.category_min_error')]
		public readonly array $category,

		#[Assert\Email(message: 'email_contact {{ value }} n\est pas valide')]
		public readonly string $email_contact,

		#[Assert\Date(message: 'creation_date {{ value }} n\est pas valide')]
		public readonly string $creation_date,

		#[Assert\Choice([
			'choices' => ['dataset','series'], 
			'message' => 'pyramid_publish.resource_genealogy_error'
		])]
        public readonly ? string $resource_genealogy,

		#[Assert\NotBlank(['message' => 'pyramid_publish.organization_error'])]
        public readonly  string $organization,

		#[Assert\Email(message: 'organization_email {{ value }} n\est pas valide')]
		public readonly string $organization_email,

		#[Assert\NotBlank(['message' => 'pyramid_publish.projection_error'])]
		public readonly string $projection,

		/** @var array<string> */
		#[Assert\Count(min: 1, minMessage: 'pyramid_publish.languages_min_error')]
		public readonly array $languages,

		#[Assert\NotBlank(['message' => 'pyramid_publish.charset_error'])]
		public readonly string $charset,

		#[Assert\NotBlank(['message' => 'pyramid_publish.encoding_error'])]
		public readonly string $encoding,

		#[Assert\Choice([
			'choices' => ['25000','75000','100000','150000', '200000','250000', '1000000'], // TODO NON EXHAUSTI
			'message' => 'pyramid_publish.resolution_error'
		])]
		public readonly ? string $resolution,

		#[Assert\Choice([
			'choices' => ['all_public','your_community'], 	// TODO NON EXHAUSTIF
			'message' => 'pyramid_publish.share_with_error'
		])]
		public readonly string $share_with
    )
    {
    }
}