import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Input from "@codegouvfr/react-dsfr/Input";
import Table from "@codegouvfr/react-dsfr/Table";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FC, FormEvent, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import { DocumentListResponseDto } from "../../../../@types/entrepot";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import Wait from "../../../../components/Utils/Wait";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException, jsonFetch } from "../../../../modules/jsonFetch";
import SymfonyRouting from "../../../../modules/Routing";
import { niceBytes } from "../../../../utils";
import Main from "../../../../components/Layout/Main";

const MyDocuments: FC = () => {
    const [filter, setFilter] = useState<object>({});
    const debouncedSetFilter = useDebounceCallback(setFilter, 500);

    const documentsQuery = useQuery<DocumentListResponseDto[], CartesApiException>({
        queryKey: RQKeys.my_documents(filter),
        queryFn: async ({ signal }) => {
            const url = SymfonyRouting.generate("cartesgouvfr_api_user_documents_get_list", filter);
            return await jsonFetch(url, { signal });
        },
    });

    const addDocumentMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const url = SymfonyRouting.generate("cartesgouvfr_api_user_documents_add");
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

    const deleteDocumentMutation = useMutation({
        mutationFn: async (documentId: string) => {
            const url = SymfonyRouting.generate("cartesgouvfr_api_user_documents_remove", { documentId });
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
                                    children: "Supprimer",
                                    onClick: () => handleDeleteDocument(doc._id, doc.name),
                                },
                            ]}
                        />,
                    ])}
                    fixed
                />
            )}

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

            {addDocumentMutation.isPending && (
                <Wait>
                    <p className={fr.cx("fr-h6", "fr-m-0", "fr-p-0")}>Ajout du document en cours</p>
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
