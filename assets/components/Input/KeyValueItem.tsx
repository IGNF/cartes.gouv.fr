import { useDragItem } from "@/hooks/useDrag";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { tss } from "tss-react";
import { useFormContext } from "react-hook-form";
import { InputHTMLAttributes } from "react";
import { get } from "@/utils";
import Select, { SelectProps } from "@codegouvfr/react-dsfr/SelectNext";

export interface KeyValue {
    key?: string;
    value: string | null;
}

export type KeyValues = KeyValue[];

interface KeyValueListProps {
    index: number;
    name: string;
    onRemove: (index: number) => void;
    valueInputProps?: InputHTMLAttributes<HTMLInputElement>;
    valueOptions?: SelectProps.Option[];
    valueType?: "textInput" | "select";
}

function KeyValueItem(props: KeyValueListProps) {
    const { index, name, onRemove, valueInputProps, valueOptions = [], valueType = "textInput" } = props;
    const { dragIndex, ref, startDrag } = useDragItem();
    const { classes, cx } = useStyles({ active: dragIndex === index });
    const {
        formState: { errors },
        register,
        watch,
    } = useFormContext();
    const useKeys = watch(`${name}.useKeys`);
    const keyError = get(errors, `${name}.values.${index}.key.message`);
    const valueError = get(errors, `${name}.values.${index}.value.message`);

    function handleMove(index: number) {
        return (event) => startDrag(event, index);
    }

    function handleRemove(index: number) {
        return () => onRemove(index);
    }

    return (
        <div className={cx(fr.cx("fr-pb-1w"), classes.row, classes.drag)} ref={ref}>
            <div>
                <Button
                    title="Ordonner"
                    priority={"tertiary no outline"}
                    iconId={"ri-draggable"}
                    nativeButtonProps={{ onMouseDown: handleMove(index) }}
                    type="button"
                />
            </div>
            {useKeys && (
                <div className={classes.cell}>
                    <Input
                        label="Clé"
                        nativeInputProps={register(`${name}.values.${index}.key`)}
                        state={keyError ? "error" : "default"}
                        stateRelatedMessage={String(keyError ?? "")}
                    />
                </div>
            )}
            <div className={classes.cell}>
                {valueType === "textInput" && (
                    <Input
                        label="Valeur"
                        nativeInputProps={{
                            ...valueInputProps,
                            ...register(`${name}.values.${index}.value`),
                        }}
                        state={valueError ? "error" : "default"}
                        stateRelatedMessage={String(valueError ?? "")}
                    />
                )}
                {valueType === "select" && (
                    <Select
                        label="Valeur"
                        placeholder="Select an option"
                        nativeSelectProps={register(`${name}.values.${index}.value`)}
                        options={valueOptions}
                        state={valueError ? "error" : "default"}
                        stateRelatedMessage={String(valueError ?? "")}
                    />
                )}
            </div>
            <div>
                <Button title="Supprimer" priority={"tertiary no outline"} iconId={"fr-icon-delete-line"} onClick={handleRemove(index)} />
            </div>
        </div>
    );
}

export default KeyValueItem;

const useStyles = tss.withParams<{ active: boolean }>().create(({ active }) => ({
    drag: {
        position: "relative",
        zIndex: active ? 1 : 0,
        scale: active ? 1.01 : 1,
    },
    row: {
        display: "flex",
        gap: "1.5rem",
        alignItems: "center",
    },
    cell: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "104px",
    },
}));
