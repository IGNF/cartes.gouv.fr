import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";

import { UploadTree } from "../../../../../@types/app";

type UploadFileTreeProps = {
    fileTree: UploadTree;
};
const UploadFileTree: FC<UploadFileTreeProps> = ({ fileTree }) => {
    return fileTree.map((item) =>
        item.type === "DIRECTORY" && item.children ? (
            <div key={item.name} className={fr.cx("fr-grid-row", "fr-ml-4v")}>
                <div className={fr.cx("fr-col")}>
                    <span>
                        <strong>
                            <span className={fr.cx("fr-icon-folder-2-line")} /> {item.name}
                        </strong>
                    </span>
                    <UploadFileTree fileTree={item.children} />
                </div>
            </div>
        ) : (
            <div key={item.name} className={fr.cx("fr-grid-row", "fr-ml-4v")}>
                <div className={fr.cx("fr-col")}>
                    <span>
                        <span className={fr.cx("fr-icon-file-line")} /> {item.name}
                    </span>
                </div>
            </div>
        )
    );
};

export default UploadFileTree;
