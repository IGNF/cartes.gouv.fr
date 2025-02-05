import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { FC } from "react";

import { UploadReport } from "../../../../@types/app";
import { niceBytes } from "../../../../utils";
import ReportStatusBadge from "../ReportTab/ReportStatusBadge";

type UploadPreviewTabProps = {
    reportData: UploadReport;
};

const UploadPreviewTab: FC<UploadPreviewTabProps> = ({ reportData }) => {
    const uploadData = reportData.input_upload;

    return (
        <Accordion titleAs="h2" label="Informations générales" defaultExpanded={true}>
            <ul className={fr.cx("fr-raw-list")}>
                <li>
                    <strong>Nom :</strong> {uploadData.name}
                </li>
                <li>
                    <strong>Identifiant technique :</strong> {uploadData._id}
                </li>
                <li>
                    <strong>Projection :</strong> {uploadData.srs}
                </li>
                <li>
                    <strong>Statut :</strong> {<ReportStatusBadge status={uploadData.status} />}
                </li>
                <li>
                    <strong>Taille :</strong> {uploadData.size && niceBytes(uploadData.size.toString())}
                </li>
                <li>
                    <strong>Type :</strong> {uploadData.type}
                </li>
            </ul>
        </Accordion>
    );
};

export default UploadPreviewTab;
