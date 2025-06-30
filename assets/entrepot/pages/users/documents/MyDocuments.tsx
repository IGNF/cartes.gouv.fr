import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import Table from "@codegouvfr/react-dsfr/Table";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FC, FormEvent, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import { DocumentDetailsResponseDto } from "@/@types/entrepot";
import Main from "@/components/Layout/Main";
import LoadingIcon from "@/components/Utils/LoadingIcon";
import Wait from "@/components/Utils/Wait";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException, jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting from "@/modules/Routing";
import { niceBytes } from "@/utils";

const MyDocuments: FC = () => {
    const [filter, setFilter] = useState<object>({});
    const debouncedSetFilter = useDebounceCallback(setFilter, 500);

    const documentsQuery = useQuery<DocumentDetailsResponseDto[], CartesApiException>({
        queryKey: RQKeys.my_documents(filter),
        queryFn: async ({ signal }) => {
            const url = SymfonyRouting.generate("cartesgouvfr_api_user_me_documents_get_list", { ...filter, detailed: true });
            return await jsonFetch(url, { signal });
        },
    });

    const addDocumentMutation = useMutation<DocumentDetailsResponseDto, CartesApiException, FormData>({
        mutationFn: async (formData: FormData) => {
            const url = SymfonyRouting.generate("cartesgouvfr_api_user_me_documents_add");
            return await jsonFetch(url, { method: "POST" }, formData, true, true);
        },
        onSettled: () => {
            setFilter({});
            documentsQuery.refetch();
        },
    });

    const handleAddDocument = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        addDocumentMutation.mutate(formData);
        e.currentTarget.reset();
    };

    const replaceDocumentMutation = useMutation<DocumentDetailsResponseDto, CartesApiException, FormData>({
        mutationFn: async (formData: FormData) => {
            const url = SymfonyRouting.generate("cartesgouvfr_api_user_me_documents_replace_file", { documentId: currentDocumentId });
            return await jsonFetch(url, { method: "POST" }, formData, true, true);
        },
        onSettled: () => {
            setFilter({});
            documentsQuery.refetch();
        },
    });

    const handleReplaceDocument = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        replaceDocumentMutation.mutate(formData);
        e.currentTarget.reset();
    };

    const modifyDocumentMutation = useMutation<DocumentDetailsResponseDto, CartesApiException, object>({
        mutationFn: async (data) => {
            const url = SymfonyRouting.generate("cartesgouvfr_api_user_me_documents_modify", { documentId: currentDocumentId });
            return await jsonFetch(url, { method: "PATCH" }, data);
        },
        onSettled: () => {
            setFilter({});
            documentsQuery.refetch();
        },
    });

    const handleModifyDocument = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log(e.currentTarget);

        for (const [key, value] of formData.entries()) {
            console.log(key + ": " + value);
        }

        const data = Object.fromEntries(formData);
        try {
            // @ts-expect-error // TODO à corriger plus tard, c'est pas très grave
            data["extra"] = JSON.parse(data["extra"]);
        } catch (error) {
            // ne rien faire
        }

        // remove keys from data whose value is empty or nullish
        Object.entries(data).forEach(([key, value]) => {
            if (!value) {
                delete data[key];
            }
        });

        console.log(data);
        console.log(JSON.stringify(data));

        modifyDocumentMutation.mutate(data);
        e.currentTarget.reset();
    };

    const deleteDocumentMutation = useMutation<void, CartesApiException, string>({
        mutationFn: async (documentId: string) => {
            const url = SymfonyRouting.generate("cartesgouvfr_api_user_me_documents_remove", { documentId });
            return await jsonFetch(url, { method: "DELETE" });
        },
        onSettled: () => {
            setFilter({});
            documentsQuery.refetch();
        },
    });

    const handleDeleteDocument = (id: string, name: string) => {
        if (confirm(`Voulez-vous vraiment supprimer le document ${name} ?`)) {
            deleteDocumentMutation.mutate(id);
        }
    };

    const [currentDocumentId, setCurrentDocumentId] = useState<string | undefined>();

    return (
        <Main title="Mes documents">
            <h1>Mes documents</h1>

            <Alert title="Interface de test de requêtes de documents personnels" severity="info" className={fr.cx("fr-my-4v")} />

            <h2>Liste de documents {documentsQuery.isFetching ? <LoadingIcon largeIcon={true} /> : `(${documentsQuery?.data?.length ?? 0})`}</h2>
            <h3>Filtres</h3>
            <Input
                label="Nom"
                nativeInputProps={{
                    onChange: (e) => debouncedSetFilter((prev) => ({ ...prev, name: e.target.value })),
                }}
            />
            <Input
                label="Labels"
                hintText="Une liste de labels séparés par une virgule"
                nativeInputProps={{
                    onChange: (e) => debouncedSetFilter((prev) => ({ ...prev, labels: e.target.value })),
                }}
            />
            {documentsQuery.data !== undefined && documentsQuery.data.length > 0 && (
                <Table
                    headers={["Nom", "Description", "Labels", "Taille", "Mime type", "Extra", "Actions"]}
                    data={documentsQuery.data.map((doc) => [
                        doc.name,
                        doc.description,
                        <ul key={`labels-${doc._id}`} className={fr.cx("fr-tags-group")}>
                            {doc.labels?.map((label) => <Tag key={`doc-${doc._id}-label-${label}`}>{label}</Tag>)}
                        </ul>,
                        niceBytes(doc.size.toString()),
                        doc.mime_type,
                        // @ts-expect-error // TODO il faut faire regénérer les types parce que l'API a changé
                        JSON.stringify(doc.extra),
                        <ButtonsGroup
                            key={doc._id}
                            buttons={[
                                {
                                    children: "Consulter",
                                    priority: "secondary",
                                    linkProps: {
                                        href: doc.public_url,
                                        target: "_blank",
                                        rel: "noreferrer",
                                    },
                                    className: fr.cx({ "fr-hidden": !doc.public_url }),
                                },
                                {
                                    children: "Remplacer",
                                    priority: "secondary",
                                    onClick: () => {
                                        setCurrentDocumentId(doc._id);
                                        // setReplaceAccordionExpanded(true);
                                    },
                                },
                                {
                                    children: "Modifier",
                                    priority: "secondary",
                                    onClick: () => {
                                        setCurrentDocumentId(doc._id);
                                        // setReplaceAccordionExpanded(true);
                                    },
                                },
                                {
                                    children: "Supprimer",
                                    onClick: () => handleDeleteDocument(doc._id, doc.name),
                                    priority: "secondary",
                                },
                            ]}
                            inlineLayoutWhen="sm and up"
                            buttonsSize="small"
                        />,
                    ])}
                />
            )}

            <div className={fr.cx("fr-accordions-group")}>
                <Accordion label="Ajouter un document" titleAs="h2">
                    <form onSubmit={handleAddDocument}>
                        <Input
                            label="Nom"
                            nativeInputProps={{
                                name: "name",
                                required: true,
                            }}
                        />
                        <Input
                            label="description"
                            nativeInputProps={{
                                name: "description",
                            }}
                        />
                        <Input
                            label="labels"
                            hintText="Une liste de labels séparés par une virgule"
                            nativeInputProps={{
                                name: "labels",
                            }}
                        />
                        <Upload
                            label="Document"
                            hint=""
                            className={fr.cx("fr-input-group")}
                            multiple={false}
                            nativeInputProps={{
                                name: "file",
                                required: true,
                            }}
                        />
                        <Checkbox
                            options={[
                                {
                                    label: "Accessible via une URL publique",
                                    nativeInputProps: {
                                        name: "public_url",
                                    },
                                },
                            ]}
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
                            inlineLayoutWhen="always"
                        />
                    </form>
                </Accordion>

                {currentDocumentId && (
                    <>
                        <Accordion
                            label="Remplacer un document"
                            titleAs="h2"
                            // expanded={!!replaceDocumentId}
                            // onExpandedChange={(expanded) => setReplaceAccordionExpanded(expanded)}
                            // onExpandedChange={() => {}}
                            defaultExpanded
                        >
                            <form onSubmit={handleReplaceDocument}>
                                <Upload
                                    label="Document"
                                    hint=""
                                    className={fr.cx("fr-input-group")}
                                    multiple={false}
                                    nativeInputProps={{
                                        name: "file",
                                        required: true,
                                    }}
                                />
                                <ButtonsGroup
                                    buttons={[
                                        {
                                            children: "Effacer",
                                            type: "reset",
                                            priority: "secondary",
                                            onClick: () => setCurrentDocumentId(undefined),
                                        },
                                        {
                                            children: "Valider",
                                            type: "submit",
                                        },
                                    ]}
                                    inlineLayoutWhen="always"
                                />
                            </form>
                        </Accordion>
                        <Accordion
                            label="Modifier les information d'un document"
                            titleAs="h2"
                            // expanded={!!replaceDocumentId}
                            // onExpandedChange={(expanded) => setReplaceAccordionExpanded(expanded)}
                            // onExpandedChange={() => {}}
                            defaultExpanded
                        >
                            <form onSubmit={handleModifyDocument}>
                                <Input
                                    label="Nom"
                                    nativeInputProps={{
                                        name: "name",
                                    }}
                                />
                                <Input
                                    label="description"
                                    nativeInputProps={{
                                        name: "description",
                                    }}
                                />
                                <Input
                                    label="labels"
                                    hintText="Une liste de labels séparés par une virgule"
                                    nativeInputProps={{
                                        name: "labels",
                                    }}
                                />
                                <Checkbox
                                    options={[
                                        {
                                            label: "Accessible via une URL publique",
                                            nativeInputProps: {
                                                name: "public_url",
                                            },
                                        },
                                    ]}
                                />
                                <Input
                                    textArea
                                    label="Extra"
                                    nativeTextAreaProps={{
                                        name: "extra",
                                    }}
                                />
                                <ButtonsGroup
                                    buttons={[
                                        {
                                            children: "Effacer",
                                            type: "reset",
                                            priority: "secondary",
                                            onClick: () => setCurrentDocumentId(undefined),
                                        },
                                        {
                                            children: "Valider",
                                            type: "submit",
                                        },
                                    ]}
                                    inlineLayoutWhen="always"
                                />
                            </form>
                        </Accordion>
                    </>
                )}
            </div>

            {(() => {
                const error = addDocumentMutation.error ?? replaceDocumentMutation.error ?? deleteDocumentMutation.error;
                if (error) {
                    return <Alert title={error.message} severity="error" description={JSON.stringify(error.details)} />;
                }
            })()}

            {addDocumentMutation.isPending && (
                <Wait>
                    <p className={fr.cx("fr-h6", "fr-m-0", "fr-p-0")}>Ajout du document en cours</p>
                </Wait>
            )}

            {replaceDocumentMutation.isPending && (
                <Wait>
                    <p className={fr.cx("fr-h6", "fr-m-0", "fr-p-0")}>Remplacement du document en cours</p>
                </Wait>
            )}

            {modifyDocumentMutation.isPending && (
                <Wait>
                    <p className={fr.cx("fr-h6", "fr-m-0", "fr-p-0")}>Modification du document en cours</p>
                </Wait>
            )}

            {deleteDocumentMutation.isPending && (
                <Wait>
                    <p className={fr.cx("fr-h6", "fr-m-0", "fr-p-0")}>Suppression du document en cours</p>
                </Wait>
            )}
        </Main>
    );
};

export default MyDocuments;
