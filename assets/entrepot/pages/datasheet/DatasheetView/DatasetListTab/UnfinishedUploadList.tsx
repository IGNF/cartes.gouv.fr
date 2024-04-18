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
                            <Button linkProps={routes.datastore_datasheet_new_integration({ datastoreId, uploadId: upload._id }).link}>
                                {"Reprendre l'intégration"}
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
