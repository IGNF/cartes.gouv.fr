import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { GridDTO } from "../../../../@types/espaceco";
import SearchGrids from "./ZoomAndCentering/SearchGrids";

type GridListProps = {
    grids?: GridDTO[];
    onChange: (grids: GridDTO[]) => void;
};

const GridList: FC<GridListProps> = ({ grids = [], onChange }) => {
    const [grid, setGrid] = useState<GridDTO | null>(null);
    const [internal, setInternal] = useState<GridDTO[]>([]);

    useEffect(() => {
        setInternal([...grids]);
    }, [grids]);

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
            const grids = Array.from(new Set([...internal, grid]));
            setInternal(grids);
            onChange(grids);
        }
    };
    const data: ReactNode[][] = useMemo(() => {
        return Array.from(internal, (grid) => [
            grid.name,
            grid.title,
            grid.type.title,
            <div key={grid.name} className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                <Button title={""} priority={"tertiary no outline"} iconId={"fr-icon-delete-line"} onClick={() => handleRemove(grid.name)} />
            </div>,
        ]);
    }, [internal, handleRemove]);

    return (
        <div>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                <div className={fr.cx("fr-col-11")}>
                    <SearchGrids
                        label={""}
                        filters={{
                            fields: ["name", "title", "type", "extent"],
                        }}
                        onChange={(grid) => {
                            if (grid) {
                                setGrid(grid);
                            }
                        }}
                    />
                </div>
                <div className={fr.cx("fr-col-1")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--left")}>
                        <Button title={""} priority={"tertiary no outline"} iconId={"fr-icon-add-circle-line"} onClick={handleAdd} />
                    </div>
                </div>
            </div>
            <Table className={fr.cx("fr-table--sm")} bordered fixed noCaption data={data} />
        </div>
    );
};

export default GridList;
