import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { useStyles } from "tss-react";

import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import ImageFieldUpload from "@/components/Input/ImageFieldUpload";
import { useTranslation } from "@/i18n/i18n";
import { MetadataFormValues } from "../metadataSchema";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Select from "@codegouvfr/react-dsfr/SelectNext";

const emptyProducer = { organizationName: "", organizationEmail: "", role: "contact" };

export default function ProducerSection() {
    const { t } = useTranslation("DatasheetSections");
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<Partial<MetadataFormValues>>();

    const { fields, append, remove } = useFieldArray({ control, name: "producers" });

    const { css, cx } = useStyles();

    return (
        <>
            <div
                className={css({
                    ["& > section"]: {
                        padding: `${fr.spacing("6v")} 0 !important`,
                        [fr.breakpoints.up("md")]: {
                            padding: `${fr.spacing("10v")} 0 !important`,
                        },
                    },
                    ["& > section:not(:last-child)"]: {
                        borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
                    },

                    ["& > section:first-child"]: {
                        paddingTop: "0 !important",
                    },
                })}
            >
                {fields.map((field, index) => {
                    const fieldErrors = errors.producers?.[index];

                    return (
                        <section
                            key={field.id}
                            // className={fr.cx("fr-p-3w", "fr-mb-3w")}
                            // style={{ border: `1px solid ${fr.colors.decisions.border.default.grey.default}` }}
                        >
                            <div
                                className={css({
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: fr.spacing("4v"),
                                    gap: fr.spacing("4v"),
                                })}
                            >
                                <div
                                    className={css({
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: fr.spacing("4v"),
                                    })}
                                >
                                    <p
                                        className={cx(
                                            fr.cx("fr-text--xs", "fr-m-0"),
                                            css({
                                                color: fr.colors.decisions.text.mention.grey.default,
                                            })
                                        )}
                                    >
                                        {t("producer.card.title")} {index + 1}
                                    </p>
                                    {field.role && <Tag small>{field.role}</Tag>} {/* mettre à jour avec la valeur choisie */}
                                </div>
                                {fields.length > 1 && (
                                    <Button
                                        iconId="fr-icon-delete-line"
                                        priority="tertiary no outline"
                                        type="button"
                                        onClick={() => remove(index)}
                                        size="small"
                                    >
                                        {t("producer.remove")}
                                    </Button>
                                )}
                            </div>

                            <Controller
                                control={control}
                                name={`producers.${index}.organizationName`}
                                render={({ field: f, fieldState: { error } }) => (
                                    <AutocompleteSelect
                                        label={t("field.organizationName")}
                                        hintText={t("field.organizationName.hint")}
                                        options={[]}
                                        freeSolo
                                        multiple={false}
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error?.message}
                                        value={f.value ?? ""}
                                        onChange={(_, value) => f.onChange(value ?? "")}
                                        onBlur={f.onBlur}
                                    />
                                )}
                            />

                            <Select
                                label={t("field.producerRole")}
                                options={["contact", "producteur principal", "producteur secondaire", "autre"].map((role) => ({ value: role, label: role }))}
                                nativeSelectProps={{
                                    ...register(`producers.${index}.role`),
                                }}
                                state={fieldErrors?.role ? "error" : "default"}
                                stateRelatedMessage={fieldErrors?.role?.message}
                            />

                            <ImageFieldUpload
                                name={`producers.${index}.logoFile`}
                                label={t("field.logo")}
                                hintText={t("field.logo.hint")}
                                accept=".jpg, .jpeg, .svg"
                            />

                            <Input
                                label={t("field.organizationEmail")}
                                hintText={t("field.organizationEmail.hint")}
                                state={fieldErrors?.organizationEmail ? "error" : "default"}
                                stateRelatedMessage={fieldErrors?.organizationEmail?.message}
                                nativeInputProps={{ ...register(`producers.${index}.organizationEmail`) }}
                            />

                            <p className={fr.cx("fr-label", "fr-mt-2w")}>{t("field.address")}</p>
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                                <div className={fr.cx("fr-col-12", "fr-col-md-3", "fr-col-lg-2")}>
                                    <Input label={t("field.address.number")} nativeInputProps={{ ...register(`producers.${index}.addressNumber`) }} />
                                </div>
                                <div className={fr.cx("fr-col-12", "fr-col-md-9", "fr-col-lg-4")}>
                                    <Input label={t("field.address.street")} nativeInputProps={{ ...register(`producers.${index}.addressStreet`) }} />
                                </div>
                                <div className={fr.cx("fr-col-12", "fr-col-md-4", "fr-col-lg-2")}>
                                    <Input label={t("field.address.postalCode")} nativeInputProps={{ ...register(`producers.${index}.addressPostalCode`) }} />
                                </div>
                                <div className={fr.cx("fr-col-12", "fr-col-md-8", "fr-col-lg-4")}>
                                    <Input label={t("field.address.city")} nativeInputProps={{ ...register(`producers.${index}.addressCity`) }} />
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>
            <Button iconId="fr-icon-add-line" priority="tertiary" type="button" onClick={() => append(emptyProducer)}>
                {t("producer.add")}
            </Button>
        </>
    );
}
