import { createFileRoute, Outlet } from "@tanstack/react-router";

import DatastorePanelMain from "@/components/Layout/DatastorePanelMain";

export const Route = createFileRoute("/_private/_panneau")({
    component: PanelLayout,
});

function PanelLayout() {
    return (
        <DatastorePanelMain>
            <Outlet />
        </DatastorePanelMain>
    );
}
