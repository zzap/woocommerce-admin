/** @format */
/**
 * External dependencies
 */
import { render } from '@wordpress/element';
import { Provider as SlotFillProvider } from 'react-slot-fill';

/**
 * Internal dependencies
 */
import './stylesheets/_index.scss';
import { Router } from './layout';
import 'store';
import 'wc-api/wp-data-store';

render(
	<SlotFillProvider>
		<Router />
	</SlotFillProvider>,
	document.getElementById( 'root' )
);
