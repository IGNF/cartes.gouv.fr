import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { FC, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import RQKeys from "../../../modules/RQKeys";
import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import Translator from "../../../modules/Translator";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { StoredDataRelation, type VectorDb } from "../../../types/app";
import AccessRestrictionForm from "./forms/AccessRestrictionForm";
import AdditionalInfoForm from "./forms/metadatas/AdditionalInfoForm";
import DescriptionForm from "./forms/metadatas/DescriptionForm";
import UploadMetadataForm from "./forms/metadatas/UploadMetadataForm";
import TableForm from "./forms/tables/TableForm";
import "../../../sass/components/spinner.scss";

/**
 * Récupère le type de fichier (unknown, csv ou geopackage)
 * @param {Object} fileTree
 * @returns
 */
const getUploadFileType = (fileTree) => {
    let fileType = "unknown";

    const directory = fileTree.filter((tree) => tree?.type === "DIRECTORY" && tree?.name === "data");
    if (directory.length) {
        const extensions = directory[0].children.filter((child) => child.type === "FILE").map((file) => file.name.split(".").pop().toLowerCase());
        if (extensions.length) {
            fileType = extensions[0];
        }
    }
    return fileType;
};

/**
 *
 * @param datastoreId identifiant du datastore
 * @param vectorDbId identifiant de la donnee stockée VECTOR-DB
 */
type WfsServiceNewProps = {
    datastoreId: string;
    vectorDbId: string;
};

/**
 * Formulaire general de création d'un service WFS
 */
const WfsServiceNew: FC<WfsServiceNewProps> = ({ datastoreId, vectorDbId }) => {
    const STEPS = {
        TABLES: 1,
        METADATAS: 2,
        DESCRIPTION: 3,
        ADDITIONALINFORMATIONS: 4,
        ACCESSRESTRICTIONS: 5,
    };

    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(STEPS.TABLES);

    const vectorDbQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data(datastoreId, vectorDbId),
        queryFn: () => api.storedData.get<VectorDb>(datastoreId, vectorDbId),
        staleTime: 600000,
    });

    const [fileType, setFileType] = useState<string | undefined>(undefined);
    const [tables, setTables] = useState<StoredDataRelation[]>([]);
    const [error, setError] = useState<CartesApiException>();
    const [validationError, setValidationError] = useState<CartesApiException>();

    const [result, setResult] = useState({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                if (vectorDbQuery.data) {
                    const relations = vectorDbQuery.data.type_infos?.relations ?? [];

                    const tables = relations.filter((rel) => rel.type && rel.type === "TABLE");
                    setTables(tables);

                    // Le type de fichier associe
                    const uploadId = vectorDbQuery.data.tags["upload_id"];
                    const fileTree = await api.upload.getFileTree(datastoreId, uploadId);
                    const fileType = getUploadFileType(fileTree);
                    setFileType(fileType);
                }
            } catch (error) {
                console.error(error);
                setError(error as CartesApiException);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [datastoreId, vectorDbQuery.data]);

    const previous = () => {
        setCurrentStep(currentStep - 1);
    };

    const next = () => {
        if (currentStep + 1 > STEPS.ACCESSRESTRICTIONS) {
            return;
        }
        setCurrentStep(currentStep + 1);
    };

    // Supprime les valeurs vides ou nulles
    const filter = (result) => {
        const obj = { ...result };
        Object.keys(obj).forEach((k) => (obj[k] === null || obj[k] === "") && delete obj[k]);
        return obj;
    };

    const onValid = (values) => {
        const res = { ...result, ...values };
        setResult(res);
        next();

        // dernière étape du formulaire
        if (currentStep === STEPS.ACCESSRESTRICTIONS) {
            setIsSubmitting(true);

            const filtered = filter(res);
            console.log(filtered);

            api.wfs
                .add(datastoreId, vectorDbId, filtered)
                .then((response) => {
                    console.log(response);
                    if (vectorDbQuery.data?.tags?.datasheet_name) {
                        routes.datastore_datasheet_view({ datastoreId, datasheetName: vectorDbQuery.data?.tags.datasheet_name, activeTab: "services" }).push();
                    } else {
                        routes.datasheet_list({ datastoreId }).push();
                    }
                })
                .catch((error) => {
                    console.error(error);
                    setValidationError(error as CartesApiException);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }
    };

    return (
        <DatastoreLayout datastoreId={datastoreId}>
            <h1>{Translator.trans("service.wfs.new.title")}</h1>
            {isLoading ? (
                <LoadingText message={Translator.trans("service.wfs.new.loading_stored_data")} />
            ) : vectorDbQuery.data === undefined ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={Translator.trans("get_stored_data_failed")}
                    description={<Button linkProps={routes.datasheet_list({ datastoreId }).link}>{Translator.trans("back_to_my_datas")}</Button>}
                />
            ) : error !== undefined ? (
                <Alert severity="error" closable={true} title={Translator.trans("get_filetree_failed")} />
            ) : (
                <>
                    <Stepper
                        currentStep={currentStep}
                        nextTitle={currentStep < STEPS.ACCESSRESTRICTIONS && Translator.trans(`service.wfs.new.step${currentStep + 1}`)}
                        stepCount={5}
                        title={Translator.trans(`service.wfs.new.step${currentStep}`)}
                    />
                    {validationError && (
                        <Alert
                            className="fr-preline"
                            closable
                            description={validationError.message}
                            severity="error"
                            title={Translator.trans("commons.error")}
                        />
                    )}
                    <TableForm tables={tables} visible={currentStep === STEPS.TABLES} onValid={onValid} />
                    <UploadMetadataForm visible={currentStep === STEPS.METADATAS} onPrevious={previous} onSubmit={next} />
                    <DescriptionForm
                        storedDataName={vectorDbQuery.data.name}
                        visible={currentStep === STEPS.DESCRIPTION}
                        onPrevious={previous}
                        onValid={onValid}
                    />
                    <AdditionalInfoForm
                        storedData={vectorDbQuery.data}
                        fileType={fileType}
                        visible={currentStep === STEPS.ADDITIONALINFORMATIONS}
                        onPrevious={previous}
                        onValid={onValid}
                    />
                    <AccessRestrictionForm
                        datastoreId={datastoreId}
                        visible={currentStep === STEPS.ACCESSRESTRICTIONS}
                        onPrevious={previous}
                        onValid={onValid}
                    />
                </>
            )}
            {isSubmitting && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " icons-spin"} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{"Création du service WFS en cours"}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </DatastoreLayout>
    );
};

export default WfsServiceNew;
