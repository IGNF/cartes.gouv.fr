<?php

declare(strict_types=1);

namespace App\Dto\Contact;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class ContactUsDTO
{
    public const REQUEST_TYPE_SUPPORT = 'support';
    public const REQUEST_TYPE_ILLEGAL_CONTENT = 'illegal_content';
    public const REQUEST_TYPE_CONTENT_REMOVAL_CLAIM = 'content_removal_claim';
    public const REQUEST_TYPES = [self::REQUEST_TYPE_SUPPORT, self::REQUEST_TYPE_ILLEGAL_CONTENT, self::REQUEST_TYPE_CONTENT_REMOVAL_CLAIM];

    public function __construct(
        #[Assert\NotBlank(message: 'contact_us.email_contact_mandatory')]
        #[Assert\Email(message: 'contact_us.email_contact_error')]
        public string $email_contact,

        #[Assert\NotBlank(message: 'contact_us.message_mandatory')]
        #[Assert\Length(max: 8000, maxMessage: 'contact_us.message_too_long')]
        public string $message,

        public string $first_name,
        public string $last_name,
        public string $category,
        public string $organization,

        #[Assert\Choice(choices: self::REQUEST_TYPES, message: 'contact_us.request_type_error')]
        public string $request_type = self::REQUEST_TYPE_SUPPORT,

        public ?string $geocaptchaToken = null,
    ) {
    }
}
