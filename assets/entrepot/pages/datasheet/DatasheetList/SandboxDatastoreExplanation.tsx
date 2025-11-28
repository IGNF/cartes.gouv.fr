import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

import { useTranslation } from "@/i18n";
import labSvgUrl from "@/img/pictograms/lab.svg";

export default function SandboxDatastoreExplanation() {
    const { t } = useTranslation("DatasheetList");

    const { classes, cx } = useStyles();

    return (
        <div className={cx(fr.cx("fr-highlight"), classes.root)}>
            <img src={labSvgUrl} alt="" />
            <div>
                <h6 className={fr.cx("fr-m-0")}>{t("sandbox_datastore_explanation_title")}</h6>
                <p>{t("sandbox_datastore_explanation_desc")}</p>
            </div>
        </div>
    );
}

const useStyles = tss.withName({ SandboxDatastoreExplanation }).create({
    root: {
        display: "flex",
        gap: fr.spacing("8v"),
        alignItems: "center",
    },
});
