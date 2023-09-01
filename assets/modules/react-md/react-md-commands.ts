import {
    ICommand,
    bold,
    italic,
    strikethrough,
    code,
    codeBlock,
    comment,
    divider,
    group,
    hr,
    image,
    link,
    quote,
    title1,
    title2,
    title3,
    title4,
    title5,
    title6,
    unorderedListCommand,
    orderedListCommand,
    checkedListCommand,
} from "@uiw/react-md-editor";

import { ReactMDShortcuts, ReactMDLocales } from "./react-md-locales";

const getLocaleTitles: (locale: string) => ICommand[] = (locale = "fr") => {
    const title = ReactMDLocales[locale].title.title;
    const titles: ICommand[] = [title1, title2, title3, title4, title5, title6].map((t, index) => {
        return { ...t, buttonProps: { "aria-label": `${title} ${index + 1}`, title: `${title} ${index + 1} (ctrl + ${index + 1})` } };
    });
    return titles;
};

/**
 * Retourne la liste des commandes pour l'editeur markdown en fonction de la locale
 * @param locale
 * @returns
 */
const getLocaleCommands: (locale: string) => ICommand[] = (locale = "fr") => {
    const trans = ReactMDLocales[locale];

    return [
        { ...bold, buttonProps: { "aria-label": trans.bold.title, title: `${trans.bold.title} (${ReactMDShortcuts.bold})` } },
        { ...italic, buttonProps: { "aria-label": trans.italic.title, title: `${trans.italic.title} (${ReactMDShortcuts.italic})` } },
        {
            ...strikethrough,
            buttonProps: { "aria-label": trans.strikethrough.title, title: `${trans.strikethrough.title} (${ReactMDShortcuts.strikethrough})` },
        },
        { ...hr, buttonProps: { "aria-label": trans.hr.title, title: `${trans.hr.title} (${ReactMDShortcuts.hr})` } },
        group(getLocaleTitles(locale), { name: "title", groupName: "title", buttonProps: { "aria-label": trans.title.title, title: trans.title.title } }),
        divider,
        { ...link, buttonProps: { "aria-label": trans.link.title, title: `${trans.link.title} (${ReactMDShortcuts.link})` } },
        { ...quote, buttonProps: { "aria-label": trans.quote.title, title: `${trans.quote.title} (${ReactMDShortcuts.quote})` } },
        { ...code, buttonProps: { "aria-label": trans.code.title, title: `${trans.code.title} (${ReactMDShortcuts.code})` } },
        { ...codeBlock, buttonProps: { "aria-label": trans.codeBlock.title, title: `${trans.codeBlock.title} (${ReactMDShortcuts.codeBlock})` } },
        { ...comment, buttonProps: { "aria-label": trans.comment.title, title: `${trans.comment.title} (${ReactMDShortcuts.comment})` } },
        { ...image, buttonProps: { "aria-label": trans.image.title, title: `${trans.image.title} (${ReactMDShortcuts.image})` } },
        divider,
        {
            ...unorderedListCommand,
            buttonProps: {
                "aria-label": trans.unorderedListCommand.title,
                title: `${trans.unorderedListCommand.title} (${ReactMDShortcuts.unorderedListCommand})`,
            },
        },
        {
            ...orderedListCommand,
            buttonProps: {
                "aria-label": trans.orderedListCommand.title,
                title: `${trans.orderedListCommand.title} (${ReactMDShortcuts.orderedListCommand})`,
            },
        },
        {
            ...checkedListCommand,
            buttonProps: {
                "aria-label": trans.checkedListCommand.title,
                title: `${trans.checkedListCommand.title} (${ReactMDShortcuts.checkedListCommand})`,
            },
        },
    ];
};

export default getLocaleCommands;
