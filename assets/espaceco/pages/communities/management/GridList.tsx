import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { GridDTO } from "../../../../@types/espaceco";
import SearchGrids from "./SearchGrids";

type GridListProps = {
    grids?: GridDTO[];
    displayType?: boolean;
    onChange: (grids: GridDTO[]) => void;
};

const GridList: FC<GridListProps> = ({ grids = [], displayType = false, onChange }) => {
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

    const handleAdd = (grid: GridDTO | null) => {
        if (grid) {
            const grids = Array.from(new Set([...internal, grid]));
            setInternal(grids);
            onChange(grids);
        }
    };

    const data: ReactNode[][] = useMemo(() => {
        return Array.from(internal, (grid) => {
            const node: ReactNode[] = [grid.name, grid.title];
            if (displayType) {
                node.push(grid.type.title);
            }
            node.push(
                <div key={grid.name} className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                    <Button title={""} priority={"tertiary no outline"} iconId={"fr-icon-delete-line"} onClick={() => handleRemove(grid.name)} />
                </div>
            );
            return node;
        });
    }, [internal, displayType, handleRemove]);

    return (
        <div>
            <SearchGrids
                label={"Chercher une emprise"}
                filters={{
                    fields: ["name", "title", "type", "deleted", "extent"],
                }}
                onChange={(grid) => {
                    handleAdd(grid);
                }}
            />
            <Table className={fr.cx("fr-table--sm", "fr-mb-1v")} bordered fixed noCaption data={data} />
        </div>
    );
};

export default GridList;
