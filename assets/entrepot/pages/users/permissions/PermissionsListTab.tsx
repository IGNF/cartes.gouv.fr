import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { compareAsc } from "date-fns";
import { FC } from "react";
import functions from "../../../../functions";
import { useTranslation } from "../../../../i18n/i18n";
import { PermissionDetailsResponseDto } from "../../../../types/entrepot";
import "../../../../sass/pages/my_keys.scss";

type PermissionsListTabProps = {
    permissions: PermissionDetailsResponseDto[] | undefined;
};

const PermissionsListTab: FC<PermissionsListTabProps> = ({ permissions }) => {
    const { t } = useTranslation("Permissions");

    return permissions === undefined || permissions.length === 0 ? (
        <p>{t("no_permission")}</p>
    ) : (
        <div>
            {permissions.map((permission, index) => {
                const className = index % 2 === 0 ? "frx-permission frx-permission-even" : "frx-permission";

                const grantedBy = permission.datastore_author?.name;

                let expired = false;
                if (permission.end_date && compareAsc(new Date(permission.end_date), new Date()) < 0) {
                    expired = true;
                }
                const expiresOn = permission.end_date ? functions.date.format(permission.end_date) : null;

                return (
                    <div key={permission._id} className={className}>
                        <div className={fr.cx("fr-mb-1v")}>
                            {grantedBy && <div className={fr.cx("fr-grid-row")}>{t("permission_granted_by", { name: grantedBy })}</div>}
                            {expired ? (
                                <Badge severity="warning">{t("expired", { date: expiresOn })}</Badge>
                            ) : (
                                expiresOn && <div>{t("expires_on", { date: expiresOn })}</div>
                            )}
                        </div>
                        <ul className={fr.cx("fr-raw-list")}>
                            {permission.offerings.map((offering) => (
                                <li key={offering._id}>
                                    <span>
                                        {offering.layer_name}
                                        <Badge className={fr.cx("fr-ml-1v")} noIcon severity="info">
                                            {offering.type}
                                        </Badge>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
};

export default PermissionsListTab;
