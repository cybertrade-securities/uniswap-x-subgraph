const { spawnSync } = require('child_process')

const DEFAULT_SUBGRAPH_NAME = 'uniswap-x-subgraph'
const DEFAULT_VERSION_LABEL = 'v0.0.1'

const args = process.argv.slice(2)
let network = 'mainnet'
let deployArgs = args

if (args.length > 0 && !args[0].startsWith('-')) {
  network = args[0]
  deployArgs = args.slice(1)
}

const hasVersionLabel = deployArgs.some((arg) => arg === '-l' || arg === '--version-label' || arg.startsWith('--version-label='))
const subgraphName = process.env.SUBGRAPH_NAME || DEFAULT_SUBGRAPH_NAME
const versionArgs = hasVersionLabel ? [] : ['--version-label', DEFAULT_VERSION_LABEL]

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { stdio: 'inherit' })
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    process.exit(result.status)
  }
}

run(process.execPath, ['scripts/generate-subgraph.js', network])
run('graph', ['codegen', '--output-dir', 'src/types'])
run('graph', ['deploy', subgraphName, 'subgraph.yaml', ...versionArgs, ...deployArgs])
