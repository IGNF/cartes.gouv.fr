import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";

import type { UserKeyDetailedWithAccessesResponseDto } from "../../../../../@types/app";
import { type HashInfoDto, type PermissionWithOfferingsResponseDto, type UserKeyResponseDto } from "../../../../../@types/entrepot";
import { ConfirmDialog, ConfirmDialogModal } from "../../../../../components/Utils/ConfirmDialog";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import { appRoot, routes } from "../../../../../router/router";
import api from "../../../../api";
import UserKeyLink from "./UserKeyLink";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import Tooltip from "@codegouvfr/react-dsfr/Tooltip";
import TagsGroup from "@codegouvfr/react-dsfr/TagsGroup";
import { TagProps } from "@codegouvfr/react-dsfr/Tag";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import ovoidSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/background/ovoid.svg?no-inline";
import padlock from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/system/padlock.svg?no-inline";

type UserKeysListTabProps = {
    keys: UserKeyDetailedWithAccessesResponseDto[] | undefined;
    permissions: PermissionWithOfferingsResponseDto[] | undefined;
};

const UserKeysListTab: FC<UserKeysListTabProps> = ({ keys, permissions }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("UserKeysListTab");

    const [currentKey, setCurrentKey] = useState<string | undefined>(undefined);

    /* l'utilisateur a-t-il des permissions */
    const hasPermissions = useMemo(() => {
        return permissions !== undefined && permissions.length > 0;
    }, [permissions]);

    const queryClient = useQueryClient();

    /* Suppression d'une cle */
    const {
        status: removeStatus,
        error: removeError,
        mutate: mutateRemove,
    } = useMutation<null, CartesApiException, string>({
        mutationFn: (keyId) => api.user.removeKey(keyId),
        onSuccess() {
            queryClient.setQueryData<UserKeyResponseDto[]>(RQKeys.my_keys(), (keys) => {
                return keys?.filter((key) => key._id !== currentKey);
            });
        },
    });

    const { copy } = useCopyToClipboard();
    const [copiedText, setCopiedText] = useState<string | null>(null);

    return (
        <>
            {removeStatus === "error" && <Alert severity={"error"} closable title={tCommon("error")} description={removeError.message} />}
            {removeStatus === "pending" && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>{tCommon("removing")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
            {keys === undefined || keys.length === 0 ? (
                <div className={fr.cx("fr-my-8w", "fr-mb-4w", "fr-grid-row", "fr-grid-row--middle", "fr-grid-row--gutters")}>
                    <div className={fr.cx("fr-col-12", "fr-col-sm-5", "fr-col-md-4", "fr-py-0")}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={fr.cx("fr-responsive-img", "fr-artwork")}
                            aria-hidden="true"
                            width="160"
                            height="200"
                            viewBox="0 0 160 200"
                        >
                            <use className={fr.cx("fr-artwork-motif")} href={`${ovoidSvgUrl}#artwork-motif`} />
                            <use className={fr.cx("fr-artwork-background")} href={`${ovoidSvgUrl}#artwork-background`} />
                            <g transform="translate(40, 60)">
                                <use className={fr.cx("fr-artwork-decorative")} href={`${padlock}#artwork-decorative`} />
                                <use className={fr.cx("fr-artwork-minor")} href={`${padlock}#artwork-minor`} />
                                <use className={fr.cx("fr-artwork-major")} href={`${padlock}#artwork-major`} />
                            </g>
                        </svg>
                    </div>
                    <div className={fr.cx("fr-col-sm-7", "fr-col-md-8", "fr-pl-md-6w")}>
                        <h6>{t("no_keys")}</h6>
                        {t("explain_no_keys")}
                        <Button
                            linkProps={{
                                href: appRoot + "/documentation/",
                                target: "_blank",
                                rel: "noreferrer",
                                title: t("consult_documentation") + " - " + tCommon("new_window"),
                            }}
                            priority="secondary"
                        >
                            {t("consult_documentation")}
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <SearchBar
                        className={fr.cx("fr-col-12", "fr-col-sm-7", "fr-col-lg-5", "fr-mt-10v", "fr-mb-5v")}
                        label={tCommon("search")}
                        allowEmptySearch={true}
                    />
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--gutters")}>
                        <Tooltip title="Le nombre maximal de clés par utilisateur est de 10" />
                        <h3 className={fr.cx("fr-mt-6v", "fr-mx-1w")}>{t("active_keys")}</h3>
                        <Badge noIcon={true} severity={"info"}>
                            {keys.length}/10
                        </Badge>
                    </div>

                    {keys.map((accessKey) => {
                        const groupedServices = (accessKey.accesses ?? []).reduce(
                            (acc, access) => {
                                const type = access.offering.type;
                                if (!acc[type]) {
                                    acc[type] = [];
                                }
                                acc[type].push(access);
                                return acc;
                            },
                            {} as Record<string, typeof accessKey.accesses>
                        );

                        console.log("ACCESSKEY", accessKey);

                        const tags: TagProps[] = [];

                        if (accessKey.blacklist?.length || accessKey.whitelist?.length) {
                            tags.push({ children: "Filtrage par IP", iconId: "fr-icon-check-line" });
                        }

                        if (accessKey.user_agent?.trim()) {
                            tags.push({ children: "User agent", iconId: "fr-icon-check-line" });
                        }

                        if (accessKey.referer?.trim()) {
                            tags.push({ children: "Referer", iconId: "fr-icon-check-line" });
                        }

                        return (
                            <div key={accessKey._id} className={fr.cx("fr-my-1v")}>
                                <div
                                    className={fr.cx("fr-mb-5v", "fr-px-6v", "fr-py-3w")}
                                    style={{ border: "1px solid", borderColor: fr.colors.decisions.border.default.grey.default }}
                                >
                                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--gutters")}>
                                        <div className={fr.cx("fr-col-12", "fr-col-sm-9", "fr-grid-row", "fr-grid-row--middle")}>
                                            <h4
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    display: "inline-block",
                                                    maxWidth: "calc(100% - 5.5rem)",
                                                }}
                                                className={fr.cx("fr-mr-1w")}
                                            >
                                                {accessKey.name}
                                            </h4>
                                            {accessKey.type && (
                                                <Badge className={fr.cx("fr-mb-6v")} noIcon={true} severity={"info"}>
                                                    {accessKey.type}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className={`frx-flex-end-sm ${fr.cx("fr-col-12", "fr-col-sm-3", "fr-mb-6v")}`}>
                                            <Button
                                                title={tCommon("modify")}
                                                priority="primary"
                                                iconId="fr-icon-edit-line"
                                                size="small"
                                                onClick={() => {
                                                    routes.user_key_edit({ keyId: accessKey._id }).push();
                                                }}
                                            />
                                            <Button
                                                title={tCommon("delete")}
                                                className={fr.cx("fr-ml-4v")}
                                                priority="secondary"
                                                iconId="fr-icon-delete-line"
                                                size="small"
                                                onClick={() => {
                                                    setCurrentKey(accessKey._id);
                                                    ConfirmDialogModal.open();
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {accessKey.accesses !== undefined && accessKey.accesses.length !== 0 ? (
                                        <>
                                            {Object.entries(groupedServices).map(([type, services], typeIndex) => {
                                                return (
                                                    <div key={type} className={fr.cx("fr-mb-5v")}>
                                                        {typeIndex >= 1 ? <hr /> : null}
                                                        <div className={fr.cx("fr-col-12", "fr-col-lg-10")}>
                                                            <UserKeyLink
                                                                permissionId={services[0].permission._id}
                                                                offeringId={services[0].offering._id}
                                                                hash={accessKey.type_infos && (accessKey.type_infos as HashInfoDto).hash}
                                                            />
                                                        </div>
                                                        <div className={fr.cx("fr-mb-1v")}>{t("available_services")}</div>
                                                        <ul>
                                                            {services.map((service) => (
                                                                <div key={service.offering._id}>
                                                                    <li
                                                                        className={fr.cx("fr-grid-row", "fr-grid-row--middle")}
                                                                        style={{ marginBottom: "0.2rem" }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                                whiteSpace: "nowrap",
                                                                                display: "inline-block",
                                                                                maxWidth: "calc(100% - 2.5rem)",
                                                                            }}
                                                                        >
                                                                            &bull; {service.offering.layer_name}
                                                                        </div>
                                                                        <Button
                                                                            title={tCommon("copy_to_clipboard")}
                                                                            className={fr.cx("fr-ml-1w")}
                                                                            priority="tertiary"
                                                                            iconId={
                                                                                copiedText === service.offering._id ? "fr-icon-check-line" : "ri-file-copy-line"
                                                                            }
                                                                            size="small"
                                                                            onClick={() => {
                                                                                copy(service.offering.layer_name);
                                                                                setCopiedText(service.offering._id);
                                                                                setTimeout(() => setCopiedText(null), 5000);
                                                                            }}
                                                                        />
                                                                    </li>
                                                                </div>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                );
                                            })}
                                            {tags.length > 0 && <TagsGroup tags={tags as [TagProps, ...TagProps[]]} />}
                                        </>
                                    ) : (
                                        <>
                                            <Badge className={fr.cx("fr-mb-1v")} severity={"error"}>
                                                {t("no_services_status")}
                                            </Badge>
                                            <div className={fr.cx("fr-mb-1v")}>{t("no_services_hint")}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </>
            )}
            {hasPermissions === false && <p>{t("no_permission_warning")}</p>}
            <ConfirmDialog
                title={t("confirm_remove")}
                onConfirm={() => {
                    if (currentKey !== undefined) {
                        mutateRemove(currentKey);
                    }
                }}
            />
        </>
    );
};

export default UserKeysListTab;
