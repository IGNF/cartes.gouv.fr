import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import api from "../../../api";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import TableForm from "./forms/tables/TableForm";
import UploadMetadataForm from "./forms/metadatas/UploadMetadataForm";
import DescriptionForm from "./forms/metadatas/DescriptionForm";
import AdditionalInfoForm from "./forms/metadatas/AdditionalInfoForm";
import AccessRestrictionForm from "./forms/AccessRestrictionForm";

const WfsServiceNew = ({ datastoreId, storedDataId }) => {
    const STEPS = {
        TABLES: 1,
        METADATAS: 2,
        DESCRIPTION: 3,
        ADDITIONALINFORMATIONS: 4,
        ACCESSRESTRICTIONS: 5,
    };

    const [step, setStep] = useState(STEPS.TABLES);

    const [isLoading, setIsLoading] = useState(true);
    const [storedData, setStoredData] = useState(undefined);
    const [tables, setTables] = useState([]);

    const [result, setResult] = useState({});

    /* Visibilite des formulaires */
    const [visibility, setVisibility] = useState(() => {
        const v = {};
        Object.keys(STEPS).forEach((key) => {
            v[STEPS[key]] = false;
        });
        return v;
    });

    useEffect(() => {
        api.storedData
            .getOne(datastoreId, storedDataId)
            .then((data) => {
                setStoredData(data);

                let rels = data.type_infos?.relations || [];

                const relations = rels.filter((rel) => rel?.type === "TABLE");
                setTables(relations);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => setIsLoading(false));
    }, [datastoreId, storedDataId]);

    useEffect(() => {
        setVisibility((prevVisibility) => {
            const v = { ...prevVisibility };
            Object.keys(v).forEach((key) => (v[key] = false));
            v[step] = true;
            return v;
        });
    }, [step]);

    const previous = () => {
        setStep(step - 1);
    };

    const next = () => {
        if (step + 1 > STEPS.ACCESSRESTRICTIONS) {
            return;
        }
        setStep(step + 1);
    };

    // Supprime les valeurs vides ou nulles
    const filter = () => {
        let obj = { ...result };
        Object.keys(obj).forEach((k) => (obj[k] === null || obj[k] === "") && delete obj[k]);
        return obj;
    };

    const onValid = (values) => {
        const res = { ...result, ...values };
        setResult(res);
        next();
    };

    // Bouton dernier formulaire
    const onSubmit = (values) => {
        onValid(values);

        const filtered = filter();
        api.wfs.add(datastoreId, storedDataId, filtered).then((response) => {
            console.log(response);
        });
    };

    return (
        <AppLayout>
            {isLoading ? (
                <LoadingText message={Translator.trans("service.wfs.new.loading_data")} />
            ) : storedData ? (
                <>
                    <h2>{Translator.trans("service.wfs.new.title")}</h2>
                    <Stepper
                        currentStep={step}
                        nextTitle={step < STEPS.ACCESSRESTRICTIONS && Translator.trans(`service.wfs.new.step${step + 1}`)}
                        stepCount={5}
                        title={Translator.trans(`service.wfs.new.step${step}`)}
                    />
                    <TableForm tables={tables} visibility={visibility[STEPS.TABLES]} onValid={onValid} />
                    <UploadMetadataForm visibility={visibility[STEPS.METADATAS]} onPrevious={previous} onSubmit={next} />
                    <DescriptionForm storedDataName={storedData.name} visibility={visibility[STEPS.DESCRIPTION]} onPrevious={previous} onValid={onValid} />
                    <AdditionalInfoForm storedData={storedData} visibility={visibility[STEPS.ADDITIONALINFORMATIONS]} onPrevious={previous} onValid={onValid} />
                    <AccessRestrictionForm visibility={visibility[STEPS.ACCESSRESTRICTIONS]} onPrevious={previous} onValid={onSubmit} />
                </>
            ) : (
                <Alert
                    closable
                    description={Translator.trans("stored_data_does_not_exists", { stored_data: storedDataId })}
                    severity="error"
                    title={Translator.trans("commons.error")}
                />
            )}
        </AppLayout>
    );
};

WfsServiceNew.propTypes = {
    datastoreId: PropTypes.string.isRequired,
    storedDataId: PropTypes.string.isRequired,
};

export default WfsServiceNew;
