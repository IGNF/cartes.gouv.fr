import { fr } from "@codegouvfr/react-dsfr";

import AppLayout from "../components/Layout/AppLayout";
import { routes } from "../router/router";
import Card from "@codegouvfr/react-dsfr/Card";

const Offer = () => {
    return (
        <AppLayout documentTitle="Offre">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Offre</h1>

                    <p>Cartes.gouv.fr est le nouveau service public des cartes et données du territoire.</p>
                    <p>
                        Ce site vise à proposer des services qui vont s’enrichir pour permettre à chacun de créer, héberger, contribuer, partager, visualiser et
                        publier des données et des cartes en autonomie en utilisant les ressources proposées par la Géoplateforme.
                    </p>
                    <p>
                        Cartes.gouv.fr est à la fois l’interface de visualisation et un panneau de contrôle de la Géoplateforme&nbsp;: pour accéder aux nouveaux
                        services de la Géoplateforme, connectez-vous via le site cartes.gouv.fr.
                    </p>
                    <p>Au 27 juin 2024, Cartes.gouv.fr en version bêta vous permet d’accéder à&nbsp;:</p>
                    <ul>
                        <li>
                            Un <strong>catalogue recensant les géodonnées du territoire français et les géoservices associés</strong>, avec leurs descriptions
                            détaillées (métadonnées).
                            <br />
                            L’interface du catalogue vous permet d’affiner vos recherches grâce à des mots-clés et des filtres avancés. Visualisez ensuite les
                            métadonnées et les géodonnées pertinentes, accédez aux géoservices associés et téléchargez les données dont vous avez besoin.
                        </li>
                        <li>
                            Un <strong>espace personnel pour partager vos données vectorielles via des géoservices WFS, TMS et WMS</strong>.
                        </li>
                    </ul>
                    <p>Le parcours utilisateur vous permet de créer et publier vos géoservices étape par étape&nbsp;:</p>
                    <ul>
                        <li>Alimentation de géodonnées&nbsp;: Téléversez vos données vectorielles sur l’entrepôt de la Géoplateforme.</li>
                        <li>Intégration des géodonnées&nbsp;: Stockez vos données de manière pérenne et exploitable pour les services de diffusion.</li>
                        <li>
                            Configuration des géoservices : Personnalisez vos services en définissant le nom, les contrôles d’accès, le type de service, les
                            styles et les métadonnées.
                        </li>
                        <li>Publication des services : Rendez vos données accessibles à tous ou à un public restreint.</li>
                    </ul>
                    <p>
                        Vous pouvez rejoindre une communauté existante et configurer vos géoservices sur le même espace de travail que vos collègues, ou
                        demander la création de votre espace de travail (disponibles dès l’offre «&nbsp;Essentielle&nbsp;»). L’entrepôt de votre espace de
                        travail dans lequel vos données et configurations sont stockées rejoindra à terme le pool d’entrepôts de votre organisme sans perte de
                        données ou intervention de votre part.
                    </p>
                    <h2>La Géoplateforme</h2>
                    <p>
                        Plateforme ouverte et collaborative, la Géoplateforme vous permet d’héberger, de partager, de visualiser et de publier vos géodonnées en
                        toute autonomie. Depuis l’été 2023, la Géoplateforme se déploie progressivement, ce qui vous permet, dès à présent, de pouvoir en
                        utiliser les premières fonctionnalités au travers de nombreuses API, celles-ci même utilisées par Cartes.gouv.fr.
                    </p>
                    <p>En particulier, vous pouvez accéder aux services&nbsp;:</p>
                    <ul>
                        <li>
                            De diffusion qui permettent d’accéder à des flux de données géographiques de la Géoplateforme dans des applications web ou dans des
                            SIG (WMTS, tuiles vectorielles TMS, WMS-Raster, WMS-Vecteur et WFS)&nbsp;;
                        </li>
                        <li>
                            De téléchargement, conforme au standard Atom et qui permet de découvrir et télécharger des fichiers de données de la
                            Géoplateforme&nbsp;;
                        </li>
                        <li>De découverte CSW qui permet la recherche et la consultation de métadonnées de données et services de la Geoplateforme&nbsp;;</li>
                        <li>
                            De géocodage et d’autocomplétion qui permettent réciproquement d’obtenir des coordonnées à partir d’une adresse (ou l’inverse...) et
                            de suggérer des localisants possibles au fur et à mesure de la saisie d’adresses ou de nom de lieux / points d’intérêt&nbsp;;{" "}
                        </li>
                        <li>De calcul altimétrique qui permet d’obtenir l’altitude d’un point géographique et un profil en long&nbsp;;</li>
                        <li>De recherche qui permet d’effectuer des recherches sur les données présentes dans la Géoplateforme&nbsp;; </li>
                        <li>
                            De calcul d’itinéraire et d’isochrone / isodistance qui permettent d’obtenir un itinéraire entre deux points ou d’obtenir la zone
                            accessible en un certain temps de parcours&nbsp;;
                        </li>
                        <li>
                            D’alimentation, de traitement et de diffusion qui permet de charger, d’effectuer des traitements et de publier des données en toute
                            autonomie.
                        </li>
                    </ul>

                    <h2>L’offre Géoplateforme</h2>

                    <p>Sur la Géoplateforme, l’utilisation des géodonnées et géoservices est gratuite (sauf licence spécifique).</p>
                    <p>
                        L’hébergement et la diffusion des données sont gratuits pour la plupart des producteurs de données. La bascule vers une offre premium
                        payante se fera, pour certains d’entre eux, en fonction des volumes de données stockées et diffusées. Seuls quelques producteurs, ayant
                        un impact significatif d’usage de la Géoplateforme, contribueront à l’équilibre économique de la plateforme.
                    </p>
                </div>
            </div>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-3w")}>
                <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
                    <Card
                        desc={
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: "1 entrepôt<br/>500Go hébergés<br/>50 couches de données<br/>1To max de données utilisées<br/>Animation des communautés de contributeurs<br/>Support par mail<br/><br/><br/>",
                                }}
                            />
                        }
                        title="Offre Essentielle"
                        titleAs="h3"
                        endDetail="Gratuit"
                    />
                </div>
                <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
                    <Card
                        desc={
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: "Plusieurs entrepôts<br/>20To hébergés<br/>Couches de données illimitées<br/>Au delà de 1To de données utilisées (tarif dégressif selon volume)<br/>Animation de communautés contributeurs<br/>Support par mail et formation<br/>Participation à la gouvernance",
                                }}
                            />
                        }
                        title="Offre Premium"
                        titleAs="h3"
                        endDetail="à partir de 10k€ par an"
                    />
                </div>
            </div>

            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <p>Bon à savoir&nbsp;: un bac à sable (offre Découverte) permettra de découvrir les fonctions d’alimentation et diffusion.</p>

                    <p>
                        <a {...routes.terms_of_service().link}>Conditions générales d’utilisation</a>
                    </p>
                    <p>
                        <a {...routes.contact().link}>Nous écrire</a>
                    </p>
                </div>
            </div>
        </AppLayout>
    );
};

export default Offer;
