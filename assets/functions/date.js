import { format as datefnsFormat } from "date-fns";
import { fr } from "date-fns/locale";

const format = (isoDateString) => {
    const d = new Date(isoDateString);

    return datefnsFormat(d, "dd MMMM yyyy, HH", { locale: fr }) + "h" + datefnsFormat(d, "mm", { locale: fr });
};

export default {
    format,
};
