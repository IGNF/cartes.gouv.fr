import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC, useState } from "react";
import api from "../../../api";
import { ConfirmDialog, ConfirmDialogModal } from "../../../components/Utils/ConfirmDialog";
import { Translations, useTranslation } from "../../../i18n/i18n";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { UserKeyResponseDto } from "../../../types/entrepot";
import RQKeys from "../../../modules/RQKeys";

type UserKeysListTabProps = {
    access_keys: UserKeyResponseDto[] | undefined;
};

const UserKeysListTab: FC<UserKeysListTabProps> = ({ access_keys }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("UserKeysListTab");

    const [error, setError] = useState<CartesApiException | undefined>(undefined);
    const [currentKey, setCurrentKey] = useState<string | undefined>(undefined);

    const queryClient = useQueryClient();

    /* Suppression d'une cle */
    const deleteKeyMutation = useMutation<null, CartesApiException, string>({
        mutationFn: (keyId) => api.user.removeKey(keyId),
        onSuccess() {
            queryClient.setQueryData<UserKeyResponseDto[]>(RQKeys.me_keys(), (keys) => {
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
            {access_keys === undefined || access_keys.length === 0 ? (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                    <p>{t("no_access_keys")}</p>
                </div>
            ) : (
                access_keys.map((accessKey) => {
                    return (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--middle")} key={accessKey._id}>
                            <div className={fr.cx("fr-col", "fr-py-2v")}>
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                    {accessKey.name}
                                    <Badge className={fr.cx("fr-ml-2v")} noIcon={true} severity={"info"}>
                                        {accessKey.type}
                                    </Badge>
                                </div>
                            </div>
                            <div className={fr.cx("fr-col", "fr-py-2v")}>
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                                    <Button title={t("modify")} priority={"tertiary no outline"} iconId={"fr-icon-pencil-fill"} onClick={() => {}} />
                                    <Button
                                        title={t("remove")}
                                        priority={"tertiary no outline"}
                                        iconId={"fr-icon-delete-line"}
                                        onClick={() => {
                                            setCurrentKey(accessKey._id);
                                            ConfirmDialogModal.open();
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
            <div className={fr.cx("fr-grid-row", "fr-mt-2v")}>
                <Button linkProps={routes.add_access_key().link}>{t("add")}</Button>
            </div>
            <ConfirmDialog
                title={t("confirm_remove")}
                onConfirm={() => {
                    if (currentKey !== undefined) {
                        deleteKeyMutation.mutate(currentKey);
                    }
                }}
            />
        </>
    );
};

export default UserKeysListTab;

// traductions
export const { i18n } = declareComponentKeys<"no_access_keys" | "add" | "modify" | "remove" | "confirm_remove">()("UserKeysListTab");

export const UserKeysListTabFrTranslations: Translations<"fr">["UserKeysListTab"] = {
    no_access_keys: "Vous n'avez aucune clé d'accès",
    add: "Ajouter une clé",
    modify: "Modifier la clé",
    remove: "Supprimer la clé",
    confirm_remove: "Êtes-vous sûr de vouloir supprimer cette clé ?",
};

export const UserKeysListTabEnTranslations: Translations<"en">["UserKeysListTab"] = {
    no_access_keys: "You don't have any access keys",
    add: "Add key",
    modify: "Modify key",
    remove: "Remove key",
    confirm_remove: "Are you sure you want to delete this key ?",
};
