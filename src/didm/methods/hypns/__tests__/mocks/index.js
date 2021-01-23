export const mockKey =
  'BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD'

export const mockDocument = {
  '@context': 'https://w3id.org/did/v1',
  id: 'did:hypns:BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD',
  created: '2019-03-19T16:52:44.948Z',
  updated: '2019-03-19T16:53:56.463Z'
}

export const mockDid = 'did:hypns:BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD'

export const mockDidHypns = {
  createHypnsDid: jest.fn(async () => {
    return mockDidHypnsInstance
  }),
  getDid: jest.fn(async () => mockDid)
}
export const mockDidHypnsInstance = {
  resolve: jest.fn(async () => mockDocument),
  create: jest.fn(async (instance, operations) => {
    operations({
      addPublicKey: () => {},
      revokePublicKey: () => {}
    })

    return mockDocument
  }),
  update: jest.fn(async (instance, operations) => {
    operations()

    return mockDocument
  })
}

const publicKey = 'mockPublicKey'
const privateKey = 'mockPrivateKey'
const secretKey = 'mockSecretKey'

export const mockBackupData = {
  mnemonic: 'mockMnemonic',
  seed: new Uint8Array(Buffer.from('mockSeed')),
  privateKey,
  publicKey
}

export const mockKeyPair = {
  privateKey: mockBackupData.privateKey,
  publicKey: mockBackupData.publicKey
}

export const mockHumanCryptoKeys = {
  generateKeyPair: jest.fn(async () => mockBackupData),
  getKeyPairFromMnemonic: jest.fn(async () => mockKeyPair),
  getKeyPairFromSeed: jest.fn(async () => mockKeyPair)
}

export const mockHyperdrive = (identifier) => {
  return {
    ready: jest.fn(async () => {
      return { call: new Promise((resolve, reject) => resolve()) }
    }),
    writable: true,
    peers: ['mockPeer1', 'mockPeer2'],
    key: mockKey,
    readFile: jest.fn(async () => mockDocument),
    writeFile: jest.fn(async (fileName, content) => {
      mockFileName = fileName
      mockFileWriteContent = content
    })
  }
}

export const mockHypnsNode = {
  hcrypto: {
    keyPair: jest.fn(async () => {
      return {
        publicKey,
        secretKey
      }
    })
  },
  sodium: {
    crypto_sign_seed_keypair: jest.fn(async (publicKey, sK, seedBuffer) => {
      sK = secretKey
    })

  }
}

export const mockHypnsInstance = () => {
  return {
    ready: jest.fn(async () => {
      return { call: new Promise((resolve, reject) => resolve()) }
    }),
    writable: true,
    peers: ['mockPeer1', 'mockPeer2'],
    key: mockKey,
    publicKey: mockKey,
    readFile: jest.fn(async () => mockDocument),
    writeFile: jest.fn(async (fileName, content) => {
      mockFileName = fileName
      mockFileWriteContent = content
    })
  }
}
