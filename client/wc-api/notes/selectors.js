/**
 * External dependencies
 */
import { isNil } from 'lodash';

/**
 * Internal dependencies
 */
import { getResourceName } from '../utils';
import { DEFAULT_REQUIREMENT } from '../constants';

const getNotes = ( getResource, requireResource ) => (
	query = {},
	requirement = DEFAULT_REQUIREMENT
) => {
	const resourceName = getResourceName( 'note-query', query );
	const ids = requireResource( requirement, resourceName ).data || [];
	const notes = ids.map(
		( id ) => getResource( getResourceName( 'note', id ) ).data || {}
	);
	return notes;
};

const getNotesError = ( getResource ) => ( query = {} ) => {
	const resourceName = getResourceName( 'note-query', query );
	return getResource( resourceName ).error;
};

const isGetNotesRequesting = ( getResource ) => ( query = {} ) => {
	const resourceName = getResourceName( 'note-query', query );
	const { lastRequested, lastReceived } = getResource( resourceName );

	if ( isNil( lastRequested ) || isNil( lastReceived ) ) {
		return true;
	}

	return lastRequested > lastReceived;
};

const isUndoDismissRequesting = ( getResource ) => () => {
	const resourceName = 'note-undo-dismiss';
	const { note, requesting } = getResource( resourceName );

	if ( requesting ) {
		return note;
	}
	return false;
};

export default {
	getNotes,
	getNotesError,
	isGetNotesRequesting,
	isUndoDismissRequesting,
};
