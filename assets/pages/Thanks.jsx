import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import AppLayout from "../components/Layout/AppLayout";
import { defaultNavItems } from "../config/navItems";
import { routes } from "../router/router";

const Thanks = () => {
    const link = { __html: Translator.trans("mailer.signature", { href: routes.home().href }) };

    return (
        <AppLayout navItems={defaultNavItems}>
            <Alert
                title={Translator.trans("contact.thanks.title")}
                closable
                description={
                    <>
                        <p>{Translator.trans("contact.thanks.description")}</p>
                        <p dangerouslySetInnerHTML={link} />
                    </>
                }
                severity="success"
            />
            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mt-1w")}>
                <Button linkProps={routes.home().link}>{Translator.trans("pursue")}</Button>
            </div>
        </AppLayout>
    );
};

export default Thanks;
