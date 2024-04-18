import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { FC, useCallback, useMemo, useState } from "react";
import "../../../../sass/pages/permission.scss";
import { OfferingListResponseDto } from "../../../../@types/entrepot";

type ScrollOfferingListProps = {
    label: string;
    hintText?: string;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    onChange: (value: string[]) => void;
    value?: string[];
    offerings: OfferingListResponseDto[] | undefined;
};

const ScrollOfferingList: FC<ScrollOfferingListProps> = (props) => {
    const { value = [], offerings, label, hintText, state, stateRelatedMessage, onChange } = props;

    const [internals, setInternals] = useState<string[]>(value);

    const handleCheckboxChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>, offeringId: string) => {
            let uuids = [...internals];
            const checked = event.currentTarget.checked;
            if (checked) uuids.push(offeringId);
            else uuids = uuids.filter((uuid) => uuid !== offeringId);
            onChange(uuids);
            setInternals(uuids);
        },
        [internals, onChange]
    );

    /* Calcul des options */
    const options = useMemo(() => {
        const privates = offerings?.filter((offering) => offering.open === false) ?? [];
        return privates.map((offering) => ({
            label: (
                <span>
                    {offering.layer_name}
                    <Badge className={fr.cx("fr-ml-1v")} noIcon severity="info">
                        {offering.type}
                    </Badge>
                </span>
            ),
            nativeInputProps: {
                onChange: (e) => handleCheckboxChange(e, offering._id),
                value: offering._id,
                checked: internals.includes(offering._id),
            },
        }));
    }, [offerings, internals, handleCheckboxChange]);

    return (
        <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error")}>
            <label className={fr.cx("fr-label")}>
                {label}
                {hintText && <span className={fr.cx("fr-hint-text")}>{hintText}</span>}
            </label>
            <div className={fr.cx("fr-mt-2v")}>
                <Checkbox className={"frx-scroll-list"} options={options} />
            </div>
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

export default ScrollOfferingList;
