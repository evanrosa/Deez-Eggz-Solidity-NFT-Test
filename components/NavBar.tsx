import React from 'react'
import { Navbar, Button, Link, Text, Card, Radio } from '@nextui-org/react'
import Image from 'next/image'
import os from '../public/os.svg'
import etherscan from '../public/etherscan.svg'

export default function App() {
  return (
    <Navbar variant="static" color='transparent'>
      <Navbar.Brand>
        <Text b color="inherit" size={'$6xl'}>
          Deez Eggz
        </Text>
      </Navbar.Brand>

      <Navbar.Content>
        <Navbar.Link href="#">
          <Image src={os} alt="OpenSea Collection" width={50} height={50} />
        </Navbar.Link>
        <Navbar.Link color="inherit" href="#">
          <Image
            src={etherscan}
            alt="Etherscan Contract"
            width={50}
            height={50}
          />
        </Navbar.Link>
      </Navbar.Content>
    </Navbar>
  )
}
