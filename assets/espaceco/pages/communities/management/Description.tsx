import { FC } from "react";
import { CommunityResponseDTO } from "../../../../@types/espaceco";
import { ComponentKey, useTranslation } from "../../../../i18n/i18n";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import Input from "@codegouvfr/react-dsfr/Input";
import MarkdownEditor from "../../../../components/Input/MarkdownEditor";
import CommunityLogo from "./CommunityLogo";
import AutocompleteSelect from "../../../../components/Input/AutocompleteSelect";
import categories from "../../../../data/topic_categories.json";

type DescriptionProps = {
    community: CommunityResponseDTO;
};

const Description: FC<DescriptionProps> = ({ community }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tValid } = useTranslation("ManageCommunityValidations");
    const { t } = useTranslation("ManageCommunity");

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
        getValues: getFormValues,
        formState: { errors },
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
            <h2>{t("tab1")}</h2>
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
            </div>
        </>
    );
};

export default Description;
