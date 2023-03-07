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
import { Text, Spacer, Container, Grid } from '@nextui-org/react'

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
            <p>Loading...</p>
          ) : (
            <>
              <Container>
                <Grid.Container justify="center">
                  <Grid>
                    {/* Image  */}
                    <MediaRenderer
                      className={styles.image}
                      src={contractMetadata?.image}
                      alt={`${contractMetadata?.name} preview image`}
                    />
                  </Grid>
                  <Grid>
                    <Text size={'$3xl'}>
                      A collection of 6900 randomly generated NFTs of Deez Eggz.
                    </Text>
                    <Text size={'$3xl'}>
                      Who knows, maybe they'll hatch... Suck on deez eggz.
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
                        <p>Loading...</p>
                      )}
                    </div>

                    <div className={styles.imageSide}>
                      {/* Amount claimed so far */}

                      {claimConditions.data?.length === 0 ||
                      claimConditions.data?.every(
                        (cc) => cc.maxClaimableSupply === '0'
                      ) ? (
                        <div>
                          <h2>
                            This drop is not ready to be minted yet. (No claim
                            condition set)
                          </h2>
                        </div>
                      ) : !activeClaimCondition.data && claimConditions.data ? (
                        <div>
                          <h2>Drop starts in:</h2>
                          <Timer date={claimConditions.data[0].startTime} />
                        </div>
                      ) : (
                        <>
                          <Text b size={'$3xl'}>
                            Quantity
                          </Text>
                          <div className={styles.quantityContainer}>
                            <button
                              className={`${styles.quantityControlButton}`}
                              onClick={() => setQuantity(quantity - 1)}
                              disabled={quantity <= 1}
                            >
                              -
                            </button>

                            <Text b size={'$3xl'}>
                              {quantity}
                            </Text>

                            <button
                              className={`${styles.quantityControlButton}`}
                              onClick={() => setQuantity(quantity + 1)}
                              disabled={quantity >= maxClaimable}
                            >
                              +
                            </button>
                          </div>

                          <div className={styles.mintContainer}>
                            {isSoldOut ? (
                              <div>
                                <h2>Sold Out</h2>
                              </div>
                            ) : (
                              <Web3Button
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
                </Grid.Container>
              </Container>
              <Container>
                <Grid.Container>
                  <Grid>
                    <Text b size={'$3xl'}>
                      Suck on Deez Eggs
                    </Text>
                    <Text size={'$3xl'}>
                      Deez Eggz is a collection of 6900 generated NFTs. They are
                      literally just eggz but there's a chance they'll hatch. In
                      order to hatch the eggz you must burn them. For every two
                      eggz burned you will receive one WL for the Birds Free
                      Mint. The Birds Mint will be a collection of 3450 randomly
                      generated NFTs that may or may not be animated. Suck on
                      deez eggz.
                    </Text>
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
