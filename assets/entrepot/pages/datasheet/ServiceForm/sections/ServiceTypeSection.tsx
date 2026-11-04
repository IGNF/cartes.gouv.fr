import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { type ReactNode } from "react";

import { externalLink } from "@/router/externalUrls";
import { type ServiceType } from "../serviceFormSchema";

type ServiceTypeOption = {
    type: ServiceType;
    label: string;
    description: string;
    dataKinds: ("Vecteur" | "Raster")[];
};

const options: ServiceTypeOption[] = [
    { type: "wfs", label: "Flux WFS", description: "Web Feature Service", dataKinds: ["Vecteur"] },
    { type: "wms", label: "Flux WMS", description: "Web Map Service", dataKinds: ["Vecteur", "Raster"] },
    { type: "tms", label: "Flux TMS", description: "Tile Map Service", dataKinds: ["Vecteur"] },
    { type: "wmts", label: "Flux WMTS", description: "Web Map Tile Service", dataKinds: ["Raster"] },
];

type ServiceTypeSectionProps = {
    value: ServiceType;
    onChange: (type: ServiceType) => void;
    /** types proposés ; les autres restent visibles mais désactivés */
    availableTypes: ServiceType[];
    disabled?: boolean;
};

export default function ServiceTypeSection({ value, onChange, availableTypes, disabled = false }: ServiceTypeSectionProps) {
    const optionLabel = (option: ServiceTypeOption): ReactNode => (
        <span className={fr.cx("fr-mr-1w")}>
            {option.label}
            {option.dataKinds.map((kind) => (
                <Badge key={kind} small noIcon className={fr.cx("fr-ml-1w", kind === "Vecteur" ? "fr-badge--green-emeraude" : "fr-badge--brown-caramel")}>
                    {kind}
                </Badge>
            ))}
        </span>
    );

    return (
        <div>
            <RadioButtons
                legend="Type de flux"
                hintText="Chaque type de flux est adapté à un besoin particulier."
                options={options.map((option) => ({
                    label: optionLabel(option),
                    hintText: option.description,
                    nativeInputProps: {
                        name: "service-type",
                        value: option.type,
                        checked: value === option.type,
                        onChange: () => onChange(option.type),
                        disabled: disabled || !availableTypes.includes(option.type),
                    },
                }))}
            />
            <a {...externalLink("helpProducerGuideChooseServiceType", "Comment choisir le type de flux à publier ?")} className={fr.cx("fr-link")}>
                Comment choisir le type de flux à publier ?
            </a>
        </div>
    );
}
