import { type ProcessingExecution, ProcessingExecutionStatusEnum } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { delta } from "@/utils";
import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

export const blockingProcessingStatuses = [
    ProcessingExecutionStatusEnum.CREATED,
    ProcessingExecutionStatusEnum.WAITING,
    ProcessingExecutionStatusEnum.PROGRESS,
];

export default function useStoredDataUseProcessings(
    datastoreId?: string,
    storedDataId?: string,
    otherOptions?: Partial<UndefinedInitialDataOptions<ProcessingExecution[] | undefined>>
) {
    return useQuery({
        queryKey: RQKeys.datastore_processing_execution_list(datastoreId ?? "XXX", { input_stored_data: storedDataId, statuses: blockingProcessingStatuses }),
        queryFn: async ({ signal }) => {
            if (datastoreId === undefined || storedDataId === undefined) {
                return undefined;
            }
            const executions = await api.processing.getExecutionList(datastoreId, { input_stored_data: storedDataId }, { signal });
            return executions.filter((execution) => blockingProcessingStatuses.includes(execution.status));
        },
        staleTime: delta.minutes(10),
        enabled: datastoreId !== undefined && storedDataId !== undefined,
        ...otherOptions,
    });
}
