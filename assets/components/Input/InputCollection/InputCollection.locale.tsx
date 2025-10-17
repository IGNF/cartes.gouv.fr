import { declareComponentKeys } from "i18nifty";

import { Translations } from "@/i18n/types";
import { ValidatorType } from "./InputCollection.types";

// traductions
const { i18n } = declareComponentKeys<
    { K: "min_length_error"; P: { min: number | null }; R: string } | { K: "validator_error"; P: { type: ValidatorType; value: string | null }; R: string }
>()("InputCollection");
export type I18n = typeof i18n;

export const InputCollectionFrTranslations: Translations<"fr">["InputCollection"] = {
    min_length_error: ({ min }) => `La chaîne doit faire au minimum ${min} caractères `,
    validator_error: ({ type, value }) => {
        switch (type) {
            case "none":
                return "";
            case "email":
                return `${value} n'est pas un email valide`;
        }
    },
};

export const InputCollectionEnTranslations: Translations<"en">["InputCollection"] = {
    min_length_error: ({ min }) => `Minimum string length is ${min}`,
    validator_error: ({ type, value }) => {
        switch (type) {
            case "none":
                return "";
            case "email":
                return `${value} is not a valid email`;
        }
    },
};
