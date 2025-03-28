import { fr } from "@codegouvfr/react-dsfr";
import { FC, useMemo } from "react";

import { Service } from "../../../../@types/app";
import TextCopyToClipboard from "../../../../components/Utils/TextCopyToClipboard";

type DiffuseServiceTabProps = {
    service?: Service;
};
const DiffuseServiceTab: FC<DiffuseServiceTabProps> = ({ service }) => {
    const currentStyleLayers = useMemo(() => service?.configuration.styles?.find((style) => style.current === true)?.layers, [service?.configuration.styles]);

    return (
        <div className={fr.cx("fr-col-12")}>
            <div className={fr.cx("fr-grid-row")}>
                <p>Copiez vos adresses pour les utiliser dans vos applications SIG ou web.</p>
            </div>

            {/* lien public vers la carte */}
            {/* <div className={fr.cx("fr-grid-row")}>
                <strong>Lien public vers la carte</strong>
            </div>
            <TextCopyToClipboard text={"http://www.ign.fr/geoplateforme"} className="fr-mb-4w" disabled /> */}

            {/* Code HTML de l'iframe */}
            {/* <div className={fr.cx("fr-grid-row")}>
                <strong>{"Code HTML de l'iframe"}</strong>
            </div>
            <TextCopyToClipboard text={"<iframe width='600' height='40..."} className="fr-mb-4w" disabled /> */}

            {/* Adresse du service de données */}
            <TextCopyToClipboard
                label="Adresse du service de données"
                text={service?.share_url ?? "Indisponible"}
                disabled={!service?.share_url}
                className="fr-mb-1w"
            />

            {currentStyleLayers && (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-mt-4v")}>
                        <strong>Adresse des fichiers de style courant</strong>
                    </div>
                    {currentStyleLayers?.map((layer) => (
                        <div key={layer.annexe_id} className={fr.cx("fr-mt-2v")}>
                            <TextCopyToClipboard
                                label={(() => {
                                    const splitLayerName = layer.name?.split(":");
                                    return splitLayerName?.[1] ?? splitLayerName?.[0] ?? layer.name;
                                })()}
                                text={layer.url}
                            />
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default DiffuseServiceTab;
