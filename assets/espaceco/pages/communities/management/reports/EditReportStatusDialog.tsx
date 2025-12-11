import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ReportStatusesType, ReportStatusParams } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { getDefaultStatuses } from "./Utils";
import { setToNull } from "../../../../../utils";

const EditReportParameterModal = createModal({
    id: "status-modal",
    isOpenedByDefault: false,
});

const defaultStatuses = getDefaultStatuses();

type EditReportStatusDialogProps = {
    status?: ReportStatusesType;
    statusParams?: ReportStatusParams;
    onModify: (values: Omit<ReportStatusParams, "active">) => void;
};

const EditReportStatusDialog: FC<EditReportStatusDialogProps> = ({ status, statusParams, onModify }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("ReportStatuses");

    const schema: yup.ObjectSchema<{ title: string; description?: string }> = yup.object({
        title: yup.string().trim(tCommon("trimmed_error")).strict(true).required(),
        description: yup.string(),
    });

    const {
        register,
        setValue: setFormValue,
        getValues: getFormValues,
        formState: { errors },
        handleSubmit,
    } = useForm<{ title: string; description?: string }>({
        mode: "onSubmit",
        resolver: yupResolver(schema),
        values: {
            title: statusParams?.title ?? "",
            description: statusParams?.description ?? "",
        },
    });

    const onSubmit = () => {
        const datas = { ...getFormValues() };
        setToNull(datas.description);
        EditReportParameterModal.close();
        onModify(datas);
    };

    return createPortal(
        <EditReportParameterModal.Component
            title={t("modal_title")}
            buttons={[
                {
                    children: tCommon("cancel"),
                    priority: "secondary",
                },
                {
                    doClosesModal: false,
                    children: tCommon("save"),
                    onClick: handleSubmit(onSubmit),
                    priority: "primary",
                },
            ]}
        >
            <div>
                <Input
                    label={t("title")}
                    addon={
                        <Button
                            title={t("back_to_default")}
                            priority="tertiary no outline"
                            iconId="fr-icon-arrow-go-back-fill"
                            onClick={() => {
                                const title = getFormValues("title");
                                if (status && title !== defaultStatuses[status].title) {
                                    setFormValue("title", defaultStatuses[status].title);
                                }
                            }}
                        />
                    }
                    state={errors?.[`report_statuses.${status}.title`] ? "error" : "default"}
                    stateRelatedMessage={errors?.[`report_statuses.${status}.title`]?.message}
                    nativeInputProps={{
                        ...register("title"),
                    }}
                />
                <Input
                    label={t("description")}
                    textArea
                    nativeTextAreaProps={{
                        placeholder: t("description_placeholder"),
                        ...register("description"),
                    }}
                />
            </div>
        </EditReportParameterModal.Component>,
        document.body
    );
};

export { EditReportParameterModal, EditReportStatusDialog };
