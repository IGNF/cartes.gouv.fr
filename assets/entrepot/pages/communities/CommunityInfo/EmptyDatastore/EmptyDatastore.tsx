import { useMemo } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";

import { emptyDatastoreModal } from "./emptyDatastoreModal";
import { useDatastore } from "@/contexts/datastore";
import api from "@/entrepot/api";
import { decodeContentRange, delta } from "@/utils";
import RQKeys from "@/modules/entrepot/RQKeys";
import { ProcessingExecutionStatusEnum } from "@/@types/app";
import Progress from "@/components/Utils/Progress";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";

const page = 1;
const limit = 1;
const queryParams = { page, limit };

export default function EmptyDatastore() {
    const { datastore } = useDatastore();

    const { data: storedDataCount } = useQuery({
        queryKey: [...RQKeys.datastore_stored_data_list(datastore._id, queryParams), "count"], // TODO : créer des fonctions RQKeys.xxx_count
        queryFn: async ({ signal }) => {
            const res = await api.storedData.getList(datastore._id, queryParams, { signal });
            const contentRange = decodeContentRange(res.headers.get("content-range") ?? "", limit);
            return contentRange.total;
        },
        staleTime: delta.minutes(10),
    });

    const { data: uploadCount } = useQuery({
        queryKey: [...RQKeys.datastore_upload_list(datastore._id, queryParams), "count"],
        queryFn: async ({ signal }) => {
            const res = await api.upload.getList(datastore._id, queryParams, { signal });
            const contentRange = decodeContentRange(res.headers.get("content-range") ?? "", limit);
            return contentRange.total;
        },
        staleTime: delta.minutes(10),
    });

    const { data: serviceList } = useQuery({
        queryKey: RQKeys.datastore_offering_list(datastore._id),
        queryFn: ({ signal }) => api.service.getOfferings(datastore._id, {}, { signal }),
        staleTime: delta.minutes(10),
    });

    const { data: annexeCount } = useQuery({
        queryKey: [...RQKeys.datastore_annexe_list(datastore._id, queryParams), "count"],
        queryFn: async ({ signal }) => {
            const res = await api.annexe.getList(datastore._id, queryParams, { signal });
            const contentRange = decodeContentRange(res.headers.get("content-range") ?? "", limit);
            return contentRange.total;
        },
        staleTime: delta.minutes(10),
    });

    const { data: staticsCount } = useQuery({
        queryKey: [...RQKeys.datastore_statics_list(datastore._id, queryParams), "count"],
        queryFn: async ({ signal }) => {
            const res = await api.statics.getList(datastore._id, queryParams, { signal });
            const contentRange = decodeContentRange(res.headers.get("content-range") ?? "", limit);
            return contentRange.total;
        },
        staleTime: delta.minutes(10),
    });

    const { data: metadataList } = useQuery({
        queryKey: RQKeys.datastore_metadata_list(datastore._id),
        queryFn: ({ signal }) => api.metadata.getList(datastore._id, {}, { signal }),
        staleTime: delta.minutes(10),
    });

    const { data: processingExecList } = useQuery({
        queryKey: RQKeys.datastore_processing_execution_list(datastore._id, { status: ProcessingExecutionStatusEnum.PROGRESS }),
        queryFn: ({ signal }) => api.processing.getExecutionList(datastore._id, { status: ProcessingExecutionStatusEnum.PROGRESS }, { signal }),
        staleTime: delta.minutes(10),
    });

    const data = useMemo(() => {
        return {
            serviceList: {
                length: serviceList?.length ?? 0,
                name: "Services",
            },
            annexeCount: {
                length: annexeCount ?? 0,
                name: "Annexes",
            },
            metadataList: {
                length: metadataList?.length ?? 0,
                name: "Fiches métadonnées",
            },
            processingExecList: {
                length: processingExecList?.length ?? 0,
                name: "Traitements en cours",
            },
            staticsCount: {
                length: staticsCount ?? 0,
                name: "Fichiers statiques",
            },
            storedDataCount: {
                length: storedDataCount ?? 0,
                name: "Données stockées",
            },
            uploadCount: {
                length: uploadCount ?? 0,
                name: "Livraisons",
            },
        };
    }, [serviceList, annexeCount, metadataList, processingExecList, staticsCount, storedDataCount, uploadCount]);

    const isOpenModal = useIsModalOpen(emptyDatastoreModal);

    return createPortal(
        <emptyDatastoreModal.Component
            title="Vider l'entrepôt"
            buttons={[
                {
                    children: "Annuler",
                    priority: "secondary",
                    doClosesModal: true,
                },
            ]}
            concealingBackdrop={false}
        >
            <p className={fr.cx("fr-m-0")}>Tout le contenu de votre entrepôt sera supprimé :</p>

            <ul>
                {Object.values(data).map(({ length, name }) => (
                    <li key={name}>
                        <strong>{name}</strong> : {length}
                    </li>
                ))}
            </ul>

            <p>Êtes-vous sûr de vouloir continuer ? Cette action est irréversible.</p>
        </emptyDatastoreModal.Component>,
        document.body
    );
}
