import { fr } from "@codegouvfr/react-dsfr";
// import PropTypes from "prop-types";
import React, { useMemo, useState } from "react";
import { FC } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// import TableInfos from "./TableInfos";
import Input from "@codegouvfr/react-dsfr/Input";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Button } from "@codegouvfr/react-dsfr/Button";
import KeywordsSelect from "./../../../../../components/Utils/KeywordsSelect";
import { StoredDataRelation } from "../../../../../types/app";
import Translator from "../../../../../modules/Translator";

// Themes et mot cles INSPIRE
import { getInspireKeywords } from "../../../../../utils";

type TableFormProps = {
    tables: StoredDataRelation[];
    visibility: boolean;
    onValid: (values) => void;
};

const TableForm2: FC<TableFormProps> = ({ tables, visibility, onValid }) => {
    const keywords = getInspireKeywords();

    const [selectedTables, setSelectedTables] = useState<string[]>([]);

    const schema = useMemo(() => {
        return yup.object().shape({
            table_infos: yup.lazy(() => {
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

                // return yup.object().shape(table_schemas);
            }),
        });
    }, [selectedTables]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues: getFormValues,
        setValue: setFormValue,
        // trigger,
    } = useForm({ resolver: yupResolver(schema), mode: "onChange" });

    // const onChange = (tablesState) => {
    //     const value = Object.keys(tablesState).length ? tablesState : null;
    //     setFormValue("data_tables", value);
    // };

    const onSubmit = () => {
        const values = getFormValues();
        onValid(values);
    };

    const toggleTable = (tableName: string) => {
        setSelectedTables((prevState) => {
            if (prevState.includes(tableName)) {
                prevState = prevState.filter((el) => el !== tableName);
            } else {
                prevState.push(tableName);
            }

            return Array.from(new Set(prevState));
        });
        // trigger();
    };

    console.log("selectedTables", selectedTables);
    console.log("schema", schema);
    console.log("errors", errors);

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
                                        // name: "public_name",
                                        defaultValue: table.name,
                                        /*"data-table": table.name,
                                            onChange: handleInputChange, */
                                        ...register(`table_infos.${table.name}.public_name`),
                                    }}
                                    state={errors?.table_infos?.[table.name]?.public_name?.message ? "error" : "default"}
                                    stateRelatedMessage={errors?.table_infos?.[table.name]?.public_name?.message}
                                />
                                <Input
                                    label={Translator.trans("service.wfs.new.tables_form.table.title")}
                                    hintText={Translator.trans("service.wfs.new.tables_form.table.hint_title")}
                                    nativeInputProps={{
                                        // name: "title",
                                        /*"data-table": table.name,
                                            onChange: handleInputChange,*/
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
                                        //name: "description",
                                        /*"data-table": table.name,
                                            onKeyUp: handleInputChange,*/
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
                                    // onChange={(values) => keywordsChange(table.name, values)}
                                    onChange={(values) => {
                                        setFormValue(`table_infos.${table.name}.keywords`, values, { shouldValidate: true });
                                    }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
            <Button onClick={handleSubmit(onSubmit)}>{Translator.trans("continue")}</Button>
        </div>
    );
};

export default TableForm2;
