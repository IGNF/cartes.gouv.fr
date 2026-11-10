import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { type UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { type Metadata } from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import api from "@/entrepot/api";
import useCommunityRights from "@/hooks/useCommunityRights";
import { useTranslation } from "@/i18n/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import MetadataForm from "../../forms/MetadataForm";
import { buildMetadataFormData, mapMetadataToFormValues, type MetadataValues } from "../../forms/metadataSchema";

type DescriptionTabProps = {
    datastoreId: string;
    datasheetName: string;
    metadataQuery: UseQueryResult<Metadata, ApiError>;
};

export default function DescriptionTab({ datastoreId, datasheetName, metadataQuery }: DescriptionTabProps) {
    const { t } = useTranslation("DescriptionTab");
    const queryClient = useQueryClient();
    // incrémenté à chaque enregistrement : le formulaire repart des valeurs enregistrées, pas d’un simple rechargement de la requête
    const [savedVersion, setSavedVersion] = useState(0);
    const { userRights, isSupervisor } = useCommunityRights();
    // fiche de métadonnées = publication (BROADCAST), vignette = annexe (ANNEX)
    const canEdit = isSupervisor || (userRights?.includes(CommunityMemberDtoRightsEnum.BROADCAST) && userRights.includes(CommunityMemberDtoRightsEnum.ANNEX));

    const replaceMutation = useMutation({
        mutationFn: (values: MetadataValues) => api.datasheet.replace(datastoreId, datasheetName, buildMetadataFormData(values)),
        onSuccess: (metadata) => {
            queryClient.setQueryData(RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName), metadata);
            setSavedVersion((version) => version + 1);
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_list(datastoreId) });
        },
    });

    // fiche sans fiche de métadonnées (404) : le formulaire part vide et l’enregistrement la crée
    if (metadataQuery.isPending && metadataQuery.fetchStatus !== "idle") {
        return null;
    }
    // erreur autre que 404 : un formulaire vide ferait écraser la fiche de métadonnées existante
    if (metadataQuery.isError && metadataQuery.error.status !== 404) {
        return <Alert severity="error" description={getApiErrorMessage(metadataQuery.error)} small />;
    }
    const csw = metadataQuery.data?.csw_metadata;

    return (
        <>
            {!canEdit && <Alert className={fr.cx("fr-mb-4w")} severity="info" description={t("read_only")} small />}
            {replaceMutation.isError && (
                <Alert className={fr.cx("fr-mb-4w")} severity="error" title={t("error_title")} description={getApiErrorMessage(replaceMutation.error)} small />
            )}
            {replaceMutation.isSuccess && <Alert className={fr.cx("fr-mb-4w")} severity="success" description={t("saved")} small closable />}

            <MetadataForm
                key={savedVersion}
                datastoreId={datastoreId}
                mode="edit"
                disabled={!canEdit}
                defaultValues={mapMetadataToFormValues(csw, datasheetName)}
                existingThumbnailUrl={csw?.thumbnail_url}
                fileIdentifierLocked={!!csw?.file_identifier}
                onSubmit={(values) => replaceMutation.mutateAsync(values)}
                renderTopActions={({ isSubmitting }) =>
                    canEdit && (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mb-5w")}>
                            <Button type="submit" priority="secondary" disabled={isSubmitting}>
                                {isSubmitting ? t("saving") : t("save")}
                            </Button>
                        </div>
                    )
                }
            />
        </>
    );
}
