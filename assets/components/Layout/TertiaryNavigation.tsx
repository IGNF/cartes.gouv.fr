import { fr } from "@codegouvfr/react-dsfr";
import MainNavigation, { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { tss } from "tss-react";

type TertiaryNavigationProps = {
    items: MainNavigationProps.Item[];
};
export default function TertiaryNavigation(props: TertiaryNavigationProps) {
    const { items } = props;

    const { classes } = useStyles();

    return (
        <MainNavigation
            items={items}
            classes={{
                root: classes.root,
            }}
        />
    );
}

const useStyles = tss.withName({ TertiaryNavigation }).create({
    root: {
        backgroundImage: `linear-gradient(to right, ${fr.colors.decisions.border.default.grey.default}, ${fr.colors.decisions.border.default.grey.default})`,
        backgroundPosition: "bottom",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 2px",
    },
});
