import { fr } from "@codegouvfr/react-dsfr";
import { FC, useMemo } from "react";

import { Service } from "@/@types/app";
import TextCopyToClipboard from "@/components/Utils/TextCopyToClipboard";

type ServiceAndStylesShareProps = {
    service?: Service;
};
const ServiceAndStylesShare: FC<ServiceAndStylesShareProps> = ({ service }) => {
    const currentStyleLayers = useMemo(() => service?.configuration.styles?.find((style) => style.current === true)?.layers, [service?.configuration.styles]);

    return (
        <div className={fr.cx("fr-col-12")}>
            <div className={fr.cx("fr-grid-row")}>
                <h3 className={fr.cx("fr-text--md", "fr-m-0")}>URL de diffusion</h3>
            </div>

            {/* Adresse du service de données */}
            <TextCopyToClipboard label={"Service de données"} text={service?.share_url ?? "Indisponible"} disabled={!service?.share_url} className="fr-mb-1w" />

            {currentStyleLayers && (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-mt-4v")}>
                        <h3 className={fr.cx("fr-text--md", "fr-m-0")}>
                            <strong>Fichiers de style courant</strong>
                        </h3>
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

export default ServiceAndStylesShare;
