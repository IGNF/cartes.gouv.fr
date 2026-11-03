import Routing from "fos-router";

import { basePath } from "@/env";
import routes from "./symfony-routes.json";
Routing.setRoutingData(routes);
Routing.setBaseUrl(basePath);

const SymfonyRouting = Routing;
export default SymfonyRouting;

export type QueryParamPrimitive = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamPrimitive | readonly QueryParamPrimitive[]>;
