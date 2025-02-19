import { FC } from "react";
import { useForm } from "react-hook-form";
import { GridDTO } from "../../../../@types/espaceco";
import { useTranslation } from "../../../../i18n/i18n";
import GridList from "./GridList";
import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";

type GridProps = {
    grids: GridDTO[];
    onSubmit: (datas: object, saveOnly: boolean) => void;
};

type GridForm = {
    grids: string[];
};

const Grid: FC<GridProps> = ({ grids, onSubmit }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("ManageCommunity");

    const form = useForm<GridForm>({
        mode: "onSubmit",
        values: {
            grids: Array.from(grids, (g) => g.name),
        },
    });
    const { setValue: setFormValue, getValues: getFormValues, handleSubmit } = form;

    const onSubmitForm = () => {
        const datas = { ...getFormValues() };
        onSubmit(datas, true);
    };

    return (
        <>
            <h3>{t("grid.grids")}</h3>
            {t("grid.explain")}
            <GridList
                grids={grids}
                onChange={(grids) => {
                    setFormValue(
                        "grids",
                        Array.from(grids, (g) => g.name)
                    );
                }}
            />
            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mt-2w")}>
                <Button priority={"primary"} onClick={handleSubmit(onSubmitForm)}>
                    {tCommon("save")}
                </Button>
            </div>
        </>
    );
};

export default Grid;
