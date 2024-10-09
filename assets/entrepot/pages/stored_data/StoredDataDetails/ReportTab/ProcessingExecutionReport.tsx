import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";

import type { StoredDataReportProcessingExecution } from "../../../../../@types/app";
import Logs from "./Logs";

type ProcessingExecutionReportProps = {
    processingExecution: StoredDataReportProcessingExecution;
    datastoreName?: string;
};
const ProcessingExecutionReport: FC<ProcessingExecutionReportProps> = ({ processingExecution, datastoreName }) => {
    return (
        <ul className={fr.cx("fr-raw-list")}>
            <li>
                <strong>{"Espace de travail :"}</strong> {datastoreName}
            </li>
            <li>
                <strong>{"Identifiant technique de l’exécution de traitement :"}</strong> {processingExecution?._id}
            </li>
            <li>
                <strong>{"Identifiant technique de la donnée en sortie :"}</strong> {processingExecution?.output?.stored_data._id}{" "}
            </li>
            <li>
                <strong>Entrée :</strong>
                <pre>
                    <code>{JSON.stringify(processingExecution.inputs, null, 4)}</code>
                </pre>
            </li>
            <li>
                <strong>Sortie :</strong>
                <pre>
                    <code>{JSON.stringify(processingExecution.output, null, 4)}</code>
                </pre>
            </li>
            <li>
                <strong>Paramètres :</strong>
                <pre>
                    <code>{JSON.stringify(processingExecution.parameters, null, 4)}</code>
                </pre>
            </li>
            <li>
                <Logs logs={processingExecution?.logs} />
            </li>
        </ul>
    );
};

export default ProcessingExecutionReport;
