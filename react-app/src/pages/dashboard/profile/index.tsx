import DashboardLayout from "../layout.tsx";
import {FcPlus, FcServices} from "react-icons/fc";
import {defaultProfilePicture} from "../../../common/config.ts";
import UserContext, {UserContextType} from "../../../hooks/useUserContext.ts";
import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {Helmet, HelmetProvider} from "react-helmet-async";

import './index.css';
import {HiOutlineHashtag} from "react-icons/hi";
import {MdOutlineAlternateEmail, MdOutlineLock} from "react-icons/md";
import {BiKey} from "react-icons/bi";
import Select, {ActionMeta, OnChangeValue, StylesConfig} from 'react-select';
import {
    doPasswordsMatch,
    isFileValid,
    validateEmail,
    validatePassword,
    validateTag,
    validateUsername
} from "../auth/validations.ts";
import {BsShieldLock} from "react-icons/bs";
import {AiOutlineUpload} from "react-icons/ai";
import axios from "axios";
import WarningModal, {warningModalProps} from "../../../common/components/modals/warning.tsx";
import useModal from "../../../hooks/useModal.ts";
import {AuthenticationService} from "../../../common/authenticationService.ts";
import {getHighestRole, getLowerRoles, handleNavigationClick} from "../../../common/helpers.ts";
import {averageColorToGradient, getAverageColor, RGBColor} from "../../../common/bannerUtils.ts";

const TITLE: string = "Profile";

function Profile() {
    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>{TITLE}</title>
                </Helmet>
            </HelmetProvider>

            <DashboardLayout>
                <div className="profile-container">
                    <ProfileTop/>
                    <ProfileBottom/>
                </div>
            </DashboardLayout>
        </>
    );
}

const ProfileTop = () => {
    const userContext: UserContextType | null = useContext(UserContext);

    useEffect(() => {
        const avatarElement: HTMLImageElement | null = document.querySelector("img#profile-picture");
        if (!avatarElement) return;

        const controller = new AbortController();
        const banner: HTMLDivElement | null = document.querySelector(".profile-container .profile");
        if (!banner) {
            console.log("Could not update banner, element is null");
            return;
        }
        
        banner.style.background = localStorage.getItem("bannerGradient") ?? "";

        avatarElement.onload = () => {
            //
            // if (!userContext?.bannerColor) {
            const averageColor = getAverageColor(avatarElement as HTMLImageElement);
            const gradient = averageColorToGradient(averageColor);
            banner.style.background = gradient;
            localStorage.setItem("bannerGradient", gradient);

            // axios.post("user/info/update", {bannerColor: `[${averageColor.R},${averageColor.G},${averageColor.B}]`}, {
            //     signal: controller.signal,
            // }).then(res => {
            //     console.log(res);
            // }).catch(err => {
            //     console.log(err);
            // })
            // } else {
            //     const averageColor = JSON.parse(userContext?.bannerColor);
            //     const color: RGBColor = {
            //         R: averageColor[0],
            //         G: averageColor[1],
            //         B: averageColor[2],
            //     };
            //
            //     banner.style.background = averageColorToGradient(color);
            // }
        }

        return () => controller.abort();
    }, [userContext]);

    return (
        <div className="profile">
            <div className="profile-picture">
                <img src={userContext?.avatarUrl} onError={e => {
                    e.currentTarget.src = defaultProfilePicture;
                    e.currentTarget.onerror = null
                }} crossOrigin="anonymous" draggable="false" alt="" id="profile-picture"/>
            </div>

            <div className="profile-info">
                <div className="profile-name">
                    <p>{userContext?.displayName}</p>
                    <span>#{userContext?.tag}</span>
                </div>

                <div className="profile-email">{userContext?.email}</div>

                <div className="profile-bio">
                    <div className="profile-permission-level">
                        <FcServices/>
                        <span className="darker">Roles: </span>{userContext?.roles?.join(", ")}
                    </div>

                    <div className="created-at">
                        <FcPlus/>
                        <span
                            className="darker">Created at: </span>{userContext?.createdAt && new Date(userContext.createdAt.timestamp).toLocaleDateString() + ", " + new Date(userContext.createdAt.timestamp).toLocaleTimeString()}
                    </div>

                </div>
            </div>
        </div>
    );
};


export const ProfileBottom = () => {
    const userContext = useContext(UserContext);

    return (
        <div className="profile-bottom">
            <div className="box-wrapper">

                <div className="settings-wrapper">
                    <AccountSettings/>
                    <PasswordSettings/>

                    {userContext &&
                        <RoleSettings/>
                    }
                </div>

                <div className="settings-wrapper">
                    <AvatarSettings/>
                    <DeleteAccountSettings/>
                </div>
            </div>
        </div>
    )
}

export type SetChangeFunction<Type> = (
    key: keyof Type,
    validatorResponse: {
        status: boolean,
        value: any
    }
) => void;

export function useSettingsBase<Type extends object>(initialState: Type, minNumOfChanges: number = 1, canSaveAdditionalCheck: (changes: Type) => boolean = () => true)
    : [boolean, Type, SetChangeFunction<Type>] {
    const [changes, setChanges] = useState<Type>(initialState);

    const canSave: boolean = useMemo((): boolean => {
        const keys = Object.keys(changes) as Array<keyof Type>;
        const validKeys = keys.filter(
            (key) => changes[key] != undefined && changes[key] != ''
        );

        return canSaveAdditionalCheck(changes) && validKeys.length >= minNumOfChanges;
    }, [changes]);

    const setChange: SetChangeFunction<Type> = (key, validatorResponse): void => {
        if (!validatorResponse.status) {
            setChanges(prev => ({
                ...prev,
                [key]: undefined,
            }));

            return;
        }

        setChanges(prev => ({
            ...prev,
            [key]: validatorResponse.value,
        }));
    }

    return [canSave, changes, setChange];
}

export type accountSettingsDto = {
    displayName?: string,
    tag?: string,
    email?: string,
    roles?: string[],
    avatarUrl?: string,
    password?: passwordSettingsDto
}
export const AccountSettings = () => {
    const userContext: UserContextType | null = useContext(UserContext);
    const [canSave, changes, setChange] = useSettingsBase<accountSettingsDto>({});

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

    return (
        <>
            <WarningModal title={warningState.title} message={warningState.message} isOpen={warningState.isOpen}
                          onClose={warningState.onClose}/>
            <div className="box">
                <div className="box-header">
                    <h2>Account</h2>
                </div>

                <div className="user-info">

                    <h3>Name and Tag</h3>
                    <div className="data-wrapper">
                        {/* Change UserName */}
                        <input className="user-name-settings" autoComplete="displayName" type="text"
                               placeholder={userContext?.displayName} minLength={4} maxLength={32}
                               onInput={(e) => {
                                   const validatorResponse = validateUsername(e.currentTarget.value);
                                   e.currentTarget.value = validatorResponse.value;
                                   setChange("displayName", validatorResponse);
                               }}
                        />

                        <div className="vertical-divider"/>

                        <HiOutlineHashtag className="tag"/>

                        {/* Change tag */}
                        <input className="user-tag-settings" autoComplete="off" type="text"
                               placeholder={userContext?.tag} min={0} max={9999} maxLength={4}
                               onInput={(e) => {
                                   const validatorResponse = validateTag(e.currentTarget.value);
                                   e.currentTarget.value = validatorResponse.value;
                                   setChange("tag", validatorResponse);
                               }}
                        />
                    </div>

                    <h3>Email</h3>
                    <div className="data-wrapper">
                        <MdOutlineAlternateEmail className="email"/>

                        <div className="vertical-divider"/>

                        {/* Change email */}
                        <input className="user-email-settings" autoComplete="email" type="email"
                               placeholder={userContext?.email} minLength={4} maxLength={255}
                               onInput={(e) => {
                                   const validatorResponse = validateEmail(e.currentTarget.value);
                                   e.currentTarget.value = validatorResponse.value;
                                   setChange("email", validatorResponse);
                               }}
                        />
                    </div>

                    <SubmitButton disabled={!canSave} onClick={() => {
                        axios.post("user/info/update", changes).then(res => {
                            if (res.status == 200) {
                                window.location.reload();
                            }
                        }).catch(err => {
                            console.log(err);
                            setWarningState(prev => ({
                                ...prev,
                                isOpen: true,
                                title: `Error (${err.code})`,
                                message: err.response.data.errors ?? err.message,
                            }));
                        })
                    }}/>
                </div>
            </div>
        </>
    )
}

type passwordSettingsDto = {
    oldPassword?: string,
    password?: string,
    confirmPassword?: string,
}
export const PasswordSettings = () => {

    const canSaveAdditionalCheck = (changes: passwordSettingsDto): boolean => {
        if (!changes.password || !changes.confirmPassword || !changes.oldPassword) {
            return false;
        }

        return doPasswordsMatch(changes.password, changes.confirmPassword);
    }

    const [canSave, changes, setChange] = useSettingsBase<passwordSettingsDto>({}, 3, canSaveAdditionalCheck);

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

    return (
        <>
            <WarningModal title={warningState.title} message={warningState.message} isOpen={warningState.isOpen}
                          onClose={warningState.onClose}/>
            <div className="box">
                <div className="box-header">
                    <h2>Change Password</h2>
                </div>

                <div className="user-info">
                    <h3>Old Password</h3>
                    <div className="data-wrapper">
                        <MdOutlineLock className="password"/>

                        <div className="vertical-divider"/>

                        <input className="user-password-settings" autoComplete="off" type="password"
                               minLength={8} maxLength={255}
                               onInput={(e) => {
                                   const validatorResponse = validatePassword(e.currentTarget.value);
                                   e.currentTarget.value = validatorResponse.value;
                                   setChange("oldPassword", validatorResponse);
                               }}
                        />
                    </div>

                    <h3>New password</h3>
                    <div className="data-wrapper">
                        <BsShieldLock className="password"/>

                        <div className="vertical-divider"></div>

                        <input className="user-password-settings" autoComplete="off" type="password"
                               minLength={8} maxLength={255}
                               onInput={(e) => {
                                   const validatorResponse = validatePassword(e.currentTarget.value);
                                   e.currentTarget.value = validatorResponse.value;
                                   setChange("password", validatorResponse);
                               }}
                        />
                    </div>

                    <h3>Confirm new password</h3>
                    <div className="data-wrapper">
                        <BsShieldLock className="password"/>

                        <div className="vertical-divider"></div>

                        <input className="user-password-settings" autoComplete="off" type="password"
                               minLength={8} maxLength={255}
                               onInput={(e) => {
                                   const validatorResponse = validatePassword(e.currentTarget.value);
                                   e.currentTarget.value = validatorResponse.value;
                                   setChange("confirmPassword", validatorResponse);
                               }}
                        />
                    </div>

                    <SubmitButton disabled={!canSave} onClick={() => {
                        axios.post("user/password/update", changes)
                            .then(res => {
                                setWarningState(prev => ({
                                    ...prev,
                                    isOpen: true,
                                    title: res.request.title,
                                    message: res.data.content,
                                    onClose: () => window.location.reload(),
                                }));
                            })
                            .catch(err => {
                                setWarningState(prev => ({
                                    ...prev,
                                    isOpen: true,
                                    title: `Error (${err.code})`,
                                    message: err.response.data.errors
                                }));
                            });
                    }}/>
                </div>
            </div>
        </>
    );
}


type avatarSettingsDto = {
    avatarUrl?: File | null;
}
export const AvatarSettings = () => {
    const canSaveAdditionalCheck = (changes: avatarSettingsDto): boolean => {
        return changes.avatarUrl != null
            ? isFileValid(changes.avatarUrl)
            : false;
    }

    const [canSave, changes, setChanges,] = useSettingsBase<avatarSettingsDto>({}, 1, canSaveAdditionalCheck);
    const userContext = useContext(UserContext);

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

    return (
        <>

            <WarningModal title={warningState.title} message={warningState.message}
                          isOpen={warningState.isOpen}
                          onClose={warningState.onClose}/>
            <div className="box" id="avatar">
                <div className="box-header">
                    <h2>Avatar Settings</h2>
                </div>

                <div className="user-info">
                    <div className="avatar-wrapper">
                        <div className="avatar-upload">
                            <label htmlFor="avatar-upload-input">
                                <input type="file" id="avatar-upload-input" accept="image/*" onChange={e => {
                                    const files = e.currentTarget.files;
                                    if (files == null) {
                                        setChanges("avatarUrl", {status: false, value: null})
                                        return;
                                    }

                                    setChanges(
                                        "avatarUrl",
                                        {
                                            status: isFileValid(files[0]),
                                            value: files[0]
                                        });
                                }}/>

                                <div className="avatar-upload-button">

                                    <div className="avatar-upload-icon">
                                        <AiOutlineUpload/>
                                    </div>


                                    <p>Upload</p>
                                </div>
                            </label>
                        </div>

                        <div className="avatar-preview">
                            <div className="avatar-preview-image">
                                <img
                                    src={(changes.avatarUrl) && URL.createObjectURL(changes.avatarUrl)
                                        || userContext?.avatarUrl
                                        || defaultProfilePicture} alt=""
                                    onError={e => {
                                        e.currentTarget.src = defaultProfilePicture;
                                        e.currentTarget.onerror = null;
                                    }}
                                    id="new-avatar"
                                />
                            </div>
                        </div>
                    </div>

                    <p className="description">The maximum file size is 8 MB - PNG, JPEG, GIF, TIFF and WEBP formats
                        are allowed.</p>

                    <div className="submit-wrapper">
                        <SubmitButton disabled={!canSave} onClick={() => {
                            const file = changes.avatarUrl;
                            if (!file) {
                                // show popup error
                                return;
                            }

                            // const avatarElement: HTMLImageElement | null = document.querySelector("img#new-avatar");
                            // if (avatarElement) {
                            //     const banner: HTMLDivElement | null = document.querySelector(".profile-container .profile");
                            //     if (!banner) {
                            //         console.log("Could not update banner, element is null");
                            //         return;
                            //     }
                            //
                            //     const averageColor = getAverageColor(avatarElement as HTMLImageElement);
                            //     banner.style.background = averageColorToGradient(averageColor);
                            //
                            //     axios.post("user/info/update", {bannerColor: `[${averageColor.R},${averageColor.G},${averageColor.B}]`})
                            //         .then(res => {
                            //             console.log(res);
                            //         }).catch(err => {
                            //         console.log(err);
                            //     });
                            // }

                            const formData = new FormData();
                            formData.append("avatar", file);

                            axios.post("user/avatar/update", formData, {
                                headers: {
                                    "Content-Type": "multipart/form-data",
                                }
                            }).then(res => {
                                if (res.status == 200) {
                                    window.location.reload();
                                }
                            }).catch(err => {
                                setWarningState(prev => ({
                                    ...prev,
                                    isOpen: true,
                                    title: `Error (${err.code})`,
                                    message: err.response.data.errors
                                }));
                            });
                        }}/>

                        <SubmitButton className="blue" title="Restore"
                                      disabled={changes.avatarUrl?.name == "default.webp"}
                                      onClick={async () => {
                                          const newAvatarFile = await fetch(defaultProfilePicture)
                                              .then(response => response.blob())
                                              .then(blob => blob && new File([blob], "default.webp", {type: "image/webp"}));

                                          setChanges("avatarUrl", {status: true, value: newAvatarFile})
                                      }}/>
                    </div>
                </div>
            </div>
        </>
    )
}

type RoleOption = {
    label: string,
    value
        :
        string,
    isFixed
        :
        boolean
}

type roleSettingsDto = {
    roles?: string[],
}

export const RoleSettings = () => {
    const userContext: UserContextType | null = useContext(UserContext);
    const stringArrayToRoleOptions = (array?: string[]): RoleOption[] | undefined => {
        if (!userContext?.roles) {
            return undefined;
        }

        return array?.map(role => {
            const obj: RoleOption = {
                value: role,
                label: role,
                isFixed: false,
            };

            if (role == "User" || role == getHighestRole(userContext.roles!)) {
                obj.isFixed = true;
            }

            return obj;
        });
    }

    const roleOptions = useMemo(() => {
        if (!userContext?.roles) {
            return undefined;
        }

        return stringArrayToRoleOptions(getLowerRoles(userContext.roles));
    }, []);

    const [selectedRoles, setSelectedRoles] = useState<readonly RoleOption[] | undefined>(
        stringArrayToRoleOptions(userContext?.roles)
    );

    const neededRoles: string[] = ["Admin", "Owner"];
    if (!selectedRoles
        || !roleOptions
        || !roleOptions?.some(role => neededRoles.includes(role.value))) {
        return null;
    }

    const [canSave, changes, setChange] = useSettingsBase<roleSettingsDto>({});

    useEffect(() => {
        let roleDifference: RoleOption[] = [];
        for (let i: number = 0; i < roleOptions.length; i++) {
            const contains: boolean = selectedRoles.some(role => roleOptions[i].value == role.value);
            if (!contains) {
                roleDifference.push(roleOptions[i]);
            }
        }

        if (roleDifference.length > 0) {
            setChange("roles", {status: true, value: selectedRoles.map(v => v.value)});
        } else {
            setChange("roles", {status: false, value: undefined});
        }
    }, [selectedRoles]);

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

    const customRoleSelectStyles: StylesConfig<RoleOption, true> = {
        control: (styles) => ({
            ...styles,
            background: "transparent",
            border: "none",
            boxShadow: "none",
        }),
        multiValue: (styles, state) => {
            return state.data.isFixed
                ? {
                    ...styles,
                    backgroundColor: "var(--gray)"
                }
                : {
                    ...styles,
                    backgroundColor: "var(--lighter-gray)",
                }
        },
        multiValueLabel: (styles) => ({
            ...styles,
            color: "var(--default-text)",
        }),
        multiValueRemove: (styles, state) => {
            return state.data.isFixed
                ? {display: "none"}
                : {
                    ...styles,
                    marginLeft: "4px",
                    ":hover": {
                        backgroundColor: "var(--red-hover)"
                    },
                }
        },
        menu: (styles) => ({
            ...styles,
            backgroundColor: "var(--gray)"
        }),
        option: (styles) => ({
            ...styles,
            backgroundColor: "var(--gray)",
            boxShadow: "none",
            ":hover": {
                backgroundColor: "var(--lighter-gray)",
            },
            ":focus": {
                backgroundColor: "var(--red)",
            }
        }),
    };

    const onRoleListChange = (
        newValue: OnChangeValue<RoleOption, true>,
        actionMeta: ActionMeta<RoleOption>
    ) => {
        switch (actionMeta.action) {
            case 'remove-value':
            case 'pop-value':
                if (actionMeta.removedValue.isFixed) {
                    return;
                }
                break;
            case 'clear':
                newValue = roleOptions.filter(v => v.isFixed);
                break;
        }

        setSelectedRoles(newValue);
    }

    return (
        <>
            <WarningModal title={warningState.title} message={warningState.message} isOpen={warningState.isOpen}
                          onClose={warningState.onClose}/>
            <div className="box">
                <div className="box-header">
                    <h2>Permissions</h2>
                </div>

                <div className="user-info">

                    <h3>Roles</h3>
                    <div className="data-wrapper">
                        <BiKey className="roles"/>

                        <div className="vertical-divider"></div>

                        <Select
                            isMulti={true}
                            classNamePrefix="an-simple-select"
                            isClearable={selectedRoles.some(v => !v.isFixed)}
                            value={selectedRoles}
                            options={roleOptions.filter(v => !v.isFixed)}
                            onChange={onRoleListChange}
                            closeMenuOnSelect={false}
                            styles={customRoleSelectStyles}
                        />
                    </div>

                    <SubmitButton disabled={!canSave} onClick={() => {
                        axios.post("user/roles/update", changes)
                            .then(res => {
                                AuthenticationService.setToken(res.data.content);
                                window.location.reload();
                            })
                            .catch(err => {
                                setWarningState(prev => ({
                                    ...prev,
                                    isOpen: true,
                                    title: `Error (${err.code})`,
                                    message: err.response.data.errors
                                }))
                            })
                    }}/>
                </div>
            </div>
        </>
    )
}

const deletePhrase = "I want to delete this account";
export const DeleteAccountSettings = () => {
    const [canDelete, setCanDelete] = useState<boolean>(false);

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

    return (
        <>
            <WarningModal title={warningState.title} message={warningState.message} isOpen={warningState.isOpen}
                          onClose={warningState.onClose}/>

            <div className="box" id="delete-account">
                <div className="box-header">
                    <h2 className="red">Delete Account</h2>
                </div>

                <div className="user-info">
                    <p className="account-delete-warning">This action is irreversible. If you continue, all your data
                        will
                        be
                        deleted.</p>

                    <h3>
                        Type "
                        <span style={{fontStyle: "italic", fontWeight: 400, color: "var(--green)", userSelect: "none"}}>
                        {deletePhrase}
                    </span>
                        " below to confirm:</h3>

                    <div className="data-wrapper">
                        <input autoComplete="off" type="text" onChange={(e) => {
                            setCanDelete(e.target.value === deletePhrase);
                        }}/>
                    </div>

                    <SubmitButton disabled={!canDelete} title="Delete Account" className="red" onClick={() => {
                        axios.post("user/delete").then(res => {
                            if (res.status == 200) {
                                AuthenticationService.logout();
                                handleNavigationClick("/login", "_self");
                            }
                        }).catch(err => {
                            setWarningState(prev => ({
                                ...prev,
                                isOpen: true,
                                title: `Error (${err.code})`,
                                message: err.response.data.errors
                            }));
                        })
                    }}/>
                </div>
            </div>
        </>
    )
}

type SubmitButtonProps = {
    disabled: boolean,
    onClick
        :
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    className?: string,
    title?: string,
    children?: React.ReactNode,
}
export const SubmitButton = ({
                                 disabled, onClick, className, title, children
                             }: SubmitButtonProps) => {
    return (
        <button className={`settings-submit-button ${className}`} disabled={disabled} onClick={onClick}>
            <p>{title || "Save"}</p>
            {children}
        </button>
    );
}
export default Profile;