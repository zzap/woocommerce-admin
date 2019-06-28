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

function getRouteMatch( query ) {
	const pages = getPages();
	let routeMatch = null;

	const path = query.path ? query.path : '/';
	pages.forEach( page => {
		const matched = matchPath( path, { path: page.path, exact: true } );
		if ( matched ) {
			routeMatch = matched;
			return;
		}
	} );

	return routeMatch;
}

export class Router extends Component {
	constructor( props ) {
		super( props );

		const history = getHistory();
		this.unlisten = history.listen( () => {
			this.setState( { match: this.getMatch( window.location.search ) } );
		} );
		const match = this.getMatch( window.location.search );

		this.state = { history, match };
	}

	componentWillUnmount() {
		this.unlisten();
	}

	getMatch( search ) {
		const query = getBaseQuery( search );
		return getRouteMatch( query );
	}

	render() {
		const { history, match } = this.state;

		return <Layout history={ history } location={ history.location } match={ match } />;
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
