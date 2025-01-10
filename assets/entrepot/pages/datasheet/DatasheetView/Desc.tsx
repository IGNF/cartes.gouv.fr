import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import LoadingText from "../../../../components/Utils/LoadingText";
import { offeringTypeDisplayName } from "../../../../utils";
import { StoredDataTypeEnum } from "../../../../@types/app";
import { OfferingDetailResponseDtoTypeEnum } from "../../../../@types/entrepot";

interface DescProps {
    databaseNotUsed?: boolean;
    databaseUsed?: string;
    isFetching: boolean;
    publishedServices?: { _id: string; layer_name: string; type: OfferingDetailResponseDtoTypeEnum }[];
    pyramidCreated?: { _id: string; name: string }[];
    pyramidUsed?: { type: string; name: string };
}

const Desc: FC<DescProps> = (props) => {
    const { databaseNotUsed, databaseUsed, isFetching, publishedServices, pyramidCreated, pyramidUsed } = props;

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v", "fr-ml-10v")}>
            <div className={fr.cx("fr-col")}>
                {isFetching && <LoadingText as="p" withSpinnerIcon={true} />}

                {databaseNotUsed && (
                    <div
                        className={fr.cx("fr-grid-row", "fr-mt-2v", "fr-p-2v")}
                        style={{ backgroundColor: fr.colors.decisions.background.default.grey.default }}
                    >
                        <p className={fr.cx("fr-p-0", "fr-m-0")}>{"La base de données n'a pas encore été utilisée"}</p>
                    </div>
                )}

                {databaseUsed && (
                    <div
                        className={fr.cx("fr-grid-row", "fr-mt-2v", "fr-p-2v")}
                        style={{ backgroundColor: fr.colors.decisions.background.default.grey.default }}
                    >
                        <div className={[fr.cx("fr-col-md-4"), "desc__title"].join(" ")}>
                            <span className={fr.cx("fr-icon-database-fill")} /> Base de données utilisée
                        </div>
                        <div className={fr.cx("fr-col-md-8")}>
                            <ul className={fr.cx("fr-raw-list")}>
                                <li>{databaseUsed}</li>
                            </ul>
                        </div>
                    </div>
                )}

                {pyramidCreated && pyramidCreated.length > 0 && (
                    <div
                        className={fr.cx("fr-grid-row", "fr-mt-2v", "fr-p-2v")}
                        style={{ backgroundColor: fr.colors.decisions.background.default.grey.default }}
                    >
                        <div className={[fr.cx("fr-col-md-4"), "desc__title"].join(" ")}>
                            <span className={fr.cx("fr-icon-database-fill")} /> Pyramides créés ({pyramidCreated.length})
                        </div>
                        <div className={fr.cx("fr-col-md-8")}>
                            <ul className={fr.cx("fr-raw-list")}>
                                {pyramidCreated.map((item, i) => (
                                    <li key={item._id} className={fr.cx(i + 1 !== pyramidCreated.length && "fr-mb-2v")}>
                                        {item.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {publishedServices && publishedServices.length > 0 && (
                    <div
                        className={fr.cx("fr-grid-row", "fr-mt-2v", "fr-p-2v")}
                        style={{ backgroundColor: fr.colors.decisions.background.default.grey.default }}
                    >
                        <div className={[fr.cx("fr-col-md-4"), "desc__title"].join(" ")}>
                            <span className={fr.cx("ri-image-line")} /> Services publiés ({publishedServices.length})
                        </div>
                        <div className={fr.cx("fr-col-md-8")}>
                            <ul className={fr.cx("fr-raw-list")}>
                                {publishedServices.map((item, i) => (
                                    <li key={item._id} className={fr.cx(i + 1 !== publishedServices.length && "fr-mb-2v")}>
                                        {item.layer_name} <Badge>{offeringTypeDisplayName(item.type)}</Badge>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {pyramidUsed && (
                    <div
                        className={fr.cx("fr-grid-row", "fr-mt-2v", "fr-p-2v")}
                        style={{ backgroundColor: fr.colors.decisions.background.default.grey.default }}
                    >
                        <div className={[fr.cx("fr-col-md-4"), "desc__title"].join(" ")}>
                            <span className={fr.cx("ri-stack-line")} />{" "}
                            {(() => {
                                switch (pyramidUsed.type) {
                                    case StoredDataTypeEnum.ROK4PYRAMIDVECTOR:
                                        return "Pyramide de tuiles vectorielles utilisée";
                                    case StoredDataTypeEnum.ROK4PYRAMIDRASTER:
                                        return "Pyramide de tuiles raster utilisée";
                                }
                            })()}
                        </div>
                        <div className={fr.cx("fr-col-md-8")}>
                            <ul className={fr.cx("fr-raw-list")}>
                                <li>{pyramidUsed.name}</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
Desc.displayName = symToStr({ Desc });

export default Desc;
