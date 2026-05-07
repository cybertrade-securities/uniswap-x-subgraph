const fs = require('fs')
const path = require('path')

const rootDir = path.join(__dirname, '..')
const networks = require(path.join(rootDir, 'networks.json'))
const requestedNetwork = process.argv[2] || process.env.NETWORK || 'mainnet'
const config = networks[requestedNetwork]

if (!config) {
  const available = Object.keys(networks).join(', ')
  throw new Error(`Unknown network "${requestedNetwork}". Available networks: ${available}`)
}

function indent(value, spaces) {
  return value
    .split('\n')
    .map((line) => `${' '.repeat(spaces)}${line}`)
    .join('\n')
}

const dataSources = config.reactors
  .map((reactor) =>
    indent(
      `- kind: ethereum/contract
  name: ${reactor.name}
  network: ${config.network}
  source:
    address: '${reactor.address.toLowerCase()}'
    abi: Reactor
    startBlock: ${reactor.startBlock}
  context:
    reactorName:
      type: String
      data: '${reactor.name}'
  mapping:
    kind: ethereum/events
    apiVersion: 0.0.6
    language: wasm/assemblyscript
    file: ./src/mapping.ts
    entities:
      - Fill
    abis:
      - name: Reactor
        file: ./abis/Reactor.json
    eventHandlers:
      - event: Fill(indexed bytes32,indexed address,indexed address,uint256)
        handler: handleFill`,
      2
    )
  )
  .join('\n')

const manifest = `specVersion: 0.0.4
description: UniswapX reactor fill event subgraph for ${requestedNetwork}
schema:
  file: ./schema.graphql
dataSources:
${dataSources}
`

fs.writeFileSync(path.join(rootDir, 'subgraph.yaml'), manifest)
console.log(`Generated subgraph.yaml for ${requestedNetwork}`)
