import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { symToStr } from "tsafe/symToStr";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import RQKeys from "../../../modules/RQKeys";
import { type CartesApiException } from "../../../modules/jsonFetch";
import { routes, useRoute } from "../../../router/router";
import { Datasheet, type DatasheetDetailed } from "../../../types/app";
import DatasetListTab from "./DatasetListTab/DatasetListTab";
import ServicesListTab from "./ServiceListTab/ServicesListTab";
import path from "../../../functions/path";

import "../../../sass/components/spinner.scss";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { useForm } from "react-hook-form";
import { AnnexDetailResponseDto } from "../../../types/entrepot";

const deleteDataConfirmModal = createModal({
    id: "delete-data-confirm-modal",
    isOpenedByDefault: false,
});

const addThumbnailModal = createModal({
    id: "add-thumbnail-modal",
    isOpenedByDefault: false,
});

type DatasheetViewProps = {
    datastoreId: string;
    datasheetName: string;
};

const defaultImgUrl = "//www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png";

const schema = yup.object().shape({
    file: yup
        .mixed()
        .test("required", "Aucun fichier n'a été choisi", (files) => {
            const file = files?.[0] ?? undefined;
            return file !== undefined;
        })
        .required("Aucun fichier n'a été choisi")
        .test("check-file-size", "La taille du fichier ne peut excéder 2 Mo", (files) => {
            const file = files?.[0] ?? undefined;

            if (file instanceof File) {
                const size = file.size / 1024 / 1024;
                return size < 2;
            }
            return true;
        })
        .test("check-file-type", "Le fichier doit être au format jpeg ou png", (files) => {
            const file = files?.[0] ?? undefined;
            if (file) {
                const extension = path.getFileExtension(file.name);
                if (!extension) {
                    return false;
                }
                return ["jpg", "jpeg", "png"].includes(extension);
            }
            return true;
        }),
});

const DatasheetView: FC<DatasheetViewProps> = ({ datastoreId, datasheetName }) => {
    // Boite modale, gestion de l'image
    const [modalImageUrl, setModalImageUrl] = useState<string>("");

    const route = useRoute();
    const queryClient = useQueryClient();

    const datasheetDeleteMutation = useMutation({
        mutationFn: () => api.datasheet.remove(datastoreId, datasheetName),
        onSuccess() {
            queryClient.setQueryData<Datasheet[]>(RQKeys.datastore_datasheet_list(datastoreId), (datasheetList = []) => {
                return datasheetList.filter((datasheet) => datasheet.name !== datasheetName);
            });

            routes.datasheet_list({ datastoreId }).push();
        },
    });

    const thumbnailMutation = useMutation<AnnexDetailResponseDto & { url: string }, CartesApiException>({
        mutationFn: () => {
            const form = new FormData();
            form.append("datasheetName", datasheetName);
            form.append("file", upload);
            return api.annexe.addThumbnail(datastoreId, form);
        },
        onSuccess: () => {
            addThumbnailModal.close();
        },
        onSettled: () => {
            reset();
        },
    });

    const datasheetQuery = useQuery<DatasheetDetailed, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 20000,
        refetchInterval: 20000,
        retry: false,
        enabled: !datasheetDeleteMutation.isPending,
    });

    // Url de la vignette
    const thumbnailUrl = datasheetQuery?.data?.thumbnail?.url;

    const {
        register,
        formState: { errors },
        watch,
        resetField,
        handleSubmit,
    } = useForm({ resolver: yupResolver(schema), mode: "onChange" });

    const upload: File = watch("file")?.[0];
    useEffect(() => {
        if (upload !== undefined) {
            const reader = new FileReader();
            reader.onload = () => {
                setModalImageUrl(reader.result as string);
            };
            reader.readAsDataURL(upload);
        }
    }, [upload]);

    const handleChooseThumbnail = () => {
        addThumbnailModal.open();
    };

    const reset = () => {
        resetField("file");
        setModalImageUrl("");
    };

    const onSubmit = async () => {
        if (upload) {
            // Ajout dans les annexes
            thumbnailMutation.mutate();
        }
    };

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={`Données ${datasheetName}`}>
            {datasheetQuery.isLoading ? (
                <LoadingText />
            ) : datasheetQuery.error ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={datasheetQuery.error.message}
                    description={<Button linkProps={routes.datasheet_list({ datastoreId }).link}>Retour à mes données</Button>}
                />
            ) : (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                        <Button
                            iconId="fr-icon-arrow-left-s-line"
                            priority="tertiary no outline"
                            linkProps={routes.datasheet_list({ datastoreId }).link}
                            title="Retour à la liste de mes données"
                        />
                        {datasheetName}
                        <Badge noIcon={true} severity="info" className={fr.cx("fr-ml-2w")}>
                            {datasheetQuery?.data?.nb_publications && datasheetQuery?.data?.nb_publications > 0 ? "Publié" : "Non Publié"}
                        </Badge>
                    </div>

                    <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                        <div className={fr.cx("fr-col-2")}>
                            <Button priority="tertiary no outline" onClick={handleChooseThumbnail}>
                                <img src={thumbnailUrl ?? defaultImgUrl} width="128px" height="128px" />
                            </Button>
                        </div>
                        <div className={fr.cx("fr-col")}>
                            {/* TODO : désactivé car on n'a pas ces infos */}
                            <p className={fr.cx("fr-mb-2v")}>{/* <strong>Création de la fiche de données : </strong>13 Mar. 2023 */}</p>
                            <p className={fr.cx("fr-mb-2v")}>{/* <strong>Mise à jour : </strong>17 Mar. 2023 */}</p>
                        </div>
                        <div className={fr.cx("fr-col-3")}>
                            <ButtonsGroup
                                buttons={[
                                    {
                                        children: "Supprimer la donnée",
                                        onClick: () => deleteDataConfirmModal.open(),
                                        iconId: "fr-icon-delete-fill",
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <div className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col")}>
                            <Tabs
                                tabs={[
                                    {
                                        label: "Métadonnées (0)",
                                        isDefault: route.params["activeTab"] === "metadata",
                                        content: <p>...liste de métadonnées...</p>,
                                    },
                                    {
                                        label: `Jeux de données (${datasheetQuery?.data?.vector_db_list?.length || 0})`,
                                        isDefault: route.params["activeTab"] === "dataset",
                                        content: <DatasetListTab datastoreId={datastoreId} datasheet={datasheetQuery?.data} />,
                                    },
                                    {
                                        label: `Services (${datasheetQuery?.data?.service_list?.length || 0})`,
                                        isDefault: route.params["activeTab"] === "services",
                                        content: <ServicesListTab datastoreId={datastoreId} datasheet={datasheetQuery?.data} />,
                                    },
                                ]}
                                onTabChange={({ tabIndex }) => {
                                    let activeTab = "dataset";
                                    switch (tabIndex) {
                                        case 0:
                                            activeTab = "metadata";
                                            break;
                                        case 1:
                                            activeTab = "dataset";
                                            break;
                                        case 2:
                                            activeTab = "services";
                                            break;
                                    }
                                    routes.datastore_datasheet_view({ datastoreId, datasheetName, activeTab }).push();
                                }}
                            />
                        </div>
                    </div>
                </>
            )}

            {datasheetDeleteMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " icons-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>En cours de suppression</h6>
                        </div>
                    </div>
                </Wait>
            )}

            <>
                {createPortal(
                    <addThumbnailModal.Component
                        title={"Choisir la vignette"}
                        buttons={[
                            {
                                children: "Annuler",
                                onClick: () => {
                                    reset();
                                    thumbnailMutation.reset();
                                },
                                doClosesModal: true,
                                priority: "secondary",
                            },
                            {
                                children: "Téléverser la vignette",
                                onClick: handleSubmit(onSubmit),
                                doClosesModal: false,
                                priority: "primary",
                            },
                        ]}
                    >
                        {thumbnailMutation.isError && (
                            <Alert
                                severity="error"
                                closable
                                title="Une erreur est survenue"
                                description={thumbnailMutation.error.message}
                                className={fr.cx("fr-my-3w")}
                            />
                        )}
                        <div className={fr.cx("fr-grid-row")}>
                            <div className={fr.cx("fr-col-9")}>
                                <Upload
                                    label={""}
                                    hint={"Taille maximale : 2 Mo. Formats supportés : jpg, png"}
                                    state={errors.file ? "error" : "default"}
                                    stateRelatedMessage={errors?.file?.message}
                                    nativeInputProps={{
                                        ...register("file"),
                                        accept: ".png, .jpg, .jpeg",
                                    }}
                                />
                            </div>
                            <div className={fr.cx("fr-col-3")}>
                                <img src={modalImageUrl ?? defaultImgUrl} width="128px" />
                            </div>
                        </div>
                        {thumbnailMutation.isPending && (
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " icons-spin"} />
                                <h6 className={fr.cx("fr-m-0")}>Ajout de la vignette en cours</h6>
                            </div>
                        )}
                    </addThumbnailModal.Component>,
                    document.body
                )}
                {createPortal(
                    <deleteDataConfirmModal.Component
                        title={`Êtes-vous sûr de supprimer la fiche de données ${datasheetName} ?`}
                        buttons={[
                            {
                                children: "Annuler",
                                doClosesModal: true,
                                priority: "secondary",
                            },
                            {
                                children: "Ajouter",
                                onClick: () => thumbnailMutation.mutate(),
                                doClosesModal: false,
                                priority: "primary",
                            },
                        ]}
                    >
                        <strong>Les éléments suivants seront supprimés :</strong>
                        <ul>
                            {datasheetQuery?.data?.vector_db_list?.length && datasheetQuery?.data?.vector_db_list.length > 0 ? (
                                <li> {datasheetQuery?.data?.vector_db_list.length} base(s) de données</li>
                            ) : null}
                            {datasheetQuery?.data?.service_list?.length && datasheetQuery?.data?.service_list.length > 0 ? (
                                <li> {datasheetQuery?.data?.service_list.length} service(s) publié(s)</li>
                            ) : null}
                            {datasheetQuery?.data?.upload_list?.length && datasheetQuery?.data?.upload_list.length > 0 ? (
                                <li> {datasheetQuery?.data?.upload_list.length} livraison(s)</li>
                            ) : null}

                            {/* TODO : pyramides tuiles vectorielles, raster, métadonnées etc... */}
                        </ul>
                    </deleteDataConfirmModal.Component>,
                    document.body
                )}
            </>
        </DatastoreLayout>
    );
};

DatasheetView.displayName = symToStr({ DatasheetView });

export default DatasheetView;
