import { declareComponentKeys } from "../../../../i18n/i18n";
import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "metadata.upload_form.title"
    | "metadata.upload_form.drag_and_drop_file"
    | "metadata.upload_form.used_format"
    | "metadata.description_form.description_title"
    | "metadata.description_form.technical_name"
    | "metadata.description_form.hint_technical_name"
    | "metadata.description_form.public_name"
    | "metadata.description_form.hint_public_name"
    | "metadata.description_form.service_name"
    | "metadata.description_form.hint_service_name"
    | "metadata.description_form.description"
    | "metadata.description_form.hint_description"
    | "metadata.description_form.placeholder_description"
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
    | "metadata.description_form.quality_title"
    | "metadata.description_form.resource_genealogy"
    | "metadata.description_form.hint_resource_genealogy"
    | "metadata.description_form.time_reference_title"
    | "metadata.description_form.creation_date"
    | "metadata.description_form.frequency_code"
    | "metadata.description_form.resource_manager_title"
    | "metadata.description_form.organization"
    | "metadata.description_form.hint_organization"
    | "metadata.description_form.organization_email"
    | "metadata.description_form.hint_organization_email"
    | "metadata.description_form.public_access_limits_title"
    | "metadata.description_form.restriction"
    | "metadata.description_form.no_restriction"
    | "metadata.description_form.open_license"
    | "metadata.description_form.inspire_directive"
    | "metadata.description_form.other_conditions"
    | "metadata.description_form.open_license_name"
    | "metadata.description_form.open_license_link"
    | "metadata.description_form.inspire_restriction_type"
    | "metadata.description_form.additional_access_constraints"
    | "metadata.description_form.additional_use_constraints"
    | "metadata.description_form.add_access_constraint"
    | "metadata.description_form.access_restriction_code"
    | "metadata.description_form.access_constraint_name"
    | "metadata.description_form.access_constraint_link"
    | "metadata.description_form.add_use_constraint"
    | "metadata.description_form.use_restriction_code"
    | "metadata.description_form.use_constraint_name"
    | "metadata.description_form.use_constraint_link"
    | "attribution.title"
    | "attribution.explain"
    | "attribution_form.text"
    | "attribution_form.hint_text"
    | "attribution_form.url"
    | "attribution_form.hint_url"
    | "metadata.additionnal_infos_form.metadata_information_title"
    | "metadata.additionnal_infos_form.hierarchy_level"
    | "metadata.additionnal_infos_form.hierarchy_level_dataset"
    | "metadata.additionnal_infos_form.hierarchy_level_dataset_hint"
    | "metadata.additionnal_infos_form.hierarchy_level_series"
    | "metadata.additionnal_infos_form.hierarchy_level_series_hint"
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
    | { K: "metadata.additionnal_infos_form.hint_spatial_resolution"; R: JSX.Element }
>()("MetadatasForm");
export type I18n = typeof i18n;

export const MetadatasFormFrTranslations: Translations<"fr">["MetadatasForm"] = {
    "metadata.upload_form.title": "Source des metadonnées",
    "metadata.upload_form.drag_and_drop_file": "Glissez-déposez votre fichier de métadonnées ici (optionnel)",
    "metadata.upload_form.used_format": "Formats de fichiers autorisés : .xml",
    "metadata.description_form.description_title": "Description",
    "metadata.description_form.technical_name": "Nom technique du service",
    "metadata.description_form.hint_technical_name": "Nom technique du service qui sera utilisé par les interfaces logicielles clientes.",
    "metadata.description_form.public_name": "Intitulé (nom public)",
    "metadata.description_form.hint_public_name":
        "Nom caractéristique  sous lequel la ressource est connue. Il correspond à l’intitulé de la métadonnée de données.",
    "metadata.description_form.service_name": "Titre du service",
    "metadata.description_form.hint_service_name": "Intitulé permettant aux utilisateurs finaux d’identifier aisément le service.",
    "metadata.description_form.description": "Résumé",
    "metadata.description_form.hint_description": "Bref résumé narratif du contenu de la ressource",
    "metadata.description_form.placeholder_description": "Veuillez saisir le texte Markdown",
    "metadata.description_form.identifier": "Identificateur de ressource unique",
    "metadata.description_form.hint_identifier": "Entrez une valeur identifiant la ressource de manière unique",
    "metadata.description_form.category": "Catégorie thématique",
    "metadata.description_form.hint_category":
        "Système de classification de haut niveau qui permet de regrouper et de chercher par thème les ressources de données géographiques disponibles",
    "metadata.description_form.keywords": "Mots clés (optionnel)",
    "metadata.description_form.hint_keywords":
        "Thème dont relèvent les données géographiques, conformément aux définitions des annexes I, II ou III de la directive Inspire",
    "metadata.description_form.free_keywords": "Mots clés libres (optionnel)",
    "metadata.description_form.hint_free_keywords": "Saisissez librement des mots clés en appuyant sur Entrée après chaque mot",
    "metadata.description_form.contact_email": "Email de contact sur les métadonnées",
    "metadata.description_form.hint_contact_email": "E-mail auprès duquel des compléments d’information peuvent être obtenus",
    "metadata.description_form.quality_title": "Qualité",
    "metadata.description_form.resource_genealogy": "Généalogie de la ressource (optionnelle)",
    "metadata.description_form.hint_resource_genealogy":
        "La généalogie de la ressource décrit l’historique d’un jeu de données et, s’il est connu, le cycle de vie de celui-ci, depuis l’acquisition et la saisie de l’information jusqu’à sa compilation, avec d’autres jeux et les variantes de sa forme actuelle.",
    "metadata.description_form.frequency_code": "Fréquence de mise à jour",
    "metadata.description_form.time_reference_title": "Référence temporelle",
    "metadata.description_form.creation_date": "Date de la création de la ressource",
    "metadata.description_form.resource_manager_title": "Responsable de la ressource",
    "metadata.description_form.organization": "Organisme",
    "metadata.description_form.hint_organization":
        "Nom de l’organisme responsable de la ressource  qui prend la responsabilité de la diffuser ou  qui est légitime pour rendre celle-ci visible et décider de son mode de diffusion",
    "metadata.description_form.organization_email": "Email",
    "metadata.description_form.hint_organization_email": "Email de contact de l’organisme",
    "metadata.description_form.public_access_limits_title": "Limitations d'accès public",
    "metadata.description_form.restriction": "Restrictions",
    "metadata.description_form.no_restriction": "Pas de restriction",
    "metadata.description_form.open_license": "Licence ouverte ou assimilée",
    "metadata.description_form.inspire_directive": "Accès limité au titre de la directive INSPIRE",
    "metadata.description_form.other_conditions": "Autres conditions d'accès ou d'usage",
    "metadata.description_form.open_license_name": "Intitulé de la licence",
    "metadata.description_form.open_license_link": "Lien de la licence (optionnel)",
    "metadata.description_form.inspire_restriction_type": "Type de retriction INSPIRE",
    "metadata.description_form.additional_access_constraints": "Contraintes d'accès",
    "metadata.description_form.additional_use_constraints": "Contraintes d'usage",
    "metadata.description_form.add_access_constraint": "Ajouter une contrainte d'accès",
    "metadata.description_form.access_restriction_code": "Code de restriction de la contrainte d'accès",
    "metadata.description_form.access_constraint_name": "Intitulé de la contrainte d'accès (optionnel)",
    "metadata.description_form.access_constraint_link": "Lien de la contrainte d'accès (optionnel)",
    "metadata.description_form.add_use_constraint": "Ajouter une contrainte d'usage",
    "metadata.description_form.use_restriction_code": "Code de restriction de la contrainte d'usage",
    "metadata.description_form.use_constraint_name": "Intitulé de la contrainte d'usage (optionnel)",
    "metadata.description_form.use_constraint_link": "Lien de la contrainte d'usage (optionnel)",
    "metadata.additionnal_infos_form.metadata_information_title": "Informations sur les métadonnées",
    "metadata.additionnal_infos_form.hierarchy_level": "Type de ressource",
    "metadata.additionnal_infos_form.hierarchy_level_dataset": "Jeu de données",
    "metadata.additionnal_infos_form.hierarchy_level_dataset_hint":
        "Toute donnée faisant directement ou indirectement référence à un lieu ou une zone géographique spécifique",
    "metadata.additionnal_infos_form.hierarchy_level_series": "Collection de données",
    "metadata.additionnal_infos_form.hierarchy_level_series_hint": "Compilation identifiable de données géographiques",
    "attribution.title": "Attribution",
    "attribution.explain":
        "L’attribution est une mention que les consommateurs de ce service doivent afficher de manière visible sur les cartes qui l’utilise. Elle est généralement brève et désigne la source des données tout en pointant vers une page web qui décrit ses conditions d’utilisation ou la page d’accueil de l’organisme producteur. ll est généralement choisi de faire figurer cette attribution en petits caractères au bas des cartes.",
    "attribution_form.text": "Texte à afficher (optionnel)",
    "attribution_form.hint_text": "Texte bref à faire figurer sur les cartes pour désigner la source des données",
    "attribution_form.url": "URL de l’attribution (optionnel)",
    "attribution_form.hint_url":
        "Adresse de la page web vers laquelle doit pointer l’attribution. Il peut s’agir du site web de l’organisme producteur, d’une page de conditions d’utilisation des données ou de toute autre URL valide en lien avec les données représentées.",
    "metadata.additionnal_infos_form.language": "Langue des métadonnées",
    "metadata.additionnal_infos_form.hint_language": "La langue utilisée pour décrire les métadonnées",
    "metadata.additionnal_infos_form.charset": "Jeu de caractères de la ressource",
    "metadata.additionnal_infos_form.hint_charset":
        "Codification utilisée par la métadonnée pour restituer les caractères spécifiques de la langue (accents, caractères spéciaux …). Utf8 correspond à un codage souvent employé pour les caractères du français.",
    "metadata.additionnal_infos_form.type_of_spatial_representation_title": "Type de représentation spatiale",
    "metadata.additionnal_infos_form.projection": "Référentiel de coordonnées (projection)",
    "metadata.additionnal_infos_form.hint_projection":
        "Permet de décrire le système de coordonnées, pour une donnée géographique, il s’agit de son système de projection",
    "metadata.additionnal_infos_form.encoding": "Encodage de la ressource",
    "metadata.additionnal_infos_form.hint_encoding": "[TODO]",
    "metadata.additionnal_infos_form.spatial_resolution": "Résolution spatiale (optionnelle)",
    "metadata.additionnal_infos_form.hint_spatial_resolution": (
        <>
            {"Échelle approximative à laquelle les données sont les plus pertinentes."}
            <br />
            {"Exemple : 25 000 si les données sont faites pour un affichage à l’échelle d’une carte topographique."}
        </>
    ),
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
    "metadata.description_form.service_name": undefined,
    "metadata.description_form.hint_service_name": undefined,
    "metadata.description_form.description": "Description",
    "metadata.description_form.hint_description": "Brief narrative summary of resource content",
    "metadata.description_form.placeholder_description": undefined,
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
    "metadata.description_form.quality_title": "Quality",
    "metadata.description_form.resource_genealogy": undefined,
    "metadata.description_form.hint_resource_genealogy": undefined,
    "metadata.description_form.time_reference_title": "Time reference",
    "metadata.description_form.creation_date": "Resource creation date",
    "metadata.description_form.frequency_code": "Update frequency",
    "metadata.description_form.resource_manager_title": "Resource manager",
    "metadata.description_form.organization": "Organization",
    "metadata.description_form.hint_organization":
        "Name of the organization responsible for the resource which takes responsibility for disseminating it or which is legitimate to make it visible and decide on its method of dissemination",
    "metadata.description_form.organization_email": "Email",
    "metadata.description_form.hint_organization_email": "Contact email of the organization",
    "metadata.description_form.public_access_limits_title": undefined,
    "metadata.description_form.restriction": undefined,
    "metadata.description_form.no_restriction": undefined,
    "metadata.description_form.open_license": undefined,
    "metadata.description_form.inspire_directive": undefined,
    "metadata.description_form.other_conditions": undefined,
    "metadata.description_form.open_license_name": undefined,
    "metadata.description_form.open_license_link": undefined,
    "metadata.description_form.inspire_restriction_type": undefined,
    "metadata.description_form.additional_access_constraints": undefined,
    "metadata.description_form.additional_use_constraints": undefined,
    "metadata.description_form.add_access_constraint": undefined,
    "metadata.description_form.access_restriction_code": undefined,
    "metadata.description_form.access_constraint_name": undefined,
    "metadata.description_form.access_constraint_link": undefined,
    "metadata.description_form.add_use_constraint": undefined,
    "metadata.description_form.use_restriction_code": undefined,
    "metadata.description_form.use_constraint_name": undefined,
    "metadata.description_form.use_constraint_link": undefined,
    "metadata.additionnal_infos_form.metadata_information_title": "Metadata informations",
    "metadata.additionnal_infos_form.hierarchy_level": undefined,
    "metadata.additionnal_infos_form.hierarchy_level_dataset": undefined,
    "metadata.additionnal_infos_form.hierarchy_level_dataset_hint": undefined,
    "metadata.additionnal_infos_form.hierarchy_level_series": undefined,
    "metadata.additionnal_infos_form.hierarchy_level_series_hint": undefined,
    "attribution.title": "Attribution",
    "attribution.explain": "[TODO]",
    "attribution_form.text": "Text to display",
    "attribution_form.hint_text": "Brief text to appear on maps to designate the data source",
    "attribution_form.url": "Attribution URL",
    "attribution_form.hint_url":
        "Address of the web page to which the attribution should point. This may be the producing organization’s website, a data use conditions page, or any other valid URL related to the data represented.",
    "metadata.additionnal_infos_form.language": "Metadata language",
    "metadata.additionnal_infos_form.hint_language": "The language used to describe the metadata",
    "metadata.additionnal_infos_form.charset": "Resource charset",
    "metadata.additionnal_infos_form.hint_charset":
        "Coding used by the metadata to restore the specific characters of the language (accents, special characters, etc.). Utf8 corresponds to an encoding often used for French characters.",
    "metadata.additionnal_infos_form.type_of_spatial_representation_title": "Type of spatial representation",
    "metadata.additionnal_infos_form.projection": "Coordinate reference frame (projection)",
    "metadata.additionnal_infos_form.hint_projection": "Describe the coordinate system, for geographic data, this is its projection system",
    "metadata.additionnal_infos_form.encoding": "Resource encoding",
    "metadata.additionnal_infos_form.hint_encoding": "[TODO] Codification utilisée dans la ressource pour restituer les caractères",
    "metadata.additionnal_infos_form.spatial_resolution": "Spatial resolution (optional)",
    "metadata.additionnal_infos_form.hint_spatial_resolution": undefined,
};
