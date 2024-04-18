export type TMSResponse = {
    TileMap: TileMap;
};

type TileMap = {
    Title: string;
    SRS: string;
    BoundingBox: BoundingBox;
    TileFormat: TileFormat;
    version: string;
    tilemapservice: string;
};

type BoundingBox = {
    minx: string;
    miny: string;
    maxx: string;
    maxy: string;
};

type TileFormat = {
    width: string;
    height: string;
};
