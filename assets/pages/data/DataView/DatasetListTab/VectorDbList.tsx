import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { FC, useState } from "react";

import { routes } from "../../../../router/router";

type ServiceTypes = "tms" | "wfs" | "wms-vector" | "pre-paquet" | undefined;

type VectorDbListProps = {
    datastoreId: string;
    vectorDbList: { _id: string; name: string; date: string }[];
};

const serviceTypeChoiceModal = createModal({
    id: "service-type-choice-modal",
    isOpenedByDefault: false,
});

const VectorDbList: FC<VectorDbListProps> = ({ datastoreId, vectorDbList }) => {
    const [serviceType, setServiceType] = useState<ServiceTypes>(undefined);
    const [selectedStoredDataId, setSelectedStoredDataId] = useState<string | undefined>(undefined);

    const handleContinue = () => {
        switch (serviceType) {
            case "wfs":
                routes.datastore_wfs_service_new({ datastoreId, storedDataId: selectedStoredDataId }).push();
                break;

            default:
                console.warn("Action non implémentée");
                break;
        }
    };

    return (
        <>
            <div className={fr.cx("fr-grid-row")}>
                <h5>
                    <i className="fr-icon-database-fill" />
                    &nbsp;Bases de données vecteur ({vectorDbList?.length})
                </h5>
            </div>

            {vectorDbList.map((el) => (
                <div key={el._id} className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
                    <div className={fr.cx("fr-col")}>{el.name}</div>
                    <div className={fr.cx("fr-col-2")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>{el.date}</div>
                    </div>

                    <div className={fr.cx("fr-col-3")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                            <Button
                                onClick={() => {
                                    setSelectedStoredDataId(el._id);
                                    serviceTypeChoiceModal.open();
                                }}
                                className={fr.cx("fr-mr-2v")}
                            >
                                Créer un service
                            </Button>
                            <Button iconId="fr-icon-menu-2-fill" title="Autres actions" />
                        </div>
                    </div>
                </div>
            ))}

            <serviceTypeChoiceModal.Component
                title="Définissez le service à créer"
                buttons={[
                    {
                        children: "Annuler",
                        doClosesModal: true,
                        priority: "secondary",
                    },
                    {
                        children: "Continuer",
                        onClick: handleContinue,
                        doClosesModal: true,
                        priority: "primary",
                    },
                ]}
                concealingBackdrop={false}
            >
                <RadioButtons
                    options={[
                        {
                            label: "Tile Map Service (TMS)",
                            hintText: "Dans une première étape  vous allez créer une pyramide de tuiles vectorielles que vous devrez ensuite publier",
                            nativeInputProps: {
                                checked: serviceType === "tms",
                                onChange: () => setServiceType("tms"),
                            },
                        },
                        {
                            label: "Web Feature Service (WFS)",
                            hintText: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, dolore unde! Autem eos nam fugiat!",
                            nativeInputProps: {
                                checked: serviceType === "wfs",
                                onChange: () => setServiceType("wfs"),
                            },
                        },
                        {
                            label: "Web Map Service (WMS-Vecteur)",
                            hintText: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, dolore unde! Autem eos nam fugiat!",
                            nativeInputProps: {
                                checked: serviceType === "wms-vector",
                                onChange: () => setServiceType("wms-vector"),
                            },
                        },
                        {
                            label: "Fichier pré-paquets",
                            hintText: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, dolore unde! Autem eos nam fugiat!",
                            nativeInputProps: {
                                checked: serviceType === "pre-paquet",
                                onChange: () => setServiceType("pre-paquet"),
                            },
                        },
                    ]}
                />
                {serviceType && serviceType === "tms" && (
                    <Input
                        label="Nom technique de la pyramide de tuiles vectorielles"
                        hintText="II s'agit du nom technique du service qui apparaitra dans votre espace de travail, il ne sera pas publié en ligne. Si vous le renommez, choisissez un nom explicite."
                        nativeInputProps={{ placeholder: "[TODO] Nom technique par défaut" }}
                    />
                )}
            </serviceTypeChoiceModal.Component>
        </>
    );
};

export default VectorDbList;
