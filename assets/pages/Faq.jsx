import { fr } from "@codegouvfr/react-dsfr";

import React from "react";

import { Accordion } from "@codegouvfr/react-dsfr/Accordion";

import AppLayout from "../components/Layout/AppLayout";
import { defaultNavItems } from "../config/navItems";

const Faq = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Questions fréquentes</h1>

                    <div className={fr.cx("fr-accordions-group")}>
                        <Accordion label="A qui s’adresse cartes.gouv.fr ?">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eget nunc at nunc condimentum rutrum eu hendrerit mauris. Fusce
                            lobortis, mauris in venenatis auctor, arcu nulla commodo mi, sit amet dictum turpis massa ut odio. Sed ut diam elit. In rutrum
                            auctor sollicitudin. Donec posuere, lacus et congue ultricies, diam risus molestie est, porttitor interdum massa augue nec mi. Morbi
                            tristique consequat pretium. Integer viverra orci quam, vel tempor est vulputate vitae. Pellentesque non condimentum risus.
                            Phasellus efficitur congue nulla, a aliquet sem vehicula non. Curabitur mattis odio ac leo vestibulum, vel dapibus justo dapibus.
                            Sed id orci non augue accumsan eleifend nec vel augue.
                        </Accordion>
                        <Accordion label="Qui est derrière carte.gouv.fr ?">
                            Vestibulum ac orci eget quam rutrum placerat. Duis metus mi, ornare sit amet mattis ut, condimentum condimentum lorem. Morbi
                            bibendum feugiat sem vitae maximus. Nam molestie, eros in tincidunt faucibus, leo urna hendrerit turpis, quis egestas ex nisl sit
                            amet odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin in ante eros.
                            Pellentesque at dapibus tellus. Quisque viverra risus ac placerat cursus. Interdum et malesuada fames ac ante ipsum primis in
                            faucibus. Sed pellentesque cursus risus, iaculis euismod velit maximus ac. In auctor ultricies augue in mollis. Pellentesque
                            efficitur semper sem id imperdiet. Nam vitae dictum velit. Aliquam nunc velit, semper in tincidunt eu, gravida ut turpis.
                            Pellentesque tristique posuere tristique. Ut rhoncus porttitor nunc at scelerisque.
                        </Accordion>
                        <Accordion label="Que deviennent le géoportail et les géoservices ?">
                            Phasellus ornare tristique sollicitudin. Nulla metus velit, bibendum a consequat sit amet, luctus vel libero. Vestibulum gravida
                            felis nisl, at rhoncus metus tincidunt et. Donec volutpat ultricies ornare. Pellentesque urna dui, semper nec dignissim vel, auctor
                            non quam. Morbi eget enim sollicitudin, tincidunt sem sit amet, laoreet elit. Aenean turpis sem, tincidunt quis ultricies vitae,
                            pellentesque sed libero. Etiam dictum gravida rhoncus. Mauris rutrum ut lectus a auctor. Nam dignissim maximus erat vitae euismod.
                            Phasellus in consequat metus. Aliquam erat volutpat. Nunc et lobortis nibh, ac tincidunt est. Etiam sodales leo sit amet lorem
                            cursus facilisis sed nec diam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                        </Accordion>
                        <Accordion label="Quel est le modèle économique ?">
                            Phasellus rhoncus faucibus tristique. Etiam et semper nisl. Nunc ornare bibendum volutpat. Vivamus placerat elit non purus faucibus
                            aliquet. Aliquam pellentesque, purus sit amet laoreet porta, est lacus laoreet ante, ac mattis quam enim in magna. Suspendisse
                            maximus libero lacinia lorem molestie, sit amet efficitur magna ultricies. Cras interdum vulputate arcu, eget faucibus nunc
                            venenatis ut. Nulla auctor lorem nunc, at pretium est dignissim aliquet. Nunc eget lacus quis arcu accumsan bibendum. Phasellus sit
                            amet nunc cursus, pharetra velit sit amet, posuere massa.
                        </Accordion>
                        <Accordion label="Quelles sont les CGU de carte.gouv.fr ?">
                            Sed eu venenatis neque. Nullam a eleifend lectus. Fusce fringilla commodo magna quis convallis. Etiam vitae nisi felis. Donec
                            tincidunt dui eleifend leo accumsan, in interdum magna laoreet. Sed ligula risus, dictum sit amet tortor in, congue lacinia libero.
                            Maecenas eget urna felis. Praesent non faucibus elit. Morbi risus odio, dignissim vel nisl eget, tincidunt tincidunt ligula.
                            Maecenas et massa pulvinar, egestas lectus ut, iaculis tortor.
                        </Accordion>
                        <Accordion label="Quand arriveront les prochains services ?">
                            Nulla consequat metus sed nisl pellentesque, id scelerisque nibh condimentum. Curabitur dapibus, elit quis porta pretium, magna
                            massa convallis metus, ut vehicula elit lorem a nibh. Donec eleifend aliquet ante, quis sodales tortor porta ut. Praesent sodales
                            turpis neque. Nunc porttitor risus in justo elementum, eu porta nulla pretium. Aliquam pellentesque mattis sapien vitae tincidunt.
                            Sed placerat blandit condimentum.
                        </Accordion>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Faq;
