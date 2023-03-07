import {
  useContract,
  useBurnNFT,
  useAddress,
  useOwnedNFTs,
} from '@thirdweb-dev/react'
import { Modal, Input, Row, Checkbox, Button, Text } from '@nextui-org/react'
import React from 'react'
import Image from 'next/image'

const contractAddress = '0x20D9befBA69775678F0e36316dD7F31163F4A116'

export default function BurnButton() {
  const address = useAddress()
  const { contract } = useContract(contractAddress)
  const { mutate: burnNFT, isLoading } = useBurnNFT(contract)

  const { data, error } = useOwnedNFTs(contract, address)
  const ownedNFTs = data?.map((nft) => ({
    id: nft.metadata.tokenId,
    image: nft.metadata.image,
  }))

  const handleBurnNFT = async () => {
    try {
      await burnNFT({ tokenId: 0, amount: 1 })
    } catch (error) {
      console.error('Failed to burn NFT', error)
    }
  }

  const [visible, setVisible] = React.useState(false)
  const handler = () => setVisible(true)
  const closeHandler = () => {
    setVisible(false)
    console.log('closed')
  }

  return (
    <div>
      <Button auto color="warning" shadow onPress={handler}>
        Letz Get Crackin!
      </Button>
      <Modal
        closeButton
        blur
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
          {/* 
            Loop through all nfts in owners wallet and list out each one with a checkbox and the nft image as a thumbnail. When the user clicks the burn button, it will burn the nft that is checked but only if the user has more than 2 nfts in their wallet. If the user has less than 2 nfts in their wallet, the burn button will be disabled and the user will be prompted to buy more nfts.
            
             */}

          {ownedNFTs?.map((nft) => (
            <Row key={nft.id} align="center">
              <Checkbox />
              <Image
                src={nft.image}
                alt={`NFT ${nft.id}`}
                width={50}
                height={50}
              />
            </Row>
          ))}

          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            placeholder="Email"
          />
          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            placeholder="Password"
          />
          <Row justify="space-between">
            <Checkbox>
              <Text size={14}>Remember me</Text>
            </Checkbox>
            <Text size={14}>Forgot password?</Text>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={closeHandler}>
            Close
          </Button>
          {/* <Button auto onPress={closeHandler}>
            Sign in
          </Button> */}

          {ownedNFTs?.length < 2 ? (
            <Button disabled>Buy more NFTs</Button>
          ) : (
            <Button disabled={isLoading} onClick={handleBurnNFT}>
              {isLoading ? 'Burning...' : 'Burn!'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}
