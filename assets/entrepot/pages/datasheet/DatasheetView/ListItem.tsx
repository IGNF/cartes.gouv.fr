import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, ReactNode } from "react";
import { symToStr } from "tsafe/symToStr";

import MenuList, { MenuListItem } from "../../../../components/Utils/MenuList";
import { formatDateFromISO } from "../../../../utils";

import "../../../../sass/components/item-list.scss";

interface ListItemProps {
    actionButton?: ReactNode;
    badge?: ReactNode;
    buttonTitle: string;
    children: ReactNode;
    date?: string;
    isSample?: boolean;
    menuListItems?: (MenuListItem | undefined | false)[];
    name: string;
    open?: boolean;
    showDescription: boolean;
    showLock?: boolean;
    toggleShowDescription: () => void;
    type?: string;
}

const ListItem: FC<ListItemProps> = (props) => {
    const { actionButton, badge, buttonTitle, children, date, isSample, menuListItems, name, open, showDescription, showLock, toggleShowDescription, type } =
        props;

    return (
        <div className={fr.cx("fr-p-2v", "fr-mt-2v")} style={{ backgroundColor: fr.colors.decisions.background.contrast.grey.default }}>
            <div className="item-list">
                <Button
                    iconId={showDescription ? "ri-subtract-fill" : "ri-add-fill"}
                    size="small"
                    title={buttonTitle}
                    className={[fr.cx("fr-mr-2v"), "item-list__no-shrink"].join(" ")}
                    priority="secondary"
                    onClick={toggleShowDescription}
                />
                <div className="item-list__content">
                    <span className="item-list__text">{name}</span>
                    {isSample && (
                        <Badge noIcon={true} severity={"info"} className={fr.cx("fr-ml-2v")}>
                            Echantillon
                        </Badge>
                    )}
                    {type && <Badge className="item-list__grow">{type}</Badge>}
                    <p className={[fr.cx("fr-ml-md-auto", "fr-mr-2v", "fr-mb-0"), "item-list__date"].join(" ")}>{date && formatDateFromISO(date)}</p>
                    <div className={[fr.cx("fr-mr-auto", "fr-mr-md-0"), "item-list__part"].join(" ")}>
                        {badge}
                        {showLock && <i className={fr.cx("fr-mr-2v", "fr-ml-auto", "fr-ml-md-0", open ? "fr-icon-lock-unlock-fill" : "fr-icon-lock-fill")} />}
                    </div>
                    <div className="item-list__part">
                        {actionButton}
                        {menuListItems && (
                            <MenuList
                                menuOpenButtonProps={{
                                    iconId: "fr-icon-menu-2-fill",
                                    title: "Autres actions",
                                    priority: "secondary",
                                    className: "item-list__no-shrink",
                                }}
                                items={menuListItems}
                            />
                        )}
                    </div>
                </div>
            </div>

            {showDescription && children}
        </div>
    );
};
ListItem.displayName = symToStr({ ListItem });

export default ListItem;
