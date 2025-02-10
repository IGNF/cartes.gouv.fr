import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { OpenWithEmailType } from "../../../../../@types/app_espaceco";
import { GridDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import GridList from "../GridList";

const OpenWithEmailsConfigDialogModal = createModal({
    id: "open-with-email-modal",
    isOpenedByDefault: false,
});

type OpenWithEmailsConfigDialogProps = {
    openWithEmailOriginal: OpenWithEmailType[];
    onUpdate: (openWithEmail: OpenWithEmailType[]) => void;
};

const domainRegex = new RegExp(/^@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

const OpenWithEmailsConfigDialog: FC<OpenWithEmailsConfigDialogProps> = ({ openWithEmailOriginal, onUpdate }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tmc } = useTranslation("ManageCommunity");

    const addDomainRef = useRef<HTMLInputElement>(null);
    const domains = useMemo(() => Array.from(openWithEmailOriginal, (owe) => owe.email), [openWithEmailOriginal]);

    const schema = yup.object({
        openWithEmail: yup
            .array()
            .of(
                yup
                    .object({
                        email: yup.string().required(),
                        grids: yup
                            .array()
                            .of(
                                yup
                                    .object({
                                        name: yup.string().required(),
                                        title: yup.string().required(),
                                        type: yup
                                            .object({
                                                name: yup.string().required(),
                                                title: yup.string().required(),
                                            })
                                            .required(),
                                        deleted: yup.boolean().required(),
                                        extent: yup.array().of(yup.number().required()),
                                    })
                                    .required()
                            )
                            .test({
                                name: "not_empty",
                                test: (value, context) => {
                                    const { email } = context.parent;
                                    if (value && value.length === 0) {
                                        return context.createError({ message: tmc("modal.openwithemail.grids_not_empty_error", { domain: email }) });
                                    }
                                    return true;
                                },
                            })
                            .required(),
                    })
                    .required()
            )
            .min(1, tmc("modal.openwithemail.min_error"))
            .required(),
    });

    const form = useForm<{ openWithEmail: OpenWithEmailType[] }>({
        resolver: yupResolver(schema),
        mode: "onSubmit",
        values: {
            openWithEmail: [...openWithEmailOriginal],
        },
    });

    const {
        control,
        formState: { errors },
        watch,
        getValues: getFormValues,
        setValue: setFormValue,
        handleSubmit,
        clearErrors,
    } = form;

    const openWithEmail = watch("openWithEmail");
    console.log(errors);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!addDomainRef.current) {
            return;
        }

        if (e.key !== "Enter") {
            return;
        }

        const domain = addDomainRef.current.value;
        if (domain && domainRegex.test(domain) && !domains.includes(domain)) {
            const values = [...openWithEmail];
            values.unshift({ email: domain, grids: [] });
            setFormValue("openWithEmail", values);
        }
        addDomainRef.current.value = "";
    };

    const handleGrids = (email: string, grids: GridDTO[]) => {
        const values = openWithEmail.map((owe) => {
            const v = { ...owe };
            if (v.email === email) {
                v.grids = [...grids];
            }
            return v;
        });
        setFormValue("openWithEmail", values);
    };

    const handleRemoveEmail = (email: string) => {
        setFormValue(
            "openWithEmail",
            openWithEmail.filter((owe) => owe.email !== email)
        );
    };

    const onSubmit = () => {
        OpenWithEmailsConfigDialogModal.close();

        const values = getFormValues("openWithEmail");
        onUpdate(values);
    };
    return (
        <>
            {createPortal(
                <OpenWithEmailsConfigDialogModal.Component
                    title={tmc("modal.openwithemail.title")}
                    size={"large"}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            doClosesModal: false,
                            priority: "secondary",
                            onClick: () => {
                                clearErrors();
                                OpenWithEmailsConfigDialogModal.close();
                            },
                        },
                        {
                            children: tCommon("apply"),
                            doClosesModal: false,
                            onClick: () => {
                                handleSubmit(onSubmit)();
                            },
                            priority: "primary",
                        },
                    ]}
                >
                    <Controller
                        control={control}
                        name="openWithEmail"
                        render={({ fieldState }) => (
                            <div className={fr.cx("fr-input-group", "fr-my-6v", fieldState.error && "fr-input-group--error")}>
                                <Input
                                    label={tmc("modal.openwithemail.add_domain")}
                                    nativeInputProps={{
                                        ref: addDomainRef,
                                        onKeyDown: (e) => handleKeyDown(e),
                                    }}
                                />
                                {fieldState.error && <p className={fr.cx("fr-error-text")}>{fieldState.error?.message?.toString()}</p>}
                                {openWithEmail.map((owe, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-p-2v", "fr-my-2v")}
                                            style={{
                                                border: "solid 1.5px",
                                                borderColor: fr.colors.decisions.border.default.blueFrance.default,
                                            }}
                                        >
                                            <div className={fr.cx("fr-col-2")}>
                                                <strong>{owe.email}</strong>
                                            </div>
                                            <div
                                                className={fr.cx(
                                                    "fr-col-9",
                                                    "fr-input-group",
                                                    errors.openWithEmail?.[index]?.grids ? "fr-input-group--error" : undefined
                                                )}
                                            >
                                                {errors.openWithEmail?.[index]?.grids && (
                                                    <p className={fr.cx("fr-error-text")}>{errors.openWithEmail?.[index]?.grids.message?.toString()}</p>
                                                )}
                                                <GridList grids={owe.grids} onChange={(grids) => handleGrids(owe.email, grids)} />
                                            </div>
                                            <Button
                                                title={tmc("desc.logo.remove")}
                                                iconId="fr-icon-delete-line"
                                                priority="tertiary no outline"
                                                onClick={() => handleRemoveEmail(owe.email)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    />
                </OpenWithEmailsConfigDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { OpenWithEmailsConfigDialog, OpenWithEmailsConfigDialogModal };
