import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, ReactNode, useMemo, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { EmailPlannerAddType, ReportFormType } from "../../../../../@types/app_espaceco";
import { EmailPlannerDTO, ReportStatusesDTO, ThemeDTO } from "../../../../../@types/espaceco";
import { ConfirmDialog, ConfirmDialogModal } from "../../../../../components/Utils/ConfirmDialog";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Wait from "../../../../../components/Utils/Wait";
import { declareComponentKeys, Translations, useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import api from "../../../../api";
import { AddEmailPlannerDialog, AddEmailPlannerDialogModal } from "./emailplanners/AddEmailPlannerDialog";
import { EditEmailPlannerDialog, EditEmailPlannerDialogModal } from "./emailplanners/EditEmailPlannerDialog";

type EmailPlannersProps = {
    communityId: number;
    form: UseFormReturn<ReportFormType>;
    emailPlanners: EmailPlannerDTO[];
};

const checkStatus = (ep: EmailPlannerDTO, statuses: ReportStatusesDTO) => {
    const condition = ep.condition ?? { status: [] };
    if (!("status" in condition)) {
        return true;
    }
    // Verification du status
    for (const s of condition["status"]) {
        if (!(s in statuses)) {
            return false;
        }
    }

    return true;
};

const checkThemes = (ep: EmailPlannerDTO, themeNames: string[]) => {
    const epThemes = ep.themes ?? [];
    for (const theme of epThemes) {
        if (!themeNames.includes(theme)) {
            return false;
        }
    }
    return true;
};

const EmailPlanners: FC<EmailPlannersProps> = ({ communityId, form, emailPlanners }) => {
    const { t: tmc } = useTranslation("ManageCommunity");
    const { t } = useTranslation("EmailPlanners");

    const { control } = form;
    const themes: ThemeDTO[] = useWatch({ control, name: "attributes" });
    const reportStatuses: ReportStatusesDTO = useWatch({ control, name: "report_statuses" });

    // Les status actifs
    const activeStatuses = useMemo<ReportStatusesDTO>(() => {
        return Object.keys(reportStatuses).reduce((accumulator, status) => {
            if (reportStatuses[status].active) accumulator[status] = reportStatuses[status];
            return accumulator;
        }, {});
    }, [reportStatuses]);

    // Les thèmes du groupe
    const themeNames = useMemo(() => themes.map((t) => t.theme), [themes]);

    const [currentEmailPlanner, setCurrentEmailPlanner] = useState<EmailPlannerDTO | undefined>();

    const queryClient = useQueryClient();

    // Ajout d'un email de suivi
    const addPlannerMutation = useMutation<EmailPlannerDTO, CartesApiException, EmailPlannerAddType>({
        mutationFn: (data) => {
            return api.emailplanner.add(communityId, data);
        },
        onSuccess: (planner) => {
            setCurrentEmailPlanner(undefined);
            queryClient.setQueryData(RQKeys.emailPlanners(communityId), (oldPlanners: EmailPlannerDTO[]) => {
                const emailPlanners = [...oldPlanners];
                emailPlanners.push(planner);
                return emailPlanners;
            });
        },
    });

    // Mise à jour d'un email de suivi
    const updatePlannerMutation = useMutation<EmailPlannerDTO, CartesApiException, EmailPlannerAddType>({
        mutationFn: (data) => {
            if (currentEmailPlanner) {
                return api.emailplanner.update(communityId, currentEmailPlanner.id, data);
            }
            return Promise.reject();
        },
        onSuccess: (planner) => {
            setCurrentEmailPlanner(undefined);
            queryClient.setQueryData(RQKeys.emailPlanners(communityId), (oldPlanners: EmailPlannerDTO[]) => {
                const emailPlanners = [...oldPlanners].filter((ep) => ep.id !== currentEmailPlanner?.id);
                emailPlanners.push(planner);
                return emailPlanners;
            });
        },
    });

    // Suppression d'un email de suivi
    const removePlannerMutation = useMutation<{ emailplanner_id: number }, CartesApiException, number>({
        mutationFn: (emailplannerId) => {
            return api.emailplanner.remove(communityId, emailplannerId!);
        },
        onSuccess: (data) => {
            setCurrentEmailPlanner(undefined);
            queryClient.setQueryData(RQKeys.emailPlanners(communityId), () => {
                return emailPlanners?.filter((ep) => ep.id !== data.emailplanner_id);
            });
        },
        onSettled: () => setCurrentEmailPlanner(undefined),
    });

    const datas = useMemo(() => {
        return emailPlanners.map((ep) => {
            // Verification du status et des themes
            const statusOk: boolean = checkStatus(ep, activeStatuses);
            const themesOK: boolean = checkThemes(ep, themeNames);

            const tools: ReactNode = (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                    <Button
                        title={t("modify")}
                        priority="secondary"
                        iconId="fr-icon-edit-line"
                        size="small"
                        onClick={() => {
                            setCurrentEmailPlanner(ep);
                            EditEmailPlannerDialogModal.open();
                        }}
                    />
                    <Button
                        title={t("remove")}
                        className={fr.cx("fr-ml-2v")}
                        priority="secondary"
                        iconId="fr-icon-delete-line"
                        size="small"
                        onClick={() => {
                            setCurrentEmailPlanner(ep);
                            ConfirmDialogModal.open();
                        }}
                    />
                </div>
            );

            const data: ReactNode[] = [
                ep.event,
                ep.subject,
                ep.body,
                ep.delay,
                ep.recipients.join(", "),
                ep.cancel_event,
                new Boolean(ep.repeat).toString(),
                tools,
            ];
            data.unshift(
                !statusOk || !themesOK ? (
                    <span className={fr.cx("fr-icon-warning-line")} aria-hidden="true" style={{ color: fr.colors.decisions.text.default.warning.default }} />
                ) : (
                    ""
                )
            );
            return data;
        });
    }, [t, emailPlanners, activeStatuses, themeNames]);

    return (
        <div className={fr.cx("fr-my-1w")}>
            {addPlannerMutation.isError && <Alert severity="error" closable title={addPlannerMutation.error.message} />}
            {updatePlannerMutation.isError && <Alert severity="error" closable title={updatePlannerMutation.error.message} />}
            {removePlannerMutation.isError && <Alert severity="error" closable title={removePlannerMutation.error.message} />}
            {addPlannerMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("adding")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
            {updatePlannerMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("modifying")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
            {removePlannerMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("removing")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
            <h3>{tmc("report.manage.emailplanners")}</h3>
            <span className={fr.cx("fr-hint-text")}>{tmc("report.manage.emailplanners_explain")}</span>
            <Table
                className={fr.cx("fr-mb-0")}
                bordered
                headers={[
                    "",
                    t("event_header"),
                    t("subject_header"),
                    t("body_header"),
                    t("delay_header"),
                    t("recipients_header"),
                    t("cancel_event_header"),
                    t("repeat_header"),
                    "",
                ]}
                data={datas}
            />
            <Button className={fr.cx("fr-my-1v")} iconId={"fr-icon-add-circle-line"} priority="secondary" onClick={() => AddEmailPlannerDialogModal.open()}>
                {t("add")}
            </Button>
            <AddEmailPlannerDialog themes={themeNames} statuses={activeStatuses} onAdd={(values) => addPlannerMutation.mutate(values)} />
            <EditEmailPlannerDialog
                emailPlanner={currentEmailPlanner}
                themes={themeNames}
                statuses={activeStatuses}
                onModify={(data: EmailPlannerAddType) => {
                    if (currentEmailPlanner) {
                        updatePlannerMutation.mutate(data);
                    }
                }}
            />
            <ConfirmDialog
                title={t("confirm_remove_title")}
                onConfirm={() => {
                    if (currentEmailPlanner) {
                        removePlannerMutation.mutate(currentEmailPlanner.id);
                    }
                }}
            />
        </div>
    );
};

export default EmailPlanners;

// traductions
export const { i18n } = declareComponentKeys<
    | "event_header"
    | "subject_header"
    | "body_header"
    | "delay_header"
    | "recipients_header"
    | "cancel_event_header"
    | "repeat_header"
    | "add"
    | "adding"
    | "modify"
    | "modifying"
    | "remove"
    | "removing"
    | "confirm_remove_title"
>()("EmailPlanners");

export const EmailPlannersFrTranslations: Translations<"fr">["EmailPlanners"] = {
    event_header: "Evénement déclencheur",
    subject_header: "Sujet de l’email",
    body_header: "Corps de l’email",
    delay_header: "Délai en jours (aprés l’évènement déclencheur)",
    recipients_header: "Destinataires",
    cancel_event_header: "Evénement annulateur",
    repeat_header: "Répétition",
    add: "Ajouter un email de suivi",
    adding: "Ajout de l'email de suivi en cours ...",
    modify: "Modifier l'email de suivi",
    modifying: "Modification de l'email de suivi en cours ...",
    remove: "Supprimer l'email de suivi",
    removing: "Suppression de l'email de suivi en cours ...",
    confirm_remove_title: "Êtes-vous sûr de vouloir supprimer cet email de suivi ?",
};

export const EmailPlannersEnTranslations: Translations<"en">["EmailPlanners"] = {
    event_header: undefined,
    subject_header: undefined,
    body_header: undefined,
    delay_header: undefined,
    recipients_header: undefined,
    cancel_event_header: undefined,
    repeat_header: undefined,
    add: undefined,
    adding: undefined,
    modify: undefined,
    modifying: undefined,
    remove: undefined,
    removing: undefined,
    confirm_remove_title: undefined,
};
