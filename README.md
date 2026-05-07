# Uniswap X Subgraph

Minimal subgraph for UniswapX reactor fill events.

This subgraph indexes the standardized `Fill` event emitted by UniswapX reactors:

```solidity
event Fill(bytes32 indexed orderHash, address indexed filler, address indexed swapper, uint256 nonce);
```

The event definition is from UniswapX `src/base/ReactorEvents.sol`. Classic reactors under `src/reactors` and the V4 reactor under `src/v4/Reactor.sol` emit the same event shape.

## Indexed Data

```graphql
type Fill @entity(immutable: true) {
  id: ID!
  orderHash: Bytes!
  filler: Bytes!
  swapper: Bytes!
  nonce: BigInt!
  reactor: Bytes!
  reactorName: String!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
  logIndex: BigInt!
}
```

`id` is `transactionHash-logIndex`, so multiple fills emitted in one transaction are stored separately.

## Configured Networks

Reactor addresses live in `networks.json`.

### Mainnet

| Reactor | Address | Start block |
| --- | --- | ---: |
| V2 Dutch Order Reactor | `0x00000011f84b9aa48e5f8aa8b9897600006289be` | `19814533` |
| Exclusive Dutch Order Reactor | `0x6000da47483062a0d734ba3dc7576ce6a0b645c4` | `17777988` |

### Base

| Reactor | Address | Start block |
| --- | --- | ---: |
| Priority Order Reactor | `0x000000001ec5656dcdb24d90dfa42742738de729` | `18042414` |

## Development

Install dependencies:

```bash
COREPACK_ENABLE_AUTO_PIN=0 corepack yarn install --frozen-lockfile
```

Generate `subgraph.yaml` for a network:

```bash
yarn generate-subgraph mainnet
```

Build:

```bash
yarn build
```

Generate and build Base instead:

```bash
yarn generate-subgraph base
yarn build
```

Generated files are intentionally ignored:

- `subgraph.yaml`
- `build/`
- `src/types/`
- `node_modules/`

## Deployment

Deploy Mainnet:

```bash
yarn deploy
```

`yarn deploy` generates the Mainnet manifest, runs `graph codegen`, and then runs `graph deploy uniswap-x-subgraph subgraph.yaml --version-label v0.0.1`.

Deploy Base:

```bash
yarn deploy:base
```

The default deploy name is `uniswap-x-subgraph`. To deploy under a different name, call Graph CLI directly:

```bash
yarn generate-subgraph mainnet
yarn codegen
graph deploy <SUBGRAPH_NAME> subgraph.yaml
```

You can also override the scripted deploy name with `SUBGRAPH_NAME`:

```bash
SUBGRAPH_NAME=<SUBGRAPH_NAME> yarn deploy
```

Pass a different version label through the deploy script when needed:

```bash
yarn deploy --version-label v0.0.2
```

## Example Queries

Recent fills:

```graphql
{
  fills(first: 10, orderBy: blockNumber, orderDirection: desc) {
    id
    orderHash
    filler
    swapper
    nonce
    reactor
    reactorName
    blockNumber
    blockTimestamp
    transactionHash
    logIndex
  }
}
```

Fills for an order:

```graphql
query ($orderHash: Bytes!) {
  fills(where: { orderHash: $orderHash }) {
    id
    filler
    swapper
    nonce
    reactorName
    transactionHash
    blockNumber
  }
}
```

Fills by swapper:

```graphql
query ($swapper: Bytes!) {
  fills(where: { swapper: $swapper }, orderBy: blockNumber, orderDirection: desc) {
    id
    orderHash
    filler
    nonce
    reactorName
    transactionHash
    blockNumber
  }
}
```

Fills by filler:

```graphql
query ($filler: Bytes!) {
  fills(where: { filler: $filler }, orderBy: blockNumber, orderDirection: desc) {
    id
    orderHash
    swapper
    nonce
    reactorName
    transactionHash
    blockNumber
  }
}
```

## Verification

This repo has been verified with:

```bash
node scripts/generate-subgraph.js mainnet
COREPACK_ENABLE_AUTO_PIN=0 corepack yarn build
node scripts/generate-subgraph.js base
COREPACK_ENABLE_AUTO_PIN=0 corepack yarn build
```
