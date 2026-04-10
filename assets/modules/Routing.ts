import Routing from "../../vendor/friendsofsymfony/jsrouting-bundle/Resources/js/router";
import routes from "../../var/cache/fosRoutes.json";
Routing.setRoutingData(routes);

const SymfonyRouting = Routing;
export default SymfonyRouting;

export type QueryParamPrimitive = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamPrimitive | readonly QueryParamPrimitive[]>;
