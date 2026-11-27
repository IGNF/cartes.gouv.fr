// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { validateSld } from "./validateSld";

const sld10 = (layers = "<NamedLayer><Name>communes</Name><UserStyle><FeatureTypeStyle>{rules}</FeatureTypeStyle></UserStyle></NamedLayer>", rules = rule10) =>
    `<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld">${layers.replace("{rules}", rules)}</StyledLayerDescriptor>`;
const rule10 = "<Rule><PolygonSymbolizer><Fill/></PolygonSymbolizer></Rule>";

const sld10Prefixed = `<sld:StyledLayerDescriptor version="1.0.0" xmlns:sld="http://www.opengis.net/sld">
  <sld:NamedLayer>
    <sld:Name>communes</sld:Name>
    <sld:UserStyle><sld:FeatureTypeStyle><sld:Rule><sld:PointSymbolizer/></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle>
  </sld:NamedLayer>
</sld:StyledLayerDescriptor>`;

// SLD 1.1.0 : refusé par l’Entrepôt
const sld11 = `<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.1.0" xmlns="http://www.opengis.net/sld" xmlns:se="http://www.opengis.net/se">
  <NamedLayer>
    <se:Name>communes</se:Name>
    <UserStyle><se:FeatureTypeStyle><se:Rule><se:LineSymbolizer/></se:Rule></se:FeatureTypeStyle></UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>`;

describe("validateSld", () => {
    it("accepte un SLD 1.0.0, préfixé ou non", () => {
        expect(validateSld(sld10(), "communes")).toEqual([]);
        expect(validateSld(sld10Prefixed, "communes")).toEqual([]);
    });

    it("refuse un texte vide ou un XML mal formé", () => {
        expect(validateSld(" \n", "communes")).toEqual([{ code: "empty" }]);
        expect(validateSld("<StyledLayerDescriptor>", "communes")).toEqual([{ code: "malformed" }]);
    });

    it("refuse une autre racine, un autre espace de noms ou une autre version", () => {
        expect(validateSld('<StyledLayer version="1.0.0" xmlns="http://www.opengis.net/sld"/>', "communes")).toEqual([{ code: "root" }]);
        expect(validateSld(sld10().replace("http://www.opengis.net/sld", "http://example.test/sld"), "communes")).toEqual([{ code: "root" }]);
        expect(validateSld(sld10().replace('version="1.0.0"', 'version="2.0"'), "communes")).toEqual([{ code: "version" }]);
        expect(validateSld(sld11, "communes")).toEqual([{ code: "version" }]);
    });

    it("exige exactement un NamedLayer et aucun UserLayer", () => {
        const layer = "<NamedLayer><Name>communes</Name><UserStyle><FeatureTypeStyle>{rules}</FeatureTypeStyle></UserStyle></NamedLayer>";
        expect(validateSld(sld10(layer + layer), "communes")).toEqual([{ code: "named_layer_count" }]);
        expect(validateSld(sld10(layer + "<UserLayer/>"), "communes")).toEqual([{ code: "named_layer_count" }]);
        expect(validateSld(sld10("<UserLayer/>"), "communes")).toEqual([{ code: "named_layer_count" }]);
    });

    it("compare strictement le nom de la couche au nom de la table", () => {
        expect(validateSld(sld10(), "Communes")).toEqual([{ code: "layer_name", expected: "Communes" }]);
        // le Name d’une règle ne compte pas : seul l’enfant direct de NamedLayer est lu
        expect(
            validateSld(
                sld10(undefined, "<Rule><Name>communes</Name><PointSymbolizer/></Rule>").replace("<Name>communes</Name><UserStyle>", "<UserStyle>"),
                "communes"
            )
        ).toEqual([{ code: "layer_name", expected: "communes" }]);
    });

    it("exige au moins une règle, chacune avec un symboliseur", () => {
        expect(validateSld(sld10(undefined, ""), "communes")).toEqual([{ code: "no_rule" }]);
        expect(validateSld(sld10(undefined, rule10 + "<Rule><Name>vide</Name></Rule>"), "communes")).toEqual([{ code: "rule_without_symbolizer" }]);
    });
});
