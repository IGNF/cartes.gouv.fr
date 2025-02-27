import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Select from "@codegouvfr/react-dsfr/Select";
import { FC, useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AttributeAutofillDTO, ThemeDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n";
import { autofillKeywords, AutofillKeywordsType } from "../../../../../@types/app_espaceco";
import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import Table from "@codegouvfr/react-dsfr/Table";

const AutofillDialogModal = createModal({
    id: "autofill",
    isOpenedByDefault: false,
});

type AutofillDialogProps = {
    theme?: ThemeDTO;
    onRecord: (autofilled: AttributeAutofillDTO[]) => void;
};

const AutofillDialog: FC<AutofillDialogProps> = ({ theme, onRecord }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("AutofillDialog");
    const { t: tKeywords } = useTranslation("AutofillKeywords");

    const selectRef = useRef<HTMLSelectElement>(null);
    const valueRef = useRef<HTMLInputElement>(null);

    const table = useMemo<string>(() => {
        const database = theme?.database ?? "";
        const table = theme?.table ?? "";
        return `${database}:${table}`;
    }, [theme]);

    const attributeNames = theme?.attributes.map((a) => a.name) ?? [];

    const [autofillList, setAutofillList] = useState(() => theme?.autofilled_attributes.filter((a) => attributeNames.includes(a.name)) ?? []);
    const [used, setUsed] = useState(() => {
        return theme?.autofilled_attributes.filter((a) => attributeNames.includes(a.name)).map((a) => a.name) ?? [];
    });

    const options = theme?.attributes.filter((a) => !used.includes(a.name)).map((a) => <option key={a.name} value={a.name}>{`${a.title} [${a.type}]`}</option>);

    const getAttributeType = useCallback(
        (name: string) => {
            const f = theme?.attributes.filter((a) => a.name === name) ?? [];
            return f.length === 1 ? f[0].type : null;
        },
        [theme]
    );

    /* Insertion d'un mot clé */
    const handleInsertKeyword = (keyword: AutofillKeywordsType) => {
        if (!valueRef.current) {
            return;
        }

        const start = valueRef.current.selectionStart;
        const end = valueRef.current.selectionEnd;
        if (start === null || end === null) {
            return;
        }

        const value = valueRef.current.value;
        let textBefore, textAfter;
        if (start === end) {
            textBefore = value.substring(0, start);
            textAfter = value.substring(start, value.length);
        } else {
            textBefore = value.substring(0, start);
            textAfter = value.substring(end, value.length);
        }

        valueRef.current.value = `${textBefore}_${keyword}_${textAfter}`;
        valueRef.current.focus();
    };

    /* Ajout d'une valeur "autofill" */
    const handleAdd = () => {
        if (selectRef.current === null && valueRef.current === null) {
            return;
        }
        const key = selectRef.current?.value;
        const value = valueRef.current?.value;
        if (key && value) {
            const type = getAttributeType(key);
            if (type) {
                const list = [...autofillList];
                list.push({ name: key, type: type, autofill: value });
                setAutofillList(list);

                const f = [...used];
                f.push(key);
                setUsed(f);
            }
            valueRef.current.value = "";
        }
    };

    const handleRemove = (attribute: string) => {
        setAutofillList(autofillList.filter((a) => a.name !== attribute));
        setUsed(used.filter((a) => a !== attribute));
    };

    return (
        <>
            {createPortal(
                <AutofillDialogModal.Component
                    title={t("title", { table: table })}
                    concealingBackdrop={false}
                    size={"large"}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                            doClosesModal: true,
                        },
                        {
                            priority: "primary",
                            children: tCommon("record"),
                            doClosesModal: false,
                            onClick: () => {
                                onRecord(autofillList);
                                AutofillDialogModal.close();
                            },
                        },
                    ]}
                >
                    <div>
                        <p>{t("explain")}</p>
                        <Select
                            label={t("attribute")}
                            hint={t("attribute_hint")}
                            nativeSelectProps={{
                                ref: selectRef,
                            }}
                        >
                            {options}
                        </Select>
                        <Input
                            label={t("fill_value")}
                            hintText={t("fill_value_hint")}
                            nativeInputProps={{
                                ref: valueRef,
                            }}
                        />
                        <div>
                            {autofillKeywords.map((k, index) => (
                                <Button
                                    className={index > 0 ? fr.cx("fr-mx-1v") : ""}
                                    priority={"tertiary"}
                                    size={"small"}
                                    key={k}
                                    title={tKeywords("title", { keyword: k })}
                                    onClick={() => handleInsertKeyword(k)}
                                >
                                    {k}
                                </Button>
                            ))}
                        </div>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--left", "fr-my-2w")}>
                            <Button priority={"secondary"} iconId={"fr-icon-add-circle-line"} onClick={handleAdd}>
                                {tCommon("add")}
                            </Button>
                        </div>
                        <div>
                            <label className={fr.cx("fr-label")}>{t("configured_attributes")}</label>
                            <Table
                                noCaption
                                data={autofillList.map((a) => [
                                    a.name,
                                    a.autofill,
                                    <div key={a.name} className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                                        <Button
                                            title={tCommon("delete")}
                                            priority={"tertiary no outline"}
                                            iconId={"fr-icon-delete-line"}
                                            onClick={() => handleRemove(a.name)}
                                        />
                                    </div>,
                                ])}
                                bordered
                                fixed
                            />
                        </div>
                    </div>
                </AutofillDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { AutofillDialog, AutofillDialogModal };
