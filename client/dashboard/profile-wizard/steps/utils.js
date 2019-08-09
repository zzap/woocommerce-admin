/** @format */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export const PLUGINS = [ 'jetpack', 'woocommerce-services' ];

export function getPluginsToInstall() {
	//wcSettings.onboarding.activePlugins;
}

export function getPluginName( plugin ) {
	switch ( plugin ) {
		case 'jetpack':
			return __( 'Jetpack', 'woocommerce-admin' );
		case 'woocommerce-services':
			return __( 'WooCommerce Services', 'woocommerce-admin' );
	}
}
