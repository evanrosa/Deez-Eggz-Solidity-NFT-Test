import React from 'react'
import Document, {
	Html,
	Head,
	Main,
	NextScript,
	DocumentContext,
} from 'next/document'
import { CssBaseline } from '@nextui-org/react'
import Script from 'next/script'

class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx)
		return {
			...initialProps,
			styles: React.Children.toArray([initialProps.styles]),
		}
	}

	render() {
		return (
			<Html lang="en">
				<Head>
					{CssBaseline.flush()},{' '}
					{/* Google Tag Manager code snippet */}
					<Script
						id="tracking-script"
						dangerouslySetInnerHTML={{
							__html: `
							(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
							new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
							j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
							'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
							})(window,document,'script','dataLayer','GTM-P3LR62G');
						`,
						}}
					/>
				</Head>
				<body>
					{/* Google Tag Manager noscript tag */}
					<noscript
						dangerouslySetInnerHTML={{
							__html: `
							<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P3LR62G"
							height="0" width="0" style="display:none;visibility:hidden"></iframe>
							`,
						}}
					/>

					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}

export default MyDocument
