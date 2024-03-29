import type { NextPage } from 'next'
import { FormEvent, useContext, useState } from 'react'
import { Authcontext } from '../contexts/Authcontext'
import { withSSRGuest } from '../utils/withSSRGuest'
const Home: NextPage = () => {

  const [email, setEmail] = useState('')
  const [password, setpassword] = useState('')

  const { signIn } = useContext(Authcontext)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const data = {
      email,
      password
    }

    await signIn(data)

  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setpassword(e.target.value)} />
      <button type="submit">Entrar</button>

    </form>
  )
}

export default Home

export const getServerSideProps = withSSRGuest(async (ctx) => {

  return {
    props: {

    }
  }
});
