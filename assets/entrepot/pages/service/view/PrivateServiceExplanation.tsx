import { useTranslation } from "@/i18n";
import { routes } from "@/router/router";

type PrivateServiceExplanationProps = {
    datastoreId: string;
};
function PrivateServiceExplanation({ datastoreId }: PrivateServiceExplanationProps) {
    const { t: tCommon } = useTranslation("Common");

    return (
        <>
            <p>
                Ce service est privé et ne peut pas être visualisé directement sur cartes.gouv.fr. Cependant, il peut être visualisé dans un Système
                d’Information Géographique (SIG). Pour ce faire, vous devez d’abord créer une permission et ensuite créer une clé d’accès.
            </p>
            <p>
                Si le service a été créé sur cartes.gouv.fr, une permission a été automatiquement créée pour la communauté courante. Sinon, vous pouvez en créer
                une pour votre communauté soit en utilisant <a {...routes.datastore_add_permission({ datastoreId }).link}>ce formulaite</a>, soit en passant par
                l’API Entrepôt en suivant ce tutoriel :{" "}
                <a
                    href="https://geoplateforme.github.io/tutoriels/production/controle-des-acces/diffusion/permission/"
                    target="_blank"
                    rel="noreferrer"
                    title={tCommon("new_window")}
                >
                    Gestion des permissions
                </a>
                . Vous pouvez consulter vos permissions sur la page <a {...routes.my_permissions().link}>Mes permissions</a>.
            </p>

            <p>
                Ensuite, vous devez créer une clé d’accès soit en utilisant <a {...routes.user_key_add().link}>ce formulaite</a>, soit en passant par l’API
                Entrepôt en suivant ce tutoriel :{" "}
                <a
                    href="https://geoplateforme.github.io/tutoriels/production/controle-des-acces/diffusion/cle/"
                    target="_blank"
                    rel="noreferrer"
                    title={tCommon("new_window")}
                >
                    Gestion des clés
                </a>
                . Vous pouvez consulter vos clés sur la page <a {...routes.my_access_keys().link}>Mes clés d’accès</a>.
            </p>
            <p>
                Vous pouvez ensuite récupérer l’URL du service avec la clé sur la page Mes clés d’accès et l’utiliser pour visualiser votre service privé dans
                un SIG.
            </p>
        </>
    );
}

export default PrivateServiceExplanation;
