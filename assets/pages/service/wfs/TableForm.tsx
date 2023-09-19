import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

import AutocompleteSelect from "../../../components/Input/AutocompleteSelect";
import Translator from "../../../modules/Translator";
import { StoredDataRelation } from "../../../types/app";

// Themes et mot cles INSPIRE
import { getInspireKeywords } from "../../../utils";

type TableInfos = {
    native_name?: string;
    public_name?: string;
    title: string;
    description: string;
    keywords?: string[];
};

type TableFormProps = {
    tables: StoredDataRelation[];
    visible: boolean;
    onValid: (values) => void;
};

const TableForm: FC<TableFormProps> = ({ tables, visible, onValid }) => {
    const keywords = getInspireKeywords();

    const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
    const schema = yup.object().shape({
        table_infos: yup.lazy(() => {
            if (!selectedTables || selectedTables.size === 0) {
                return yup.mixed().nullable().notRequired();
            }

            const table_schemas = {};
            selectedTables.forEach((table) => {
                table_schemas[table] = yup.object({
                    public_name: yup.string().default(table),
                    title: yup.string().required(`Le titre de la table ${table} est obligatoire`),
                    description: yup.string().required(`Le résumé du contenu de la table ${table} est obligatoire`),
                    keywords: yup.array().of(yup.string()),
                });
            });

            return yup.object().shape(table_schemas);
        }),
    });

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitted },
        getValues: getFormValues,
    } = useForm({ resolver: yupResolver(schema), mode: "onChange" });

    const format = (values: { table_infos: Record<string, TableInfos> }) => {
        const data_tables: object[] = [];
        for (const [name, infos] of Object.entries(values.table_infos)) {
            console.log(infos);
            data_tables.push({
                native_name: name,
                ...infos,
            });
        }
        return { data_tables };
    };

    const onSubmit = () => {
        const values = getFormValues();
        if (selectedTables.size > 0) {
            onValid(format(values as { table_infos: Record<string, TableInfos> }));
        }
    };

    const toggleTable = (tableName: string) => {
        if (selectedTables.has(tableName)) {
            selectedTables.delete(tableName);
        } else {
            selectedTables.add(tableName);
        }
        setSelectedTables(new Set(selectedTables));
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
                                        checked: selectedTables.has(table.name),
                                    },
                                },
                            ]}
                        />
                        {selectedTables.has(table.name) && (
                            <div className={fr.cx("fr-ml-8v")}>
                                <Input
                                    label={Translator.trans("service.wfs.new.tables_form.table.public_name")}
                                    hintText={Translator.trans("service.wfs.new.tables_form.table.hint_public_name")}
                                    nativeInputProps={{
                                        defaultValue: table.name,
                                        // @ts-expect-error il n'y a pas vraiment d'erreur, faux positif de typescript
                                        ...register(`table_infos.${table.name}.public_name`),
                                    }}
                                    state={errors?.table_infos?.[table.name]?.public_name?.message ? "error" : "default"}
                                    stateRelatedMessage={errors?.table_infos?.[table.name]?.public_name?.message}
                                />
                                <Input
                                    label={Translator.trans("service.wfs.new.tables_form.table.title")}
                                    hintText={Translator.trans("service.wfs.new.tables_form.table.hint_title")}
                                    nativeInputProps={{
                                        // @ts-expect-error il n'y a pas vraiment d'erreur, faux positif de typescript
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
                                        // @ts-expect-error il n'y a pas vraiment d'erreur, faux positif de typescript
                                        ...register(`table_infos.${table.name}.description`),
                                    }}
                                    state={errors?.table_infos?.[table.name]?.description?.message ? "error" : "default"}
                                    stateRelatedMessage={errors?.table_infos?.[table.name]?.description?.message}
                                />

                                <Controller
                                    // @ts-expect-error fausse alerte
                                    name={`table_infos.${table.name}.keywords`}
                                    control={control}
                                    // @ts-expect-error fausse alerte
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
                                                // @ts-expect-error fausse alerte
                                                controllerField={field}
                                                // @ts-expect-error fausse alerte
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
            {isSubmitted && selectedTables.size === 0 && (
                <div className={fr.cx("fr-messages-group", "fr-my-2v")} aria-live="assertive">
                    <p className={fr.cx("fr-message", "fr-message--error")}>{"Veuillez choisir au moins une table"}</p>
                </div>
            )}
            <Button onClick={handleSubmit(onSubmit)}>{Translator.trans("continue")}</Button>
        </div>
    );
};

export default TableForm;
