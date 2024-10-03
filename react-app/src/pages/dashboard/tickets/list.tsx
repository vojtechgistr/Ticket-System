import {HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel} from "@microsoft/signalr";
import {apiServerUrl} from "../../../common/config.ts";
import WarningModal, {warningModalProps} from "../../../common/components/modals/warning.tsx";
import React, {useContext, useEffect, useState} from "react";
import useModal from "../../../hooks/useModal.ts";
import {Helmet, HelmetProvider} from "react-helmet-async";
import axios from "axios";
import {AuthenticationService} from "../../../common/authenticationService.ts";
import usePaginator from "../../../hooks/paginator/usePaginator.tsx";
import LoadingCircle from "../../../common/components/loadingCircle";
import UserContext, {UserContextType} from "../../../hooks/useUserContext.ts";

type ticket = {
    title: string,
    content: string,
    authorName: string,
    postDate: Date,
}
const TicketList = () => {
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

    const userContext: UserContextType | null = useContext(UserContext);
    const [tickets, setTickets] = useState<ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<ticket[]>([]);
    const [signalRHub, setSignalRHub] = useState<HubConnection>()
    const paginatorUI = usePaginator<ticket>({
        ItemElement: TicketItem,
        items: filteredTickets,
        maxItemsPerPage: 6,
    });

    const [searchValue, setSearchValue] = useState<string>("");

    const createHubConnection = () => {
        const rConnection = new HubConnectionBuilder()
            .withUrl(`${apiServerUrl}messageHub`, {
                accessTokenFactory(): string | Promise<string> {
                    const token = AuthenticationService.getToken();
                    if (!token) {
                        return Promise.reject("Unauthorized");
                    }

                    return Promise.resolve(token);
                }
            })
            .configureLogging(LogLevel.None)
            .withAutomaticReconnect()
            .build();

        setSignalRHub(rConnection);
    }

    useEffect(() => {
        createHubConnection();
    }, []);

    useEffect(() => {
        if (signalRHub?.state != HubConnectionState.Disconnected) {
            return;
        }

        signalRHub.start()
            .catch(err => {
                console.log(err);
                setWarningState(prev => ({
                    ...prev,
                    title: `Error ${err.status}`,
                    message: err.message,
                    isOpen: true,
                }));
            });

        signalRHub.on("ReceiveMQTicket", (message) => {
            const jsonMessage = JSON.parse(message);
            const ticketMessage: ticket = {
                title: jsonMessage.Title,
                content: jsonMessage.Content,
                authorName: jsonMessage.AuthorName,
                postDate: new Date(jsonMessage.PostDate),
            };

            setTickets(prev => [ticketMessage, ...prev]);
        });

        return () => {
            signalRHub?.stop();
        }
    }, [signalRHub]);

    useEffect(() => {
        const abortController = new AbortController();
        axios.get("ticket/get/all", {
            signal: abortController.signal,
        }).then(res => {
            const ticketMessages: ticket[] = res.data.map((message: any) => {
                return {
                    title: message.title,
                    content: message.content,
                    postDate: new Date(message.postDate),
                    authorName: message.authorName,
                }
            }).sort((a: ticket, b: ticket) => {
                return b.postDate.getTime() - a.postDate.getTime();
            });

            setTickets(ticketMessages);
        }).catch(err => {
            setWarningState(prev => ({
                ...prev,
                isOpen: true,
                title: `Error (${err.code})`,
                message: err.response?.data.errors ?? err.message,
            }));
        });
    }, []);

    useEffect(() => {
        handleSearch(searchValue)
    }, [tickets]);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        if (value == "") {
            setFilteredTickets(tickets);
        }

        value = value.toLowerCase();
        const filteredByValue = tickets.filter(ticket => {
            return ticket.title?.toLowerCase().includes(value)
                || ticket.authorName?.toLowerCase().includes(value)
                || ticket.content?.toLowerCase().includes(value);
        });

        setFilteredTickets(filteredByValue);
    }

    return (
        <>
            <WarningModal title={warningState.title} message={warningState.message} isOpen={warningState.isOpen}
                          onClose={warningState.onClose}/>

            <HelmetProvider>
                <Helmet>
                    <title>Submitted Tickets</title>
                </Helmet>
            </HelmetProvider>

            <div className="container full flex flex-column">
                <div className="search-bar">
                    <input type="text" placeholder="Search for Title | Content | Author &#x1F50E;&#xFE0E;"
                           onChange={(e) => handleSearch(e.currentTarget.value)}/>
                </div>

                <div className="list-wrapper">
                    {!userContext ? <LoadingCircle scale={4}/>
                        : paginatorUI}
                </div>
            </div>
        </>
    )
        ;
}

const TicketItem = ({data}: { data: ticket }) => {
    return (
        <>
            <div className="box ticket flex center">
                <div className="heading flex flex-column" style={{height: "100%", justifyContent: "center"}}>
                    <h3 className="user-name">{data.authorName?.split("#")[0]}<span
                        className="user-tag">#{data.authorName?.split("#")[1]}</span>
                    </h3>

                    <div className="sub-component" style={{height: "60%", justifyContent: "left"}}>
                        <h3 className="title">{data.title}</h3>
                        <p className="role">{data.content}</p>
                    </div>
                    <p className="id" style={{paddingLeft: "8px"}}>{data.postDate.toLocaleString()}</p>

                </div>
            </div>
        </>
    )
}


export default TicketList;