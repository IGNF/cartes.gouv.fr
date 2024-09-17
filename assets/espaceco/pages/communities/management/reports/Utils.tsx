import { ReportStatuses, ReportStatusesDTO2 } from "../../../../../@types/espaceco";
import statuses from "../../../../../data/report_statuses.json";

/*const getDefaultStatuses = (): ReportStatusesDTO => {
    const result = {};
    Object.keys(statuses).forEach((s) => {
        result[s] = { wording: statuses[s].wording, help: null };
    });
    return result as ReportStatusesDTO;
};*/

const getDefaultStatuses = (): ReportStatusesDTO2 => {
    const result: ReportStatusesDTO2 = [];
    Object.keys(statuses).forEach((s) => {
        result.push({ status: s as ReportStatuses, wording: statuses[s], help: undefined });
    });
    return result;
};

export default getDefaultStatuses;
