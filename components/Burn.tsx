import { useContract, useBurnNFT } from '@thirdweb-dev/react'
import { Modal, Input, Row, Checkbox, Button, Text } from '@nextui-org/react'
import React from 'react'

export default function BurnButton() {
  const { contract } = useContract('0x20D9befBA69775678F0e36316dD7F31163F4A116')
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

  return (
    <div>
      <Button auto color="warning" shadow onPress={handler}>
        Open modal
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
            Welcome to
            <Text b size={18}>
              NextUI
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body>
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
