import { destroyCookie } from "nookies"
import { useContext, useEffect } from "react"
import { Authcontext, signOut } from "../contexts/Authcontext"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function dashboard() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { user } = useContext(Authcontext)

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        api.get('/me')
            .then(response => { })
            .catch(err => { })
    }, [])
    return (
        <>
            <h1>Dashboard {user?.email}</h1>
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