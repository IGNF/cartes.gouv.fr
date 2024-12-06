import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useMemo } from "react";

import AppLayout from "../../../../components/Layout/AppLayout";
import { datastoreNavItems } from "../../../../config/navItems/datastoreNavItems";
import { getTranslation, useTranslation } from "../../../../i18n/i18n";
import SymfonyRouting from "../../../../modules/Routing";
import { useAuthStore } from "../../../../stores/AuthStore";
import { useSnackbarStore } from "../../../../stores/SnackbarStore";
import { formatDateFromISO } from "../../../../utils";

const Me = () => {
    const { t: tCommon } = getTranslation("Common");
    const { t } = useTranslation({ Me });
    const user = useAuthStore((state) => state.user);
    const navItems = useMemo(() => datastoreNavItems(), []);

    const setMessage = useSnackbarStore((state) => state.setMessage);

    return (
        <AppLayout documentTitle={t("my_account")} navItems={navItems}>
            <h1>{t("my_account")}</h1>

            {user && (
                <>
                    <p>{t("firstname", { firstName: user?.first_name ?? "" })}</p>
                    <p>{t("lastname", { lastName: user?.last_name ?? "" })}</p>
                    <p>{t("username", { userName: user?.user_name ?? "" })}</p>
                    <p>{t("email", { email: user.email })}</p>
                    <p>{t("registration_date", { date: formatDateFromISO(user.account_creation_date) })}</p>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-6v")}>
                        {t("id", { id: user.id })}
                        <Button
                            className={fr.cx("fr-ml-2v")}
                            title={tCommon("copy")}
                            priority={"tertiary no outline"}
                            iconId={"ri-file-copy-2-line"}
                            onClick={async () => {
                                await navigator.clipboard.writeText(user.id);
                                setMessage(t("userid_copied"));
                            }}
                        />
                    </div>
                </>
            )}

            <Button
                linkProps={{
                    href: SymfonyRouting.generate("cartesgouvfr_security_userinfo_edit"),
                    target: "_blank",
                    rel: "noreferrer",
                    title: t("manage_my_account") + " - " + tCommon("new_window"),
                }}
            >
                {t("manage_my_account")}
            </Button>
        </AppLayout>
    );
};

export default Me;
