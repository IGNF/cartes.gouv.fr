import { LayerGeometryType } from "@/@types/app_espaceco";
import { LayerTools, RefLayerTools } from "@/@types/espaceco";
import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";
import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

const { i18n } = declareComponentKeys<
    | "direct_contribution_tools"
    | "loading_layers"
    | "updating_layers"
    | "no_editable_layers"
    | { K: "num_layers"; P: { num: number }; R: JSX.Element }
    | "select_layer_placeholder"
    | { K: "contribution_tools"; P: { tool: LayerTools }; R: string }
    | { K: "table"; P: { table: string; geomType: LayerGeometryType }; R: JSX.Element }
    | { K: "ref_tool"; P: { tool: RefLayerTools }; R: string }
>()("LayerTools");
export type I18n = typeof i18n;

export const LayerToolsFrTranslations: Translations<"fr">["LayerTools"] = {
    direct_contribution_tools: "Définir les outils de contribution directe liés aux base de données",
    loading_layers: "Recherche des couches associées à des tables ...",
    updating_layers: "Mise à jour des outils de configuration ...",
    no_editable_layers: "Aucune couche éditable",
    num_layers: ({ num }) =>
        num === 0 ? (
            <span>Aucune couche sélectionnée</span>
        ) : num === 1 ? (
            <span>Une seule couche sélectionnée</span>
        ) : (
            <span>
                Couches sélectionnées<Badge className={fr.cx("fr-ml-2v", "fr-badge--pink-macaron")}>{num}</Badge>
            </span>
        ),
    select_layer_placeholder: "Sélectionner une ou plusieurs couches",
    contribution_tools: ({ tool }) => {
        switch (tool) {
            case "draw":
                return "Ajouter un objet";
            case "translate":
                return "Déplacer un objet";
            case "modify":
                return "Modifier la géométrie d'un objet";
            case "delete":
                return "Supprimer un objet";
            case "split":
                return "Couper un objet";
            case "copy_paste":
                return "Copier/coller un objet";
            case "snap_mandatory":
                return "Snapping obligatoire";
        }
    },
    table: ({ table, geomType }) => {
        let gt;
        switch (geomType) {
            case "Point":
            case "MultiPoint":
                gt = "Ponctuel";
                break;
            case "LineString":
            case "MultiLineString":
                gt = "Linéaire";
                break;
            case "Polygon":
            case "MultiPolygon":
                gt = "Surfacique";
                break;
        }
        return (
            <div>
                <span className={fr.cx("fr-mr-2v")}>
                    <i className={cx(fr.cx("fr-icon--sm"), "ri-table-line")} />
                </span>
                <strong>{table}</strong>
                <Tag className={fr.cx("fr-ml-2v")} small>
                    {gt}
                </Tag>
            </div>
        );
    },
    ref_tool: ({ tool }) => {
        switch (tool) {
            case "snap":
                return "Accrochage";
            case "shortestpath":
                return "Plus court chemin";
        }
    },
};

export const LayerToolsEnTranslations: Translations<"en">["LayerTools"] = {
    direct_contribution_tools: undefined,
    loading_layers: undefined,
    updating_layers: undefined,
    no_editable_layers: undefined,
    num_layers: ({ num }) => <span>`${num} selected layers`</span>,
    select_layer_placeholder: undefined,
    contribution_tools: ({ tool }) => `${tool}`,
    table: ({ table, geomType }) => (
        <div>
            `${table} (${geomType})`
        </div>
    ),
    ref_tool: ({ tool }) => `${tool}`,
};
