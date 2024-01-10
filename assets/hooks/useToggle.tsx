import { Dispatch, SetStateAction, useCallback, useState } from "react";

type UseToggleReturn = [boolean, () => void, Dispatch<SetStateAction<boolean>>];

const useToggle = (initialValue: boolean = false): UseToggleReturn => {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => setValue((prevValue) => !prevValue), []);

    return [value, toggle, setValue];
};

export default useToggle;
