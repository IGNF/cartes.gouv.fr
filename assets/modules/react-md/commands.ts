import { getCommands, getExtraCommands, ICommand } from "@uiw/react-md-editor";
import { Language } from "../../i18n/i18n";
import { MDCommandTranslations } from "./translations";

export const getLocaleCommands = (lang: Language = "fr") => {
    const commands = getCommands();
    if (lang === "en") {
        return commands;
    }

    return commands.map((cmd) => {
        if (cmd.keyCommand === "divider" || !cmd.buttonProps) return cmd;

        switch (cmd.keyCommand) {
            case "group": {
                if (cmd.name === "title") {
                    cmd.buttonProps["aria-label"] = cmd.buttonProps.title = MDCommandTranslations[lang][cmd.name!];

                    const children = cmd.children as ICommand[];
                    for (const child of children) {
                        if (child.buttonProps) {
                            child.buttonProps["aria-label"] = child.buttonProps.title = MDCommandTranslations[lang][child.name!];
                        }
                    }
                }
                break;
            }
            default: {
                cmd.buttonProps["aria-label"] = cmd.buttonProps.title = MDCommandTranslations[lang][cmd.name!];
                break;
            }
        }
        return cmd;
    });
};

export const getLocaleDefaultExtraCommands = (lang: Language = "fr") => {
    const commands = getExtraCommands();
    if (lang === "en") {
        return commands;
    }

    return commands.map((cmd) => {
        if (cmd.keyCommand === "divider") return cmd;
        switch (cmd.name) {
            case "edit":
                cmd.buttonProps!["aria-label"] = cmd.buttonProps!.title = MDCommandTranslations[lang]["codeEdit"];
                break;
            case "live":
                cmd.buttonProps!["aria-label"] = cmd.buttonProps!.title = MDCommandTranslations[lang]["codeLive"];
                break;
            case "preview":
                cmd.buttonProps!["aria-label"] = cmd.buttonProps!.title = MDCommandTranslations[lang]["codePreview"];
                break;
            case "fullscrenn":
                cmd.buttonProps!["aria-label"] = cmd.buttonProps!.title = MDCommandTranslations[lang]["fullscreen"];
                break;
        }
        return cmd;
    });
};
