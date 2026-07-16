import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { DatasheetDetailed, Metadata } from "@/@types/app";
import LoadingIcon from "@/components/Utils/LoadingIcon";
import LoadingText from "@/components/Utils/LoadingText";
import ServiceFormErrors from "@/components/Utils/ServiceFormErrors";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import MetadataForm from "../../forms/MetadataForm";
import { buildMetadataPayload, mapMetadataToFormValues, MetadataFormValues, MetadataPayload } from "../../forms/metadataSchema";

type DescriptionTabProps = {
    datastoreId: string;
    datasheetName: string;
};

export default function DescriptionTab({ datastoreId, datasheetName }: DescriptionTabProps) {
    const { t: tCommon } = useTranslation("Common");

    const queryClient = useQueryClient();

    // Récupération des métadonnées existantes — dédupliquée par React Query avec la query
    // identique du composant parent (même clé → une seule requête réseau).
    const metadataQuery = useQuery<Metadata, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });

    // Récupération de la fiche pour accéder à l'annexe vignette (URL + id nécessaire pour la suppression).
    // La query est dédupliquée avec celle du composant parent (même clé, staleTime identique).
    const datasheetQuery = useQuery<DatasheetDetailed, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });

    const existingThumbnail = datasheetQuery.data?.thumbnail;

    // Mise à jour des métadonnées (formulaire d'édition).
    const editMutation = useMutation<MetadataPayload, CartesApiException, MetadataFormValues>({
        mutationFn: async (values) => {
            const payload = buildMetadataPayload(values);

            // Étape 1 : mise à jour des métadonnées JSON (validation backend via MapRequestPayload)
            const result = await api.datasheet.editMetadata(datastoreId, datasheetName, payload);

            // Étape 2 : mise à jour de la vignette selon l'action de l'utilisateur
            if (values.thumbnail instanceof File) {
                // Nouveau fichier recadré → envoi vers l'API
                const formData = new FormData();
                formData.append("datasheetName", datasheetName);
                formData.append("file", values.thumbnail);
                await api.annexe.addThumbnail(datastoreId, formData);
            } else if (values.thumbnail === null && existingThumbnail?._id) {
                // null = l'utilisateur a supprimé la vignette existante
                await api.annexe.removeThumbnail(datastoreId, datasheetName, existingThumbnail._id);
            }

            // TODO: Étape 3 (future) : mise à jour des logos producteur via api.annexe.add
            //       Aucun endpoint Entrepôt n'existe encore pour les logos organismes.

            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName) });
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
        },
    });

    // Valeurs initiales calculées à partir de la métadonnée API.
    // `mapMetadataToFormValues` gère la migration incrémentale : les champs nouveaux
    // absents des métadonnées existantes utilisent les valeurs par défaut.
    const editDefaultValues = useMemo(() => mapMetadataToFormValues(metadataQuery.data), [metadataQuery.data]);

    // On attend la résolution de la requête avant de monter le formulaire pour
    // garantir que `defaultValues` est correct dès le premier rendu de useForm.
    // En cas de 404 (pas encore de métadonnée), mapMetadataToFormValues(undefined)
    // retombe sur defaultMetadataValues → formulaire éditable vierge.
    if (metadataQuery.isLoading) {
        return <LoadingText withSpinnerIcon={true} as="p" />;
    }

    return (
        <>
            {editMutation.isError && (
                <Alert
                    className={fr.cx("fr-mb-2w")}
                    severity="error"
                    title="Erreur lors de la sauvegarde"
                    description={<ServiceFormErrors message={editMutation.error.message} />}
                    closable={false}
                />
            )}
            {/* Debug */}
            <span>Debug, à supprimer</span>
            <Button
                className={fr.cx("fr-mr-2v")}
                onClick={() => {
                    if (metadataQuery.data?._id !== undefined) {
                        // Onglet ouvert de façon synchrone (sinon bloqué par l'anti-popup), rempli après le fetch
                        const tab = window.open("about:blank", "_blank");
                        api.metadata
                            .getFileContent(datastoreId, metadataQuery.data._id)
                            .then(async (content) => {
                                const text = await content.text();
                                const url = URL.createObjectURL(new Blob([text], { type: "application/xml" }));
                                if (tab) {
                                    tab.location.href = url;
                                }
                                setTimeout(() => URL.revokeObjectURL(url), 60000);
                            })
                            .catch((err) => {
                                tab?.close();
                                console.error("Erreur lors de la récupération du contenu XML :", err);
                            });
                    }
                }}
            >
                Voir XML publié
            </Button>
            <MetadataForm
                mode="edit"
                defaultValues={editDefaultValues}
                existingThumbnailUrl={existingThumbnail?.url}
                onSubmit={async (values) => {
                    await editMutation.mutateAsync(values);
                }}
                renderTopActions={({ isSubmitting }) => (
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mb-4w")}>
                        <Button priority="secondary" type="submit" disabled={isSubmitting}>
                            Enregistrer
                        </Button>
                    </div>
                )}
            />

            {editMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <LoadingIcon />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{tCommon("modifying")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
}
