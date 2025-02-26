import { routes } from "@/router/router";

import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";

import ovoidSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/background/ovoid.svg";
import locationFranceSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/map/location-france.svg";

type PrivateServiceExplanationProps = {
    datastoreId: string;
};
function PrivateServiceExplanation({ datastoreId }: PrivateServiceExplanationProps) {
    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--center", "fr-grid-row--middle")}>
            <div className={fr.cx("fr-py-0", "fr-col-12", "fr-col-md-6")}>
                <p className={fr.cx("fr-text--lead", "fr-mb-3w")}>Ce service est privé et ne peux donc pas être affiché sur cartes.gouv.fr.</p>

                <p className={fr.cx("fr-text--sm")}>
                    Vous pouvez utiliser un logiciel SIG (Système d’Information Géographique) pour le visualiser. Au préalable vous devez créer une clé d’accès
                    ou modifier une de vos clés d’accès existantes.
                </p>

                <p className={fr.cx("fr-text--sm", "fr-mb-5w")}>
                    Pour donner accès à d’autres personnes, vous pouvez leur donner une permission individuelle ou donner une permission à une communauté dont
                    elles sont membres. Elles pourront ensuite configurer leurs propres clés.
                </p>

                <ul className={fr.cx("fr-btns-group", "fr-btns-group--inline-md")}>
                    <li>
                        <Button {...routes.my_access_keys().link}>Ajouter ou modifier une clé d’accès</Button>
                    </li>
                    <li>
                        <Button {...routes.datastore_add_permission({ datastoreId }).link} className={fr.cx("fr-btn--secondary")}>
                            Configurer des permissions
                        </Button>
                    </li>
                </ul>
            </div>
            <div className={fr.cx("fr-col-12", "fr-col-md-3", "fr-col-offset-md-1", "fr-px-6w", "fr-px-md-0", "fr-py-0")}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={"fr-responsive-img fr-artwork"}
                    aria-hidden="true"
                    width="160"
                    height="200"
                    viewBox="0 0 160 200"
                >
                    <use className={fr.cx("fr-artwork-motif")} href={`${ovoidSvgUrl}#artwork-motif`} />
                    <use className={fr.cx("fr-artwork-background")} href={`${ovoidSvgUrl}#artwork-background`} />
                    <g transform="translate(40, 60)">
                        <use className={fr.cx("fr-artwork-decorative")} href={`${locationFranceSvgUrl}#artwork-decorative`} />
                        <use className={fr.cx("fr-artwork-minor")} href={`${locationFranceSvgUrl}#artwork-minor`} />
                        <use className={fr.cx("fr-artwork-major")} href={`${locationFranceSvgUrl}#artwork-major`} />
                    </g>
                </svg>
            </div>
        </div>
    );
}

export default PrivateServiceExplanation;
