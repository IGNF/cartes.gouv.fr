import { declareComponentKeys } from "../../../../../i18n/i18n";
import { Translations } from "../../../../../i18n/types";

// traductions
const { i18n } = declareComponentKeys<
    | "title"
    | { K: "explain"; R: JSX.Element }
    | "main_grids"
    | "user_grids"
    | "main_grids_explain"
    | "no_main_grids"
    | "add_grids"
    | "num_header"
    | "title_header"
    | "type_header"
>()("ManageGridsDialog");
export type I18n = typeof i18n;

export const ManageGridsDialogFrTranslations: Translations<"fr">["ManageGridsDialog"] = {
    title: "Gérer les emprises individuelles du membre",
    explain: (
        <p>
            <span>
                <strong>Attention: </strong>Un utilisateur qui n’a aucune emprise géographique ne pourra faire que des signalements et aucune contribution
                directe.
            </span>
        </p>
    ),
    main_grids: "Emprises générales du guichet",
    user_grids: "Emprises individuelles du membre",
    main_grids_explain: "Tous les membres du guichet héritent des emprises du guichet. Elles ne peuvent pas être supprimées.",
    no_main_grids: "Aucune",
    add_grids: "Ajouter les emprises individuelles",
    num_header: "Numéro",
    title_header: "Nom",
    type_header: "Type",
};

export const ManageGridsDialogEnTranslations: Translations<"en">["ManageGridsDialog"] = {
    title: undefined,
    explain: undefined,
    main_grids: undefined,
    user_grids: undefined,
    main_grids_explain: undefined,
    no_main_grids: "None",
    add_grids: "Add individual grids",
    num_header: undefined,
    title_header: undefined,
    type_header: undefined,
};
