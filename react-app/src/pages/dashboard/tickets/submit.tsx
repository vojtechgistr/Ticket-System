import {SubmitButton, useSettingsBase} from "../profile";
import axios from "axios";
import WarningModal, {warningModalProps} from "../../../common/components/modals/warning.tsx";
import useModal from "../../../hooks/useModal.ts";
import '../auth/auth.css'
import React from "react";
import AuthWave from "../../../common/components/waves/auth.tsx";

type ticketDto = {
    title?: string,
    content?: string,
}
const TicketsPage = () => {
    const [canSave, changes, setChange] = useSettingsBase<ticketDto>({}, 2);

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

            <div className="box-wrapper" style={{zIndex: 100}}>
                <div className="box">
                    <div className="box-header">
                        <h2>Send a Ticket</h2>
                    </div>

                    <div className="user-info">
                        <div className="data-wrapper" style={{marginTop: "12px"}}>
                            <input type="text" name="title" autoComplete="off" placeholder="Title (4-40 characters)"
                                   style={{width: "100%", fontSize: "1.4em"}} onInput={(e) => {
                                const value = e.currentTarget.value;
                                let status: boolean = value.length >= 4 && value.length <= 40;
                                setChange("title", {status: status, value: value});
                            }}/>
                        </div>

                        <div className="data-wrapper" style={{marginTop: "12px", width: "40vw", height: "20vh"}}>
                            <textarea placeholder="Content (12-200 characters)" name="content" onInput={(e) => {
                                const value = e.currentTarget.value;
                                let status: boolean = value.length >= 12 && value.length <= 200;
                                setChange("content", {status: status, value: value});
                            }}/>
                        </div>

                        <SubmitButton disabled={!canSave} onClick={() => {
                            axios.post("ticket/send", changes).then(res => {
                                if (res.status == 202) {
                                    setWarningState(prev => ({
                                        ...prev,
                                        isOpen: true,
                                        title: "Sent!",
                                        message: res.data.content,
                                        onClick: () => window.location.reload()
                                    }));
                                }
                            }).catch(err => {
                                if (typeof err.response.data === "object") {
                                    const errorGroups: string[][] = err.response.data.errors;
                                    let message: string = "";
                                    for (const group in errorGroups) {
                                        for (const error in errorGroups[group]) {
                                            message += errorGroups[group][error] + "";
                                        }
                                    }

                                    setWarningState(prev => ({
                                        ...prev,
                                        isOpen: true,
                                        title: `Error (${err.code})`,
                                        message: message,
                                    }));
                                } else {
                                    setWarningState(prev => ({
                                        ...prev,
                                        isOpen: true,
                                        title: `Error (${err.code})`,
                                        message: err.response.data.errors
                                    }));
                                }
                            })
                        }}/>
                    </div>
                </div>
            </div>

            <AuthWave
                styles={{bottom: 0, position: "absolute", backgroundColor: "var(--purple-hover)", opacity: "0.8"}}/>
        </>
    )
}

export default TicketsPage;