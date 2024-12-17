import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, memo } from "react";
import { symToStr } from "tsafe/symToStr";

import { routes } from "../../../../../router/router";
import { Upload } from "../../../../../@types/app";

type UnfinishedUploadListProps = {
    datastoreId: string;
    uploadList?: Upload[];
};
const UnfinishedUploadList: FC<UnfinishedUploadListProps> = ({ datastoreId, uploadList }) => {
    return (
        <>
            <div className={fr.cx("fr-grid-row")}>
                <h5>
                    <i className={fr.cx("ri-upload-2-line")} />
                    &nbsp;Livraisons non terminées ({uploadList?.length ?? 0})
                </h5>
            </div>

            {uploadList?.map((upload) => (
                <div key={upload._id} className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
                    <div className={fr.cx("fr-col")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>{upload.name}</div>
                    </div>

                    <div className={fr.cx("fr-col")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                            <Button
                                className={fr.cx("fr-mr-2w")}
                                linkProps={
                                    routes.datastore_delivery_details({ datastoreId, uploadDataId: upload._id, datasheetName: upload.tags.datasheet_name }).link
                                }
                            >
                                {"Voir le rapport"}
                            </Button>
                            <Button iconId="fr-icon-delete-fill" priority="secondary">
                                {"Supprimer"}
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

UnfinishedUploadList.displayName = symToStr({ UnfinishedUploadList });

export default memo(UnfinishedUploadList);
