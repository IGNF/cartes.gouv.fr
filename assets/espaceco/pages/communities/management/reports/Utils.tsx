import { ReportStatusesDTO } from "../../../../../@types/espaceco";
import statuses from "../../../../../data/report_statuses.json";

const getDefaultStatuses = (): ReportStatusesDTO => {
    const result = {};
    Object.keys(statuses).forEach((s) => {
        result[s] = { title: statuses[s], active: true };
    });
    return result as ReportStatusesDTO;
};

const getMinAuthorizedStatus = (): number => {
    return Object.keys(statuses).length - 2;
};

const countActiveStatus = (statuses: ReportStatusesDTO) => {
    let c = 0;
    Object.keys(statuses).forEach((s) => (c += statuses[s].active ? 1 : 0));
    return c;
};

const statusesAlwaysActive = ["submit", "valid"];

export { getDefaultStatuses, getMinAuthorizedStatus, countActiveStatus, statusesAlwaysActive };
