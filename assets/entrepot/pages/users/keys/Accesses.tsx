import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { CSSProperties, FC, useCallback, useEffect, useMemo, useState } from "react";
import { AccessCreateDto, PermissionOfferingResponseDto, PermissionWithOfferingsDetailsResponseDto } from "../../../../@types/entrepot";
import "../../../../sass/pages/my_keys.scss";
import { getNewAccesses } from "./utils/AccessesManager";

type AccessesProps = {
    label: string;
    hintText?: string;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    onChange: (value: AccessCreateDto[]) => void;
    value?: AccessCreateDto[];
    permissions: PermissionWithOfferingsDetailsResponseDto[];
};

const style: CSSProperties = {
    height: "200px",
    overflowX: "hidden",
    overflowY: "scroll",
};

const Accesses: FC<AccessesProps> = (props) => {
    const { value = [], permissions, label, hintText, state, stateRelatedMessage, onChange } = props;

    const [internal, setInternal] = useState<AccessCreateDto[]>([]);

    useEffect(() => {
        setInternal(value);
    }, [value]);

    const exists = useCallback(
        (permission, offering) => {
            const f = internal.find((v) => {
                return v.permission === permission && v.offerings.includes(offering);
            });
            return f !== undefined;
        },
        [internal]
    );

    /* Changement d'etat d'une checkbox */
    const handleCheckboxChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>, permissionId: string, offeringId: string) => {
            const checked = event.currentTarget.checked;

            const newAccesses = getNewAccesses(internal, permissionId, offeringId, checked);
            onChange(newAccesses);
        },
        [internal, onChange]
    );

    /* Calcul des options */
    const services = useMemo(() => {
        if (permissions === undefined) return [];

        // Trie des layer_name des offerings
        const temp: { permissionId: string; offering: PermissionOfferingResponseDto }[] = [];
        permissions.forEach((permission) => {
            permission.offerings.forEach((offering) => {
                temp.push({
                    permissionId: permission._id,
                    offering: offering,
                });
            });
        });
        return temp
            .sort((a, b) => {
                return a.offering.layer_name.toLocaleLowerCase() < b.offering.layer_name.toLocaleLowerCase()
                    ? -1
                    : a.offering.layer_name.toLocaleLowerCase() > b.offering.layer_name.toLocaleLowerCase()
                      ? 1
                      : 0;
            })
            .map((t) => {
                return {
                    label: (
                        <span className={"layer-name"}>
                            {t.offering.layer_name}
                            <Badge className={fr.cx("fr-ml-1v")} noIcon severity="info">
                                {t.offering.type}
                            </Badge>
                        </span>
                    ),
                    nativeInputProps: {
                        value: t.offering._id,
                        onChange: (event) => handleCheckboxChange(event, t.permissionId, t.offering._id),
                        checked: exists(t.permissionId, t.offering._id),
                    },
                };
            });
    }, [permissions, handleCheckboxChange, exists]);

    return (
        <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error")}>
            <label className={fr.cx("fr-label")}>
                {label}
                {hintText && <span className="fr-hint-text">{hintText}</span>}
            </label>
            <Checkbox className={fr.cx("fr-mt-2v")} options={services} style={style} />
            {state !== "default" && (
                <p
                    className={fr.cx(
                        (() => {
                            switch (state) {
                                case "error":
                                    return "fr-error-text";
                                case "success":
                                    return "fr-valid-text";
                            }
                        })()
                    )}
                >
                    {stateRelatedMessage}
                </p>
            )}
        </div>
    );
};

export default Accesses;
