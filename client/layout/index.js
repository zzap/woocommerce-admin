/** @format */
/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { Slot } from 'react-slot-fill';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { matchPath } from 'react-router-dom';

/**
 * WooCommerce dependencies
 */
import { getHistory } from '@woocommerce/navigation';

/**
 * Internal dependencies
 */
import './style.scss';
import { Controller, getPages, getBaseQuery } from './controller';
import Header from 'header';
import Notices from './notices';
import { recordPageView } from 'lib/tracks';
import TransientNotices from './transient-notices';
import StoreAlerts from './store-alerts';

export class PrimaryLayout extends Component {
	render() {
		const { children } = this.props;
		return (
			<div className="woocommerce-layout__primary" id="woocommerce-layout__primary">
				{ window.wcAdminFeatures[ 'store-alerts' ] && <StoreAlerts /> }
				<Notices />
				{ children }
			</div>
		);
	}
}

class Layout extends Component {
	componentDidMount() {
		this.recordPageViewTrack();
		document.body.classList.remove( 'woocommerce-admin-is-loading' );
	}

	componentDidUpdate( prevProps ) {
		const previousPath = get( prevProps, 'location.pathname' );
		const currentPath = get( this.props, 'location.pathname' );

		if ( ! previousPath || ! currentPath ) {
			return;
		}

		if ( previousPath !== currentPath ) {
			this.recordPageViewTrack();
		}
	}

	recordPageViewTrack() {
		const pathname = get( this.props, 'location.pathname' );
		if ( ! pathname ) {
			return;
		}

		// Remove leading slash, and camel case remaining pathname
		let path = pathname.substring( 1 ).replace( /\//g, '_' );

		// When pathname is `/` we are on the dashboard
		if ( path.length === 0 ) {
			path = 'dashboard';
		}

		recordPageView( path );
	}

	render() {
		const { isEmbedded, ...restProps } = this.props;
		return (
			<div className="woocommerce-layout">
				<Slot name="header" />
				<TransientNotices />
				{ ! isEmbedded && (
					<PrimaryLayout>
						<div className="woocommerce-layout__main">
							<Controller { ...restProps } />
						</div>
					</PrimaryLayout>
				) }
			</div>
		);
	}
}

Layout.propTypes = {
	isEmbedded: PropTypes.bool,
};

export class Router extends Component {
	constructor( props ) {
		super( props );

		// Initialize state.
		const history = getHistory();
		const { match, page } = this.getRouteMatch( window.location.search );
		this.state = { history, match, page };

		// listen for route changes and appropriately setState to re-render.
		this.unlisten = history.listen( () => {
			const { match: nextMatch, page: nextPage } = this.getRouteMatch( window.location.search );
			this.setState( { match: nextMatch, page: nextPage } );
		} );
	}

	componentWillUnmount() {
		this.unlisten();
	}

	getRouteMatch( search ) {
		const query = getBaseQuery( search );
		const pages = getPages();
		let match = null;
		let layoutPage = null;

		const path = query.path ? query.path : '/';
		pages.forEach( page => {
			const matched = matchPath( path, { path: page.path, exact: true } );
			if ( matched ) {
				match = matched;
				layoutPage = page;
				return;
			}
		} );

		return { match, page: layoutPage };
	}

	render() {
		const { history, match, page } = this.state;

		return (
			<Layout history={ history } location={ history.location } match={ match } page={ page } />
		);
	}
}

export class EmbedLayout extends Component {
	render() {
		return (
			<Fragment>
				<Header sections={ wcSettings.embedBreadcrumbs } isEmbedded />
				<Layout isEmbedded />
			</Fragment>
		);
	}
}
