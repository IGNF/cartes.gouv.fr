import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { useState } from "react";
import { createPortal } from "react-dom";

import { type Configuration } from "@/@types/app";
import CardRowsTable from "@/components/Utils/CardRowsTable";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { formatDateFromISO } from "@/utils";

// Flux, Date de modification, Statut, Action
const COLUMN_WIDTHS = [undefined, "14.5rem", "7.5rem", "8.25rem"];

const deleteConfigurationModal = createModal({
    id: "configurations-without-offering-delete-modal",
    isOpenedByDefault: false,
});

type ConfigurationsWithoutOfferingListProps = {
    datastoreId: string;
    datasheetName: string;
    query: UseQueryResult<Configuration[], ApiError>;
    canDelete: boolean;
};

/** configurations de la fiche sans offre : invisibles dans la liste des flux, qui part des offres */
export default function ConfigurationsWithoutOfferingList({ datastoreId, datasheetName, query, canDelete }: ConfigurationsWithoutOfferingListProps) {
    const { t } = useTranslation("ServicesListTabNext");
    const queryClient = useQueryClient();
    const [target, setTarget] = useState<Configuration>();

    const deleteMutation = useMutation<null, ApiError, Configuration>({
        mutationFn: (configuration) => api.configuration.remove(datastoreId, configuration._id),
        onSettled: () => {
            // le nom technique redevient libre
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_layernames(datastoreId) });
            return queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_configurations_without_offering(datastoreId, datasheetName) });
        },
    });

    if (query.isError) {
        return (
            <Alert
                className={fr.cx("fr-mt-4w")}
                severity="error"
                title={t("without_offering.load_error")}
                description={getApiErrorMessage(query.error)}
                small
            />
        );
    }
    if (!query.data?.length) {
        return null;
    }

    return (
        <>
            <h3 className={fr.cx("fr-h6", "fr-mt-6w", "fr-mb-1w")}>{t("without_offering.title")}</h3>
            <p className={fr.cx("fr-text--sm")}>{t("without_offering.explanation")}</p>

            {deleteMutation.isError && (
                <Alert severity="error" title={t("without_offering.delete_error")} description={getApiErrorMessage(deleteMutation.error)} small />
            )}

            <CardRowsTable
                caption={t("without_offering.title")}
                noCaption
                columnWidths={COLUMN_WIDTHS}
                headers={[t("column.name"), t("column.update"), t("column.status"), t("column.action")]}
                data={query.data.map((configuration) => [
                    <span key={`name-${configuration._id}`}>
                        <span className={fr.cx("fr-text--bold")}>{configuration.name}</span>
                        <br />
                        <span className={fr.cx("fr-text--xs")}>
                            {configuration.type} - {configuration.layer_name}
                        </span>
                    </span>,
                    configuration.update ? formatDateFromISO(configuration.update) : "",
                    <Badge key={`status-${configuration._id}`} severity="info" noIcon small>
                        {t("without_offering.status")}
                    </Badge>,
                    canDelete ? (
                        <Button
                            key={`delete-${configuration._id}`}
                            priority="tertiary"
                            size="small"
                            onClick={() => {
                                setTarget(configuration);
                                deleteConfigurationModal.open();
                            }}
                        >
                            {t("menu.delete")}
                        </Button>
                    ) : (
                        ""
                    ),
                ])}
            />

            {createPortal(
                <deleteConfigurationModal.Component
                    title={t("without_offering.delete_modal.title", { name: target?.name ?? "" })}
                    buttons={[
                        { children: t("delete_modal.cancel"), doClosesModal: true, priority: "secondary" },
                        {
                            children: t("delete_modal.confirm"),
                            onClick: () => target && deleteMutation.mutate(target),
                            doClosesModal: true,
                            priority: "primary",
                        },
                    ]}
                >
                    <strong>{t("delete_modal.items")}</strong>
                    <ul>
                        <li>{t("delete_modal.configuration", { id: target?._id ?? "" })}</li>
                    </ul>
                </deleteConfigurationModal.Component>,
                document.body
            )}

            {deleteMutation.isPending && (
                <Wait>
                    <LoadingText as="h6" message={t("without_offering.deleting")} withSpinnerIcon={true} />
                </Wait>
            )}
        </>
    );
}
