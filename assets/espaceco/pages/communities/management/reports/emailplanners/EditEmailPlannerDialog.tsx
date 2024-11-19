import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { EmailPlannerFormType } from "../../../../../../@types/app_espaceco";
import { EmailPlannerDTO, ReportStatusesDTO } from "../../../../../../@types/espaceco";
import { useTranslation } from "../../../../../../i18n/i18n";
import { getAddDefaultValues, getEditDefaultValues } from "./Defaults";
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
    onModify: (values: EmailPlannerDTO) => void;
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

    const { watch } = form;

    /* TODO SUPPRIMER */
    const values = watch();
    useEffect(() => {
        console.log("VALUES : ", values);
    }, [values]);

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
                            children: tCommon("add"),
                            priority: "primary",
                            doClosesModal: false,
                            //onClick: handleSubmit(onSubmit),
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
