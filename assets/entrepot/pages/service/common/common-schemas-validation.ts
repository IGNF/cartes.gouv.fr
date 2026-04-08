import * as yup from "yup";

import { Datastore } from "@/@types/app";
import { getTranslation } from "../../../../i18n/i18n";
import { regex } from "../../../../utils";
import validations from "../../../../validations";

const { t: tValidMD } = getTranslation("ValidationMetadatas");
export class CommonSchemasValidation {
    getMDUploadFileSchema() {
        return yup.object().shape({
            metadata_file_content: yup.mixed().test({
                name: "is-valid-metadata",
                async test(value, ctx) {
                    // upload de fichier est optionnel, donc value peut être undefined ou un array de taille 0
                    if (value === undefined || (value instanceof FileList && value.length === 0)) return true;
                    return validations.metadata.test(value as FileList, ctx);
                },
            }),
        });
    }

    getMDDescriptionSchema(existingLayerNames: string[] = [], editMode: boolean = false, oldTechnicalName?: string, datastore?: Datastore) {
        return yup
            .object({
                technical_name: yup
                    .string()
                    .required(tValidMD("metadatas.technical_name_error"))
                    .matches(regex.technical_name, tValidMD("metadatas.technical_name_regex"))
                    .transform((value) => value.trim())
                    .test({
                        name: "is-unique",
                        message: tValidMD("metadatas.technical_name_unicity_error"),
                        test: (technicalName) => {
                            // interdiction de choisir un nom qui fait partie de la liste des layername déjà pris

                            // si editMode est vraie, on autorise de choisir le nom de l'offering actuel
                            if (editMode === true && oldTechnicalName !== undefined) {
                                existingLayerNames = existingLayerNames.filter((name) => name !== oldTechnicalName);
                            }

                            return !existingLayerNames?.includes(technicalName);
                        },
                    })
                    .test({
                        name: "has-prefix",
                        message: tValidMD("metadatas.technical_name_prefix_error"),
                        test: (technicalName) => {
                            if (editMode === true) return true; // en mode édition, on ne fait pas de validation sur le préfixe pour permettre de conserver le même nom technique même si le préfixe a été ajouté après la création de l'offering
                            // le comportement est différent de file identifier parce qu'on permet de modifier le file identifier même en mode édition, mais pas le technical name. Donc en mode édition, on considère que le préfixe est optionnel pour le technical name
                            if (!datastore?.configuration_layer_name_prefix) return true; // si pas de préfixe défini, on ne fait pas de validation
                            return technicalName.startsWith(datastore?.configuration_layer_name_prefix + ".");
                        },
                    }),
                public_name: yup
                    .string()
                    .required(tValidMD("metadatas.public_name_error"))
                    .transform((value) => value.trim()),
                service_name: yup
                    .string()
                    .required(tValidMD("metadatas.service_name_error"))
                    .transform((value) => value.trim()),
                description: yup.string().required(tValidMD("metadatas.description_error")),
                identifier: yup
                    .string()
                    .matches(regex.file_identifier, tValidMD("metadatas.identifier_regex"))
                    .required(tValidMD("metadatas.identifier_error"))
                    .test({
                        name: "has-prefix",
                        message: tValidMD("metadatas.identifier_prefix_error"),
                        test: (identifier) => {
                            if (!datastore?.metadata_file_identifier_prefix) return true; // si pas de préfixe défini, on ne fait pas de validation
                            return identifier.startsWith(datastore?.metadata_file_identifier_prefix + ".");
                        },
                    }),
                category: yup.array(yup.string()).min(1, tValidMD("metadatas.category_error")).required(tValidMD("metadatas.category_error")),
                keywords: yup.array(yup.string()),
                free_keywords: yup.array(yup.string()),
                email_contact: yup
                    .string()
                    .required(tValidMD("metadatas.email_contact_required_error"))
                    .matches(regex.email, tValidMD("metadatas.email_contact_error")),
                // NOTE : typeError permet de spécifier le message d'erreur quand la valeur ne correspond pas au type (yup.string(), yup.date() etc)
                creation_date: yup.date().typeError(tValidMD("metadatas.creation_date_error")).required(tValidMD("metadatas.creation_date_error")),
                resource_genealogy: yup.string(),
                frequency_code: yup.string().required(),
                organization: yup.string().required(tValidMD("metadatas.organization_error")),
                organization_email: yup
                    .string()
                    .required(tValidMD("metadatas.organization_email_required_error"))
                    .matches(regex.email, tValidMD("metadatas.organization_email_error")),
            })
            .required();
    }

    getMDAdditionalInfoSchema() {
        return yup
            .object({
                // NOTE : attribution rendu non obligatoire
                attribution_text: yup.string(), //.required(tValidMD("attribution.text_required_error")),
                attribution_url: yup.string().url(tValidMD("attribution.url_error")), //.required(tValidMD("attribution.url_required_error")),
                language: yup
                    .object({
                        language: yup.string(),
                        code: yup.string(),
                    })
                    .required(tValidMD("metadatas.language_error")),
                charset: yup.string().required(tValidMD("metadatas.charset_error")),
                projection: yup.string().required(tValidMD("metadatas.projection_error")),
                // encoding: yup.string().required(tValidMD("metadatas.encoding_error")),
                resolution: yup.string(),
                hierarchy_level: yup.string().required(tValidMD("metadatas.hierarchy_level_error")),
            })
            .required();
    }

    getAccessRestrictionSchema() {
        return yup
            .object({
                share_with: yup.string().required(tValidMD("share_with_error")),
            })
            .required();
    }
}
