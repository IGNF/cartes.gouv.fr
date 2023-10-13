import * as yup from "yup";
import validations from "../../validations";
import { regex } from "../../utils";
import Translator from "../../modules/Translator";
import { OfferingListResponseDto } from "../../types/entrepot";

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

    getMDDescriptionSchema() {
        return yup
            .object({
                technical_name: yup
                    .string()
                    .required(Translator.trans("metadatas.technical_name_error"))
                    .matches(regex.name_constraint, Translator.trans("metadatas.technical_name_regex"))
                    .test({
                        name: "is-unique",
                        message: "Ce nom technique existe déjà",
                        test: (technicalName) => {
                            const technicalNameList = this._offeringList?.map((offering) => offering?.layer_name) ?? [];
                            return !technicalNameList?.includes(technicalName);
                        },
                    }),
                public_name: yup.string().required(Translator.trans("metadatas.public_name_error")),
                description: yup.string().required(Translator.trans("metadatas.description_error")),
                identifier: yup
                    .string()
                    .matches(regex.name_constraint, Translator.trans("metadatas.identifier_regex"))
                    .required(Translator.trans("metadatas.identifier_error")),
                category: yup.array(yup.string()).min(1, Translator.trans("metadatas.category_error")).required(Translator.trans("metadatas.category_error")),
                email_contact: yup
                    .string()
                    .required(Translator.trans("metadatas.email_contact_mandatory_error"))
                    .matches(regex.email, Translator.trans("metadatas.email_contact_error")),
                creation_date: yup.date().required(Translator.trans("metadatas.creation_date_error")),
                resource_genealogy: yup.string(),
                organization: yup.string().required(Translator.trans("metadatas.organization_error")),
                organization_email: yup
                    .string()
                    .required(Translator.trans("metadatas.organization_email_mandatory_error"))
                    .matches(regex.email, Translator.trans("metadatas.organization_email_error")),
            })
            .required();
    }

    getMDAdditionalInfoSchema() {
        return yup
            .object({
                languages: yup
                    .array()
                    .of(
                        yup.object({
                            language: yup.string(),
                            code: yup.string(),
                        })
                    )
                    .required(Translator.trans("metadatas.language_error"))
                    .min(1, Translator.trans("metadatas.language_min_error")),
                charset: yup.string().required(Translator.trans("metadatas.charset_error")),
                projection: yup.string().required(Translator.trans("metadatas.projection_error")),
                encoding: yup.string().required(Translator.trans("metadatas.encoding_error")),
                resolution: yup.string(),
            })
            .required();
    }

    getAccessRestrictionSchema() {
        return yup
            .object({
                share_with: yup.string().required(Translator.trans("share_with_error")),
            })
            .required();
    }
}
