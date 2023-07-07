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
    const Steps = {
        TABLES: 1,
        METADATAS: 2,
        DESCRIPTION: 3,
        ADDITIONALINFORMATIONS: 4,
        ACCESSRESTRICTIONS: 5,
    };

    const [step, setStep] = useState(Steps.TABLES);

    const [isLoading, setIsLoading] = useState(true);
    const [storedData, setStoredData] = useState(undefined);
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
            .catch((error) => {
                console.error(error);
            })
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
        if (step + 1 > Steps.ACCESSRESTRICTIONS) {
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
                        nextTitle={step < Steps.ACCESSRESTRICTIONS && Translator.trans(`service.wfs.new.step${step + 1}`)}
                        stepCount={5}
                        title={Translator.trans(`service.wfs.new.step${step}`)}
                    />
                    <TableForm tables={tables} visibility={visiblity[Steps.TABLES]} onValid={onValid} />
                    <UploadMetadataForm visibility={visiblity[Steps.METADATAS]} onPrevious={previous} onSubmit={next} />
                    <DescriptionForm storedDataName={storedData.name} visibility={visiblity[Steps.DESCRIPTION]} onPrevious={previous} onValid={onValid} />
                    <AdditionalInfoForm storedData={storedData} visibility={visiblity[Steps.ADDITIONALINFORMATIONS]} onPrevious={previous} onValid={onValid} />
                    <AccessRestrictionForm visibility={visiblity[Steps.ACCESSRESTRICTIONS]} onPrevious={previous} onValid={onSubmit} />
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
