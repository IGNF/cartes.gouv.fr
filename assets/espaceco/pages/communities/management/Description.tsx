import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Table from "@codegouvfr/react-dsfr/Table";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, useEffect, useMemo, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { CommunityFormMode, DescriptionFormType, MembershipRequestValues } from "../../../../@types/app_espaceco";
import { CommunityResponseDTO, DocumentDTO } from "../../../../@types/espaceco";
import AutocompleteSelect from "../../../../components/Input/AutocompleteSelect";
import MarkdownEditor from "../../../../components/Input/MarkdownEditor";
import categories from "../../../../data/topic_categories.json";
import { ComponentKey, declareComponentKeys, Translations, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { type CartesApiException } from "../../../../modules/jsonFetch";
import "../../../../sass/pages/espaceco/community.scss";
import api from "../../../api";
import { getDescriptionDefaultValues } from "../DefaultValues";
import DocumentList from "./description/DocumentList";
import { OpenWithEmailsConfigDialog, OpenWithEmailsConfigDialogModal } from "./description/OpenWithEmailsConfigDialog";

import Alert from "@codegouvfr/react-dsfr/Alert";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import LoadingText from "../../../../components/Utils/LoadingText";
import "../../../../sass/pages/espaceco/community.scss";
import CommunityLogo from "./CommunityLogo";

type DescriptionProps = {
    mode: CommunityFormMode;
    community: CommunityResponseDTO;
    onSubmit: (datas: FormData) => void;
};

const Description: FC<DescriptionProps> = ({ mode, community, onSubmit }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tValid } = useTranslation("ManageCommunityValidations");
    const { t: tmc } = useTranslation("ManageCommunity");

    const communityNamesQuery = useQuery<string[], CartesApiException>({
        queryKey: RQKeys.communitiesName(),
        queryFn: () => api.community.getCommunitiesName(),
        staleTime: 3600000,
    });

    const communityNames = useMemo(() => {
        const name = community?.name;
        return communityNamesQuery.data?.filter((n) => n !== name) ?? [];
    }, [community, communityNamesQuery]);

    const communityDocumentsQuery = useQuery<DocumentDTO[] | null, CartesApiException>({
        queryKey: RQKeys.communityDocuments(community.id),
        queryFn: ({ signal }) => {
            if (community) {
                return api.communityDocuments.getAll(community.id, [], signal);
            }
            return Promise.resolve(null);
        },
        staleTime: 3600000,
        enabled: community !== undefined,
    });

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
            description: yup.string().max(1024, t("description.desc.maxlength")),
            keywords: yup.array().of(yup.string().required()),
            listed: yup.boolean().required(),
            membershipRequest: yup.string().oneOf(MembershipRequestValues).required(),
            openWithEmail: yup
                .array()
                .of(
                    yup
                        .object({
                            email: yup.string().required(),
                            grids: yup
                                .array()
                                .of(
                                    yup
                                        .object({
                                            name: yup.string().required(),
                                            title: yup.string().required(),
                                            type: yup
                                                .object({
                                                    name: yup.string().required(),
                                                    title: yup.string().required(),
                                                })
                                                .required(),
                                            deleted: yup.boolean().required(),
                                            extent: yup.array().of(yup.number().required()),
                                        })
                                        .required()
                                )
                                .required(),
                        })
                        .required()
                )
                .test({
                    name: "is_not_empty",
                    test: (value, context) => {
                        if (!value) {
                            return true;
                        }

                        const {
                            parent: { membershipRequest },
                        } = context;
                        if (membershipRequest !== "partially_open") {
                            return true;
                        }

                        if (value?.length === 0) {
                            return context.createError({ message: tmc("desc.openwithemail_not_empty") });
                        }
                        return true;
                    },
                })
                .required(),
        });
    };

    const defaultValues = getDescriptionDefaultValues(community);

    const form = useForm<DescriptionFormType>({
        resolver: yupResolver(schema(tValid)),
        mode: "onSubmit",
        values: defaultValues,
    });

    const {
        control,
        register,
        formState: { errors },
        watch,
        getValues: getFormValues,
        setValue: setFormValue,
        handleSubmit,
    } = form;

    const membership = watch("membershipRequest");
    const openWithEmail = watch("openWithEmail");

    const data: ReactNode[][] = useMemo(() => {
        return Array.from(openWithEmail, (owe) => {
            const gridsDatas: ReactNode[][] = Array.from(owe.grids, (grid) => [grid.name, grid.title]);
            return [owe.email, <Table key={owe.email} noCaption fixed data={gridsDatas} />];
        });
    }, [openWithEmail]);

    const [showOpenWithEmail, setShowOpenWithEmail] = useState<boolean>(() => {
        return defaultValues.membershipRequest === "partially_open";
    });

    useEffect(() => {
        setShowOpenWithEmail(membership === "partially_open");
    }, [membership]);

    const onSubmitForm = () => {
        const values = getFormValues();

        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("listed", Boolean(values.listed).toString());
        if (values.description) {
            formData.append("description", values.description);
        }
        if (values.logo) {
            formData.append("logo", values.logo[0]);
        }
        if (values.keywords && values.keywords.length) {
            formData.append("keywords", JSON.stringify(values.keywords));
        }

        if (values.membershipRequest === "partially_open") {
            const openWithEmail = values.openWithEmail.reduce((accumulator, owe) => {
                const grids: string[] = [];
                owe.grids.reduce((acc, grid) => {
                    acc.push(grid.name);
                    return acc;
                }, grids);
                accumulator[owe.email] = grids;
                return accumulator;
            }, {});
            formData.append("open_with_email", JSON.stringify(openWithEmail));
        } else formData.append("open_without_affiliation", values.membershipRequest === "open" ? "true" : "false");
        onSubmit(formData);
    };

    return (
        <>
            {communityNamesQuery.isLoading || (communityDocumentsQuery.isLoading && <LoadingText as={"h6"} />)}
            {communityNamesQuery.isError && <Alert severity="error" closable title={communityNamesQuery.error.message} />}
            {communityDocumentsQuery.isError && <Alert severity="error" closable title={communityDocumentsQuery.error.message} />}
            {communityNamesQuery.data && communityDocumentsQuery.data && (
                <div>
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
                                    value={field.value ?? ""}
                                    onChange={(values) => {
                                        field.onChange(values);
                                    }}
                                />
                            )}
                        />
                        <CommunityLogo community={community} />
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
                        <DocumentList communityId={community.id} documents={communityDocumentsQuery.data} />
                        <Controller
                            control={control}
                            name="listed"
                            render={({ field: { onChange } }) => (
                                <ToggleSwitch
                                    className={fr.cx("fr-my-3w")}
                                    label={tmc("desc.listed.title")}
                                    helperText={tmc("desc.listed_hint")}
                                    checked={getFormValues("listed")}
                                    showCheckedHint={false}
                                    onChange={onChange}
                                />
                            )}
                        />
                        <RadioButtons
                            legend={tmc("desc.membership_requests.title")}
                            options={[
                                {
                                    label: tmc("desc.membership_requests.open"),
                                    nativeInputProps: {
                                        ...register("membershipRequest"),
                                        value: "open",
                                        checked: membership === "open",
                                    },
                                },
                                {
                                    label: tmc("desc.membership_requests.not_open"),
                                    hintText: tmc("desc.membership_requests.not_open_hint"),
                                    nativeInputProps: {
                                        ...register("membershipRequest"),
                                        value: "not_open",
                                        checked: membership === "not_open",
                                    },
                                },
                                {
                                    label: tmc("desc.membership_requests.partial_open"),
                                    hintText: tmc("desc.membership_requests.partial_open_hint"),
                                    nativeInputProps: {
                                        ...register("membershipRequest"),
                                        value: "partially_open",
                                        checked: membership === "partially_open",
                                    },
                                },
                            ]}
                        />
                        {showOpenWithEmail && (
                            <div>
                                <Button
                                    priority="secondary"
                                    iconId={"fr-icon-settings-5-line"}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        OpenWithEmailsConfigDialogModal.open();
                                    }}
                                >
                                    {tmc("desc.membership_request.partial_open.parameter")}
                                </Button>
                                <div className={fr.cx("fr-input-group", errors.openWithEmail ? "fr-input-group--error" : undefined)}>
                                    {errors.openWithEmail && <p className={fr.cx("fr-error-text")}>{errors.openWithEmail?.message?.toString()}</p>}
                                    {data.length ? (
                                        <Table
                                            className={cx(fr.cx("fr-my-2v"), "frx-openwithemail")}
                                            noCaption
                                            fixed
                                            data={data}
                                            headers={[tmc("desc.openwithemail.domains_header"), tmc("desc.openwithemail.grids_header")]}
                                        />
                                    ) : (
                                        <p>{tmc("desc.openwithemail_no_domains")}</p>
                                    )}
                                </div>
                            </div>
                        )}
                        <OpenWithEmailsConfigDialog openWithEmailOriginal={openWithEmail} onUpdate={(values) => setFormValue("openWithEmail", values)} />
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                            <Button
                                priority="primary"
                                nativeButtonProps={{
                                    type: "submit",
                                }}
                            >
                                {mode === "creation" ? tCommon("continue") : tCommon("save")}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
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
