// Orbit DB
export const DB_NAME= 'profile';

export const DB_TYPE = 'keyvalue';

export const PEEK_REPLICATION_WAIT_TIME = 60000;

export const PEEK_DROP_DELAY = 60000 * 3;

// Profile Properties
export const PROFILE_TYPES = ['Person', 'Organization', 'Thing'];

export const PROFILE_MANDATORY_PROPERTIES = ['@context', '@type', 'name'];

export const PROFILE_BLOB_PROPERTIES = ['image'];
