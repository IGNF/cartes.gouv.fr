<?php

namespace App\Dto\Services;

use App\Entity\CswMetadata\CswLanguage;
use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Validator\Constraints as Assert;

class CommonDTO
{
    #[Assert\NotBlank(['message' => 'common.technical_name_error'])]
    #[Assert\Regex(['pattern' => '/^[A-Za-z_][A-Za-z0-9_.-]*$/', 'message' => 'common.technical_name_regex'])]
    #[SerializedName('technical_name')]
    public string $technical_name;

    #[Assert\NotBlank(['message' => 'common.public_name_error'])]
    #[SerializedName('public_name')]
    public string $public_name;

    #[Assert\NotBlank(['message' => 'common.service_name_error'])]
    #[SerializedName('service_name')]
    public string $service_name;

    #[Assert\NotBlank(['message' => 'common.description_error'])]
    public string $description;

    #[Assert\NotBlank(['message' => 'common.identifier_error'])]
    #[Assert\Regex(['pattern' => '/^[\w\-\.]+$/', 'message' => 'common.identifier_regex'])]
    public string $identifier;

    /** @var array<string> */
    #[Assert\Count(min: 1, minMessage: 'common.category_min_error')]
    public array $category;

    /** @var array<string> */
    public array $keywords;

    /** @var array<string> */
    #[SerializedName('free_keywords')]
    public array $free_keywords;

    #[Assert\NotBlank(['message' => 'common.email_contact_error'])]
    #[Assert\Email(message: 'email_contact {{ value }} n\'est pas une adresse email valide')]
    #[SerializedName('email_contact')]
    public string $email_contact;

    #[Assert\Date(message: 'creation_date {{ value }} n\'est pas une date valide')]
    #[SerializedName('creation_date')]
    public string $creation_date;

    #[Assert\NotBlank(['message' => 'common.organization_error'])]
    public string $organization;

    #[Assert\NotBlank(['message' => 'common.organization_email_error'])]
    #[Assert\Email(message: 'organization_email {{ value }} n\est pas une adresse email valide')]
    #[SerializedName('organization_email')]
    public string $organization_email;

    #[Assert\NotBlank(['message' => 'common.projection_error'])]
    public string $projection;

    // #[Assert\NotBlank(['message' => 'common.attribution_text_mandatory_error'])]
    #[SerializedName('attribution_text')]
    public string $attribution_text;

    // #[Assert\NotBlank(['message' => 'common.attribution_url_mandatory_error'])]
    #[Assert\Url(['message' => 'common.attribution_url_error'])]
    #[SerializedName('attribution_url')]
    public string $attribution_url;

    #[Assert\NotNull(message: 'common.language_error')]
    public CswLanguage $language;

    #[Assert\NotBlank(['message' => 'common.charset_error'])]
    public string $charset;

    // #[Assert\NotBlank(['message' => 'common.encoding_error'])]
    // public  string $encoding;

    #[Assert\Choice([
        'choices' => ['', '200', '500', '1000', '2000', '5000', '10000', '25000', '50000', '100000', '250000', '500000', '1000000', '5000000',  '10000000'], // NOTE : doit correspondre à assets/data/md_resolutions.json
        'message' => 'common.resolution_error',
    ])]
    public ?string $resolution;

    #[Assert\Choice([
        'choices' => ['', 'dataset', 'series'],
        'message' => 'common.hierarchy_level_error',
    ])]
    #[SerializedName('hierarchy_level')]
    public ?string $hierarchy_level;

    #[SerializedName('resource_genealogy')]
    public ?string $resource_genealogy;

    #[Assert\NotBlank(['message' => 'common.frequency_code_error'])]
    #[SerializedName('frequency_code')]
    public ?string $frequency_code;

    #[Assert\NotBlank(['message' => 'common.share_with_error'])]
    #[Assert\Choice([
        'choices' => ['all_public', 'your_community'],
        'message' => 'common.share_with_error',
    ])]
    #[SerializedName('share_with')]
    public ?string $share_with;

    #[Assert\Type('bool')]
    #[SerializedName('allow_view_data')]
    public ?bool $allow_view_data = false;
}
