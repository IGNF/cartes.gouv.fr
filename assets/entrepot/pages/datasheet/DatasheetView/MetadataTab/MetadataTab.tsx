import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import { catalogueUrl } from "@/env";
import { MetadataHierarchyLevel, type Metadata } from "../../../../../@types/app";
import ExtentMap from "../../../../../components/Utils/ExtentMap";
import LoadingText from "../../../../../components/Utils/LoadingText";
import TextCopyToClipboard from "../../../../../components/Utils/TextCopyToClipboard";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import api from "../../../../api";
import MetadataField from "./MetadataField";

import frequencyCodes from "../../../../../data/maintenance_frequency.json";

type MetadataTabProps = {
    datastoreId: string;
    metadataQuery: UseQueryResult<Metadata, CartesApiException>;
};
const MetadataTab: FC<MetadataTabProps> = ({ datastoreId, metadataQuery }) => {
    const { t: tDatasheet } = useTranslation("DatasheetView");

    const { data: metadata } = metadataQuery;

    const datastoreQuery = useQuery({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    const frequencyCode = useMemo(() => {
        const code = metadata?.csw_metadata?.frequency_code;
        return code ? frequencyCodes[code] : frequencyCodes["unknown"];
    }, [metadata]);

    const catalogueDatasheetUrl = useMemo(() => {
        // si datastore sandbox
        if (datastoreQuery.data?.is_sandbox === true) {
            const metadataEndpoint = datastoreQuery.data?.endpoints?.find((ep) => ep.endpoint._id === metadata?.endpoints?.[0]?._id);
            const cswBaseUrl = metadataEndpoint?.endpoint.urls?.[0].url.trim();

            if (cswBaseUrl !== undefined) {
                return `${cswBaseUrl}?REQUEST=GetRecordById&SERVICE=CSW&VERSION=2.0.2&OUTPUTSCHEMA=http://www.isotc211.org/2005/gmd&elementSetName=full&ID=${metadata?.file_identifier}`;
            }
            return;
        }

        return `${catalogueUrl}/dataset/${metadata?.file_identifier}`;
    }, [metadata?.file_identifier, datastoreQuery.data?.is_sandbox, datastoreQuery.data?.endpoints, metadata?.endpoints]);

    const isPublished = useMemo(
        () => metadataQuery.data?.endpoints?.length !== undefined && metadataQuery.data?.endpoints?.length > 0,
        [metadataQuery.data?.endpoints?.length]
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
                    <div className={fr.cx("fr-col-12")}>
                        {isPublished ? (
                            datastoreQuery.data?.is_sandbox === true ? (
                                <CallOut
                                    buttonProps={{
                                        children: "Consulter le service de métadonnées",
                                        linkProps: {
                                            href: catalogueDatasheetUrl,
                                            rel: "noreferrer",
                                            target: "_blank",
                                        },
                                    }}
                                >
                                    {
                                        "Les métadonnées sont désormais disponibles sur le service de découverte des métadonnées de l'offre Découverte. Elles n'apparaitront pas sur le catalogue de cartes.gouv."
                                    }
                                </CallOut>
                            ) : (
                                <CallOut
                                    buttonProps={{
                                        children: "Consulter le catalogue",
                                        linkProps: {
                                            href: catalogueDatasheetUrl,
                                            rel: "noreferrer",
                                            target: "_blank",
                                        },
                                    }}
                                >
                                    {"Les métadonnées sont désormais publiées sur le catalogue de la géoplateforme."}
                                </CallOut>
                            )
                        ) : (
                            <CallOut
                                buttonProps={{
                                    children: "Consulter le catalogue",
                                    disabled: true,
                                }}
                            >
                                {"Le lien vers le catalogue est désactivé car la métadonnée a été dépubliée faute de services publiés."}
                            </CallOut>
                        )}

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
                                        {metadata.csw_metadata?.topic_categories?.map((keyword) => <Tag key={keyword}>{keyword}</Tag>)}
                                    </div>
                                }
                            />
                            <MetadataField
                                title={"Mots clés INSPIRE"}
                                content={
                                    <div className={fr.cx("fr-tags-group")}>
                                        {metadata.csw_metadata?.inspire_keywords?.map((keyword) => <Tag key={keyword}>{keyword}</Tag>)}
                                    </div>
                                }
                            />
                            {metadata.csw_metadata?.free_keywords?.length && (
                                <MetadataField
                                    title={"Mots clés libres"}
                                    content={
                                        <div className={fr.cx("fr-tags-group")}>
                                            {metadata.csw_metadata?.free_keywords?.map((keyword) => <Tag key={keyword}>{keyword}</Tag>)}
                                        </div>
                                    }
                                />
                            )}
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Délimitation géographique (localisation physique de la donnée)"}>
                            <MetadataField content={!!metadata.csw_metadata?.bbox && <ExtentMap bbox={metadata.csw_metadata?.bbox} />} />
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Qualité"}>
                            <MetadataField title={"Généalogie de la ressource"} content={metadata.csw_metadata?.resource_genealogy} />
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Référence temporelle"}>
                            <MetadataField title={"Date de la création de la ressource"} content={metadata.csw_metadata?.creation_date} />
                            <MetadataField title={"Fréquence de mise à jour"} content={frequencyCode} />
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Contact sur les métadonnées"}>
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
                                        <TextCopyToClipboard
                                            label={
                                                <span>
                                                    <strong>{"Type"}</strong> : {layer.gmd_online_resource_protocol}
                                                </span>
                                            }
                                            text={layer.gmd_online_resource_url ?? ""}
                                        />
                                    }
                                />
                            )) ?? ""}
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Fichiers de style"}>
                            {metadata.csw_metadata?.style_files?.map((styleFile) => (
                                <MetadataField
                                    key={`${styleFile.url}`}
                                    title={styleFile.name}
                                    content={
                                        <TextCopyToClipboard
                                            label={
                                                styleFile?.description !== "" ? (
                                                    <span>
                                                        <strong>Description</strong> : {styleFile.description}
                                                    </span>
                                                ) : (
                                                    ""
                                                )
                                            }
                                            text={styleFile.url ?? ""}
                                        />
                                    }
                                />
                            )) ?? ""}
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"GetCapabilities"}>
                            {metadata.csw_metadata?.capabilities_files?.map((capFile) => (
                                <MetadataField
                                    key={`${capFile.url}`}
                                    title={capFile.name}
                                    content={
                                        <TextCopyToClipboard
                                            label={
                                                capFile?.description !== "" ? (
                                                    <span>
                                                        <strong>Description</strong> : {capFile.description}
                                                    </span>
                                                ) : (
                                                    ""
                                                )
                                            }
                                            text={capFile.url ?? ""}
                                        />
                                    }
                                />
                            )) ?? ""}
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Documents"}>
                            {metadata.csw_metadata?.documents?.map((document) => (
                                <MetadataField
                                    key={`${document.url}`}
                                    title={document.name}
                                    content={
                                        <TextCopyToClipboard
                                            label={
                                                document?.description !== null && document?.description !== "" ? (
                                                    <span>
                                                        <strong>Description</strong> : {document.description}
                                                    </span>
                                                ) : (
                                                    ""
                                                )
                                            }
                                            text={document.url ?? ""}
                                        />
                                    }
                                />
                            )) ?? ""}
                        </Accordion>

                        <Accordion titleAs="h2" defaultExpanded={true} label={"Informations sur les métadonnées"}>
                            <MetadataField
                                title={"Type de ressource"}
                                content={(() => {
                                    switch (metadata.csw_metadata?.hierarchy_level) {
                                        case MetadataHierarchyLevel.Series:
                                            return "Produit";
                                        case MetadataHierarchyLevel.Dataset:
                                            return "Lot";
                                    }
                                })()}
                            />
                            <MetadataField
                                title={"Langue des métadonnées"}
                                hintText={"Langue utilisée pour décrire les métadonnées"}
                                content={metadata.csw_metadata?.language?.language}
                            />
                            <MetadataField
                                title={"Lien vers la métadonnée"}
                                content={
                                    catalogueDatasheetUrl && (
                                        <a href={catalogueDatasheetUrl} rel={"noreferrer"} target={"_blank"}>
                                            {catalogueDatasheetUrl}
                                        </a>
                                    )
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
