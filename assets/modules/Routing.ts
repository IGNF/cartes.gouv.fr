import Routing from "fos-router";

import routes from "./symfony-routes.json";
Routing.setRoutingData(routes);

const SymfonyRouting = Routing;
export default SymfonyRouting;

export type QueryParamPrimitive = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamPrimitive | readonly QueryParamPrimitive[]>;
