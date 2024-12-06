import { FC, JSX, lazy, Suspense, useMemo } from "react";

import AppLayout from "../components/Layout/AppLayout";
import LoadingText from "../components/Utils/LoadingText";
import { I18nFetchingSuspense } from "../i18n/i18n";
import Home from "../pages/Home";
import RedirectToLogin from "../pages/RedirectToLogin";
import { useAuthStore } from "../stores/AuthStore";
import { groups, knownRoutes, routes, useRoute } from "./router";
import GroupCommunity from "./GroupCommunity";
import GroupDatastore from "./GroupDatastore";
import GroupApp from "./GroupApp";
import PageNotFoundWithLayout from "../pages/error/PageNotFoundWithLayout";
import Main from "../components/Layout/Main";

const EspaceCoCommunityList = lazy(() => import("../espaceco/pages/communities/Communities"));
const EspaceCoCreateCommunity = lazy(() => import("../espaceco/pages/communities/CreateCommunity"));
const EspaceCoManageCommunity = lazy(() => import("../espaceco/pages/communities/ManageCommunity"));
const MemberInvitation = lazy(() => import("../espaceco/pages/communities/MemberInvitation"));

const RouterRenderer: FC = () => {
    const route = useRoute();
    const user = useAuthStore((state) => state.user);

    const content: JSX.Element = useMemo(() => {
        // vérification si la route demandée est bien connue/enregistrée
        if (route.name === false || !knownRoutes.includes(route.name) || route.name === "page_not_found") {
            return <PageNotFoundWithLayout />;
        }

        // vérifier si l'utilisateur est authentifié et éventuellement ses droits à la ressource demandée
        if (!groups.public.has(route) && user === null) {
            return <RedirectToLogin />;
        }

        if (groups.community.has(route)) {
            return <GroupCommunity route={route} />;
        }

        if (groups.datastore.has(route)) {
            return <GroupDatastore route={route} />;
        }

        if (groups.espaceco.has(route)) {
            switch (route.name) {
                case "espaceco_community_list":
                    return <EspaceCoCommunityList />;
                case "espaceco_create_community":
                    return <EspaceCoCreateCommunity />;
                case "espaceco_manage_community":
                    return <EspaceCoManageCommunity communityId={route.params.communityId} />;
                case "espaceco_member_invitation":
                    return <MemberInvitation communityId={route.params.communityId} />;
            }
        }

        return <GroupApp route={route} />;
    }, [route, user]);

    return (
        <Suspense
            // affiche LoadingText pendant que les composants react "lazy" se chargent
            fallback={
                <AppLayout>
                    <Main>
                        <LoadingText />
                    </Main>
                </AppLayout>
            }
        >
            {/* on s'assure que les textes de traductions sont chargés */}
            <I18nFetchingSuspense
                fallback={
                    // fallback permet d'afficher LoadingText pendant que les textes de traductions se chargent
                    // par contre, traitement particulier pour la page d'accueil, on affiche tout de suite le contenu de la page d'accueil. Le contenu sera mis à jour une fois les textes de traductions seront chargés
                    route.name === routes.home().name ? (
                        <AppLayout>
                            <Home />
                        </AppLayout>
                    ) : (
                        <AppLayout>
                            <Main>
                                <LoadingText />
                            </Main>
                        </AppLayout>
                    )
                }
            >
                {content}
            </I18nFetchingSuspense>
        </Suspense>
    );
};

export default RouterRenderer;
