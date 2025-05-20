import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "../../../../i18n/i18n";
import GridList from "./GridList";
import Wait from "@/components/Utils/Wait";
import LoadingText from "@/components/Utils/LoadingText";
import Alert from "@codegouvfr/react-dsfr/Alert";

type GridForm = {
    grids: string[];
};

const Grids: FC = () => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tmc } = useTranslation("ManageCommunity");

    const context = useCommunityContext();

    const { updateCommunity, isCommunityUpdating, isCommunityUpdatingError, updatingCommunityError } = context;
    const community = context.community!;

    const form = useForm<GridForm>({
        mode: "onSubmit",
        values: {
            grids: Array.from(community.grids, (g) => g.name),
        },
    });
    const { setValue: setFormValue, getValues: getFormValues, handleSubmit } = form;

    const onSubmitForm = () => {
        const datas = { ...getFormValues() };
        updateCommunity(datas);
    };

    return (
        <>
            <h3>{tmc("grid.grids")}</h3>
            {tmc("grid.explain")}
            {isCommunityUpdating && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={tmc("updating")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
            {isCommunityUpdatingError && (
                <Alert className={fr.cx("fr-my-2v")} severity="error" closable title={tCommon("error")} description={updatingCommunityError?.message} />
            )}
            <GridList
                grids={community.grids}
                onChange={(grids) => {
                    setFormValue(
                        "grids",
                        Array.from(grids, (g) => g.name)
                    );
                }}
            />
            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mt-2w")}>
                <Button priority={"primary"} onClick={handleSubmit(onSubmitForm)}>
                    {tCommon("save")}
                </Button>
            </div>
        </>
    );
};

export default Grids;
