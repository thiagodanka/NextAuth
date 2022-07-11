import { destroyCookie } from "nookies"
import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { useCan } from "../hooks/useCan"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { AuthTokenError } from "../services/errors/AuthTokenError"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {

    const { user } = useContext(AuthContext)

    const userCanSeeMetrics = useCan({
        permissions: ['users.create']
    })

    useEffect(() => {
        api.get('/me').then((response) => { })
            .catch((error) => { })
    }, [])

    return (
        <>
            <h1>dashboard {user?.email}</h1>

            {userCanSeeMetrics &&
                <div>
                    Métricas
                </div>}
        </>
    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get('/me');

    return {
        props: {

        }
    }
})