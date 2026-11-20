import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useMutation } from "@tanstack/react-query";
import { useId, useRef } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { tss } from "tss-react";

import api from "@/entrepot/api";
import { useTranslation } from "@/i18n";
import { saveBlob } from "@/utils/browser";
import { type ServiceFormValues } from "../serviceFormSchema";

type StylesSectionProps = {
    /** modification : entrepôt du flux, pour télécharger le style enregistré d’une table */
    datastoreId?: string;
};

/** un fichier SLD par table cochée (WMS vecteur) ; l’éditeur de styles viendra avec #1139 */
export default function StylesSection({ datastoreId }: StylesSectionProps) {
    const { t } = useTranslation("ServiceForm");
    const { control } = useFormContext<ServiceFormValues>();
    const tables = useWatch({ control, name: "tables" });
    const { classes } = useStyles();

    if (!tables.some((table) => table.selected)) {
        return <p className={fr.cx("fr-text--sm")}>{t("styles.no_table")}</p>;
    }

    return (
        <div>
            <p className={fr.cx("fr-label", "fr-mb-1w")}>
                {t("styles.label")}
                <span className={fr.cx("fr-hint-text")}>{t("styles.hint")}</span>
            </p>
            <ul className={classes.rows}>
                {tables.map((table, index) =>
                    table.selected ? (
                        <StyleRow
                            key={table.native_name}
                            index={index}
                            tableName={table.native_name}
                            savedStyle={datastoreId && table.saved_style_id ? { datastoreId, staticId: table.saved_style_id } : undefined}
                        />
                    ) : null
                )}
            </ul>
        </div>
    );
}

type StyleRowProps = {
    index: number;
    tableName: string;
    /** style enregistré, gardé tant qu’aucun nouveau fichier n’est choisi */
    savedStyle?: { datastoreId: string; staticId: string };
};

function StyleRow({ index, tableName, savedStyle }: StyleRowProps) {
    const { t } = useTranslation("ServiceForm");
    const { control } = useFormContext<ServiceFormValues>();
    const { classes } = useStyles();
    const inputRef = useRef<HTMLInputElement>(null);
    const browseRef = useRef<HTMLButtonElement | null>(null);
    const id = useId();
    const download = useMutation({
        mutationFn: async ({ datastoreId, staticId }: { datastoreId: string; staticId: string }) => {
            const sld = await api.statics.download(datastoreId, staticId);
            await saveBlob(new Blob([sld], { type: "application/xml" }), { fileName: `${tableName}.sld`, mimeType: "application/xml", extension: ".sld" });
        },
    });
    // le formulaire revalide au blur après un premier envoi : un choix de fichier vaut un blur
    const setFile = (onChange: (file: File | undefined) => void, onBlur: () => void, file: File | undefined) => {
        onChange(file);
        onBlur();
    };

    return (
        <Controller
            control={control}
            name={`tables.${index}.style`}
            render={({ field, fieldState: { error } }) => (
                <li className={classes.row}>
                    <span id={`${id}-table`}>{tableName}</span>
                    <span id={`${id}-file`} className={fr.cx(field.value && "fr-text--bold")}>
                        {field.value?.name ?? (savedStyle ? t("styles.current") : t("styles.no_file"))}
                        {!field.value && savedStyle && (
                            <Button
                                type="button"
                                size="small"
                                priority="tertiary no outline"
                                iconId="fr-icon-download-line"
                                className={fr.cx("fr-ml-1w")}
                                title={t("styles.download", { table: tableName })}
                                disabled={download.isPending}
                                onClick={() => download.mutate(savedStyle)}
                            />
                        )}
                    </span>
                    <span className={classes.actions}>
                        <Button
                            ref={(button: HTMLButtonElement | null) => {
                                field.ref(button);
                                browseRef.current = button;
                            }}
                            type="button"
                            size="small"
                            priority={field.value ? "tertiary" : "secondary"}
                            nativeButtonProps={{ "aria-describedby": `${id}-table ${id}-file${error ? ` ${id}-error` : ""}` }}
                            onClick={() => inputRef.current?.click()}
                        >
                            {field.value ? t("styles.change") : t("styles.browse")}
                        </Button>
                        {field.value && (
                            <Button
                                type="button"
                                size="small"
                                priority="tertiary no outline"
                                iconId="fr-icon-close-line"
                                title={t("styles.remove", { table: tableName })}
                                onClick={() => {
                                    setFile(field.onChange, field.onBlur, undefined);
                                    // le bouton cliqué disparaît : le focus revient sur « Parcourir… »
                                    browseRef.current?.focus();
                                }}
                            />
                        )}
                    </span>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".sld"
                        hidden
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            // vidé pour qu’un même fichier choisi à nouveau déclenche encore onChange
                            e.target.value = "";
                            if (file) setFile(field.onChange, field.onBlur, file);
                        }}
                    />
                    {error && (
                        <p id={`${id}-error`} className={fr.cx("fr-error-text", "fr-mt-0")}>
                            {error.message}
                        </p>
                    )}
                    {download.isError && <p className={fr.cx("fr-error-text", "fr-mt-0")}>{t("styles.download_error")}</p>}
                </li>
            )}
        />
    );
}

const useStyles = tss.withName({ StylesSection }).create({
    rows: {
        listStyle: "none",
        margin: 0,
        padding: 0,
    },
    row: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 2fr) auto",
        alignItems: "center",
        gap: fr.spacing("2w"),
        padding: `${fr.spacing("1w")} ${fr.spacing("1w")}`,
        borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
        overflowWrap: "anywhere",
        "& > p": { gridColumn: "1 / -1" },
    },
    actions: {
        display: "flex",
        gap: fr.spacing("1w"),
        justifyContent: "flex-end",
    },
});
