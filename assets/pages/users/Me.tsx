import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";

import AppLayout from "../../components/Layout/AppLayout";
import functions from "../../functions";
import SymfonyRouting from "../../modules/Routing";
import { routes } from "../../router/router";
import { useAuthStore } from "../../stores/AuthStore";

const Me = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <AppLayout documentTitle="Mon compte">
            <h1>Mon compte</h1>

            {user && (
                <>
                    <p>
                        <strong>Prénom</strong> : {user.firstName}
                    </p>
                    <p>
                        <strong>Nom</strong> : {user.lastName}
                    </p>
                    <p>
                        <strong>Email</strong> : {user.email}
                    </p>
                    <p>
                        <strong>{"Date d'inscription"}</strong> : {functions.date.format(user.accountCreationDate)}
                    </p>
                    <p>
                        <strong>Identifiant technique</strong> : {user.id}
                    </p>
                </>
            )}

            <ButtonsGroup
                buttons={[
                    {
                        linkProps: routes.home().link,
                        children: "Retour à l'accueil",
                        priority: "primary",
                    },
                    {
                        children: "Modifier mes informations",
                        linkProps: {
                            href: SymfonyRouting.generate("cartesgouvfr_security_userinfo_edit"),
                            target: "_blank",
                            rel: "noreferrer",
                            title: "Accéder au Géoportail - ouvre une nouvelle fenêtre",
                        },
                        priority: "secondary",
                    },
                ]}
                alignment="left"
                inlineLayoutWhen="always"
            />
        </AppLayout>
    );
};

export default Me;
