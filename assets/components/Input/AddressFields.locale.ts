import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<"legend" | "field.postalCode" | "field.city">()("AddressFields");
export type I18n = typeof i18n;

export const AddressFieldsFrTranslations: Translations<"fr">["AddressFields"] = {
    legend: "Adresse postale",
    "field.postalCode": "Code Postal",
    "field.city": "Ville ou commune",
};

export const AddressFieldsEnTranslations: Translations<"en">["AddressFields"] = {
    legend: "Postal address",
    "field.postalCode": "Postal code",
    "field.city": "City or municipality",
};
