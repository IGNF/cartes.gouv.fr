import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<"legend" | "field.number" | "field.street" | "field.postalCode" | "field.city">()("AddressFields");
export type I18n = typeof i18n;

export const AddressFieldsFrTranslations: Translations<"fr">["AddressFields"] = {
    legend: "Adresse postale",
    "field.number": "Numéro",
    "field.street": "Voie",
    "field.postalCode": "Code Postal",
    "field.city": "Ville",
};

export const AddressFieldsEnTranslations: Translations<"en">["AddressFields"] = {
    legend: "Postal address",
    "field.number": "Number",
    "field.street": "Street",
    "field.postalCode": "Postal code",
    "field.city": "City",
};
