import { fr } from "@codegouvfr/react-dsfr";
import { FC, useState } from "react";
import SearchCommunity from "./SearchCommunity";
import { useTranslation } from "@/i18n";
import Button from "@codegouvfr/react-dsfr/Button";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";

type ReuseCommunityConfigProps = {
    title: string;
    description: string;
    confirmation: string;
    onCopy: (communityId?: number) => void;
};

const ReuseCommunityConfig: FC<ReuseCommunityConfigProps> = ({ title, description, confirmation, onCopy }) => {
    const { t: tCommon } = useTranslation("Common");

    const [reuse, setReuse] = useState(false);
    const [communityId, setCommunityId] = useState<number>();

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
                    <div className={fr.cx("fr-grid-row")}>
                        <div style={{ minWidth: "100%" }}>
                            <SearchCommunity
                                filter={"listed"}
                                label={"Chercher le guichet dont vous voulez réutiliser la configuration"}
                                onChange={(community) => setCommunityId(community?.id)}
                            />
                        </div>
                    </div>
                    <div className={fr.cx("fr-grid-row", "fr-mt-2v")}>
                        <Button
                            priority={"secondary"}
                            onClick={() => {
                                if (reuse && communityId) {
                                    onCopy(communityId);
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
