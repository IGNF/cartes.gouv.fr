import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useQuery } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";

import { DatastoreEndpoint, EndpointTypeEnum, Service, ServiceFormValuesBaseType } from "../../../@types/app";
import { Translations, useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/entrepot/RQKeys";
import api from "../../api";
import Alert from "@codegouvfr/react-dsfr/Alert";

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
        formState: { errors },
        watch,
    } = form;

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

            {/* message d'avertissement quand on passe de restreint à tout public, car cela va supprimer toutes les permissions sur ce service */}
            {service?.open === false && shareWith === "all_public" && (
                <Alert
                    severity="warning"
                    closable={false}
                    title={t("share_with_value_change_warning_title")}
                    description={t("share_with_value_change_warning_desc")}
                />
            )}
        </div>
    );
};

export default AccessRestrictions;

export const { i18n } = declareComponentKeys<
    | "title"
    | "share_with"
    | "share_with_all_public"
    | "share_with_all_public_hint_text"
    | "share_with_your_community"
    | "share_with_your_community_hint_text"
    | "share_with_value_change_warning_title"
    | "share_with_value_change_warning_desc"
>()({
    AccessRestrictions,
});

export const AccessRestrictionsFrTranslations: Translations<"fr">["AccessRestrictions"] = {
    title: "Restrictions d’accès",
    share_with: "A quel public souhaitez-vous que ce service soit accessible ?",
    share_with_all_public: "Tout public",
    share_with_all_public_hint_text: "Le service sera accessible à tout utilisateur sans restriction.",
    share_with_your_community: "Restreint",
    share_with_your_community_hint_text:
        "Vous devrez accorder une permission aux communautés et/ou utilisateurs souhaités pour leur autoriser l'accès. Ils devront par la suite configurer une clé à partir de cette permission pour accéder au service. Une permission va être créée automatiquement votre propre communauté.",
    share_with_value_change_warning_title: "Changement de restrictions d'accès",
    share_with_value_change_warning_desc:
        // eslint-disable-next-line quotes
        'Vous êtes sur le point de modifier les restrictions d\'accès de "Restreint" à "Tout public". Vous allez donc perdre les permissions créées sur ce service définitivement.',
};

export const AccessRestrictionsEnTranslations: Translations<"en">["AccessRestrictions"] = {
    title: undefined,
    share_with: undefined,
    share_with_all_public: undefined,
    share_with_all_public_hint_text: undefined,
    share_with_your_community: undefined,
    share_with_your_community_hint_text: undefined,
    share_with_value_change_warning_title: undefined,
    share_with_value_change_warning_desc: undefined,
};
