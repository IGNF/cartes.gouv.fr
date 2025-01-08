import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useTranslation } from "../../../i18n/i18n";

const CreateCommunityDialogModal = createModal({
    id: "create-community",
    isOpenedByDefault: false,
});

type CreateCommunityDialogProps = {
    communityNames: string[];
    onAdd: (name: string) => void;
};

const CreateCommunityDialog: FC<CreateCommunityDialogProps> = ({ communityNames, onAdd }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tValid } = useTranslation("ManageCommunityValidations");
    const { t } = useTranslation("CreateCommunityDialog");

    const schema = yup.object({
        name: yup
            .string()
            .trim(tValid("trimmed_error"))
            .strict(true)
            .min(2, tValid("description.name.minlength"))
            .max(80, tValid("description.name.maxlength"))
            .test("is-unique", tValid("description.name.unique"), (name) => {
                if (name === undefined) return true;
                return !communityNames.includes(name.trim());
            })
            .required(tValid("description.name.mandatory")),
    });

    const form = useForm<{ name: string }>({
        resolver: yupResolver(schema),
        mode: "onSubmit",
    });

    const {
        register,
        reset,
        formState: { errors },
        getValues: getFormValues,
        handleSubmit,
    } = form;

    const onSubmit = () => {
        onAdd(getFormValues("name"));
        CreateCommunityDialogModal.close();
        reset({ name: "" });
    };

    return (
        <>
            {createPortal(
                <CreateCommunityDialogModal.Component
                    title={t("title")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            doClosesModal: false,
                            onClick: () => {
                                CreateCommunityDialogModal.close();
                            },
                            priority: "secondary",
                        },
                        {
                            children: tCommon("add"),
                            doClosesModal: false,
                            onClick: handleSubmit(onSubmit),
                            priority: "primary",
                        },
                    ]}
                >
                    <div>
                        <Input
                            label={t("name")}
                            hintText={t("name_hint")}
                            state={errors.name ? "error" : "default"}
                            stateRelatedMessage={errors?.name?.message}
                            nativeInputProps={{
                                ...register("name"),
                            }}
                        />
                    </div>
                </CreateCommunityDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { CreateCommunityDialog, CreateCommunityDialogModal };
