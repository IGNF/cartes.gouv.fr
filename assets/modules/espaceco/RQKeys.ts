const RQKeys = {
    community_list: (name: string = "", page: number = 1, limit: number = 10): string[] => ["community", name, page.toString(), limit.toString()],
};

export default RQKeys;
