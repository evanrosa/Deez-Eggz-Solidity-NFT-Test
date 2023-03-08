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
  useAsyncList,
} from '@nextui-org/react'
import React, { useState } from 'react'
import Image from 'next/image'
import { BigNumber } from 'ethers'

const contractAddress = '0x20D9befBA69775678F0e36316dD7F31163F4A116'

export default function BurnButton() {
  const [visible, setVisible] = React.useState(false)
  const [checkedItems, setCheckedItems] = useState([])
  const address = useAddress()
  const { contract } = useContract(contractAddress)
  const { mutate: burnNFT, isLoading } = useBurnNFT(contract)
  const { data, error } = useOwnedNFTs(contract, address)

  const ownedNFTs = data?.map((nft) => ({
    id: nft.metadata.id,
    image: nft.metadata.image,
  }))

  const handler = () => setVisible(true)

  const closeHandler = () => {
    setVisible(false)
    console.log('closed')
  }

  const columns = [
    {
      key: 'name',
      label: 'Token',
    },
    {
      key: 'image',
      label: 'Image',
    },
  ]

  const rows = ownedNFTs?.map((nft, index) => ({
    key: index, // add a unique identifier for the item
    name: nft.id,
    image: nft.image ? (
      <Image src={nft.image} alt="Eggz" width={50} height={50} />
    ) : null,
  }))

  async function load({ signal }: any) {
    return {
      items: rows || [],
      cursor: null,
    }
  }

  const list = useAsyncList({ load })

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
        const tokenId = checkedItems[i]  

        await burnNFT({ tokenId: tokenId, amount: 1 })

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
            css={{ minWidth: '100%', height: 'calc($space$14 * 10)' }}
            selectionMode="multiple"
            onSelectionChange={(selected) => {
              handleCheck(selected)
            }}
          >
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Column key={column.key}>{column.label}</Table.Column>
              )}
            </Table.Header>
            <Table.Body
              items={list.items}
              loadingState={list.loadingState}
              onLoadMore={list.loadMore}
            >
              {(item) => (
                <Table.Row key={item.name}>
                  {(key) => <Table.Cell>{item[key]}</Table.Cell>}
                </Table.Row>
              )}
            </Table.Body>
          </Table>

          {/* For every 2 nfts burned count 1 */}
          <Text>
            {ownedNFTs && ownedNFTs.length < 2
              ? 'You need at least 2 NFTs to burn'
              : `You can get up to ${ownedNFTs?.length / 2} Birds`}
          </Text>

          {/* As a user checks their nfts for every 2 checked count one */}
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={closeHandler}>
            Close
          </Button>

          {ownedNFTs && ownedNFTs.length < 2 ? (
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
