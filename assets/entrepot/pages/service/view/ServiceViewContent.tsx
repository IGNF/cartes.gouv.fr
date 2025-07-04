import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useQuery } from "@tanstack/react-query";
import { CSSProperties, useEffect } from "react";

import { CartesStyle, OfferingTypeEnum, Service, StoredDataTypeEnum, TypeInfosWithBbox } from "@/@types/app";
import RMap, { MapInitial } from "@/components/Utils/RMap";
import { useManageStyle } from "@/contexts/ManageStyleContext";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import getWebService from "@/modules/WebServices/WebServices";
import ManageStyles from "./ManageStyles";
import ServiceAndStylesShare from "./ServiceAndStylesShare";
import StyleAddModifyForm from "./Style/StyleAddModifyForm";

type ServiceViewContent = {
    datastoreId: string;
    offeringId: string;
    datasheetName: string;
};

function ServiceViewContent(props: ServiceViewContent) {
    const { datastoreId, offeringId, datasheetName } = props;

    const serviceQuery = useQuery<Service, CartesApiException>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId),
        queryFn: ({ signal }) => api.service.getService(datastoreId, offeringId, { signal }),
        staleTime: 60000,
    });

    const { data: service } = serviceQuery;

    const { initialValues, setInitialValues, styleToAddOrEdit } = useManageStyle();

    useEffect(() => {
        (async function () {
            if (!serviceQuery.data || serviceQuery.data?.open === false) return;

            let initial: MapInitial = { type: serviceQuery.data.type, bbox: undefined, layers: [] };

            const infos = serviceQuery.data.configuration.type_infos as TypeInfosWithBbox;
            if (infos.bbox) {
                initial = { ...initial, bbox: infos.bbox };
            }

            const styles = serviceQuery.data.configuration.styles;
            const currentStyle = styles?.find((style) => style.current === true);
            const layers = await getWebService(serviceQuery.data).getLayers();
            initial = { ...initial, currentStyle, layers: layers ?? [] };
            setInitialValues(initial);
        })();
    }, [serviceQuery.data, setInitialValues]);

    const canManageStyles =
        serviceQuery.data?.type === OfferingTypeEnum.WFS ||
        (serviceQuery.data?.type === OfferingTypeEnum.WMTSTMS && serviceQuery.data.configuration.pyramid?.type === StoredDataTypeEnum.ROK4PYRAMIDVECTOR);

    const styles: CartesStyle[] = service?.configuration.styles ?? [];
    const styleNames = Array.from(styles, (s) => s.name);

    const customStyle: CSSProperties = {
        backgroundColor: fr.colors.decisions.background.contrast.grey.default,
    };

    return (
        <>
            <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <div className={fr.cx("fr-h6", "fr-p-2v")} style={customStyle}>
                        <i className={cx(fr.cx("fr-mr-1v"), "ri-eye-line")} />
                        {"Aperçu du style"}
                    </div>

                    {initialValues && <RMap initial={initialValues} />}
                </div>
                <div className={fr.cx("fr-col-12", "fr-col-md-4", "fr-px-2w")}>
                    <div className={fr.cx("fr-h6", "fr-p-2v")} style={customStyle}>
                        <i className={cx(fr.cx("fr-mr-1v"), "ri-palette-line")} />
                        {"Styles"}
                    </div>

                    <ServiceAndStylesShare service={serviceQuery.data} />
                    {canManageStyles && initialValues && (
                        <ManageStyles
                            initial={initialValues}
                            service={serviceQuery.data}
                            offeringId={offeringId}
                            datastoreId={datastoreId}
                            datasheetName={datasheetName}
                        />
                    )}
                </div>
            </div>
            <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                {service !== undefined && styleToAddOrEdit && (
                    <StyleAddModifyForm
                        key={styleToAddOrEdit.style_name || "add"}
                        datastoreId={datastoreId}
                        datasheetName={datasheetName}
                        editMode={Boolean(styleToAddOrEdit.style_name)}
                        service={service}
                        style={styleToAddOrEdit}
                        styleNames={styleNames}
                    />
                )}
            </div>
        </>
    );
}

export default ServiceViewContent;
