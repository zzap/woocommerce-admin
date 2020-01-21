/**
 * External Dependencies
 *
 * @format
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal Dependencies
 */
import { NAMESPACE } from '../constants';

export const dataPersistenceMap = {
	wcAdminSettings: function* ( group, keys, data ) {
		const url = `${ NAMESPACE }/settings/${ group }/batch`;
		const update = Object.keys( data ).map( k => {
			return { id: k, value: data[ k ] };
		} );

		return yield apiFetch( {
			path: url,
			method: 'POST',
			data: { update },
		} );
	},
};
