import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import { FC, useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";

import AutocompleteSelect from "../../../../components/Input/AutocompleteSelect";
import Translator from "../../../../modules/Translator";
import { StoredDataDetailsRelationDto } from "../../../../@types/entrepot";
import { WfsServiceFormValuesType } from "./WfsServiceForm";

// Themes et mot cles INSPIRE
import { getInspireKeywords } from "../../../../utils";

type TablesInfoFormProps = {
    tables: StoredDataDetailsRelationDto[];
    visible: boolean;
    form: UseFormReturn<WfsServiceFormValuesType>;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
};

const keywords = getInspireKeywords();

const TableInfosForm: FC<TablesInfoFormProps> = ({ visible, tables, state, stateRelatedMessage, form }) => {
    const {
        register,
        setValue: setFormValue,
        getValues: getFormValues,
        formState: { errors },
        control,
        watch,
    } = form;

    const selectedTables = watch("selected_tables") ?? [];

    // Lorsqu'on revient sur ce composant, on recupere les anciennes valeurs
    useEffect(() => {
        const prevTableInfos = getFormValues("table_infos") ?? {};

        const tableSet = new Set<string>(Object.keys(prevTableInfos));

        setFormValue("table_infos", prevTableInfos);
        setFormValue("selected_tables", Array.from(tableSet));
    }, [getFormValues, setFormValue]);

    // cocher/decocher une table
    const toggleTable = (tableName: string) => {
        const tableSet = new Set(selectedTables);
        const exists = selectedTables.includes(tableName);
        exists ? tableSet.delete(tableName) : tableSet.add(tableName);

        setFormValue("selected_tables", Array.from(tableSet), { shouldValidate: true });
    };

    return (
        <div className={fr.cx("fr-my-2v", !visible && "fr-hidden")}>
            <h3>{Translator.trans("service.wfs.new.tables_form.title")}</h3>
            <p>{Translator.trans("mandatory_fields")}</p>
            {tables.map((table) => {
                return (
                    <div className={fr.cx("fr-mb-4v")} key={table.name}>
                        <Checkbox
                            className={fr.cx("fr-my-0")}
                            options={[
                                {
                                    label: table.name,
                                    nativeInputProps: {
                                        value: table.name,
                                        onChange: () => toggleTable(table.name),
                                        checked: selectedTables.includes(table.name),
                                    },
                                },
                            ]}
                        />
                        {selectedTables.includes(table.name) && (
                            <div className={fr.cx("fr-ml-8v")}>
                                <Input
                                    label={Translator.trans("service.wfs.new.tables_form.table.public_name")}
                                    hintText={Translator.trans("service.wfs.new.tables_form.table.hint_public_name")}
                                    nativeInputProps={{
                                        defaultValue: getFormValues(`table_infos.${table.name}.public_name`) ?? table.name,
                                        ...register(`table_infos.${table.name}.public_name`),
                                    }}
                                    state={errors?.table_infos?.[table.name]?.public_name?.message ? "error" : "default"}
                                    stateRelatedMessage={errors?.table_infos?.[table.name]?.public_name?.message}
                                />
                                <Input
                                    label={Translator.trans("service.wfs.new.tables_form.table.title")}
                                    hintText={Translator.trans("service.wfs.new.tables_form.table.hint_title")}
                                    nativeInputProps={{
                                        defaultValue: getFormValues(`table_infos.${table.name}.title`),
                                        ...register(`table_infos.${table.name}.title`),
                                    }}
                                    state={errors?.table_infos?.[table.name]?.title?.message ? "error" : "default"}
                                    stateRelatedMessage={errors?.table_infos?.[table.name]?.title?.message}
                                />
                                <Input
                                    label={Translator.trans("service.wfs.new.tables_form.table.description")}
                                    hintText={Translator.trans("service.wfs.new.tables_form.table.hint_description")}
                                    textArea={true}
                                    nativeTextAreaProps={{
                                        defaultValue: getFormValues(`table_infos.${table.name}.description`),
                                        ...register(`table_infos.${table.name}.description`),
                                    }}
                                    state={errors?.table_infos?.[table.name]?.description?.message ? "error" : "default"}
                                    stateRelatedMessage={errors?.table_infos?.[table.name]?.description?.message}
                                />

                                <Controller
                                    name={`table_infos.${table.name}.keywords`}
                                    control={control}
                                    defaultValue={getFormValues(`table_infos.${table.name}.keywords`) ?? []}
                                    render={({ field }) => {
                                        return (
                                            <AutocompleteSelect
                                                label={Translator.trans("service.wfs.new.tables_form.table.keywords")}
                                                hintText={Translator.trans("service.wfs.new.tables_form.table.hint_keywords")}
                                                options={keywords}
                                                freeSolo={true}
                                                getOptionLabel={(option) => option}
                                                isOptionEqualToValue={(option, value) => option === value}
                                                state={errors.table_infos?.[table.name]?.["keywords"] ? "error" : "default"}
                                                stateRelatedMessage={errors.table_infos?.[table.name]?.["keywords"]?.message?.toString()}
                                                onChange={(_, value) => field.onChange(value)}
                                                controllerField={field}
                                                defaultValue={getFormValues(`table_infos.${table.name}.keywords`) ?? []}
                                            />
                                        );
                                    }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
            {state === "error" && stateRelatedMessage !== undefined && <p className={fr.cx("fr-error-text")}>{stateRelatedMessage}</p>}
        </div>
    );
};

export default TableInfosForm;
