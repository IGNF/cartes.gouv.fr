import * as yup from "yup";
import validations from "../../../validations";
import { regex } from "../../../utils";
import { OfferingListResponseDto } from "../../../@types/entrepot";
import { getTranslation } from "../../../i18n/i18n";

const { t: tValidMD } = getTranslation("ValidationMetadatas");
export class CommonSchemasValidation {
    _offeringList: OfferingListResponseDto[] | undefined;

    constructor(offeringList: OfferingListResponseDto[] | undefined) {
        this._offeringList = offeringList;
    }

    getMDUploadFileSchema() {
        return yup.object().shape({
            metadata_file_content: yup.mixed().test({
                name: "is-valid-metadata",
                async test(value, ctx) {
                    if (value instanceof FileList && value.length === 0) return true;
                    return validations.metadata.test(value as FileList, ctx);
                },
            }),
        });
    }

    getMDDescriptionSchema(editMode: boolean = false, oldTechnicalName?: string) {
        return yup
            .object({
                technical_name: yup
                    .string()
                    .required(tValidMD("metadatas.technical_name_error"))
                    .matches(regex.technical_name, tValidMD("metadatas.technical_name_regex"))
                    .test({
                        name: "is-unique",
                        message: tValidMD("metadatas.technical_name_unicity_error"),
                        test: (technicalName) => {
                            // récupération des noms des offerings existants, interdiction de prendre un nom qui fait partie de cette liste
                            let technicalNameList = this._offeringList?.map((offering) => offering?.layer_name) ?? [];

                            // si editMode est vraie, on autorise de prendre le nom de l'offering actuel
                            if (editMode === true && oldTechnicalName !== undefined) {
                                technicalNameList = technicalNameList.filter((name) => name !== oldTechnicalName);
                            }

                            return !technicalNameList?.includes(technicalName);
                        },
                    }),
                public_name: yup.string().required(tValidMD("metadatas.public_name_error")),
                description: yup.string().required(tValidMD("metadatas.description_error")),
                identifier: yup
                    .string()
                    .matches(regex.file_identifier, tValidMD("metadatas.identifier_regex"))
                    .required(tValidMD("metadatas.identifier_error")),
                category: yup.array(yup.string()).min(1, tValidMD("metadatas.category_error")).required(tValidMD("metadatas.category_error")),
                email_contact: yup
                    .string()
                    .required(tValidMD("metadatas.email_contact_required_error"))
                    .matches(regex.email, tValidMD("metadatas.email_contact_error")),
                creation_date: yup.date().required(tValidMD("metadatas.creation_date_error")),
                resource_genealogy: yup.string(),
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
                languages: yup
                    .array()
                    .of(
                        yup.object({
                            language: yup.string(),
                            code: yup.string(),
                        })
                    )
                    .required(tValidMD("metadatas.language_error"))
                    .min(1, tValidMD("metadatas.language_error")),
                charset: yup.string().required(tValidMD("metadatas.charset_error")),
                projection: yup.string().required(tValidMD("metadatas.projection_error")),
                encoding: yup.string().required(tValidMD("metadatas.encoding_error")),
                resolution: yup.string(),
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
