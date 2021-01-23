import {
  mockDid,
  mockDocument,
  mockKeyPair,
  mockDidHypns,
  mockHumanCryptoKeys,
  mockHypnsNode,
  mockHypnsInstance,
  mockDidHypnsInstance
} from './mocks'
import { createHypnsDid } from 'js-did-hypns'
import createHypnsId from '../'

jest.mock('js-did-hypns', () => {
  const { createHypnsDid, getDid, ...rest } = mockDidHypns

  return {
    __esModule: true,
    createHypnsDid,
    getDid,
    default: jest.fn(() => rest)
  }
})

jest.mock('human-crypto-keys', () => mockHumanCryptoKeys)

beforeEach(() => {
  jest.clearAllMocks()
})

it('should have all supported methods', async () => {
  const hyperId = createHypnsId(mockHypnsNode)

  expect(typeof hyperId.getDid).toBe('function')
  expect(typeof hyperId.resolve).toBe('function')
  expect(typeof hyperId.create).toBe('function')
  expect(typeof hyperId.update).toBe('function')
  expect(typeof hyperId.isPublicKeyValid).toBe('function')
  expect(hyperId.constructor.info).toEqual({
    method: 'hypns',
    description:
      'The Hypns DID method supports DIDs on the hypercore-protocol multifeed network.',
    homepageUrl: 'https://github.com/DougAnderson444/js-did-hypns',
    icons: []
  })
})

describe('getDid', () => {
  it('should get did of a given drive successfully', async () => {
    const hyperId = createHypnsId(mockHypnsNode)

    const did = await hyperId.getDid(mockHypnsInstance)

    expect(did).toBe(mockDid)
  })

  it('should support backups', async () => {
    // TODO
  })

  it('should support seeds', async () => {
    // TODO
  })

  it('should fail if params are missing', async () => {
    // TODO
  })
})

describe('resolve', () => {
  it('should resolve successfully', async () => {
    const hyperId = createHypnsId(mockHypnsNode)

    const document = await hyperId.resolve(mockDid)

    expect(document).toEqual(mockDocument)
    expect(createHypnsDid).toHaveBeenCalledWith(mockHypnsNode)
    expect(mockDidHypnsInstance.resolve).toHaveBeenCalledWith(mockDid)
  })

  it('should fail if did hyperId resolve is unsuccessful', async () => {
    const hyperId = createHypnsId(mockHypnsNode)

    mockDidHypnsInstance.resolve.mockImplementationOnce(() => {
      throw new Error('bar')
    })

    await expect(hyperId.resolve(mockDid)).rejects.toThrow('bar')
  })
})

describe('create', () => {
  it('should create successfully', async () => {
    const mockOperations = jest.fn()

    const hyperId = createHypnsId(mockHypnsNode)
    const { did, didDocument, backupData } = await hyperId.create(
      {},
      mockOperations
    )

    expect(mockDidHypnsInstance.create).toHaveBeenCalledTimes(1)
    expect(mockOperations).toHaveBeenCalledTimes(1)
    expect(did).toBe(mockDid)
    expect(didDocument).toEqual(mockDocument)
    expect(backupData).toEqual(backupData)
  })

  it('should fail if did-hyperId create is unsuccessful', async () => {
    expect.assertions(3)

    mockDidHypnsInstance.create.mockImplementationOnce(() => {
      throw new Error('bar')
    })

    const mockOperations = jest.fn()

    const hyperId = createHypnsId(mockHypnsNode)

    try {
      await hyperId.create({}, mockOperations)
    } catch (err) {
      expect(mockDidHypnsInstance.create).toHaveBeenCalledTimes(1)
      expect(mockOperations).toHaveBeenCalledTimes(0)
      expect(err.message).toBe('bar')
    }
  })
})

describe('update', () => {
  it('should update successfully', async () => {
    const mockOperations = jest.fn()
    const mockParams = { hypnsInstance: mockDidHypnsInstance }

    const hyperId = createHypnsId(mockHypnsNode)
    const didDocument = await hyperId.update(
      mockDid,
      mockParams,
      mockOperations
    )

    expect(mockDidHypnsInstance.update).toHaveBeenCalledWith(mockDidHypnsInstance, mockOperations)
    expect(mockOperations).toHaveBeenCalledTimes(1)
    expect(didDocument).toEqual(mockDocument)
  })

  it('should support mnemonics', async () => {
    // N/A to hyperdrive
  })

  it('should support seeds', async () => {
    // N/A to hyperdrive
  })

  it('should fail if did-hyperId update is unsuccessful', async () => {
    expect.assertions(3)

    mockDidHypnsInstance.update.mockImplementationOnce(() => {
      throw new Error('bar')
    })

    const mockOperations = jest.fn()
    const mockParams = { hypnsInstance: mockDidHypnsInstance }

    const hyperId = createHypnsId(mockHypnsNode)

    try {
      await hyperId.update(mockDid, mockParams, mockOperations)
    } catch (err) {
      expect(mockDidHypnsInstance.update).toHaveBeenCalledWith(mockDidHypnsInstance, mockOperations)
      expect(mockOperations).toHaveBeenCalledTimes(0)
      expect(err.message).toBe('bar')
    }
  })
})

describe('isPublicKeyValid', () => {
  it('should be successful if public key available in the document', async () => {
    mockDidHypnsInstance.resolve.mockImplementationOnce(() => ({
      ...mockDocument,
      publicKey: [{ id: 'bar' }]
    }))

    const hyperId = createHypnsId(mockHypnsNode)
    const isValid = await hyperId.isPublicKeyValid(mockDid, 'bar')

    expect(isValid).toBe(true)
    expect(mockDidHypnsInstance.resolve).toHaveBeenCalledWith(mockDid)
  })

  it('should fail if public key no available in the document', async () => {
    mockDidHypnsInstance.resolve.mockImplementationOnce(() => ({ ...mockDocument }))

    const hyperId = createHypnsId(mockHypnsNode)
    const isValid = await hyperId.isPublicKeyValid(mockDid, 'bar')

    expect(isValid).toBe(false)
    expect(mockDidHypnsInstance.resolve).toHaveBeenCalledWith(mockDid)
  })

  it('should fail if resolve is unsuccessful', async () => {
    mockDidHypnsInstance.resolve.mockImplementationOnce(() => {
      throw new Error('bar')
    })

    const hyperId = createHypnsId(mockHypnsNode)

    await expect(hyperId.isPublicKeyValid(mockDid, 'bar')).rejects.toThrow(
      'bar'
    )
  })
})

it('should use the same did-hyperId instance for multiple purposes', async () => {
  const hyperId = createHypnsId(mockHypnsNode)

  await hyperId.resolve(mockDid)
  await hyperId.create({}, () => {})
  await hyperId.update(
    mockDid,
    { privateKey: mockKeyPair.privateKey },
    () => {}
  )

  expect(mockDidHypnsInstance.resolve).toHaveBeenCalledTimes(1)
  expect(mockDidHypnsInstance.create).toHaveBeenCalledTimes(1)
  expect(mockDidHypnsInstance.update).toHaveBeenCalledTimes(1)
})
