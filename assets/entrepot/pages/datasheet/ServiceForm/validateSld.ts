const SLD_NAMESPACE = "http://www.opengis.net/sld";
// l’Entrepôt valide le fichier contre le schéma SLD 1.0.0 et refuse 1.1.0 (vérifié le 12/11/2026)
const SLD_VERSION = "1.0.0";

export type SldError =
    | { code: "empty" }
    | { code: "malformed" }
    | { code: "root" }
    | { code: "version" }
    | { code: "named_layer_count" }
    | { code: "layer_name"; expected: string }
    | { code: "no_rule" }
    | { code: "rule_without_symbolizer" };

const childElements = (element: Element, localName: string) => Array.from(element.children).filter((child) => child.localName === localName);

/**
 * Contrôles imposés par l’Entrepôt à un style WMS vecteur : un seul NamedLayer nommé comme la table, au moins une règle avec un symboliseur.
 * Éléments comparés par `localName` : le préfixe d’espace de noms est libre.
 */
export function validateSld(text: string, tableName: string): SldError[] {
    if (text.trim() === "") return [{ code: "empty" }];

    const doc = new DOMParser().parseFromString(text, "application/xml");
    // Chrome et Firefox ne placent pas l’erreur d’analyse au même endroit
    if (doc.getElementsByTagName("parsererror").length > 0) return [{ code: "malformed" }];

    const root = doc.documentElement;
    if (root.localName !== "StyledLayerDescriptor" || root.namespaceURI !== SLD_NAMESPACE) return [{ code: "root" }];
    if (root.getAttribute("version") !== SLD_VERSION) return [{ code: "version" }];

    const namedLayers = doc.getElementsByTagNameNS(SLD_NAMESPACE, "NamedLayer");
    if (namedLayers.length !== 1 || doc.getElementsByTagNameNS(SLD_NAMESPACE, "UserLayer").length > 0) return [{ code: "named_layer_count" }];

    const errors: SldError[] = [];
    if (childElements(namedLayers[0], "Name")[0]?.textContent !== tableName) errors.push({ code: "layer_name", expected: tableName });

    const rules = Array.from(doc.getElementsByTagNameNS("*", "Rule"));
    if (rules.length === 0) {
        errors.push({ code: "no_rule" });
    } else if (rules.some((rule) => !Array.from(rule.children).some((child) => child.localName.endsWith("Symbolizer")))) {
        errors.push({ code: "rule_without_symbolizer" });
    }

    return errors;
}
