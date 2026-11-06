import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorComponentProps, SearchParamError, useRouter } from "@tanstack/react-router";

import { isApiError } from "@/modules/apiError";
import PageNotFound from "./PageNotFound";
import UnexpectedError from "./UnexpectedError";

/** erreurs des sous-arbres entrepôt et communauté : 404 miroir (inexistant ou inaccessible), sinon erreur générique avec réessai */
export default function ApiErrorPage({ error }: ErrorComponentProps) {
    const router = useRouter();
    const { reset } = useQueryErrorResetBoundary();

    // un validateSearch de feuille en échec s’arrête à l’errorComponent le plus proche
    if (error instanceof SearchParamError || (isApiError(error) && error.status === 404)) {
        return <PageNotFound />;
    }

    return (
        <UnexpectedError
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => {
                reset();
                void router.invalidate();
            }}
        />
    );
}
