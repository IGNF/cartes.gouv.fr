import { type CommunityToolsType, measureTools, navigationTools, otherTools, reportTools } from "../../../../../@types/app_espaceco";

const cloneNavigationTools = [...navigationTools] as string[];
const cloneMeasureTools = [...measureTools] as string[];
const cloneReportTools = [...reportTools] as string[];
const cloneOtherTools = [...otherTools] as string[];

const allTools: string[] = Array.from(new Set([...navigationTools, ...measureTools, ...reportTools, ...otherTools]));

const getTools = (functionalities: string[], type: CommunityToolsType) => {
    switch (type) {
        case "navigation":
            return functionalities.filter((f) => cloneNavigationTools.includes(f));
        case "measure":
            return functionalities.filter((f) => cloneMeasureTools.includes(f));
        case "report":
            return functionalities.filter((f) => cloneReportTools.includes(f));
        case "other":
            return functionalities.filter((f) => cloneOtherTools.includes(f));
    }
};

export { getTools, allTools };
