// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { Service } from "../../@types/app";
import BaseService from "./BaseService";

class TestService extends BaseService {
    getLayerNames = () => [];
    getLayers = () => Promise.resolve([]);
}

const attributionOf = (attribution: object) => new TestService({ configuration: { attribution } } as unknown as Service).getAttribution();

describe("BaseService.getAttribution", () => {
    it("construit le lien avec le logo", () => {
        const html = attributionOf({ title: "IGN", url: "https://www.ign.fr", logo: { url: "https://www.ign.fr/logo.png" } });
        expect(html).toMatch(/^<a href="https:\/\/www\.ign\.fr" title="IGN - [^"]*" target="_blank"><img src="https:\/\/www\.ign\.fr\/logo\.png"> IGN<\/a>$/);
    });

    it("échappe les valeurs saisies", () => {
        const html = attributionOf({
            title: '<script>alert(1)</script>"',
            url: 'https://x.test/"onmouseover="alert(1)',
            logo: { url: 'https://x.test/a.png" onerror="alert(1)' },
        });
        const container = document.createElement("div");
        container.innerHTML = html ?? "";
        expect(container.querySelector("script")).toBeNull();
        expect(container.querySelector("[onmouseover], [onerror]")).toBeNull();
        expect(container.textContent).toContain("<script>alert(1)</script>");
    });

    it("n’accepte que les URL http(s)", () => {
        const html = attributionOf({ title: "Titre", url: "javascript:alert(1)", logo: { url: "data:image/svg+xml,<svg/>" } });
        expect(html).toBe("<span>Titre</span>");
    });
});
