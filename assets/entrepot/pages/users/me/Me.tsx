import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";

import { getTranslation, useTranslation } from "../../../../i18n/i18n";
import SymfonyRouting from "../../../../modules/Routing";
import { useAuthStore } from "../../../../stores/AuthStore";
import { formatDateFromISO } from "../../../../utils";
import Main from "../../../../components/Layout/Main";
import TextCopyToClipboard from "@/components/Utils/TextCopyToClipboard";

const Me = () => {
    const { t: tCommon } = getTranslation("Common");
    const { t } = useTranslation({ Me });
    const user = useAuthStore((state) => state.user);

    return (
        <Main title={t("my_account")}>
            <h1>{t("my_account")}</h1>

            {user && (
                <>
                    <p>{t("firstname", { firstName: user?.first_name ?? "" })}</p>
                    <p>{t("lastname", { lastName: user?.last_name ?? "" })}</p>
                    <p>{t("username", { userName: user?.user_name ?? "" })}</p>
                    <p>{t("email", { email: user.email })}</p>
                    {user.account_creation_date !== undefined && <p>{t("registration_date", { date: formatDateFromISO(user.account_creation_date) })}</p>}
                    <TextCopyToClipboard className={fr.cx("fr-mb-6v")} label={t("id")} text={user.id} successMessage={t("userid_copied")} />
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
        </Main>
    );
};

export default Me;
