export type Data = {
    data_name: string;
    date: string;
    categories: string[];
    nb_publications: number;
};

export type DataDetailed = Data & {
    vector_db_list: VectorDb[] | undefined;
};

export type VectorDb = {
    _id: string;
    name: string;
    last_event: {
        title: string;
        date: string;
    };
};
