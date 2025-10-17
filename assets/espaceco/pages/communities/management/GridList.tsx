import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { GridDTO } from "../../../../@types/espaceco";
import SearchGrids from "./SearchGrids";

type GridListProps = {
    grids?: GridDTO[];
    displayType?: boolean;
    onChange: (grids: GridDTO[]) => void;
};

const GridList: FC<GridListProps> = ({ grids = [], displayType = false, onChange }) => {
    const handleRemove = useCallback(
        (gridName: string) => {
            const next = grids.filter((grid) => grid.name !== gridName);
            onChange(next);
        },
        [grids, onChange]
    );

    const handleAdd = (grid: GridDTO | null) => {
        if (!grid) return;

        const found = grids.find((g) => g.name === grid.name);
        if (!found) {
            const next = [...grids, grid];
            onChange(next);
        }
    };

    const data: ReactNode[][] = useMemo(() => {
        return Array.from(grids, (grid) => {
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
    }, [grids, displayType, handleRemove]);

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
