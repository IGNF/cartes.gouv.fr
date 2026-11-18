import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import { FC } from "react";

import { CommunityResponseDTO } from "../../../@types/espaceco";
import { espaceCoSiteUrl } from "@/env";
import useUserMe from "../../hooks/useUserMe";
import { useTranslation } from "../../../i18n/i18n";
import SymfonyRouting from "../../../modules/Routing";

import placeholder1x1 from "../../../img/placeholder.1x1.png";

const DESCRIPTION_MAX_LENGTH = 150;

type CommunityListItemProps = {
    community: CommunityResponseDTO;
};

const CommunityListItem: FC<CommunityListItemProps> = ({ community }) => {
    const { t } = useTranslation("EspaceCoCommunityList");
    const { t: tCommon } = useTranslation("Common");
    const { data: me } = useUserMe();

    const role = me?.communities_member.find((m) => m.community_id === community.id)?.role;
    const canOpen = community.active && (role === "member" || role === "admin");

    // DOMParser n’exécute ni script ni chargement : texte brut sans injection de HTML
    const description = new DOMParser().parseFromString(community.description ?? "", "text/html").body.textContent?.trim();

    // lien de gestion du groupe sur l’espace collaboratif, réservé aux gestionnaires
    const groupUrl = role === "admin" && espaceCoSiteUrl ? `${espaceCoSiteUrl}/group/${community.id}` : null;
    const groupLabel = community.active ? tCommon("modify") : t("append_community");

    return (
        <Card
            imageUrl={community.logo_url || placeholder1x1}
            imageAlt=""
            nativeImgProps={{
                onError: ({ currentTarget }) => {
                    currentTarget.onerror = null; // évite une boucle si l’image de repli échoue aussi
                    currentTarget.src = placeholder1x1;
                },
            }}
            horizontal={true}
            size="small"
            title={community.name}
            desc={description && (description.length > DESCRIPTION_MAX_LENGTH ? `${description.slice(0, DESCRIPTION_MAX_LENGTH)}…` : description)}
            start={
                role && (
                    <Badge as="span" noIcon={true} small={true}>
                        {t("role", { role })}
                    </Badge>
                )
            }
            footer={
                (canOpen || groupUrl) && (
                    <ul className={fr.cx("fr-btns-group", "fr-btns-group--inline-md", "fr-btns-group--sm")}>
                        {canOpen && (
                            <li>
                                <Button priority="secondary" linkProps={{ href: `${SymfonyRouting.getBaseUrl()}/guichet-collaboratif/${community.id}` }}>
                                    {t("open_community")}
                                </Button>
                            </li>
                        )}
                        {groupUrl && (
                            <li>
                                <Button
                                    priority="secondary"
                                    linkProps={{ href: groupUrl, target: "_blank", rel: "noreferrer", title: `${groupLabel} - ${tCommon("new_window")}` }}
                                >
                                    {groupLabel}
                                </Button>
                            </li>
                        )}
                    </ul>
                )
            }
        />
    );
};

export default CommunityListItem;
