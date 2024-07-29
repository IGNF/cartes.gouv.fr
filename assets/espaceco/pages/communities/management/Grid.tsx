import { FC } from "react";
import { useTranslation } from "../../../../i18n/i18n";
import { Grid } from "../../../../@types/espaceco";
import GridList from "./GridList";

type GridProps = {
    grids: Grid[];
};

const Grid: FC<GridProps> = ({ grids }) => {
    const { t } = useTranslation("ManageCommunity");
    return (
        <>
            <h2>{t("tab7")}</h2>
            <h3>{t("grid.grids")}</h3>
            {t("grid.explain")}
            <GridList
                grids={grids}
                onChange={(grids) => {
                    console.log(grids); // TODO
                }}
            />
        </>
    );
};

export default Grid;
