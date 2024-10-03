import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {FaLock, FaUserAlt} from "react-icons/fa";
import {validateEmail, validatePassword} from "../validations.ts";

import {Helmet, HelmetProvider} from 'react-helmet-async';

const TITLE: string = "Login | Void Dashboard";

import '../auth.css';
import {AuthenticationService, loginRequest} from "../../../../common/authenticationService.ts";
import AuthWave from "../../../../common/components/waves/auth.tsx";

function LoginPage() {
    const [loginError, setLoginError] = useState<string>('');
    const [credentials, setCredentials] = useState<loginRequest>({
        email: "",
        password: ""
    });

    const navigate = useNavigate();

    useEffect(() => {
        if(AuthenticationService.isLoggedIn()) {
            navigate("/dashboard");
        }
    }, []);
    
    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const request = AuthenticationService.login(credentials);
        request.then(response => {
            setLoginError(response.data);
            
            if (response.status == 200) {
                navigate("/dashboard");
            }
        }).catch(err => {
            setLoginError(err.response.data.errors.join(". "));
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
                    <form className='auth-form' onSubmit={e => handleLogin(e)}>
                        <h1>Login</h1>

                        <div className='auth-input'>
                            <FaUserAlt/>

                            <input type="email" placeholder="Email" name="email" onInput={(e) => {
                                let value = e.currentTarget.value;
                                value = validateEmail(value).value;
                                setCredentials(prev => ({
                                        ...prev,
                                        email: value
                                    })
                                );
                            }} maxLength={255} minLength={4}/>
                        </div>

                        <div className='auth-input'>
                            <FaLock/>

                            <input type="password" placeholder="Password" name="password" onInput={(e) => {
                                let value = e.currentTarget.value;
                                value = validatePassword(value).value;
                                setCredentials(prev => ({
                                        ...prev,
                                        password: value
                                    })
                                );
                            }} maxLength={255} minLength={8}/>
                        </div>


                        <div className="auth-error">{loginError}</div>

                        <button type="submit" className="auth-button">Continue</button>
                    </form>
                </div>

                <AuthWave styles={{bottom: 0, position: "absolute"}}/>
            </div>
        </>
    )
}

export default LoginPage;