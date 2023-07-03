import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import React, { useEffect, useState, createRef, useMemo } from "react";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import TagifyComponent from "../../../../../components/Utils/TagifyComponent";

<<<<<<< HEAD
const TableInfos = ({ tables, onChange }) => {
=======
/* Supprime tous les valeurs null, egale à "" ou si la valeur est un tableau vide */
const removeEmpty = obj => {
    const v = { ...obj };
    if ("visible" in v) {
        delete v.visible;    
    }

    Object.keys(v).forEach(key => {
        if (Array.isArray(v[key]) && ! v[key].length ) {
            delete v[key];
        } else if (v[key] === null || v[key] === "") {
            delete v[key];
        }
    });
    return v;
};

const TableInfos = ({tables, keywords, onChange}) => {
>>>>>>> 976f080 (refactor: Ajout des mots cles pour les tables)
    const numTables = tables.length;

    /* On cree les references pour les tagifyComponent */
    const refsById = useMemo(() => {
        const refs = {};
        tables.map(table => {
            refs[table.name] = createRef();
        });
        return refs;
    }, [tables]);
  
    /* Supprime tous les valeurs null, egale à "" ou si la valeur est un tableau vide */
    const filter = (res) => {
        const filtered = {};
        for (const [table, tableInfo] of Object.entries(res)) {
<<<<<<< HEAD
            if (!tableInfo.visible) continue;

            const v = { ...tableInfo };
            delete v.visible;
            Object.keys(v).forEach((key) => {
                if (v[key] === null || v[key] === "") {
                    delete v[key];
                }
            });
            filtered[table] = v;
=======
            if (! tableInfo.visible)  continue;
            filtered[table] = removeEmpty(tableInfo);
>>>>>>> 976f080 (refactor: Ajout des mots cles pour les tables)
        }
        return filtered;
    };

    /* Etat de la visibilite et des attributs des tables */
    const [tablesState, setTablesState] = useState(() => {
        const v = {};
        tables.forEach((table) => {
            v[table.name] = { visible: false };
        });
        return v;
    });
    
    useEffect(() => {
        const res = filter(tablesState);
        onChange(res);
    }, [tablesState]);

    const handleChange = (e) => {
        let res = { ...tablesState };
        res[e.currentTarget.value].visible = e.currentTarget.checked;
        setTablesState(res);
    };

    const handleInputChange = (e) => {
        const table = e.currentTarget.dataset.table;

        let res = { ...tablesState };
        res[table][e.currentTarget.name] = e.currentTarget.value;
        setTablesState(res);
    };

    const tagifyChange = (table, values) => {
        let res = { ... tablesState };
        res[table]["keywords"] = values;
        setTablesState(res);
    };

    return (
        <div className={fr.cx("fr-mb-2v")}>
            <div className={fr.cx("fr-mb-2v")}>
                <strong>
                    {numTables === 1
                        ? Translator.trans("service.wfs.new.tables_form.oneTable")
                        : Translator.trans("service.wfs.new.tables_form.manyTables", { num: numTables })}
                </strong>
            </div>
            {tables.map((table, index) => {
                return (
                    <div className={fr.cx("fr-mb-4v")} key={index}>
                        <Checkbox
                            className={fr.cx("fr-my-0")}
                            options={[
                                {
                                    label: table.name,
                                    nativeInputProps: {
                                        value: table.name,
                                        onChange: handleChange,
                                    },
                                },
                            ]}
                        />
                        <div style={{ display: tablesState[table.name].visible ? "block" : "none" }}>
                            <Input
                                label={Translator.trans("service.wfs.new.tables_form.table.public_name")}
                                hintText={Translator.trans("service.wfs.new.tables_form.table.hint_public_name")}
                                nativeInputProps={{
                                    name: "public_name",
                                    "data-table": table.name,
                                    onChange: handleInputChange,
                                }}
                            />
                            <Input
                                label={Translator.trans("service.wfs.new.tables_form.table.title")}
                                hintText={Translator.trans("service.wfs.new.tables_form.table.hint_title")}
                                nativeInputProps={{
                                    name: "title",
                                    "data-table": table.name,
                                    onChange: handleInputChange,
                                }}
                            />
                            <Input
                                label={Translator.trans("service.wfs.new.tables_form.table.description")}
                                hintText={Translator.trans("service.wfs.new.tables_form.table.hint_description")}
                                textArea={true}
                                nativeTextAreaProps={{
                                    name: "description",
                                    "data-table": table.name,
                                    onKeyUp: handleInputChange,
                                }}
                            />
                            <Input
                                label={Translator.trans("service.wfs.new.tables_form.table.keywords")}
                                hintText={Translator.trans("service.wfs.new.tables_form.table.hint_keywords")}
                                textArea={true}
                                nativeTextAreaProps={{
                                    name: "keywords",
                                    "data-table": table.name,
                                    onKeyUp: handleInputChange,
                                }}
                            />
<<<<<<< HEAD
=======
                            <div style={{ display: tablesState[table.name].visible ? "block" : "none"}}>
                                <Input
                                    label={Translator.trans("service.wfs.new.tables_form.table.public_name")}
                                    hintText={Translator.trans("service.wfs.new.tables_form.table.hint_public_name")}
                                    nativeInputProps={{
                                        name: "public_name",
                                        "data-table": table.name,
                                        onChange: handleInputChange
                                    }}
                                /> 
                                <Input
                                    label={Translator.trans("service.wfs.new.tables_form.table.title")}
                                    hintText={Translator.trans("service.wfs.new.tables_form.table.hint_title")}
                                    nativeInputProps={{
                                        name: "title",
                                        "data-table": table.name,
                                        onChange: handleInputChange
                                    }}
                                /> 
                                <Input
                                    label={Translator.trans("service.wfs.new.tables_form.table.description")}
                                    hintText={Translator.trans("service.wfs.new.tables_form.table.hint_description")}
                                    textArea={true}
                                    nativeTextAreaProps={{
                                        name: "description",
                                        "data-table": table.name,
                                        onKeyUp: handleInputChange
                                    }}
                                /> 
                                <TagifyComponent 
                                    ref={refsById[table.name]}
                                    label={Translator.trans("service.wfs.new.tables_form.table.keywords")}
                                    hintText={Translator.trans("service.wfs.new.tables_form.table.hint_keywords")}
                                    whiteList={keywords}
                                    onChange={values => tagifyChange(table.name, values)}
                                />
                            </div>
>>>>>>> 976f080 (refactor: Ajout des mots cles pour les tables)
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

TableInfos.propTypes = {
    tables: PropTypes.array.isRequired,
<<<<<<< HEAD
    onChange: PropTypes.func.isRequired,
=======
    keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired
>>>>>>> 976f080 (refactor: Ajout des mots cles pour les tables)
};

export default TableInfos;
