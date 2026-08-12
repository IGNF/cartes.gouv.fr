import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorComponentProps, SearchParamError, useRouter } from "@tanstack/react-router";

import { CartesApiException } from "@/modules/jsonFetch";
import PageNotFound from "@/pages/error/PageNotFound";
import UnexpectedError from "@/pages/error/UnexpectedError";

/**
 * Partition miroir-404 des layouts de ressource (entrepôt, communauté) :
 * les erreurs des useSuspenseQuery des pages remontent à l'errorComponent de la route.
 */
export default function ApiErrorPage({ error }: ErrorComponentProps) {
    const router = useRouter();
    const { reset } = useQueryErrorResetBoundary();

    // Un échec de validateSearch d'une feuille s'arrête ici (errorComponent le plus proche) → même mapping 404 qu'à la racine
    if (error instanceof SearchParamError) {
        return <PageNotFound />;
    }

    // 404 : ressource inexistante OU inaccessible (l'API Entrepôt répond 404 dans les deux cas, comportement miroir voulu)
    if ((error as Partial<CartesApiException>)?.code === 404) {
        return <PageNotFound />;
    }

    // toute autre erreur (500, réseau...) n'est PAS une 404
    return (
        <UnexpectedError
            message={error.message}
            onRetry={() => {
                reset();
                router.invalidate();
            }}
        />
    );
}
