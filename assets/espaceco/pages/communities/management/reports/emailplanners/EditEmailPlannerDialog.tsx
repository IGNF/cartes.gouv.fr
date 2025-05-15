import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { EmailPlannerAddType, EmailPlannerFormType } from "../../../../../../@types/app_espaceco";
import { EmailPlannerDTO, ReportStatusesDTO } from "../../../../../../@types/espaceco";
import { useTranslation } from "../../../../../../i18n/i18n";
import { getAddDefaultValues, getEditDefaultValues, prepareDatasForApi } from "./EmailPlannerUtils";
import PersonalEmailPlanner from "./PersonalEmailPlanner";
import { getPersonalSchema } from "./schemas";

const EditEmailPlannerDialogModal = createModal({
    id: "edit-emailplanner",
    isOpenedByDefault: false,
});

type EditEmailPlannerDialogProps = {
    emailPlanner?: EmailPlannerDTO;
    themes: string[];
    statuses: ReportStatusesDTO;
    onModify: (datas: EmailPlannerAddType) => void;
};

const EditEmailPlannerDialog: FC<EditEmailPlannerDialogProps> = ({ emailPlanner, themes, statuses, onModify }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("AddOrEditEmailPlanner");

    const schema = getPersonalSchema(themes, statuses);

    const form = useForm<EmailPlannerFormType>({
        mode: "onSubmit",
        values: emailPlanner ? getEditDefaultValues(emailPlanner) : getAddDefaultValues("personal"),
        resolver: yupResolver(schema),
    });

    const { handleSubmit, getValues: getFormValues } = form;

    const onSubmit = () => {
        const datas = prepareDatasForApi(getFormValues());
        onModify(datas);
        EditEmailPlannerDialogModal.close();
    };

    return (
        <>
            {createPortal(
                <EditEmailPlannerDialogModal.Component
                    title={t("title", { edit: true })}
                    size={"large"}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                            doClosesModal: true,
                        },
                        {
                            children: emailPlanner ? tCommon("modify") : tCommon("add"),
                            priority: "primary",
                            doClosesModal: false,
                            onClick: handleSubmit(onSubmit),
                        },
                    ]}
                >
                    <div>
                        <PersonalEmailPlanner form={form} statuses={statuses} themes={themes} />
                    </div>
                </EditEmailPlannerDialogModal.Component>,
                document.body
            )}
        </>
    );
};
export { EditEmailPlannerDialog, EditEmailPlannerDialogModal };
