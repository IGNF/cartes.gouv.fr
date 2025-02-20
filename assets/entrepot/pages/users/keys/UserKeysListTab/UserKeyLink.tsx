import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import api from "../../../../api";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { PermissionWithOfferingsDetailsResponseDto } from "../../../../../@types/entrepot";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useTranslation } from "../../../../../i18n/i18n";
import TextCopyToClipboard from "@/components/Utils/TextCopyToClipboard";

type UserKeyLinkProps = {
    permissionId: string;
    offeringId: string;
    hash: string | undefined;
};

const UserKeyLink: FC<UserKeyLinkProps> = ({ permissionId, hash, offeringId }) => {
    const { t: tCommon } = useTranslation("Common");

    const { data: permission } = useQuery<PermissionWithOfferingsDetailsResponseDto>({
        queryKey: RQKeys.get_permission(permissionId),
        queryFn: ({ signal }) => api.user.getPermission(permissionId, { signal }),
        staleTime: 3600000,
    });

    const offering = permission?.offerings?.find((o) => o._id === offeringId);

    if (offering?.type === "WMTS-TMS") {
        const wmtsUrl = offering.urls?.find((urlObj) => urlObj.type === "WMTS")?.url;
        const tmsUrl = offering.urls?.find((urlObj) => urlObj.type === "TMS")?.url;

        const wmtsCapabilitiesUrl = wmtsUrl ? `${wmtsUrl.split("?")[0]}?service=WMTS&version=1.0.0&request=GetCapabilities&apikey=${hash}` : null;

        const tmsCapabilitiesUrl = tmsUrl ? `${tmsUrl.split("/1.0.0/")[0]}/1.0.0/?apikey=${hash}` : null;

        return (
            <div className={fr.cx("fr-mb-3v")}>
                {wmtsCapabilitiesUrl && (
                    <TextCopyToClipboard
                        addon={
                            <Button
                                title={tCommon("new_window")}
                                priority="secondary"
                                iconId={"fr-icon-external-link-line"}
                                linkProps={{ href: wmtsCapabilitiesUrl, target: "_blank", rel: "noreferrer" }}
                            />
                        }
                        className={fr.cx("fr-mb-4v")}
                        label="WMTS"
                        text={wmtsCapabilitiesUrl}
                    />
                )}
                {tmsCapabilitiesUrl && (
                    <TextCopyToClipboard
                        addon={
                            <Button
                                title={tCommon("new_window")}
                                priority="secondary"
                                iconId={"fr-icon-external-link-line"}
                                linkProps={{ href: tmsCapabilitiesUrl, target: "_blank", rel: "noreferrer" }}
                            />
                        }
                        label="TMS"
                        text={tmsCapabilitiesUrl}
                    />
                )}
            </div>
        );
    }

    const url = offering?.urls?.[0]?.url;

    if (url !== undefined) {
        const urlObject = new URL(url);
        const rootUrl = `${urlObject.origin}${urlObject.pathname}`;
        const service = urlObject.searchParams.get("service");
        const version = urlObject.searchParams.get("version");

        const capabilitiesUrl = `${rootUrl}?service=${service}&version=${version}&request=GetCapabilities&apikey=${hash}`;

        return (
            <TextCopyToClipboard
                addon={
                    <Button
                        title={tCommon("new_window")}
                        priority="secondary"
                        iconId={"fr-icon-external-link-line"}
                        linkProps={{ href: capabilitiesUrl, target: "_blank", rel: "noreferrer" }}
                    />
                }
                className={fr.cx("fr-mb-4v")}
                label={offering?.type}
                text={capabilitiesUrl}
            />
        );
    }
};

export default UserKeyLink;
