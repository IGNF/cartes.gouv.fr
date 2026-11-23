import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import type Layer from "ol/layer/Layer";
import { useEffect, useState } from "react";

import { type Service } from "@/@types/app";
import RMap from "@/components/Utils/RMap";
import StylesList from "@/entrepot/pages/service/view/Style/StylesList";
import useServiceRights from "@/hooks/useServiceRights";
import { useTranslation } from "@/i18n";
import getWebService from "@/modules/WebServices/WebServices";
import { getServiceType } from "@/utils";

type ServicePreviewSectionProps = {
    datastoreId: string;
    datasheetName: string;
    service: Service;
};

export default function ServicePreviewSection({ datastoreId, datasheetName, service }: ServicePreviewSectionProps) {
    const { t } = useTranslation("ServicePage");
    const { canEdit } = useServiceRights();
    const type = getServiceType(service);
    const canManageStyles = canEdit && (type === "wfs" || type === "tms");

    const typeInfos = service.configuration.type_infos;
    const bbox = "bbox" in typeInfos ? typeInfos.bbox : undefined;
    const showMap = service.open && bbox !== undefined;

    const [olLayers, setOlLayers] = useState<Layer[]>([]);
    useEffect(() => {
        if (!showMap) return;
        let cancelled = false;
        // shortcut: flux non affichable (type ou pyramide inconnus, capacités illisibles) = carte sans couche, à revoir avec les classes WebServices
        const loadLayers = async (): Promise<Layer[]> => {
            try {
                return await getWebService(service).getLayers();
            } catch {
                return [];
            }
        };
        void loadLayers().then((layers) => {
            if (!cancelled) setOlLayers(layers);
        });
        return () => {
            cancelled = true;
        };
    }, [service, showMap]);

    const currentStyle = service.configuration.styles?.find((style) => style.current);

    const preview = !service.open ? (
        <Alert severity="info" small description={t("preview.restricted")} />
    ) : bbox === undefined ? (
        <p className={fr.cx("fr-mb-0")}>{t("preview.no_bbox")}</p>
    ) : (
        <RMap key={service._id} layers={olLayers} currentStyle={currentStyle} type={service.type} bbox={bbox} />
    );

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            <div className={fr.cx("fr-col-12", canManageStyles && "fr-col-md-8")}>{preview}</div>
            {canManageStyles && (
                <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                    <StylesList datastoreId={datastoreId} datasheetName={datasheetName} offeringId={service._id} service={service} />
                </div>
            )}
        </div>
    );
}
