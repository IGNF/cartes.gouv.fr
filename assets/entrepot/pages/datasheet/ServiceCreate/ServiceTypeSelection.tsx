import { fr } from "@codegouvfr/react-dsfr";
import Select, { type SelectProps } from "@codegouvfr/react-dsfr/SelectNext";
import { useState } from "react";

import { OfferingTypeEnum } from "@/@types/app";
import DatasheetViewTab from "../DatasheetViewTab";
import ServiceInfoBanner from "../DatasheetView/ServiceListTab/ServiceInfoBanner";

const serviceTypeOptions: SelectProps.Option<OfferingTypeEnum | "">[] = [{ value: OfferingTypeEnum.WFS, label: "Flux WFS" }];

export default function ServiceTypeSelection() {
    const [selectedType, setSelectedType] = useState<OfferingTypeEnum | "">("");

    return (
        <DatasheetViewTab>
            <ServiceInfoBanner title="Chaque type de flux est adapté à un besoin particulier. Renseignez-vous avant de publier." linkHref="#" />

            <Select
                className={fr.cx("fr-mt-4w")}
                label="Type de service"
                placeholder="Sélectionner une option"
                options={serviceTypeOptions}
                nativeSelectProps={{
                    value: selectedType,
                    onChange: (e) => setSelectedType(e.target.value),
                }}
            />
        </DatasheetViewTab>
    );
}
