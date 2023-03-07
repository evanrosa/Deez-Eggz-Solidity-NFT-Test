import React from 'react'
import { Navbar, Button, Link, Text, Card, Radio } from '@nextui-org/react'
import Image from 'next/image'
import os from '../public/os.svg'
import etherscan from '../public/etherscan.svg'
import BurnButton from './Burn'
import { ConnectWallet } from "@thirdweb-dev/react";

export default function App() {
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
              
      {/* <BurnButton /> */}
      <ConnectWallet />
      </Navbar.Content>

    </Navbar>
  )
}
