import { fr } from "@codegouvfr/react-dsfr";

import Main from "../../components/Layout/Main";
import { routes } from "../../router/router";

import { SummaryLink } from "@/@types/app";
import { Summary } from "@codegouvfr/react-dsfr/Summary";

import "../../sass/components/summary.scss";

const TermsOfService = () => {
    const links: SummaryLink[] = [
        {
            text: "Accès aux API par les Utilisateurs Géoplateforme",
            linkProps: { href: "#anchor-1" },
            subLinks: [
                { text: "Accès aux API et à leur documentation par l’Utilisateur Géoplateforme", linkProps: { href: "#anchor-1.1" } },
                { text: "Création d’un compte par l’Utilisateur Géoplateforme", linkProps: { href: "#anchor-1.2" } },
                {
                    text: "Suppression du compte",
                    linkProps: { href: "#anchor-1.3" },
                    subLinks: [
                        { text: "Suppression à la demande de l’Utilisateur Géoplateforme", linkProps: { href: "#anchor-1.3.1" } },
                        { text: "Suppression à l’initiative de l’IGN", linkProps: { href: "#anchor-1.3.2" } },
                    ],
                },
                {
                    text: "Accès et utilisation de certaines API après authentification de l’Utilisateur Géoplateforme auprès d’un fournisseur d’identité",
                    linkProps: { href: "#anchor-1.4" },
                },
                { text: "Aucun transfert de droit ou licence en accédant à l’API", linkProps: { href: "#anchor-1.5" } },
            ],
        },
        {
            text: "Utilisation des API",
            linkProps: { href: "#anchor-2" },
            subLinks: [
                { text: "Utilisation conforme des API par l’Utilisateur Géoplateforme", linkProps: { href: "#anchor-2.1" } },
                { text: "Droits des Fournisseurs d’API", linkProps: { href: "#anchor-2.2" } },
                { text: "Droits des Fournisseurs de données", linkProps: { href: "#anchor-2.3" } },
                { text: "Droits concédés par le Fournisseur de données et par le Fournisseur d’API", linkProps: { href: "#anchor-2.4" } },
                { text: "Blocage d’accès et d’utilisation", linkProps: { href: "#anchor-2.5" } },
            ],
        },
        {
            text: "ENGAGEMENTS DE L’IGN",
            linkProps: { href: "#anchor-3" },
            subLinks: [
                { text: "Obligations de l’IGN en tant qu’opérateur de la Géoplateforme", linkProps: { href: "#anchor-3.1" } },
                { text: "Hébergement des jeux de données et suppression des jeux de données hébergées", linkProps: { href: "#anchor-3.2" } },
                { text: "Niveau de service", linkProps: { href: "#anchor-3.3" } },
                {
                    text: "Obligation d’information et de suivi en cas d’incident lors de l’utilisation de la Géoplateforme",
                    linkProps: { href: "#anchor-3.4" },
                },
            ],
        },
        {
            text: "Clauses diverses",
            linkProps: { href: "#anchor-4" },
            subLinks: [
                { text: "Notification par l’Utilisateur Géoplateforme de la Géoplateforme", linkProps: { href: "#anchor-4.1" } },
                { text: "Loi applicable – litiges", linkProps: { href: "#anchor-4.2" } },
                { text: "Divisibilité", linkProps: { href: "#anchor-4.3" } },
            ],
        },
        { text: "Annexe 1 : Liste des API de la Géoplateforme", linkProps: { href: "#anchor-annexe-1", className: "frx-nonumber" } },
        { text: "Annexe 2 : Offre Géoplateforme", linkProps: { href: "#anchor-annexe-2", className: "frx-nonumber" } },
        { text: "Annexe 3 : Accord de niveau de service", linkProps: { href: "#anchor-annexe-3", className: "frx-nonumber" } },
    ];

    return (
        <Main title="Conditions générales d’utilisation">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Conditions générales d’utilisation</h1>

                    <p>
                        <em>Version du 15 octobre 2024 – Institut national de l’information géographique et forestière (IGN)</em>
                    </p>

                    <Summary className={fr.cx("fr-mb-4w")} title={"Sommaire"} as={"h2"} links={links} />

                    <p>
                        La Géoplateforme est une plateforme ouverte et mutualisée de géodonnées hébergeant et exposant des API, accessibles depuis une
                        «&nbsp;URL&nbsp;» (Uniform Resource Locator) spécifique à chaque API. Chacune de ces API est une bibliothèque de fonctions structurée
                        permettant d’interagir avec un système d’information, ces API sont listées en Annexe 1 (ci-après «&nbsp;API&nbsp;»).
                    </p>

                    <p>
                        La Géoplateforme est éditée, développée et opérée par l’Institut national de l’information géographique et forestière (ci-après
                        «&nbsp;IGN&nbsp;»), établissement public à caractère administratif de l’État, immatriculé sous le numéro SIREN 180 067 019, dont le
                        siège est au 73 avenue de Paris, 94160 SAINT-MANDÉ.
                    </p>

                    <p>Les conditions générales d’utilisation des API (ci-après «&nbsp;CGU&nbsp;») ont pour objet de définir&nbsp;:</p>
                    <ul>
                        <li>les conditions dans lesquelles l’IGN met à disposition les API en tant qu’opérateur de la Géoplateforme, et</li>
                        <li>les conditions d’accès et d’utilisation de ces API.</li>
                    </ul>
                    <p>Certaines API peuvent prévoir des conditions spécifiques complémentaires, disponibles dans leur documentation propre.</p>

                    <p>
                        Pour les API permettant l’hébergement, la gestion collaborative et la diffusion de données, les CGU s’appliquent dans le respect des
                        fonctionnalités de l’offre souscrite par vous-même ou par l’entité que vous représentez/pour laquelle vous travaillez (Offre Essentielle
                        ou Premium, définie en <a href="#anchor-annexe-2">Annexe 2</a>) et sous réserve de conventions dérogatoires.
                    </p>

                    <p>
                        Les CGU sont accessibles à tout moment depuis les métadonnées de service de chaque API et sur le site Internet cartes.gouv.fr (ci-après
                        le «&nbsp;Site&nbsp;»).
                    </p>

                    <p>En utilisant une API, vous déclarez et garantissez que&nbsp;:</p>

                    <ul>
                        <li>Vous avez la capacité pour contracter ou avez obtenu le consentement de la personne dûment autorisée,</li>
                        <li>Vous avez reçu toute délégation et pouvoir si vous agissez pour le compte de votre employeur,</li>
                        <li>Vous vous engagez à respecter les CGU tout au long de l’utilisation des API.</li>
                    </ul>

                    <p>
                        Les CGU peuvent à tout moment être modifiées afin de s’adapter aux évolutions techniques, réglementaires ou économiques. Sauf lorsqu’un
                        changement urgent est requis notamment pour des raisons de sécurité, l’IGN informera, avec un préavis minimum de 30 jours, avant toute
                        modification importante des CGU en affichant un avis visible sur le Site et/ou en vous envoyant un courriel, dans la mesure où vous avez
                        un compte utilisateur sur le Site. Il vous appartient de vérifier la version en vigueur des CGU à chaque utilisation des API.
                    </p>

                    <p>
                        Si vous ne souhaitez pas être lié par la nouvelle version des CGU, il vous appartient de cesser toute nouvelle utilisation des API et
                        mettre en œuvre tous les moyens pour faire cesser toute utilisation par vos Utilisateurs Finaux (ci-après définis). Votre utilisation
                        continue des API après une modification des CGU constitue votre consentement à ces modifications.
                    </p>

                    <p>Est défini comme&nbsp;:</p>

                    <ul>
                        <li>
                            <strong>Utilisateur API</strong>&nbsp;: toute personne physique utilisant une API.
                        </li>
                        <li>
                            <strong>Fournisseur d’API</strong>&nbsp;: toute personne physique mettant à disposition une API.
                        </li>
                        <li>
                            <strong>Fournisseur de données</strong>&nbsp;: Utilisateur API téléversant un ou plusieurs jeux de données (données, métadonnées et
                            documents) pour les mettre à disposition, après d’éventuels traitements, via une API soit au public, soit à des personnes
                            autorisées.
                        </li>
                        <li>
                            <strong>Développeur</strong>&nbsp;: Utilisateur API effectuant un développement (par exemple&nbsp;: site Internet, application web,
                            application mobile) à des fins commerciales ou non, exploitant au moins une API, accessible directement par un Utilisateur Final.
                        </li>
                        <li>
                            <strong>Utilisateur Final</strong>&nbsp;: toute personne physique qui accède au développement proposé par un Développeur.
                        </li>
                        <li>
                            <strong>Utilisateur Géoplateforme</strong>&nbsp;: toute personne physique accédant à la Géoplateforme comme l’Utilisateur API, le
                            Développeur, le Fournisseur de données ou le Fournisseur d’API.
                        </li>
                        <li>
                            <strong>Endpoint public</strong>&nbsp;: point de diffusion de données (par exemple de type WFS) dépourvu de contrôle d’accès
                            c’est-à-dire permettant à tout Utilisateur Géoplateforme d’accéder librement à toutes les données qui y sont exposées ; ce type de
                            Endpoint est donc destiné aux données libres.
                        </li>
                        <li>
                            <strong>Endpoint privé</strong>&nbsp;: point de diffusion de données (par exemple de type WFS) doté d’un contrôle d’accès
                            c’est-à-dire imposant à tout Utilisateur Géoplateforme de bénéficier d’une permission d’accès associée à une clé alphanumérique à
                            joindre aux requêtes pour accéder aux données autorisées ; ce type de Endpoint est donc destiné aux données non libres pour
                            lesquelles le Fournisseur de données souhaite mettre en œuvre une restriction d’accès.
                        </li>
                    </ul>

                    <h2 id="anchor-1" tabIndex={-1}>
                        1. Accès aux API par les Utilisateurs Géoplateforme
                    </h2>

                    <h3 id="anchor-1.1" tabIndex={-1}>
                        1.1. Accès aux API et à leur documentation par l’Utilisateur Géoplateforme
                    </h3>

                    <p>Chaque API est mise à disposition via une URL dédiée, accessible sur le Site.</p>

                    <p>Une documentation détaillée de chaque API est également proposée sur le Site.</p>

                    <p>
                        L’accès à certaines API peut être soumis à la création d’un compte sur le Site et/ou à une authentification spécifique, selon leur
                        documentation.
                    </p>

                    <h3 id="anchor-1.2" tabIndex={-1}>
                        1.2. Création d’un compte par l’Utilisateur Géoplateforme
                    </h3>

                    <p>Vous pouvez gratuitement créer un compte sur le Site.</p>

                    <p>
                        Vous devez veiller à ce que les informations que vous renseignez lors de la création du compte soient correctes et complètes. Il n’est
                        pas possible de renseigner une adresse électronique temporaire lors de la création d’un compte sur le Site. Un courriel de confirmation
                        vous est envoyé afin de valider cette création. Toute création de compte mal renseignée justifie un rejet de création de compte de la
                        part de l’IGN.
                    </p>

                    <p>
                        Le statut de professionnel ou de particulier que vous choisissez lors de la création de ce compte doit notamment être conforme avec
                        l’usage que vous projetez de la plateforme.
                    </p>

                    <p>
                        Vous assurez la confidentialité de vos éléments de connexion (nom d’utilisateur, mot de passe). Ces éléments vous sont personnels et
                        vous ne devez pas les partager ou les transférer.
                    </p>

                    <p>Vous devez alerter sans délai l’IGN de toute utilisation anormale ou frauduleuse de vos éléments de connexion ou de votre compte.</p>

                    <h3 id="anchor-1.3" tabIndex={-1}>
                        1.3. Suppression du compte
                    </h3>

                    <h4 id="anchor-1.3.1" tabIndex={-1}>
                        1.3.1. Suppression à la demande de l’Utilisateur Géoplateforme
                    </h4>

                    <p>Vous pouvez supprimer votre compte à tout moment.</p>

                    <p>La suppression de votre compte est effective, après confirmation de votre part de cette demande de suppression.</p>

                    <p>
                        Avant de confirmer votre demande de suppression, il vous appartient de procéder aux sauvegardes des éventuelles données stockées sur
                        votre compte&nbsp;; aucune récupération de ces données ne sera réalisée par l’IGN.
                    </p>

                    <h4 id="anchor-1.3.2" tabIndex={-1}>
                        1.3.2. Suppression à l’initiative de l’IGN
                    </h4>

                    <p>
                        L’IGN se réserve le droit de supprimer votre compte, sans préavis, en cas de non-respect de votre part des CGU ou en cas de violation
                        des lois et réglementations en vigueur. Dans ces cas, vous ne pouvez pas vous y opposer ou prétendre à une quelconque restitution pour
                        la perte des données qui étaient stockées sur votre compte et vous ne pouvez pas être indemnisé à raison d’une perte éventuelle de
                        données.
                    </p>

                    <h3 id="anchor-1.4" tabIndex={-1}>
                        1.4. Accès et utilisation de certaines API après authentification de l’Utilisateur Géoplateforme auprès d’un fournisseur d’identité
                    </h3>

                    <p>Certaines API sont accessibles et utilisables après authentification auprès de l’un des fournisseurs d’identité suivants&nbsp;:</p>

                    <ul>
                        <li>FranceConnect,</li>
                        <li>AgentConnect & ProConnect.</li>
                    </ul>

                    <h3 id="anchor-1.5" tabIndex={-1}>
                        1.5. Aucun transfert de droit ou licence en accédant à l’API
                    </h3>

                    <p>L’accès à une API ne confère aucun droit de propriété intellectuelle sur l’API et sur les données mises à disposition via l’API.</p>

                    <h2 id="anchor-2" tabIndex={-1}>
                        2. Utilisation des API
                    </h2>

                    <h3 id="anchor-2.1" tabIndex={-1}>
                        2.1. Utilisation conforme des API par l’Utilisateur Géoplateforme
                    </h3>

                    <p>
                        Vous vous engagez à utiliser l’API dans le respect de sa documentation, des conditions du niveau d’offre souscrit (
                        <a href="#anchor-annexe-2">Annexe 2</a>) et à vous adapter aux évolutions et mises à jour de l’API. Vous êtes seul responsable de
                        l’usage que vous faites de l’API, lequel doit être strictement conforme aux CGU, aux lois et réglementations en vigueur.
                    </p>

                    <p>
                        En cas de manquement de votre part aux CGU ou aux lois et réglementations en vigueur, le Fournisseur d’API, le Fournisseur de données et
                        l’IGN ne peuvent pas être tenus responsables de tout préjudice causé par vous-même ou vos ayants droit (notamment, pour le
                        Développeur&nbsp;: vos Utilisateurs Finaux) lié à l’utilisation de l’API et à l’utilisation/réutilisation des données mises à
                        disposition à partir de l’API.
                    </p>

                    <p>
                        Les données contenues dans les API sont soumises à la licence choisie et renseignée par le Fournisseur de données, accessible depuis les
                        métadonnées de données de l’API. Vous vous engagez à respecter les termes de la licence attachée à ces données, notamment en
                        utilisant/réutilisant un jeu de données.
                    </p>

                    <p>Vous vous engagez à&nbsp;:</p>

                    <ul>
                        <li>ne pas nuire, entraver ou fausser le bon fonctionnement des API&nbsp;;</li>
                        <li>
                            ne pas contourner les moyens mis en œuvre afin de garantir la sécurité des API et/ou des données mises à disposition à partir des
                            API&nbsp;;
                        </li>
                        <li>
                            respecter strictement les CGU et les faire respecter par les personnes dont vous êtes responsable ou avec lesquelles vous êtes
                            contractuellement lié, notamment vos préposés, agents, Utilisateurs Finaux, prestataires et fournisseurs.
                        </li>
                    </ul>

                    <p>Vous vous engagez également à ce que l’usage que vous faites et que vos Utilisateurs Finaux font des API&nbsp;:</p>
                    <ul>
                        <li>
                            n’incite pas à la haine ou ne véhicule pas des menaces ou rumeurs qui encouragent et/ou facilitent de tels agissements envers un
                            tiers,
                        </li>
                        <li>ne véhicule pas de contenus racistes, violents, obscènes, pornographiques, pédophiles ou encourageants de tels comportements,</li>
                        <li>ne véhicule pas d’informations diffamatoires, trompeuses ou fausses,</li>
                        <li>n’encourage et ne facilite pas des activités illégales,</li>
                        <li>ne porte pas atteinte à l’image de l’IGN et/ou des Fournisseurs de données et/ou des Fournisseurs d’API,</li>
                        <li>
                            plus globalement, ne soit pas contraire à la loi ou préjudiciable pour l’IGN, les Fournisseurs de données, les Fournisseurs d’API ou
                            des tierces personnes.
                        </li>
                    </ul>

                    <h3 id="anchor-2.2" tabIndex={-1}>
                        2.2. Droits des Fournisseurs d’API
                    </h3>

                    <p>
                        Lorsque vous décidez de mettre à disposition une API, vous devez préalablement vous assurer que vous disposez des droits nécessaires à
                        cet effet et que cette API respecte les conditions imposées par les CGU.
                    </p>

                    <p>
                        Vous pouvez définir des conditions d’utilisation spécifiques à votre API et les renseigner dans la documentation applicable. A défaut,
                        les CGU s’appliquent à l’utilisation de l’API.
                    </p>

                    <p>
                        Lorsque vous supprimez une API de la Géoplateforme, l’API cessera d’être accessible depuis le Site et depuis la Géoplateforme dans un
                        délai raisonnable.
                    </p>

                    <h3 id="anchor-2.3" tabIndex={-1}>
                        2.3. Droits des Fournisseurs de données
                    </h3>

                    <p>
                        Lorsque vous décidez de téléverser et de partager un jeu de données depuis une API, vous devez préalablement vous assurer que vous
                        disposez des droits nécessaires à cet effet et que ce jeu de données respecte les conditions imposées par les CGU.
                    </p>

                    <p>
                        Lorsque vous mettez à disposition un jeu de données à partir d’une API, vous devez indiquer si vous autorisez sa diffusion au public ou
                        à certaines personnes autorisées.
                    </p>

                    <p>
                        Vous définissez les conditions d’utilisation et de réutilisation des jeux de données mis à disposition à partir d’une API et renseignez
                        la licence depuis les métadonnées de données de l’API. A défaut, la{" "}
                        <a
                            href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/"
                            target="_blank"
                            rel="noreferrer"
                            title="www.etalab.gouv.fr - ouvre une nouvelle fenêtre"
                        >
                            Licence Ouverte / Open Licence – Etalab
                        </a>{" "}
                        s’applique sur ce jeu de données.
                    </p>

                    <p>
                        Lorsque vous supprimez un jeu de données que vous avez mis à disposition à partir d’une API, le jeu de données cessera d’être accessible
                        dans un délai raisonnable. Cependant, il est possible que les jeux de données ayant fait l’objet de réutilisations avant leur
                        suppression restent accessibles.
                    </p>

                    <h3 id="anchor-2.4" tabIndex={-1}>
                        2.4. Droits concédés par le Fournisseur de données et par le Fournisseur d’API
                    </h3>

                    <p>
                        Vous concédez à l’IGN une licence gratuite, non exclusive et pour le monde entier sur vos jeux de données et API. Dans les limites de
                        l’autorisation de diffusion que vous devez indiquer, cette licence autorise l’IGN à procéder à tout acte d’exploitation du jeu de
                        données et de l’API nécessaire pour&nbsp;:
                    </p>

                    <ul>
                        <li>Permettre l’utilisation de l’API concernée,</li>
                        <li>Améliorer l’API concernée, le Site et les autres services et produits de l’IGN,</li>
                        <li>
                            Animer et promouvoir le Site et l’API, les services et produits de l’IGN associés au Site ou à l’API par le biais de tout média.
                        </li>
                    </ul>

                    <p>Les actes d’exploitation ainsi autorisés incluent&nbsp;:</p>

                    <ul>
                        <li>
                            Le droit de reproduire l’API et les jeux de données, en tout ou partie, à titre temporaire ou définitif, le droit de diffuser et/ou
                            représenter par le biais de tout support électronique ou papier et donc de reproduire ou faire reproduire en autant d’exemplaires
                            que nécessaires.
                        </li>
                        <li>Le droit de publier, afficher, exécuter, représenter publiquement le jeu de données par tout procédé et sur tout support.</li>
                        <li>
                            Le droit de procéder ou faire procéder aux adaptations, transformations, arrangements, modifications, corrections, adjonctions,
                            retraits que l’IGN jugera nécessaires à la représentation et/ou la reproduction de tout ou partie des jeux de données.
                        </li>
                        <li>Le droit d’utiliser des mesures techniques de protection destinées à empêcher les utilisations non autorisées.</li>
                        <li>
                            Le droit de prendre connaissance et analyser les API et les jeux de données aux fins&nbsp;:
                            <ul>
                                <li>de détecter et procéder à la suppression des contenus interdits,</li>
                                <li>de détecter les virus et logiciels malveillants,</li>
                                <li>d’améliorer l’API et le Site ainsi que les autres services et produits de l’IGN.</li>
                            </ul>
                        </li>
                    </ul>

                    <p>
                        Ces droits peuvent faire l’objet de sous-licences, dans le cas notamment où l’IGN fait appel à des prestataires et fournisseurs, par
                        exemple pour l’hébergement et l’infogérance du Site ou de la Géoplateforme. L’IGN peut également concéder certains de ses droits, dans
                        la stricte mesure nécessaire pour permettre à ses services de fonctionner (par exemple, pour vous permettre d’utiliser un jeu de données
                        qu’un Fournisseur de données souhaite vous partager).
                    </p>

                    <p>
                        L’IGN est autorisé à faire usage des droits prévus ci-dessus pendant toute la durée de l’hébergement du jeu de données et/ou de l’API
                        sur la Géoplateforme.
                    </p>

                    <h3 id="anchor-2.5" tabIndex={-1}>
                        2.5. Blocage d’accès et d’utilisation
                    </h3>

                    <p>
                        En cas de manquement aux CGU, d’usage abusif d’une ou plusieurs API ou mettant en péril le bon fonctionnement de la Géoplateforme, l’IGN
                        peut limiter ou bloquer l’accès et l’utilisation de l’API et/ou retirer les données mises à disposition à partir d’une API de façon
                        temporaire ou définitive.
                    </p>

                    <h2 id="anchor-3" tabIndex={-1}>
                        3. ENGAGEMENTS DE L’IGN
                    </h2>

                    <h3 id="anchor-3.1" tabIndex={-1}>
                        3.1. Obligations de l’IGN en tant qu’opérateur de la Géoplateforme
                    </h3>

                    <p>En tant qu’opérateur de la Géoplateforme, l’IGN&nbsp;:</p>

                    <ul>
                        <li>met à disposition les API,</li>

                        <li>héberge les jeux de données,</li>

                        <li>
                            met en œuvre tous les moyens aux fins d’assurer le bon fonctionnement des API selon l’accord de niveau de service (ou service level
                            agreement, ci-après «&nbsp;SLA&nbsp;» en <a href="#anchor-annexe-3">Annexe 3</a>),
                        </li>

                        <li>ne peut être tenu responsable d’une modification des conditions d’utilisation d’une API par son Fournisseur d’API,</li>

                        <li>
                            ne peut être tenu responsable d’une modification des licences d’utilisation et réutilisation d’un jeu de données par son Fournisseur
                            de données.
                        </li>
                    </ul>

                    <p>
                        La responsabilité de l’IGN ne peut être engagée relativement aux jeux de données mis à disposition par un Fournisseur de données ou aux
                        API mises à disposition par un Fournisseur d’API.
                    </p>

                    <p>
                        Certaines API peuvent proposer un service d’agrégation de flux permettant de rassembler des données et de visualiser différents contenus
                        web au sein d’une seule et même interface. L’IGN n’est pas responsable des données et contenus web accessibles depuis ce type d’API.
                    </p>

                    <h3 id="anchor-3.2" tabIndex={-1}>
                        3.2. Hébergement des jeux de données et suppression des jeux de données hébergées
                    </h3>

                    <p>Chaque Fournisseur de données reste responsable de ses jeux de données.</p>

                    <p>
                        L’IGN n’exerce aucun contrôle ou modération a priori sur les jeux de données mis à disposition à partir d’une API et ne peut en être
                        tenu responsable.
                    </p>

                    <p>
                        En cas de réclamation adressée à l’IGN par un tiers estimant qu’un jeu de données mis à disposition à partir de cette API serait
                        illicite ou lui causerait un préjudice&nbsp;:
                    </p>

                    <ul>
                        <li>
                            L’IGN informe le Fournisseur de données. Le Fournisseur de données garantit l’IGN contre tout recours et condamnation auxquels l’IGN
                            pourrait être exposé à raison de cette réclamation.
                        </li>
                        <li>
                            L’IGN peut prendre toute mesure utile afin de supprimer l’accès aux données litigieuses, si la réclamation apparaît manifestement
                            fondée ou en cas de manquement aux dispositions de la Loi n°2004-575 du 21 juin 2004 («&nbsp;LCEN&nbsp;») constaté par une autorité
                            judiciaire au sens de cette même loi. Dans ce cas, l’IGN en informe le Fournisseur de données dans les plus brefs délais.
                        </li>
                    </ul>

                    <p>
                        La suppression définitive ou temporaire de l’accès aux données pour les motifs mentionnés ci-dessus ne donne pas lieu au versement d’un
                        dédommagement de la part de l’IGN.
                    </p>

                    <p>
                        En l’absence de connexion à votre compte dans un délai d’un an, l’IGN se réserve le droit de supprimer des données disponibles sur votre
                        compte, après vous en avoir dûment informé par courrier électronique. Cette suppression ne peut faire l’objet d’un recours.
                    </p>

                    <h3 id="anchor-3.3" tabIndex={-1}>
                        3.3. Niveau de service
                    </h3>

                    <p>
                        L’IGN met en œuvre tous les moyens afin de maintenir la disponibilité de la Géoplateforme et des API selon l’accord de niveau de service
                        (<a href="#anchor-annexe-3">Annexe 3</a>).
                    </p>

                    <p>L’indisponibilité de la Géoplateforme ne saurait ouvrir droit à aucune compensation quelle qu’en soit sa nature.</p>

                    <p>
                        L’IGN peut faire évoluer, modifier ou suspendre la Géoplateforme ou l’accès et l’utilisation de tout ou partie des API pour des raisons
                        de maintenance ou pour tout autre motif jugé nécessaire. L’IGN ne peut être tenu responsable de l’indisponibilité de la Géoplateforme
                        et/ou de tout ou partie des API qui résulterait d’un cas de force majeure. De même, l’IGN ne peut pas être tenu responsable en cas de
                        défaillance ayant pour cause, fondement ou origine le réseau de télécommunications et/ou le matériel de connexion.
                    </p>

                    <h3 id="anchor-3.4" tabIndex={-1}>
                        3.4. Obligation d’information et de suivi en cas d’incident lors de l’utilisation de la Géoplateforme
                    </h3>

                    <p>
                        Si vous constatez un incident lors de l’utilisation de la Géoplateforme, vous pouvez adresser un message via la rubrique&nbsp;:{" "}
                        <a {...routes.contact().link}>Nous écrire | cartes.gouv.fr</a>.
                    </p>

                    <p>L’IGN reçoit et instruit cette demande et répond dans un délai maximal d’un mois à compter de la sollicitation.</p>

                    <p>
                        Lorsque l’IGN constate un incident affectant la Géoplateforme, il s’engage à vous informer dès le constat de cet incident et à sa
                        clôture au travers des actualités du Site.
                    </p>

                    <h2 id="anchor-4" tabIndex={-1}>
                        4. Clauses diverses
                    </h2>

                    <h3 id="anchor-4.1" tabIndex={-1}>
                        4.1. Notification par l’Utilisateur Géoplateforme
                    </h3>

                    <p>
                        Vous pouvez signaler toute difficulté à tout moment en faisant expressément la demande à l’IGN par écrit au support utilisateur
                        joignable via la rubrique&nbsp;: <a {...routes.contact().link}>Nous écrire | cartes.gouv.fr</a>.
                    </p>

                    <h3 id="anchor-4.2" tabIndex={-1}>
                        4.2. Loi applicable – litiges
                    </h3>

                    <p>Les CGU sont régies par la loi française.</p>

                    <p>Nous nous efforcerons de résoudre à l’amiable tout différend afférent aux CGU.</p>

                    <p>
                        Faute de règlement amiable dans un délai raisonnable de six mois à compter de la première notification, vous et/ou l’IGN peuvent
                        soumettre le différend auprès des tribunaux compétents de Paris, France, sous réserve d’une attribution de compétence spécifique et
                        d’ordre public.
                    </p>

                    <h3 id="anchor-4.3" tabIndex={-1}>
                        4.3. Divisibilité
                    </h3>

                    <p>
                        Si une stipulation des CGU venait à être nulle en vertu d’une loi, d’un règlement ou d’une décision judiciaire, elle sera réputée non
                        écrite sans affecter les stipulations restantes.
                    </p>

                    <hr />

                    <h2 id="anchor-annexe-1" tabIndex={-1}>
                        Annexe 1&nbsp;: Liste des API de la Géoplateforme
                    </h2>

                    <p>La liste des API de la Géoplateforme comprend&nbsp;:</p>
                    <ul>
                        <li>API Géoplateforme - Alimentation, traitement et publication</li>
                        <li>API Géoplateforme - Diffusion d’images tuilées WMTS</li>
                        <li>API Géoplateforme - Diffusion d’images tuilées WMTS - Privé</li>
                        <li>API Géoplateforme - Diffusion d’images tuilées WMTS - Bac à sable</li>
                        <li>API Géoplateforme - Diffusion de tuiles vectorielles TMS</li>
                        <li>API Géoplateforme - Diffusion de tuiles vectorielles TMS - Privé </li>
                        <li>API Géoplateforme - Diffusion de tuiles vectorielles TMS - Bac à sable </li>
                        <li>API Géoplateforme - Diffusion d’images WMS-Raster </li>
                        <li>API Géoplateforme - Diffusion d’images WMS-Raster - Privé </li>
                        <li>API Géoplateforme - Diffusion d’images WMS-Raster - Bac à sable </li>
                        <li>API Géoplateforme - Diffusion d’images WMS-Vecteur </li>
                        <li>API Géoplateforme - Diffusion d’images WMS-Vecteur - Privé </li>
                        <li>API Géoplateforme - Diffusion d’images WMS-Vecteur - Bac à sable </li>
                        <li>API Géoplateforme - Diffusion d’objets WFS </li>
                        <li>API Géoplateforme - Diffusion d’objets WFS - Privé </li>
                        <li>API Géoplateforme - Diffusion d’objets WFS - Bac à sable </li>
                        <li>API Géoplateforme - Téléchargement </li>
                        <li>API Géoplateforme - Téléchargement - Privé </li>
                        <li>API Géoplateforme - Téléchargement - Bac à sable </li>
                        <li>API Géoplateforme - Téléchargement partiel </li>
                        <li>API Géoplateforme - Découverte des métadonnées CSW </li>
                        <li>API Géoplateforme - Découverte des métadonnées CSW - Bac à sable </li>
                        <li>API Géoplateforme - Géocodage </li>
                        <li>API Géoplateforme - Autocomplétion </li>
                        <li>API Géoplateforme - Calcul altimétrique </li>
                        <li>API Géoplateforme - Calcul altimétrique - Privé </li>
                        <li>API Géoplateforme - Calcul d’itinéraire </li>
                        <li>API Géoplateforme - Calcul d’itinéraire - Privé </li>
                        <li>API Géoplateforme - Calcul d’isochrone/isodistance </li>
                        <li>API Géoplateforme - Calcul d’isochrone/isodistance - Privé </li>
                        <li>API Géoplateforme - Recherche </li>
                        <li>API Géoplateforme - Recherche - Privé </li>
                        <li>API Géoplateforme - Gestion des identités et des accès </li>
                        <li>API Géoplateforme - Statistiques d’utilisation </li>
                        <li>API Géoplateforme - Diffusion de tuiles vectorielles pg_tileserv </li>
                        <li>API Géoplateforme - Diffusion de tuiles vectorielles pg_tileserv - Bac à sable </li>
                    </ul>
                    <p>
                        La dénomination des API est susceptible d’évoluer&nbsp;: il convient de se référer au{" "}
                        <a href="./catalogue">Catalogue | cartes.gouv.fr</a>.
                    </p>

                    <hr />

                    <h2 id="anchor-annexe-2" tabIndex={-1}>
                        Annexe 2&nbsp;: Offre Géoplateforme
                    </h2>

                    <p>Sur la Géoplateforme, l’utilisation des géodonnées et géoservices est gratuite (sauf licence spécifique).</p>

                    <p>
                        L’hébergement et la diffusion des données sont gratuits pour la plupart des Fournisseurs de données. La bascule vers une offre Premium,
                        payante, se fait pour certains Fournisseurs de données, notamment lorsque les volumes de données stockés et/ou diffusés le justifient.
                        Seuls quelques Fournisseurs de données, ayant un impact significatif d’usage de la Géoplateforme, contribuent ainsi à l’équilibre
                        économique de la Géoplateforme.
                    </p>

                    <p>
                        L’offre Découverte permet au Fournisseur de données d’éprouver le fonctionnement du système. Cette offre est gratuite et accessible
                        depuis <a {...routes.dashboard_pro().link}>Tableau de bord | cartes.gouv.fr</a> (authentification nécessaire). Elle donne accès à un
                        espace de type bac à sable, non personnel, partagé avec l’ensemble des Fournisseurs de données de la Géoplateforme et sur lequel les
                        données ne sont pas pérennes (suppression trimestrielle des données). Il ne s’agit donc pas d’un espace pour accueillir des données de
                        production et l’IGN ne peut être tenu pour responsable des effets provoqués par ladite suppression trimestrielle des données.
                    </p>

                    <p>
                        L’offre Essentiel permet au Fournisseur de données un usage standard en production. Cette offre est gratuite et accessible via un
                        formulaire disponible sur <a {...routes.dashboard_pro().link}>Tableau de bord | cartes.gouv.fr</a> (authentification nécessaire). Cette
                        offre est limitée à une instance par organisme, attribuée au premier Fournisseur de données qui en fait la demande en se réclamant de
                        cet organisme et qui se voit attribué l’espace de données offre Essentiel pour l’organisme. Les éventuels autres Fournisseurs de données
                        du même organisme effectuant la même demande sont rattachés à l’unique espace déjà créé pour l’organisme. L’IGN se réserve un droit de
                        modération a posteriori des comptes et espaces de données.
                    </p>

                    <p>
                        L’offre Premium est payante et s’adresse au Fournisseur de données pour un usage en production avec des spécificités allant au-delà de
                        l’offre Essentiel. Chaque année, au mois de juin, l’IGN examine les usages en alimentation et en diffusion de chaque espace de données.
                        L’IGN identifie alors les dépassements du seuil de l’offre Essentiel et propose, à chaque organisme concerné, la bascule ou le maintien
                        dans un seuil de l’offre Premium sous la forme d’un devis couvrant l’année civile suivante. En cas d’acceptation du devis, l’organisme
                        reçoit, à partir du mois de janvier, une facture terme à échoir, sur la base du devis accepté. En cas de non- acceptation du devis et de
                        non-accord entre l’IGN et l’organisme sur une modalité de l’offre Premium, l’organisme est maintenu ou basculé dans l’offre Essentiel à
                        partir du 1er janvier.
                    </p>

                    <p>
                        Les caractéristiques techniques de l’offre Premium peuvent nécessiter des opérations d’infrastructure complexes à réaliser en amont de
                        la mise à disposition de l’environnement de travail au Fournisseur de données. Ces opérations impliquent un délai de mise en œuvre
                        supérieur à celui de l’offre Essentiel. Ce délai dépend des caractéristiques du ou des espaces de travail et peut s’avérer conséquent et
                        doit être anticipé par le Fournisseur de données. Ce délai est communiqué par l’IGN au moment de la contractualisation.
                    </p>

                    <p>
                        S’agissant des seuils relatifs au volume de données hébergées ainsi qu’au nombre de couches de données autorisées, ces seuils sont
                        paramétrés dans la Géoplateforme et entraînent un blocage de la capacité de publication lorsqu’ils sont atteints. Lorsqu’un Fournisseur
                        de données est confronté à ce blocage, il peut contacter l’IGN à l’adresse{" "}
                        <a href="mailto:geoplateforme@ign.fr">geoplateforme@ign.fr</a> afin de définir les conditions de son passage à l’offre Premium.
                    </p>

                    <div className={fr.cx("fr-table", "fr-table--bordered", "fr-table--no-scroll")}>
                        <div className={fr.cx("fr-table__wrapper")}>
                            <div className={fr.cx("fr-table__container")}>
                                <div className={fr.cx("fr-table__content")}>
                                    <table>
                                        <caption>Offre Géoplateforme pour l’hébergement, la gestion collaborative et la diffusion de données</caption>
                                        <thead>
                                            <tr>
                                                <th scope="col">
                                                    <span className={fr.cx("fr-sr-only")}>Propriétés de l’offre</span>
                                                </th>
                                                <th scope="col">
                                                    <strong>Découverte</strong>
                                                    <br />
                                                    Gratuit
                                                    <br />
                                                    <em>Compte utilisateur</em>
                                                </th>
                                                <th scope="col">
                                                    <strong>Essentiel</strong>
                                                    <br />
                                                    Gratuit
                                                    <br />
                                                    <em>1 souscription par organisme</em>
                                                </th>
                                                <th scope="col">
                                                    <strong>Premium</strong>
                                                    <br />
                                                    Payant
                                                    <br />
                                                    <em>1 souscription par organisme</em>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th scope="row">Dépôt de données et paramétrage de la diffusion</th>
                                                <td>
                                                    <strong>Espace partagé</strong>
                                                    <br />
                                                    Suppression trimestrielle des données
                                                </td>
                                                <td>
                                                    <strong>Espace dédié</strong>
                                                    <br />1 datastore
                                                </td>
                                                <td>
                                                    <strong>Espace dédié</strong>
                                                    <br />
                                                    plusieurs datastore
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Limite de dépôt de données</th>
                                                <td>100 Go</td>
                                                <td>
                                                    <strong>500 Go</strong> dont&nbsp;:
                                                    <ul>
                                                        <li>50 Go livraisons</li>
                                                        <li>30 Go bases de données</li>
                                                        <li>400 Go pyramides</li>
                                                        <li>10 Go archives</li>
                                                        <li>10 Go annexes</li>
                                                    </ul>
                                                </td>
                                                <td>
                                                    <strong>20 To</strong> dont&nbsp;:
                                                    <ul>
                                                        <li>1 To livraisons</li>
                                                        <li>
                                                            200 Go bases de données (si ce volume est insuffisant, nous vous invitons à contacter l’IGN afin
                                                            d’échanger sur votre besoin)
                                                        </li>
                                                        <li>17 To pyramides</li>
                                                        <li>1 To archives</li>
                                                        <li>1 To annexes</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Nombre de couches de données max</th>
                                                <td>20</td>
                                                <td>50</td>
                                                <td>Un quota est initié par défaut et modifiable à la hausse en fonction du besoin</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Limite de consommation des données exposées</th>
                                                <td>NA</td>
                                                <td>1 To</td>
                                                <td>Tarif par palier de consommation</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Accès aux endpoints privés de diffusion</th>
                                                <td>non</td>
                                                <td>oui</td>
                                                <td>oui</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Administration d’une communauté de contributeurs </th>
                                                <td>non</td>
                                                <td>oui</td>
                                                <td>oui</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Possible contribution à des communautés existantes </th>
                                                <td>oui</td>
                                                <td>oui</td>
                                                <td>oui</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Stats d’usage des données</th>
                                                <td>oui</td>
                                                <td>oui</td>
                                                <td>oui</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Support</th>
                                                <td>Mail de contact</td>
                                                <td>Mail de contact</td>
                                                <td>Formation et accompagnement à la prise en main des outils</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Participation aux instances de gouvernance</th>
                                                <td>non</td>
                                                <td>non</td>
                                                <td>oui</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Participation aux Géoplateforme days</th>
                                                <td>non</td>
                                                <td>oui</td>
                                                <td>oui</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={fr.cx("fr-table", "fr-table--bordered", "fr-table--no-scroll")}>
                        <div className={fr.cx("fr-table__wrapper")}>
                            <div className={fr.cx("fr-table__container")}>
                                <div className={fr.cx("fr-table__content")}>
                                    <table>
                                        <caption>Premium, tarifs / an</caption>
                                        <thead>
                                            <tr>
                                                <th scope="col">
                                                    <span className={fr.cx("fr-sr-only")}>Propriétés de l’offre</span>
                                                </th>
                                                <th scope="col">10 k€</th>
                                                <th scope="col">25 k€</th>
                                                <th scope="col">50 k€</th>
                                                <th scope="col">100 k€</th>
                                                <th scope="col">200 k€</th>
                                                <th scope="col">Au-delà</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th scope="row">Limite de dépôt de données</th>
                                                <td colSpan={5}>
                                                    <strong>20 To</strong> dont&nbsp;:
                                                    <ul>
                                                        <li>1 To pour les livraisons de données</li>
                                                        <li>200 Go pour les bases de données</li>
                                                        <li>17 To pour les pyramides</li>
                                                        <li>1 To pour les archives téléchargeables</li>
                                                        <li>1 To pour les annexes</li>
                                                    </ul>
                                                </td>
                                                <td>1,5 k€/To supp</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Limite de consommation des données exposées</th>
                                                <td>3 To</td>
                                                <td>8 To</td>
                                                <td>20 To</td>
                                                <td>50 To</td>
                                                <td>120 To</td>
                                                <td>1,5 k€/To supp</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Support</th>
                                                <td colSpan={6}>
                                                    10 jours d’appui par le support Géoplateforme peuvent être mobilisés pour aide à la prise en main des
                                                    outils. Au-delà une option sera activable pour bénéficier d’un support étendu.
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Instances de gouvernance</th>
                                                <td colSpan={6}>Participation aux GéoplateformeDays et aux instances de gouvernance en cours de définition</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr />

                    <h2 id="anchor-annexe-3" tabIndex={-1}>
                        Annexe 3&nbsp;: Accord de niveau de service
                    </h2>

                    <h3>Article 1&nbsp;: Objet et portée du SLA</h3>

                    <p>
                        L’objectif du présent accord de niveau de service (ou service level agreement, ci-après « SLA ») est de définir les paramètres de
                        référence applicables aux API (<a href="#anchor-annexe-1">Annexe 1</a>) et le contrôle du niveau de qualité effectivement fourni.
                    </p>

                    <h3>Article 2&nbsp;: Définitions et périmètre du SLA</h3>

                    <p>
                        Dans le SLA, les termes suivants, lorsque leur première lettre est employée en majuscule, ont les significations respectives
                        suivantes&nbsp;:
                    </p>

                    <h4>Article 2.1&nbsp;: Incidents</h4>

                    <p>Les incidents faisant l’objet du SLA sont ceux bloquant l’utilisation d’une API.</p>
                    <p>Les autres incidents ne sont pas concernés par ce SLA.</p>

                    <h4>Article 2.2&nbsp;: Période d’indisponibilité</h4>

                    <p>
                        La Période d’indisponibilité signifie une durée d’indisponibilité de dix minutes consécutives à compter de l’évènement bloquant pour
                        toute API couverte individuellement. Les temps d’arrêt intermittents d’une durée inférieure à dix minutes, pour toute API couverte
                        individuellement, ne seront pas comptabilisés.
                    </p>

                    <p>
                        Les Périodes d’indisponibilité qui surviennent pour une API couverte individuellement ne s’appliquent pas aux autres Périodes
                        d’indisponibilité de l’API couverte.
                    </p>

                    <p>La tolérance aux Incidents s’applique pour chaque API individuellement.</p>

                    <p>Sont exclues des présentes garanties de disponibilité et de rétablissement les situations suivantes&nbsp;:</p>

                    <ul>
                        <li> les indisponibilités programmées&nbsp;;</li>
                        <li>les indisponibilités résultant du dépassement d’un plafond technique de chaque offre&nbsp;;</li>
                        <li>les indisponibilités du fait de l’Utilisateur Géoplateforme ou d’un tiers&nbsp;;</li>
                        <li>les indisponibilités résultant d’une situation de force majeure ou d’un événement extérieur hors du contrôle direct de l’IGN.</li>
                    </ul>

                    <h4>Article 2.3&nbsp;: Pourcentage de disponibilité mensuelle</h4>

                    <p>
                        Le pourcentage de disponibilité mensuelle est calculé sur la base du nombre total de minutes dans le mois civil concerné, moins le
                        nombre de minutes de temps d’indisponibilité dû à toutes les Périodes d’indisponibilité dudit mois civil, divisé par le nombre total de
                        minutes dudit mois civil, soit selon la formule ci-dessous&nbsp;:
                    </p>
                    <ul>
                        <li>P = pourcentage de disponibilité mensuelle </li>
                        <li>N = nombre total de minutes dans un mois civil</li>
                        <li>I = nombre de minutes de temps d’indisponibilité sur ledit mois civil</li>
                        <li>P = (N - I) / N</li>
                    </ul>

                    <h4>Article 2.4&nbsp;: Sondes de référence</h4>

                    <p>Les mesures de temps de fonctionnement de référence sont réalisées au moyen de l’outil Uptrends.</p>
                    <p>
                        La disponibilité des API est consultable sur <a {...routes.service_status().link}>Niveau de service | cartes.gouv.fr</a>.
                    </p>

                    <h3>Article 3&nbsp;: Engagement de service relatif au fonctionnement</h3>

                    <h4>Article 3.1&nbsp;: Engagement de disponibilité</h4>

                    <p>L’IGN s’engage à assurer les niveaux de disponibilité figurant ci-dessous.</p>

                    <p>Dans l’hypothèse où un niveau de service ne serait pas atteint, l’IGN s’engage à limiter au maximum l’indisponibilité.</p>

                    <p>Une indisponibilité ne saurait ouvrir droit à aucune compensation quelle qu’en soit sa nature.</p>

                    <p>Les indisponibilités liées à une maintenance programmée font l’objet d’un délai de prévenance minimum&nbsp;: </p>
                    <ul>
                        <li>de 20 jours ouvrés pour une maintenance avec interruption&nbsp;;</li>
                        <li>de 10 jours ouvrés pour une maintenance évolutive de grande envergure sans interruption, sauf en cas de force majeure.</li>
                    </ul>

                    <div className={fr.cx("fr-table", "fr-table--bordered", "fr-table--no-scroll", "fr-table--sm")}>
                        <div className={fr.cx("fr-table__wrapper")}>
                            <div className={fr.cx("fr-table__container")}>
                                <div className={fr.cx("fr-table__content")}>
                                    <table>
                                        <caption>Engagements de disponibilité</caption>
                                        <thead>
                                            <tr>
                                                <th scope="col">API</th>
                                                <th scope="col">Période de disponibilité garantie</th>
                                                <th scope="col">Taux de disponibilité de référence</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>API Géoplateforme - Alimentation, traitement et publication</td>
                                                <td rowSpan={36}>24 heures sur 24, 7 jours sur 7</td>
                                                <td rowSpan={36}>99,50% sur une base annuelle</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images tuilées WMTS</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images tuilées WMTS - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images tuilées WMTS - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion de tuiles vectorielles TMS</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion de tuiles vectorielles TMS - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion de tuiles vectorielles TMS - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images WMS-Raster</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images WMS-Raster - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images WMS-Raster - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images WMS-Vecteur</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images WMS-Vecteur - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images WMS-Vecteur - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’objets WFS</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’objets WFS - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’objets WFS - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Téléchargement</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Téléchargement - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Téléchargement - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Téléchargement partiel</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Découverte des métadonnées CSW</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Découverte des métadonnées CSW - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Géocodage</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Autocomplétion</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Calcul altimétrique</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Calcul altimétrique - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Calcul d’itinéraire</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Calcul d’itinéraire - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Calcul d’isochrone/isodistance</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Calcul d’isochrone/isodistance - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Recherche</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Recherche - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Gestion des identités et des accès</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Statistiques d’utilisation</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion de tuiles vectorielles pg_tileserv</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion de tuiles vectorielles pg_tileserv - Bac à sable</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h4>Article 3.2&nbsp;: Limite d’usage (Fair use)</h4>

                    <p>Pour certaines API, une limite d’usage fixée en nombre de requêtes par seconde et par IP est mise en place.</p>

                    <p>
                        Au-delà de cette limite, une erreur HTML 429 (Too Many Requests) est envoyée en réponse à toute requête. Ce blocage intervient pour une
                        durée de 5 secondes et il ne concerne que l’API dont la limite d’usage a été franchie (si la limite du calcul altimétrique est dépassée,
                        le WMTS reste accessible).
                    </p>

                    <p>Les limites sont les suivantes&nbsp;:</p>

                    <div className={fr.cx("fr-table", "fr-table--bordered", "fr-table--no-scroll", "fr-table--sm")}>
                        <div className={fr.cx("fr-table__wrapper")}>
                            <div className={fr.cx("fr-table__container")}>
                                <div className={fr.cx("fr-table__content")}>
                                    <table>
                                        <caption>Limites d’usage</caption>
                                        <thead>
                                            <tr>
                                                <th scope="col">API</th>
                                                <th scope="col">Limite en nombre de requêtes par seconde et par IP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images tuilées WMTS</td>
                                                <td rowSpan={3}>Non soumis à limite d’usage</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images tuilées WMTS - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images tuilées WMTS - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion de tuiles vectorielles TMS</td>
                                                <td rowSpan={3}>400 requêtes/s</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion de tuiles vectorielles TMS - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion de tuiles vectorielles TMS - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images WMS-Raster</td>
                                                <td rowSpan={3}>40 requêtes/s</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images WMS-Raster - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images WMS-Raster - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images WMS-Vecteur</td>
                                                <td rowSpan={3}>50 requêtes/s</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images WMS-Vecteur - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’images WMS-Vecteur - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’objets WFS</td>
                                                <td rowSpan={3}>30 requêtes/s</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’objets WFS - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion d’objets WFS - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Téléchargement</td>
                                                <td rowSpan={3}>10 requêtes/s avec bannissement de 5 secondes</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Téléchargement - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Téléchargement - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Téléchargement partiel</td>
                                                <td>200 requêtes/s</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Découverte des métadonnées CSW</td>
                                                <td rowSpan={2}>15 requêtes/s</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Découverte des métadonnées CSW - Bac à sable</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Géocodage</td>
                                                <td>50 requêtes/s</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Autocomplétion</td>
                                                <td>10 requêtes/s</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Calcul altimétrique</td>
                                                <td rowSpan={6}>5 requêtes/s</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Calcul altimétrique - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Calcul d’itinéraire</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Calcul d’itinéraire - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Calcul d’isochrone/isodistance</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Calcul d’isochrone/isodistance - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Recherche</td>
                                                <td rowSpan={2}>10 requêtes/s</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Recherche - Privé</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion de tuiles vectorielles pg_tileserv</td>
                                                <td rowSpan={2}>400 requêtes/s</td>
                                            </tr>
                                            <tr>
                                                <td>API Géoplateforme - Diffusion de tuiles vectorielles pg_tileserv - Bac à sable </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    );
};

export default TermsOfService;
