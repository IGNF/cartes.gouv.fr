import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { UseQueryResult } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import { DatasheetDetailed, Metadata, StoredData } from "../../../../../@types/app";
import ExtentMap from "../../../../../components/Utils/ExtentMap";
import LoadingText from "../../../../../components/Utils/LoadingText";
import TextCopyToClipboard from "../../../../../components/Utils/TextCopyToClipboard";
import { useTranslation } from "../../../../../i18n/i18n";
import SymfonyRouting from "../../../../../modules/Routing";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import MetadataField from "./MetadataField";

type MetadataTabProps = {
    datastoreId: string;
    datasheet?: DatasheetDetailed;
    metadataQuery: UseQueryResult<Metadata, CartesApiException>;
};
const MetadataTab: FC<MetadataTabProps> = ({ datastoreId, datasheet, metadataQuery }) => {
    const { t: tDatasheet } = useTranslation("DatasheetView");

    const { data: metadata } = metadataQuery;

    const storedDataList: StoredData[] = useMemo(
        () => [...(datasheet?.vector_db_list ?? []), ...(datasheet?.pyramid_list ?? [])],
        [datasheet?.vector_db_list, datasheet?.pyramid_list]
    );

    return (
        <>
            {metadataQuery.isLoading && <LoadingText message={tDatasheet("metadata_tab.metadata.is_loading")} withSpinnerIcon={true} as="p" />}

            {metadataQuery.error &&
                (metadataQuery.error?.code === 404 ? (
                    <p>{tDatasheet("metadata_tab.metadata.absent")}</p>
                ) : (
                    <Alert severity="error" closable={false} title={metadataQuery.error?.message} />
                ))}

            {metadata && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-grid-row--middle")}>
                    <div className={fr.cx("fr-col")}>
                        <CallOut
                            buttonProps={{
                                children: "Consulter le catalogue",
                                linkProps: {
                                    href: SymfonyRouting.generate("cartesgouvfr_catalogue_datasheet_view", { fileIdentifier: metadata.file_identifier }),
                                    rel: "noreferrer",
                                    target: "_blank",
                                },
                            }}
                        >
                            {"Les métadonnées sont désormais publiées sur le catalogue de la géoplateforme."}
                        </CallOut>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Description de la ressource"}>
                            <MetadataField
                                title={"Intitulé (nom public)"}
                                hintText={"Nom caractéristique et souvent unique sous lequel la ressource est connue"}
                                content={metadata.csw_metadata?.title}
                            />
                            <MetadataField
                                title={"Résumé"}
                                hintText={"Bref résumé narratif du contenu de la ressource"}
                                content={metadata.csw_metadata?.abstract}
                                markdown={true}
                            />
                            <MetadataField title={"Contexte"} hintText={"Identifiant du datastore"} content={datastoreId} />
                            <MetadataField
                                title={"Identificateur de ressource unique"}
                                hintText={"Valeur identifiant la ressource de manière unique sur le catalogue"}
                                content={metadata.csw_metadata?.file_identifier}
                            />
                            <MetadataField
                                title={"Catégories thématiques"}
                                content={
                                    <div className={fr.cx("fr-tags-group")}>
                                        {metadata.csw_metadata?.thematic_categories?.map((keyword) => <Tag key={keyword}>{keyword}</Tag>)}
                                    </div>
                                }
                            />
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Délimitation géographique (localisation physique de la donnée)"}>
                            <MetadataField
                                content={
                                    storedDataList.length > 0 && (
                                        <ExtentMap extents={storedDataList.map((sd) => sd.extent).filter((extent) => extent !== undefined)} />
                                    )
                                }
                            />
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Référence temporelle"}>
                            <MetadataField title={"Date de la création de la ressource"} content={metadata.csw_metadata?.creation_date} />
                            <MetadataField title={"Publication de la ressource"} content={"A venir"} />
                            <MetadataField title={"Dernière révision de la ressource"} content={"A venir"} />
                            <MetadataField
                                title={"Généalogie de la ressource"}
                                content={(() => {
                                    switch (metadata.csw_metadata?.hierarchy_level) {
                                        case "series":
                                            return "Produit";
                                        case "dataset":
                                            return "Lot";
                                    }
                                })()}
                            />
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Contact sur les métadonnées"}>
                            <MetadataField title={"Organisme"} content={metadata.csw_metadata?.organisation_name} />
                            <MetadataField title={"Email"} content={metadata.csw_metadata?.contact_email} />
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Responsable de la ressource"}>
                            <MetadataField title={"Organisme"} content={metadata.csw_metadata?.organisation_name} />
                            <MetadataField title={"Email"} content={metadata.csw_metadata?.organisation_email} />
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Accès à la ressource"}>
                            {metadata.csw_metadata?.layers?.map((layer) => (
                                <MetadataField
                                    key={`${layer.offering_id}_${layer.name}`}
                                    title={layer.name}
                                    content={
                                        <>
                                            <strong>{"Type"}</strong> : {layer.endpoint_type}
                                            <TextCopyToClipboard text={layer.endpoint_url ?? ""} />
                                        </>
                                    }
                                />
                            )) ?? ""}
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Informations sur les métadonnées"}>
                            <MetadataField
                                title={"Langue des métadonnées"}
                                hintText={"Langue utilisée pour décrire les métadonnées"}
                                content={metadata.csw_metadata?.language?.language}
                            />
                            <MetadataField
                                title={"Lien vers la métadonnée"}
                                content={
                                    <a
                                        href={SymfonyRouting.generate("cartesgouvfr_catalogue_datasheet_view", { fileIdentifier: metadata.file_identifier })}
                                        rel={"noreferrer"}
                                        target={"_blank"}
                                    >
                                        {SymfonyRouting.generate("cartesgouvfr_catalogue_datasheet_view", { fileIdentifier: metadata.file_identifier }, true)}
                                    </a>
                                }
                            />
                            <MetadataField title={"Jeu de caractères de la ressource"} content={metadata.csw_metadata?.charset} />
                        </Accordion>
                    </div>
                </div>
            )}
        </>
    );
};

export default MetadataTab;
