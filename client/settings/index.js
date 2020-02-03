/** @format */

const SOURCE = typeof wcSettings === 'object' ? wcSettings : {};

export const ADMIN_URL = SOURCE.adminUrl;
export const COUNTRIES = SOURCE.countries;
export const CURRENCY = SOURCE.currency;
export const LOCALE = SOURCE.locale;
export const ORDER_STATUSES = SOURCE.orderStatuses;
export const SITE_TITLE = SOURCE.siteTitle;
export const WC_ASSET_URL = SOURCE.wcAssetUrl;

/**
 * Retrieves a setting value from the setting state.
 *
 * @export
 * @param {string}   name                         The identifier for the setting.
 * @param {mixed}    [fallback=false]             The value to use as a fallback
 *                                                if the setting is not in the
 *                                                state.
 * @param {function} [filter=( val ) => val]  	  A callback for filtering the
 *                                                value before it's returned.
 *                                                Receives both the found value
 *                                                (if it exists for the key) and
 *                                                the provided fallback arg.
 *
 * @returns {mixed}  The value present in the settings state for the given
 *                   name.
 */
export function getSetting( name, fallback = false, filter = val => val ) {
	const value = SOURCE.hasOwnProperty( name ) ? SOURCE[ name ] : fallback;
	return filter( value, fallback );
}

/**
 * Sets a value to a property on the settings state.
 *
 * @deprecated
 *
 * @export
 * @param {string}   name                        The setting property key for the
 *                                               setting being mutated.
 * @param {mixed}    value                       The value to set.
 * @param {function} [filter=( val ) => val]     Allows for providing a callback
 *                                               to sanitize the setting (eg.
 *                                               ensure it's a number)
 */
export function setSetting( name, value, filter = val => val ) {
	if ( [ 'wcAdminSettigs', 'onboarding' ].includes( name ) ) {
		SOURCE[ name ] = filter( value );
	}
}

/**
 * Returns a string with the site's wp-admin URL appended. JS version of `admin_url`.
 *
 * @param {String} path Relative path.
 * @return {String} Full admin URL.
 */
export function getAdminLink( path ) {
	return ( ADMIN_URL || '' ) + path;
}
