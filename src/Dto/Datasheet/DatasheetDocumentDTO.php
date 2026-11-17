<?php

declare(strict_types=1);

namespace App\Dto\Datasheet;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Champs d’un document de fiche (onglet Annexes) ; le fichier arrive à part, dans le champ multipart `file`.
 */
final readonly class DatasheetDocumentDTO
{
    public const TYPE_FILE = 'file';
    public const TYPE_LINK = 'link';

    /** groupe de validation des contraintes propres à l’ajout */
    public const CREATION = 'creation';

    public function __construct(
        #[Assert\NotBlank(message: 'Le nom du document est obligatoire', normalizer: 'trim')]
        public string $name = '',

        #[Assert\NotBlank(message: 'Le type du document est obligatoire', groups: [self::CREATION])]
        #[Assert\Choice(choices: [self::TYPE_FILE, self::TYPE_LINK], message: 'Le type du document doit être « file » ou « link »', groups: [self::CREATION])]
        public ?string $type = null,

        #[Assert\When(
            expression: 'this.type === "link"',
            constraints: [new Assert\NotNull(message: 'L’URL du lien est obligatoire')],
            groups: [self::CREATION],
        )]
        // envoyée vide à la modification : refusée, comme à l’ajout
        #[Assert\NotBlank(message: 'L’URL du lien est obligatoire', allowNull: true)]
        #[Assert\Url(message: 'L’URL du lien doit commencer par http:// ou https://', protocols: ['http', 'https'], requireTld: true)]
        public ?string $url = null,
    ) {
    }
}
