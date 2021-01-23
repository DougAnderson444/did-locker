import createWallet from '../index'
import createStorage from '../storage'
import createDidm from '../didm'
import createLocker from '../locker'

import { mockStorage } from './mocks'
import { mockHypnsNode } from '../didm/methods/hypns/__tests__/mocks'

jest.mock('../storage', () => jest.fn(() => mockStorage))
jest.mock('../didm')
jest.mock('../locker')

beforeEach(() => {
  jest.clearAllMocks()
})

it('should create wallet successfully', async () => {
  const wallet = await createWallet({ mockHypnsNode })

  expect(Object.keys(wallet)).toEqual(['didm', 'storage', 'locker', 'identities', 'sessions'])
})

it('should throw if storage creation fails', async () => {
  createStorage.mockImplementationOnce(() => { throw new Error('foo') })

  await expect(createWallet({ mockHypnsNode })).rejects.toThrow('foo')
})

it('should throw if locker creation fails', async () => {
  createLocker.mockImplementationOnce(() => { throw new Error('bar') })

  await expect(createWallet({ mockHypnsNode })).rejects.toThrow('bar')
})

it('should throw if didm creation fails', async () => {
  createDidm.mockImplementationOnce(() => { throw new Error('biz') })

  await expect(createWallet({ mockHypnsNode })).rejects.toThrow('biz')
})
