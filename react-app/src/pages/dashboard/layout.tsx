import './layout.css';
import {Dropdown, DropdownItem} from "../../common/components/dropdown";

import {defaultProfilePicture} from '../../common/config.ts';

import {BiCog, BiGroup} from "react-icons/bi";
import {AiFillGithub} from "react-icons/ai";
import {MdAirplaneTicket, MdArrowDropDown, MdOutlineBugReport} from "react-icons/md";
import {HiOutlineDocumentText, HiOutlineLightBulb, HiOutlineMoon} from "react-icons/hi";
import {BsAirplane, BsBoxArrowLeft, BsTicket, BsTicketDetailed} from "react-icons/bs";
import React, {useContext, useEffect, useLayoutEffect, useState} from "react";
import {FaBars, FaHome} from "react-icons/fa";
import {handleNavigationClick} from "../../common/helpers.ts";
import {getCurrentTheme, toggleTheme} from "../../common/themeUtils.ts";
import UserContext, {UserContextType} from "../../hooks/useUserContext.ts";
import LoadingCircle from "../../common/components/loadingCircle";
import {AuthenticationService} from "../../common/authenticationService.ts";
import {useNavigate} from "react-router-dom";
import useModal from "../../hooks/useModal.ts";
import WarningModal, {warningModalProps} from "../../common/components/modals/warning.tsx";
import {FaTicket, FaTicketSimple} from "react-icons/fa6";
import {GiTicket} from "react-icons/gi";
import {GrTicket} from "react-icons/gr";
import {IoTicket} from "react-icons/io5";
import {ImTicket} from "react-icons/im";
import {FiAirplay} from "react-icons/fi";

function DashboardLayout({children}: { children: React.ReactNode }) {
    const [data, setData] = useState<UserContextType | null>(null);
    const navigate = useNavigate();

    const handleWarningClose = () => {
        setWarningState(prev => ({
            ...prev,
            isOpen: false,
        }));
    }

    const [warningState, setWarningState] = useModal<warningModalProps>({
        isOpen: false,
        title: "",
        message: "",
        onClose: handleWarningClose,
    });

    useEffect(() => {
        const controller = new AbortController();

        AuthenticationService.getCurrentUser(controller)
            .then(res => {
                if (res.status == 200) {
                    const user = res.data.content;
                    setData({
                        displayName: user.displayName,
                        tag: user.tag,
                        email: user.email,
                        roles: user.roles,
                        createdAt: user.createdAt,
                        avatarUrl: user.avatarUrl,
                        bannerColor: user.bannerColor,
                    });
                    
                    return;
                }
                
                setWarningState(prev => ({
                    ...prev,
                    isOpen: true,
                    title: `Status ${res.status}`,
                    message: res.data.errors.join(". "),
                }));
                
            })
            .catch(err => {
                console.log(err)
                if (err.code == "ERR_CANCELED") {
                    return;
                }

                if (err.status == 401) {
                    AuthenticationService.logout();
                    setWarningState(prev => ({
                        ...prev,
                        title: "Not Authorized",
                        message: "Are you logged in?",
                        isOpen: true,
                        onClose: () => navigate('/login')
                    }));

                    return;
                }

                setWarningState(prev => ({
                    ...prev,
                    isOpen: true,
                    title: `Error (${err.code})`,
                    message: err.response?.data.errors.join(" ") ?? err.message,
                }));
            });

        return () => controller.abort();
    }, []);

    return (
        <>
            <WarningModal title={warningState.title} message={warningState.message} isOpen={warningState.isOpen}
                          onClose={warningState.onClose}/>

            <div className="dashboard-container">
                <UserContext.Provider value={data}>

                    <SideNavbar/>
                    <Header/>

                    <div className='dashboard-content'>
                        {children}
                    </div>

                </UserContext.Provider>
            </div>
        </>
    )
}

export function Header() {
    const userContext: UserContextType | null = useContext(UserContext);
    const [currentTheme, setCurrentTheme] = useState<string>();
    const navigate = useNavigate();

    useEffect(() => {
        const theme = getCurrentTheme();
        setCurrentTheme(theme);
    }, []);

    function handleLogout() {
        AuthenticationService.logout()
        navigate("/login");
    }

    function handleToggleTheme() {
        const newTheme: string = toggleTheme();
        setCurrentTheme(newTheme);
    }

    return (
        <>
            <nav className='dashboard-header'>
                <div className='header-buttons'>
                    <Dropdown>
                        <Dropdown.Title>
                            <img src={userContext?.avatarUrl} onError={e => {
                                e.currentTarget.src = defaultProfilePicture;
                                e.currentTarget.onerror = null;
                            }} alt=''/>
                            {userContext?.displayName
                                ? <p>{userContext.displayName}</p>
                                : <LoadingCircle scale={1.5}/>}
                            <MdArrowDropDown/>
                        </Dropdown.Title>

                        <Dropdown.Items>
                            <DropdownItem onClick={() => handleNavigationClick("/dashboard/profile", "_self")}>
                                <BiCog/>
                                <p>My Account</p>
                            </DropdownItem>

                            <Dropdown.Divider/>
                            <Dropdown.Section text='Help & Support'/>

                            <DropdownItem
                                onClick={() => handleNavigationClick("https://github.com/vojtechgistr/project-management-tool", "_blank")}>
                                <AiFillGithub/>
                                <p>GitHub</p>
                            </DropdownItem>

                            <DropdownItem
                                onClick={() => handleNavigationClick("https://github.com/vojtechgistr/project-management-tool/wiki", "_blank")}>
                                <HiOutlineDocumentText/>
                                <p>Documentation</p>
                            </DropdownItem>

                            <DropdownItem
                                onClick={() => handleNavigationClick("https://github.com/vojtechgistr/project-management-tool/issues/new", "_blank")}>
                                <MdOutlineBugReport/>
                                <p>Report a Bug</p>
                            </DropdownItem>

                            <Dropdown.Divider/>
                            <Dropdown.Section text="Themes"></Dropdown.Section>

                            <DropdownItem onClick={handleToggleTheme}>

                                {currentTheme === "light" ? <HiOutlineLightBulb/> : <HiOutlineMoon/>}
                                <p style={{textTransform: "capitalize"}}>{currentTheme} mode</p>
                            </DropdownItem>

                            <Dropdown.Divider/>

                            <DropdownItem onClick={handleLogout}>
                                <BsBoxArrowLeft/>
                                <p>Sign Out</p>
                            </DropdownItem>

                        </Dropdown.Items>
                    </Dropdown>

                    <div className='logout' onClick={handleLogout}>
                        <BsBoxArrowLeft/>
                    </div>
                </div>
            </nav>
        </>
    );
}

export function SideNavbar() {
    const userContext: UserContextType | null = useContext(UserContext);
    const [isOpen, setIsOpen] = useState<boolean>(true);

    useEffect(() => {
        const isSetToOpen = localStorage.getItem('side-navbar-open') === "true";
        handleToggle(isSetToOpen);
    }, [userContext]);

    useLayoutEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (isOpen && width < 768) {
                handleToggle();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [isOpen]);


    const handleToggle = (value?: boolean) => {
        const newValue: boolean = value ?? !isOpen;
        setIsOpen(newValue);
        processSidebarToggle(newValue, true);
        localStorage.setItem("side-navbar-open", `${newValue}`);
    }

    return (
        <div className='dashboard-left-bar open'>
            <div className='dashboard-header-title'
                 onClick={() => handleToggle()}>
                <h1>Dashboard</h1>
                <FaBars/>
            </div>

            {!userContext ?
                <LoadingCircle scale={3}/>
                :
                <>

                    <div className='dashboard-left-bar-item-section'>
                        <h2 data-text="navigation">Navigation</h2>
                    </div>

                    <button className='dashboard-left-bar-item' id="Tickets"
                            onClick={() => handleNavigationClick("/dashboard", "_self")}>
                        <FiAirplay/>
                        <p>Submit a Ticket</p>
                    </button>
                    {
                        (userContext.roles && (userContext.roles.includes("Admin") || userContext.roles.includes("Owner"))) &&
                        <>
                            <div className='dashboard-left-bar-item-section'>
                                <h2 data-text="administration">Administration</h2>
                            </div>
                            
                            <button className='dashboard-left-bar-item' id="UserManagement"
                                    onClick={() => handleNavigationClick("/dashboard/ticket/list", "_self")}>
                                <BsTicketDetailed/>
                                <p>Tickets</p>
                            </button>

                            {/*<button className='dashboard-left-bar-item' id="UserManagement"*/}
                            {/*        onClick={() => handleNavigationClick("/dashboard/users", "_self")}>*/}
                            {/*    <BiGroup/>*/}
                            {/*    <p>Users</p>*/}
                            {/*</button>*/}
                        </>
                    }
                </>
            }
        </div>
    );
}

const processSidebarToggle = (isOpen: boolean, shouldAnimate: boolean) => {
    const leftSidebarDiv: HTMLDivElement | null = document.querySelector(".dashboard-left-bar");
    if (!leftSidebarDiv) {
        return console.log("Could not toggle left sidebar because leftSidebarOpen is undefined.");
    }

    if (isOpen && leftSidebarDiv.classList.contains("open")) {
        return;
    }

    if (isOpen) {
        leftSidebarDiv.classList.add("open");
    } else {
        leftSidebarDiv.classList.remove("open")
    }

    const container: HTMLDivElement | null = document.querySelector(".dashboard-container");
    const leftSidebarTitle: HTMLDivElement | null = document.querySelector(".dashboard-header-title");
    const leftSidebarTitleText: HTMLHeadingElement | null = document.querySelector(".dashboard-header-title h1");
    const allButtons: NodeListOf<HTMLDivElement> = document.querySelectorAll(".dashboard-left-bar .dashboard-left-bar-item");
    const allButtonTextItems: NodeListOf<HTMLParagraphElement> = document.querySelectorAll(".dashboard-left-bar .dashboard-left-bar-item p");
    const allIcons: NodeListOf<HTMLOrSVGImageElement> = document.querySelectorAll(".dashboard-left-bar .dashboard-left-bar-item svg");
    const allTitleItems: NodeListOf<HTMLHeadingElement> = document.querySelectorAll(".dashboard-left-bar .dashboard-left-bar-item-section h2");

    if (!container
        || !leftSidebarTitle
        || !leftSidebarTitleText
        || !allButtons
        || !allButtonTextItems
        || !allIcons
        || !allTitleItems) {
        return console.log("Could not toggle left sidebar because some elements are missing.");
    }
    if (shouldAnimate) {
        const duration = 200;

        leftSidebarTitle.animate([
            {padding: !isOpen ? "0 24px" : "0 17px",},
            {padding: !isOpen ? "0 17px" : "0 24px"},
        ], {
            duration: duration,
            easing: "ease-in-out",
            fill: "forwards"
        });

        leftSidebarTitleText.animate([
            {opacity: !isOpen ? "1" : "0"},
            {opacity: !isOpen ? "0" : "1"},
        ], {
            duration: duration,
            easing: "ease-in-out",
            fill: "forwards"
        });

        setTimeout(() => {
            // toggle left sidebar title visibility
            const title = leftSidebarTitle.children[1] as HTMLHeadingElement;
            title.style.marginTop = !isOpen ? "4px" : "0";
            title.style.marginBottom = !isOpen ? "4px" : "0";
            leftSidebarTitleText.style.position = !isOpen ? "absolute" : "relative";
            leftSidebarTitleText.style.visibility = !isOpen ? "hidden" : "visible";
        }, duration / 2);


        // animate left sidebar and its elements
        allButtonTextItems.forEach((item) => {
            // animate button text
            item.animate([
                {opacity: !isOpen ? "1" : "0"},
                {opacity: !isOpen ? "0" : "1"},
            ], {
                duration: duration,
                easing: "ease-in-out",
                fill: "forwards"
            });

            setTimeout(() => {
                // toggle button text visibility
                item.style.position = !isOpen ? "absolute" : "relative";
                item.style.visibility = !isOpen ? "hidden" : "visible";
            }, duration / 2);
        });

        allButtons.forEach((item) => {
            // animate buttons
            item.animate([
                {padding: !isOpen ? "8px 16px" : "0 0 0 0", justifyContent: !isOpen ? "flex-start" : "center"},
                {padding: !isOpen ? "0 0 0 0" : "8px 16px", justifyContent: !isOpen ? "center" : "flex-start"},
            ], {
                duration: duration,
                easing: "ease-in-out",
                fill: "forwards"
            });
        });

        allIcons.forEach((item) => {
            // animate icons
            item.animate([
                {marginRight: !isOpen ? "8px" : "0"},
                {marginRight: !isOpen ? "0" : "8px"},
            ], {
                duration: duration,
                easing: "ease-in-out",
                fill: "forwards"
            });
        });

        allTitleItems.forEach((item) => {
            // animate title text
            item.animate([
                {justifyContent: !isOpen ? "flex-start" : "center"},
                {justifyContent: !isOpen ? "center" : "flex-start"},
            ], {
                duration: duration,
                easing: "ease-in-out",
                fill: "forwards"
            });

            if (!item.dataset) {
                return;
            }

            setTimeout(() => {
                if (!item.dataset.text) {
                    return;
                }

                item.innerText = !isOpen ? item.dataset.text.slice(0, 3) : item.dataset.text;
            }, duration / 2);


        });

        // animate left sidebar
        leftSidebarDiv.animate([
            {width: !isOpen ? "240px" : "56px"},
            {width: !isOpen ? "56px" : "240px"},
        ], {
            duration: duration,
            easing: "ease-in-out",
            fill: "forwards"
        });

        // animate container to match left sidebar
        container.animate([
            {gridTemplateColumns: !isOpen ? "240px" : "56px"},
            {gridTemplateColumns: !isOpen ? "56px" : "240px"},
        ], {
            duration: duration,
            easing: "ease-in-out",
            fill: "forwards"
        });
    } else {
        // toggle left sidebar without animation
        leftSidebarTitle.style.padding = !isOpen ? "0 17px" : "0 24px";
        const title = leftSidebarTitle.children[1] as HTMLHeadingElement;
        title.style.marginTop = !isOpen ? "4px" : "0";
        title.style.marginBottom = !isOpen ? "4px" : "0";
        leftSidebarTitleText.style.position = !isOpen ? "absolute" : "relative";
        leftSidebarTitleText.style.visibility = !isOpen ? "hidden" : "visible";
        leftSidebarTitleText.style.opacity = !isOpen ? "0" : "1";

        allButtons.forEach((item) => {
            item.style.padding = !isOpen ? "0 0 0 0" : "8px 16px";
            item.style.justifyContent = !isOpen ? "center" : "flex-start";
        });

        allButtonTextItems.forEach((item) => {
            item.style.position = !isOpen ? "absolute" : "relative";
            item.style.visibility = !isOpen ? "hidden" : "visible";
            item.style.opacity = !isOpen ? "0" : "1";
        });

        allIcons.forEach((item) => {
            item.style.marginRight = !isOpen ? "0" : "8px";
        });

        allTitleItems.forEach((item) => {
            item.style.justifyContent = !isOpen ? "center" : "flex-start";

            if (!item.dataset.text) {
                return;
            }

            item.innerText = !isOpen ? item.dataset.text.slice(0, 3) : item.dataset.text;
        });

        leftSidebarDiv.style.width = !isOpen ? "56px" : "240px";
        container.style.gridTemplateColumns = !isOpen ? "56px" : "240px";
    }
}

export default DashboardLayout;