<?php

declare(strict_types=1);

namespace App\Dto\Contact;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class ContactUsDTO
{
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
    ) {
    }
}
