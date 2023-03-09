import {
  useContract,
  useBurnNFT,
  useAddress,
  usenfts,
  useOwnedNFTs,
  useContractWrite,
} from '@thirdweb-dev/react'
import {
  Modal,
  Input,
  Row,
  Checkbox,
  Button,
  Text,
  Table,
  useAsyncList,
  Grid,
} from '@nextui-org/react'
import React, { useState } from 'react'
import Image from 'next/image'
import { BigNumber } from 'ethers'

const contractAddress = '0xE1AAa7fAB6bE87D606766B22749Fa588C4aADaB6'

export default function BurnButton() {
  const [visible, setVisible] = React.useState(false)
  const address = useAddress()
  const { contract } = useContract(contractAddress)
  const { mutateAsync: burnBatch, isLoading, } = useContractWrite(
    contract,
    'burnBatch'
  )

  const { data, error } = useOwnedNFTs(contract, address)


  const nfts = data?.map((nft) => ({
    id: nft.metadata.id,
    owner: nft.owner,
    quantityOwned: nft.quantityOwned,
  }))

  const handler = () => setVisible(true)

  const closeHandler = () => {
    setVisible(false)
    console.log('closed')
  }

  const [quantity, setQuantity] = useState(0)

  // handle button click of increment quantity. when user clicks + button, increment quantity by 1, when user clicks - button, decrease quantity by 1; but only up to the number of NFTs owned by user. If user owns 5 NFTs, they can only select 5 NFTs to burn.

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

  // handleBurnNFT, must burn two at a time to get airdrop. When user selects two eggz, put nft id in an array then loop through array and burn each one.

  const handleBurnNFT = async () => {
    try {
      // Check that two NFTs have been selected to burn
      if (quantity % 2 !== 0) {
        console.log('Please select pairs of NFTs to burn (2, 4, 6, etc)')
        return
      }

      await burnBatch([nfts[0].owner, [nfts[0].id], [quantity]])

      // Close modal
      // Trigger airdrop of "Bird" tokens
      console.log('NFTs burned successfully, triggering airdrop...')
    } catch (error) {
      console.error('Failed to burn NFT', error)
    }
  }

  return (
    <div>
      <Button auto color="warning" shadow onPress={handler}>
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
            <Text b size={18}>
              Burn Two Eggz to Crack It into A Bird
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Grid.Container gap={2} justify="center">
            <Grid xs={4}>
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

          {/* Display quantity / 2 as user increments. no half or .5 */}

          <Text>You have selected {Math.floor(quantity / 2)} Birdz.</Text>

          {/* Display the number of Birds that the user can mint */}
          <Text>
            You can mint up to {Math.floor(nfts[0].quantityOwned / 2) || 0} FireBirdz.
          </Text>

          {/* For every 2 NFTs burned, count 1 Bird */}
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={closeHandler}>
            Close
          </Button>

          {/* Disable the Burn button if the user doesn't own enough NFTs */}

          <Button
            auto
            color="error"
            shadow
            disabled={
              isLoading ||
              quantity < 2 ||
              quantity % 2 !== 0 ||
              quantity > nfts[0].quantityOwned
            }
            onPress={handleBurnNFT}
          >
            {isLoading ? 'Burning...' : 'Burn!'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
