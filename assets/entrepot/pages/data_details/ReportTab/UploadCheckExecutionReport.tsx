import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";

import { CheckDetailed } from "../../../../@types/app";
import Logs from "./Logs";

type UploadCheckExecutionReportProps = {
    check: CheckDetailed;
    datastoreName?: string;
};
const UploadCheckExecutionReport: FC<UploadCheckExecutionReportProps> = ({ check, datastoreName }) => {
    return (
        <ul className={fr.cx("fr-raw-list")}>
            <li>
                <strong>{"Espace de travail :"}</strong> {datastoreName}
            </li>
            <li>
                <strong>{"Identifiant technique de l’exécution de vérification :"}</strong> {check._id}
            </li>
            <li>
                <Logs logs={check.logs} />
            </li>
        </ul>
    );
};

export default UploadCheckExecutionReport;
