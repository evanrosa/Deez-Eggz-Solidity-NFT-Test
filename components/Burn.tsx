import {
  useContract,
  useBurnNFT,
  useAddress,
  usenfts,
  useOwnedNFTs,
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
  const [checkedItems, setCheckedItems] = useState([])
  const address = useAddress()
  const { contract } = useContract(contractAddress)
  const { mutate: burnBatch, isLoading } = useBurnNFT(contract)

  const { data, error } = useOwnedNFTs(contract, address)
  console.log('data', data)

  const nfts = data?.map((nft) => ({
    id: nft.metadata.id,
    image: nft.metadata.image,
    quantityOwned: nft.quantityOwned,
  }))

  const handler = () => setVisible(true)

  const closeHandler = () => {
    setVisible(false)
    console.log('closed')
  }

 

  console.log('nfts', nfts);
  


  const handleCheck = (tokenId: string | Set<React.Key>) => {
    const index = checkedItems.indexOf(tokenId)
    if (index === -1) {
      setCheckedItems([...checkedItems, tokenId])
    } else {
      const updatedItems = [...checkedItems]
      updatedItems.splice(index, 1)
      setCheckedItems(updatedItems)
    }
  }

  // handleBurnNFT, must burn two at a time to get airdrop. When user selects two eggz, put nft id in an array then loop through array and burn each one.

  const handleBurnNFT = async () => {
    try {
      // Check that two NFTs have been selected to burn
      if (checkedItems.length % 2 !== 0) {
        console.log('Please select pairs of NFTs to burn (2, 4, 6, etc)')
        return
      }

      // Burn each selected NFT
      for (let i = 0; i < checkedItems.length; i++) {
        const tokenId = checkedItems[i] as unknown as BigNumber
        console.log('tokenId', typeof tokenId)

        console.log('tokenId value', tokenId)

        await burnBatch(0, 1)

        setCheckedItems((prevState) =>
          prevState.filter((id) => id !== checkedItems[i])
        )
      }

      // Trigger airdrop of "Bird" tokens
      console.log('NFTs burned successfully, triggering airdrop...')
    } catch (error) {
      console.error('Failed to burn NFT', error)
    }
  }

  const [quantity, setQuantity] = useState(1)

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
            onClick={() => setQuantity(quantity - 1)}
            disabled={quantity <= 1}
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
            onClick={() => setQuantity(quantity + 1)}
          >
            <Text b size={'$3xl'}>
              +
            </Text>
          </Button>
        </div>
      </Grid>
    </Grid.Container>

    <Text>
      You own {nfts?.length || 0} NFTs.
    </Text>

    {/* Display the number of NFTs owned by the wallet */}
    <Text>
      You can get up to {nfts ? Math.floor(nfts.length / 2) : 0} Birds
    </Text>

    {/* Display the number of Birds that the user can mint */}
    <Text>You can mint up to {nfts?.length || 0} FireBirdz.</Text>

    {/* For every 2 NFTs burned, count 1 Bird */}
  </Modal.Body>
  <Modal.Footer>
    <Button auto flat color="error" onPress={closeHandler}>
      Close
    </Button>

    {/* Disable the Burn button if the user doesn't own enough NFTs */}
    {nfts && nfts.length < 2 ? (
      <Button disabled>Buy more NFTs</Button>
    ) : (
      <Button
        disabled={
          isLoading ||
          checkedItems.length < 2 ||
          checkedItems.length % 2 !== 0
        }
        onPress={handleBurnNFT}
      >
        {isLoading ? 'Burning...' : 'Burn!'}
      </Button>
    )}
  </Modal.Footer>
</Modal>

    </div>
  )
}
