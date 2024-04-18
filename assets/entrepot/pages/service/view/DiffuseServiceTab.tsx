import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";

import TextCopyToClipboard from "../../../../components/Utils/TextCopyToClipboard";
import { Service } from "../../../../@types/app";

type DiffuseServiceTabProps = {
    service?: Service;
};
const DiffuseServiceTab: FC<DiffuseServiceTabProps> = ({ service }) => {
    return (
        <div className={fr.cx("fr-col-12")}>
            <div className={fr.cx("fr-grid-row")}>
                <p>Copiez vos adresses pour les utiliser dans vos applications SIG ou web.</p>
            </div>

            {/* lien public vers la carte */}
            <div className={fr.cx("fr-grid-row")}>
                <strong>Lien public vers la carte</strong>
            </div>
            <TextCopyToClipboard text={"http://www.ign.fr/geoplateforme"} className="fr-mb-4w" disabled />

            {/* Code HTML de l'iframe */}
            <div className={fr.cx("fr-grid-row")}>
                <strong>{"Code HTML de l'iframe"}</strong>
            </div>
            <TextCopyToClipboard text={"<iframe width='600' height='40..."} className="fr-mb-4w" disabled />

            {/* Adresse du service de données */}
            <div className={fr.cx("fr-grid-row")}>
                <strong>Adresse du service de données</strong>
            </div>

            <TextCopyToClipboard text={service?.share_url ?? "Indisponible"} disabled={!service?.share_url} className="fr-mb-1w" />
        </div>
    );
};

export default DiffuseServiceTab;
