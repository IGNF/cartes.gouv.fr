import { UserMe } from "@/@types/app_espaceco";
import RQKeys from "@/modules/espaceco/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { useQuery } from "@tanstack/react-query";
import api from "../api";

const useUserMe = () => {
    return useQuery<UserMe, CartesApiException>({
        queryKey: RQKeys.getMe(),
        queryFn: ({ signal }) => api.user.getMe(signal),
        staleTime: 3600000,
    });
};

export default useUserMe;
