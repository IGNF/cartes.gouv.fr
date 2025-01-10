import { declareComponentKeys } from "../../../i18n/i18n";
import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "document_title"
    | "community_loading"
    | "community_loading_failed"
    | "userme_loading"
    | "userme_loading_failed"
    | "logo"
    | { K: "community_name"; P: { name: string }; R: JSX.Element }
    | { K: "community_description"; P: { description: string | null }; R: JSX.Element }
    | { K: "invitation"; R: JSX.Element }
    | { K: "espaceco_accept_cgu"; P: { url: string | undefined }; R: JSX.Element }
    | "already_member"
    | "not_member"
    | "accept"
    | "reject"
    | "inviting"
    | "rejecting"
>()("MemberInvitation");
export type I18n = typeof i18n;

export const MemberInvitationFrTranslations: Translations<"fr">["MemberInvitation"] = {
    document_title: "Invitation",
    community_loading: "Chargement du guichet en cours ...",
    community_loading_failed: "La récupération des informations du guichet a échoué.",
    userme_loading: "Chargement de vos données utilisateur en cours ...",
    userme_loading_failed: "La récupération de vous données d'utilisateur a échoué.",
    logo: "Logo du guichet",
    community_name: ({ name }) => (
        <div>
            Guichet <strong>{name}</strong>
        </div>
    ),
    community_description: ({ description }) => {
        return description ? <p dangerouslySetInnerHTML={{ __html: description }} /> : <p>Aucune description</p>;
    },
    invitation: <p>Vous avez reçu une invitation à rejoindre le guichet :</p>,
    espaceco_accept_cgu: ({ url }) => (
        <div>
            <p>{"Bonjour, vous n'avez pas encore accepté les conditions générales d'utilisation de l'espace collaboratif."}</p>
            <p>
                {"Veuillez vous connecter avec votre nom d'utilisateur sur "}
                {url ? (
                    <a href={url} target="_blank" rel="noreferrer">
                        {"l'espace collaboratif"}
                    </a>
                ) : (
                    "l'espace collaboratif"
                )}
                {" et accepter les CGU."}
                <br />
                {"Vous pourrez ensuite continuer la navigation sur cartes.gouv.fr."}
            </p>
        </div>
    ),
    already_member: "Vous êtes déjà membre de ce guichet",
    not_member: "Vous n'êtes pas membre de ce guichet",
    accept: "Accepter et rejoindre le guichet",
    reject: "Refuser l'invitation",
    inviting: "Invitation en cours ...",
    rejecting: "Refus en cours ...",
};

export const MemberInvitationEnTranslations: Translations<"en">["MemberInvitation"] = {
    document_title: "Invitation",
    community_loading: "Community loading ...",
    community_loading_failed: undefined,
    userme_loading: undefined,
    userme_loading_failed: undefined,
    logo: undefined,
    community_name: ({ name }) => (
        <p>
            Community <strong>`${name}`</strong>
        </p>
    ),
    community_description: undefined,
    invitation: undefined,
    espaceco_accept_cgu: ({ url }) => <p>{url}</p>,
    already_member: undefined,
    not_member: undefined,
    accept: undefined,
    reject: undefined,
    inviting: undefined,
    rejecting: undefined,
};
