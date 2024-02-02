import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { declareComponentKeys } from "i18nifty";
import { FC } from "react";
import { Translations, useTranslation } from "../../../i18n/i18n";
import { UserKeyResponseDto } from "../../../types/entrepot";
import { routes } from "../../../router/router";

type AccessKeysListTabProps = {
    access_keys: UserKeyResponseDto[] | undefined;
};

const AccessKeysListTab: FC<AccessKeysListTabProps> = ({ access_keys }) => {
    const { t } = useTranslation("AccessKeysList");

    return (
        <>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                {access_keys === undefined || access_keys.length === 0 ? (
                    <p>{t("no_access_keys")}</p>
                ) : (
                    access_keys.map((accessKey) => {
                        return (
                            <>
                                <div className={fr.cx("fr-col-8")}>
                                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                        {accessKey.name}
                                        <Tag className={fr.cx("fr-mx-1v")}>{accessKey.type}</Tag>
                                    </div>
                                </div>
                                <div className={fr.cx("fr-col-4")}>
                                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                                        <Button title={t("remove")} priority={"tertiary no outline"} iconId={"fr-icon-delete-line"} />
                                    </div>
                                </div>
                            </>
                        );
                    })
                )}
            </div>
            <div className={fr.cx("fr-grid-row")}>
                <Button linkProps={routes.add_access_key().link}>{t("add")}</Button>
            </div>
        </>
    );
};

export default AccessKeysListTab;

// traductions
export const { i18n } = declareComponentKeys<"no_access_keys" | "add" | "remove">()("AccessKeysList");

export const AccessKeysListFrTranslations: Translations<"fr">["AccessKeysList"] = {
    no_access_keys: "Vous n'avez aucune clé d'accès",
    add: "Ajouter une clé",
    remove: "Supprimer la clé",
};

export const AccessKeysListEnTranslations: Translations<"en">["AccessKeysList"] = {
    no_access_keys: "You don't have any access keys",
    add: "Add key",
    remove: "Remove key",
};
