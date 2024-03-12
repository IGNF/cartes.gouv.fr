import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC, useState } from "react";
import api from "../../../api";
import { ConfirmDialog, ConfirmDialogModal } from "../../../components/Utils/ConfirmDialog";
import Wait from "../../../components/Utils/Wait";
import { Translations, useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { UserKeysWithAccessesResponseDto } from "../../../types/app";
import { UserKeyResponseDto } from "../../../types/entrepot";

type UserKeysListTabProps = {
    keys: UserKeysWithAccessesResponseDto[] | undefined;
    hasPermissions: boolean;
};

const UserKeysListTab: FC<UserKeysListTabProps> = ({ keys, hasPermissions }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("UserKeysListTab");

    const [error, setError] = useState<CartesApiException | undefined>(undefined);
    const [currentKey, setCurrentKey] = useState<string | undefined>(undefined);

    /* TODO Plusieurs access peuvent avoir la meme offering */
    /* const servicesByKey = useMemo(() => {
        if (keys === undefined || keys.length === 0) {
            return {};
        }

        const result = {};
        keys.forEach((key) => {
            const services = Array.from(key.accesses, (access) => access.offering._id);
            result[key._id] = key._id in result ? [...result[key._id], ...services] : services;
            result[key._id] = [...new Set(result[key._id])]; // unicite
        });
        return result;
    }, [keys]);
    console.log(servicesByKey); */

    const queryClient = useQueryClient();

    /* Suppression d'une cle */
    const { isPending: isRemovePending, mutate: mutateRemove } = useMutation<null, CartesApiException, string>({
        mutationFn: (keyId) => api.user.removeKey(keyId),
        throwOnError: true,
        onSuccess() {
            queryClient.setQueryData<UserKeyResponseDto[]>(RQKeys.my_keys(), (keys) => {
                const newkeys = keys?.filter((key) => key._id !== currentKey);
                return newkeys;
            });
        },
        onError() {
            setError(error);
        },
    });

    return (
        <>
            {error && <Alert severity={"error"} title={tCommon("error")} description={error?.message} className={fr.cx("fr-my-3w")} />}
            {isRemovePending /* || isModifyPending */ && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>{isRemovePending ? tCommon("removing") : tCommon("modifying")}</h6>
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
                                        <Badge className={fr.cx("fr-ml-2v")} noIcon={true} severity={"info"}>
                                            {accessKey.type}
                                        </Badge>
                                    </div>
                                }
                            >
                                <div>
                                    {accessKey.accesses !== undefined && accessKey.accesses.length ? (
                                        <>
                                            <div className={fr.cx("fr-mb-1v")}>{t("services")}</div>
                                            <ul className={fr.cx("fr-raw-list")}>
                                                {accessKey.accesses.map((access) => (
                                                    <li key={access.offering._id}>
                                                        {access.offering.layer_name}
                                                        <Badge className={fr.cx("fr-ml-2v")} noIcon={true} severity={"info"}>
                                                            {access.offering.type}
                                                        </Badge>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <div className={fr.cx("fr-mb-1v")}>{t("no_services")}</div>
                                    )}
                                    <div className={fr.cx("fr-grid-row", "fr-my-2v")}>
                                        <Button
                                            disabled={true} // TODO A REACTIVER : La route /users/me/keys/{key} n'est qu'en qualif pour l'instant
                                            onClick={() => {
                                                routes.user_key_edit({ keyId: accessKey._id }).push();
                                            }}
                                        >
                                            {tCommon("modify")}
                                        </Button>
                                        <Button
                                            className={fr.cx("fr-ml-2v")}
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
            <Button className={fr.cx("fr-my-2v")} {...(hasPermissions ? { linkProps: routes.user_key_add().link } : { disabled: true })}>
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

// traductions
export const { i18n } = declareComponentKeys<
    "no_keys" | "no_permission_warning" | "services" | "no_services" | "add" | "modify" | "remove" | "confirm_remove"
>()("UserKeysListTab");

export const UserKeysListTabFrTranslations: Translations<"fr">["UserKeysListTab"] = {
    no_keys: "Vous n'avez aucune clé d'accès",
    no_permission_warning: "Vous n'avez aucune permission, il n'est pas possible d'ajouter une clé",
    services: "Services accessibles",
    no_services: "Cette clé n'a accès à aucun service",
    add: "Ajouter une clé",
    modify: "Modifier la clé",
    remove: "Supprimer la clé",
    confirm_remove: "Êtes-vous sûr de vouloir supprimer cette clé ?",
};

export const UserKeysListTabEnTranslations: Translations<"en">["UserKeysListTab"] = {
    no_keys: "You don't have any access keys",
    no_permission_warning: "You have no permissions, it is not possible to add a key",
    services: "Accessible services",
    no_services: "This key does not have access to any services",
    add: "Add key",
    modify: "Modify key",
    remove: "Remove key",
    confirm_remove: "Are you sure you want to delete this key ?",
};
