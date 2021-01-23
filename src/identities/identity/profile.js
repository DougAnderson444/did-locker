import signal from 'pico-signals';
import pDelay from 'delay';
import pSeries from 'p-series';
import { pick, has, isEqual } from 'lodash';
import { assertProfileProperty, assertNonMandatoryProfileProperty } from './utils/asserts';
import { ProfileReplicationTimeoutError } from '../../utils/errors';
import {
    DB_NAME,
    DB_TYPE,
    PEEK_REPLICATION_WAIT_TIME,
    PEEK_DROP_DELAY,
    PROFILE_BLOB_PROPERTIES,
    PROFILE_MANDATORY_PROPERTIES,
} from './utils/constants/profile';

const peekDropStoreTimers = new Map();

class Profile {
    #dbStore;
    #details;
    #onChange = signal();

    constructor(dbStore) {
        this.#dbStore = dbStore;
    }

    async setProperty(key, value) {
        assertProfileProperty(key, value);

        await this.#saveProperty(key, value);
    }

    async unsetProperty(key) {
        assertNonMandatoryProfileProperty(key);

        await this.#removeProperty(key);
    }

    async setProperties(properties) {
        const tasks = Object.entries(properties)
        .map(([key, value]) => {
            if (value === undefined) {
                assertNonMandatoryProfileProperty(key);

                return () => this.#removeProperty(key);
            }

            assertProfileProperty(key, value);

            return () => this.#saveProperty(key, value);
        });

        return pSeries(tasks);
    }

    getDetails() {
        return this.#details;
    }

    onChange(fn) {
        return this.#onChange.add(fn);
    }

    #saveProperty = async (key, value) => {

        if (!isEqual(this.#dbStore.get(key), value)) {
            await this.#dbStore.put(key, value);
        }
    };

    #removeProperty = async (key) => {
        if (has(this.#dbStore.all, key)) {
            await this.#dbStore.del(key);
        }
    };
}

const peekDropStore = (identityId, replicatedDb, dbStore) => {
    const timeoutId = setTimeout(async () => {
        try {
            await dbStore.drop();
            await dropOrbitDbIfEmpty(replicatedDb);
        } catch (err) {
            console.warn(`Unable to drop profile DB store for identity after peeking: ${identityId.id}`, err);
        }
    }, PEEK_DROP_DELAY);

    peekDropStoreTimers.set(dbStore, timeoutId);
};

const cancelPeekDropStore = (dbStore) => {
    const timeoutId = peekDropStoreTimers.get(dbStore);

    clearTimeout(timeoutId);
    peekDropStoreTimers.delete(dbStore);
};

export const peekProfileDetails = async (identityDescriptor, linkage, replicatedDb) => {
    const dbStore = await replicatedDb.loadStore(DB_NAME);

    cancelPeekDropStore(dbStore);

    // To allow a fast import of the identity, we delay the drop of the DB
    peekDropStore(identityDescriptor.id, replicatedDb, dbStore);

    const profile = new Profile(dbStore);

    return profile.getDetails();
};

export const createProfile = async (details, identityDescriptor, linkage, replicatedDb) => {
    const dbStore = await replicatedDb.loadStore(DB_NAME);
    const profile = new Profile(dbStore);

    cancelPeekDropStore(dbStore);

    if (details) {
        await dbStore.put('identifier', identityDescriptor.did);

        for (const [key, value] of Object.entries(details)) {
            await profile.setProperty(key, value); // eslint-disable-line no-await-in-loop
        }
    } else {
        // when you import an identity it has no details until it's replicated
        await replicatedDb.isReplicated(identityDescriptor.did) // API
    }

    return profile;
};

export const restoreProfile = async (identityDescriptor, ipfs, replicatedDb) => {
    const dbStore = await replicatedDb.loadStore(DB_NAME);

    cancelPeekDropStore(dbStore);

    return new Profile(dbStore);
};

export const removeProfile = async (identityDescriptor, ipfs, replicatedDb) => {
    await replicatedDb.dropStore(DB_NAME);
};
