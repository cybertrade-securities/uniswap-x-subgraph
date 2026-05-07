import { BigInt, dataSource, ethereum } from '@graphprotocol/graph-ts'

import { Fill } from './types/schema'

export function handleFill(event: ethereum.Event): void {
  let fill = new Fill(event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString()))
  let context = dataSource.context()

  fill.orderHash = event.parameters[0].value.toBytes()
  fill.filler = event.parameters[1].value.toAddress()
  fill.swapper = event.parameters[2].value.toAddress()
  fill.nonce = event.parameters[3].value.toBigInt()
  fill.reactor = event.address
  fill.reactorName = context.getString('reactorName')
  fill.blockNumber = event.block.number
  fill.blockTimestamp = event.block.timestamp
  fill.transactionHash = event.transaction.hash
  fill.logIndex = event.logIndex

  fill.save()
}
