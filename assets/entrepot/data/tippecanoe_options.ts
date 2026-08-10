import simplify_forms_merged from "@/img/tippecanoe/simplify_forms_merged.jpg";
import keep_nodes_merged from "@/img/tippecanoe/keep_nodes_merged.jpg";
import delete_smallest_merged from "@/img/tippecanoe/delete_smallest_merged.jpg";
import keep_cover_merged from "@/img/tippecanoe/keep_cover_merged.jpg";
import keep_densest_delete_smallest_merged from "@/img/tippecanoe/keep_densest_delete_smallest_merged.jpg";
import merge_same_attributes_and_simplify_merged from "@/img/tippecanoe/merge_same_attributes_and_simplify_merged.jpg";
import keep_shared_edges_merged from "@/img/tippecanoe/keep_shared_edges_merged.jpg";

export default {
    "--simplification=10": {
        value: "-S10",
        label: "Simplification de données hétérogènes",
        explain: "Toutes les formes sont simplifiées.",
        image: simplify_forms_merged, // ou (await import("@/img/tippecanoe/simplify_forms_merged.jpg")).default
    },
    "--no-simplification-of-shared-nodes --simplification=15": {
        value: "-pn -S15",
        label: "Simplification de réseau",
        explain: "Toutes les formes sont simplifiées et les nœuds du réseau sont conservés.",
        image: keep_nodes_merged,
    },
    "--drop-smallest-as-needed --simplification=15 ": {
        value: "-an -S15",
        label: "Simplification de données linéaires autres",
        explain: "Les petits objets sont supprimés.",
        image: delete_smallest_merged,
    },
    "--grid-low-zooms -D8 --simplification=15": {
        value: "-aL -D8 -S15",
        label: "Schématisation de données surfaciques",
        explain: "Les formes sont simplifiées en conservant une couverture du territoire.",
        image: keep_cover_merged,
    },
    "--coalesce --coalesce-densest-as-needed --drop-smallest-as-needed --simplification=15": {
        value: "-ac -aD -an -S15",
        label: "Sélection de données surfaciques",
        explain:
            "Les données les plus représentatives sont conservées et les plus petites supprimées. Ce choix est pertinent si 3 attributs ou moins sont conservés à l'étape précédente.",
        image: keep_densest_delete_smallest_merged,
    },
    "--coalesce --drop-smallest-as-needed --simplification=10": {
        value: "-ac -an -S10 ",
        label: "Fusion attributaire de données surfaciques",
        explain:
            "Les objets qui ont les mêmes valeurs d’attribut sont fusionnés tout en simplifiant les formes et en supprimant les petites surfaces. Ce choix est pertinent si 3 attributs ou moins sont conservés à l'étape précédente.",
        image: merge_same_attributes_and_simplify_merged,
    },
    "--detect-shared-borders --simplification=20": {
        value: "-ab -S20",
        label: "Harmonisation de données surfaciques",
        explain: "Les formes sont simplifiées en conservant les limites partagées entre deux surfaces.",
        image: keep_shared_edges_merged,
    },
};
