import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";

import { DatastoreEndpoint, DatastorePermission, EndpointTypeEnum, Service, ServiceFormValuesBaseType } from "../../../../../@types/app";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import api from "../../../../api";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

type AccessRestrictionProps = {
    datastoreId: string;
    endpointType: EndpointTypeEnum;
    visible: boolean;
    form: UseFormReturn<ServiceFormValuesBaseType>;
    service?: Service | null;
};

const AccessRestrictions: FC<AccessRestrictionProps> = ({ datastoreId, endpointType, visible, form, service }) => {
    const { t } = useTranslation("AccessRestrictions");
    const { t: tCommon } = useTranslation("Common");

    const {
        register,
        setValue,
        formState: { errors },
        watch,
    } = form;

    const { data: permissions } = useQuery<DatastorePermission[]>({
        queryKey: RQKeys.datastore_permission_offering(datastoreId, service?._id ?? ""),
        queryFn: ({ signal }) => api.datastore.getPermissions(datastoreId, { offering: service?._id }, { signal }),
        enabled: Boolean(service?._id),
    });

    const offeringPermissions = permissions?.filter((permission) => permission.offerings.map((offering) => offering._id).includes(service?._id ?? ""));
    const isPermission = offeringPermissions?.some((permission) => permission.beneficiary?._id === api.alerts.communityId) ?? false;

    useEffect(() => {
        setValue("allow_view_data", isPermission);
    }, [setValue, isPermission]);

    const shareWith = watch("share_with");

    const endpointsQuery = useQuery<DatastoreEndpoint[]>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: ({ signal }) => api.datastore.getEndpoints(datastoreId, {}, { signal }),
        retry: false,
        staleTime: 3600000,
    });

    const publicEndpoints = useMemo(
        () =>
            Array.isArray(endpointsQuery?.data)
                ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === endpointType && endpoint.endpoint.open === true)
                : [],
        [endpointType, endpointsQuery?.data]
    );

    const privateEndpoints = useMemo(
        () =>
            Array.isArray(endpointsQuery?.data)
                ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === endpointType && endpoint.endpoint.open === false)
                : [],
        [endpointType, endpointsQuery?.data]
    );

    return (
        <div className={fr.cx("fr-my-2v", !visible && "fr-hidden")}>
            <h3>{t("title")}</h3>

            <p>{tCommon("mandatory_fields")}</p>

            <RadioButtons
                legend={t("share_with")}
                state={errors.share_with ? "error" : "default"}
                stateRelatedMessage={errors?.share_with?.message?.toString()}
                options={[
                    {
                        label: t("share_with_all_public"),
                        hintText: t("share_with_all_public_hint_text"),
                        nativeInputProps: {
                            ...register("share_with"),
                            value: "all_public",
                            disabled: publicEndpoints?.length === 0,
                        },
                    },
                    {
                        label: t("share_with_your_community"),
                        hintText: t("share_with_your_community_hint_text"),
                        nativeInputProps: {
                            ...register("share_with"),
                            value: "your_community",
                            disabled: privateEndpoints?.length === 0,
                        },
                    },
                ]}
            />

            {shareWith === "your_community" && api.alerts.communityId && (
                <Checkbox
                    className={fr.cx("fr-ml-5v")}
                    options={[
                        {
                            hintText: t("allow_view_data_hint_text"),
                            label: t("allow_view_data"),
                            nativeInputProps: {
                                onChange: (e) => {
                                    const checked = e.currentTarget.checked;
                                    setValue("allow_view_data", checked);
                                },
                                checked: watch("allow_view_data"),
                            },
                        },
                    ]}
                />
            )}

            {/* message d'avertissement quand on passe de restreint à tout public, car cela va supprimer toutes les permissions sur ce service */}
            {service?.open === false && shareWith === "all_public" && (
                <Alert
                    severity="warning"
                    closable={false}
                    title={t("share_with_value_change_warning_title")}
                    description={t("share_with_value_change_warning_desc_restricted_to_public")}
                />
            )}

            {/* message d'avertissement quand on passe de tout public à restreint */}
            {service?.open === true && shareWith === "your_community" && (
                <Alert
                    severity="warning"
                    closable={false}
                    title={t("share_with_value_change_warning_title")}
                    description={t("share_with_value_change_warning_desc_public_to_restricted")}
                />
            )}
        </div>
    );
};

export default AccessRestrictions;
