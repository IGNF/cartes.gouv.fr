import React from "react";

import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";

const Accessibility = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <div className="fr-grid-row">
                <div className="fr-col-12 fr-col-md-8 fr-py-12v">
                    <h1>Accessibilité&nbsp;: non conforme</h1>
                    <p>Dans l’attente de l’audit de conformité <abbr title="Référentiel général d'amélioration de l'accessibilité">RGAA</abbr>, vous pouvez nous aider à améliorer l’accessibilité 
                        du site cartes.gouv.fr en nous signalant les problèmes éventuels que vous rencontrez&nbsp;:</p>
                    <ul>
                        <li>Envoyer un message par le biais du <a href="#">formulaire de contact en ligne</a></li>
                        <li>ou contacter l’IGN par courrier ou par téléphone&nbsp;:<br/>
                            Institut national de l’information géographique et forestière<br/>
                            73 avenue de Paris, 94 165 Saint-Mandé Cedex<br/>
                            Tél. : 01 43 98 80 00</li>
                    </ul>

                    <p>Dans le cas où vous constateriez un défaut d’accessibilité vous empêchant d’accéder à un contenu 
                    ou à une fonctionnalité du site et que vous nous l’auriez signalé sans obtenir une réponse satisfaisante 
                    de notre part, vous êtes en droit de faire parvenir vos doléances ou demande de saisine au Défenseur des droits. 
                    Vous avez la possibilité de&nbsp;:</p>
                    <ul>
                        <li>Envoyer un message au Défenseur des droits&nbsp;:
                            <a href="https://formulaire.defenseurdesdroits.fr/" target="_blank" rel="noreferrer">https://formulaire.defenseurdesdroits.fr/</a></li>
                        <li>Contacter le délégué du Défenseur des droits dans votre région&nbsp;:
                            <a href="https://www.defenseurdesdroits.fr/saisir/delegues" target="_blank" rel="noreferrer">https://www.defenseurdesdroits.fr/saisir/delegues</a></li>
                        <li>Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre)&nbsp;:<br/>
                            Défenseur des droits<br/>
                            Libre réponse 71120<br/>
                            75342 Paris CEDEX 07</li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
};

export default Accessibility;