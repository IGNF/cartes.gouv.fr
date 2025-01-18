import { memo } from "react";
import Follow from "@codegouvfr/react-dsfr/Follow";
import { routes, useRoute } from "../../router/router";

const AppFollow = () => {
    const newsletterSubscribeAction = (document.getElementById("app_env") as HTMLDivElement)?.dataset?.["newsletterSubscribeAction"] ?? null;
    const route = useRoute();

    if (newsletterSubscribeAction === null) {
        return null;
    }

    if (typeof route.name === "string" && /^newsletter_/.test(route.name)) {
        return null;
    }

    return (
        <Follow
            newsletter={{
                buttonProps: {
                    linkProps: {
                        ...routes.newsletter_subscribe().link,
                    },
                },
            }}
        />
    );
};

export default memo(AppFollow);
