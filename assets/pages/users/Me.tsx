import Button from "@codegouvfr/react-dsfr/Button";

import AppLayout from "../../components/Layout/AppLayout";
import functions from "../../functions";
import SymfonyRouting from "../../modules/Routing";
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

            <Button
                linkProps={{
                    href: SymfonyRouting.generate("cartesgouvfr_security_userinfo_edit"),
                    target: "_blank",
                    rel: "noreferrer",
                    title: "Accéder au Géoportail - ouvre une nouvelle fenêtre",
                }}
            >
                {"Modifier mes informations"}
            </Button>
        </AppLayout>
    );
};

export default Me;
