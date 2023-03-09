import React from 'react'
import { Navbar, Button, Link, Text, Card, Radio } from '@nextui-org/react'
import Image from 'next/image'
import os from '../public/os.svg'
import etherscan from '../public/etherscan.svg'
import BurnButton from './Burn'
import {
  ConnectWallet,
  useOwnedNFTs,
  useContract,
  useAddress,
} from '@thirdweb-dev/react'

const contractAddress = '0xE1AAa7fAB6bE87D606766B22749Fa588C4aADaB6'

export default function Navigation() {
  const address = useAddress()
  const { contract } = useContract(contractAddress)

  const { data, isLoading, error } = useOwnedNFTs(contract, address)

  return (
    <Navbar variant="static" color="transparent">
      <Navbar.Brand>
        <Text b color="inherit" size={'$6xl'}>
          Deez Eggz
        </Text>
      </Navbar.Brand>

      <Navbar.Content>
        <Navbar.Link href="#" hideIn={'xs'}>
          <Image src={os} alt="OpenSea Collection" width={25} height={25} />
        </Navbar.Link>

        <Navbar.Link color="inherit" href="#" hideIn={'xs'}>
          <Image
            src={etherscan}
            alt="Etherscan Contract"
            width={25}
            height={25}
          />
        </Navbar.Link>

        {data && data[0].quantityOwned > 2 ? <BurnButton /> : null}

        <ConnectWallet />
      </Navbar.Content>
    </Navbar>
  )
}
