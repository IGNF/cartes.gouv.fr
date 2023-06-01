import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import React, { useContext } from "react";

import AppLayout from "../components/Layout/AppLayout";
import { defaultNavItems } from "../config/navItems";
import { UserContext } from "../contexts/UserContext";
import { routes } from "../router/router";

const Home = () => {
    const { user } = useContext(UserContext);

    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>{"Transformez vos données géographiques en tuiles vectorielles simplement et diffusez-les n'importe où"}</h1>

            {user == null ? (
                <Button linkProps={{ href: Routing.generate("cartesgouvfr_security_login") }}>Commencer</Button>
            ) : (
                <Button linkProps={routes.datastore_list().link}>Commencer</Button>
            )}

            <h2 className={fr.cx("fr-mt-4w")}>Comment ça marche ?</h2>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                <div
                    className={fr.cx("fr-col")}
                    style={{
                        width: 300,
                    }}
                >
                    <Tile
                        grey
                        imageUrl="https://www.ign.fr/geoplateforme/geotuileur/build/img/home/Deposer.png"
                        linkProps={{
                            href: "#",
                        }}
                        title="Je dépose ma donnée"
                    />
                </div>
                <div
                    className={fr.cx("fr-col")}
                    style={{
                        width: 300,
                    }}
                >
                    <Tile
                        grey
                        imageUrl="https://www.ign.fr/geoplateforme/geotuileur/build/img/home/Tuile@1x.png"
                        linkProps={{
                            href: "#",
                        }}
                        title="Je crée mon flux"
                    />
                </div>
                <div
                    className={fr.cx("fr-col")}
                    style={{
                        width: 300,
                    }}
                >
                    <Tile
                        grey
                        imageUrl="https://www.ign.fr/geoplateforme/geotuileur/build/img/home/Diffuser@1x.png"
                        linkProps={{
                            href: "#",
                        }}
                        title="Je publie mon flux"
                    />
                </div>
            </div>

            <h2 className={fr.cx("fr-mt-4w")}>Un ensemble de services pour vous accompagner</h2>
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus molestiae officia numquam maxime. Animi deleniti eligendi
                eum qui deserunt dignissimos amet quae. Blanditiis accusamus voluptas facere sunt voluptates? Quis, debitis.
            </p>
            <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Illo suscipit ducimus sit itaque ipsam, mollitia et totam
                accusantium magni ex?
            </p>
            <p>...</p>
        </AppLayout>
    );
};

export default Home;
