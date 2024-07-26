import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { FC, useCallback, useMemo, useState } from "react";
import { Grids } from "../../../../@types/espaceco";
import SearchGrids from "./ZoomAndCentering/SearchGrids";

type GridListProps = {
    grids?: Grids[];
    onChange: (grids: Grids[]) => void;
};

const GridList: FC<GridListProps> = ({ grids = [], onChange }) => {
    const [grid, setGrid] = useState<Grids | null>(null);

    const [internal, setInternal] = useState<Grids[]>([...grids]);

    const handleRemove = useCallback(
        (gridName: string) => {
            const grids = internal.filter((grid) => grid.name !== gridName);
            setInternal(grids);
            onChange(grids);
        },
        [internal, onChange]
    );

    const handleAdd = () => {
        if (grid) {
            const grids = [...internal, grid];
            setInternal(grids);
        }
    };
    const data = useMemo(() => {
        return Array.from(internal, (grid) => [
            grid.name,
            grid.title,
            grid.type,
            <Button key={grid.name} title={""} priority={"tertiary no outline"} iconId={"fr-icon-delete-line"} onClick={() => handleRemove(grid.name)} />,
        ]);
    }, [internal, handleRemove]);

    return (
        <>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-11")}>
                    <SearchGrids
                        label={""}
                        filters={{
                            searchBy: ["name", "title"],
                        }}
                        onChange={(grid) => setGrid(grid)}
                    />
                </div>
                <div className={fr.cx("fr-col-1")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--left", "fr-grid-row--middle")}>
                        <Button title={""} priority={"tertiary no outline"} iconId={"fr-icon-add-circle-line"} onClick={handleAdd} />
                    </div>
                </div>
            </div>
            <Table className={fr.cx("fr-table--sm")} caption={null} data={data} />
        </>
    );
};

export default GridList;
