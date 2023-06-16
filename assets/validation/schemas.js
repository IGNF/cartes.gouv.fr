import * as yup from "yup";

const dataNewForm = yup
    .object({
        data_name: yup.string().required("Le nom de la donnée est obligatoire"),
        data_technical_name: yup.string().required("Le nom technique de la donnée est obligatoire"),
        data_srid: yup.string().required("La projection (srid) est obligatoire"),
        data_type: yup.string().required("Le format de donnée est obligatoire"),
        data_upload_path: yup.string(),
    })
    .required();

const schemas = {
    dataNewForm,
};

export default schemas;
