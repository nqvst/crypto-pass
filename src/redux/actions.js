import {
    SETUP_COMPLETE,
    ADD_DOMAIN,
    GET_DOMAINS,
    USE_DOMAIN,
    CREATE_SEED,
    UNLOCK,
    LOCK,
} from './types';

import { sha256 } from '../core/crypto';

export const completeSetup = () => ({
    type: SETUP_COMPLETE,
});

export const createSeed = (seed) => ({
    type: CREATE_SEED,
    payload: seed,
});

export const addDomain = (domain) => ({
    type: ADD_DOMAIN,
    payload: domain,
});

export const useDomain = (domain) => ({
    type: USE_DOMAIN,
    payload: domain,
});

export const unlock = (password) => ({
    type: UNLOCK,
    payload: sha256(password)
});

export const lock = () => ({
    type: LOCK,
});

export const getDomains = () => ({
    type: GET_DOMAINS,
});