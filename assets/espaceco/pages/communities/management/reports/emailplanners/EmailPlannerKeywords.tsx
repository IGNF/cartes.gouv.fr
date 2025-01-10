import { ICommand } from "@uiw/react-md-editor";
import { EmailPlannerKeywords } from "../../../../../../@types/app_espaceco";
import { getTranslation } from "../../../../../../i18n/i18n";

const { t } = getTranslation("EmailPlannerKeywords");

const getKeywordsExtraCommands = (): ICommand[] => {
    const extraCommands: ICommand[] = EmailPlannerKeywords.map((keyword) => {
        return {
            name: keyword,
            keyCommand: keyword,
            render: (command, disabled, executeCommand) => {
                return (
                    <button
                        className={"frx-keywords-btn"}
                        title={t("getTitle", { keyword: keyword })}
                        aria-label={t("getTitle", { keyword: keyword })}
                        disabled={disabled}
                        onClick={() => {
                            executeCommand(command, command.groupName);
                        }}
                    >
                        {t("getText", { keyword: keyword })}
                    </button>
                );
            },
            execute: (_, api) => {
                const text = `_${keyword}_`;
                api.replaceSelection(text);
            },
        };
    });

    extraCommands.unshift({ keyCommand: "divider" });
    return extraCommands;
};

export default getKeywordsExtraCommands;
