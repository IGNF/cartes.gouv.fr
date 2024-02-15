import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, memo, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { symToStr } from "tsafe/symToStr";

import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import api from "../../../../../api";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../components/Utils/LoadingText";
import MenuList from "../../../../../components/Utils/MenuList";
import StoredDataStatusBadge from "../../../../../components/Utils/Badges/StoredDataStatusBadge";
import Wait from "../../../../../components/Utils/Wait";
import functions from "../../../../../functions";
import useToggle from "../../../../../hooks/useToggle";
import { Translations, declareComponentKeys, getTranslation, useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/RQKeys";
import { routes } from "../../../../../router/router";
import { DatastoreEndpoint, StoredDataStatusEnum, VectorDb } from "../../../../../types/app";
import { offeringTypeDisplayName } from "../../../../../utils";
import VectorDbDesc from "./VectorDbDesc";

type ServiceTypes = "tms" | "wfs" | "wms-vector" | "pre-paquet";

type VectorDbListItemProps = {
    datasheetName?: string;
    datastoreId: string;
    vectorDb: VectorDb;
};

const { t: tCommon } = getTranslation("Common");

const VectorDbListItem: FC<VectorDbListItemProps> = ({ datasheetName, datastoreId, vectorDb }) => {
    const { t } = useTranslation({ VectorDbListItem });

    // création d'un service
    const [serviceType, setServiceType] = useState<ServiceTypes>();

    const [technicalName, setTechnicalName] = useState<string>(vectorDb.name);
    const [technicalNameError, setTechnicalNameError] = useState<string>();

    const endpointsQuery = useQuery<DatastoreEndpoint[]>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: ({ signal }) => api.datastore.getEndpoints(datastoreId, {}, { signal }),
        retry: false,
        staleTime: 3600000,
    });

    const dataUsesQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data_uses(datastoreId, vectorDb._id),
        queryFn: ({ signal }) => api.storedData.getUses(datastoreId, vectorDb._id, { signal }),
        staleTime: 600000,
    });

    const { wfsEndpoints, wmsVectorEndpoints, tmsEndpoints } = useMemo(() => {
        const wfsEndpoints = Array.isArray(endpointsQuery?.data)
            ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WFS")
            : [];
        const wmsVectorEndpoints = Array.isArray(endpointsQuery?.data)
            ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WMS-VECTOR")
            : [];
        const tmsEndpoints = Array.isArray(endpointsQuery?.data)
            ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WMTS-TMS")
            : [];

        return { wfsEndpoints, wmsVectorEndpoints, tmsEndpoints };
    }, [endpointsQuery.data]);

    /* Suppression de la base de donnees */
    const queryClient = useQueryClient();

    const deleteVectorDbMutation = useMutation({
        mutationFn: () => api.storedData.remove(datastoreId, vectorDb._id),
        onSuccess() {
            if (datasheetName) {
                queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            }
        },
    });

    const handleCreateService = () => {
        switch (serviceType) {
            case "wfs":
                routes.datastore_wfs_service_new({ datastoreId, vectorDbId: vectorDb._id }).push();
                break;

            case "wms-vector":
                routes.datastore_wms_vector_service_new({ datastoreId, vectorDbId: vectorDb._id }).push();
                break;

            case "tms":
                if (!technicalName) {
                    return;
                }
                routes.datastore_pyramid_vector_new({ datastoreId, vectorDbId: vectorDb._id, technicalName }).push();
                break;

            default:
                console.warn("Action non implémentée");
                break;
        }
    };

    const serviceTypeChoiceModal = useMemo(
        () =>
            createModal({
                id: `service-type-choice-modal-vectordb-${vectorDb._id}`,
                isOpenedByDefault: false,
            }),
        [vectorDb._id]
    );

    const confirmRemoveVectorDbModal = useMemo(
        () =>
            createModal({
                id: `confirm-delete-vectordb-${vectorDb._id}`,
                isOpenedByDefault: false,
            }),
        [vectorDb._id]
    );

    // description de vectordb
    const [showDescription, toggleShowDescription] = useToggle(false);

    return (
        <>
            <div className={fr.cx("fr-p-2v", "fr-mt-2v")} style={{ backgroundColor: fr.colors.decisions.background.contrast.grey.default }}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                    <div className={fr.cx("fr-col")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <Button
                                iconId={showDescription ? "ri-subtract-fill" : "ri-add-fill"}
                                size="small"
                                title={t("show_linked_datas")}
                                className={fr.cx("fr-mr-2v")}
                                priority="secondary"
                                onClick={toggleShowDescription}
                            />
                            {vectorDb.name}
                        </div>
                    </div>

                    <div className={fr.cx("fr-col")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                            <p className={fr.cx("fr-m-auto", "fr-mr-2v")}>{vectorDb?.last_event?.date && functions.date.format(vectorDb?.last_event?.date)}</p>
                            <StoredDataStatusBadge status={vectorDb.status} />
                            <Button
                                onClick={() => {
                                    serviceTypeChoiceModal.open();
                                }}
                                className={fr.cx("fr-mr-2v")}
                                priority="secondary"
                                disabled={vectorDb.status !== StoredDataStatusEnum.GENERATED}
                            >
                                {t("create_service")}
                            </Button>
                            <MenuList
                                menuOpenButtonProps={{
                                    title: t("other_actions"),
                                    priority: "secondary",
                                }}
                                items={[
                                    {
                                        text: t("replace_datas"),
                                        iconId: "fr-icon-refresh-line",
                                        onClick: () => console.warn("Action non implémentée"),
                                        disabled: vectorDb.status !== StoredDataStatusEnum.GENERATED,
                                    },
                                    {
                                        text: t("show_details"),
                                        iconId: "fr-icon-file-text-fill",
                                        linkProps: routes.datastore_stored_data_report({ datastoreId, storedDataId: vectorDb._id }).link,
                                    },
                                    {
                                        text: tCommon("delete"),
                                        iconId: "fr-icon-delete-line",
                                        onClick: () => confirmRemoveVectorDbModal.open(),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>
                {showDescription && <VectorDbDesc dataUsesQuery={dataUsesQuery} />}
            </div>
            {deleteVectorDbMutation.error && (
                <Alert
                    title={t("error_deleting", { dbname: vectorDb.name })}
                    closable
                    description={deleteVectorDbMutation.error.message}
                    as="h2"
                    severity="error"
                />
            )}
            {deleteVectorDbMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <LoadingIcon className={fr.cx("fr-mr-2v")} />
                            <h6 className={fr.cx("fr-m-0")}>{tCommon("removing")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
            {createPortal(
                <serviceTypeChoiceModal.Component
                    title={t("define_service")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            doClosesModal: true,
                            priority: "secondary",
                        },
                        {
                            children: tCommon("continue"),
                            onClick: handleCreateService,
                            doClosesModal: true,
                            priority: "primary",
                        },
                    ]}
                    concealingBackdrop={false}
                >
                    <RadioButtons
                        options={[
                            {
                                label: "Tile Map Service (TMS)",
                                hintText: t("tms_hint_text"),
                                nativeInputProps: {
                                    checked: serviceType === "tms",
                                    onChange: () => setServiceType("tms"),
                                    disabled: tmsEndpoints?.length === 0,
                                },
                            },
                            {
                                label: "Web Feature Service (WFS)",
                                hintText: t("wfs_hint_text"),
                                nativeInputProps: {
                                    checked: serviceType === "wfs",
                                    onChange: () => setServiceType("wfs"),
                                    disabled: wfsEndpoints?.length === 0,
                                },
                            },
                            {
                                label: "Web Map Service (WMS-Vecteur)",
                                hintText: t("wms_hint_text"),
                                nativeInputProps: {
                                    checked: serviceType === "wms-vector",
                                    onChange: () => setServiceType("wms-vector"),
                                    disabled: wmsVectorEndpoints?.length === 0,
                                },
                            },
                            {
                                label: t("prepaquet_label"),
                                hintText: t("prepaquet_hint_text"),
                                nativeInputProps: {
                                    checked: serviceType === "pre-paquet",
                                    onChange: () => setServiceType("pre-paquet"),
                                    disabled: true, // TODO : temporaire
                                },
                            },
                        ]}
                    />
                    {serviceType && serviceType === "tms" && (
                        <Input
                            label={t("tile_technical_name")}
                            hintText={t("tile_technical_name_hint_text")}
                            nativeInputProps={{
                                defaultValue: technicalName,
                                onChange: (e) => {
                                    setTechnicalName(e.currentTarget.value ?? undefined);
                                    setTechnicalNameError(e.currentTarget.value ? undefined : t("technical_name_is_mandatory"));
                                },
                            }}
                            state={technicalNameError ? "error" : "default"}
                            stateRelatedMessage={technicalNameError ?? undefined}
                        />
                    )}
                </serviceTypeChoiceModal.Component>,
                document.body
            )}
            {createPortal(
                <confirmRemoveVectorDbModal.Component
                    title={t("confirm_delete_modal.title", { dbname: vectorDb.name })}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            onClick: () => deleteVectorDbMutation.mutate(),
                            priority: "primary",
                        },
                    ]}
                >
                    {dataUsesQuery.isFetching && <LoadingText withSpinnerIcon={true} />}
                    {dataUsesQuery.data?.offerings_list && dataUsesQuery.data?.offerings_list?.length > 0 && (
                        <div className={fr.cx("fr-grid-row", "fr-mt-2v", "fr-p-2v")}>
                            <p className={fr.cx("fr-h6")}>{t("following_services_deleted")}</p>
                            <div className={fr.cx("fr-col")}>
                                <ul className={fr.cx("fr-raw-list")}>
                                    {dataUsesQuery.data?.offerings_list.map((offering, i) => (
                                        <li
                                            key={offering._id}
                                            className={fr.cx(i + 1 !== dataUsesQuery.data?.offerings_list.length && "fr-mb-2v", "fr-text--xs")}
                                        >
                                            {offering.layer_name}
                                            <Badge className={fr.cx("fr-ml-1v", "fr-text--xs")}>{offeringTypeDisplayName(offering.type)}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </confirmRemoveVectorDbModal.Component>,
                document.body
            )}
        </>
    );
};

VectorDbListItem.displayName = symToStr({ VectorDbListItem });

export default memo(VectorDbListItem);

// traductions
export const { i18n } = declareComponentKeys<
    | "create_service"
    | "define_service"
    | "show_linked_datas"
    | "other_actions"
    | "replace_datas"
    | "show_details"
    | "tms_hint_text"
    | "wfs_hint_text"
    | "wms_hint_text"
    | "prepaquet_label"
    | "prepaquet_hint_text"
    | "tile_technical_name"
    | "tile_technical_name_hint_text"
    | "technical_name_is_mandatory"
    | { K: "confirm_delete_modal.title"; P: { dbname: string }; R: string }
    | "following_services_deleted"
    | { K: "error_deleting"; P: { dbname: string }; R: string }
>()({
    VectorDbListItem,
});

export const VectorDbListItemFrTranslations: Translations<"fr">["VectorDbListItem"] = {
    create_service: "Créer un service",
    define_service: "Définissez le service à créer",
    show_linked_datas: "Voir les données liées",
    other_actions: "Autres actions",
    replace_datas: "Remplacer les données",
    show_details: "Voir les détails",
    tms_hint_text: "Dans une première étape  vous allez créer une pyramide de tuiles vectorielles que vous devrez ensuite publier",
    wfs_hint_text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, dolore unde! Autem eos nam fugiat!",
    wms_hint_text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, dolore unde! Autem eos nam fugiat!",
    prepaquet_label: "Fichier pré-paquets",
    prepaquet_hint_text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, dolore unde! Autem eos nam fugiat!",
    tile_technical_name: "Nom technique de la pyramide de tuiles vectorielles",
    tile_technical_name_hint_text:
        "II s'agit du nom technique du service qui apparaitra dans votre espace de travail, il ne sera pas publié en ligne. Si vous le renommez, choisissez un nom explicite.",
    technical_name_is_mandatory: "Le nom technique est obligatoire",
    "confirm_delete_modal.title": ({ dbname }) => `Êtes-vous sûr de vouloir supprimer la base de données ${dbname} ?`,
    following_services_deleted: "Les services suivants seront aussi supprimés :",
    error_deleting: ({ dbname }) => `La suppression de la base de données ${dbname} a échoué`,
};

export const VectorDbListItemEnTranslations: Translations<"en">["VectorDbListItem"] = {
    create_service: "Create service",
    define_service: "Define service to create",
    show_linked_datas: "Show linked datas",
    other_actions: "Other actions",
    replace_datas: "Replace datas",
    show_details: "Show details",
    tms_hint_text: "In a first step you will create a pyramid of vector tiles which you will then have to publish",
    wfs_hint_text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, dolore unde! Autem eos nam fugiat!",
    wms_hint_text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, dolore unde! Autem eos nam fugiat!",
    prepaquet_label: "[TODO]",
    prepaquet_hint_text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, dolore unde! Autem eos nam fugiat!",
    tile_technical_name: "Technical name of vector tile pyramid [TODO]",
    tile_technical_name_hint_text:
        "This is the technical name of the service which will appear in your workspace, it will not be published online. If you rename it, choose a meaningful name. [TODO]",
    technical_name_is_mandatory: "Technical name is mandatory",
    "confirm_delete_modal.title": ({ dbname }) => `Are you sure you want to delete database ${dbname} ?`,
    following_services_deleted: "The following services will be deleted :",
    error_deleting: ({ dbname }) => `Deleting ${dbname} database failed`,
};
