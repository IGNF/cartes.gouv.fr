import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { FC, useEffect, useState } from "react";

import api from "../../../api";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import Translator from "../../../modules/Translator";
import { CartesApiException } from "../../../modules/jsonFetch";
import { type VectorDb } from "../../../types/app";
import AccessRestrictionForm from "./forms/AccessRestrictionForm";
import AdditionalInfoForm from "./forms/metadatas/AdditionalInfoForm";
import DescriptionForm from "./forms/metadatas/DescriptionForm";
import UploadMetadataForm from "./forms/metadatas/UploadMetadataForm";
import TableForm from "./forms/tables/TableForm";
import { routes } from "../../../router/router";

import "../../../sass/components/spinner.scss";

/**
 * Recupere le type de fichier (unknown, csv ou geopackage)
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
 * @param vectorDbId identifiant de la donnee stockee VECTOR-DB
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

    const [currentStep, setCurrentStep] = useState(STEPS.TABLES);

    const [isLoading, setIsLoading] = useState(true);
    const [vectorDb, setVectorDb] = useState<VectorDb>();
    const [fileType, setFileType] = useState<string | undefined>(undefined);
    const [tables, setTables] = useState<unknown>([]);
    const [error, setError] = useState<CartesApiException>();

    const [result, setResult] = useState({});

    /* Visibilite des formulaires */
    const [visibility, setVisibility] = useState(() => {
        const v = {};
        Object.keys(STEPS).forEach((key) => {
            v[STEPS[key]] = false;
        });
        return v;
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                const vectorDb = (await api.storedData.get(datastoreId, vectorDbId)) as VectorDb;
                setVectorDb(vectorDb);

                const rels = vectorDb.type_infos?.relations || [];
                const relations = rels.filter((rel) => rel?.type === "TABLE");
                setTables(relations);

                const uploadId = vectorDb.tags["upload_id"];
                const fileTree = await api.upload.getFileTree(datastoreId, uploadId);
                const fileType = getUploadFileType(fileTree);
                setFileType(fileType);
            } catch (error) {
                console.error(error);
                setError(error as CartesApiException);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [datastoreId, vectorDbId]);

    useEffect(() => {
        setVisibility((prevVisibility) => {
            const v = { ...prevVisibility };
            Object.keys(v).forEach((key) => (v[key] = false));
            v[currentStep] = true;
            return v;
        });
    }, [currentStep]);

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
                    if (vectorDb?.tags?.datasheet_name) {
                        routes.datastore_datasheet_view({ datastoreId, datasheetName: vectorDb?.tags.datasheet_name, activeTab: "services" }).push();
                    } else {
                        routes.datasheet_list().push();
                    }
                })
                .catch((error) => {
                    console.error(error);
                    setError(error as CartesApiException);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }
    };

    return (
        <AppLayout>
            <h2>{Translator.trans("service.wfs.new.title")}</h2>
            {isLoading ? (
                <LoadingText message={Translator.trans("service.wfs.new.loading_stored_data")} />
            ) : vectorDb ? (
                <>
                    <Stepper
                        currentStep={currentStep}
                        nextTitle={currentStep < STEPS.ACCESSRESTRICTIONS && Translator.trans(`service.wfs.new.step${currentStep + 1}`)}
                        stepCount={5}
                        title={Translator.trans(`service.wfs.new.step${currentStep}`)}
                    />
                    <TableForm tables={tables} visibility={visibility[STEPS.TABLES]} onValid={onValid} />
                    <UploadMetadataForm visibility={visibility[STEPS.METADATAS]} onPrevious={previous} onSubmit={next} />
                    <DescriptionForm storedDataName={vectorDb.name} visibility={visibility[STEPS.DESCRIPTION]} onPrevious={previous} onValid={onValid} />
                    <AdditionalInfoForm
                        storedData={vectorDb}
                        fileType={fileType}
                        visibility={visibility[STEPS.ADDITIONALINFORMATIONS]}
                        onPrevious={previous}
                        onValid={onValid}
                    />
                    <AccessRestrictionForm
                        datastoreId={datastoreId}
                        visibility={visibility[STEPS.ACCESSRESTRICTIONS]}
                        onPrevious={previous}
                        onValid={onValid}
                    />
                </>
            ) : (
                <Alert closable description={error?.message} severity="error" title={Translator.trans("commons.error")} />
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
        </AppLayout>
    );
};

export default WfsServiceNew;
