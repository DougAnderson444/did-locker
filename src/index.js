import createSecret from './secret'
import createStorage from './storage'
import createDidm from './didm'
import createIdentities from './identities'
// import createSessions from './sessions'
import createLocker from './locker'

const createWallet = async (options) => {
  const { methods, linkage } = options
  // linkage = { getDb, dropDb, stopDbReplication }

  const secret = createSecret() // Secret Object
  const storage = await createStorage(secret) // LevelDB with encrypt wrapper
  const didm = createDidm(methods) // creates DID methods
  const identities = createIdentities(storage, didm, linkage)
  //   const sessions = await createSessions(storage, identities)
  const locker = await createLocker(storage, secret)
  const sessions = {}

  const idmWallet = {
    didm,
    storage,
    locker,
    identities,
    sessions
  }

  return idmWallet
}

export default createWallet
