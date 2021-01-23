import createHypns from '../methods/hypns'
import createDidm from '../index'
import { mockDid, mockDocument, mockHypns } from './mocks'
import { mockHypnsNode } from '../methods/hypns/__tests__/mocks'

const options = { hypnsNode: mockHypnsNode }

jest.mock('../methods/hypns', () => jest.fn(() => mockHypns))

beforeEach(() => {
  jest.clearAllMocks()
})

it('should have all specification methods', async () => {
  const did = createDidm(options)

  expect(typeof did.resolve).toBe('function')
  expect(typeof did.create).toBe('function')
  expect(typeof did.update).toBe('function')
  expect(typeof did.isPublicKeyValid).toBe('function')
  expect(typeof did.getMethods).toBe('function')
})

describe('getMethods', () => {
  it('should return all available methods and its information', async () => {
    const did = createDidm(options)

    expect(did.getMethods()).toMatchSnapshot()
  })
})

describe('isSupported', () => {
  it('should return true if did method supports operation', () => {
    const did = createDidm(options)

    expect(did.isSupported('hypns', 'create')).toBe(true)
  })

  it('should return false if did method does not supports operation', () => {
    const did = createDidm(options)

    expect(did.isSupported('hypns', 'clear')).toBe(false)
  })
})

describe('getDid', () => {
  it('should return the correspondent did', async () => {
    const did = createDidm(options)

    await expect(did.getDid('hypns', { foo: 'bar' })).resolves.toBe(mockDid)

    expect(mockHypns.getDid).toHaveBeenCalledTimes(1)
    expect(mockHypns.getDid).toHaveBeenCalledWith({ foo: 'bar' })
  })
})

describe('resolve', () => {
  it('should resolve successfully', async () => {
    const did = createDidm(options)
    const document = await did.resolve('did:hypns:foo')

    expect(mockHypns.resolve).toHaveBeenCalledTimes(1)
    expect(mockHypns.resolve).toHaveBeenCalledWith('did:hypns:foo')
    expect(document).toBe(mockDocument)
  })

  it('should fail if invalid did', async () => {
    expect.assertions(2)

    const did = createDidm(options)

    try {
      await did.resolve('did#abcdef')
    } catch (err) {
      expect(err.message).toMatch(/invalid/i)
      expect(err.code).toBe('INVALID_DID')
    }
  })

  it('should fail if method is not supported', async () => {
    expect.assertions(2)

    const did = createDidm(options)

    try {
      await did.resolve('did:fake:abcdef')
    } catch (err) {
      expect(err.message).toBe('Did method `fake` is not supported')
      expect(err.code).toBe('UNSUPPORTED_DID_METHOD')
    }
  })

  it('should fail if method does not support purpose', async () => {
    const mockHypnsOnce = { ...mockHypns, resolve: undefined }

    createHypns.mockImplementationOnce(() => mockHypnsOnce)

    expect.assertions(2)

    const did = createDidm(options)

    try {
      await did.resolve('did:hypns:abcdef')
    } catch (err) {
      expect(err.message).toBe('Purpose `resolve` is not currently supported for `hypns`')
      expect(err.code).toBe('UNSUPPORTED_DID_METHOD_PURPOSE')
    }
  })
})

describe('create', () => {
  it('should create successfully', async () => {
    const mockParams = { privateKey: 'mockPrivateKey', foo: 'bar' }
    const mockOperations = () => {}

    const did = createDidm(options)
    const document = await did.create('hypns', mockParams, mockOperations)

    expect(mockHypns.create).toHaveBeenCalledTimes(1)
    expect(mockHypns.create).toHaveBeenCalledWith(mockParams, mockOperations)
    expect(document).toBe(mockDocument)
  })

  it('should fail if method is not supported', async () => {
    expect.assertions(2)

    const did = createDidm(options)

    try {
      await did.create('fake')
    } catch (err) {
      expect(err.message).toBe('Did method `fake` is not supported')
      expect(err.code).toBe('UNSUPPORTED_DID_METHOD')
    }
  })

  it('should fail if method does not support purpose', async () => {
    const mockHypnsOnce = { ...mockHypns, create: undefined }

    createHypns.mockImplementationOnce(() => mockHypnsOnce)

    expect.assertions(2)

    const did = createDidm(options)

    try {
      await did.create('hypns')
    } catch (err) {
      expect(err.message).toBe('Purpose `create` is not currently supported for `hypns`')
      expect(err.code).toBe('UNSUPPORTED_DID_METHOD_PURPOSE')
    }
  })
})

describe('update', () => {
  it('should create successfully', async () => {
    const mockParams = { privateKey: 'mockPrivateKey', foo: 'bar' }
    const mockOperations = () => {}

    const did = createDidm(options)
    const document = await did.update('did:hypns:abcdef', mockParams, mockOperations)

    expect(mockHypns.update).toHaveBeenCalledTimes(1)
    expect(mockHypns.update).toHaveBeenCalledWith('did:hypns:abcdef', mockParams, mockOperations)
    expect(document).toBe(mockDocument)
  })

  it('should fail if invalid did', async () => {
    expect.assertions(2)

    const did = createDidm(options)

    try {
      await did.update('did#abcdef')
    } catch (err) {
      expect(err.message).toMatch(/invalid/i)
      expect(err.code).toBe('INVALID_DID')
    }
  })

  it('should fail if method is not supported', async () => {
    expect.assertions(2)

    const did = createDidm(options)

    try {
      await did.update('did:fake:abcdef')
    } catch (err) {
      expect(err.message).toBe('Did method `fake` is not supported')
      expect(err.code).toBe('UNSUPPORTED_DID_METHOD')
    }
  })

  it('should fail if method does not support purpose', async () => {
    const mockHypnsOnce = { ...mockHypns, update: undefined }

    createHypns.mockImplementationOnce(() => mockHypnsOnce)

    expect.assertions(2)

    const did = createDidm(options)

    try {
      await did.update('did:hypns:abcdef')
    } catch (err) {
      expect(err.message).toBe('Purpose `update` is not currently supported for `hypns`')
      expect(err.code).toBe('UNSUPPORTED_DID_METHOD_PURPOSE')
    }
  })
})

describe('isPublicKeyValid', () => {
  it('should be successful if public key in document', async () => {
    const mockOptions = { foo: 'bar' }

    const did = createDidm(options)
    const isValid = await did.isPublicKeyValid('did:hypns:abcdef', 'did:hypns:abcdef#123', mockOptions)

    expect(isValid).toBe(true)
    expect(mockHypns.isPublicKeyValid).toHaveBeenCalledTimes(1)
    expect(mockHypns.isPublicKeyValid).toHaveBeenCalledWith('did:hypns:abcdef', 'did:hypns:abcdef#123', mockOptions)
  })

  it('should fail if invalid did', async () => {
    expect.assertions(2)

    const did = createDidm(options)

    try {
      await did.isPublicKeyValid('did#abcdef')
    } catch (err) {
      expect(err.message).toMatch(/invalid/i)
      expect(err.code).toBe('INVALID_DID')
    }
  })

  it('should fail if method is not supported', async () => {
    expect.assertions(2)

    const did = createDidm(options)

    try {
      await did.isPublicKeyValid('did:fake:abcdef')
    } catch (err) {
      expect(err.message).toBe('Did method `fake` is not supported')
      expect(err.code).toBe('UNSUPPORTED_DID_METHOD')
    }
  })

  it('should fail if method does not support purpose', async () => {
    const mockHypnsOnce = { ...mockHypns, isPublicKeyValid: undefined }

    createHypns.mockImplementationOnce(() => mockHypnsOnce)

    expect.assertions(2)

    const did = createDidm(options)

    try {
      await did.isPublicKeyValid('did:hypns:abcdef')
    } catch (err) {
      expect(err.message).toBe('Purpose `isPublicKeyValid` is not currently supported for `hypns`')
      expect(err.code).toBe('UNSUPPORTED_DID_METHOD_PURPOSE')
    }
  })
})
