import type { AppProps } from 'next/app'
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react'
import '../styles/globals.css'
import Head from 'next/head'
import { NextUIProvider } from '@nextui-org/react'

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Goerli

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ThirdwebProvider activeChain={activeChainId}>
			<NextUIProvider>
				<Head>
					<title>Deez Eggz NFT Drop</title>
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"
					/>
					<meta
						name="description"
						content="Deez Eggz. A NFT art collection of 6900 eggz. Letz get crackin!"
					/>
					<meta
						name="keywords"
						content="NFT collection for Deez Eggz."
					/>
				</Head>
				<Component {...pageProps} />
			</NextUIProvider>
		</ThirdwebProvider>
	)
}

export default MyApp
