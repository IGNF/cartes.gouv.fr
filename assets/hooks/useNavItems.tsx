import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";

import { defaultNavItems } from "@/config/navItems/navItems";
import { groups, useRoute } from "@/router/router";

type UseNavItemsReturn = MainNavigationProps.Item[] | undefined;
export default function useNavItems(): UseNavItemsReturn {
    const route = useRoute();

    if (groups.public.has(route)) {
        return defaultNavItems(route.name);
    }

    return undefined;
}
