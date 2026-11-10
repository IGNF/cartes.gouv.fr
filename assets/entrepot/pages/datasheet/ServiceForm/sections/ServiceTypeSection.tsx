import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { tss } from "tss-react";

import { useTranslation } from "@/i18n";
import { externalLinkToUrl, externalUrls } from "@/router/externalUrls";
import { IMPLEMENTED_SERVICE_TYPES, SERVICE_TYPES, type ServiceType } from "../serviceFormSchema";

const dataKinds: Record<ServiceType, ("vector" | "raster")[]> = {
    wfs: ["vector"],
    wms: ["vector", "raster"],
    tms: ["vector"],
    wmts: ["raster"],
};

type ServiceTypeSectionProps = {
    value: ServiceType;
    onChange: (type: ServiceType) => void;
};

/** cartes de la maquette, sur de vrais boutons radio */
export default function ServiceTypeSection({ value, onChange }: ServiceTypeSectionProps) {
    const { t } = useTranslation("ServiceForm");
    const { classes, cx } = useStyles();

    return (
        <fieldset className={fr.cx("fr-fieldset")}>
            {/* le titre de section affiche déjà « Type de flux » : légende gardée pour les lecteurs d’écran */}
            <legend className={fr.cx("fr-fieldset__legend", "fr-sr-only")}>{t("type.legend")}</legend>
            <div className={cx(fr.cx("fr-fieldset__element"), classes.cards)}>
                {SERVICE_TYPES.map((type) => (
                    <div key={type} className={cx(fr.cx("fr-radio-group"), classes.card)}>
                        <input
                            type="radio"
                            id={`service-type-${type}`}
                            name="service-type"
                            value={type}
                            checked={value === type}
                            disabled={!IMPLEMENTED_SERVICE_TYPES.includes(type)}
                            onChange={() => onChange(type)}
                        />
                        <label className={fr.cx("fr-label")} htmlFor={`service-type-${type}`}>
                            {t(`type.${type}`)}
                            <span className={fr.cx("fr-hint-text")}>{t(`type.${type}.description`)}</span>
                            <span className={classes.badges}>
                                {dataKinds[type].map((kind) => (
                                    <Badge
                                        key={kind}
                                        small
                                        noIcon
                                        className={fr.cx(kind === "vector" ? "fr-badge--green-emeraude" : "fr-badge--brown-caramel")}
                                    >
                                        {t(`type.${kind}`)}
                                    </Badge>
                                ))}
                            </span>
                        </label>
                    </div>
                ))}
            </div>
            <div className={fr.cx("fr-fieldset__element")}>
                <a {...externalLinkToUrl(externalUrls.helpProducerGuideChooseServiceType, t("type.help_link"))} className={fr.cx("fr-link")}>
                    {t("type.help_link")}
                </a>
            </div>
        </fieldset>
    );
}

const useStyles = tss.withName({ ServiceTypeSection }).create({
    cards: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
        gap: fr.spacing("2w"),
    },
    card: {
        margin: 0,
        // la règle DSFR des groupes radio limite la largeur au contenu
        "&&": { maxWidth: "none" },
        padding: fr.spacing("2w"),
        border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
        "&:has(input:checked)": {
            outline: `2px solid ${fr.colors.decisions.border.active.blueFrance.default}`,
            outlineOffset: "-2px",
            backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
        },
    },
    badges: {
        display: "flex",
        gap: fr.spacing("1w"),
        marginTop: fr.spacing("1w"),
    },
});
