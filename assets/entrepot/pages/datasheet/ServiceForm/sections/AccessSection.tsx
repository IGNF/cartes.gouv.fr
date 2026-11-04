import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useFormContext, useWatch } from "react-hook-form";

import ImageFieldUpload from "@/components/Input/ImageFieldUpload";
import { type ServiceAccess, type ServiceFormValues } from "../serviceFormSchema";
import { SERVICE_IMAGE_ACCEPT, SERVICE_IMAGE_MAX_SIZE_MO } from "./ServiceDescriptionSection";

type AccessOption = { value: ServiceAccess; label: string; hintText: string };

const accessOptions: AccessOption[] = [
    {
        value: "public",
        label: "Accès libre pour tous",
        hintText: "En acceptant, le service sera accessible à tout utilisateur, dans cartes.gouv.fr ou tout autre outil tiers.",
    },
    {
        value: "restricted_visible",
        label: "Flux restreint mais visible pour tous sur cartes.gouv.fr",
        hintText: "Le service sera visible sur cartes.gouv.fr mais une clé d’accès sera nécessaire pour accéder au flux dans les outils tiers.",
    },
    {
        value: "restricted",
        label: "Flux restreint pour tous",
        hintText: "Le service ne sera visible qu’aux utilisateurs disposant d’une clé d’accès, dans cartes.gouv.fr ou tout autre outil tiers.",
    },
];

type AccessSectionProps = {
    /** l’entrepôt dispose d’un endpoint ouvert / privé pour ce type de flux */
    hasPublicEndpoint: boolean;
    hasPrivateEndpoint: boolean;
    /** droit ANNEX : le logo n’est proposé qu’avec ce droit */
    canManageAnnexes: boolean;
};

export default function AccessSection({ hasPublicEndpoint, hasPrivateEndpoint, canManageAnnexes }: AccessSectionProps) {
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<ServiceFormValues>();

    const attributionEnabled = useWatch({ control, name: "attribution_enabled" });

    return (
        <div>
            <RadioButtons
                legend="Accès"
                state={errors.access ? "error" : "default"}
                stateRelatedMessage={errors.access?.message}
                options={accessOptions.map((option) => ({
                    label: option.label,
                    hintText: option.hintText,
                    nativeInputProps: {
                        ...register("access"),
                        value: option.value,
                        disabled: option.value === "public" ? !hasPublicEndpoint : !hasPrivateEndpoint,
                    },
                }))}
            />

            <h3 className={fr.cx("fr-h6", "fr-mt-4w")}>Droits et attributions</h3>
            <p>
                Ajouter une attribution pour que les utilisateurs de vos services affichent une mention sur leurs cartes. Elle indique la source de données et
                permet un renvoi vers un site internet ou une licence.
            </p>

            <Checkbox
                options={[
                    {
                        label: "Ajouter une attribution",
                        nativeInputProps: { ...register("attribution_enabled") },
                    },
                ]}
            />

            {attributionEnabled && (
                <div className={fr.cx("fr-ml-4w")}>
                    <Input
                        label="Texte à afficher"
                        state={errors.attribution_title ? "error" : "default"}
                        stateRelatedMessage={errors.attribution_title?.message}
                        nativeInputProps={{ ...register("attribution_title") }}
                    />
                    <Input
                        label="URL de l’attribution"
                        hintText="Site web de l’organisme producteur, conditions d’utilisation des données ou toute autre URL en lien avec les données"
                        state={errors.attribution_url ? "error" : "default"}
                        stateRelatedMessage={errors.attribution_url?.message}
                        nativeInputProps={{ ...register("attribution_url"), type: "url" }}
                    />
                    {canManageAnnexes && (
                        <ImageFieldUpload
                            name="attribution_logo"
                            label="Logo (optionnel)"
                            hintText={`Taille maximale : ${SERVICE_IMAGE_MAX_SIZE_MO} Mo. Formats supportés : jpg, png.`}
                            modalTitle="Ajouter un logo"
                            accept={SERVICE_IMAGE_ACCEPT}
                            maxFileSizeMo={SERVICE_IMAGE_MAX_SIZE_MO}
                            crop={false}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
