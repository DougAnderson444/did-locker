import { createHypnsDid, getDid } from "js-did-hypns"
import {
  getKeyPairFromMnemonic,
  getKeyPairFromSeed,
} from "human-crypto-keys";
import { MissingDidParameters } from "../../../utils/errors"

class HypnsId {
  static info = {
    method: 'hypns',
    description:
      'The Hypns DID method supports DIDs on the hypercore-protocol multifeed network.',
    homepageUrl: 'https://github.com/DougAnderson444/js-did-hypns',
    icons: []
  }

  #didHypns;
  #hypnsNode;

  constructor (hypnsNode) {
    this.#hypnsNode = hypnsNode
  }

  async getDid (params) {
    return getDid(params.hypnsInstance)
  }

  async resolve (did) {
    await this.#assurehypnsId()

    return await this.#didHypns.resolve(did)
  }

  async create (params, operations) {
    let backupData = {}

    if (
      params.backupData &&
      params.backupData.privateKey &&
      params.backupData.publicKey
    ) {
      backupData = { ...params.backupData }
    } else {
      backupData.publicKey = this.#hypnsNode.hcrypto.keyPair().publicKey
      backupData.privateKey = this.#hypnsNode.hcrypto.keyPair().secretKey
    }

    await this.#assurehypnsId()

    const didDocument = await this.#didHypns.create(
      params.drive,
      (document) => {
        document.addPublicKey({
          id: 'idm-master',
          type: 'Ed25519VerificationKey2018',
          publicKeyHex: backupData.publicKey
        })

        operations(document)
      }
    )

    return {
      did: didDocument.id,
      didDocument,
      backupData
    }
  }

  async update(did, params, operations) {
    
    await this.#assurehypnsId();

    const didDocument = await this.#didHypns.update(params.hypnsInstance, operations);

    return didDocument;
  }

  async isPublicKeyValid(did, publicKeyId) {
    const { publicKey = [] } = await this.resolve(did);

    return publicKey.some((key) => key.id === publicKeyId);
  }

  #assurehypnsId = async () => {
    if (!this.#didHypns) {
      this.#didHypns = await createHypnsDid(this.#hypnsNode);
    }
  };

  #getMasterPrivateKey = async (params) => {
    const { privateKey, mnemonic, seed, algorithm } = params || {};

    if (privateKey) {
      return privateKey;
    }

    if (seed) {
      // const { privateKey } = await getKeyPairFromSeed(seed, algorithm || "rsa");
      const publicKey = Buffer.allocUnsafe(sodium.crypto_sign_PUBLICKEYBYTES)
      const secretKey = Buffer.allocUnsafe(sodium.crypto_sign_SECRETKEYBYTES)
      this.#hypnsNode.sodium.crypto_sign_seed_keypair(publicKey, secretKey, Buffer.from(seed, 'hex')) 

      return privateKey;
    }

    if (mnemonic) {
      const { privateKey } = await getKeyPairFromMnemonic(
        mnemonic,
        algorithm || "rsa"
      );

      return privateKey;
    }

    throw new MissingDidParameters(
      "Please specify the privateKey, seed or mnemonic"
    );
  };
}

const createHypnsId = (node) => new HypnsId(node)

export default createHypnsId;
