import { fr } from "@codegouvfr/react-dsfr";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import Translator from "../../../../../modules/Translator";
import { StoredDataRelation } from "../../../../../types/app";
import KeywordsSelect from "./../../../../../components/Utils/KeywordsSelect";

// Themes et mot cles INSPIRE
import { getInspireKeywords } from "../../../../../utils";

type TableInfos = {
    native_name?: string;
    public_name?: string;
    title: string;
    description: string;
    keywords?: string[];
};

type TableFormProps = {
    tables: StoredDataRelation[];
    visibility: boolean;
    onValid: (values) => void;
};

const TableForm: FC<TableFormProps> = ({ tables, visibility, onValid }) => {
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
        handleSubmit,
        formState: { errors, isSubmitted },
        getValues: getFormValues,
        setValue: setFormValue,
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
        <div className={fr.cx("fr-my-2v", !visibility && "fr-hidden")}>
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
                                <KeywordsSelect
                                    label={Translator.trans("service.wfs.new.tables_form.table.keywords")}
                                    hintText={Translator.trans("service.wfs.new.tables_form.table.hint_keywords")}
                                    freeSolo
                                    keywords={keywords}
                                    // @ts-expect-error il n'y a pas vraiment d'erreur, faux positif de typescript
                                    defaultValue={getFormValues(`table_infos.${table.name}.keywords`)}
                                    onChange={(values) => {
                                        // @ts-expect-error il n'y a pas vraiment d'erreur, faux positif de typescript
                                        setFormValue(`table_infos.${table.name}.keywords`, values, { shouldValidate: true });
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
