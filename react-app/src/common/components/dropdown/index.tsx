import React, {useState, createContext, useContext, useEffect} from "react";
import './index.css';

type IsOpenContextType = {
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
};

const typeIsOpenContextState: IsOpenContextType = {
    isOpen: false,
    setIsOpen: () => null
};

const IsOpenContext = createContext<IsOpenContextType>(typeIsOpenContextState);

export function Dropdown({children}: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleOutsideClickClose = (e: MouseEvent) => {
        if (!(e.target as Element).closest(".dropdown")) {
            setIsOpen(false);
        }
    }

    useEffect(() => {
        document.onmousedown = (e: MouseEvent) => handleOutsideClickClose(e);

        return () => {
            document.onmousedown = null;
        }
    }, []);

    return (
        <div className='dropdown'>
            <IsOpenContext.Provider value={{isOpen, setIsOpen}}>
                {children}
            </IsOpenContext.Provider>
        </div>
    )
}

Dropdown.Title = ({children}: { children: React.ReactNode }) => {
    const {setIsOpen} = useContext(IsOpenContext);

    const handleDropdownToggle = () => {
        setIsOpen(prev => !prev);
    }

    return (
        <button className="dropdown-title" id="dropdown-title" onClick={handleDropdownToggle}>
            {children}
        </button>
    )
}

Dropdown.Items = ({children}: { children: React.ReactNode }) => {
    const {isOpen} = useContext(IsOpenContext);
    return (
        (isOpen) ?
            <div className='dropdown-items'>
                {children}
            </div>
            : <></>
    );
}

type DropdownItemProps = {
    onClick: () => void
    children: React.ReactNode
}

export function DropdownItem({onClick, children}: DropdownItemProps) {
    return (
        <button onClick={onClick} className='dropdown-item'>
            {children}
        </button>
    )
}

Dropdown.Divider = () => {
    return <div className="divider"/>
}

Dropdown.Section = ({text}: { text: string }) => {
    return (
        <div className='section'>
            {text}
        </div>
    )
}