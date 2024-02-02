import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { FC, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "../../i18n/i18n";

interface InputCollectionProps {
    label: string;
    hintText?: string;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    defaultValue?: string[];
    onChange?: (value: string[]) => void;
}

type RowData = Record<string, string>;

const InputCollection: FC<InputCollectionProps> = (props: InputCollectionProps) => {
    const { t } = useTranslation("Common");

    const { label, hintText, state, stateRelatedMessage, defaultValue = [], onChange } = props;

    const [datas, setDatas] = useState<RowData>(() => {
        // On met une ligne par defaut
        const def = [...defaultValue];
        if (def.length === 0) {
            def.push("");
        }

        const d: RowData = {};
        def.forEach((value) => {
            const uuid = uuidv4();
            d[uuid] = value;
        });
        return d;
    });

    useEffect(() => {
        const result: string[] = [];
        Object.keys(datas).forEach((uuid) => {
            if (datas[uuid]) {
                result.push(datas[uuid]);
            }
        });
        console.log(result);
        onChange?.(result);
    }, [datas, onChange]);

    // Ajout d'une ligne
    const handleAdd = () => {
        const d = { ...datas };

        const uuid = uuidv4();
        d[uuid] = "";
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
        <div className={fr.cx("fr-mb-2v")}>
            <div className={fr.cx("fr-input-group", "fr-mb-1v")}>
                <label className={fr.cx("fr-label")}>{label}</label>
                {label && <span className={fr.cx("fr-hint-text")}>{hintText}</span>}
            </div>
            <div>
                <Button className={fr.cx("fr-mb-1v")} iconId={"fr-icon-add-circle-line"} priority="tertiary" onClick={handleAdd}>
                    {t("add")}
                </Button>
            </div>
            {Object.keys(datas).map((key) => {
                return (
                    <div key={key} className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <Input
                            className={fr.cx("fr-mb-1v")}
                            label={null}
                            nativeInputProps={{
                                defaultValue: datas[key],
                                onChange: (e) => handleChangeValue(key, e.currentTarget.value),
                            }}
                        />
                        <Button title={t("delete")} priority={"tertiary no outline"} iconId={"fr-icon-delete-line"} onClick={() => handleRemove(key)} />
                    </div>
                );
            })}
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
