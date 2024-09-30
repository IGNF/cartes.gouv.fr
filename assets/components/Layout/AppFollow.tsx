import { memo } from "react";
import Follow from "@codegouvfr/react-dsfr/Follow";
import { routes } from "../../router/router";

const AppFollow = () => {
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
