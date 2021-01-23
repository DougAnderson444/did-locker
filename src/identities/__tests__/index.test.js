import createIdentities from '../'

import { mockStorage, mockDidm, mockLinkage } from './mocks'

it('should create identities', async () => {
  const identities = createIdentities(mockStorage, mockDidm, mockLinkage)

  expect(typeof identities.create).toBe('function')
})
