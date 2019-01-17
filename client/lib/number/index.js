/** @format */

/**
 * External dependencies
 */
import { formatCurrency } from '@woocommerce/currency';
import { isFinite } from 'lodash';

/**
 * Formats a number using site's current locale
 *
 * @format
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
 * @param {Number|String}  number    number to format
 * @returns {?String}                  A formatted string.
 */

export function numberFormat( number ) {
	const locale = wcSettings.siteLocale || 'en-US'; // Default so we don't break.

	if ( 'number' !== typeof number ) {
		number = parseFloat( number );
	}
	if ( isNaN( number ) ) {
		return '';
	}
	return new Intl.NumberFormat( locale ).format( number );
}

export function formatValue( type, value ) {
	if ( ! isFinite( value ) ) {
		return null;
	}

	switch ( type ) {
		case 'average':
			return Math.round( value );
		case 'currency':
			return formatCurrency( value );
		case 'number':
			return numberFormat( value );
	}
}

export function calculateDelta( primaryValue, secondaryValue ) {
	if ( ! isFinite( primaryValue ) || ! isFinite( secondaryValue ) ) {
		return null;
	}

	if ( secondaryValue === 0 ) {
		return 0;
	}

	return Math.round( ( primaryValue - secondaryValue ) / secondaryValue * 100 );
}
