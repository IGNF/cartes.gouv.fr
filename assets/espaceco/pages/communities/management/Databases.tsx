import { arrDBOptions, DBOption } from "@/@types/app_espaceco";
import { DatabaseResponseDTO, PermissionResponseDTO } from "@/@types/espaceco";
import LoadingText from "@/components/Utils/LoadingText";
import api from "@/espaceco/api";
import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/espaceco/RQKeys";
import Alert from "@codegouvfr/react-dsfr/Alert";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import ActionButtonsCreation from "./ActionButtonsCreation";
import Button from "@codegouvfr/react-dsfr/Button";
import DatabasesPermissions from "./databases/DatabasesPermissions";

const Databases: FC = () => {
    const { t } = useTranslation("Databases");
    const { t: tmc } = useTranslation("ManageCommunity");

    const context = useCommunityContext();

    const { mode, stepper } = context;
    const community = context.community!;

    const [option, setOption] = useState<DBOption>("none");

    /* const {
        data: databases,
        isError: isErrorDBs,
        error: errorDBs,
        isLoading: isLoadingDBs,
    } = useQuery<DatabaseResponseDTO[]>({
        queryKey: RQKeys.databases(),
        queryFn: ({ signal }) => api.database.getAll([], signal),
        staleTime: 3600000,
        enabled: false, // TODO SUPPRIMER
    });

    const dbIds = useMemo(() => {
        return databases ? Array.from(databases, (db) => db.id) : [];
    }, [databases]);

    const {
        data: permissions,
        isError,
        error,
        isLoading,
    } = useQuery<PermissionResponseDTO[]>({
        queryKey: RQKeys.permissionsOnDB(community.id, dbIds),
        queryFn: ({ signal }) => api.permission.getOnDBs(community.id, dbIds, signal),
        staleTime: 3600000,
        enabled: dbIds.length > 0,
    });

    return (
        <>
            {isLoadingDBs && <LoadingText as="h6" message={t("loading_databases")} />}
            {isErrorDBs && <Alert severity="error" closable title={errorDBs.message} />}
            {isLoading && <LoadingText as="h6" message={t("loading_permissions")} />}
            {isError && <Alert severity="error" closable title={error.message} />}
            {mode === "creation" && databases && permissions ? (
                <>
                    <h2>{tmc("database.tab.title")}</h2>
                    <div>
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
                        {option === "none" ? (
                            <ActionButtonsCreation onContinue={() => stepper?.nextStep()} />
                        ) : option === "import" ? (
                            <>
                                <p>{tmc("database.explain_import")}</p>
                                <Button onClick={() => console.log("TODO")}>{tmc("database.import")}</Button>
                            </>
                        ) : (
                            <div />
                        )}
                    </div>
                </>
            ) : (
                <div />
            )}
        </>
    ); */

    return (
        <div>
            <DatabasesPermissions />
        </div>
    );
};

export default Databases;
