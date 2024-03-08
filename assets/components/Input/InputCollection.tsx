import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { FC, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "../../i18n/i18n";

interface InputCollectionProps {
    label?: string;
    hintText?: string;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    value?: string[];
    onChange: (value: string[]) => void;
}

const InputCollection: FC<InputCollectionProps> = (props: InputCollectionProps) => {
    const { t } = useTranslation("Common");

    const { label, hintText, state, stateRelatedMessage, value = [], onChange } = props;

    const [datas, setDatas] = useState<Record<string, string>>(() => {
        // On met une ligne par defaut
        const def = [...value];
        if (def.length === 0) {
            def.push("");
        }

        const values: Record<string, string> = {};
        def.forEach((value) => {
            const uuid = uuidv4();
            values[uuid] = value;
        });
        return values;
    });

    useEffect(() => {
        let result: string[] = [];
        Object.keys(datas).forEach((uuid) => {
            if (datas[uuid]) {
                result.push(datas[uuid]);
            }
        });
        result = [...new Set(result)];
        onChange?.(result);
    }, [datas, onChange]);

    const num = Object.keys(datas).length;

    // Ajout d'une ligne
    const handleAdd = () => {
        const d = { ...datas };
        d[uuidv4()] = "";
        setDatas(d);
    };

    // Suppression d'une ligne
    const handleRemove = (key: string) => {
        const d = { ...datas };
        delete d[key];
        setDatas(d);
    };

    const handleChangeValue = (key: string, value: string) => {
        const d = { ...datas };
        d[key] = value;
        setDatas(d);
    };

    return (
        <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error")}>
            {label && <label className={fr.cx("fr-label")}>{label}</label>}
            {hintText && <span className={fr.cx("fr-hint-text", "fr-mt-2v")}>{hintText}</span>}
            <div className={fr.cx("fr-grid-row", "fr-mt-2v")}>
                <Button className={fr.cx("fr-mb-1v")} iconId={"fr-icon-add-circle-line"} priority="tertiary" onClick={handleAdd}>
                    {t("add")}
                </Button>
            </div>
            {Object.keys(datas).map((key) => (
                <div key={key} className="fr-grid-row fr-grid-row--middle">
                    <div className={fr.cx("fr-col")}>
                        <Input
                            className={fr.cx("fr-mb-1v")}
                            label={null}
                            nativeInputProps={{
                                defaultValue: datas[key],
                                onChange: (e) => handleChangeValue(key, e.currentTarget.value),
                            }}
                        />
                    </div>
                    <Button
                        title={t("delete")}
                        priority={"tertiary no outline"}
                        iconId={"fr-icon-delete-line"}
                        disabled={num === 1}
                        onClick={() => handleRemove(key)}
                    />
                </div>
            ))}
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
                        })(),
                        "fr-mb-1v"
                    )}
                >
                    {stateRelatedMessage}
                </p>
            )}
        </div>
    );
};

export default InputCollection;
