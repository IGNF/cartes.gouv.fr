import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import api from "../../../api";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import TableForm from "./forms/tables/TableForm";
import UploadMetadataForm from "./forms/metadatas/UploadMetadataForm";
import DescriptionForm from "./forms/metadatas/DescriptionForm";
import AdditionalInfoForm from "./forms/metadatas/AdditionalInfoForm";
import AccessRestrictionForm from "./forms/AccessRestrictionForm";

const WfsServiceNew = ({ datastoreId, storedDataId }) => {
    const Steps = {
        TABLES: 1,
        METADATAS: 2,
        DESCRIPTION: 3,
        ADDITIONALINFORMATIONS: 4,
        ACCESSRESTRICTIONS: 5,
    };

<<<<<<< HEAD
    const [step, setStep] = useState(Steps.Tables);
=======
    const [step, setStep] = useState(Steps.TABLES);
>>>>>>> 976f080 (refactor: Ajout des mots cles pour les tables)

    const [isLoading, setIsLoading] = useState(true);
    const [storedData, setStoredData] = useState({});
    const [tables, setTables] = useState([]);

    const [result, setResult] = useState({});

    /* Visibilite des formulaires */
    const [visiblity, setVisibility] = useState(() => {
        const v = {};
        Object.keys(Steps).forEach((key) => {
            v[Steps[key]] = false;
        });
        return v;
    });

    useEffect(() => {
        api.storedData
            .getOne(datastoreId, storedDataId)
            .then((data) => {
                setStoredData(data);

                let rels = data.type_infos?.relations || [];
                const relations = rels.map((rel) => {
                    if (rel.type === "TABLE") return rel;
                });
                setTables(relations);
            })
            .catch((error) => console.error(error))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        const v = { ...visiblity };
        Object.keys(v).forEach((key) => (v[key] = false));
        v[step] = true;
        setVisibility(v);
    }, [step]);

    const previous = () => {
        setStep(step - 1);
    };

    const next = () => {
        setStep(step + 1);
    };

    const onValid = (values) => {
        const res = { ...result, ...values };
        setResult(res);
        next();
    };

    return (
        <AppLayout>
            {isLoading ? (
                <LoadingText message={Translator.trans("service.wfs.new.loading_data")} />
            ) : (
                <>
                    <h2>{Translator.trans("service.wfs.new.title")}</h2>
                    <Stepper
                        currentStep={step}
                        nextTitle={step < Steps.ACCESSRESTRICTIONS && Translator.trans(`service.wfs.new.step${step + 1}`)}
                        stepCount={5}
                        title={Translator.trans(`service.wfs.new.step${step}`)}
                    />
<<<<<<< HEAD
                    <TableForm
                        tables={tables}
                        visibility={visiblity[Steps.TABLES]}
                        onValid={(values) => {
                            onValid(values);
                            next();
                        }}
                    />
                    <UploadMetadataForm visibility={visiblity[Steps.METADATAS]} onPrevious={previous} onSubmit={next} />
                    <DescriptionForm
                        storedDataName={storedData.name}
                        visibility={visiblity[Steps.DESCRIPTION]}
                        onPrevious={previous}
                        onValid={(values) => {
                            onValid(values);
                            next();
                        }}
                    />
                    <AdditionalInfoForm
                        storedData={storedData}
                        visibility={visiblity[Steps.ADDITIONALINFORMATIONS]}
                        onPrevious={previous}
                        onValid={(values) => {
                            onValid(values);
                            next();
                        }}
                    />
=======
                    <TableForm tables={tables} visibility={visiblity[Steps.TABLES]} onValid={onValid} />
                    <UploadMetadataForm visibility={visiblity[Steps.METADATAS]} onPrevious={previous} onSubmit={next} />
                    <DescriptionForm storedDataName={storedData.name} visibility={visiblity[Steps.DESCRIPTION]} onPrevious={previous} onValid={onValid} />
                    <AdditionalInfoForm storedData={storedData} visibility={visiblity[Steps.ADDITIONALINFORMATIONS]} onPrevious={previous} onValid={onValid} />
>>>>>>> 976f080 (refactor: Ajout des mots cles pour les tables)
                    <AccessRestrictionForm
                        visibility={visiblity[Steps.ACCESSRESTRICTIONS]}
                        onPrevious={previous} /*onValid={values => { onValid(values); }}*/
                    />
                </>
            )}
        </AppLayout>
    );
};

WfsServiceNew.propTypes = {
    datastoreId: PropTypes.string.isRequired,
    storedDataId: PropTypes.string.isRequired,
};

export default WfsServiceNew;
