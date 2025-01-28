import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";

import type { UserKeyDetailedWithAccessesResponseDto } from "../../../../../@types/app";
import {
    type HashInfoDto,
    type PermissionWithOfferingsResponseDto,
    UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum,
    type UserKeyResponseDto,
} from "../../../../../@types/entrepot";
import { ConfirmDialog, ConfirmDialogModal } from "../../../../../components/Utils/ConfirmDialog";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import { routes } from "../../../../../router/router";
import { useSnackbarStore } from "../../../../../stores/SnackbarStore";
import api from "../../../../api";
import UserKeyLink from "./UserKeyLink";

type UserKeysListTabProps = {
    keys: UserKeyDetailedWithAccessesResponseDto[] | undefined;
    permissions: PermissionWithOfferingsResponseDto[] | undefined;
};

const UserKeysListTab: FC<UserKeysListTabProps> = ({ keys, permissions }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("UserKeysListTab");

    const setMessage = useSnackbarStore((state) => state.setMessage);

    const [currentKey, setCurrentKey] = useState<string | undefined>(undefined);

    /* Y-a-t-il deja une cle OAUTH2 */
    const hasOauth2 = useMemo(() => {
        const f = keys?.find((key) => key.type === UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum.OAUTH2);
        return !!f;
    }, [keys]);

    /* l'utilisateur a-t-il des permissions */
    const hasPermissions = useMemo(() => {
        return permissions !== undefined && permissions.length > 0;
    }, [permissions]);

    /* Ces permissions sont-elles toutes only_oauth a true */
    const permissionsAreAllOnlyOauth = useMemo(() => {
        const oauths = permissions?.filter((permission) => permission.only_oauth) ?? [];
        return oauths.length === permissions?.length;
    }, [permissions]);

    const canAdd = useMemo(() => {
        return hasPermissions && !(hasOauth2 && permissionsAreAllOnlyOauth);
    }, [hasPermissions, hasOauth2, permissionsAreAllOnlyOauth]);

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
                <p>{t("no_keys")}</p>
            ) : (
                keys.map((accessKey) => {
                    return (
                        <div key={accessKey._id} className={fr.cx("fr-my-1v")}>
                            <Accordion
                                label={
                                    <div>
                                        {accessKey.name}
                                        {accessKey.type && (
                                            <Badge className={fr.cx("fr-ml-2v")} noIcon={true} severity={"info"}>
                                                {accessKey.type}
                                            </Badge>
                                        )}
                                    </div>
                                }
                            >
                                <div>
                                    {accessKey.accesses !== undefined && accessKey.accesses.length !== 0 ? (
                                        <>
                                            {accessKey.type && accessKey.type === UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum.HASH && (
                                                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-2v")}>
                                                    {t("hash_value", { value: (accessKey.type_infos as HashInfoDto).hash })}

                                                    {(accessKey.type_infos as HashInfoDto).hash !== undefined && (
                                                        <Button
                                                            className={fr.cx("fr-ml-2v")}
                                                            title={tCommon("copy")}
                                                            priority={"tertiary no outline"}
                                                            iconId={"ri-file-copy-2-line"}
                                                            onClick={async () => {
                                                                const hash = (accessKey.type_infos as HashInfoDto).hash;
                                                                if (hash !== undefined) {
                                                                    await navigator.clipboard.writeText(hash);
                                                                    setMessage(t("hash_value_copied"));
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            <div className={fr.cx("fr-mb-1v")}>{t("services")}</div>
                                            <ul className={fr.cx("fr-raw-list")}>
                                                {accessKey.accesses
                                                    .sort((a, b) => {
                                                        return a.offering.layer_name.toLowerCase() < b.offering.layer_name.toLowerCase()
                                                            ? -1
                                                            : a.offering.layer_name.toLowerCase() > b.offering.layer_name.toLowerCase()
                                                              ? 1
                                                              : 0;
                                                    })
                                                    .map((access) => (
                                                        <li key={access.offering._id} className={fr.cx("fr-mb-5v")}>
                                                            {access.offering.layer_name}
                                                            <Badge className={fr.cx("fr-ml-2v")} noIcon={true} severity={"info"}>
                                                                {access.offering.type}
                                                            </Badge>
                                                            <UserKeyLink
                                                                permissionId={access.permission._id}
                                                                offeringId={access.offering._id}
                                                                hash={(accessKey.type_infos as HashInfoDto).hash}
                                                            />
                                                        </li>
                                                    ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <div className={fr.cx("fr-mb-1v")}>{t("no_services")}</div>
                                    )}
                                    <div className={fr.cx("fr-grid-row", "fr-my-2v")}>
                                        <Button
                                            title={tCommon("modify")}
                                            priority="secondary"
                                            iconId="fr-icon-edit-line"
                                            size="small"
                                            onClick={() => {
                                                routes.user_key_edit({ keyId: accessKey._id }).push();
                                            }}
                                        >
                                            {tCommon("modify")}
                                        </Button>
                                        <Button
                                            title={tCommon("delete")}
                                            className={fr.cx("fr-ml-2v")}
                                            priority="secondary"
                                            iconId="fr-icon-delete-line"
                                            size="small"
                                            onClick={() => {
                                                setCurrentKey(accessKey._id);
                                                ConfirmDialogModal.open();
                                            }}
                                        >
                                            {tCommon("delete")}
                                        </Button>
                                    </div>
                                </div>
                            </Accordion>
                        </div>
                    );
                })
            )}
            {hasPermissions === false && <p>{t("no_permission_warning")}</p>}
            <Button className={fr.cx("fr-my-2v")} {...(canAdd ? { linkProps: routes.user_key_add().link } : { disabled: true })}>
                {t("add")}
            </Button>
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
