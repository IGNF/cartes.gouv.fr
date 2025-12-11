import Wait from "@/components/Utils/Wait";
import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Table from "@codegouvfr/react-dsfr/Table";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, memo, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { DescriptionFormType, MembershipRequestValues } from "../../../../@types/app_espaceco";
import { CommunityResponseDTO, DocumentDTO } from "../../../../@types/espaceco";
import AutocompleteSelect from "../../../../components/Input/AutocompleteSelect";
import HtmlEditor from "../../../../components/Input/HtmlEditor";
import LoadingText from "../../../../components/Utils/LoadingText";
import categories from "../../../../data/topic_categories.json";
import { useTranslation } from "../../../../i18n/i18n";
import { ComponentKey } from "../../../../i18n/types";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { type CartesApiException } from "../../../../modules/jsonFetch";
import "../../../../sass/pages/espaceco/community.scss";
import { setToNull } from "../../../../utils";
import api from "../../../api";
import { getDescriptionDefaultValues } from "../DefaultValues";
import ReuseCommunityConfig from "../ReuseCommunityConfig";
import ActionButtonsCreation from "./ActionButtonsCreation";
import ActionButtonsEdition from "./ActionButtonsEdition";
import CommunityLogo from "./description/CommunityLogo";
import DocumentList from "./description/DocumentList";
import { OpenWithEmailsConfigDialog, OpenWithEmailsConfigDialogModal } from "./description/OpenWithEmailsConfigDialog";
import { DescriptionControlImage } from "./DescriptionControls/DescriptionControlImage";
import { DocumentsProvider } from "./DescriptionControls/documentsContext";
import { DescriptionControlLink } from "./DescriptionControls/DescriptionControlLink";

type DescriptionProps = {
    isAdmin: boolean;
};

const fieldsToCopy = ["description", "editorial", "keywords"];

const Description: FC<DescriptionProps> = ({ isAdmin }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tValid } = useTranslation("ManageCommunityValidations");
    const { t: tmc } = useTranslation("ManageCommunity");

    const context = useCommunityContext();

    const { mode, stepper, updateCommunity, isCommunityUpdating, isCommunityUpdatingError, updatingCommunityError } = context;
    const community = context.community!;

    const communityNamesQuery = useQuery<string[], CartesApiException>({
        queryKey: RQKeys.communitiesName(),
        queryFn: () => api.community.getCommunitiesName(),
        staleTime: 3600000,
    });

    const communityNames = useMemo(() => {
        const name = community?.name;
        return communityNamesQuery.data?.filter((n) => n !== name) ?? [];
    }, [community, communityNamesQuery.data]);

    const communityDocumentsQuery = useQuery<DocumentDTO[] | null, CartesApiException>({
        queryKey: RQKeys.communityDocuments(community?.id),
        queryFn: ({ signal }) => {
            return api.communityDocuments.getAll(community.id, [], signal);
        },
        staleTime: 3600000,
    });

    const schema = (t: TranslationFunction<"ManageCommunityValidations", ComponentKey>): yup.ObjectSchema<DescriptionFormType> => {
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
            editorial: yup.string(),
            keywords: yup.array().of(yup.string().required()),
            logo: yup.mixed().optional(),
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

    const defaultValues = useMemo(() => getDescriptionDefaultValues(community), [community]);

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

    const copyFromCommunity = useCallback(
        (reUsedCommunity?: CommunityResponseDTO) => {
            if (!reUsedCommunity) {
                return;
            }

            const fields = isAdmin ? [...fieldsToCopy, ...["membershipRequest", "openWithEmail"]] : [...fieldsToCopy];
            const values = getDescriptionDefaultValues(reUsedCommunity);

            fields.forEach((f) => {
                if (f in values) {
                    setFormValue(f as keyof DescriptionFormType, values[f]);
                }
            });
        },
        [isAdmin, setFormValue]
    );

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

    const onSubmitForm = (saveOnly: boolean) => {
        const values = getFormValues();

        const datas = {
            name: values.name,
            listed: Boolean(values.listed).toString(),
            description: setToNull(values.description),
            editorial: setToNull(values.editorial),
        };

        /* if (values.keywords && values.keywords.length) {
            datas["keywords"] = values.keywords;
        } */

        if (isAdmin) {
            datas["open_without_affiliation"] = "false";

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
                datas["open_with_email"] = Object.keys(openWithEmail).length === 0 ? null : openWithEmail;
            } else datas["open_without_affiliation"] = values.membershipRequest === "open" ? "true" : "false";
        }

        updateCommunity(datas, () => {
            if (mode === "creation" && !saveOnly && !stepper?.isLastStep()) {
                stepper?.nextStep();
            }
        });
    };

    return (
        <>
            {isCommunityUpdating && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={tmc("updating")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
            {isCommunityUpdatingError && (
                <Alert className={fr.cx("fr-my-2v")} severity="error" closable title={tCommon("error")} description={updatingCommunityError?.message} />
            )}
            {(communityNamesQuery.isLoading || communityDocumentsQuery.isLoading) && <LoadingText as={"h6"} />}
            {communityNamesQuery.isError && <Alert className={fr.cx("fr-my-2v")} severity="error" closable title={communityNamesQuery.error.message} />}
            {communityDocumentsQuery.isError && <Alert className={fr.cx("fr-my-2v")} severity="error" closable title={communityDocumentsQuery.error.message} />}
            {communityNamesQuery.data && communityDocumentsQuery.data && (
                <DocumentsProvider communityId={community.id} documents={communityDocumentsQuery.data}>
                    <h2>{tmc("desc.tab.title")}</h2>
                    <ReuseCommunityConfig
                        title={tmc("desc.reuse_label")}
                        description={tmc("desc.reuse_description")}
                        confirmation={tmc("desc.reuse_confirmation")}
                        onCopy={(reUsedCommunity) => {
                            copyFromCommunity(reUsedCommunity);
                        }}
                    />
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
                            render={({ field }) => {
                                console.log("FIELDVALUE : ", field.value);
                                return (
                                    <HtmlEditor
                                        label={tmc("desc.description")}
                                        hintText={tmc("desc.hint_description")}
                                        state={errors.description ? "error" : "default"}
                                        stateRelatedMessage={errors?.description?.message?.toString()}
                                        value={field.value ?? ""}
                                        onChange={(values) => {
                                            field.onChange(values);
                                        }}
                                    />
                                );
                            }}
                        />
                        <CommunityLogo />
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
                        {isAdmin && (
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
                        )}
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
                        <Controller
                            control={control}
                            name="editorial"
                            render={({ field }) => (
                                <HtmlEditor
                                    controlMap={{ Image: DescriptionControlImage, Link: DescriptionControlLink }}
                                    label={tmc("desc.editorial")}
                                    hintText={tmc("desc.editorial_hint")}
                                    state={errors.editorial ? "error" : "default"}
                                    stateRelatedMessage={errors?.editorial?.message?.toString()}
                                    value={field.value ?? ""}
                                    onChange={(values) => {
                                        field.onChange(values);
                                    }}
                                />
                            )}
                        />
                        <DocumentList communityId={community.id} documents={communityDocumentsQuery.data} />
                        <OpenWithEmailsConfigDialog openWithEmailOriginal={openWithEmail} onUpdate={(values) => setFormValue("openWithEmail", values)} />
                        {mode === "creation" ? (
                            <ActionButtonsCreation
                                onSave={() => handleSubmit(() => onSubmitForm(true))()}
                                onContinue={() => handleSubmit(() => onSubmitForm(false))()}
                            />
                        ) : (
                            <ActionButtonsEdition onSave={() => handleSubmit(() => onSubmitForm(true))()} />
                        )}
                    </div>
                </DocumentsProvider>
            )}
        </>
    );
};

export default memo(Description);
