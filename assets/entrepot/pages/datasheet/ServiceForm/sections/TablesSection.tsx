import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import { useEffect, useMemo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { type StoredDataRelation } from "@/@types/app";
import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import { filterGeometricRelations } from "@/helpers";
import { getInspireKeywords } from "@/utils/metadata";
import { type ServiceFormValues, type ServiceTableFormValues } from "../serviceFormSchema";

const inspireKeywords = getInspireKeywords();

type TablesSectionProps = {
    /** tables de la base vecteur sélectionnée, undefined tant qu’elle n’est pas chargée */
    relations?: StoredDataRelation[];
    isLoading?: boolean;
    /** titre, nom technique, résumé et mots-clés par table cochée (WFS) */
    detailed?: boolean;
};

export default function TablesSection({ relations, isLoading = false, detailed = false }: TablesSectionProps) {
    const {
        register,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext<ServiceFormValues>();

    const geometricRelations = useMemo(() => filterGeometricRelations(relations ?? [], true), [relations]);

    // une ligne de formulaire par table géométrique de la base choisie ; les saisies déjà faites sont conservées
    useEffect(() => {
        const previous = new Map(getValues("tables").map((table) => [table.native_name, table]));
        const tables: ServiceTableFormValues[] = geometricRelations.map(
            (relation) =>
                previous.get(relation.name) ?? {
                    native_name: relation.name,
                    selected: false,
                    title: relation.name,
                    public_name: relation.name.toLowerCase(),
                    description: "",
                    keywords: [],
                }
        );
        setValue("tables", tables);
    }, [geometricRelations, getValues, setValue]);

    const tables = useWatch({ control, name: "tables" }) ?? [];
    const tablesError = errors.tables?.root?.message ?? errors.tables?.message;

    if (isLoading) {
        return <p className={fr.cx("fr-text--sm")}>Chargement des tables…</p>;
    }

    if (geometricRelations.length === 0) {
        return <p className={fr.cx("fr-text--sm")}>Sélectionnez d’abord un jeu de données vecteur pour choisir ses tables.</p>;
    }

    return (
        <div>
            <Checkbox
                legend="Tables à publier"
                hintText="Par défaut aucune table n’est cochée."
                state={tablesError ? "error" : "default"}
                stateRelatedMessage={tablesError}
                options={tables.map((table, index) => ({
                    label: table.native_name,
                    nativeInputProps: { ...register(`tables.${index}.selected`) },
                }))}
            />

            {tables.map((table, index) =>
                detailed && table.selected ? (
                    <fieldset key={table.native_name} className={fr.cx("fr-fieldset", "fr-mb-4w")}>
                        <legend className={fr.cx("fr-fieldset__legend", "fr-text--bold")}>{table.native_name}</legend>
                        <div className={fr.cx("fr-fieldset__element")}>
                            <Input
                                label="Titre de la table"
                                hintText="Le titre de la table doit être facilement lisible par les utilisateurs. Il peut contenir des espaces et des caractères spéciaux."
                                state={errors.tables?.[index]?.title ? "error" : "default"}
                                stateRelatedMessage={errors.tables?.[index]?.title?.message}
                                nativeInputProps={{ ...register(`tables.${index}.title`) }}
                            />
                            <Input
                                label="Nom technique de la table"
                                hintText="Le nom technique de la table ne doit pas contenir d’espace ni de caractères spéciaux et doit être unique. Il permet d’identifier la table dans les services qui utiliseront le flux."
                                state={errors.tables?.[index]?.public_name ? "error" : "default"}
                                stateRelatedMessage={errors.tables?.[index]?.public_name?.message}
                                nativeInputProps={{ ...register(`tables.${index}.public_name`) }}
                            />
                            <Input
                                label="Résumé du contenu de la table"
                                textArea
                                state={errors.tables?.[index]?.description ? "error" : "default"}
                                stateRelatedMessage={errors.tables?.[index]?.description?.message}
                                nativeTextAreaProps={{ ...register(`tables.${index}.description`), rows: 3 }}
                            />
                            <Controller
                                control={control}
                                name={`tables.${index}.keywords`}
                                render={({ field, fieldState: { error } }) => (
                                    <AutocompleteSelect
                                        label="Mot-clés (optionnels)"
                                        hintText="Utilisez l’auto-complétion ou saisissez librement des mots-clés en appuyant sur Entrée après chaque mot."
                                        options={inspireKeywords}
                                        searchFilter={{ limit: undefined }}
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error?.message}
                                        value={field.value ?? []}
                                        onChange={(_, value) => field.onChange(value)}
                                        onBlur={field.onBlur}
                                        multiple
                                        freeSolo
                                    />
                                )}
                            />
                        </div>
                    </fieldset>
                ) : null
            )}
        </div>
    );
}
