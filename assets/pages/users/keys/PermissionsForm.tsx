import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { compareAsc } from "date-fns";
import { FC, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import functions from "../../../functions";
import { useTranslation } from "../../../i18n/i18n";
import { PermissionWithOfferingsDetailsResponseDto } from "../../../types/entrepot";

type PermissionsFormProps = {
    form: UseFormReturn;
    permissions: PermissionWithOfferingsDetailsResponseDto[] | undefined;
};

const PermissionsForm: FC<PermissionsFormProps> = ({ permissions, form }) => {
    const { t } = useTranslation("Permissions");

    const { setValue: setFormValue, getValues: getFormValues } = form;

    const handleCheckboxChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>, permId: string, offeringId: string) => {
            const checked = event.target.checked;

            const values = getFormValues();
            let _access;
            if (!("access" in values)) {
                _access = { permission: permId, offerings: [offeringId] };
            } else {
                _access = { ...values.access };
                if (permId !== _access.permission) {
                    _access.permission = permId;
                    _access.offerings = [];
                }
                if (!checked) {
                    _access.offerings = _access.offerings.filter((id) => offeringId !== id);
                } else _access.offerings.push(offeringId);
            }

            setFormValue("access", _access);
        },
        [getFormValues, setFormValue]
    );

    return (
        <div>
            <label className={fr.cx("fr-label")}>{t("title")}</label>
            {permissions === undefined || permissions.length === 0 ? (
                <div className={fr.cx("fr-my-2v")}>
                    <p>{t("no_permission")}</p>
                </div>
            ) : (
                permissions?.map((permission) => {
                    let expired = false;
                    if (permission.end_date && compareAsc(new Date(permission.end_date), new Date()) < 0) {
                        expired = true;
                    }

                    const legend = expired ? (
                        <span>
                            <strong>{permission.licence}</strong>
                            <Badge className={fr.cx("fr-ml-2v")} severity="warning">
                                {t("expired")}
                            </Badge>
                        </span>
                    ) : (
                        <strong>{permission.licence}</strong>
                    );

                    if (expired) {
                        return <Checkbox key={permission._id} legend={legend} options={[]} />;
                    }

                    const services = permission.offerings.map((offering) => {
                        return {
                            label: (
                                <span>
                                    {offering.layer_name}
                                    <Badge className={fr.cx("fr-ml-1v")} noIcon severity="info">
                                        {offering.type}
                                    </Badge>
                                </span>
                            ),
                            nativeInputProps: {
                                name: "services",
                                value: offering._id,
                                onChange: (event) => handleCheckboxChange(event, permission._id, offering._id),
                            },
                        };
                    });

                    const expiresOn = permission.end_date ? functions.date.format(permission.end_date) : null;
                    const hintText = expiresOn ? t("permission_expires_on", { date: expiresOn }) : null;

                    return <Checkbox className={fr.cx("fr-ml-2v")} key={permission._id} legend={legend} hintText={hintText} options={services} />;
                })
            )}
        </div>
    );
};

export default PermissionsForm;
