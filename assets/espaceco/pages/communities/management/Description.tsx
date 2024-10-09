import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { yupResolver } from "@hookform/resolvers/yup";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { CommunityResponseDTO, DocumentDTO } from "../../../../@types/espaceco";
import AutocompleteSelect from "../../../../components/Input/AutocompleteSelect";
import MarkdownEditor from "../../../../components/Input/MarkdownEditor";
import thumbnails from "../../../../data/doc_thumbnail.json";
import categories from "../../../../data/topic_categories.json";
import { ComponentKey, useTranslation } from "../../../../i18n/i18n";
import { appRoot } from "../../../../router/router";
import { getFileExtension } from "../../../../utils";
import { AddDocumentDialog, AddDocumentDialogModal } from "./AddDocumentDialog";
import CommunityLogo from "./CommunityLogo";

import "../../../../sass/pages/espaceco/community.scss";

type DocumentExt = DocumentDTO & {
    src: string;
    isImage: boolean;
};

type DescriptionProps = {
    community: CommunityResponseDTO;
};

/* const isNewDocument = (d: DocumentDTO | NewDocument): d is NewDocument => "new_id" in d;

const readFileAsDataURL = async (file: File) => {
    const result = await new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => resolve(fileReader.result);
        fileReader.readAsDataURL(file);
    });
    return result;
}; */

const Description: FC<DescriptionProps> = ({ community }) => {
    // const { tab1 } = useCommunityFormStore(community)();

    const { t: tCommon } = useTranslation("Common");
    const { t: tValid } = useTranslation("ManageCommunityValidations");
    const { t } = useTranslation("ManageCommunity");

    const formattedDocuments = useMemo(() => {
        const documents = community.documents ?? [];
        return Array.from(
            documents.map((d) => {
                const result: DocumentExt = { ...d } as DocumentExt;
                if (/^image/.test(result.mime_type)) {
                    result.src = d.uri;
                } else {
                    const extension = getFileExtension(result.short_fileName)?.toLowerCase() ?? "defaut";
                    const uri = extension in thumbnails ? thumbnails[extension].src : thumbnails["defaut"].src;
                    result.src = `${appRoot}/${uri}`;
                }

                return result;
            })
        );
    }, [community.documents]);

    const schema = (t: TranslationFunction<"ManageCommunityValidations", ComponentKey>) => {
        return yup.object({
            name: yup
                .string()
                .trim(t("trimmed_error"))
                .strict(true)
                .min(2, t("description.name.minlength"))
                .max(80, t("description.name.maxlength"))
                .required(t("description.name.mandatory")),
            description: yup.string().max(1024, t("description.desc.maxlength")).required(t("description.desc.mandatory")),
            keywords: yup.array().of(yup.string()),
        });
    };

    const {
        control,
        register,
        formState: { errors },
        // setValue: setFormValue,
    } = useForm({
        resolver: yupResolver(schema(tValid)),
        mode: "onChange",
        values: {
            name: community.name,
            description: community.description ?? "",
            // TODO keywords: community.keywords ?? []
            keywords: [],
        },
    });

    return (
        <>
            <h2>{t("desc.tab.title")}</h2>
            <div>
                <p>{tCommon("mandatory_fields")}</p>
                <Input
                    label={t("desc.name")}
                    hintText={t("desc.hint_name")}
                    state={errors.name ? "error" : "default"}
                    stateRelatedMessage={errors?.name?.message?.toString()}
                    nativeInputProps={{
                        ...register("name"),
                    }}
                />
                <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <MarkdownEditor
                            label={t("desc.description")}
                            hintText={t("desc.hint_description")}
                            state={errors.description ? "error" : "default"}
                            stateRelatedMessage={errors?.description?.message?.toString()}
                            value={field.value}
                            onChange={(values) => {
                                field.onChange(values);
                            }}
                        />
                    )}
                />
                <CommunityLogo communityId={community.id} logoUrl={community.logo_url} />
                <Controller
                    control={control}
                    name="keywords"
                    render={({ field }) => (
                        <AutocompleteSelect
                            label={t("desc.keywords")}
                            // hintText={t("")}
                            options={Object.values(categories).sort()}
                            searchFilter={{ limit: 40 }}
                            state={errors.keywords ? "error" : "default"}
                            stateRelatedMessage={errors?.keywords?.message?.toString()}
                            value={field.value}
                            onChange={(_, value) => field.onChange(value)}
                        />
                    )}
                />
                <label className={fr.cx("fr-label")}>
                    {t("desc.documents")}
                    <span className={fr.cx("fr-hint-text")}>{t("desc.documents_hint")}</span>
                </label>
                <div className={cx(fr.cx("fr-grid-row"), "frx-community-desc-documents")}>
                    {formattedDocuments.length ? (
                        formattedDocuments.map((d) => (
                            <div
                                style={{
                                    border: "solid 1.5px",
                                    borderColor: fr.colors.decisions.border.default.grey.default,
                                    backgroundColor: fr.colors.decisions.background.contrast.grey.default,
                                }}
                                className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-px-2v", "fr-py-2v", "fr-mr-2v")}
                                key={`${d.id}`}
                            >
                                <div>{d.title}</div>
                                <div>
                                    <img src={`${d.src}`} />
                                </div>
                                <Button
                                    title={t("desc.document.remove")}
                                    priority={"tertiary no outline"}
                                    iconId={"fr-icon-delete-line"}
                                    onClick={() => {
                                        console.log("REMOVE"); // TODO SUPPRIMER
                                        // TODO Mutation : Supprimer le fichier (la route n'existe pas encore)
                                    }}
                                />
                            </div>
                        ))
                    ) : (
                        <p className={fr.cx("fr-my-2v")}>{t("desc.no_documents")}</p>
                    )}
                </div>
                <Button className={fr.cx("fr-my-1v")} iconId={"fr-icon-add-circle-line"} priority="tertiary" onClick={() => AddDocumentDialogModal.open()}>
                    {tCommon("add")}
                </Button>
                <AddDocumentDialog
                    onCancel={() => AddDocumentDialogModal.close()}
                    onAdd={(title, file) => {
                        console.log(title, file.name); // TODO SUPPRIMER
                        // TODO Mutation : Envoyer le fichier en POST (la route n'existe pas encore)
                        AddDocumentDialogModal.close();
                    }}
                />
            </div>
        </>
    );
};

export default Description;
