import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, useMemo } from "react";
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
import DocumentList from "./description/DocumentList";

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
    const { t: tmc } = useTranslation("ManageCommunity");
    const { t } = useTranslation("Description");

    const communityNamesQuery = useQuery<string[], CartesApiException>({
        queryKey: RQKeys.communitiesName(),
        queryFn: () => api.community.getCommunitiesName(),
        staleTime: 3600000,
    });

    // TODO DECOMMENTER
    const communityDocumentsQuery = useQuery<DocumentDTO[], CartesApiException>({
        queryKey: RQKeys.communityDocuments(community.id),
        queryFn: ({ signal }) => api.communityDocuments.getAll(community.id, [], signal),
        staleTime: 3600000,
    });

    const communityNames = useMemo(() => {
        return communityNamesQuery.data?.filter((n) => n !== community.name) ?? [];
    }, [community.name, communityNamesQuery]);

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
            {communityDocumentsQuery.isError && <Alert severity="error" closable title={communityDocumentsQuery.error.message} />}
            {communityDocumentsQuery.isLoading && <LoadingText as="h6" message={t("loading_documents")} />}
            <h2>{tmc("desc.tab.title")}</h2>
            <div>
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
                <CommunityLogo communityId={community.id} logoUrl={community.logo_url} />
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
                {communityDocumentsQuery.data && <DocumentList communityId={community.id} documents={communityDocumentsQuery.data} />}
            </div>
        </>
    );
};

export default Description;

// traductions
export const { i18n } = declareComponentKeys<"loading_documents">()("Description");

export const DescriptionFrTranslations: Translations<"fr">["Description"] = {
    loading_documents: "Recherche des tables pour la configuration des thèmes ...",
};

export const DescriptionEnTranslations: Translations<"en">["Description"] = {
    loading_documents: undefined,
};
