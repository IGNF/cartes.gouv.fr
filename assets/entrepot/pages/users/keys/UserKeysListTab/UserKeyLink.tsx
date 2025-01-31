import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import api from "../../../../api";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { PermissionWithOfferingsDetailsResponseDto } from "../../../../../@types/entrepot";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useTranslation } from "../../../../../i18n/i18n";
import { useSnackbarStore } from "../../../../../stores/SnackbarStore";

type UserKeyLinkProps = {
    permissionId: string;
    offeringId: string;
    hash: string | undefined;
};

const UserKeyLink: FC<UserKeyLinkProps> = ({ permissionId, hash, offeringId }) => {
    const { t: tCommon } = useTranslation("Common");

    const setMessage = useSnackbarStore((state) => state.setMessage);

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
                    <>
                        <span className={fr.cx("fr-hint-text")}>WMTS</span>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-1v")}>
                            <input className={fr.cx("fr-input", "fr-col-6")} type="text" value={wmtsCapabilitiesUrl} readOnly />
                            <Button
                                className={fr.cx("fr-ml-2v", "fr-col-3")}
                                title={tCommon("copy")}
                                priority={"tertiary no outline"}
                                iconId={"ri-file-copy-2-line"}
                                onClick={async () => {
                                    await navigator.clipboard.writeText(wmtsCapabilitiesUrl);
                                    setMessage(tCommon("url_copied"));
                                }}
                            />
                            <Button
                                className={fr.cx("fr-ml-2v", "fr-col-3")}
                                title={tCommon("new_window")}
                                priority="tertiary no outline"
                                iconId={"fr-icon-external-link-line"}
                                linkProps={{ href: wmtsCapabilitiesUrl, target: "_blank", rel: "noreferrer" }}
                            />
                        </div>
                    </>
                )}
                {tmsCapabilitiesUrl && (
                    <>
                        <span className={fr.cx("fr-hint-text")}>TMS</span>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <input className={fr.cx("fr-input", "fr-col-6")} type="text" value={tmsCapabilitiesUrl} readOnly />
                            <Button
                                className={fr.cx("fr-ml-2v", "fr-col-3")}
                                title={tCommon("copy")}
                                priority={"tertiary no outline"}
                                iconId={"ri-file-copy-2-line"}
                                onClick={async () => {
                                    await navigator.clipboard.writeText(tmsCapabilitiesUrl);
                                    setMessage(tCommon("url_copied"));
                                }}
                            />
                            <Button
                                className={fr.cx("fr-ml-2v", "fr-col-3")}
                                title={tCommon("new_window")}
                                priority="tertiary no outline"
                                iconId={"fr-icon-external-link-line"}
                                linkProps={{ href: tmsCapabilitiesUrl, target: "_blank", rel: "noreferrer" }}
                            />
                        </div>
                    </>
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
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
                <input className={fr.cx("fr-input", "fr-col-6")} type="text" value={capabilitiesUrl} readOnly />
                <Button
                    className={fr.cx("fr-ml-2v", "fr-col-3")}
                    title={tCommon("copy")}
                    priority={"tertiary no outline"}
                    iconId={"ri-file-copy-2-line"}
                    onClick={async () => {
                        await navigator.clipboard.writeText(capabilitiesUrl);
                        setMessage(tCommon("url_copied"));
                    }}
                />
                <Button
                    className={fr.cx("fr-ml-2v", "fr-col-3")}
                    title={tCommon("new_window")}
                    priority="tertiary no outline"
                    iconId={"fr-icon-external-link-line"}
                    linkProps={{ href: capabilitiesUrl, target: "_blank", rel: "noreferrer" }}
                />
            </div>
        );
    }
};

export default UserKeyLink;
