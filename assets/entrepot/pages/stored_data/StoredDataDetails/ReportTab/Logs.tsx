import { FC } from "react";
import { CheckOrProcessingExecutionLogs } from "../../../../../@types/app";

type LogsProps = {
    logs?: CheckOrProcessingExecutionLogs;
};
const Logs: FC<LogsProps> = ({ logs }) => {
    return (
        <>
            <strong>Journal :</strong>
            {logs === undefined ? (
                "Impossible de récupérer les journaux"
            ) : logs.length > 0 ? (
                <pre>
                    <code
                        style={{
                            whiteSpace: "pre-line",
                        }}
                    >
                        {logs.join("\n")}
                    </code>
                </pre>
            ) : (
                "Pas de journal trouvé"
            )}
        </>
    );
};

export default Logs;
