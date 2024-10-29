import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, ReactNode, useMemo, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { ReportFormType } from "../../../../../@types/app_espaceco";
import { EmailPlannerDTO, ReportStatusesDTO, ThemeDTO } from "../../../../../@types/espaceco";
import { ConfirmDialog, ConfirmDialogModal } from "../../../../../components/Utils/ConfirmDialog";
import Wait from "../../../../../components/Utils/Wait";
import { declareComponentKeys, Translations, useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import api from "../../../../api";
import { AddOrEditEmailPlannerDialogModal, AddOrEditEmailPlannerDialog } from "./AddOrEditEmailPlannerDialog";
import { AddEmailPlannerDialog, AddEmailPlannerDialogModal } from "./emailplanners/AddEmailPlannerDialog";

type EmailPlannersProps = {
    communityId: number;
    form: UseFormReturn<ReportFormType>;
    emailPlanners: EmailPlannerDTO[];
};

const checkStatus = (ep: EmailPlannerDTO, statuses: string[]) => {
    const condition = ep.condition ? JSON.parse(ep.condition) : {};

    // Verification du status
    if ("status" in condition) {
        for (const s of condition["status"]) {
            if (!statuses.includes(s)) {
                return false;
            }
        }
    }
    return true;
};

const checkThemes = (ep: EmailPlannerDTO, themeNames: string[]) => {
    const epThemes = ep.themes ? JSON.parse(ep.themes) : [];
    for (const theme of epThemes) {
        if (!themeNames.includes(theme)) {
            return false;
        }
    }
    return true;
};

const EmailPlanners: FC<EmailPlannersProps> = ({ communityId, form, emailPlanners }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tmc } = useTranslation("ManageCommunity");
    const { t } = useTranslation("EmailPlanners");

    const { control } = form;
    const themes: ThemeDTO[] = useWatch({ control, name: "attributes" });
    const reportStatuses: ReportStatusesDTO = useWatch({ control, name: "report_statuses" });

    // Les status actifs
    const activeStatuses = useMemo(() => {
        return Object.keys(reportStatuses).filter((s) => reportStatuses[s].active);
    }, [reportStatuses]);

    // Les thèmes du groupe
    const themeNames = useMemo(() => themes.map((t) => t.theme), [themes]);

    const [currentEmailPlanner, setCurrentEmailPlanner] = useState<EmailPlannerDTO | undefined>();

    const queryClient = useQueryClient();

    // Suppression d'un email de suivi
    const { isPending: isRemovePending, mutate: mutateRemove } = useMutation<{ emailplanner_id: number }, CartesApiException, number>({
        mutationFn: (emailplannerId) => {
            return api.emailplanner.remove(communityId, emailplannerId!);
        },
        onSuccess: (data) => {
            setCurrentEmailPlanner(undefined);
            queryClient.setQueryData(RQKeys.emailPlanners(communityId), () => {
                return emailPlanners?.filter((ep) => ep.id !== data.emailplanner_id);
            });
        },
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
                            AddOrEditEmailPlannerDialogModal.open();
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

            const data: ReactNode[] = [ep.event, ep.subject, ep.body, ep.delay, ep.recipients, ep.cancel_event, new Boolean(ep.repeat).toString(), tools];
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
            <h3>{tmc("report.manage.emailplanners")}</h3>
            <span className={fr.cx("fr-hint-text")}>{tmc("report.manage.emailplanners_explain")}</span>
            {isRemovePending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                        <h6 className={fr.cx("fr-m-0")}>{isRemovePending ? tCommon("removing") : tCommon("modifying")}</h6>
                    </div>
                </Wait>
            )}
            <Table
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
            <Button size="small" onClick={() => AddEmailPlannerDialogModal.open()}>
                {t("add")}
            </Button>
            <AddEmailPlannerDialog themes={themeNames} statuses={activeStatuses} />
            <ConfirmDialog
                title={t("confirm_remove_title")}
                onConfirm={() => {
                    if (currentEmailPlanner) {
                        mutateRemove(currentEmailPlanner.id);
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
    | "modify"
    | "remove"
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
    modify: "Modifier l'email de suivi",
    remove: "Supprimer l'email de suivi",
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
    modify: undefined,
    remove: undefined,
    confirm_remove_title: undefined,
};
