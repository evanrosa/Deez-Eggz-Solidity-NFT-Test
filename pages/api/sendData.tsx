import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'

type sheetData = {
	wallet: string
	amount: string
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}
	const body = req.body as sheetData

	try {
		// prepare auth to google sheets
		const auth = new google.auth.GoogleAuth({
			credentials: {
				client_email: process.env.CLIENT_EMAIL,
				private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
			},
			scopes: [
				'https://www.googleapis.com/auth/spreadsheets',
				'https://www.googleapis.com/auth/drive',
				'https://www.googleapis.com/auth/drive.file',
			],
		})

		const sheets = google.sheets({ version: 'v4', auth })

		const response = await sheets.spreadsheets.values.append({
			spreadsheetId: process.env.SHEET_ID,
			range: 'Sheet1!A1:B1',
			valueInputOption: 'USER_ENTERED',
			requestBody: {
				values: [[body.wallet, body.amount]],
			},
		})
		console.log('body', body)

		console.log('response', response.data)

		return res.status(200).json({ data: response.data })
	} catch (error) {
		res.status(500).send({ error: error })
	}
}
