import {
  MediaRenderer,
  useActiveClaimConditionForWallet,
  useAddress,
  useClaimConditions,
  useClaimedNFTSupply,
  useClaimerProofs,
  useClaimIneligibilityReasons,
  useContract,
  useContractMetadata,
  useUnclaimedNFTSupply,
  Web3Button,
} from '@thirdweb-dev/react'
import { BigNumber, utils } from 'ethers'
import type { NextPage } from 'next'
import { useMemo, useState } from 'react'
import Timer from '../components/Timer'
import styles from '../styles/Theme.module.css'
import { parseIneligibility } from '../utils/parseIneligibility'
import Navigation from '../components/NavBar'
import { Text, Spacer, Container, Grid, Button } from '@nextui-org/react'

// Put Your NFT Drop Contract address from the dashboard here
const myNftDropContractAddress = '0x20D9befBA69775678F0e36316dD7F31163F4A116'

const Home: NextPage = () => {
  const { contract: nftDrop } = useContract(myNftDropContractAddress)

  const address = useAddress()
  const [quantity, setQuantity] = useState(1)

  const { data: contractMetadata } = useContractMetadata(nftDrop)

  const claimConditions = useClaimConditions(nftDrop)

  const activeClaimCondition = useActiveClaimConditionForWallet(
    nftDrop,
    address || ''
  )
  const claimerProofs = useClaimerProofs(nftDrop, address || '')
  const claimIneligibilityReasons = useClaimIneligibilityReasons(nftDrop, {
    quantity,
    walletAddress: address || '',
  })
  const unclaimedSupply = useUnclaimedNFTSupply(nftDrop)
  const claimedSupply = useClaimedNFTSupply(nftDrop)

  const numberClaimed = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0).toString()
  }, [claimedSupply])

  const numberTotal = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0)
      .add(BigNumber.from(unclaimedSupply.data || 0))
      .toString()
  }, [claimedSupply.data, unclaimedSupply.data])

  const priceToMint = useMemo(() => {
    const bnPrice = BigNumber.from(
      activeClaimCondition.data?.currencyMetadata.value || 0
    )
    return `${utils.formatUnits(
      bnPrice.mul(quantity).toString(),
      activeClaimCondition.data?.currencyMetadata.decimals || 18
    )} ${activeClaimCondition.data?.currencyMetadata.symbol}`
  }, [
    activeClaimCondition.data?.currencyMetadata.decimals,
    activeClaimCondition.data?.currencyMetadata.symbol,
    activeClaimCondition.data?.currencyMetadata.value,
    quantity,
  ])

  const maxClaimable = useMemo(() => {
    let bnMaxClaimable
    try {
      bnMaxClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimableSupply || 0
      )
    } catch (e) {
      bnMaxClaimable = BigNumber.from(1_000_000)
    }

    let perTransactionClaimable
    try {
      perTransactionClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimablePerWallet || 0
      )
    } catch (e) {
      perTransactionClaimable = BigNumber.from(1_000_000)
    }

    if (perTransactionClaimable.lte(bnMaxClaimable)) {
      bnMaxClaimable = perTransactionClaimable
    }

    const snapshotClaimable = claimerProofs.data?.maxClaimable

    if (snapshotClaimable) {
      if (snapshotClaimable === '0') {
        // allowed unlimited for the snapshot
        bnMaxClaimable = BigNumber.from(1_000_000)
      } else {
        try {
          bnMaxClaimable = BigNumber.from(snapshotClaimable)
        } catch (e) {
          // fall back to default case
        }
      }
    }

    const maxAvailable = BigNumber.from(unclaimedSupply.data || 0)

    let max
    if (maxAvailable.lt(bnMaxClaimable)) {
      max = maxAvailable
    } else {
      max = bnMaxClaimable
    }

    if (max.gte(1_000_000)) {
      return 1_000_000
    }
    return max.toNumber()
  }, [
    claimerProofs.data?.maxClaimable,
    unclaimedSupply.data,
    activeClaimCondition.data?.maxClaimableSupply,
    activeClaimCondition.data?.maxClaimablePerWallet,
  ])

  const isSoldOut = useMemo(() => {
    try {
      return (
        (activeClaimCondition.isSuccess &&
          BigNumber.from(activeClaimCondition.data?.availableSupply || 0).lte(
            0
          )) ||
        numberClaimed === numberTotal
      )
    } catch (e) {
      return false
    }
  }, [
    activeClaimCondition.data?.availableSupply,
    activeClaimCondition.isSuccess,
    numberClaimed,
    numberTotal,
  ])

  const canClaim = useMemo(() => {
    return (
      activeClaimCondition.isSuccess &&
      claimIneligibilityReasons.isSuccess &&
      claimIneligibilityReasons.data?.length === 0 &&
      !isSoldOut
    )
  }, [
    activeClaimCondition.isSuccess,
    claimIneligibilityReasons.data?.length,
    claimIneligibilityReasons.isSuccess,
    isSoldOut,
  ])

  const isLoading = useMemo(() => {
    return (
      activeClaimCondition.isLoading ||
      unclaimedSupply.isLoading ||
      claimedSupply.isLoading ||
      !nftDrop
    )
  }, [
    activeClaimCondition.isLoading,
    nftDrop,
    claimedSupply.isLoading,
    unclaimedSupply.isLoading,
  ])

  const buttonLoading = useMemo(
    () => isLoading || claimIneligibilityReasons.isLoading,
    [claimIneligibilityReasons.isLoading, isLoading]
  )
  const buttonText = useMemo(() => {
    if (isSoldOut) {
      return 'Sold Out'
    }

    if (canClaim) {
      const pricePerToken = BigNumber.from(
        activeClaimCondition.data?.currencyMetadata.value || 0
      )
      if (pricePerToken.eq(0)) {
        return 'Mint (Free)'
      }
      return `Mint (${priceToMint})`
    }
    if (claimIneligibilityReasons.data?.length) {
      return parseIneligibility(claimIneligibilityReasons.data, quantity)
    }
    if (buttonLoading) {
      return 'Checking eligibility...'
    }

    return 'Claiming not available'
  }, [
    isSoldOut,
    canClaim,
    claimIneligibilityReasons.data,
    buttonLoading,
    activeClaimCondition.data?.currencyMetadata.value,
    priceToMint,
    quantity,
  ])

  return (
    <>
      <Navigation />

      <div className={styles.container}>
        <div className={styles.mintInfoContainer}>
          {isLoading ? (
            <Text b size={'$3xl'}>
              Loading... Letz get crackin!
            </Text>
          ) : (
            <>
              <Container>
                <Grid.Container
                  css={{
                    paddingLeft: '10%',
                    paddingRight: '10%',
                    paddingTop: '10%',
                    paddingBottom: '3%',
                    textAlign: 'left',
                  }}
                >
                  <Grid>
                    <Text size={'$3xl'}>
                      What&lsquo;s crackin? Deez Eggz are more than your average
                      free range source of protein. Cultivated from the greatest
                      wl farmers this side of the Mississippi, not even
                      Ol&lsquo; McDonald could guess what&lsquo;s inside...
                    </Text>
                  </Grid>
                </Grid.Container>

                <Grid.Container
                  css={{ paddingLeft: '10%', paddingRight: '10%' }}
                >
                  <Grid
                    css={{ textAlign: 'left', display: 'block !important' }}
                    xs={12}
                    sm={9}
                  >
                    <Text size={'$3xl'}>Not your average free range...</Text>
                    <Text size={'$3xl'}>
                      this is the collection of 6900 generated NFTs of Deez
                      Eggz.
                    </Text>

                    <Text b size={'$3xl'}>
                      Total Minted
                    </Text>

                    <div>
                      {claimedSupply && unclaimedSupply ? (
                        <Text b size={'$3xl'}>
                          <b>{numberClaimed}</b>
                          {' / '}
                          {numberTotal}
                        </Text>
                      ) : (
                        <Text b size={'$3xl'}>
                          Loading... Letz get crackin!
                        </Text>
                      )}
                    </div>

                    <div>
                      {/* Amount claimed so far */}

                      {claimConditions.data?.length === 0 ||
                      claimConditions.data?.every(
                        (cc) => cc.maxClaimableSupply === '0'
                      ) ? (
                        <div>
                          <Text h2 b size={'$3xl'}>
                            This drop is not ready to be minted yet. (No claim
                            condition set)
                          </Text>
                        </div>
                      ) : !activeClaimCondition.data && claimConditions.data ? (
                        <div>
                          <Text h2 b size={'$3xl'}>
                            Drop starts in:
                          </Text>

                          <Timer date={claimConditions.data[0].startTime} />
                        </div>
                      ) : (
                        <>
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
                              disabled={quantity >= maxClaimable}
                            >
                              <Text b size={'$3xl'}>
                                +
                              </Text>
                            </Button>
                          </div>

                          <div>
                            {isSoldOut ? (
                              <div>
                                <Text h2 b size={'$3xl'}>
                                  Sold Out
                                </Text>
                              </div>
                            ) : (
                              <Web3Button
                                className="button"
                                contractAddress={nftDrop?.getAddress() || ''}
                                action={(cntr) => cntr.erc721.claim(quantity)}
                                isDisabled={!canClaim || buttonLoading}
                                onError={(err) => {
                                  console.error(err)
                                  alert('Error claiming NFTs')
                                }}
                                onSuccess={() => {
                                  setQuantity(1)
                                  alert('Successfully claimed NFTs')
                                }}
                              >
                                {buttonLoading ? 'Loading...' : buttonText}
                              </Web3Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </Grid>
                  {/* <Spacer x={13} /> */}
                  <Grid xs={0} sm={3}>
                    {/* Image  */}
                    <MediaRenderer
                      src={contractMetadata?.image}
                      alt={`${contractMetadata?.name} preview image`}
                    />
                  </Grid>
                </Grid.Container>
              </Container>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Home
