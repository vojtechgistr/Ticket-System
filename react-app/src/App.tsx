import React, {useEffect} from "react";
import {RouterProvider, Route, createBrowserRouter, createRoutesFromElements} from 'react-router-dom';

import {initTheme} from './common/themeUtils.ts';

import LoginPage from './pages/dashboard/auth/login/index.tsx';
import DashboardHome, {DashboardTicketList} from './pages/dashboard/index.tsx';
import Home from "./pages/main/index.tsx";
import PageNotFound from "./pages/pageNotFound/index.tsx";
import Profile from "./pages/dashboard/profile";
import RegisterPage from "./pages/dashboard/auth/register";
import axios from 'axios';
import {AuthenticationService} from "./common/authenticationService.ts";

axios.defaults.baseURL = "https://localhost:7255/api/";
axios.defaults.withCredentials = true;
axios.interceptors.request.use(config => {
    const token = AuthenticationService.getToken();
    if (token != null) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path='/' element={<Home/>}/>
            <Route path='/dashboard' element={<DashboardHome />}/>
            <Route path='/login' element={<LoginPage />}/>
            <Route path='/register' element={<RegisterPage />}/>
            <Route path='/dashboard/profile' element={<Profile />}/>
            <Route path='/dashboard/ticket/list' element={<DashboardTicketList />}/>
            
            <Route path='*' element={<PageNotFound />} />
        </>
    )
)

function App() {
    useEffect(() => {
        initTheme();
    }, []);
    
    return (
        <RouterProvider router={router}/>
    );
}

export default App