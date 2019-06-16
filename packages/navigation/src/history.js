/** @format */
/**
 * External dependencies
 */
import { createBrowserHistory } from 'history';

// See https://github.com/ReactTraining/react-router/blob/master/FAQ.md#how-do-i-access-the-history-object-outside-of-components

let _history;

function getHistory() {
	if ( ! _history ) {
		const path = document.location.pathname;
		_history = createBrowserHistory( {
			basename: path.substring( 0, path.lastIndexOf( '/' ) ),
		} );
	}
	return _history;
}

export { getHistory };
