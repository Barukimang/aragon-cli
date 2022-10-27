import { configEnvironment } from '../../src/lib/environment/configEnvironment'

let config
afterEach(async () => {
  if (config.wsProvider?.connection) {
    await config.wsProvider.connection.close()
    await config.wsProvider.removeAllListeners()
  }
  if (config.network.provider?.engine) {
    config.network.provider.engine.stop()
  }
})

describe('Config localhost', () => {
  test('configEnvironment - ignore network', () => {
    config = configEnvironment({
      ignoreNetwork: true,
    })
    expect(config.network).toEqual({})
  })

  test('configEnvironment - with frame', () => {
    config = configEnvironment({
      useFrame: true,
    })
    expect(config.network.name).toBe('frame-rpc')
  })

  test('configEnvironment - default networks - localhost', () => {
    config = configEnvironment({
      environment: '',
      arapp: { environments: { default: { network: 'rpc' } } },
    })
    expect(config.network.name).toBe('rpc')
    expect(config.network.provider.connection._url).toBe('ws://localhost:8545')
  })
})

describe('Config Goerli', () => {
  test('configEnvironment - with frame on goerli', async () => {
    config = configEnvironment({
      useFrame: true,
      environment: 'aragon:goerli',
    })
    expect(config.network.name).toBe('frame-goerli')
  })

  test('configEnvironment - default networks - goerli', async () => {
    config = configEnvironment({
      environment: 'goerli',
      arapp: { environments: { goerli: { network: 'goerli' } } },
    })
    expect(config.network.name).toBe('goerli')
  })

  const customEnvironment = 'custom-environment'
  const arapp = {
    environments: {
      [customEnvironment]: {
        registry: '0xfe03625ea880a8cba336f9b5ad6e15b0a3b5a939',
        appName: 'aragonnft.open.aragonpm.eth',
        network: 'goerli',
      },
      mainnet: {
        registry: '0x314159265dd8dbb310642f98f50c066173c1259b',
        appName: 'aragonnft.open.aragonpm.eth',
        network: 'mainnet',
        wsRPC: 'ws://my.ethchain.dnp.dappnode.eth:8546',
      },
    },
  }

  test('configEnvironment - custom environment - goerli', async () => {
    config = configEnvironment({
      environment: customEnvironment,
      arapp,
    })

    const selectedEnv = arapp.environments[customEnvironment]
    expect(config.network.name).toBe(selectedEnv.network)
    expect(config.apm.ensRegistryAddress).toBe(selectedEnv.registry)
    expect(config.wsProvider.connection._url).toBe(
      'wss://goerli.eth.aragon.network/ws'
    )
  })
})
