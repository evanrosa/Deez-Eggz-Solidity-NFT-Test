import {
	useContract,
	useAddress,
	useOwnedNFTs,
	useContractWrite,
} from '@thirdweb-dev/react'
import { Modal, Row, Button, Text, Grid } from '@nextui-org/react'
import React, { useState } from 'react'
import Image from 'next/image'
import firebird from '../public/firebird.gif'
const contractAddress = '0xE1AAa7fAB6bE87D606766B22749Fa588C4aADaB6'
import { useEffect } from 'react'

export default function BurnButton() {
	// Set state variables
	const [quantity, setQuantity] = useState(0)
	const [wallet, setWallet] = useState('')
	const [visible, setVisible] = React.useState(false)
	// Get wallet address
	const address = useAddress()
	// Get contract
	const { contract } = useContract(contractAddress)
	// Get contract write functions
	const { mutateAsync: burnBatch, isLoading } = useContractWrite(
		contract,
		'burnBatch'
	)
	// Get owned NFTs
	const { data, error } = useOwnedNFTs(contract, address)

	// Map NFTs to an array of objects
	const nfts =
		data?.map((nft) => ({
			id: nft.metadata.id,
			owner: nft.owner,
			quantityOwned: nft.quantityOwned,
		})) || []

	// Set modal visibility
	const handler = () => setVisible(true)
	const closeHandler = () => {
		setVisible(false)
	}

	// handleIncrement, handleDecrement, and handleBurnNFT are all functions that are called when the user clicks the +, -, or burn button.
	const handleIncrement = () => {
		if (quantity < nfts[0].quantityOwned) {
			setQuantity(quantity + 1)
		}
	}
	const handleDecrement = () => {
		if (quantity > 1) {
			setQuantity(quantity - 1)
		}
	}
	const handleBurnNFT = async () => {
		try {
			// Set wallet address
			setWallet(nfts[0].owner)
			// Check that two NFTs have been selected to burn
			if (quantity % 2 !== 0) {
				// alert user that they need to select two NFTs
				alert('Please select two NFTs to burn')
				return
			}
			// Burn NFTs
			await burnBatch([nfts[0].owner, [nfts[0].id], [quantity]])

			// Calculate number of birds to airdrop
			let birdCount = 0
			for (let i = 0; i < quantity; i += 2) {
				birdCount += 1
			}

			// Send data to server
			const form = {
				wallet: nfts[0].owner,
				amount: birdCount,
			}

			const response = await fetch('/api/sendData', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(form),
			})

			// reset quantity
			setQuantity(0)

			// Log response from server

			const content = await response.json()

			alert(content.data.tableRange)

			// Close modal after burn
			setVisible(false)
		} catch (error) {
			console.error('Failed to burn NFT', error)
		}
	}

	useEffect(() => {
		// Set the specified date and time (March 15th 2023 at 3:00 PM)
		const specifiedDate = new Date('March 10, 2023 15:21:00')
		const button = document.getElementById('fryButton')

		// Check if the current date and time is later than the specified date and time
		if (new Date() <= specifiedDate) {
			// If the current date and time is earlier than the specified date and time, hide the button
			button.style.display = 'none'
		} else {
			// If the current date and time is later than the specified date and time, show the button
			button.style.display = 'block'
		}
	}, [])

	return (
		<div>
			<Button
				id="fryButton"
				disabled={isLoading || !address}
				auto
				color="warning"
				shadow
				onPress={handler}
			>
				Fry Ur Eggz!
			</Button>
			<Modal
				scroll
				fullScreen
				closeButton
				aria-labelledby="modal-title"
				open={visible}
				onClose={closeHandler}
			>
				<Modal.Header>
					<Text id="modal-title" size={18}>
						<Text b css={{ textAlign: 'center', fontSize: '$6xl' }}>
							Hatch Two Eggz to Crack It into A Bird
						</Text>
					</Text>
				</Modal.Header>
				<Modal.Body>
					<Grid.Container gap={2} justify="center">
						<Grid>
							<div className="display">
								<Button
									color="warning"
									auto
									css={{ marginRight: '2rem' }}
									onClick={handleDecrement}
								>
									<Text b size={'$3xl'}>
										-
									</Text>
								</Button>

								<Text b size={'$3xl'}>
									{quantity}
								</Text>

								<Button
									color="warning"
									auto
									css={{ marginLeft: '2rem' }}
									onClick={handleIncrement}
								>
									<Text b size={'$3xl'}>
										+
									</Text>
								</Button>
							</div>
						</Grid>
					</Grid.Container>
					<Grid.Container gap={2} justify="center">
						<Grid>
							{/* Display quantity / 2 as user increments. no half or .5 */}

							<Text
								css={{ textAlign: 'center', fontSize: '$4xl' }}
							>
								You have selected {Math.floor(quantity / 2)}{' '}
								Birdz.
							</Text>

							{/* Display the number of Birds that the user can mint */}

							<Text
								css={{ textAlign: 'center', fontSize: '$2xl' }}
							>
								Please select pairs of NFTs to burn (2, 4, 6,
								etc). You will be able to claim your FireBirdz
								after the burn is complete.
							</Text>

							{/* For every 2 NFTs burned, count 1 Bird */}
						</Grid>
					</Grid.Container>

					<Grid.Container gap={2} justify="center">
						<Grid>
							{/* Display quantity / 2 as user increments. no half or .5 */}

							<Button
								size="xl"
								auto
								flat
								color="primary"
								onPress={closeHandler}
							>
								Close
							</Button>

							{/* Disable the Burn button if the user doesn't own enough NFTs */}
						</Grid>
						<Grid>
							<Button
								size="xl"
								auto
								color="error"
								shadow
								disabled={
									isLoading ||
									quantity < 2 ||
									quantity % 2 !== 0
								}
								onPress={handleBurnNFT}
							>
								{isLoading ? 'Burning...' : 'Burn!'}
							</Button>
						</Grid>
					</Grid.Container>
				</Modal.Body>
				<Modal.Footer>
					<Grid.Container gap={2} justify="center">
						<Grid>{/* Image here */}</Grid>
					</Grid.Container>
				</Modal.Footer>
			</Modal>
		</div>
	)
}
