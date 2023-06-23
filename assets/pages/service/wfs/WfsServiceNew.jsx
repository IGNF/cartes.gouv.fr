import { fr } from "@codegouvfr/react-dsfr";
import { yupResolver } from "@hookform/resolvers/yup";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import api from "../../../api";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import TableForm from "./forms/tables/TableForm";
import UploadMetadataForm from "./forms/metadatas/UploadMetadataForm";
import DescriptionForm from "./forms/metadatas/DescriptionForm";
import AdditionalInfoForm from "./forms/metadatas/AdditionalInfoForm";


const WfsServiceNew = ({ datastoreId, storedDataId }) => {
    const stepMax = 5;
    const [step, setStep] = useState(1);
    
    const [isLoading, setIsLoading] = useState(true);
    const [storedData, setStoredData] = useState({});
    const [tables, setTables] = useState([]);
    
    const [result, setResult] = useState({});

    /* Visibilite des formulaires */
    const [visiblity, setVisibility] = useState(() => {
        const v = {};
        for (let s=1; s<=stepMax; ++s) {
            v[s] = false;
        }
        return v;
    });

    useEffect(() => {
        api.storedData.getOne(datastoreId, storedDataId)
            .then(data => {
                setStoredData(data);
                
                let rels = data.type_infos?.relations || [];
                const relations = rels.map(rel => {
                    if (rel.type === "TABLE") return rel; 
                });
                setTables(relations);
            }).catch((error) => console.error(error))
            .finally(() => setIsLoading(false));
    },[]);

    useEffect(() => {
        const v = { ... visiblity };
        Object.keys(v).forEach(key => v[key] = false);
        v[step] = true;
        setVisibility(v);   
    },[step]);

    const onValid = values => {
        const res = { ...result, ...values};
        setResult(res);
    };

    return (
        <AppLayout>
            {isLoading ? <LoadingText message={Translator.trans("service.wfs.new.loading_data")}/> : ( 
                <>
                    <h2>{Translator.trans("service.wfs.new.title")}</h2>
                    <Stepper
                        currentStep={step}
                        nextTitle={step < 5 && Translator.trans(`service.wfs.new.step${step + 1}`)}
                        stepCount={5}
                        title={Translator.trans(`service.wfs.new.step${step}`)}
                    />
                    <TableForm tables={tables} visibility={visiblity[1]} onValid={values => { onValid(values); setStep(2); }}/>
                    <UploadMetadataForm visibility={visiblity[2]} onPrevious={() => setStep(1)} onSubmit={() => setStep(3)}/>
                    <DescriptionForm storedDataName={storedData.name} visibility={visiblity[3]} onPrevious={() => setStep(2)} onValid={values => { onValid(values); setStep(4); }}/>
                    <AdditionalInfoForm storedData={storedData}  visibility={visiblity[4]} onPrevious={() => setStep(3)} onValid={() => {}} />
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