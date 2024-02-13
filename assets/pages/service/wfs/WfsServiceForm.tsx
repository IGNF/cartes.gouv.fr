import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { format as datefnsFormat } from "date-fns";
import { declareComponentKeys } from "i18nifty";
import { FC, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { symToStr } from "tsafe/symToStr";
import * as yup from "yup";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../components/Utils/LoadingIcon";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import { filterGeometricRelations } from "../../../helpers";
import { Translations, useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { EndpointTypeEnum, Service, ServiceFormValuesBaseType, StoredDataRelation, VectorDb } from "../../../types/app";
import { ConfigurationWfsDetailsContent } from "../../../types/entrepot";
import { getProjectionCode, removeDiacritics } from "../../../utils";
import AccessRestrictions from "../AccessRestrictions";
import { CommonSchemasValidation } from "../common-schemas-validation";
import AdditionalInfo from "../metadatas/AdditionalInfo";
import Description, { getEndpointSuffix } from "../metadatas/Description";
import UploadMDFile from "../metadatas/UploadMDFile";
import TableInfosForm from "./TablesInfoForm";

export type WfsServiceFormValuesType = ServiceFormValuesBaseType & {
    selected_tables?: string[];
    table_infos?: Record<string, TableInfos>;
};

/**
 *
 * @param datastoreId identifiant du datastore
 * @param vectorDbId identifiant de la donnee stockée VECTOR-DB
 */
type WfsServiceFormProps = {
    datastoreId: string;
    vectorDbId: string;
    offeringId?: string;
};

type TableInfos = {
    native_name?: string;
    public_name?: string;
    title: string;
    description: string;
    keywords?: string[];
};

const STEPS = {
    TABLES_INFOS: 1,
    METADATAS_UPLOAD: 2,
    METADATAS_DESCRIPTION: 3,
    METADATAS_ADDITIONALINFORMATIONS: 4,
    ACCESSRESTRICTIONS: 5,
};

/**
 * Formulaire general de création d'un service WFS
 */
const WfsServiceForm: FC<WfsServiceFormProps> = ({ datastoreId, vectorDbId, offeringId }) => {
    const { t } = useTranslation("WfsServiceForm");
    const { t: tCommon } = useTranslation("Common");

    /* l'etape courante */
    const [currentStep, setCurrentStep] = useState(STEPS.TABLES_INFOS);
    const editMode = useMemo(() => !!offeringId, [offeringId]);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<CartesApiException>();

    const vectorDbQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data(datastoreId, vectorDbId),
        queryFn: () => api.storedData.get<VectorDb>(datastoreId, vectorDbId),
        staleTime: 600000,
    });

    const offeringsQuery = useQuery({
        queryKey: RQKeys.datastore_offering_list(datastoreId),
        queryFn: () => api.service.getOfferings(datastoreId),
        refetchInterval: 10000,
    });

    const offeringQuery = useQuery<Service | null, CartesApiException>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId ?? "xxxx"),
        queryFn: ({ signal }) => {
            if (offeringId) {
                return api.service.getService(datastoreId, offeringId, { signal });
            }
            return Promise.resolve(null);
        },
        enabled: editMode,
        staleTime: Infinity,
    });

    const commonValidation = useMemo(() => new CommonSchemasValidation(offeringsQuery.data), [offeringsQuery.data]);

    // Definition du schema
    const schemas = {};
    schemas[STEPS.TABLES_INFOS] = yup.object().shape({
        selected_tables: yup.array(yup.string()).min(1, "Veuillez choisir au moins une table").required("Veuillez choisir au moins une table"),
        table_infos: yup.lazy(() => {
            if (!selectedTables || selectedTables.length === 0) {
                return yup.mixed().nullable().notRequired();
            }

            const table_schemas = {};
            selectedTables.forEach((table) => {
                table_schemas[table] = yup.object({
                    public_name: yup.string().default(table),
                    title: yup.string().required(`Le titre de la table ${table} est obligatoire`),
                    description: yup.string().required(`Le résumé du contenu de la table ${table} est obligatoire`),
                    keywords: yup.array().of(yup.string()),
                });
            });
            return yup.object().shape(table_schemas);
        }),
    });
    schemas[STEPS.METADATAS_UPLOAD] = commonValidation.getMDUploadFileSchema();
    schemas[STEPS.METADATAS_DESCRIPTION] = commonValidation.getMDDescriptionSchema();
    schemas[STEPS.METADATAS_ADDITIONALINFORMATIONS] = commonValidation.getMDAdditionalInfoSchema();
    schemas[STEPS.ACCESSRESTRICTIONS] = commonValidation.getAccessRestrictionSchema();

    const defaultValues: WfsServiceFormValuesType = useMemo(() => {
        let defValues: WfsServiceFormValuesType;
        const now = datefnsFormat(new Date(), "yyyy-MM-dd");

        if (editMode) {
            const share_with = offeringQuery.data?.open === true ? "all_public" : "your_community";
            const typeInfos = offeringQuery.data?.configuration?.type_infos as ConfigurationWfsDetailsContent | undefined;

            const tableInfos: Record<string, TableInfos> = {};
            typeInfos?.used_data?.[0].relations.forEach((rel) => {
                tableInfos[rel.native_name] = {
                    title: rel.title,
                    description: rel.abstract,
                    keywords: rel.keywords ?? [],
                    public_name: rel.public_name,
                };
            });

            defValues = {
                selected_tables: typeInfos?.used_data?.[0].relations?.map((rel) => rel.native_name) ?? [],
                table_infos: tableInfos,
                technical_name: offeringQuery.data?.configuration.layer_name,
                public_name: offeringQuery.data?.configuration.name,
                share_with,
                // TODO : à récupérer depuis les métadonnées
                creation_date: now,
                resource_genealogy: "",
                email_contact: "email@ign.fr",
                organization: "IGN",
                organization_email: "email@ign.fr",
                category: ["test", "test_2"],
                description: "Ceci est un test",
                identifier: "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                charset: "utf8",
                attribution_text: "© IGN",
                attribution_url: "https://www.ign.fr",
            };
        } else {
            const suffix = getEndpointSuffix(EndpointTypeEnum.WFS);
            const storedDataName = vectorDbQuery.data?.name ?? "";
            const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");

            defValues = {
                selected_tables: [],
                table_infos: {},
                technical_name: `${nice}_${suffix}`,
                public_name: storedDataName,
                creation_date: now,
                resource_genealogy: "",
                charset: "utf8",
            };
        }

        let projUrl = "";
        const projCode = getProjectionCode(vectorDbQuery.data?.srs);
        if (projCode) {
            projUrl = `http://www.opengis.net/def/crs/EPSG/0/${projCode}`;
        }

        defValues = {
            ...defValues,
            projection: projUrl,
            languages: [{ language: "français", code: "fra" }],
        };

        return defValues;
    }, [editMode, vectorDbQuery.data, offeringQuery.data]);

    const tables: StoredDataRelation[] = useMemo(() => {
        if (!vectorDbQuery.data?.type_infos) return [];

        const relations = vectorDbQuery.data.type_infos?.relations ?? [];
        return filterGeometricRelations(relations, true);
    }, [vectorDbQuery.data?.type_infos]);

    const form = useForm<WfsServiceFormValuesType>({
        resolver: yupResolver(schemas[currentStep]),
        mode: "onChange",
        values: defaultValues,
    });
    const {
        formState: { errors },
        getValues: getFormValues,
        watch,
        trigger,
    } = form;

    const selectedTables = watch("selected_tables");

    // Ajout du nom natif et trim sur les mots cles
    const format = (table_infos: Record<string, TableInfos>) => {
        const tInfos: object[] = [];
        for (const [name, infos] of Object.entries(table_infos)) {
            tInfos.push({
                native_name: name,
                ...infos,
            });
        }
        return tInfos;
    };

    const previousStep = () => setCurrentStep((currentStep) => currentStep - 1);

    const nextStep = async () => {
        const isStepValid = await trigger(undefined, { shouldFocus: true }); // demande de valider le formulaire
        if (!isStepValid) return;

        if (currentStep < Object.values(STEPS).length) {
            setCurrentStep((currentStep) => currentStep + 1);
            return;
        }

        setIsSubmitting(true);

        // Nettoyage => trim sur toutes les chaines
        const values = JSON.parse(
            JSON.stringify(getFormValues(), (key, value) => {
                return typeof value === "string" ? value.trim() : value;
            })
        );
        values.table_infos = format(values.table_infos);

        api.wfs
            .add(datastoreId, vectorDbId, values)
            .then(() => {
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
    };

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={t("title", { editMode })}>
            <h1>{t("title", { editMode })}</h1>

            {vectorDbQuery.isLoading || offeringQuery.isLoading ? (
                <LoadingText message={t("stored_data.loading")} />
            ) : vectorDbQuery.data === undefined ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("stored_data.fetch_failed")}
                    description={<Button linkProps={routes.datasheet_list({ datastoreId }).link}>{t("back_to_data_list")}</Button>}
                />
            ) : (
                <>
                    <Stepper
                        currentStep={currentStep}
                        stepCount={Object.values(STEPS).length}
                        nextTitle={currentStep < STEPS.ACCESSRESTRICTIONS && t("step.title", { stepNumber: currentStep + 1 })}
                        title={t("step.title", { stepNumber: currentStep })}
                    />
                    {validationError && (
                        <Alert className="fr-preline" closable description={validationError.message} severity="error" title={tCommon("error")} />
                    )}
                    <TableInfosForm
                        visible={currentStep === STEPS.TABLES_INFOS}
                        tables={tables}
                        form={form}
                        state={errors.selected_tables ? "error" : "default"}
                        stateRelatedMessage={errors?.selected_tables?.message?.toString()}
                    />

                    <UploadMDFile visible={currentStep === STEPS.METADATAS_UPLOAD} form={form} />
                    <Description visible={currentStep === STEPS.METADATAS_DESCRIPTION} form={form} />
                    <AdditionalInfo
                        datastoreId={datastoreId}
                        storedData={vectorDbQuery.data}
                        visible={currentStep === STEPS.METADATAS_ADDITIONALINFORMATIONS}
                        form={form}
                    />
                    <AccessRestrictions
                        datastoreId={datastoreId}
                        endpointType={EndpointTypeEnum.WFS}
                        visible={currentStep === STEPS.ACCESSRESTRICTIONS}
                        form={form}
                    />

                    <ButtonsGroup
                        className={fr.cx("fr-mt-2w")}
                        alignment="between"
                        buttons={[
                            {
                                children: t("previous_step"),
                                iconId: "fr-icon-arrow-left-fill",
                                priority: "tertiary",
                                onClick: previousStep,
                                disabled: currentStep === STEPS.TABLES_INFOS,
                            },
                            {
                                children: currentStep < Object.values(STEPS).length ? t("continue") : t("publish"),
                                onClick: nextStep,
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </>
            )}
            {isSubmitting && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <LoadingIcon largeIcon={true} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{editMode ? t("modify.in_progress") : t("publish.in_progress")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
            <DevTool control={form.control} />
        </DatastoreLayout>
    );
};

WfsServiceForm.displayName = symToStr({ WfsServiceForm });

export default WfsServiceForm;

export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { editMode: boolean }; R: string }
    | "stored_data.loading"
    | "stored_data.fetch_failed"
    | { K: "step.title"; P: { stepNumber: number }; R: string }
    | "previous_step"
    | "continue"
    | "publish"
    | "publish.in_progress"
    | "modify.in_progress"
    | "back_to_data_list"
>()({
    WfsServiceForm,
});

export const WfsServiceFormFrTranslations: Translations<"fr">["WfsServiceForm"] = {
    title: ({ editMode }) => (editMode ? "Modifier le service WFS" : "Créer et publier un service WFS"),
    "stored_data.loading": "Chargement de la donnée stockée...",
    "stored_data.fetch_failed": "Récupération des informations sur la donnée stockée a échoué",
    "step.title": ({ stepNumber }) => {
        switch (stepNumber) {
            case 1:
                return "Tables";
            case 2:
                return "Source des métadonnées";
            case 3:
                return "Description de la ressource";
            case 4:
                return "Informations supplémentaires";
            case 5:
                return "Restrictions d'accès";
            default:
                return "";
        }
    },
    previous_step: "Étape précédente",
    continue: "Continuer",
    publish: "Publier le service maintenant",
    "publish.in_progress": "Création du service WFS en cours",
    "modify.in_progress": "Modification des informations du service WFS en cours",
    back_to_data_list: "Retour à mes données",
};

export const WfsServiceFormEnTranslations: Translations<"en">["WfsServiceForm"] = {
    title: undefined,
    "stored_data.loading": undefined,
    "stored_data.fetch_failed": undefined,
    "step.title": undefined,
    previous_step: undefined,
    continue: undefined,
    publish: undefined,
    "publish.in_progress": undefined,
    "modify.in_progress": undefined,
    back_to_data_list: undefined,
};
