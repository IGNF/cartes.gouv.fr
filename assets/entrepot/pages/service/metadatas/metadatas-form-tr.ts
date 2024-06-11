import { declareComponentKeys, type Translations } from "../../../../i18n/i18n";

export const { i18n } = declareComponentKeys<
    | "metadata.upload_form.title"
    | "metadata.upload_form.drag_and_drop_file"
    | "metadata.upload_form.used_format"
    | "metadata.description_form.description_title"
    | "metadata.description_form.technical_name"
    | "metadata.description_form.hint_technical_name"
    | "metadata.description_form.public_name"
    | "metadata.description_form.hint_public_name"
    | "metadata.description_form.description"
    | "metadata.description_form.hint_description"
    | "metadata.description_form.identifier"
    | "metadata.description_form.hint_identifier"
    | "metadata.description_form.category"
    | "metadata.description_form.hint_category"
    | "metadata.description_form.keywords"
    | "metadata.description_form.hint_keywords"
    | "metadata.description_form.free_keywords"
    | "metadata.description_form.hint_free_keywords"
    | "metadata.description_form.contact_email"
    | "metadata.description_form.hint_contact_email"
    | "metadata.description_form.time_reference_title"
    | "metadata.description_form.creation_date"
    | "metadata.description_form.resource_genealogy"
    | "metadata.description_form.hint_resource_genealogy"
    | "metadata.description_form.resource_manager_title"
    | "metadata.description_form.organization"
    | "metadata.description_form.hint_organization"
    | "metadata.description_form.organization_email"
    | "metadata.description_form.hint_organization_email"
    | "attribution.title"
    | "attribution.explain"
    | "attribution_form.text"
    | "attribution_form.hint_text"
    | "attribution_form.url"
    | "attribution_form.hint_url"
    | "metadata.additionnal_infos_form.metadata_information_title"
    | "metadata.additionnal_infos_form.language"
    | "metadata.additionnal_infos_form.hint_language"
    | "metadata.additionnal_infos_form.charset"
    | "metadata.additionnal_infos_form.hint_charset"
    | "metadata.additionnal_infos_form.type_of_spatial_representation_title"
    | "metadata.additionnal_infos_form.projection"
    | "metadata.additionnal_infos_form.hint_projection"
    | "metadata.additionnal_infos_form.encoding"
    | "metadata.additionnal_infos_form.hint_encoding"
    | "metadata.additionnal_infos_form.spatial_resolution"
    | "metadata.additionnal_infos_form.hint_spatial_resolution"
>()("MetadatasForm");

export const MetadatasFormFrTranslations: Translations<"fr">["MetadatasForm"] = {
    "metadata.upload_form.title": "Source des metadonnées",
    "metadata.upload_form.drag_and_drop_file": "Glissez-déposez votre fichier de métadonnées ici (optionnel)",
    "metadata.upload_form.used_format": "Formats de fichiers autorisés : .xml",
    "metadata.description_form.description_title": "Description",
    "metadata.description_form.technical_name": "Nom technique du service",
    "metadata.description_form.hint_technical_name": "Nom technique qui sera visible de vos utilisateurs dans l'adresse de votre service",
    "metadata.description_form.public_name": "Intitulé (nom public)",
    "metadata.description_form.hint_public_name": "Nom caractéristique et souvent unique sous lequel la ressource est connue",
    "metadata.description_form.description": "Résumé",
    "metadata.description_form.hint_description": "Bref résumé narratif du contenu de la ressource",
    "metadata.description_form.identifier": "Identificateur de ressource unique",
    "metadata.description_form.hint_identifier": "Entrez une valeur identifiant la ressource de manière unique",
    "metadata.description_form.category": "Catégorie thématique",
    "metadata.description_form.hint_category":
        "Système de classification de haut niveau qui permet de regrouper et de chercher par thème les ressources de données géographiques disponibles",
    "metadata.description_form.keywords": "Mots clés",
    "metadata.description_form.hint_keywords":
        "Thème dont relèvent les données géographiques, conformément aux définitions des annexes I, II ou III de la directive Inspire",
    "metadata.description_form.free_keywords": "Mots clés libres",
    "metadata.description_form.hint_free_keywords": "Saisissez librement des mots clés en appuyant sur Entrée après chaque mot",
    "metadata.description_form.contact_email": "Email de contact sur les métadonnées",
    "metadata.description_form.hint_contact_email": "E-mail auprès duquel des compléments d'information peuvent être obtenus",
    "metadata.description_form.time_reference_title": "Référence temporelle",
    "metadata.description_form.creation_date": "Date de la création de la ressource",
    "metadata.description_form.resource_genealogy": "Généalogie de la ressource (optionnel)",
    "metadata.description_form.hint_resource_genealogy": "Description du mode de production de la ressource",
    "metadata.description_form.resource_manager_title": "Responsable de la ressource",
    "metadata.description_form.organization": "Organisme",
    "metadata.description_form.hint_organization":
        "Nom de l'organisme responsable de la ressource  qui prend la responsabilité de la diffuser ou  qui est légitime pour rendre celle-ci visible et décider de son mode de diffusion",
    "metadata.description_form.organization_email": "Email",
    "metadata.description_form.hint_organization_email": "Email de contact de l'organisme",
    "metadata.additionnal_infos_form.metadata_information_title": "Informations sur les métadonnées",
    "attribution.title": "Attribution",
    "attribution.explain":
        "L'attribution est une mention que les consommateurs de ce service doivent afficher de manière visible sur les cartes qui l'utilise. Elle est généralement brève et désigne la source des données tout en pointant vers une page web qui décrit ses conditions d'utilisation ou la page d'accueil de l'organisme producteur. ll est généralement choisi de faire figurer cette attribution en petits caractères au bas des cartes.",
    "attribution_form.text": "Texte à afficher (optionnel)",
    "attribution_form.hint_text": "Texte bref à faire figurer sur les cartes pour désigner la source des données",
    "attribution_form.url": "URL de l'attribution (optionnel)",
    "attribution_form.hint_url":
        "Adresse de la page web vers laquelle doit pointer l'attribution. Il peut s'agir du site web de l'organisme producteur, d'une page de conditions d'utilisation des données ou de toute autre URL valide en lien avec les données représentées.",
    "metadata.additionnal_infos_form.language": "Langue des métadonnées",
    "metadata.additionnal_infos_form.hint_language": "La ou les langues utilisées pour décrire les métadonnées",
    "metadata.additionnal_infos_form.charset": "Jeu de caractères de la ressource",
    "metadata.additionnal_infos_form.hint_charset":
        "Codification utilisée par la métadonnée pour restituer les caractères spécifiques de la langue (accents, caractères spéciaux …). Utf8 correspond à un codage souvent employé pour les caractères du français.",
    "metadata.additionnal_infos_form.type_of_spatial_representation_title": "Type de représentation spatiale",
    "metadata.additionnal_infos_form.projection": "Référentiel de coordonnées (projection)",
    "metadata.additionnal_infos_form.hint_projection":
        "Permet de décrire le système de coordonnées, pour une donnée géographique, il s'agit de son système de projection",
    "metadata.additionnal_infos_form.encoding": "Encodage de la ressource",
    "metadata.additionnal_infos_form.hint_encoding": "[TODO]",
    "metadata.additionnal_infos_form.spatial_resolution": "Résolution indiquée en échelle (1/x)",
    "metadata.additionnal_infos_form.hint_spatial_resolution": "Sélectionnez un produit (série)",
};

export const MetadatasFormEnTranslations: Translations<"en">["MetadatasForm"] = {
    "metadata.upload_form.title": "Metadata source",
    "metadata.upload_form.drag_and_drop_file": "Drag and drop your metadata file here (optional)",
    "metadata.upload_form.used_format": "Allowed file formats : .xml",
    "metadata.description_form.description_title": "Description",
    "metadata.description_form.technical_name": "Service technical name",
    "metadata.description_form.hint_technical_name": "Technical name that will be visible to your users in the address of your service",
    "metadata.description_form.public_name": "Public name (title)",
    "metadata.description_form.hint_public_name": "Characteristic and often unique name by which the resource is known",
    "metadata.description_form.description": "Description",
    "metadata.description_form.hint_description": "Brief narrative summary of resource content",
    "metadata.description_form.identifier": "Unique resource identifier",
    "metadata.description_form.hint_identifier": "Enter a value that uniquely identifies the resource",
    "metadata.description_form.category": "Thematic category",
    "metadata.description_form.hint_category": "Use autocomplete or freely type keywords by pressing Enter after each word",
    "metadata.description_form.keywords": "Keywords",
    "metadata.description_form.hint_keywords": undefined,
    "metadata.description_form.free_keywords": "Free keywords",
    "metadata.description_form.hint_free_keywords": undefined,
    "metadata.description_form.contact_email": "Metadata contact email",
    "metadata.description_form.hint_contact_email": "Email from which additional information can be obtained",
    "metadata.description_form.time_reference_title": "Time reference",
    "metadata.description_form.creation_date": "Resource creation date",
    "metadata.description_form.resource_genealogy": "Genealogy of the resource (optional)",
    "metadata.description_form.hint_resource_genealogy": "Description of the resource production mode",
    "metadata.description_form.resource_manager_title": "Resource manager",
    "metadata.description_form.organization": "Organization",
    "metadata.description_form.hint_organization":
        "Name of the organization responsible for the resource which takes responsibility for disseminating it or which is legitimate to make it visible and decide on its method of dissemination",
    "metadata.description_form.organization_email": "Email",
    "metadata.description_form.hint_organization_email": "Contact email of the organization",
    "metadata.additionnal_infos_form.metadata_information_title": "Metadata informations",
    "attribution.title": "Attribution",
    "attribution.explain": "[TODO]",
    "attribution_form.text": "Text to display",
    "attribution_form.hint_text": "Brief text to appear on maps to designate the data source",
    "attribution_form.url": "Attribution URL",
    "attribution_form.hint_url":
        "Address of the web page to which the attribution should point. This may be the producing organization's website, a data use conditions page, or any other valid URL related to the data represented.",
    "metadata.additionnal_infos_form.language": "Metadata language",
    "metadata.additionnal_infos_form.hint_language": "The language(s) used to describe the metadata",
    "metadata.additionnal_infos_form.charset": "Resource charset",
    "metadata.additionnal_infos_form.hint_charset":
        "Coding used by the metadata to restore the specific characters of the language (accents, special characters, etc.). Utf8 corresponds to an encoding often used for French characters.",
    "metadata.additionnal_infos_form.type_of_spatial_representation_title": "Type of spatial representation",
    "metadata.additionnal_infos_form.projection": "Coordinate reference frame (projection)",
    "metadata.additionnal_infos_form.hint_projection": "Describe the coordinate system, for geographic data, this is its projection system",
    "metadata.additionnal_infos_form.encoding": "Resource encoding",
    "metadata.additionnal_infos_form.hint_encoding": "[TODO] Codification utilisée dans la ressource pour restituer les caractères",
    "metadata.additionnal_infos_form.spatial_resolution": "Resolution indicated in scale (1/x)",
    "metadata.additionnal_infos_form.hint_spatial_resolution": "Select a product (series)",
};
