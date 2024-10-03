import React from "react";
import {IoWarningOutline} from "react-icons/io5";

export type warningModalProps = {
    title: string,
    message: string,
    isOpen: boolean,
    onClose: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
}

const WarningModal = ({title, message, isOpen, onClose}: warningModalProps) => {
    return (
        <div className={`popup-container ${isOpen ? "" : "hidden"}`}>
            <div className="popup-box">
                <div className="popup-heading-icon">
                    <IoWarningOutline/>
                </div>

                <div className="popup-content">
                    <div className="popup-header">
                        <h2 style={{textAlign: "center"}}>{title}</h2>
                    </div>

                    <div className="popup-body">
                        <p style={{textAlign: "center"}}>{message}</p>

                    </div>

                    <div className="popup-footer">
                        <div className="footer-spacer"></div>
                        <button onClick={(e) => onClose(e)}>Dismiss</button>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default WarningModal;