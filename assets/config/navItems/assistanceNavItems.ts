import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";

import { ComponentKey } from "../../i18n/types";
import { routes } from "../../router/router";

export const assistanceNavItems = (t: TranslationFunction<"navItems", ComponentKey>): MainNavigationProps.Item.Menu => {
    return {
        menuLinks: [
            {
                linkProps: routes.faq().link,
                text: t("faq"),
            },
            {
                linkProps: routes.contact().link,
                text: t("nous écrire"),
            },
            {
                linkProps: routes.service_status().link,
                text: t("service status"),
            },
        ],
        text: t("assistance"),
    };
};
