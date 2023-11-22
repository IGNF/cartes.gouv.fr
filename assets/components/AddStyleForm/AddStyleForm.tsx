import { FC, useState } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
//import * as yup from "yup";
import { declareComponentKeys, useTranslation, type Translations } from "../../i18n/i18n";
// import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";

type AddStyleFormProps = {
    styleNames: string[];
    close: () => void;
};

const AddStyleForm: FC<AddStyleFormProps> = ({ styleNames, close }) => {
    console.log(styleNames);

    const { t } = useTranslation({ AddStyleForm });

    const [format, setFormat] = useState<"json" | "sld" | "qml">("json");

    /*const schema = yup
        .object()
        .shape({
            style_name: yup
                .string()
                .required("Le nom de la donnée est obligatoire")
                .test({
                    name: "is-unique",
                    test(styleName, ctx) {
                        if (styleNames.includes(styleName)) {
                            return ctx.createError({ message: `Un style existe déjà avec le nom "${styleName}"` });
                        }
                        return true;
                    },
                }),
            style_files: yup.lazy(() => {
                switch (format) {
                    case "json":
                    case "sld":
                    case "qml":
                    default:
                        return yup.mixed().nullable().notRequired();
                }
            }),
        })
        .required();*/

    const handleAddStyle = () => {
        // TODO
        close();
    };

    return (
        <div className={fr.cx("fr-grid-row")}>
            <div className={fr.cx("fr-col-12")}>
                <Input
                    label={t("form.style_name")}
                    /* state={errors.email_contact ? "error" : "default"}
                    stateRelatedMessage={errors?.email_contact?.message}
                    hintText={t("form.email_contact_hint")}
                    nativeInputProps={{
                    }} */
                />
                <RadioButtons
                    legend={t("form.style_format")}
                    options={[
                        {
                            label: "json",
                            nativeInputProps: {
                                checked: format === "json",
                                onChange: () => setFormat("json"),
                            },
                        },
                        {
                            label: "sld",
                            nativeInputProps: {
                                checked: format === "sld",
                                onChange: () => setFormat("sld"),
                            },
                        },
                        {
                            label: "qml",
                            nativeInputProps: {
                                checked: format === "qml",
                                onChange: () => setFormat("qml"),
                            },
                        },
                    ]}
                    orientation="horizontal"
                />
                <ButtonsGroup
                    className={fr.cx("fr-mt-2w")}
                    alignment="right"
                    buttons={[
                        {
                            children: "Annuler",
                            priority: "secondary",
                            onClick: close,
                        },
                        {
                            children: "Ajouter le style",
                            onClick: handleAddStyle,
                        },
                    ]}
                    inlineLayoutWhen="always"
                />
            </div>
        </div>
    );
};

export default AddStyleForm;

// traductions
export const { i18n } = declareComponentKeys<
    "form.style_name" | "form.style_format"
    // | { K: "form.style_format.hint"; P: { mapboxSpecification: RegisteredLinkProps }; R: JSX.Element }
>()({
    AddStyleForm,
});

export const AddStyleFormFrTranslations: Translations<"fr">["AddStyleForm"] = {
    "form.style_name": "Nom du style :",
    "form.style_format": "Format du style :",
    /*  "form.style_format.hint": ({ mapboxSpecification }) => (
        <>
            {"Le fichier doit être au format JSON et respecter les "}
            <a {...mapboxSpecification}>{"spécifications de style Mapbox"}</a>
            {" Le fichier sera modifié pour conserver uniquement les layers qui correspondent à des couches de votre service."}
        </>
    ) */
};

export const AddStyleFormEnTranslations: Translations<"en">["AddStyleForm"] = {
    "form.style_name": "Style name :",
    "form.style_format": "Style format :",
    /* "form.style_format.hint": ({ mapboxSpecification }) => (
        <>
            {"Le fichier doit être au format JSON et respecter les "}
            <a {...mapboxSpecification}>{"spécifications de style Mapbox"}</a>
            {" Le fichier sera modifié pour conserver uniquement les layers qui correspondent à des couches de votre service."}
        </>
    ) */
};
