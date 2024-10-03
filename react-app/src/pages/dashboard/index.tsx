import DashboardLayout from "./layout.tsx";
import TicketsPage from "./tickets/submit.tsx";
import TicketList from "./tickets/list.tsx";

function DashboardHome() {

    return (
        <DashboardLayout>
            <TicketsPage />
        </DashboardLayout>
    )
}

export function DashboardTicketList() {

    return (
        <DashboardLayout>
            <TicketList />
        </DashboardLayout>
    )
}


export default DashboardHome;