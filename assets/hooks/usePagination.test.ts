import { describe, expect, it } from "vitest";

import { usePagination } from "./usePagination";

const items = Array.from({ length: 21 }, (_, index) => index);

describe("usePagination", () => {
    it("ramène la page à la dernière quand la liste raccourcit", () => {
        const { page, paginatedItems, totalPages } = usePagination(items.slice(0, 20), 3, 10);
        expect(totalPages).toBe(2);
        expect(page).toBe(2);
        expect(paginatedItems).toEqual(items.slice(10, 20));
    });

    it("renvoie la page 1 et aucun élément pour une liste vide", () => {
        expect(usePagination([], 2, 10)).toEqual({ paginatedItems: [], totalPages: 0, page: 1 });
    });
});
