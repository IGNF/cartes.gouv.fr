import { routes } from "@/router/router";

import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";

import ovoidSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/background/ovoid.svg";
import padlockSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/system/padlock.svg?no-inline";

type PrivateServiceExplanationProps = {
    datastoreId: string;
};
function PrivateServiceExplanation({ datastoreId }: PrivateServiceExplanationProps) {
    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--center", "fr-grid-row--middle")}>
            <div className={fr.cx("fr-py-0", "fr-col-12", "fr-col-md-6")}>
                <h2>Service privé</h2>

                <p className={fr.cx("fr-text--lead", "fr-mb-3w")}>Ce service est privé et ne peut être affiché sur cartes.gouv.fr.</p>

                <p className={fr.cx("fr-text--sm")}>
                    Vous pouvez visualiser ce service sous un logiciel SIG (Système d’Information Géographique) à l’aide d’une clé d’accès. Vous pouvez créer,
                    modifier ou retrouver toutes vos clés d’accès depuis votre tableau de bord.
                </p>

                <p className={fr.cx("fr-text--sm", "fr-mb-5w")}>
                    Si vous souhaitez partager ce service avec d’autres personnes, il est nécessaire de configurer au préalable les permissions afin qu’elles
                    puissent créer leur propre clé.
                </p>

                <ul className={fr.cx("fr-btns-group", "fr-btns-group--inline-md")}>
                    <li>
                        <Button {...routes.my_access_keys().link}>Voir mes clé d’accès</Button>
                    </li>
                    <li>
                        <Button {...routes.datastore_add_permission({ datastoreId }).link} className={fr.cx("fr-btn--secondary")}>
                            Configurer les permissions
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
                        <use className={fr.cx("fr-artwork-decorative")} href={`${padlockSvgUrl}#artwork-decorative`} />
                        <use className={fr.cx("fr-artwork-minor")} href={`${padlockSvgUrl}#artwork-minor`} />
                        <use className={fr.cx("fr-artwork-major")} href={`${padlockSvgUrl}#artwork-major`} />
                    </g>
                </svg>
            </div>
        </div>
    );
}

export default PrivateServiceExplanation;
