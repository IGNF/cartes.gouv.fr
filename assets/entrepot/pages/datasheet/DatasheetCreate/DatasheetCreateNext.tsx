import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";

import DatasheetMain from "@/components/Layout/Datasheet/DatasheetMain";
import { useTranslation } from "@/i18n/i18n";
import { routes } from "@/router/router";
import MetadataForm from "../forms/MetadataForm";
import { defaultMetadataValues } from "../forms/metadataSchema";

type DatasheetCreateNextProps = {
    datastoreId: string;
};

export default function DatasheetCreateNext(props: DatasheetCreateNextProps) {
    const { datastoreId } = props;
    const { t } = useTranslation("DatasheetCreateNext");
    const { t: tCommon } = useTranslation("Common");

    return (
        <DatasheetMain
            title={t("title")}
            header={
                <>
                    <h1>{t("title")}</h1>
                    <p className={fr.cx("fr-info-text", "fr-mb-1v")}>
                        Avant de créer une fiche de données, assurez-vous que votre donnée n’a pas déjà été publiée par un autre producteur.
                    </p>
                    <p className={fr.cx("fr-text--xs")}>{tCommon("mandatory_fields")}</p>
                </>
            }
            content={
                <div>
                    <MetadataForm
                        defaultValues={defaultMetadataValues}
                        onSubmit={async (_values) => {
                            /* TODO : appel API backend (POST) une fois le contrat défini */
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
                </div>
            }
        />
    );
}
