import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useStyles } from "tss-react";

import Main from "@/components/Layout/Main";
import api from "@/entrepot/api";
import { useTranslation } from "@/i18n/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import MetadataForm from "../forms/MetadataForm";
import { buildMetadataFormData, type MetadataValues } from "../forms/metadataSchema";

type DatasheetCreateProps = {
    datastoreId: string;
};

export default function DatasheetCreate({ datastoreId }: DatasheetCreateProps) {
    const { t } = useTranslation("DatasheetCreate");
    const { t: tCommon } = useTranslation("Common");
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { css, cx } = useStyles();
    // marges latérales des sections du formulaire (MetadataSectionsContainer)
    const sectionGutter = css({ paddingInline: fr.spacing("6v"), [fr.breakpoints.up("md")]: { paddingInline: fr.spacing("10v") } });

    const createMutation = useMutation({
        mutationFn: (values: MetadataValues) => api.datasheet.add(datastoreId, buildMetadataFormData(values)),
        onSuccess: async (_metadata, values) => {
            await queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_list(datastoreId) });
            await navigate({ to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName", params: { datastoreId, datasheetName: values.name } });
        },
    });

    return (
        <Main title={t("title")} breadcrumbSeparator="container">
            <div className={cx(fr.cx("fr-pt-5w"), sectionGutter)}>
                <h1>{t("title")}</h1>
                <p className={fr.cx("fr-info-text", "fr-mb-1v")}>{t("already_published_info")}</p>
                <p className={cx(fr.cx("fr-text--xs", "fr-mb-0"), css({ color: fr.colors.decisions.text.mention.grey.default }))}>
                    {tCommon("mandatory_fields")}
                </p>
            </div>

            {createMutation.isError && (
                <div className={cx(fr.cx("fr-mt-4w"), sectionGutter)}>
                    <Alert severity="error" title={t("error_title")} description={getApiErrorMessage(createMutation.error)} small />
                </div>
            )}

            <MetadataForm
                datastoreId={datastoreId}
                onSubmit={(values) => createMutation.mutateAsync(values)}
                renderBottomActions={({ isSubmitting }) => (
                    <ButtonsGroup
                        className={cx(fr.cx("fr-pt-5w", "fr-pb-10w"), sectionGutter)}
                        alignment="right"
                        inlineLayoutWhen="md and up"
                        buttonsSize="large"
                        buttonsEquisized={false}
                        buttons={[
                            {
                                priority: "secondary",
                                linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId } },
                                children: t("cancel"),
                            },
                            { type: "submit", disabled: isSubmitting, children: isSubmitting ? t("submitting") : t("submit") },
                        ]}
                    />
                )}
            />
        </Main>
    );
}
