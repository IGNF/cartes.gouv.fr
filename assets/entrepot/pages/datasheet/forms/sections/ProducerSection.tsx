import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useStyles } from "tss-react";

import AddressFields from "@/components/Input/AddressFields";
import AsyncAutocompleteSelect from "@/components/Input/AsyncAutocompleteSelect";
import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import ImageFieldUpload from "@/components/Input/ImageFieldUpload";
import api from "@/entrepot/api";
import type { GeocodingAddress } from "@/entrepot/api/geocoding";
import { useTranslation } from "@/i18n/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { delta } from "@/utils";
import { MetadataFormValues, PRODUCER_ROLES, type ProducerRole } from "../metadataSchema";

// Rôles sélectionnables pour les cartes additionnelles (index >= 1) - pointOfContact est réservé à la 1ère carte.
const SELECTABLE_ROLES = PRODUCER_ROLES.filter((role) => role !== "pointOfContact") as ProducerRole[];

/** Formats acceptés pour le logo producteur */
const LOGO_ACCEPT = ["jpg", "jpeg", "png", "svg"] as const;

// Nouveau producteur : rôle vide pour forcer un choix (validation .oneOf pour les index >= 1).
const emptyProducer = { organization_name: "", organization_email: "", role: "" as ProducerRole };

// ---------------------------------------------------------------------------
// Sous-composant : tag de rôle en direct (useWatch pour ne pas utiliser le snapshot figé de useFieldArray)
// ---------------------------------------------------------------------------

interface ProducerRoleTagProps {
    index: number;
}

function ProducerRoleTag({ index }: ProducerRoleTagProps) {
    const { t } = useTranslation("DatasheetSections");
    const { control } = useFormContext<Partial<MetadataFormValues>>();
    const role = useWatch({ control, name: `producers.${index}.role` }) as ProducerRole | undefined;

    // Rôle non encore choisi → pas de tag
    if (!role) return null;
    return <Tag small>{t("producer.role", { role })}</Tag>;
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export default function ProducerSection() {
    const { t } = useTranslation("DatasheetSections");
    const {
        register,
        control,
        setValue,
        formState: { errors },
    } = useFormContext<Partial<MetadataFormValues>>();

    const { fields, append, remove } = useFieldArray({ control, name: "producers" });

    const { css } = useStyles();

    const { data: organizations } = useQuery({
        queryKey: RQKeys.catalogs_organizations(),
        queryFn: ({ signal }) => api.catalogs.getAllOrganizations({ signal }),
        staleTime: delta.hours(10),
    });

    const organizationsOptions = useMemo(() => {
        if (!organizations) return [];
        return organizations.map((org) => org.name.trim()).toSorted();
    }, [organizations]);

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
                    ["& > section:first-of-type"]: {
                        paddingTop: "0 !important",
                    },
                })}
            >
                {fields.map((field, index) => {
                    const fieldErrors = errors.producers?.[index];
                    // La 1ère carte est toujours le contact (pointOfContact) - verrouillée, non supprimable.
                    const isContact = index === 0;

                    return (
                        <section key={field.id}>
                            {/* En-tête de carte : mention + tag de rôle + bouton supprimer */}
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
                                    <p className={fr.cx("fr-text--xs", "fr-m-0")} style={{ color: fr.colors.decisions.text.mention.grey.default }}>
                                        {/* Figma : « Producteur » sans numéro pour la 1ère carte, « Producteur N » pour les suivantes */}
                                        {isContact ? t("producer.card.title") : `${t("producer.card.title")} ${index + 1}`}
                                    </p>
                                    {/* Carte contact : tag statique ; autres cartes : tag live via useWatch */}
                                    {isContact ? <Tag small>{t("producer.role", { role: "pointOfContact" })}</Tag> : <ProducerRoleTag index={index} />}
                                </div>
                                {/* Bouton supprimer : uniquement sur les cartes additionnelles */}
                                {!isContact && (
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

                            {/* Hint custodian : uniquement sur la carte contact (index 0) */}
                            {isContact && <p className={fr.cx("fr-hint-text", "fr-mb-3v")}>{t("producer.custodianHint")}</p>}

                            {/* Nom de l'organisme (auto-complétion ou saisie libre) */}
                            <Controller
                                control={control}
                                name={`producers.${index}.organization_name`}
                                render={({ field: f, fieldState: { error } }) => (
                                    <AutocompleteSelect
                                        label={t("field.organizationName")}
                                        hintText={t("field.organizationName.hint")}
                                        options={organizationsOptions}
                                        searchFilter={{
                                            limit: undefined,
                                        }}
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

                            {/* Select de rôle : uniquement pour les cartes additionnelles (index >= 1) */}
                            {!isContact && (
                                <Select
                                    label={t("field.producerRole")}
                                    placeholder={t("producer.role.placeholder")}
                                    options={SELECTABLE_ROLES.map((role) => ({
                                        value: role,
                                        label: t("producer.role", { role }),
                                    }))}
                                    nativeSelectProps={{
                                        ...register(`producers.${index}.role`),
                                    }}
                                    state={fieldErrors?.role ? "error" : "default"}
                                    stateRelatedMessage={fieldErrors?.role?.message}
                                />
                            )}

                            <ImageFieldUpload
                                name={`producers.${index}.logo_file`}
                                label={t("field.logo")}
                                hintText={t("field.logo.hint")}
                                modalTitle={t("field.logo.modalTitle")}
                                accept={[...LOGO_ACCEPT]}
                            />

                            <Input
                                label={t("field.organizationEmail")}
                                hintText={t("field.organizationEmail.hint")}
                                state={fieldErrors?.organization_email ? "error" : "default"}
                                stateRelatedMessage={fieldErrors?.organization_email?.message}
                                nativeInputProps={{ ...register(`producers.${index}.organization_email`) }}
                            />

                            {/* Adresse postale (optionnel) : champ numéro+voie en autocomplétion + code postal + ville */}
                            <AddressFields
                                legend={t("field.address")}
                                numberAndStreetnameSlot={
                                    <Controller
                                        control={control}
                                        name={`producers.${index}.address_number_and_streetname`}
                                        render={({ field: f, fieldState: { error } }) => (
                                            <AsyncAutocompleteSelect<GeocodingAddress, false, false, true>
                                                label={t("field.numberAndStreetname")}
                                                freeSolo
                                                queryKey={(s) => RQKeys.search_addresses(s)}
                                                queryFn={(s, signal) => api.geocoding.searchAddresses(s, signal)}
                                                inputValue={f.value ?? ""}
                                                onInputChange={(_, value) => f.onChange(value)}
                                                getOptionLabel={(option) =>
                                                    typeof option === "string" ? option : [option.number, option.street].filter(Boolean).join(" ")
                                                }
                                                renderOption={(props, option) => (
                                                    <li {...props} key={option.label}>
                                                        {option.label}
                                                    </li>
                                                )}
                                                isOptionEqualToValue={(option, value) =>
                                                    typeof option !== "string" && typeof value !== "string" && option.label === value.label
                                                }
                                                onChange={(_, value) => {
                                                    // freeSolo : MUI peut renvoyer une string (texte libre) ou null → pas d'auto-remplissage
                                                    if (!value || typeof value === "string") return;
                                                    // Option sélectionnée → remplir code postal et ville
                                                    const opts = { shouldValidate: true, shouldDirty: true } as const;
                                                    setValue(`producers.${index}.address_postal_code`, value.postalCode, opts);
                                                    setValue(`producers.${index}.address_city`, value.city, opts);
                                                }}
                                                state={error ? "error" : "default"}
                                                stateRelatedMessage={error?.message}
                                                popupIcon={<span className={fr.cx("fr-icon-search-line", "fr-icon--sm")} />}
                                            />
                                        )}
                                    />
                                }
                                postalCodeInputProps={{
                                    state: fieldErrors?.address_postal_code ? "error" : "default",
                                    stateRelatedMessage: fieldErrors?.address_postal_code?.message,
                                    nativeInputProps: register(`producers.${index}.address_postal_code`),
                                }}
                                cityInputProps={{
                                    state: fieldErrors?.address_city ? "error" : "default",
                                    stateRelatedMessage: fieldErrors?.address_city?.message,
                                    nativeInputProps: register(`producers.${index}.address_city`),
                                }}
                            />
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
