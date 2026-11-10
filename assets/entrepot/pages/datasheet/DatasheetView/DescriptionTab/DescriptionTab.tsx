import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { type UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query";

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
    const { userRights, isSupervisor } = useCommunityRights();
    // fiche de métadonnées = publication (BROADCAST), vignette = annexe (ANNEX)
    const canEdit = isSupervisor || (userRights?.includes(CommunityMemberDtoRightsEnum.BROADCAST) && userRights.includes(CommunityMemberDtoRightsEnum.ANNEX));

    const replaceMutation = useMutation({
        mutationFn: (values: MetadataValues) => api.datasheet.replace(datastoreId, datasheetName, buildMetadataFormData(values)),
        onSuccess: (metadata) => {
            queryClient.setQueryData(RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName), metadata);
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_list(datastoreId) });
        },
    });

    // fiche sans fiche de métadonnées (404) : le formulaire part vide et l’enregistrement la crée
    if (metadataQuery.isPending && metadataQuery.fetchStatus !== "idle") {
        return null;
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
                // remonté après un enregistrement : les valeurs enregistrées deviennent l’état initial
                key={metadataQuery.dataUpdatedAt}
                datastoreId={datastoreId}
                mode="edit"
                disabled={!canEdit}
                defaultValues={mapMetadataToFormValues(csw, datasheetName)}
                existingThumbnailUrl={csw?.thumbnail_url}
                fileIdentifierLocked={!!csw?.file_identifier}
                onSubmit={(values) => replaceMutation.mutateAsync(values)}
                renderTopActions={({ isSubmitting }) => (
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-2w")}>
                        <h2 className={fr.cx("fr-h4", "fr-col", "fr-mb-0")}>{t("title")}</h2>
                        {canEdit && (
                            <Button type="submit" disabled={isSubmitting} iconId="fr-icon-save-line">
                                {isSubmitting ? t("saving") : t("save")}
                            </Button>
                        )}
                    </div>
                )}
            />
        </>
    );
}
