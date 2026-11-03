import Layer from "ol/layer/Layer";

import { getTranslation } from "@/i18n";
import { Service } from "../../@types/app";

const { t: tCommon } = getTranslation("Common");

// Seules les URL http(s) sont acceptées dans l’attribution (pas de javascript:, data:…)
const httpUrl = (value: string): string | undefined => {
    try {
        const { protocol } = new URL(value);
        return protocol === "http:" || protocol === "https:" ? value : undefined;
    } catch {
        return undefined;
    }
};

abstract class BaseService {
    readonly service: Service;

    constructor(service: Service) {
        this.service = service;
    }

    getAttribution(): string | undefined {
        if ("attribution" in this.service.configuration && this.service.configuration.attribution) {
            const attribution = this.service.configuration.attribution;

            // Valeurs saisies par les producteurs : construction par le DOM pour les échapper
            const href = httpUrl(attribution.url);
            const container = document.createElement(href ? "a" : "span");
            if (href) {
                container.setAttribute("href", href);
                container.setAttribute("title", `${attribution.title} - ${tCommon("new_window")}`);
                container.setAttribute("target", "_blank");
            }

            const logoUrl = attribution.logo ? httpUrl(attribution.logo.url) : undefined;
            if (logoUrl) {
                const logo = document.createElement("img");
                logo.setAttribute("src", logoUrl);
                container.append(logo, " ");
            }
            container.append(attribution.title);

            return container.outerHTML;
        }
        return undefined;
    }

    abstract getLayerNames(): string[];
    abstract getLayers(): Promise<Layer[]>;
}

export default BaseService;
