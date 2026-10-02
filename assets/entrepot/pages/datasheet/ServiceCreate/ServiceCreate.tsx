import ServiceTypeSelection from "./ServiceTypeSelection";

type ServiceCreateProps = {
    datastoreId: string;
    datasheetName: string;
};
export default function ServiceCreate(_props: ServiceCreateProps) {
    return <ServiceTypeSelection />;
}
