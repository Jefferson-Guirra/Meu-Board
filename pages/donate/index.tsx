import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import * as C from '../../styles/donate'
import { Login } from '../../types/board'
import { PayPalButtons } from '@paypal/react-paypal-js'
import { db } from '../../services/firebaseConnection'
import { setDoc, doc } from 'firebase/firestore'
import Image from 'next/image'
import Rocket from '../../public/images/rocket.svg'

type Props = {
  user: {
    nome: string
    id: string
    image: string
  }
}
const donate = ({ user }: Props) => {
  const [vip, setVip] = useState(false)
  const handleSaveDonate = async () => {
    await setDoc(doc(db, 'users', user.id), {
      donate: true,
      lastDonate: new Date(),
      image: user.image
    }).then(() => setVip(true))
  }

  return (
    <>
      <Head>
        <title>Ajude a plataforma board ficar online!</title>
      </Head>
      <C.container>
        <div className="rocket">
          <Image src={Rocket} alt="Seja apoaidor" />
        </div>
        {vip && (
          <div className="vip">
            <Image
              width={50}
              height={50}
              src={user.image}
              alt="foto de perfil do usuario"
            />
            <span>Parabéns você é um novo apoiador</span>
          </div>
        )}
        <h1>
          Seja um apoiador deste projeto{' '}
          <span className="thropy">
            <img src="/images/throphy.svg" alt="trofeu" />
          </span>
        </h1>
        <h3>
          Contribua com apenas <span>R$ 1,00</span>
        </h3>
        <strong>
          Apareça na nossa home, tenha funcionalidades exclusivas.
        </strong>

        <div className="paypal">
          <PayPalButtons
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: '1'
                    }
                  }
                ]
              })
            }}
            onApprove={async (data, actions) => {
              return actions.order?.capture().then(function (details) {
                console.log(
                  'Compra aprovada: '
                )
                handleSaveDonate()
              })
            }}
          />
        </div>
      </C.container>
    </>
  )
}

export default donate

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = (await getSession({ req })) as Login | null

  if (!session?.id) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const user = {
    nome: session.user.name,
    id: session.id,
    image: session.user.image
  }

  return {
    props: {
      user
    }
  }
}
