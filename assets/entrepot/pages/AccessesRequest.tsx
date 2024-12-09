import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { ComponentProps, FC, ReactNode, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import type { GeonetworkMetadataResponse } from "../../@types/app";
import AppLayout from "../../components/Layout/AppLayout";
import LoadingText from "../../components/Utils/LoadingText";
import Wait from "../../components/Utils/Wait";
import { Translations, declareComponentKeys, useTranslation } from "../../i18n/i18n";
import SymfonyRouting from "../../modules/Routing";
import RQKeys from "../../modules/entrepot/RQKeys";
import { CartesApiException, jsonFetch } from "../../modules/jsonFetch";
import { catalogueUrl, routes } from "../../router/router";
import { useAuthStore } from "../../stores/AuthStore";
import api from "../api";

type AskForAccesses = {
    fileIdentifier: string;
};

const AccessesRequest: FC<AskForAccesses> = ({ fileIdentifier }) => {
    const { t } = useTranslation({ AccessesRequest });
    const { t: tCommon } = useTranslation("Common");

    const user = useAuthStore((state) => state.user);

    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | undefined>(undefined);

    const query = useQuery<GeonetworkMetadataResponse, CartesApiException>({
        queryKey: RQKeys.accesses_request(fileIdentifier),
        queryFn: ({ signal }) => api.geonetwork.getMetadataInfos(fileIdentifier, { signal }),
        staleTime: 3600000,
    });

    const catalogueDatasheetUrl = useMemo(() => `${catalogueUrl}/dataset/${fileIdentifier}`, [fileIdentifier]);
    const emailContact = useMemo(() => query.data?.contact_email, [query]);
    const myCommunities = useMemo(() => {
        return Array.from(user?.communities_member ?? [], (member) => member.community);
    }, [user]);

    const schema = yup.object({
        layers: yup.array().of(yup.string()).min(1, t("min_layers_error")).required(),
        myself: yup.boolean(),
        beneficiaries: yup.array().of(yup.string()).required(),
    });

    // Formulaire
    const {
        register,
        setValue,
        getValues: getFormValues,
        formState: { errors },
        watch,
        handleSubmit,
    } = useForm({ mode: "onSubmit", defaultValues: { layers: [], myself: true, beneficiaries: [] }, resolver: yupResolver(schema) });

    const myself = watch("myself");
    const beneficiaries = watch("beneficiaries"); // Les communautes beneficiaires

    const beneficiariesOptions = useMemo(() => {
        const options: {
            label: ReactNode;
            hintText?: ReactNode;
            nativeInputProps: ComponentProps<"input">;
        }[] = [];
        myCommunities.forEach((community) => {
            options.push({
                label: t("community", { name: community?.name ?? "" }),
                nativeInputProps: {
                    ...register("beneficiaries"),
                    checked: beneficiaries.includes(community?._id),
                    value: community?._id,
                },
            });
        });
        return options;
    }, [myCommunities, beneficiaries, t, register]);

    const onSubmit = () => {
        const values = getFormValues();
        const layers = query.data?.private_layers.filter((layer) => values["layers"].includes(layer.name));

        const body = {
            emailContact: emailContact,
            catalogueDatasheetUrl: catalogueDatasheetUrl,
            layers: layers,
        };

        const beneficiaries = [...values["beneficiaries"]];
        if (!beneficiaries.length) {
            body["myself"] = true;
        }

        if (beneficiaries.length > 1) {
            body["beneficiaries"] = myCommunities.filter((c) => beneficiaries.includes(c?._id));
        }

        setSendError(undefined);
        setIsSending(true);

        const url = SymfonyRouting.generate("cartesgouvfr_contact_accesses_request");
        jsonFetch<{ state: string; message?: string }>(url, { method: "POST" }, body)
            .then((response) => {
                if (response.state === "success") {
                    routes.dashboard_pro().push();
                } else setSendError(response.message);
            })
            .catch((error) => {
                setSendError(error.message);
            })
            .finally(() => setIsSending(false));
    };

    return (
        <AppLayout>
            <>
                {query.error ? (
                    <Alert
                        severity="error"
                        closable={false}
                        title={query.error.message}
                        description={<Button linkProps={routes.dashboard_pro().link}>{t("back_to_dashboard")}</Button>}
                    />
                ) : (
                    <>
                        <h1>{t("title")}</h1>
                        {query.isLoading ? (
                            <LoadingText />
                        ) : sendError !== undefined ? (
                            <Alert severity={"error"} title={tCommon("error")} description={sendError} className={fr.cx("fr-my-3w")} />
                        ) : query.data?.private_layers.length ? (
                            <div>
                                {t("explain", { url: catalogueDatasheetUrl })}
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
                                <Checkbox
                                    legend={t("beneficiaries")}
                                    hintText={t("beneficiaries_hintext")}
                                    options={[
                                        {
                                            label: t("myself"),
                                            nativeInputProps: {
                                                onChange: (e) => {
                                                    const checked = e.currentTarget.checked;
                                                    setValue("myself", checked);
                                                },
                                                checked: myself === true,
                                                value: "myself",
                                            },
                                        },
                                    ]}
                                />
                                <Checkbox legend={null} options={beneficiariesOptions} />
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
                {isSending && (
                    <Wait>
                        <div className={fr.cx("fr-container")}>
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                <div className={fr.cx("fr-col-2")}>
                                    <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " frx-icon-spin"} />
                                </div>
                                <div className={fr.cx("fr-col-10")}>
                                    <h6 className={fr.cx("fr-h6", "fr-m-0")}>{t("sending_message")}</h6>
                                </div>
                            </div>
                        </div>
                    </Wait>
                )}
            </>
        </AppLayout>
    );
};

export default AccessesRequest;

// traductions
export const { i18n } = declareComponentKeys<
    | "title"
    | { K: "explain"; P: { url: string }; R: JSX.Element }
    | "explain_no_access"
    | "back_to_dashboard"
    | "beneficiaries"
    | { K: "beneficiaries_hintext"; R: JSX.Element }
    | "myself"
    | { K: "community"; P: { name: string }; R: string }
    | "min_layers_error"
    | "sending_message"
>()({
    AccessesRequest,
});

export const AccessesRequestFrTranslations: Translations<"fr">["AccessesRequest"] = {
    title: "Demande d’accès",
    explain: ({ url }) => (
        <p>
            Vous souhaitez demander au producteur des données décrites sur cette <a href={url}>fiche du catalogue</a> un accès aux services de diffusion de
            données dont l&apos;accès est restreint. Sélectionnez les couches de données et types de services auxquels vous souhaitez accéder : (sélectionner au
            moins une couche)
        </p>
    ),
    explain_no_access: "Cette fiche ne décrit aucun service de diffusion dont l’accès est restreint. Vous avez déjà accès à toutes les données décrites.",
    back_to_dashboard: "Retour au tableau de bord",
    beneficiaries: "Bénéficiaires",
    beneficiaries_hintext: (
        <span>
            Vous pouvez demander au producteur des données de vous accorder une permission d&apos;accès personnelle ou
            <br />
            demander qu&apos;il accorde cette permission à tous les membres d&apos;une communauté à laquelle vous appartenez.
        </span>
    ),
    myself: "Moi-même",
    community: ({ name }) => `La communauté ${name}`,
    min_layers_error: "Vous devez sélectionner au moins une couche",
    sending_message: "Votre message est en cours d’envoi ...",
};

export const AccessesRequestEnTranslations: Translations<"en">["AccessesRequest"] = {
    title: undefined,
    explain: undefined,
    explain_no_access: undefined,
    back_to_dashboard: undefined,
    beneficiaries: "Bénéficiaries",
    beneficiaries_hintext: undefined,
    myself: "Myself",
    community: ({ name }) => `Community ${name}`,
    min_layers_error: undefined,
    sending_message: undefined,
};
