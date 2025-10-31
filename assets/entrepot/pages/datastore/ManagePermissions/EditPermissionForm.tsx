import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Input from "@codegouvfr/react-dsfr/Input";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import api from "../../../api";
import DatePicker from "../../../../components/Input/DatePicker";
import LoadingText from "../../../../components/Utils/LoadingText";
import Wait from "../../../../components/Utils/Wait";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { routes } from "../../../../router/router";
import ScrollOfferingList from "./ScrollOfferingList";
import { getEditSchema } from "./ValidationSchemas";
import createRequestBody, { EditPermissionFormType } from "./utils";
import Main from "../../../../components/Layout/Main";
import { DatastorePermission } from "@/@types/app";

type EditPermissionFormProps = {
    datastoreId: string;
    permissionId: string;
};

const EditPermissionForm: FC<EditPermissionFormProps> = ({ datastoreId, permissionId }) => {
    const { t } = useTranslation("DatastorePermissions");
    const { t: tCommon } = useTranslation("Common");

    const queryClient = useQueryClient();

    /* La permission */
    const permissionQuery = useQuery({
        queryKey: RQKeys.datastore_permission(datastoreId, permissionId),
        queryFn: ({ signal }) => api.datastore.getPermission(datastoreId, permissionId, { signal }),
        staleTime: 30000,
    });

    /* Liste des offerings */
    const offeringsQuery = useQuery({
        queryKey: RQKeys.datastore_offering_list(datastoreId),
        queryFn: ({ signal }) => api.service.getOfferings(datastoreId, { signal }),
        staleTime: 30000,
    });

    const updateMutation = useMutation({
        mutationFn: (values: object) => api.datastore.updatePermission(datastoreId, permissionId, values),
        onSuccess(permission: DatastorePermission) {
            queryClient.setQueryData<DatastorePermission[]>(RQKeys.datastore_permissions(datastoreId), (oldPermissions) => {
                const newPermissions = oldPermissions?.filter((p) => p._id !== permissionId) || [];
                return [...newPermissions, ...[permission]];
            });
            routes.datastore_manage_permissions({ datastoreId: datastoreId }).push();
        },
    });

    const privateOfferings = useMemo(() => {
        return offeringsQuery.data?.filter((offering) => offering.open === false) ?? [];
    }, [offeringsQuery.data]);

    const endDate = useMemo(() => {
        if (permissionQuery.data && permissionQuery.data.end_date) {
            return new Date(permissionQuery.data.end_date);
        }
    }, [permissionQuery.data]);

    const offeringIds = useMemo(() => {
        return permissionQuery.data ? Array.from(permissionQuery.data.offerings, (offering) => offering._id) : [];
    }, [permissionQuery.data]);

    // Formulaire,
    const form = useForm<EditPermissionFormType>({
        mode: "onChange",
        resolver: yupResolver(getEditSchema(t)),
        values: {
            licence: permissionQuery.data?.licence || "",
            end_date: endDate,
            offerings: offeringIds,
        },
    });

    const {
        control,
        register,
        getValues: getFormValues,
        formState: { errors },
        handleSubmit,
    } = form;

    const onSubmit = () => {
        const values = createRequestBody(getFormValues());
        updateMutation.mutate(values);
    };

    return (
        <Main title={t("edit_form.document_title", { id: permissionId })}>
            <h1>{t("edit_form.title", { permission: permissionQuery.data })}</h1>
            {updateMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={cx(fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v"), "frx-icon-spin")} />
                            <h6 className={fr.cx("fr-m-0")}>{tCommon("modifying")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
            {updateMutation.error && <Alert severity="warning" closable title={tCommon("error")} description={updateMutation.error.message} />}
            {offeringsQuery.isLoading || permissionQuery.isLoading ? (
                <LoadingText />
            ) : offeringsQuery.error ? (
                <Alert severity="error" closable title={offeringsQuery.error?.message} />
            ) : permissionQuery.error ? (
                <Alert severity="error" closable title={permissionQuery.error?.message} />
            ) : privateOfferings.length === 0 ? (
                <Alert severity="error" closable title={t("add_form.no_services")} />
            ) : (
                <div>
                    <p>
                        <span className={fr.cx("fr-icon-info-fill")}>
                            <span className={fr.cx("fr-text--bold", "fr-ml-1v")}>{t("info.oauth_required")}</span>
                            {permissionQuery.data?.only_oauth ? tCommon("yes") : tCommon("no")}
                        </span>
                    </p>
                    <p className={fr.cx("fr-mb-1v")}>{tCommon("mandatory_fields")}</p>
                    <Input
                        label={t("edit_form.licence")}
                        hintText={t("edit_form.hint_licence")}
                        state={errors.licence ? "error" : "default"}
                        stateRelatedMessage={errors?.licence?.message?.toString()}
                        nativeInputProps={{ ...register("licence") }}
                    />
                    <Controller
                        control={control}
                        name="end_date"
                        render={({ field: { onChange, value } }) => (
                            <DatePicker
                                label={t("edit_form.expiration_date")}
                                value={value}
                                minDate={new Date()}
                                onChange={onChange}
                                state={errors.end_date?.message ? "error" : "default"}
                                stateRelatedMessage={errors.end_date?.message}
                                className={fr.cx("fr-col-12", "fr-col-sm-4")}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="offerings"
                        render={({ field: { onChange, value } }) => (
                            <ScrollOfferingList
                                label={t("add_form.hint_services")}
                                hintText={t("add_form.hint_services")}
                                state={errors.offerings ? "error" : "default"}
                                stateRelatedMessage={errors?.offerings?.message?.toString()}
                                offerings={privateOfferings}
                                value={value}
                                onChange={onChange}
                            />
                        )}
                    />
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                        <ButtonsGroup
                            buttons={[
                                {
                                    linkProps: routes.datastore_manage_permissions({ datastoreId: datastoreId }).link,
                                    children: tCommon("cancel"),
                                    priority: "secondary",
                                },
                                {
                                    children: t("edit_form.record"),
                                    onClick: () => handleSubmit(onSubmit)(),
                                },
                            ]}
                            inlineLayoutWhen="always"
                            alignment="right"
                            className={fr.cx("fr-mt-2w")}
                        />
                    </div>
                </div>
            )}
        </Main>
    );
};

export default EditPermissionForm;
