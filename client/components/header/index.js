/** @format */
/**
 * External dependencies
 */
import { Fill } from 'react-slot-fill';

/**
 * Internal dependencies
 */
import Header from './header';

export default function( props ) {
	return (
		<Fill name="header">
			<Header { ...props } />
		</Fill>
	);
}
