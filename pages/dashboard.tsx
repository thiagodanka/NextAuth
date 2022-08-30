import { useContext, useEffect } from "react"
import { Can } from "../components/Can"
import { Authcontext, signOut } from "../contexts/Authcontext"
import { useCan } from "../hooks/useCan"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { user } = useContext(Authcontext)

    // eslint-disable-next-line react-hooks/rules-of-hooks

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        api.get('/me')
            .then(response => { })
            .catch(err => { })
    }, [])

    return (
        <>

            <Can roles={['administrator']}>
                
                <h2>Tela Administrador </h2>
                <h1>Dashboard {user?.email}</h1>
                <div>Administrador</div>
            </Can >

            <Can roles={["editor"]}>
                <h2>Tela editor</h2>
                <h1>Dashboard {user?.email}</h1>
                <div>editor</div>
            </Can>
            
            <button onClick={signOut}>Sair</button>
        </>
    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx)

    const response = await apiClient.get('/me')
    

    return {
        props: {

        }
    }
})