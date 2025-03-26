import { CommunityResponseDTO } from "@/@types/espaceco";
import LoadingIcon from "@/components/Utils/LoadingIcon";
import Wait from "@/components/Utils/Wait";
import api from "@/espaceco/api";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/espaceco/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import SearchCommunity from "./SearchCommunity";

type ReuseCommunityConfigProps = {
    title: string;
    description: string;
    confirmation: string;
    onCopy: (reUsedCommunity?: CommunityResponseDTO) => void;
};

const ReuseCommunityConfig: FC<ReuseCommunityConfigProps> = ({ title, description, confirmation, onCopy }) => {
    const { t } = useTranslation("ReuseCommunityConfig");
    const { t: tCommon } = useTranslation("Common");

    const [reuse, setReuse] = useState(false);
    const [communityId, setCommunityId] = useState<number>();

    const query = useQuery<CommunityResponseDTO, CartesApiException>({
        queryKey: RQKeys.community(communityId ?? 0),
        queryFn: () => api.community.getCommunity(communityId!),
        enabled: !!communityId,
        staleTime: 3600000,
    });

    return (
        <div
            className={fr.cx("fr-mb-3w", "fr-p-2v")}
            style={{
                border: "solid 1.5px",
                borderColor: fr.colors.decisions.border.actionHigh.blueFrance.default,
            }}
        >
            <h3 className={fr.cx("fr-h6")}>{title}</h3>
            <p>{description}</p>
            <ToggleSwitch
                className={fr.cx("fr-mb-2w")}
                showCheckedHint={false}
                label={confirmation}
                checked={reuse}
                onChange={(checked) => setReuse(checked)}
            />
            {reuse && (
                <>
                    {query.isLoading && (
                        <Wait>
                            <span className={fr.cx("fr-mr-2v")}>{t("loading_community")}</span>
                            <LoadingIcon largeIcon={true} />
                        </Wait>
                    )}
                    {query.isError && <Alert className={fr.cx("fr-my-3w")} severity={"error"} title={tCommon("error")} description={query.error.message} />}
                    <div className={fr.cx("fr-grid-row")}>
                        <div style={{ minWidth: "100%" }}>
                            <SearchCommunity filter={"listed"} label={t("search_community_label")} onChange={(community) => setCommunityId(community?.id)} />
                        </div>
                    </div>
                    <div className={fr.cx("fr-grid-row", "fr-mt-2v")}>
                        <Button
                            priority={"secondary"}
                            disabled={!query.data}
                            onClick={() => {
                                if (reuse) {
                                    onCopy(query.data);
                                }
                            }}
                        >
                            {tCommon("copy")}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReuseCommunityConfig;
