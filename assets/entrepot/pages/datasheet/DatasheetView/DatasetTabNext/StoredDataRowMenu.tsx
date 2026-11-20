import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMemo } from "react";

import { DatasheetStoredDataItem, StoredDataStatusEnum, StoredDataTypeEnum } from "@/@types/app";
import MenuList from "@/components/Utils/MenuList";
import { useTranslation } from "@/i18n";
import { type ApiError } from "@/modules/jsonFetch";
import StoredDataDeleteConfirmDialog from "./StoredDataDeleteConfirmDialog";

type StoredDataRowMenuProps = {
    datastoreId: string;
    datasheetName: string;
    storedData: DatasheetStoredDataItem;
    canGeneratePyramidVector: boolean;
    canDelete: boolean;
    onDeleteSettled: (storedData: DatasheetStoredDataItem, error: ApiError | Error | null) => void;
};

// une modale par ligne : createModal().open() exige la modale déjà montée
export default function StoredDataRowMenu({
    datastoreId,
    datasheetName,
    storedData,
    canGeneratePyramidVector,
    canDelete,
    onDeleteSettled,
}: StoredDataRowMenuProps) {
    const { t } = useTranslation("DatasetTabNext");

    const deleteModal = useMemo(() => createModal({ id: `confirm-delete-stored-data-${storedData._id}`, isOpenedByDefault: false }), [storedData._id]);

    return (
        <>
            {((storedData.type === StoredDataTypeEnum.VECTORDB && canGeneratePyramidVector) || canDelete) && (
                <MenuList
                    menuOpenButtonProps={{ iconId: "ri-more-2-line", priority: "tertiary no outline", title: t("menu.open"), size: "small" }}
                    items={[
                        storedData.type === StoredDataTypeEnum.VECTORDB &&
                            canGeneratePyramidVector && {
                                text: t("menu.generate_pyramid_vector"),
                                iconId: "ri-add-box-line",
                                disabled: storedData.status !== StoredDataStatusEnum.GENERATED,
                                linkProps: {
                                    to: "/tableau-de-bord/entrepots/$datastoreId/pyramide-vecteur/ajout",
                                    params: { datastoreId },
                                    search: { vectorDbId: storedData._id, datasheetName },
                                },
                            },
                        canDelete && {
                            text: t("menu.delete"),
                            iconId: "fr-icon-delete-line",
                            onClick: () => deleteModal.open(),
                        },
                    ]}
                />
            )}
            {canDelete && (
                <StoredDataDeleteConfirmDialog
                    modal={deleteModal}
                    datastoreId={datastoreId}
                    datasheetName={datasheetName}
                    storedData={storedData}
                    onSettled={(error) => onDeleteSettled(storedData, error)}
                />
            )}
        </>
    );
}
