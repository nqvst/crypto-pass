import { combineReducers } from 'redux';
import { getDomains, updateDomain, useDomain } from '../../core/config';
import {
    SETUP_COMPLETE,
    CREATE_SEED,
    UNLOCK,
    LOCK,
    ADD_DOMAIN,
    GET_DOMAINS,
    USE_DOMAIN,
} from '../types';

import { addDomain } from '../../core/config';

const initialAppState = {
    showSetup: true,
    seed: '',
    locked: true,
    pass: '',
    domains: [],
}

const applicationReducer = (state = initialAppState, action) => {
    switch(action.type) {
        case SETUP_COMPLETE: {
            return {
                ...state,
                showSetup: false,
            };
        }

        case CREATE_SEED: {
            if (action.payload) {
                return {
                    ...state,
                    seed: action.payload,
                };
            }
        }

        case UNLOCK: {
            return {
                ...state,
                pass: action.payload,
                locked: false,
            }
        }

        case LOCK: {
            return {
                ...state,
                locked: true,
            }
        }

        case ADD_DOMAIN: {
            if (action.payload) {
                return {
                    ...state,
                    domains: updateDomain(action.payload),
                };
            }
        }

        case GET_DOMAINS: {
            return {
                ...state,
                domains: getDomains(),
            }
        }

        case USE_DOMAIN: {
            return {
                ...state,
                domains: useDomain(action.payload),
            }
        }

        default: {
            console.log('NO CASE FOUND: ', action);
            return state;
        }
    }
};

export default combineReducers({
    app: applicationReducer,
});