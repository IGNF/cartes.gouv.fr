import { EmailPlannerFormType, EmailPlannerType } from "../../../../../../@types/app_espaceco";
import { EmailPlannerDTO } from "../../../../../../@types/espaceco";

const getAddDefaultValues = (type: EmailPlannerType): EmailPlannerFormType => {
    return {
        event: "georem_created",
        delay: 1,
        cancel_event: "georem_status_changed",
        repeat: false,
        subject: type === "personal" ? "" : "Nouveau signalement",
        body: type === "personal" ? "" : "Le signalement n° _id_ a été envoyé le _openingDate_ par _author_",
        recipients: [],
        themes: [],
    };
};

const getEditDefaultValues = (emailPlanner: EmailPlannerDTO): EmailPlannerFormType => {
    let statuses: string[] = [];
    if (emailPlanner.condition && "status" in emailPlanner.condition) {
        statuses = emailPlanner.condition["status"];
    }

    return {
        id: emailPlanner.id,
        event: emailPlanner.event,
        delay: emailPlanner.delay,
        cancel_event: emailPlanner.cancel_event,
        repeat: emailPlanner.repeat,
        recipients: emailPlanner.recipients,
        subject: emailPlanner.subject,
        body: emailPlanner.body,
        statuses: statuses,
        themes: emailPlanner.themes ?? [],
    };
};

export { getAddDefaultValues, getEditDefaultValues };
