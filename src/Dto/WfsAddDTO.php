<?php

namespace App\Dto;
 
use Symfony\Component\Validator\Constraints as Assert;
use App\Dto\WfsTableDTO;

class WfsAddDTO {
    public function __construct(
        #[Assert\NotBlank(['message' => 'wfs_add.public_name_error'])]
        public readonly string $data_public_name,

        #[Assert\NotBlank(['message' => 'wfs_add.technical_name_error'])] 
		#[Assert\Regex(['pattern' => '/^[\w\-\.]+$/', 'message' => 'wfs_add.technical_name_regex'])]
        public readonly string $data_technical_name,
        
		#[Assert\Choice([
			'choices' => ['all_public','your_community'], 
			'message' => 'wfs_add.share_with_error'
		])]
        public readonly string $share_with,

		/**
		 * @var WfsTableDTO[]
		 */
		#[Assert\Valid]
		public readonly array $data_tables
    )
    {
    }
}