import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { CSSProperties, ComponentProps, FC, ReactNode, useCallback, useMemo, useState } from "react";
import "../../../../sass/pages/my_keys.scss";
import { AccessCreateDto, PermissionWithOfferingsDetailsResponseDto } from "../../../../types/entrepot";
import AccessesManager from "./utils/AccessesManager";

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

    const [accesses, setAccesses] = useState<AccessCreateDto[]>(value);

    const exists = useCallback(
        (permission, offering) => {
            if (value === undefined) return false;
            const f = value.find((v) => v.permission === permission && v.offerings.includes(offering));
            return f !== undefined;
        },
        [value]
    );

    /* Changement d'etat d'une checkbox */
    const handleCheckboxChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>, permissionId: string, offeringId: string) => {
            const checked = event.currentTarget.checked;

            const newAccesses = new AccessesManager(accesses).change(permissionId, offeringId, checked);
            setAccesses(newAccesses);
            onChange(newAccesses);
        },
        [accesses, onChange]
    );

    /* Calcul des options */
    const services = useMemo(() => {
        if (permissions === undefined) return [];

        let result: {
            label: ReactNode;
            hintText?: ReactNode;
            nativeInputProps: ComponentProps<"input">;
        }[] = [];

        permissions.forEach((permission) => {
            const options = permission.offerings.map((offering) => {
                return {
                    label: (
                        <span className={"layer-name"}>
                            {offering.layer_name}
                            <Badge className={fr.cx("fr-ml-1v")} noIcon severity="info">
                                {offering.type}
                            </Badge>
                        </span>
                    ),
                    nativeInputProps: {
                        value: offering._id,
                        onChange: (event) => handleCheckboxChange(event, permission._id, offering._id),
                        checked: exists(permission._id, offering._id),
                    },
                };
            });
            result = [...result, ...options];
        });

        return result;
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
