import { useContract, useBurnNFT, useOwnedNFTs } from '@thirdweb-dev/react'
import { Modal, Input, Row, Checkbox, Button, Text } from '@nextui-org/react'
import React from 'react'

const address: string = '0x20D9befBA69775678F0e36316dD7F31163F4A116'

export default function BurnButton() {
  const { contract } = useContract(address)
  const { mutate: burnNFT, isLoading } = useBurnNFT(contract)

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



  const { data, error } = useOwnedNFTs(
    contract,
    address,
  );
  console.log('data',data);

  return (
    <div>
      <Button auto color="warning" shadow onPress={handler}>
        Letz get crackin
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
                Burn Two Eggz to Hatch a Chick        
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body>

            {/* Loop through all nfts in owners wallet and list out as checkbox
            {data?.map((nft) => (
                <Checkbox>
                    <Text size={14}>{nft.tokenId}</Text>
                </Checkbox>
            ))}
                
            
             */}
       




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

          <Button disabled={isLoading} onClick={handleBurnNFT}>
            {isLoading ? 'Burning...' : 'Burn!'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
