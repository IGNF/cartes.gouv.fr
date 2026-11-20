import { fr } from "@codegouvfr/react-dsfr";
import Table, { type TableProps } from "@codegouvfr/react-dsfr/Table";
import { tss } from "tss-react";

type CardRowsTableProps = Omit<TableProps, "fixed"> & {
    /** largeur de chaque colonne, undefined : partage de l’espace restant */
    columnWidths?: (string | undefined)[];
};

// tableau de la maquette : en-tête bleu, lignes en cartes blanches sur fond gris, première colonne tronquée
export default function CardRowsTable({ columnWidths, className, ...tableProps }: CardRowsTableProps) {
    const { classes, cx } = useStyles({ columnWidths: columnWidths ?? NO_WIDTHS });

    return <Table {...tableProps} fixed className={cx(classes.root, className)} />;
}

const NO_WIDTHS: (string | undefined)[] = [];
const FLEXIBLE_COLUMN_MIN_WIDTH = "15rem";
const blue = fr.colors.decisions.background.actionLow.blueFrance.default;

const useStyles = tss
    .withName({ CardRowsTable })
    .withParams<{ columnWidths: (string | undefined)[] }>()
    .create(({ columnWidths }) => ({
        root: {
            // la mise en page fixe retire le défilement DSFR : le tableau défile dans son conteneur
            "&.fr-table": {
                overflowX: "auto",
            },
            "&.fr-table > table": {
                borderCollapse: "separate",
                borderSpacing: `0 ${fr.spacing("1w")}`,
                paddingInline: fr.spacing("1w"),
                backgroundColor: fr.colors.decisions.background.alt.grey.default,
                // masque l’espacement au-dessus de l’en-tête et celui ajouté sous le corps remonté
                clipPath: `inset(${fr.spacing("1w")} 0 ${fr.spacing("1w")} 0 round 0.25rem)`,
                // les colonnes sans largeur gardent de la place : le tableau défile au lieu de les écraser
                ...(columnWidths.length > 0 && {
                    minWidth: `calc(${columnWidths.map((width) => width ?? FLEXIBLE_COLUMN_MIN_WIDTH).join(" + ")} + 2 * ${fr.spacing("1w")})`,
                }),
            },
            // Chrome double l’espacement entre l’en-tête et le corps
            "&.fr-table > table tbody": {
                position: "relative",
                top: `-${fr.spacing("1w")}`,
            },
            "&.fr-table > table thead, &.fr-table > table tbody, &.fr-table > table tbody tr": {
                backgroundColor: "transparent",
                backgroundImage: "none",
            },
            "&.fr-table > table thead::after, &.fr-table > table tbody::after": {
                display: "none",
            },
            "&.fr-table > table th, &.fr-table > table td": {
                padding: fr.spacing("2w"),
                fontSize: "1rem",
                whiteSpace: "nowrap",
                backgroundImage: "none",
            },
            "&.fr-table > table th:not(:first-of-type), &.fr-table > table td:not(:first-of-type)": {
                textAlign: "center",
            },
            "&.fr-table > table thead th": {
                fontWeight: 500,
                backgroundColor: blue,
            },
            // l’en-tête couvre aussi la marge latérale grise
            "&.fr-table > table thead th:first-of-type": {
                boxShadow: `-${fr.spacing("1w")} 0 0 ${blue}`,
            },
            "&.fr-table > table thead th:last-of-type": {
                boxShadow: `${fr.spacing("1w")} 0 0 ${blue}`,
            },
            ...Object.fromEntries(
                columnWidths.map((width, index) => [`&.fr-table > table thead th:nth-of-type(${index + 1})`, width === undefined ? {} : { width }])
            ),
            "&.fr-table > table tbody td": {
                backgroundColor: fr.colors.decisions.background.default.grey.default,
            },
            "&.fr-table > table tbody td:first-of-type": {
                overflow: "hidden",
                textOverflow: "ellipsis",
                borderRadius: "0.25rem 0 0 0.25rem",
            },
            "&.fr-table > table tbody td:last-of-type": {
                borderRadius: "0 0.25rem 0.25rem 0",
            },
        },
    }));
