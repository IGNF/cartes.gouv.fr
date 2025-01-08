import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Table from "@codegouvfr/react-dsfr/Table";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { GridDTO } from "../../../../../@types/espaceco";
import { declareComponentKeys, useTranslation } from "../../../../../i18n/i18n";
import { Translations } from "../../../../../i18n/types";
import GridList from "../GridList";

const ManageGridsDialogModal = createModal({
    id: "manage-grids-modal",
    isOpenedByDefault: false,
});

type ManageGridsDialogProps = {
    communityGrids: GridDTO[];
    userGrids: GridDTO[];
    onApply: (grids: string[]) => void;
};

const ManageGridsDialog: FC<ManageGridsDialogProps> = ({ communityGrids, userGrids, onApply }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("ManageGridsDialog");

    const communityGridsData = useMemo(() => {
        return communityGrids.map((g) => [g.name, g.title, g.type.title]);
    }, [communityGrids]);

    const [grids, setGrids] = useState<GridDTO[]>([]);
    useEffect(() => {
        setGrids([...userGrids]);
    }, [userGrids]);

    const schema = yup.object({
        user_grids: yup.array().of(yup.string().required()),
    });

    const {
        reset,
        setValue: setFormValue,
        getValues: getFormValues,
        handleSubmit,
    } = useForm({
        mode: "onSubmit",
        resolver: yupResolver(schema),
        values: {
            user_grids: Array.from(grids, (g) => g.name),
        },
    });

    const getHeaders = useCallback(
        (main: boolean) => {
            const headers = [t("num_header"), t("title_header"), t("type_header")];
            if (!main) {
                headers.push("");
            }
            return headers;
        },
        [t]
    );

    const onSubmit = () => {
        ManageGridsDialogModal.close();

        const userGrids = getFormValues("user_grids") ?? [];
        onApply(userGrids);
        reset({ user_grids: [] });
    };

    return (
        <>
            {createPortal(
                <ManageGridsDialogModal.Component
                    title={t("title")}
                    size={"large"}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                            doClosesModal: false,
                            onClick: () => {
                                ManageGridsDialogModal.close();
                            },
                        },
                        {
                            priority: "primary",
                            children: t("add_grids"),
                            doClosesModal: false,
                            onClick: handleSubmit(onSubmit),
                        },
                    ]}
                >
                    <>
                        <Accordion label={t("main_grids")} defaultExpanded={false}>
                            <div>
                                <label className={fr.cx("fr-label")}>{t("main_grids_explain")}</label>
                                {communityGridsData.length ? (
                                    <Table headers={getHeaders(true)} bordered fixed data={communityGridsData} />
                                ) : (
                                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                                        <p>{t("no_main_grids")}</p>
                                    </div>
                                )}
                            </div>
                        </Accordion>
                        {/* <div>
                            <label className={fr.cx("fr-label")}>
                                {t("main_grids")}
                                <span className={fr.cx("fr-hint-text")}>{t("main_grids_explain")}</span>
                            </label>
                            {communityGridsData.length ? (
                                <Table bordered fixed data={communityGridsData} />
                            ) : (
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                                    <p>{t("no_main_grids")}</p>
                                </div>
                            )}
                        </div> */}
                        <div className={fr.cx("fr-mt-2w")}>
                            <label className={fr.cx("fr-label")}>{t("user_grids")}</label>
                            <GridList
                                grids={grids}
                                onChange={(grids) => {
                                    const names = Array.from(grids, (g) => g.name);
                                    setFormValue("user_grids", names);
                                }}
                            />
                        </div>
                    </>
                </ManageGridsDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { ManageGridsDialog, ManageGridsDialogModal };

// traductions
const { i18n } = declareComponentKeys<
    | "title"
    | { K: "explain"; R: JSX.Element }
    | "main_grids"
    | "user_grids"
    | "main_grids_explain"
    | "no_main_grids"
    | "add_grids"
    | "num_header"
    | "title_header"
    | "type_header"
>()("ManageGridsDialog");
export type I18n = typeof i18n;

export const ManageGridsDialogFrTranslations: Translations<"fr">["ManageGridsDialog"] = {
    title: "Gérer les emprises individuelles du membre",
    explain: (
        <p>
            <span>
                <strong>Attention: </strong>Un utilisateur qui n’a aucune emprise géographique ne pourra faire que des signalements et aucune contribution
                directe.
            </span>
        </p>
    ),
    main_grids: "Emprises générales du guichet",
    user_grids: "Emprises individuelles du membre",
    main_grids_explain: "Tous les membres du guichet héritent des emprises du guichet. Elles ne peuvent pas être supprimées.",
    no_main_grids: "Aucune",
    add_grids: "Ajouter les emprises individuelles",
    num_header: "Numéro",
    title_header: "Nom",
    type_header: "Type",
};

export const ManageGridsDialogEnTranslations: Translations<"en">["ManageGridsDialog"] = {
    title: undefined,
    explain: undefined,
    main_grids: undefined,
    user_grids: undefined,
    main_grids_explain: undefined,
    no_main_grids: "None",
    add_grids: "Add individual grids",
    num_header: undefined,
    title_header: undefined,
    type_header: undefined,
};
