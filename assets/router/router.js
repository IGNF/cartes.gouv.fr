import { createRouter, defineRoute } from "type-route";

const routeDefs = {
    home: defineRoute("/"),
    my_account: defineRoute("/mon-compte"),
    datastores_list: defineRoute("/datastores"),
    docs: defineRoute("/docs"),
};

export const { RouteProvider, useRoute, routes } = createRouter(routeDefs);

export const protectedRoutes = ["my_account", "datastores_list"];
