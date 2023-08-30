import Routing from "../../vendor/friendsofsymfony/jsrouting-bundle/Resources";
import routes from "../../var/cache/fosRoutes.json";
Routing.setRoutingData(routes);

const SymfonyRouting = Routing;
export default SymfonyRouting;
