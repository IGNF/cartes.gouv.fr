import { compareAsc } from "date-fns";
import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../i18n/i18n";
import { DatastorePermissionResponseDto, PermissionBeneficiaryDto } from "../../../../@types/entrepot";
import { formatDateFromISO } from "../../../../utils";

// traductions
export const { i18n } = declareComponentKeys<
    | { K: "list.title"; P: { datastoreName?: string }; R: string }
    | "list.licence_header"
    | "list.expiration_date_header"
    | "list.granted_to_header"
    | "list.services_header"
    | "list.actions_header"
    | { K: "list.expires_on"; P: { endDate?: string }; R: string }
    | { K: "list.granted_to"; P: { beneficiary?: PermissionBeneficiaryDto }; R: string }
    | "list.no_permissions"
    | "list.add_permission"
    | "list.confirm_remove"
    | "add_form.title"
    | "add_form.licence"
    | "add_form.hint_licence"
    | "add_form.type"
    | "add_form.hint_type"
    | "add_form.communities"
    | "add_form.users"
    | "add_form.communities_list"
    | "add_form.other_communities"
    | "add_form.expiration_date"
    | "add_form.services"
    | "add_form.hint_services"
    | "add_form.no_services"
    | "add_form.only_oath"
    | "add_form.hint_only_oath"
    | { K: "edit_form.document_title"; P: { id: string }; R: string }
    | { K: "edit_form.title"; P: { permission?: DatastorePermissionResponseDto }; R: string }
    | "edit_form.licence"
    | "edit_form.hint_licence"
    | "edit_form.expiration_date"
    | "edit_form.record"
    | "validation.licence_required"
    | "validation.type_required"
    | "validation.min_beneficiaries"
    | "validation.min_offerings"
    | { K: "validation.uuid_error"; P: { value: string }; R: string }
    | "info.granted_to_title"
    | { K: "info.granted_to"; P: { beneficiary?: PermissionBeneficiaryDto }; R: string }
    | "info.oauth_required"
>()("DatastorePermissions");

const getExpiredDate = (lang: "fr" | "en", endDate?: string) => {
    if (endDate === undefined) {
        return lang === "fr" ? "Aucune" : "None";
    }

    const fmtDate = formatDateFromISO(endDate);
    if (compareAsc(new Date(endDate), new Date()) < 0) {
        return lang === "fr" ? `A expirée le ${fmtDate}` : `Expired on ${fmtDate}`;
    } else return lang === "fr" ? `Expire le ${fmtDate}` : `Expires on ${fmtDate}`;
};

const getGrantedTo = (lang: "fr" | "en", beneficiary?: PermissionBeneficiaryDto) => {
    if (beneficiary === undefined) return lang === "fr" ? "Personne" : "None";

    if ("name" in beneficiary) {
        return lang === "fr" ? `La communauté ${beneficiary.name}` : `Community ${beneficiary.name}`;
    } else {
        return lang === "fr" ? `L’utilisateur ${beneficiary.first_name} ${beneficiary.last_name}` : `User ${beneficiary.first_name} ${beneficiary.last_name}`;
    }
};

const getTitle = (lang: "fr" | "en", permission?: DatastorePermissionResponseDto) => {
    if (permission === undefined) return "";
    if (permission.beneficiary === undefined) return "";

    let title = lang === "fr" ? "Modification de la permission accordée à " : "Modification of the permission granted to";
    if ("name" in permission.beneficiary) {
        title += lang === "fr" ? `la communauté ${permission.beneficiary.name}` : `Community ${permission.beneficiary.name}`;
    } else {
        title +=
            lang === "fr"
                ? `l’utilisateur ${permission.beneficiary.first_name} ${permission.beneficiary.last_name}`
                : `user ${permission.beneficiary.first_name} ${permission.beneficiary.last_name}`;
    }
    return title;
};

export const DatastorePermissionsFrTranslations: Translations<"fr">["DatastorePermissions"] = {
    "list.title": ({ datastoreName }) => `Gérer les permissions de l’espace de travail${datastoreName ? " " + datastoreName : ""}`,
    "list.licence_header": "Licence",
    "list.expiration_date_header": "Date d’expiration",
    "list.granted_to_header": "Accordée à",
    "list.services_header": "Services",
    "list.actions_header": "Actions",
    "list.expires_on": ({ endDate }) => getExpiredDate("fr", endDate),
    "list.granted_to": ({ beneficiary }) => getGrantedTo("fr", beneficiary),
    "list.no_permissions": "Aucune permission",
    "list.add_permission": "Ajouter une permission",
    "list.confirm_remove": "Êtes-vous sûr de vouloir supprimer cette permission ?",
    "add_form.title": "Ajout d’une permission",
    "add_form.licence": "Licence",
    "add_form.hint_licence":
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis nulla praesentium corrupti error hic enim recusandae quaerat accusamus rem sed!",
    "add_form.type": "Accorder à",
    "add_form.hint_type": "L’ajout de plusieurs bénéficiaires va entrainer la création de plusieurs permissions",
    "add_form.communities": "Des communautés",
    "add_form.users": "Des utilisateurs",
    "add_form.communities_list": "Liste des communautés (publiques et auxquelles j'appartiens)",
    "add_form.other_communities": "Autres communautés",
    "add_form.expiration_date": "Date d’expiration (optionnel)",
    "add_form.services": "Services",
    "add_form.hint_services": "Sélectionner les services auxquels cette permission donne accès",
    "add_form.no_services": "Aucun service, impossible d’ajouter une permission",
    "add_form.only_oath": "Authentification forte requise",
    "add_form.hint_only_oath": "Ne permettre l’utilisation de cette permission qu'avec des clés de type OAUTH2",
    "edit_form.document_title": ({ id }) => `Mise à jour de la permission ${id}`,
    "edit_form.title": ({ permission }) => getTitle("fr", permission),
    "edit_form.licence": "Licence",
    "edit_form.hint_licence":
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis nulla praesentium corrupti error hic enim recusandae quaerat accusamus rem sed!",
    "edit_form.expiration_date": "Date d’expiration (optionnel)",
    "edit_form.record": "Enregister les modifications",
    "validation.licence_required": "La licence est obligatoire",
    "validation.type_required": "Le type est obligatoire",
    "validation.min_beneficiaries": "Il doit y avoir au moins un bénéficiaire",
    "validation.min_offerings": "Au moins un service doit être sélectionné",
    "validation.uuid_error": ({ value }) => `${value} n'est pas un UUID`,
    "info.granted_to_title": "Permission accordé à : ",
    "info.granted_to": ({ beneficiary }) => getGrantedTo("fr", beneficiary),
    "info.oauth_required": "Authentification forte requise : ",
};

export const DatastorePermissionsEnTranslations: Translations<"en">["DatastorePermissions"] = {
    "list.title": ({ datastoreName }) => `Manage workspace permissions${datastoreName ? " " + datastoreName : ""}`,
    "list.licence_header": "Licence",
    "list.expiration_date_header": "Expiration date",
    "list.granted_to_header": "Granted to",
    "list.services_header": "Services",
    "list.actions_header": "Actions",
    "list.expires_on": ({ endDate }) => getExpiredDate("en", endDate),
    "list.granted_to": ({ beneficiary }) => getGrantedTo("en", beneficiary),
    "list.no_permissions": "No permissions",
    "list.add_permission": "Add permission",
    "list.confirm_remove": "Are you sure you want to delete this permission ?",
    "add_form.title": "Add permission",
    "add_form.licence": "Licence",
    "add_form.hint_licence":
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis nulla praesentium corrupti error hic enim recusandae quaerat accusamus rem sed!",
    "add_form.type": "Granted to",
    "add_form.hint_type": "Adding several beneficiaries will result in the creation of several permissions",
    "add_form.communities": "Communities",
    "add_form.users": "Users",
    "add_form.communities_list": "List of communities (public and to which I belong)",
    "add_form.other_communities": "Other communities",
    "add_form.expiration_date": "Expiration date (optional)",
    "add_form.services": "Services",
    "add_form.hint_services": "Select the services to which this permission gives access",
    "add_form.no_services": "No service, unable to add permission",
    "add_form.only_oath": "Strong authentication required",
    "add_form.hint_only_oath": "Only allow the use of this permission with OAUTH2 type keys",
    "edit_form.document_title": ({ id }) => `Updating permission ${id}`,
    "edit_form.title": ({ permission }) => getTitle("en", permission),
    "edit_form.licence": "Licence",
    "edit_form.hint_licence":
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis nulla praesentium corrupti error hic enim recusandae quaerat accusamus rem sed!",
    "edit_form.expiration_date": "Expiration date (optional)",
    "edit_form.record": "Save changes",
    "validation.licence_required": "Licence is required",
    "validation.type_required": "Type is required",
    "validation.min_beneficiaries": "There must be at least one beneficiary",
    "validation.min_offerings": "At least one service must be selected",
    "validation.uuid_error": ({ value }) => `${value} n'est pas un UUID`,
    "info.granted_to_title": "Granted to :",
    "info.granted_to": ({ beneficiary }) => getGrantedTo("en", beneficiary),
    "info.oauth_required": "Strong authentication required : ",
};
