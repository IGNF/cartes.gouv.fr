import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { FC, useState } from "react";
import { useTranslation } from "../../../i18n/i18n";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import AppLayout from "../../../components/Layout/AppLayout";
import { routes } from "../../../router/router";
import Description from "./management/Description";
import { CommunityResponseDTO } from "../../../@types/espaceco";

const STEPS = {
    DESCRIPTION: 1,
    DATABASE: 2,
    LAYERS: 3,
    ZOOM_AND_CENTERING: 4,
    TOOLS: 5,
    REPORTS: 6,
};

const navItems = datastoreNavItems();

const CreateCommunity: FC = () => {
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");
    const { t } = useTranslation("CreateCommunity");

    const [community, setCommunity] = useState<CommunityResponseDTO | undefined>();
    const [currentStep, setCurrentStep] = useState<number>(STEPS.DESCRIPTION);

    return (
        <AppLayout
            navItems={navItems}
            customBreadcrumbProps={{
                homeLinkProps: routes.home().link,
                segments: [
                    { label: tBreadcrumb("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: tBreadcrumb("espaceco_community_list"), linkProps: routes.espaceco_community_list().link },
                ],
                currentPageLabel: tBreadcrumb("espaceco_create_community"),
            }}
            documentTitle={t("title")}
        >
            <div>
                <h1>{t("title")}</h1>
                <Stepper
                    currentStep={currentStep}
                    stepCount={STEPS.REPORTS}
                    title={t("step_title", { stepNumber: currentStep })}
                    nextTitle={currentStep < STEPS.REPORTS ? t("step_title", { stepNumber: currentStep + 1 }) : ""}
                />
                {/* TODO */}
                <div>{currentStep === STEPS.DESCRIPTION && <Description community={community} onSubmit={(datas) => console.log(datas)} />}</div>
            </div>
        </AppLayout>
    );
};

export default CreateCommunity;
