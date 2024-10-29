import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { EmailPlannerDTO } from "../../../../../@types/espaceco";
import { createPortal } from "react-dom";
import { FC, useEffect, useMemo, useState } from "react";
import { declareComponentKeys, Translations, useTranslation } from "../../../../../i18n/i18n";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { fr } from "@codegouvfr/react-dsfr";

const AddOrEditEmailPlannerDialogModal = createModal({
    id: "addoredit-emailplanner",
    isOpenedByDefault: false,
});

type AddOrEditEmailPlannerDialogProps = {
    emailPlanner?: EmailPlannerDTO;
};

const EmailPlannerTypes = ["basic", "personnal"];
type EmailPlannerType = (typeof EmailPlannerTypes)[number];

type EmailPlannerForm = {
    email_type: EmailPlannerType;
};

const AddOrEditEmailPlannerDialog: FC<AddOrEditEmailPlannerDialogProps> = ({ emailPlanner }) => {
    /* const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("AddOrEditEmailPlannerDialog");

    const schema: yup.ObjectSchema<EmailPlannerForm> = yup.object({
        email_type: yup.string().required().oneOf(EmailPlannerTypes),
    });

    const { register, watch } = useForm<EmailPlannerForm>({
        mode: "onChange",
        resolver: yupResolver(schema),
        values: {
            email_type: emailPlanner ? "personnal" : "basic",
        },
    });

    return (
        <>
            {createPortal(
                <AddOrEditEmailPlannerDialogModal.Component
                    title={t("title", { edit: emailPlanner !== undefined })}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                            doClosesModal: false,
                            onClick: () => {},
                        },
                        {
                            children: emailPlanner ? tCommon("modify") : tCommon("add"),
                            priority: "primary",
                            doClosesModal: false,
                            onClick: () => {},
                        },
                    ]}
                >
                    <div>
                        <RadioButtons
                            className={emailPlanner ? fr.cx("fr-hidden") : ""}
                            options={EmailPlannerTypes.map((ept) => ({
                                label: t("email_planner_type", { type: ept }),
                                nativeInputProps: {
                                    ...register("email_type"),
                                    value: ept,
                                },
                            }))}
                        />
                        <p>{tCommon("mandatory_fields")}</p>
                    </div>
                </AddOrEditEmailPlannerDialogModal.Component>,
                document.body
            )}
        </>
    ); */
    return <></>;
};

export { AddOrEditEmailPlannerDialogModal, AddOrEditEmailPlannerDialog };
