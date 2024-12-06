import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../i18n/types";

const { i18n } = declareComponentKeys<
    | "no_source"
    | "only_one_source"
    | "source_is_missing"
    | "source_layer_is_missing"
    | { K: "source_layer_not_matching"; P: { layer: string }; R: string }
    | { K: "incorrect_source"; P: { layer: string; source: string }; R: string }
>()("mapboxStyleValidation");
export type I18n = typeof i18n;

export const mapboxStyleValidationFrTranslations: Translations<"fr">["mapboxStyleValidation"] = {
    no_source: "Il n'y a aucune source de données",
    only_one_source: "Il ne doit y avoir qu'une seule source de données",
    source_is_missing: "Layer: la source est obligatoire",
    source_layer_is_missing: "Layer : source-layer est obligatoire",
    source_layer_not_matching: ({ layer }) => `source-layer [${layer}] ne correspond à aucun layer du service`,
    incorrect_source: ({ layer, source }) => `Layer [${layer}] doit avoir comme source de données [${source}]`,
};
export const mapboxStyleValidationEnTranslations: Translations<"en">["mapboxStyleValidation"] = {
    no_source: "No data source",
    only_one_source: "There must only be one data source",
    source_is_missing: "Layer: source is mandatory",
    source_layer_is_missing: "Layer: source-layer is mandatory",
    source_layer_not_matching: ({ layer }) => `source-layer [${layer}] does not correspond to any layer of the service`,
    incorrect_source: ({ layer, source }) => `Layer [${layer}] must have [${source}] as its data source`,
};
