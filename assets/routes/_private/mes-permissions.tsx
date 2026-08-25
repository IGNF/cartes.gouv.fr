import { createFileRoute } from "@tanstack/react-router";

import MyAccessKeys from "@/entrepot/pages/users/access-keys/MyAccessKeys";

export const Route = createFileRoute("/_private/mes-permissions")({
    component: () => <MyAccessKeys activeTab="permissions" />,
});
