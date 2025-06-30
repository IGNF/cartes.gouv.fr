import { arrDBOptions, DBOption, IDatabasePermission } from "@/@types/app_espaceco";
import LoadingText from "@/components/Utils/LoadingText";
import api from "@/espaceco/api";
import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/espaceco/RQKeys";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ActionButtonsCreation from "./ActionButtonsCreation";
import ActionButtonsEdition from "./ActionButtonsEdition";
import DatabasePermissionList from "./databases/DatabasePermissionList";
import { CartesApiException } from "@/modules/jsonFetch";
import { fr } from "@codegouvfr/react-dsfr";
import Wait from "@/components/Utils/Wait";

const Databases: FC = () => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tmc } = useTranslation("ManageCommunity");
    const { t } = useTranslation("Databases");

    const context = useCommunityContext();

    const { mode, stepper } = context;
    const community = context.community!;

    const [option, setOption] = useState<DBOption>("none");

    const {
        data: permissions,
        isError,
        error,
        isLoading,
    } = useQuery<IDatabasePermission[], CartesApiException>({
        queryKey: RQKeys.permissions(community.id),
        queryFn: ({ signal }) => api.permission.get(community.id, signal),
        staleTime: 3600000,
    });

    const {
        mutate,
        isPending: isUpdating,
        isError: isUpdatingError,
        error: updatingError,
    } = useMutation<IDatabasePermission[], CartesApiException, object>({
        mutationFn: (datas: object) => {
            return api.permission.update(community.id, datas);
        },
        onSuccess: (response) => {
            console.log(response);
        },
    });

    const queryClient = useQueryClient();

    const updatePermissions = useCallback(
        (datas: object, onSuccess: () => void): void => {
            mutate(datas, {
                onSuccess: (permissions) => {
                    queryClient.setQueryData<IDatabasePermission[]>(RQKeys.permissions(community.id), () => {
                        return permissions;
                    });
                    onSuccess();
                },
            });
        },
        [queryClient, mutate, community.id]
    );

    const methods = useForm<{ permissions: IDatabasePermission[] }>({
        mode: "onSubmit",
        values: { permissions: permissions ?? [] },
    });

    const { handleSubmit, getValues: getFormValues } = methods;

    const onSubmitForm = (saveOnly: boolean) => {
        const datas = getFormValues("permissions");
        updatePermissions(datas, () => {
            if (mode === "creation" && !saveOnly && !stepper?.isLastStep()) {
                stepper?.nextStep();
            }
        });
    };

    return (
        <>
            {/* Mise à jour */}
            {isUpdating && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("update_permissions")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
            {isUpdatingError && <Alert severity="error" closable title={tCommon("error")} description={updatingError.message} className={fr.cx("fr-my-3w")} />}
            {isLoading ? (
                <LoadingText as={"h6"} message={t("loading_permissions")} />
            ) : isError ? (
                <Alert severity="error" closable title={error?.message} />
            ) : (
                <div>
                    <h2>{tmc("database.tab.title")}</h2>
                    <RadioButtons
                        options={[...arrDBOptions].map((o) => ({
                            label: t("get_option", { option: o }),
                            hintText: t("get_option_hint", { option: o }),
                            nativeInputProps: {
                                checked: option === o,
                                onChange: () => setOption(o),
                            },
                        }))}
                    />
                    {(() => {
                        switch (option) {
                            case "none":
                                break;
                            case "import":
                                return (
                                    <>
                                        <p>{tmc("database.explain_import")}</p>
                                        <Button onClick={() => console.log("TODO")}>{tmc("database.import")}</Button>
                                    </>
                                );
                            case "reuse":
                                return <div />;
                            case "add":
                                return (
                                    <FormProvider {...methods}>
                                        <DatabasePermissionList />
                                    </FormProvider>
                                );
                        }
                    })()}
                    {mode === "creation" ? (
                        <ActionButtonsCreation
                            onSave={option !== "none" ? () => handleSubmit(() => onSubmitForm(true))() : () => {}}
                            onContinue={option !== "none" ? () => handleSubmit(() => onSubmitForm(false))() : () => stepper?.nextStep()}
                        />
                    ) : (
                        option !== "none" && <ActionButtonsEdition onSave={() => handleSubmit(() => onSubmitForm(true))()} />
                    )}
                </div>
            )}
        </>
    );
};

export default Databases;
