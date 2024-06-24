import { Route } from "type-route";
import { routes } from "../../router/router";
import { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { getTranslation } from "../../i18n/i18n";

const { t } = getTranslation("Breadcrumb");

const getBreadcrumb = (route: Route<typeof routes>, datastoreName?: string): BreadcrumbProps | undefined => {
    const defaultProps: BreadcrumbProps = {
        homeLinkProps: routes.home().link,
        segments: [],
        currentPageLabel: null,
    };

    switch (route.name) {
        case "about":
            return { ...defaultProps, currentPageLabel: t("about") };
        case "contact":
            return { ...defaultProps, currentPageLabel: t("contact") };
        case "contact_thanks":
            defaultProps.segments.push({ label: t("contact"), linkProps: routes.contact().link });
            return { ...defaultProps, currentPageLabel: t("contact_thanks") };
        case "news_list":
            return { ...defaultProps, currentPageLabel: t("news") };
        case "news_article":
            defaultProps.segments.push({ label: t("news"), linkProps: routes.news_list().link });
            return { ...defaultProps, currentPageLabel: route.params.slug };
        case "faq":
            return { ...defaultProps, currentPageLabel: t("faq") };
        case "sitemap":
            return { ...defaultProps, currentPageLabel: t("sitemap") };
        default:
            return undefined;
    }
};

export default getBreadcrumb;
