import { Input } from "@codegouvfr/react-dsfr/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import PropTypes from "prop-types";
import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import Button from "@codegouvfr/react-dsfr/Button";
import AppLayout from "../../components/Layout/AppLayout";

const schema = yup
    .object({
        data_name: yup.string().required("Le nom de la donnée est obligatoire"),
        nombre_test: yup.string().min(5, "ça craint 😱").max(10, "oh mon dieu 😎").required("c'est requis"),
    })
    .required();

const DataNewForm = ({ datastoreId }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = (formData) => {
        console.log(errors);
        console.log(formData);
    };

    return (
        <AppLayout>
            <h2>Créer une fiche de données</h2>

            <Input
                label="Nom de votre fiche de donnée"
                hintText="Ce nom vous permettra d’identifier votre donnée dans la géoplateforme, soyez aussi clair que possible."
                state={errors.data_name ? "error" : "default"}
                stateRelatedMessage={errors?.data_name?.message}
                nativeInputProps={register("data_name")}
            />
            <Input
                label="Nombre test"
                state={errors.nombre_test ? "error" : "default"}
                stateRelatedMessage={errors?.nombre_test?.message}
                nativeInputProps={register("nombre_test")}
            />
            <Button onClick={handleSubmit(onSubmit)}>Soumettre</Button>
        </AppLayout>
    );
};

DataNewForm.propTypes = {
    datastoreId: PropTypes.string.isRequired,
};

export default DataNewForm;
