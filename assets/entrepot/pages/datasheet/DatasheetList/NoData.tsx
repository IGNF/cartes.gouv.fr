import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { tss } from "tss-react";

import noDataSvgUrl from "@/img/pictograms/no-data.svg";
import { externalLink } from "@/router/externalUrls";
import { routes } from "@/router/router";

type NoDataProps = {
    datastoreId: string;
};

export default function NoData({ datastoreId }: NoDataProps) {
    const { classes, cx } = useStyles();

    return (
        <div className={cx(classes.root, fr.cx("fr-mt-10v"))}>
            <img src={noDataSvgUrl} alt="" />
            <div className={classes.rightSection}>
                <h6 className={fr.cx("fr-mb-4v")}>{"Vous n'avez pas de fiches de données"}</h6>

                <p className={fr.cx("fr-mb-8v")}>{"Créez des cartes personnalisées et interactives en quelques clics et partagez-les autour de vous."}</p>

                <ButtonsGroup
                    buttons={[
                        {
                            children: "Consulter l'aide",
                            linkProps: externalLink("documentationCreateDatasheet"),
                            priority: "secondary",
                        },
                        {
                            children: "Créer une fiche de données",
                            linkProps: routes.datastore_datasheet_upload({ datastoreId }).link,
                            iconId: "fr-icon-arrow-right-s-line",
                            iconPosition: "right",
                        },
                    ]}
                    inlineLayoutWhen="md and up"
                />
            </div>
        </div>
    );
}

const useStyles = tss.withName({ NoData }).create({
    root: {
        display: "flex",
        gap: fr.spacing("20v"),
    },
    rightSection: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
});
