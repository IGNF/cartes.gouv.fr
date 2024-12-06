import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { CommunityResponseDTO, DocumentDTO } from "../../../../@types/espaceco";
import AutocompleteSelect from "../../../../components/Input/AutocompleteSelect";
import MarkdownEditor from "../../../../components/Input/MarkdownEditor";
import LoadingText from "../../../../components/Utils/LoadingText";
import categories from "../../../../data/topic_categories.json";
import { ComponentKey, declareComponentKeys, Translations, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { type CartesApiException } from "../../../../modules/jsonFetch";
import "../../../../sass/pages/espaceco/community.scss";
import api from "../../../api";
import CommunityLogo from "./CommunityLogo";
import DocumentList from "./description/DocumentList2";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@mui/material";

type DocumentForm = {
    title: string;
    description?: string;
    file: File;
};

type DescriptionForm = {
    name: string;
    description?: string;
    keywords?: string[];
    documents?: DocumentForm[];
};

type DescriptionProps = {
    community?: CommunityResponseDTO;
    onSubmit: (datas: DescriptionForm) => void;
};

const Description: FC<DescriptionProps> = ({ community }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tValid } = useTranslation("ManageCommunityValidations");
    const { t: tmc } = useTranslation("ManageCommunity");
    const { t } = useTranslation("Description");

    const communityNamesQuery = useQuery<string[], CartesApiException>({
        queryKey: RQKeys.communitiesName(),
        queryFn: () => api.community.getCommunitiesName(),
        staleTime: 3600000,
    });

    /* const communityDocumentsQuery = useQuery<DocumentDTO[] | null, CartesApiException>({
        queryKey: RQKeys.communityDocuments(community?.id),
        queryFn: ({ signal }) => {
            if (community) {
                return api.communityDocuments.getAll(community.id, [], signal);
            }
            return Promise.resolve(null);
        },
        staleTime: 3600000,
        enabled: community !== undefined,
    }); */

    const communityNames = useMemo(() => {
        const name = community?.name;
        return communityNamesQuery.data?.filter((n) => n !== name) ?? [];
    }, [community, communityNamesQuery]);

    // TODO AJOUTER LES TRADUCTIONS POUR LES VALIDATIONS DES DOCUMENTS
    const schema = (t: TranslationFunction<"ManageCommunityValidations", ComponentKey>) => {
        return yup.object({
            name: yup
                .string()
                .trim(t("trimmed_error"))
                .strict(true)
                .min(2, t("description.name.minlength"))
                .max(80, t("description.name.maxlength"))
                .test("is-unique", tValid("description.name.unique"), (name) => {
                    if (name === undefined) return true;
                    return !communityNames.includes(name.trim());
                })
                .required(t("description.name.mandatory")),
            description: yup.string().max(1024, t("description.desc.maxlength")).required(t("description.desc.mandatory")),
            keywords: yup.array().of(yup.string()),
            documents: yup.array().of(
                yup.object({
                    title: yup.string(),
                    description: yup.string(),
                    file: yup.mixed(),
                })
            ),
        });
    };

    const {
        control,
        register,
        formState: { errors },
        getValues: getFormValues,
        handleSubmit,
    } = useForm({
        resolver: yupResolver(schema(tValid)),
        mode: "onChange",
        values: {
            name: community?.name || "",
            description: community?.description ?? "",
            keywords: community?.keywords ?? [],
            documents: [],
        },
    });

    const onSubmitForm = () => {
        const values = getFormValues();

        /* Suppression des tableaux vides et des valeurs nulles ou undefined */
        Object.keys(values).forEach((key) => {
            if ((Array.isArray(values[key]) && values[key].length === 0) || values[key] === null || values[key] === undefined) {
                delete values[key];
            }
        });
    };
    return (
        <>
            <h2>{tmc("desc.tab.title")}</h2>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <p>{tCommon("mandatory_fields")}</p>
                <Input
                    label={tmc("desc.name")}
                    hintText={tmc("desc.hint_name")}
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
                            label={tmc("desc.description")}
                            hintText={tmc("desc.hint_description")}
                            state={errors.description ? "error" : "default"}
                            stateRelatedMessage={errors?.description?.message?.toString()}
                            value={field.value}
                            onChange={(values) => {
                                field.onChange(values);
                            }}
                        />
                    )}
                />
                {/* TODO A VOIR */}
                {/* <CommunityLogo communityId={community.id} logoUrl={community.logo_url} /> */}
                <Controller
                    control={control}
                    name="keywords"
                    render={({ field }) => (
                        <AutocompleteSelect
                            label={tmc("desc.keywords")}
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
                {/* TODO A VOIR */}
                <DocumentList community={community} />
                {/* {communityDocumentsQuery.data && <DocumentList communityId={community.id} documents={communityDocumentsQuery.data} />} */}
                <div className={fr.cx("fr-grid-row", "fr-grid-row--right")} />
            </form>
        </>
    );
};

export default Description;

// traductions
export const { i18n } = declareComponentKeys<"loading_documents">()("Description");

export const DescriptionFrTranslations: Translations<"fr">["Description"] = {
    loading_documents: "Chargement des documents",
};

export const DescriptionEnTranslations: Translations<"en">["Description"] = {
    loading_documents: undefined,
};
