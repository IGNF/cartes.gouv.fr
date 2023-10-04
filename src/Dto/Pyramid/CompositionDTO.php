<?php

namespace App\Dto\Pyramid;
 
use Symfony\Component\Validator\Constraints as Assert;

class CompositionDTO {
	public function __construct(
		#[Assert\NotBlank(['message' => 'pyramid_add.composition.table_error'])]
		public readonly string $table,

		/**
		 * @var string[]
		 */
		#[Assert\Count(min: 1, minMessage: 'pyramid_add.composition.attributes_error')]
		public readonly array $attributes,

		#[Assert\Range(
			min: 5,
			max: 18,
			notInRangeMessage: 'pyramid_add.composition.bottom_level_error'
		)]
		public readonly int $bottom_level,

		#[Assert\Range(
			min: 5,
			max: 18,
			notInRangeMessage: 'pyramid_add.composition.top_level_error'
		)]
		public readonly int $top_level
	) {}
}