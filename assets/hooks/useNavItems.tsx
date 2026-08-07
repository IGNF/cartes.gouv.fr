import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";

import { defaultNavItems } from "@/config/navItems/navItems";
import useIsPublicRoute from "@/hooks/useIsPublicRoute";

type UseNavItemsReturn = MainNavigationProps.Item[] | undefined;
export default function useNavItems(): UseNavItemsReturn {
    const isPublicRoute = useIsPublicRoute();

    if (isPublicRoute) {
        return defaultNavItems();
    }

    return undefined;
}
