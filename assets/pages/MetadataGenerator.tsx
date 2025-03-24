import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Input from "@codegouvfr/react-dsfr/Input";
import { useForm } from "react-hook-form";

import { CswMetadata } from "@/@types/app";
import Main from "@/components/Layout/Main";
import { useMutation } from "@tanstack/react-query";
import SymfonyRouting from "@/modules/Routing";
import { CartesApiException } from "@/modules/jsonFetch";

function MetadataGenerator() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CswMetadata>({
        defaultValues: {
            frequency_code: "unknown",
            charset: "utf8",
        },
    });

    const onSubmit = (data: CswMetadata) => {
        console.log(data);
        mutation.mutate(data);
    };

    const mutation = useMutation<string, CartesApiException, CswMetadata>({
        mutationFn: async (data: CswMetadata) => {
            const url = SymfonyRouting.generate("metadata_generator_generate");
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/xml",
                },
            });
            return await response.text();
        },
        onSuccess: (data) => {
            console.log(data);
        },
    });

    return (
        <Main>
            <h1>Générateur de métadonnée XML</h1>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label="Identifiant"
                    state={errors.file_identifier ? "error" : "default"}
                    stateRelatedMessage={errors.file_identifier?.message}
                    nativeInputProps={{
                        ...register("file_identifier", { required: "Ce champ est requis" }),
                    }}
                />

                <Input
                    label="Titre"
                    state={errors.title ? "error" : "default"}
                    stateRelatedMessage={errors.title?.message}
                    nativeInputProps={{
                        ...register("title", { required: "Ce champ est requis" }),
                    }}
                />

                <Input
                    label="Résumé"
                    textArea
                    state={errors.abstract ? "error" : "default"}
                    stateRelatedMessage={errors.abstract?.message}
                    nativeTextAreaProps={{
                        ...register("abstract", { required: "Ce champ est requis" }),
                    }}
                />

                <Input
                    label="Date de création"
                    state={errors.creation_date ? "error" : "default"}
                    stateRelatedMessage={errors.creation_date?.message}
                    nativeInputProps={{
                        type: "date",
                        ...register("creation_date", { required: "Ce champ est requis" }),
                    }}
                />

                <Input
                    label="Généalogie de la ressource"
                    textArea
                    state={errors.resource_genealogy ? "error" : "default"}
                    stateRelatedMessage={errors.resource_genealogy?.message}
                    nativeTextAreaProps={{
                        ...register("resource_genealogy", { required: "Ce champ est requis" }),
                    }}
                />

                <Input
                    label="Email de contact"
                    state={errors.contact_email ? "error" : "default"}
                    stateRelatedMessage={errors.contact_email?.message}
                    nativeInputProps={{
                        type: "email",
                        ...register("contact_email", { required: "Ce champ est requis" }),
                    }}
                />

                <Input
                    label="Nom de l'organisation"
                    state={errors.organisation_name ? "error" : "default"}
                    stateRelatedMessage={errors.organisation_name?.message}
                    nativeInputProps={{
                        ...register("organisation_name", { required: "Ce champ est requis" }),
                    }}
                />

                <Input
                    label="Email de l'organisation"
                    state={errors.organisation_email ? "error" : "default"}
                    stateRelatedMessage={errors.organisation_email?.message}
                    nativeInputProps={{
                        type: "email",
                        ...register("organisation_email", { required: "Ce champ est requis" }),
                    }}
                />

                <Input
                    label="Résolution"
                    state={errors.resolution ? "error" : "default"}
                    stateRelatedMessage={errors.resolution?.message}
                    nativeInputProps={{
                        ...register("resolution", { required: "Ce champ est requis" }),
                    }}
                />

                <ButtonsGroup
                    buttons={[
                        {
                            children: "Effacer",
                            type: "reset",
                            priority: "secondary",
                        },
                        {
                            children: "Valider",
                            type: "submit",
                        },
                    ]}
                    inlineLayoutWhen="sm and up"
                    alignment="right"
                />
            </form>

            <div>
                <pre>
                    <code>{mutation.data}</code>
                </pre>
            </div>
        </Main>
    );
}

export default MetadataGenerator;
