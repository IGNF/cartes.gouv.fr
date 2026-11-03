import { describe, expect, it } from "vitest";

import { renderMarkdown } from "./MarkdownRenderer";

describe("renderMarkdown", () => {
    it("relie les adresses avec ou sans protocole", () => {
        const html = renderMarkdown("www.ign.fr, geoservices.ign.fr, https://data.geopf.fr et contact@ign.fr");
        expect(html).toContain('href="http://www.ign.fr"');
        expect(html).toContain('href="http://geoservices.ign.fr"');
        expect(html).toContain('href="https://data.geopf.fr"');
        expect(html).toContain('href="mailto:contact@ign.fr"');
    });

    it("affiche le HTML brut comme du texte", () => {
        expect(renderMarkdown("<script>alert(1)</script>")).toBe("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>\n");
    });

    it("refuse les liens javascript:", () => {
        expect(renderMarkdown("[a](javascript:alert(1))")).not.toContain("href=");
    });
});
