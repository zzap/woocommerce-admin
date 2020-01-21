/**
 * External Dependencies
 *
 * @format
 */

import { apiFetch, select } from '@wordpress/data-controls';
import { concat } from 'lodash';

/**
 * Internal Dependencies
 */
import { NAMESPACE } from '../constants';
import { STORE_NAME } from './constants';
import TYPES from './action-types';
import { dataPersistenceMap } from './data';

export function updateSettingsForGroup( group, data, time = new Date() ) {
	return {
		type: TYPES.UPDATE_SETTINGS_FOR_GROUP,
		group,
		data,
		time,
	};
}

export function updateErrorForGroup( group, data, error, time = new Date() ) {
	return {
		type: TYPES.UPDATE_ERROR_FOR_GROUP,
		group,
		data,
		error,
		time,
	};
}

export function setIsPersisting( group, isPersisting ) {
	return {
		type: TYPES.SET_IS_PERSISTING,
		group,
		isPersisting,
	};
}

export function clearIsDirty( group ) {
	return {
		type: TYPES.CLEAR_IS_DIRTY,
		group,
	};
}

// allows updating and persisting immediately in one action.
export function* updateAndPersistSettingsForGroup( group, data ) {
	yield updateSettingsForGroup( group, data );
	yield* persistSettingsForGroup( group );
}

// this would replace setSettingsForGroup
export function* persistSettingsForGroup( group ) {
	// first dispatch the is persisting action
	yield setIsPersisting( group, true );
	// get all dirty keys with select control
	const dirtyKeys = yield select( STORE_NAME, 'getDirtyKeys', group );
	// if there is nothing dirty, bail
	if ( dirtyKeys.length === 0 ) {
		yield setIsPersisting( group, false );
		return;
	}

	// get data slice for keys
	const dirtyData = yield select( STORE_NAME, 'getSettingsForGroup', group, dirtyKeys );

	for ( let i = 0; i < dirtyKeys.length; i++ ) {
		try {
			const key = dirtyKeys[ i ];
			const getResults = dataPersistenceMap[ key ];
			const results = yield getResults( group, key, dirtyData[ key ] );
			if ( ! results ) {
				throw new Error( 'settings did not update' );
			}
			// remove dirtyKeys from map - note we're only doing this if there is no error.
			yield clearIsDirty( group );
		} catch ( e ) {
			yield updateErrorForGroup( group, null, e );
		}
		yield setIsPersisting( group, false );
	}
}

export function clearSettings() {
	return {
		type: TYPES.CLEAR_SETTINGS,
	};
}
