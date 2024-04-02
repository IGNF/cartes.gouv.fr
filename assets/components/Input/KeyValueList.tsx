import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { FC, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface KeyValueListProps {
    id?: string;
    label: string;
    hintText: string;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    defaultValue?: Record<string, string>;
    onChange?: (value: Record<string, string>) => void;
}

type HeaderDatas = Record<string, { name: string; value: string }>;

const KeyValueList: FC<KeyValueListProps> = (props: KeyValueListProps) => {
    const { label, hintText, state, stateRelatedMessage, defaultValue = {}, onChange } = props;

    const [datas, setDatas] = useState<HeaderDatas>(() => {
        const d: HeaderDatas = {};
        Object.keys(defaultValue).forEach((keyname) => {
            const uuid = uuidv4();
            d[uuid] = { name: keyname, value: defaultValue[keyname] };
        });
        return d;
    });

    useEffect(() => {
        const result = {};
        Object.keys(datas).forEach((uuid) => {
            if (datas[uuid].name && datas[uuid].value) {
                result[datas[uuid].name] = datas[uuid].value;
            }
        });
        console.log(result);
        onChange?.(result);
    }, [datas, onChange]);

    // Ajout d'une ligne
    const handleAdd = () => {
        const uuid = uuidv4();
        const d = { ...datas };
        d[uuid] = { name: "", value: "" };
        setDatas(d);
    };

    // Suppression d'une ligne
    const handleRemove = (key: string) => {
        const d = { ...datas };
        delete d[key];
        setDatas(d);
    };

    const handleChangeName = (key: string, name: string) => {
        const d = { ...datas };
        d[key].name = name;
        setDatas(d);
    };

    const handleChangeValue = (key: string, value: string) => {
        const d = { ...datas };
        d[key].value = value;
        setDatas(d);
    };

    return (
        <div>
            <div className={fr.cx("fr-input-group", "fr-mb-1v")}>
                <label className={fr.cx("fr-label")}>{label}</label>
                <span className={fr.cx("fr-hint-text")}>{hintText}</span>
            </div>
            <div>
                <Button className={fr.cx("fr-mr-1v")} iconId={"fr-icon-add-circle-line"} priority="tertiary" onClick={handleAdd}>
                    Ajouter
                </Button>
            </div>
            {Object.keys(datas).map((key) => {
                return (
                    <div key={key} className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--middle")}>
                        <div className={fr.cx("fr-col-3")}>
                            <Input
                                label={null}
                                nativeInputProps={{
                                    defaultValue: datas[key].name,
                                    onChange: (e) => handleChangeName(key, e.currentTarget.value),
                                }}
                            />
                        </div>
                        <div className={fr.cx("fr-col-3")}>
                            <Input
                                label={null}
                                nativeInputProps={{
                                    defaultValue: datas[key].value,
                                    onChange: (e) => handleChangeValue(key, e.currentTarget.value),
                                }}
                            />
                        </div>
                        <Button title={""} priority={"tertiary no outline"} iconId={"fr-icon-delete-line"} onClick={() => handleRemove(key)} />
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
                        })()
                    )}
                >
                    {stateRelatedMessage}
                </p>
            )}
        </div>
    );
};

export default KeyValueList;

/* export const { i18n } = declareComponentKeys<"key" | { K: "function"; P: { param1: ParamType }; R: JSX.Element }>()({
    KeyValueList,
});

export const KeyValueListFrTranslations: Translations<"fr">["KeyValueList"] = {};

export const KeyValueListEnTranslations: Translations<"en">["KeyValueList"] = {}; */
