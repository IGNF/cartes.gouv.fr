import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import "../../../../assets/sass/scrolled_list.scss";
import api from "../../../api";
import DatePicker from "../../../components/Input/DatePicker";
import InputCollection from "../../../components/Input/InputCollection";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/RQKeys";
import { useAuthStore } from "../../../stores/AuthStore";
import { DatastorePermissionResponseDto, PermissionAccountCreateDto, PermissionCommunityCreateDto, PermissionCreateDtoTypeEnum } from "../../../types/entrepot";
import CommunityListForm from "./CommunityListForm";
import ScrollOfferingList from "./ScrollOfferingList";
import { getAddSchema } from "./ValidationSchemas";
import Wait from "../../../components/Utils/Wait";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { routes } from "../../../router/router";

type AddPermissionFormProps = {
    datastoreId: string;
};

type AddPermissionFormType = {
    licence: string;
    type: string;
    beneficiaries: string[];
    end_date?: Date;
    offerings: string[];
    only_oauth: boolean;
};

const createRequestBody = (formValues: AddPermissionFormType): PermissionCommunityCreateDto | PermissionAccountCreateDto => {
    // Nettoyage => trim sur toutes les chaines
    const values = JSON.parse(
        JSON.stringify(formValues, (_, value) => {
            return typeof value === "string" ? value.trim() : value;
        })
    );

    if (!("end_date" in values)) {
        values["end_date"] = null;
    }
    if (values.end_date !== null) {
        const date = new Date(values.end_date);
        date.setUTCHours(23, 59, 59, 0);
        values.end_date = date.toISOString();
    }

    return values;
};

const AddPermissionForm: FC<AddPermissionFormProps> = ({ datastoreId }) => {
    const { t } = useTranslation("DatastorePermissions");
    const { t: tCommon } = useTranslation("Common");

    const user = useAuthStore.getState().user;

    const defaultDate = useMemo(() => {
        return new Date(new Date().setFullYear(new Date().getFullYear() + 2));
    }, []);

    const defaultOnlyOauth = false;

    const queryClient = useQueryClient();

    /* Liste des communautes publiques */
    const {
        isLoading,
        error,
        data: publicCommunities,
    } = useQuery({
        queryKey: RQKeys.catalogs_communities(),
        queryFn: ({ signal }) => api.catalogs.getAllPublicCommunities({ signal }),
        staleTime: 30000,
    });

    /* Liste des offerings */
    const {
        isLoading: isOfferingsLoading,
        error: offeringsError,
        data,
    } = useQuery({
        queryKey: RQKeys.datastore_offering_list(datastoreId),
        queryFn: ({ signal }) => api.service.getOfferings(datastoreId, { signal }),
        staleTime: 30000,
    });

    const {
        status: addPermissionStatus,
        error: addPermissionError,
        mutate: mutateAdd,
    } = useMutation({
        mutationFn: (values: object) => api.datastore.addPermission(datastoreId, values),
        onSuccess(permission: DatastorePermissionResponseDto) {
            queryClient.setQueryData<DatastorePermissionResponseDto[]>(RQKeys.datastore_permissions(datastoreId), (permissions) => {
                permissions?.push(permission);
                return permissions;
            });
            routes.datastore_manage_permissions({ datastoreId: datastoreId }).push();
        },
    });

    const communities = useMemo(() => {
        const communities: Record<string, string> = publicCommunities?.reduce((acc, community) => ({ ...acc, [community._id]: community.name }), {}) ?? {};
        if (user) {
            user.communitiesMember.forEach((communityMember) => {
                const community = communityMember.community;
                if (community && !(community._id in communities)) {
                    communities[community._id] = community.name;
                }
            });
        }
        return Object.entries(communities).map(([id, name]) => ({ id: id, name: name }));
    }, [user, publicCommunities]);

    // Formulaire,
    const form = useForm<AddPermissionFormType>({
        mode: "onChange",
        resolver: yupResolver(getAddSchema(t)),
        defaultValues: {
            type: "COMMUNITY",
            end_date: defaultDate,
            only_oauth: defaultOnlyOauth,
            beneficiaries: [],
            offerings: [],
        },
    });

    const {
        control,
        register,
        setValue: setFormValue,
        getValues: getFormValues,
        formState: { errors },
        watch,
        handleSubmit,
    } = form;
    const type = watch("type");

    const handleOauthChange = (checked: boolean) => {
        setFormValue("only_oauth", checked);
    };

    const onSubmit = () => {
        const values = createRequestBody(getFormValues());
        mutateAdd(values);
    };

    // TODO SUPPRIMER
    /*useEffect(() => {
        watch((value, { name, type }) => console.log(value, name, type));
    }, [watch]); */

    useEffect(() => {
        setFormValue("beneficiaries", []);
    }, [type, setFormValue]);

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={t("add_form.title")}>
            <h1>{t("add_form.title")}</h1>
            {addPermissionStatus === "pending" && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={cx(fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v"), "frx-icon-spin")} />
                            <h6 className={fr.cx("fr-m-0")}>{tCommon("adding")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
            {addPermissionError && <Alert severity="warning" closable title={tCommon("error")} description={addPermissionError.message} />}
            {isLoading || isOfferingsLoading ? (
                <LoadingText />
            ) : error ? (
                <Alert severity="error" closable title={error?.message} />
            ) : offeringsError ? (
                <Alert severity="error" closable title={offeringsError?.message} />
            ) : data?.length === 0 ? (
                <Alert severity="error" closable title={t("add_form.no_services")} />
            ) : (
                <div>
                    <p>{tCommon("mandatory_fields")}</p>
                    <Input
                        label={t("add_form.licence")}
                        hintText={t("add_form.hint_licence")}
                        state={errors.licence ? "error" : "default"}
                        stateRelatedMessage={errors?.licence?.message?.toString()}
                        nativeInputProps={{ ...register("licence") }}
                    />
                    <RadioButtons
                        legend={t("add_form.type")}
                        hintText={t("add_form.hint_licence")}
                        state={errors.type ? "error" : "default"}
                        stateRelatedMessage={errors?.type?.message?.toString()}
                        orientation="horizontal"
                        options={[
                            {
                                label: t("add_form.communities"),
                                nativeInputProps: {
                                    ...register("type"),
                                    value: PermissionCreateDtoTypeEnum.COMMUNITY,
                                    checked: PermissionCreateDtoTypeEnum.COMMUNITY === type,
                                },
                            },
                            {
                                label: t("add_form.users"),
                                nativeInputProps: {
                                    ...register("type"),
                                    value: PermissionCreateDtoTypeEnum.ACCOUNT,
                                    checked: PermissionCreateDtoTypeEnum.ACCOUNT === type,
                                },
                            },
                        ]}
                    />
                    <Controller
                        control={control}
                        name="beneficiaries"
                        render={({ field: { onChange } }) =>
                            type === "COMMUNITY" ? (
                                <CommunityListForm
                                    communities={communities}
                                    state={errors.beneficiaries ? "error" : "default"}
                                    stateRelatedMessage={errors.beneficiaries?.message?.toString()}
                                    onChange={onChange}
                                />
                            ) : (
                                <InputCollection
                                    state={errors.beneficiaries ? "error" : "default"}
                                    stateRelatedMessage={errors.beneficiaries?.message?.toString()}
                                    onChange={onChange}
                                />
                            )
                        }
                    />
                    <Controller
                        control={control}
                        name="end_date"
                        render={({ field: { onChange } }) => (
                            <DatePicker label={t("add_form.expiration_date")} value={defaultDate} minDate={new Date()} onChange={onChange} />
                        )}
                    />
                    <Controller
                        control={control}
                        name="offerings"
                        render={({ field: { onChange } }) => (
                            <ScrollOfferingList
                                offerings={data}
                                label={t("add_form.hint_services")}
                                hintText={t("add_form.hint_services")}
                                state={errors.offerings ? "error" : "default"}
                                stateRelatedMessage={errors?.offerings?.message?.toString()}
                                onChange={onChange}
                            />
                        )}
                    />
                    <ToggleSwitch
                        helperText={t("add_form.hint_only_oath")}
                        inputTitle={t("add_form.only_oath")}
                        label={t("add_form.only_oath")}
                        showCheckedHint
                        defaultChecked={defaultOnlyOauth}
                        onChange={(checked) => handleOauthChange(checked)}
                    />
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                        <Button onClick={handleSubmit(onSubmit)}>{tCommon("add")}</Button>
                    </div>
                </div>
            )}
        </DatastoreLayout>
    );
};

export default AddPermissionForm;
