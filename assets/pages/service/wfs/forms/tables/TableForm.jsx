import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import TableInfos from "./TableInfos";
import Input from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";

<<<<<<< HEAD
=======
// Themes et mot cles INSPIRE
import { getInspireKeywords } from "../../../../../utils";

>>>>>>> 976f080 (refactor: Ajout des mots cles pour les tables)
const schema = yup
    .object({
        data_tables: yup.string().required(Translator.trans("service.wfs.new.tables_form.error")),
    })
    .required();

const TableForm = ({ tables, visibility, onValid }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues: getFormValues,
        setValue: setFormValue,
    } = useForm({ resolver: yupResolver(schema) });
  
    const [keywords, setKeywords] = useState([]);

    useEffect(() => {
        const words = getInspireKeywords();
        setKeywords(words);
    },[]);

    const onChange = (tablesState) => {
        const value = Object.keys(tablesState).length ? JSON.stringify(tablesState) : null;
        setFormValue("data_tables", value);
    };

    const onSubmit = () => {
        const values = getFormValues();
        onValid(values);
    };

    return (
        <div className={fr.cx("fr-my-2v")} style={{ display: visibility ? "block" : "none" }}>
            <h3>{Translator.trans("service.wfs.new.tables_form.title")}</h3>
            <TableInfos tables={tables} keywords={keywords} onChange={onChange} />
            <Input
                state={errors.data_tables ? "error" : "default"}
                stateRelatedMessage={errors?.data_tables?.message}
                nativeInputProps={{
                    ...register("data_tables"),
                    type: "hidden",
                }}
            />
            <Button onClick={handleSubmit(onSubmit)}>{Translator.trans("continue")}</Button>
        </div>
    );
};

TableForm.propTypes = {
    tables: PropTypes.array.isRequired,
    visibility: PropTypes.bool.isRequired,
    onValid: PropTypes.func.isRequired,
};

export default TableForm;
