import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import RQKeys from "@/modules/entrepot/RQKeys";

export const Route = createFileRoute("/")({
    component: SpikeHome,
});

function SpikeHome() {
    const { data: user } = useQuery<CartesUser | null>({ queryKey: RQKeys.user_me(), staleTime: Infinity });
    const firstDatastoreId = user?.communities_member?.find((m) => m.community?.datastore)?.community?.datastore;

    return (
        <main>
            <h1>Spike TanStack Router</h1>
            <ul>
                <li>
                    {/* Link TanStack natif : to/params typés */}
                    <Link to="/tableau-de-bord/entrepots/$datastoreId" params={{ datastoreId: firstDatastoreId ?? "inconnu" }}>
                        Mon premier entrepôt (gate OK attendu)
                    </Link>
                </li>
                <li>
                    <Link to="/tableau-de-bord/entrepots/$datastoreId" params={{ datastoreId: "00000000-aaaa-bbbb-cccc-000000000000" }}>
                        Entrepôt inexistant (404 attendu via beforeLoad)
                    </Link>
                </li>
                <li>
                    {/* linkProps react-dsfr : typé via l'augmentation (props: LinkProps) => … */}
                    <Button linkProps={{ to: "/spike-recherche", search: { q: "test" } }} priority="secondary">
                        Recherche (validateSearch, défauts page/limit)
                    </Button>
                </li>
                <li>
                    <Link to="/spike-recherche" search={{ q: "test", page: 3 }}>
                        Recherche page 3
                    </Link>
                </li>
            </ul>
        </main>
    );
}
