import { createFileRoute, Link, notFound, SearchSchemaInput } from "@tanstack/react-router";

type SpikeSearch = {
    q: string; // requis : absent → 404 (comportement type-route à préserver)
    page: number;
    limit: number;
};

// SPIKE : validateSearch avec défauts + mapping échec de validation → notFound.
// SearchSchemaInput : les liens exigent q mais page/limit restent optionnels (défauts appliqués ici).
export const Route = createFileRoute("/spike-recherche")({
    validateSearch: (search: { q: string; page?: number; limit?: number } & SearchSchemaInput): SpikeSearch => {
        if (typeof search.q !== "string" || search.q === "") {
            throw notFound();
        }
        const page = search.page === undefined ? 1 : Number(search.page);
        const limit = search.limit === undefined ? 20 : Number(search.limit);
        if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
            throw notFound();
        }
        return { q: search.q, page, limit };
    },
    component: SpikeSearchPage,
});

function SpikeSearchPage() {
    const { q, page, limit } = Route.useSearch();

    return (
        <main>
            <h1>Recherche (spike)</h1>
            <p>
                q = « {q} », page = {page}, limit = {limit}
            </p>
            <ul>
                <li>
                    {/* search partiel typé : page changée, q conservé via fonction */}
                    <Link to="/spike-recherche" search={(prev) => ({ ...prev, q, page: page + 1 })}>
                        Page suivante
                    </Link>
                </li>
                <li>
                    <Link to="/">Retour accueil spike</Link>
                </li>
            </ul>
        </main>
    );
}
