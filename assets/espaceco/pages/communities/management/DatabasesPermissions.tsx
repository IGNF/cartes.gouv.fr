import { IDatabasePermission } from "@/@types/app_espaceco";
import LoadingText from "@/components/Utils/LoadingText";
import api from "@/espaceco/api";
import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/espaceco/RQKeys";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DatabasePermissionList from "./databases/DatabasePermissionList";
import ActionButtonsCreation from "./ActionButtonsCreation";
import ActionButtonsEdition from "./ActionButtonsEdition";
import { CartesApiException } from "@/modules/jsonFetch";
import Wait from "@/components/Utils/Wait";
import { fr } from "@codegouvfr/react-dsfr";

const DatabasesPermissions: FC = () => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Databases");

    const context = useCommunityContext();
    const { mode, stepper } = context;
    const community = context.community!;

    /* const {
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

    const onSubmitForm = (saveOnly: boolean) => {
        const datas = getFormValues("permissions");
        if (!saveOnly) {
            updatePermissions(datas, () => {
                stepper?.nextStep();
            });
        }
    }; */

    return (
        <div>
            {/* Mise à jour */}
            {/* {isUpdating && (
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
            ) : permissions ? (
                <FormProvider {...methods}>
                    <DatabasePermissionList />
                </FormProvider>
            ) : null}
            {mode === "creation" ? (
                <ActionButtonsCreation onSave={() => handleSubmit(() => onSubmitForm(true))()} onContinue={() => handleSubmit(() => onSubmitForm(false))()} />
            ) : (
                <ActionButtonsEdition onSave={() => handleSubmit(() => onSubmitForm(true))()} />
            )} */}
        </div>
    );
};

export default DatabasesPermissions;
