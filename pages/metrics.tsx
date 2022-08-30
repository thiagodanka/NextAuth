import { signOut } from "../contexts/Authcontext"
import { setupAPIClient } from "../services/api"
import { withSSRAuth } from "../utils/withSSRAuth"


export default function Metrics() {


    return (
        <>
            <h1>Metrics</h1>
            <button onClick={signOut}>Sair</button>
        </>
    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx)

    const response = await apiClient.get('/me')



    return {
        props: {}
    }
}, {
    permissions: ['metrics.lis'],
    roles: ['administrator'],
})