import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import api from "../../../api";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import RCKeys from "../../../modules/RCKeys";
import Translator from "../../../modules/Translator";

type WmsVectorServiceNewProps = {
    datastoreId: string;
    vectorDbId: string;
};
const WmsVectorServiceNew: FC<WmsVectorServiceNewProps> = ({ datastoreId, vectorDbId }) => {
    const STEPS = {
        TABLES: 1,
        METADATA: 2,
        DESCRIPTION: 3,
        ADDITIONALINFORMATIONS: 4,
        ACCESSRESTRICTIONS: 5,
    };

    const [currentStep, setCurrentStep] = useState(STEPS.TABLES);

    const vectorDbQuery = useQuery({
        queryKey: RCKeys.datastore_stored_data(datastoreId, vectorDbId),
        queryFn: () => api.storedData.get(datastoreId, vectorDbId),
    });

    return (
        <AppLayout>
            <h2>{Translator.trans("service.wms_vector.new.title")}</h2>

            {vectorDbQuery.isLoading ? (
                <LoadingText message={Translator.trans("service.wms_vector.new.loading_stored_data")} />
            ) : (
                <>
                    <Stepper
                        currentStep={currentStep}
                        stepCount={Object.values(STEPS).length}
                        nextTitle={currentStep < STEPS.ACCESSRESTRICTIONS && Translator.trans(`service.wms_vector.new.step${currentStep + 1}`)}
                        title={Translator.trans(`service.wms_vector.new.step${currentStep}`)}
                    />

                    <ButtonsGroup
                        alignment="between"
                        buttons={[
                            {
                                children: Translator.trans("previous_step"),
                                iconId: "fr-icon-arrow-left-fill",
                                onClick: () => setCurrentStep((currentStep) => currentStep - 1),
                                disabled: currentStep === 1,
                            },
                            {
                                children: Translator.trans("continue"),
                                onClick: () => {
                                    if (currentStep < Object.values(STEPS).length) {
                                        setCurrentStep((currentStep) => currentStep + 1);
                                    }
                                    // TODO : onSubmit
                                },
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </>
            )}
        </AppLayout>
    );
};

export default WmsVectorServiceNew;
