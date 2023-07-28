import { fr } from "@codegouvfr/react-dsfr";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import Translator from "../../../../../modules/Translator";
import KeywordsComponent from "./../../../../../components/Utils/KeywordsComponent";

const TableInfos = ({ tables, keywords, onChange }) => {
    const numTables = tables.length;

    /* Ne conserve que les tables "checked" (visible a true) */
    const filter = (res) => {
        const filtered = {};
        for (const [table, tableInfo] of Object.entries(res)) {
            if (!tableInfo.visible) continue;

            const info = { ...tableInfo };
            delete info.visible;
            filtered[table] = info;
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
        const value = filter(tablesState);
        onChange(value);
    }, [tablesState, onChange]);

    /**
     * Table cochee/decochee
     * @param {Event} e
     */
    const handleChange = (e) => {
        let res = { ...tablesState };
        res[e.currentTarget.value].visible = e.currentTarget.checked;
        setTablesState(res);
    };

    /**
     * Changement de valeur d'un champ de type Input
     * Si la valeur est nulle ou vide, on supprime ce champ de tablesState
     * @param {Event} e
     */
    const handleInputChange = (e) => {
        let res = { ...tablesState };

        const table = e.currentTarget.dataset.table;
        const name = e.currentTarget.name;
        const value = e.currentTarget.value;

        if (!value && name in res[table]) {
            // Pas de valeur, on supprime
            delete res[table][name];
        } else res[table][name] = value;
        setTablesState(res);
    };

    /**
     * Ajout ou suppression d'un mot cle. Si la tableau des valeurs vide, on supprime ce champ de tablesState
     * @param {string} table
     * @param {string} values
     */
    const keywordsChange = (table, values) => {
        let res = { ...tablesState };
        if (values.length === 0 && "keywords" in res[table]) {
            // Pas de valeur, on supprime
            delete res[table]["keywords"];
        } else res[table]["keywords"] = values;

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
                                    defaultValue: table.name,
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
                            <KeywordsComponent
                                label={Translator.trans("service.wfs.new.tables_form.table.keywords")}
                                hintText={Translator.trans("service.wfs.new.tables_form.table.hint_keywords")}
                                keywords={keywords}
                                onChange={(values) => keywordsChange(table.name, values)}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

TableInfos.propTypes = {
    tables: PropTypes.array.isRequired,
    keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default TableInfos;
