import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Input from "@codegouvfr/react-dsfr/Input";
import Table from "@codegouvfr/react-dsfr/Table";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FC, FormEvent, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import { DocumentDetailsResponseDto, DocumentListResponseDto } from "../../../../@types/entrepot";
import Main from "../../../../components/Layout/Main";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import Wait from "../../../../components/Utils/Wait";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException, jsonFetch } from "../../../../modules/jsonFetch";
import SymfonyRouting from "../../../../modules/Routing";
import { niceBytes } from "../../../../utils";

const MyDocuments: FC = () => {
    const [filter, setFilter] = useState<object>({});
    const debouncedSetFilter = useDebounceCallback(setFilter, 500);

    const documentsQuery = useQuery<DocumentListResponseDto[], CartesApiException>({
        queryKey: RQKeys.my_documents(filter),
        queryFn: async ({ signal }) => {
            const url = SymfonyRouting.generate("cartesgouvfr_api_user_me_documents_get_list", filter);
            return await jsonFetch(url, { signal });
        },
    });

    const addDocumentMutation = useMutation<DocumentDetailsResponseDto, CartesApiException, FormData>({
        mutationFn: async (formData: FormData) => {
            const url = SymfonyRouting.generate("cartesgouvfr_api_user_me_documents_add");
            return await jsonFetch(url, { method: "POST" }, formData, true, true);
        },
        onSettled: () => {
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
            const url = SymfonyRouting.generate("cartesgouvfr_api_user_me_documents_replace_file");
            return await jsonFetch(url, { method: "PUT" }, formData, true, true);
        },
        onSettled: () => {
            documentsQuery.refetch();
        },
    });

    const handleReplaceDocument = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        replaceDocumentMutation.mutate(formData);
        e.currentTarget.reset();
    };

    const deleteDocumentMutation = useMutation<void, CartesApiException, string>({
        mutationFn: async (documentId: string) => {
            const url = SymfonyRouting.generate("cartesgouvfr_api_user_me_documents_remove", { documentId });
            return await jsonFetch(url, { method: "DELETE" });
        },
        onSettled: () => {
            documentsQuery.refetch();
        },
    });

    const handleDeleteDocument = (id: string, name: string) => {
        if (confirm(`Voulez-vous vraiment supprimer le document ${name} ?`)) {
            deleteDocumentMutation.mutate(id);
        }
    };

    const [replaceDocumentId, setReplaceDocumentId] = useState<string | undefined>();
    // const [replaceAccordionExpanded, setReplaceAccordionExpanded] = useState(false);

    return (
        <Main title="Mes documents">
            <h1>Mes documents</h1>

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
                    headers={["Nom", "Taille", "Actions"]}
                    data={documentsQuery.data.map((doc) => [
                        doc.name,
                        niceBytes(doc.size.toString()),
                        <ButtonsGroup
                            key={doc._id}
                            buttons={[
                                {
                                    children: "Remplacer",
                                    priority: "secondary",
                                    onClick: () => {
                                        setReplaceDocumentId(doc._id);
                                        // setReplaceAccordionExpanded(true);
                                    },
                                },
                                {
                                    children: "Supprimer",
                                    onClick: () => handleDeleteDocument(doc._id, doc.name),
                                    priority: "secondary",
                                },
                            ]}
                            inlineLayoutWhen="always"
                        />,
                    ])}
                    fixed
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
                        <Button type="submit">Ajouter</Button>
                    </form>
                </Accordion>

                {replaceDocumentId && (
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
                                        onClick: () => setReplaceDocumentId(undefined),
                                    },
                                    {
                                        children: "Remplacer",
                                        type: "submit",
                                    },
                                ]}
                                inlineLayoutWhen="always"
                            />
                        </form>
                    </Accordion>
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

            {deleteDocumentMutation.isPending && (
                <Wait>
                    <p className={fr.cx("fr-h6", "fr-m-0", "fr-p-0")}>Suppression du document en cours</p>
                </Wait>
            )}
        </Main>
    );
};

export default MyDocuments;
