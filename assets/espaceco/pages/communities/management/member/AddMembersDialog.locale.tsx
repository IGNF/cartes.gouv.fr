import { fr } from "@codegouvfr/react-dsfr";
import { declareComponentKeys } from "../../../../../i18n/i18n";
import { Translations } from "../../../../../i18n/types";

// traductions
const { i18n } = declareComponentKeys<"invite_title" | "invite" | { K: "users_hint"; R: JSX.Element } | "min_users_error">()("AddMembersDialog");
export type I18n = typeof i18n;

export const AddMembersDialogFrTranslations: Translations<"fr">["AddMembersDialog"] = {
    invite_title: "Inviter des membres",
    invite: "Inviter",
    users_hint: (
        <>
            <div>
                <ul className={fr.cx("fr-raw-list")}>
                    <li>Invitez un utilisateur de la géoplateforme par son login ou son nom d’utilisateur (autocomplétion).</li>
                    <li>
                        Invitez un utilisateur qui ne fait pas partie de la géoplateforme par son adresse email. Un message lui sera envoyé pour créer un compte
                    </li>
                    <li>Vous pouvez inviter plusieurs membres à ce guichet en une seule fois</li>
                </ul>
            </div>
            <br />
            <div>Une fois les membres invités, vous pourrez ensuite en désigner certains comme gestionnaires.</div>
        </>
    ),
    min_users_error: "Au minimum, un utilisateur ou un email est requis",
};

export const AddMembersDialogEnTranslations: Translations<"en">["AddMembersDialog"] = {
    invite_title: "Invite members",
    invite: "Invite",
    users_hint: undefined,
    min_users_error: undefined,
};
