import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import { routes } from "../../../../router/router";
import { Upload } from "../../../../types/app";

type UnfinishedUploadListProps = {
    datastoreId: string;
    uploadList?: Upload[];
    title?: string;
};
const UnfinishedUploadList: FC<UnfinishedUploadListProps> = ({ datastoreId, uploadList, title = "Livraisons" }) => {
    return (
        <>
            <div className={fr.cx("fr-grid-row")}>
                <h5>
                    <i className={fr.cx("fr-icon-database-fill")} />
                    &nbsp;{title} ({uploadList?.length ?? 0})
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

export default UnfinishedUploadList;
