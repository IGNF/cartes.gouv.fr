import { create } from "zustand";
import type { DescriptionFormType } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";

type setDataType = { tab: "tab1"; data: DescriptionFormType };

const useCommunityFormStore = (initProps: CommunityResponseDTO) => {
    return create<{
        tab1: DescriptionFormType | null;
        setData: ({ tab, data }: setDataType) => void;
    }>((set) => ({
        tab1: { name: initProps.name, description: initProps.description ?? undefined, keywords: initProps.keywords },
        setData: ({ tab, data }) =>
            set((state) => ({
                ...state,
                [tab]: data,
            })),
    }));
};

export default useCommunityFormStore;
