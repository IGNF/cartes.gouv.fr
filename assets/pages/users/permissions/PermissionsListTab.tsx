import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { compareAsc } from "date-fns";
import { FC } from "react";
import { useTranslation } from "../../../i18n/i18n";
import { PermissionWithOfferingsDetailsResponseDto } from "../../../types/entrepot";
import functions from "../../../functions";

type PermissionsListTabProps = {
    permissions: PermissionWithOfferingsDetailsResponseDto[] | undefined;
};

const PermissionsListTab: FC<PermissionsListTabProps> = ({ permissions }) => {
    const { t } = useTranslation("Permissions");

    return permissions === undefined || permissions.length === 0 ? (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            <p>{t("no_permission")}</p>
        </div>
    ) : (
        <>
            {permissions.map((permission) => {
                let expired = false;
                if (permission.end_date && compareAsc(new Date(permission.end_date), new Date()) < 0) {
                    expired = true;
                }
                const expiresOn = permission.end_date ? functions.date.format(permission.end_date) : null;
                const title = expired ? (
                    <span>
                        <strong>{permission.licence}</strong>
                        <Badge className={fr.cx("fr-ml-2v")} severity="warning">
                            {t("expired")}
                        </Badge>
                    </span>
                ) : (
                    <span>
                        <strong>{permission.licence}</strong>
                        {expiresOn && <span className={fr.cx("fr-ml-2v")}>{t("expires_on", { date: expiresOn })}</span>}
                    </span>
                );

                return (
                    <ul key={permission._id} className={fr.cx("fr-raw-list", "fr-my-2v")}>
                        <li>{title}</li>
                        {!expired && (
                            <li>
                                <ul className={fr.cx("fr-raw-list", "fr-ml-8v")}>
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
                            </li>
                        )}
                    </ul>
                );
            })}
        </>
    );
};

export default PermissionsListTab;
