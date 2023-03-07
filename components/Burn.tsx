import {
  useContract,
  useBurnNFT,
  useAddress,
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
} from '@nextui-org/react'
import React, { useState } from 'react'
import Image from 'next/image'

const contractAddress = '0x20D9befBA69775678F0e36316dD7F31163F4A116'

export default function BurnButton() {
  const [count, setCount] = React.useState(0)

  const address = useAddress()
  const { contract } = useContract(contractAddress)
  const { mutate: burnNFT, isLoading } = useBurnNFT(contract)

  const { data, error } = useOwnedNFTs(contract, address)

  console.log('data', data)

  const ownedNFTs = data?.map((nft) => ({
    id: nft.metadata.name,
    image: nft.metadata.image,
  }))

  const handleBurnNFT = async (tokenId: any) => {
    try {
      await burnNFT({ tokenId: tokenId, amount: 1 })
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

  const [checkedItems, setCheckedItems] = useState([])

  const columns = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'image',
      label: 'Image',
    },
  ]
  console.log('ownedNFTs', ownedNFTs)

    const rows = ownedNFTs?.map((nft, index) => ({
        key: index, // add a unique identifier for the item
        name: nft.id,
        image: nft.image ? <Image src={nft.image} alt="Eggz" width={50} height={50} /> : null,
    }));



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
          <Table
            bordered
            lined
            headerLined
            shadow={false}
            aria-label="NFT table"
            css={{
              height: 'auto',
              minWidth: '100%',
            }}
            selectionMode="multiple"
          >
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Column key={column.key}>{column.label}</Table.Column>
              )}
            </Table.Header>
<Table.Body items={rows}>
  {(item) => (
    <Table.Row key={item.key}>
      {columns.map((column) => (
        <Table.Cell css={{ width: '50%' }} key={column.key}>
          {(item as {[key: string]: string | number | Element | null})[column.key]}
        </Table.Cell>
      ))}
    </Table.Row>
  )}
</Table.Body>

          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={closeHandler}>
            Close
          </Button>

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
