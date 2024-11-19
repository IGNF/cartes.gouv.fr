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

const getEditDefaultValues = (emailPlaner: EmailPlannerDTO): EmailPlannerFormType => {
    let statuses: string[] = [];
    if (emailPlaner.condition) {
        try {
            const condition = emailPlaner.condition ?? { status: [] };
            if ("status" in condition) {
                statuses = condition["status"];
            }
        } catch (e) {
            /* empty */
        }
    }

    return {
        id: emailPlaner.id,
        event: emailPlaner.event,
        delay: emailPlaner.delay,
        cancel_event: emailPlaner.cancel_event,
        repeat: emailPlaner.repeat,
        recipients: emailPlaner.recipients,
        subject: emailPlaner.subject,
        body: emailPlaner.body,
        statuses: statuses,
        themes: emailPlaner.themes,
    };
};

export { getAddDefaultValues, getEditDefaultValues };
