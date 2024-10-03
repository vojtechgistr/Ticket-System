import React, {useEffect, useState} from "react";
import {AuthenticationService, registerRequest} from "../../../../common/authenticationService.ts";
import {useNavigate} from "react-router-dom";
import {Helmet, HelmetProvider} from "react-helmet-async";
import {FaUserAlt} from "react-icons/fa";
import {doPasswordsMatch, validateEmail, validatePassword, validateUsername} from "../validations.ts";
import AuthWave from "../../../../common/components/waves/auth.tsx";

const TITLE: string = "Register | Void Dashboard";

import '../auth.css';
import {MdOutlineAlternateEmail} from "react-icons/md";
import {PiPasswordFill, PiPasswordLight} from "react-icons/pi";
import {FiAlertCircle} from "react-icons/fi";

const RegisterPage = () => {
    const [registerError, setRegisterError] = useState<string>('');
    const [credentials, setCredentials] = useState<registerRequest>({
        displayName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (AuthenticationService.isLoggedIn()) {
            navigate("/dashboard");
        }
    }, []);

    const handleAlert = (field: keyof registerRequest, validity: boolean): void => {
        const alertIcon: HTMLDivElement | null = document.querySelector(`#${field}-alert-icon`);
        if (!alertIcon) {
            return;
        }

        alertIcon.style.opacity = validity ? "0" : "1";
    }

    const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const displayName = (document.querySelector("input[name='displayName']") as HTMLInputElement).value;
        const email = (document.querySelector("input[name='email']") as HTMLInputElement).value;
        const password = (document.querySelector("input[name='password']") as HTMLInputElement).value;
        const confirmPassword = (document.querySelector("input[name='repeat-password']") as HTMLInputElement).value;

        let errorCount: number = 0;
        if (!validateUsername(displayName).status) {
            handleAlert("displayName", false);
            errorCount++;
        }
        if (!validateEmail(email).status) {
            handleAlert("email", false);
            errorCount++;
        }
        if (!validatePassword(password).status) {
            handleAlert("password", false);
            errorCount++;
        }
        if (!doPasswordsMatch(password, confirmPassword)) {
            handleAlert("password", false);
            handleAlert("confirmPassword", false);
            errorCount++;
        }

        if (errorCount > 0) {
            return;
        }

        const request = AuthenticationService.register(credentials);
        request.then(response => {
            setRegisterError(response.data);

            if (response.status == 200) {
                navigate("/dashboard");
            }
        })

        request.catch(err => {
            if (typeof err.response.data === "object") {
                const errorGroups: string[][] = err.response.data.errors;
                let message: string = "";
                for (const group in errorGroups) {
                    for (const error in errorGroups[group]) {
                        message += errorGroups[group][error] + "";
                    }
                }

                setRegisterError(message);
            } else {
                setRegisterError(err.response.data);
            }
        });
    }

    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>{TITLE}</title>
                </Helmet>
            </HelmetProvider>

            <div className='auth-container'>
                <div className='auth-box'>
                    <form className='auth-form' onSubmit={e => handleRegister(e)}>
                        <h1>Register</h1>

                        <div className='auth-input'>
                            <FaUserAlt/>

                            <input type="text" placeholder="Username" name="displayName"
                                   onInput={(e) => {
                                       const validatedUsername = validateUsername(e.currentTarget.value);
                                       setCredentials(prev => ({
                                               ...prev,
                                               displayName: validatedUsername.value
                                           })
                                       );

                                       handleAlert("displayName", validatedUsername.status);
                                   }} maxLength={255} minLength={4}/>


                            <div className="input-alert-icon" id="displayName-alert-icon">
                                <FiAlertCircle/>
                            </div>
                        </div>

                        <div className='auth-input'>
                            <MdOutlineAlternateEmail/>

                            <input type="email" placeholder="Email" name="email"
                                   onInput={(e) => {
                                       const validatedEmail = validateEmail(e.currentTarget.value);
                                       setCredentials(prev => ({
                                               ...prev,
                                               email: validatedEmail.value
                                           })
                                       );

                                       handleAlert("email", validatedEmail.status);
                                   }}/>

                            <div className="input-alert-icon" id="email-alert-icon">
                                <FiAlertCircle/>
                            </div>
                        </div>

                        <div className='auth-input'>
                            <PiPasswordFill/>

                            <input type="password" placeholder="Password" name="password"
                                   onInput={(e) => {
                                       const validatedPassword = validatePassword(e.currentTarget.value);
                                       setCredentials(prev => ({
                                               ...prev,
                                               password: validatedPassword.value
                                           })
                                       );

                                       handleAlert("password", validatedPassword.status);
                                   }} maxLength={255} minLength={8}/>

                            <div className="input-alert-icon" id="password-alert-icon">
                                <FiAlertCircle/>
                            </div>
                        </div>

                        <div className='auth-input'>
                            <PiPasswordLight/>

                            <input type="password" placeholder="Confirm Password" name="repeat-password"
                                   onInput={(e) => {
                                       const validatedPassword = validatePassword(e.currentTarget.value);
                                       setCredentials(prev => ({
                                               ...prev,
                                               confirmPassword: validatedPassword.value
                                           })
                                       );

                                       handleAlert("confirmPassword", validatedPassword.status);
                                   }} maxLength={255} minLength={8}/>

                            <div className="input-alert-icon" id="confirmPassword-alert-icon">
                                <FiAlertCircle/>
                            </div>
                        </div>

                        <div className="auth-error">{registerError}</div>

                        <button type="submit" className="auth-button">Continue</button>
                    </form>
                </div>

                <AuthWave styles={{bottom: 0, position: "absolute"}}/>
            </div>
        </>
    )
}

export default RegisterPage;