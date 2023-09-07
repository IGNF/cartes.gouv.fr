import { fr } from "@codegouvfr/react-dsfr";

import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";
import { routes } from "../../router/router";

const LegalNotice = () => {
    const siteName = "cartes.gouv.fr";

    return (
        <AppLayout navItems={defaultNavItems} documentTitle="Mentions légales">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Mentions légales</h1>

                    <h2>Éditeur</h2>

                    <p>
                        Le site {siteName} est édité par l’Institut national de l’information géographique et forestière (IGN), 73 avenue de Paris, 94165
                        SAINT-MANDE CEDEX, France.
                    </p>

                    <p>Tél. : 01 43 98 80 00</p>

                    <p>Directeur de la publication : Sébastien Soriano, Directeur général de l&apos;IGN.</p>

                    <h2>Hébergeur</h2>

                    <p>Le site {siteName} est hébergé par OVH SAS, 2 rue Kellermann, 59100 Roubaix, Fance.</p>

                    <h2>Traitement des données à caractère personnel</h2>

                    <p>
                        Les informations issues des formulaires d’inscription au site sont utilisées exclusivement pour la gestion des permissions d’accès aux
                        différents contenus et fonctionnalités du site {siteName}.
                    </p>

                    <p>Le destinataire des données est l’IGN.</p>

                    <p>
                        Conformément à la loi « Informatique et libertés » du 6 janvier 1978, vous bénéficiez d’un droit d’accès et de rectification des
                        informations qui vous concernent, que vous pouvez exercer en vous adressant à l’IGN aux coordonnées accessibles via le lien « Nous
                        écrire » dans la rubrique aide.
                    </p>

                    <p>
                        <a href={routes.personal_data().href}>En savoir plus sur les données à caractère personnel</a>
                    </p>

                    <h2>Droit de propriété intellectuelle</h2>

                    <p>
                        Les illustrations, le contenu éditorial, les divers éléments de la charte graphique ainsi que les données cartographiques issues de la
                        consultation en ligne figurant sur le site {siteName} sont des éléments dont l’IGN détient la propriété ou le droit d’exploitation.
                    </p>

                    <p>L’utilisation des documents ou éléments du site est soumise à l’accord préalable de notre établissement.</p>

                    <h2>Liens hypertextes proposés sur {siteName}</h2>

                    <p>
                        Les liens insérés dans les pages du site {siteName} vers des sites tiers sont proposés à titre d’information ; le contenu des sites vers
                        lesquels ces liens conduisent n’engage pas la responsabilité de l’éditeur.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
};

export default LegalNotice;
