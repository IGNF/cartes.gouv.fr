import { fr } from "@codegouvfr/react-dsfr";
import { FC, useMemo } from "react";
import { catalogueUrl } from "../../router/router";
import { useQuery } from "@tanstack/react-query";
import { GeonetworkMetadataResponse } from "../../@types/app";
import { Translations, declareComponentKeys, useTranslation } from "../../i18n/i18n";
import RQKeys from "../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../modules/jsonFetch";
import api from "../api";
import LoadingText from "../../components/Utils/LoadingText";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { routes } from "../../router/router";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Badge from "@codegouvfr/react-dsfr/Badge";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";

type AskForAccesses = {
    fileIdentifier: string;
};

const AskForAccesses: FC<AskForAccesses> = ({ fileIdentifier }) => {
    const { t } = useTranslation({ AskForAccesses });
    const { t: tCommon } = useTranslation("Common");

    const query = useQuery<GeonetworkMetadataResponse, CartesApiException>({
        queryKey: RQKeys.ask_for_accesses(fileIdentifier),
        queryFn: ({ signal }) => api.geonetwork.getMetadataInfos(fileIdentifier, { signal }),
        staleTime: 3600000,
    });

    const url = useMemo(() => `${catalogueUrl}/dataset/${fileIdentifier}`, [fileIdentifier]);
    const emailContact = useMemo(() => query.data?.contact_email, [query]);

    const schema = yup.object({
        layers: yup.array().of(yup.string()).min(1, t("min_layers_error")).required(),
    });

    // Formulaire
    const {
        register,
        getValues: getFormValues,
        formState: { errors },
        handleSubmit,
    } = useForm({ mode: "onSubmit", defaultValues: { layers: [] }, resolver: yupResolver(schema) });

    const onSubmit = () => {
        const values = getFormValues();
        const layers = query.data?.private_layers.filter((layer) => values["layers"].includes(layer.name));
        console.log(layers);
    };

    return (
        <div className={fr.cx("fr-container", "fr-py-2w")}>
            {query.isLoading ? (
                <LoadingText />
            ) : query.error ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={query.error.message}
                    description={<Button linkProps={routes.dashboard_pro().link}>{t("back_to_dashboard")}</Button>}
                />
            ) : (
                <>
                    <h1>{t("title")}</h1>
                    {query.data?.private_layers.length ? (
                        <div>
                            {t("explain", { url: url })}
                            <Checkbox
                                legend={null}
                                options={query.data?.private_layers.map((layer) => {
                                    const label = (
                                        <span>
                                            {layer.name}
                                            {layer.endpointType && (
                                                <Badge noIcon={true} severity={"info"} className={fr.cx("fr-ml-2v")}>
                                                    {layer.endpointType}
                                                </Badge>
                                            )}
                                        </span>
                                    );
                                    return {
                                        label: label,
                                        nativeInputProps: {
                                            ...register("layers"),
                                            value: layer.name,
                                        },
                                    };
                                })}
                                state={errors.layers ? "error" : "default"}
                                stateRelatedMessage={errors?.layers?.message?.toString()}
                            />
                            <ButtonsGroup
                                buttons={[
                                    {
                                        linkProps: routes.dashboard_pro().link,
                                        children: t("back_to_dashboard"),
                                        priority: "secondary",
                                    },
                                    {
                                        children: tCommon("send"),
                                        onClick: handleSubmit(onSubmit),
                                    },
                                ]}
                                inlineLayoutWhen="always"
                                alignment="right"
                                className={fr.cx("fr-mt-2w")}
                            />
                        </div>
                    ) : (
                        <div>
                            <p>{t("explain_no_access")}</p>
                            <Button linkProps={routes.dashboard_pro().link}>{t("back_to_dashboard")}</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AskForAccesses;

// traductions
export const { i18n } = declareComponentKeys<
    "title" | { K: "explain"; P: { url: string }; R: JSX.Element } | "explain_no_access" | "back_to_dashboard" | "min_layers_error"
>()({
    AskForAccesses,
});

export const AskForAccessesFrTranslations: Translations<"fr">["AskForAccesses"] = {
    title: "Demande d'accès",
    explain: ({ url }) => (
        <p>
            Vous souhaitez demander au producteur des données décrites sur cette <a href={url}>fiche du catalogue</a> un accès aux services de diffusion de
            données dont l&apos;accès est restreint. Sélectionnez les couches de données et types de services auxquels vous souhaitez accéder : (sélectionner au
            moins une couche)
        </p>
    ),
    explain_no_access: "Cette fiche ne décrit aucun service de diffusion dont l'accès est restreint. Vous avez déjà accès à toutes les données décrites.",
    back_to_dashboard: "Tableau de bord",
    min_layers_error: "Vous devez sélectionner au moins une couche",
};

export const AskForAccessesEnTranslations: Translations<"en">["AskForAccesses"] = {
    title: undefined,
    explain: undefined,
    explain_no_access: undefined,
    back_to_dashboard: undefined,
    min_layers_error: undefined,
};
