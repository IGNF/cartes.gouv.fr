import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import DatasheetMain from "@/components/Layout/Datasheet/DatasheetMain";
import ServiceFormErrors from "@/components/Utils/ServiceFormErrors";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import { useTranslation } from "@/i18n/i18n";
import { CartesApiException } from "@/modules/jsonFetch";
import RQKeys from "@/modules/entrepot/RQKeys";
import { routes } from "@/router/router";
import MetadataForm from "../forms/MetadataForm";
import { MetadataFormValues, MetadataPayload, buildMetadataPayload, defaultMetadataValues } from "../forms/metadataSchema";
import LoadingIcon from "@/components/Utils/LoadingIcon";

type DatasheetCreateNextProps = {
    datastoreId: string;
};

export default function DatasheetCreateNext(props: DatasheetCreateNextProps) {
    const { datastoreId } = props;
    const { t } = useTranslation("DatasheetCreateNext");
    const { t: tCommon } = useTranslation("Common");
    const queryClient = useQueryClient();

    const createMutation = useMutation<MetadataPayload, CartesApiException, MetadataFormValues>({
        mutationFn: async (values) => {
            const payload = buildMetadataPayload(values);
            console.debug(payload);

            // Étape 1 : envoi des métadonnées JSON (validation backend via MapRequestPayload)
            const result = await api.datasheet.addMetadata(datastoreId, payload);
            console.debug(result);

            // Étape 2 : upload de la vignette si fournie (endpoint annexe existant)
            if (values.thumbnail instanceof File) {
                const formData = new FormData();
                formData.append("datasheetName", values.name);
                formData.append("file", values.thumbnail);
                await api.annexe.addThumbnail(datastoreId, formData);
            }

            // TODO: Étape 3 (future) : upload des logos producteur via api.annexe.add
            //       Aucun endpoint Entrepôt n'existe encore pour les logos organismes.

            return result;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_list(datastoreId) });
            routes.datastore_datasheet_view_next({ datastoreId, datasheetName: variables.name }).push();
        },
    });

    return (
        <DatasheetMain
            title={t("title")}
            header={
                <div className={fr.cx("fr-container")}>
                    <h1>{t("title")}</h1>
                    <p className={fr.cx("fr-info-text", "fr-mb-1v")}>
                        Avant de créer une fiche de données, assurez-vous que votre donnée n&apos;a pas déjà été publiée par un autre producteur.
                    </p>
                    <p className={fr.cx("fr-text--xs")}>{tCommon("mandatory_fields")}</p>
                </div>
            }
            content={
                <>
                    <div className={fr.cx("fr-container")}>
                        {createMutation.isError && (
                            <div className={fr.cx("fr-container", "fr-my-2w")}>
                                <Alert
                                    severity="error"
                                    title="Erreur lors de la création"
                                    description={<ServiceFormErrors message={createMutation.error.message} />}
                                    closable={false}
                                />
                            </div>
                        )}
                    </div>
                    <MetadataForm
                        defaultValues={defaultMetadataValues}
                        onSubmit={async (values) => {
                            await createMutation.mutateAsync(values);
                        }}
                        renderBottomActions={({ isSubmitting }) => (
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-my-4w")}>
                                <ButtonsGroup
                                    inlineLayoutWhen="always"
                                    buttons={[
                                        {
                                            priority: "secondary",
                                            linkProps: routes.datasheet_list({ datastoreId }).link,
                                            children: t("cancel"),
                                        },
                                        {
                                            type: "submit",
                                            disabled: isSubmitting,
                                            children: t("submit"),
                                        },
                                    ]}
                                />
                            </div>
                        )}
                    />
                    {createMutation.isPending && (
                        <Wait>
                            <div className={fr.cx("fr-container")}>
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                    <div className={fr.cx("fr-col-2")}>
                                        <LoadingIcon />
                                    </div>
                                    <div className={fr.cx("fr-col-10")}>
                                        <h6 className={fr.cx("fr-h6", "fr-m-0")}>{tCommon("adding")}</h6>
                                    </div>
                                </div>
                            </div>
                        </Wait>
                    )}
                </>
            }
        />
    );
}
