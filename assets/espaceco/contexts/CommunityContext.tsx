import { CommunityFormMode } from "@/@types/app_espaceco";
import { CommunityResponseDTO } from "@/@types/espaceco";
import RQKeys from "@/modules/espaceco/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useState } from "react";
import api from "../api";
import { COMMUNITY_FORM_STEPS } from "../pages/communities/FormSteps";

interface IStepper {
    maxSteps: number;
    previousStep: () => void;
    nextStep: () => void;
    isFirstStep: () => boolean;
    isLastStep: () => boolean;
}
interface ICommunityContext {
    mode: CommunityFormMode;
    community?: CommunityResponseDTO;
    currentStep: COMMUNITY_FORM_STEPS;
    stepper: IStepper | null;
    isCommunityLoading: boolean;
    isCommunityError: boolean;
    communityError: CartesApiException | null;
    updateCommunity: (datas: object, onSuccess?: () => void) => void;
    isCommunityUpdating: boolean;
    isCommunityUpdatingError: boolean;
    updatingCommunityError: CartesApiException | null;
}

// Create contexts
const CommunityContext = createContext<ICommunityContext | null>(null);

export const CommunityProvider = ({ children, communityId, mode }: { children: ReactNode; communityId: number; mode: CommunityFormMode }) => {
    const queryClient = useQueryClient();

    const maxSteps = COMMUNITY_FORM_STEPS.REPORTS;
    const [currentStep, setCurrentStep] = useState<COMMUNITY_FORM_STEPS>(COMMUNITY_FORM_STEPS.DESCRIPTION);

    const stepper =
        mode === "edition"
            ? null
            : {
                  maxSteps: COMMUNITY_FORM_STEPS.REPORTS,
                  previousStep: () => {
                      if (currentStep > COMMUNITY_FORM_STEPS.DESCRIPTION) {
                          setCurrentStep(currentStep - 1);
                      }
                  },
                  nextStep: () => {
                      if (currentStep < maxSteps) {
                          setCurrentStep(currentStep + 1);
                      }
                  },
                  isFirstStep: () => {
                      return currentStep === COMMUNITY_FORM_STEPS.DESCRIPTION;
                  },
                  isLastStep: () => {
                      return currentStep === maxSteps;
                  },
              };

    const {
        data: community,
        isLoading: isCommunityLoading,
        isError: isCommunityError,
        error: communityError,
    } = useQuery<CommunityResponseDTO, CartesApiException>({
        queryKey: RQKeys.community(communityId),
        queryFn: () => api.community.getCommunity(communityId),
        staleTime: 3600000,
    });

    // Mise a jour de la community
    const {
        mutate,
        isPending: isUpdating,
        isError: isUpdatingError,
        error: updatingError,
    } = useMutation<CommunityResponseDTO, CartesApiException, object>({
        mutationFn: (datas: object) => {
            return api.community.update(communityId, datas);
        },
    });

    const updateCommunity = (datas: object, onSuccess?: () => void) => {
        mutate(datas, {
            onSuccess: (community) => {
                queryClient.setQueryData<CommunityResponseDTO>(RQKeys.community(community.id), () => {
                    return community;
                });
                onSuccess?.();
            },
        });
    };

    return (
        <CommunityContext.Provider
            value={{
                mode,
                currentStep,
                stepper,
                community,
                isCommunityLoading,
                isCommunityError,
                communityError,
                updateCommunity,
                isCommunityUpdating: isUpdating,
                isCommunityUpdatingError: isUpdatingError,
                updatingCommunityError: updatingError,
            }}
        >
            {children}
        </CommunityContext.Provider>
    );
};

// Custom hook for consuming context
export const useCommunityContext = () => {
    const context = useContext(CommunityContext);
    if (!context) {
        throw new Error("useCommunityContext must be used within a CommunityProvider");
    }
    return context;
};
