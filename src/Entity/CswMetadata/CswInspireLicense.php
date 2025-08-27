<?php

namespace App\Entity\CswMetadata;

class CswInspireLicense
{
    public function __construct(
        public ?string $id,
        public ?string $text,
        public ?string $link,
    ) {
        $this->id = trim($id);
        $this->text = trim($text);
        $this->link = trim($link);
    }

    public static function fromArray(?array $data): ?self
    {
        if (null === $data) {
            return null;
        }

        return new self(
            $data['id'] ?? '',
            $data['text'] ?? '',
            $data['link'] ?? ''
        );
    }
}
