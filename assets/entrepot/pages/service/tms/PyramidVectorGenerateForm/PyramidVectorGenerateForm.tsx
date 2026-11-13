import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { type DatasheetDetailed, type StoredDataRelation, StoredDataStatusEnum, type VectorDb } from "../../../../../@types/app";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Wait from "../../../../../components/Utils/Wait";
import olDefaults from "../../../../../data/ol-defaults.json";
import useScrollToTopEffect from "../../../../../hooks/useScrollToTopEffect";
import { useTranslation } from "../../../../../i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { ApiError } from "../../../../../modules/jsonFetch";
import { getApiErrorMessage } from "../../../../../modules/apiError";
import { regex } from "../../../../../utils";
import api from "../../../../api";
import TableSelection from "../../common/TableSelection/TableSelection";
import formatForm from "../format-form";
import TableAttributeSelection from "../tables/TableAttributeSelection";
import TableZoomLevels from "../tables/TableZoomLevels";
import TippeCanoe from "../tippecanoes/Tippecanoe";
import Main from "../../../../../components/Layout/Main";

export type PyramidVectorGenerateFormValuesType = {
    vectordb_id?: string;
    technical_name?: string;
    selected_tables?: string[];
    table_attributes?: Record<string, string[]>;
    email_notification?: boolean;
    table_zoom_levels?: Record<string, number[]>;
    tippecanoe?: string;
};

const STEPS = {
    TABLES_SELECTION: 1,
    ATTRIBUTES_SELECTION: 2,
    ZOOM_LEVELS: 3,
    GENERALIZE_OPTIONS: 4,
};

type PyramidVectorNewProps = {
    datastoreId: string;
    datasheetName: string;
    /** base vecteur présélectionnée */
    vectorDbId?: string;
};

const PyramidVectorGenerateForm: FC<PyramidVectorNewProps> = ({ datastoreId, datasheetName, vectorDbId }) => {
    const navigate = useNavigate();
    const { t } = useTranslation("PyramidVectorGenerateForm");
    const { t: tCommon } = useTranslation("Common");

    // Definition du schema
    const datasheetView = {
        to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/nouvelle-vue",
        params: { datastoreId, datasheetName },
    } as const;

    // même requête que la page de la fiche : servie par le cache
    const datasheetQuery = useQuery<DatasheetDetailed, ApiError>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });
    const vectorDbs = useMemo(
        () => (datasheetQuery.data?.vector_db_list ?? []).filter((vectorDb) => vectorDb.status === StoredDataStatusEnum.GENERATED),
        [datasheetQuery.data]
    );

    const schema: Record<number, yup.AnySchema> = {};
    schema[STEPS.TABLES_SELECTION] = yup.object({
        // base présélectionnée par l’URL mais pas générée : refusée comme un choix vide
        vectordb_id: yup
            .string()
            .required(t("vector_db.error.mandatory"))
            .oneOf(
                vectorDbs.map((vectorDb) => vectorDb._id),
                t("vector_db.error.mandatory")
            ),
        technical_name: yup.string().required(t("technical_name.error.mandatory")).matches(regex.technical_name, t("technical_name.error.regex")),
        selected_tables: yup.array(yup.string()).min(1, t("step_tables.error.required")).required(t("step_tables.error.required")),
    });
    schema[STEPS.ATTRIBUTES_SELECTION] = yup.object({
        table_attributes: yup.lazy(() => {
            if (!selectedTables || selectedTables.length === 0) {
                return yup.mixed().nullable().notRequired();
            }

            const tableAttributes: yup.ObjectShape = {};
            selectedTables.forEach((table) => {
                tableAttributes[table.name] = yup
                    .array()
                    .of(yup.string())
                    .min(1, t("step_attributes.error.required"))
                    .required(t("step_attributes.error.required"));
            });
            return yup.object().shape(tableAttributes);
        }),
    });
    schema[STEPS.ZOOM_LEVELS] = yup.object({
        table_zoom_levels: yup
            .mixed<Record<string, number[]>>()
            .test("bounds", t("step_zoom_levels.error.bounds", { min: olDefaults.zoom_levels.TOP, max: olDefaults.zoom_levels.BOTTOM }), (value) =>
                Object.values(value ?? {}).every((levels) =>
                    levels.every((level) => level >= olDefaults.zoom_levels.TOP && level <= olDefaults.zoom_levels.BOTTOM)
                )
            ),
    });
    schema[STEPS.GENERALIZE_OPTIONS] = yup.object({
        tippecanoe: yup.string().required(t("step_generalisation.tippecanoe_option.error.required")),
    });

    /* l'etape courante */
    const [currentStep, setCurrentStep] = useState(STEPS.TABLES_SELECTION);

    const queryClient = useQueryClient();

    const form = useForm<PyramidVectorGenerateFormValuesType>({
        resolver: yupResolver(schema[currentStep] as yup.AnyObjectSchema),
        mode: "onChange",
        defaultValues: { vectordb_id: vectorDbId ?? "", technical_name: "", email_notification: true },
    });

    const selectedVectorDbId = form.watch("vectordb_id") ?? "";
    const vectorDbQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data(datastoreId, selectedVectorDbId),
        // base absente de la liste (présélection non générée ou d’une autre fiche) : rien à charger
        queryFn: !vectorDbs.some((vectorDb) => vectorDb._id === selectedVectorDbId)
            ? skipToken
            : ({ signal }) => api.storedData.get<VectorDb>(datastoreId, selectedVectorDbId, { signal }),
        staleTime: 600000,
    });
    const {
        formState: { errors },
        getValues: getFormValues,
        watch,
        trigger,
    } = form;

    const selectedTableNamesList: string[] | undefined = watch("selected_tables");
    const [selectedTables, setSelectedTables] = useState<StoredDataRelation[]>([]);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<ApiError>();

    useEffect(() => {
        if (selectedTableNamesList && vectorDbQuery.data) {
            const relations = vectorDbQuery.data.type_infos?.relations ?? [];
            const tables = relations.filter((rel) => rel.type && rel.type === "TABLE");
            const selectedTables = tables.filter((table) => selectedTableNamesList.includes(table.name));
            setSelectedTables(selectedTables);
        }
    }, [selectedTableNamesList, vectorDbQuery.data]);

    useScrollToTopEffect(currentStep);

    const previousStep = () => setCurrentStep((currentStep) => currentStep - 1);

    const nextStep = async () => {
        const isStepValid = await trigger(undefined, { shouldFocus: true }); // demande de valider le formulaire
        if (!isStepValid) return;

        if (currentStep < Object.values(STEPS).length) {
            setCurrentStep((currentStep) => currentStep + 1);
            return;
        }

        const values = getFormValues();
        const formatted = formatForm(values.technical_name ?? "", values.vectordb_id ?? "", values);

        setIsSubmitting(true);

        api.pyramidVector
            .add(datastoreId, formatted)
            .then(() => {
                void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
                void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_processing_execution_list(datastoreId) });
                void navigate({ ...datasheetView, search: { activeTab: "dataset" } });
            })
            .catch((error) => {
                setValidationError(error as ApiError);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // changer de base vide les choix faits sur les tables de la précédente
    const changeVectorDb = () => {
        form.setValue("selected_tables", []);
        form.setValue("table_attributes", undefined);
        form.setValue("table_zoom_levels", undefined);
    };

    const renderContent = () => {
        if (datasheetQuery.isPending) {
            return <LoadingText as="p" message={t("vector_db.list_loading")} withSpinnerIcon />;
        }

        if (datasheetQuery.isError) {
            return (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("stored_data.fetch_failed")}
                    description={
                        <>
                            <p>{getApiErrorMessage(datasheetQuery.error)}</p>
                            <Button linkProps={{ ...datasheetView, search: { activeTab: "dataset" } }}>{t("back_to_datasheet")}</Button>
                        </>
                    }
                />
            );
        }

        if (vectorDbs.length === 0) {
            return (
                <Alert
                    severity="info"
                    closable={false}
                    title={t("no_vector_db.title")}
                    description={
                        <>
                            <p>{t("no_vector_db.description")}</p>
                            <Button linkProps={{ ...datasheetView, search: { activeTab: "dataset" } }}>{t("back_to_datasheet")}</Button>
                        </>
                    }
                />
            );
        }

        return (
            <>
                <Stepper
                    currentStep={currentStep}
                    stepCount={Object.values(STEPS).length}
                    nextTitle={currentStep < STEPS.GENERALIZE_OPTIONS && t("step.title", { stepNumber: currentStep + 1 })}
                    title={t("step.title", { stepNumber: currentStep })}
                />
                {validationError && (
                    <Alert className="fr-preline" closable description={getApiErrorMessage(validationError)} severity="error" title={t("generate_error")} />
                )}
                <div className={fr.cx(currentStep !== STEPS.TABLES_SELECTION && "fr-hidden")}>
                    <Select
                        label={t("vector_db.label")}
                        placeholder={t("vector_db.placeholder")}
                        options={vectorDbs.map((vectorDb) => ({ value: vectorDb._id, label: vectorDb.name }))}
                        state={errors.vectordb_id?.message !== undefined ? "error" : "default"}
                        stateRelatedMessage={errors.vectordb_id?.message}
                        nativeSelectProps={form.register("vectordb_id", { onChange: changeVectorDb })}
                    />
                    <Input
                        label={t("technical_name.label")}
                        hintText={t("technical_name.explanation")}
                        nativeInputProps={form.register("technical_name")}
                        state={errors.technical_name?.message !== undefined ? "error" : "default"}
                        stateRelatedMessage={errors.technical_name?.message}
                    />
                </div>
                {vectorDbQuery.isLoading && <LoadingText as="p" message={t("stored_data.loading")} withSpinnerIcon />}
                {vectorDbQuery.isError && (
                    <Alert severity="error" small description={`${t("stored_data.fetch_failed")} : ${getApiErrorMessage(vectorDbQuery.error)}`} />
                )}
                {vectorDbQuery.data && (
                    <TableSelection filterGeometric={true} visible={currentStep === STEPS.TABLES_SELECTION} vectorDb={vectorDbQuery.data} form={form} />
                )}
                <TableAttributeSelection visible={currentStep === STEPS.ATTRIBUTES_SELECTION} form={form} selectedTables={selectedTables} />
                <TableZoomLevels visible={currentStep === STEPS.ZOOM_LEVELS} form={form} selectedTables={selectedTables} />
                <TippeCanoe
                    visible={currentStep === STEPS.GENERALIZE_OPTIONS}
                    state={errors.tippecanoe ? "error" : "default"}
                    stateRelatedMessage={errors?.tippecanoe?.message as string}
                    form={form}
                />
                <div className={fr.cx(currentStep !== STEPS.GENERALIZE_OPTIONS && "fr-hidden")}>
                    <hr className={fr.cx("fr-mt-3w")} />
                    <Checkbox options={[{ label: tCommon("email_notification"), nativeInputProps: form.register("email_notification") }]} />
                </div>
                <ButtonsGroup
                    className={fr.cx("fr-mt-2w")}
                    alignment="between"
                    buttons={[
                        {
                            children: tCommon("previous_step"),
                            iconId: "fr-icon-arrow-left-fill",
                            priority: "tertiary",
                            onClick: previousStep,
                            disabled: currentStep === STEPS.TABLES_SELECTION,
                        },
                        {
                            children: currentStep < Object.values(STEPS).length ? tCommon("continue") : t("generate_pyramid"),
                            onClick: () => void nextStep(),
                        },
                    ]}
                    inlineLayoutWhen="always"
                />
            </>
        );
    };

    return (
        <Main title={`${t("title")} - ${datasheetName}`} breadcrumbSeparator>
            <h1 className={fr.cx("fr-mb-1w")}>{t("title")}</h1>
            <p className={fr.cx("fr-text--sm")}>{tCommon("mandatory_fields")}</p>
            {renderContent()}
            {isSubmitting && (
                <Wait>
                    <LoadingText as="h6" message={t("pyramid_creation_launch_in_progress")} withSpinnerIcon />
                </Wait>
            )}
        </Main>
    );
};

export default PyramidVectorGenerateForm;
