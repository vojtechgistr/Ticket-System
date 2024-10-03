import React, {useState} from "react";

function useModal<Type extends object>(initialState: Type): [state: Type, setState: React.Dispatch<React.SetStateAction<Type>>] {
    const [state, setState] = useState<Type>(initialState);
    return [state, setState];
}

export default useModal;