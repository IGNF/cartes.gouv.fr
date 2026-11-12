import { fr } from "@codegouvfr/react-dsfr";
import Tag from "@codegouvfr/react-dsfr/Tag";
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

/** cartes de la maquette : chaque carte est le libellé d’un vrai bouton radio, masqué visuellement */
export default function ServiceTypeSection({ value, onChange }: ServiceTypeSectionProps) {
    const { t } = useTranslation("ServiceForm");
    const { classes } = useStyles();

    return (
        <fieldset className={fr.cx("fr-fieldset")}>
            {/* le titre de section affiche déjà « Type de flux » : légende gardée pour les lecteurs d’écran */}
            <legend className={fr.cx("fr-fieldset__legend", "fr-sr-only")}>{t("type.legend")}</legend>
            <div className={classes.cards}>
                {SERVICE_TYPES.map((type) => (
                    <label key={type} className={classes.card}>
                        <input
                            type="radio"
                            className={fr.cx("fr-sr-only")}
                            name="service-type"
                            value={type}
                            checked={value === type}
                            disabled={!IMPLEMENTED_SERVICE_TYPES.includes(type)}
                            onChange={() => onChange(type)}
                        />
                        <span className={fr.cx("fr-text--lg", "fr-mb-0")}>{t(`type.${type}`)}</span>
                        <span className={fr.cx("fr-text--sm", "fr-mb-0")}>{t(`type.${type}.description`)}</span>
                        <span className={classes.tags}>
                            {dataKinds[type].map((kind) => (
                                <Tag key={kind} small as="span">
                                    {t(`type.${kind}`)}
                                </Tag>
                            ))}
                        </span>
                    </label>
                ))}
            </div>
            <div className={fr.cx("fr-fieldset__element", "fr-mt-3w")}>
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
        width: "100%",
        padding: `0 ${fr.spacing("1w")}`,
    },
    card: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: fr.spacing("1w"),
        padding: fr.spacing("2w"),
        textAlign: "center",
        cursor: "pointer",
        borderRadius: fr.spacing("1w"),
        border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
        backgroundColor: fr.colors.decisions.background.default.grey.default,
        "&:hover": { backgroundColor: fr.colors.decisions.background.default.grey.hover },
        "&:has(input:checked)": {
            borderColor: fr.colors.decisions.border.default.blueFrance.default,
            // un contour survit au mode couleurs forcées, contrairement au fond et à l’ombre
            outline: `2px solid ${fr.colors.decisions.border.default.blueFrance.default}`,
            outlineOffset: "-2px",
            backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default,
        },
        "&:has(input:focus-visible)": {
            outline: `2px solid ${fr.colors.decisions.border.active.blueFrance.default}`,
            outlineOffset: "2px",
        },
        "&:has(input:disabled)": {
            cursor: "not-allowed",
            color: fr.colors.decisions.text.disabled.grey.default,
            backgroundColor: fr.colors.decisions.background.default.grey.default,
        },
    },
    tags: {
        display: "flex",
        gap: fr.spacing("1w"),
    },
});
