/** @format */
/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { Router, Route, Switch } from 'react-router-dom';
import { Slot } from 'react-slot-fill';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { matchPath } from 'react-router-dom';
import { parse, stringify } from 'qs';

/**
 * WooCommerce dependencies
 */
import { getHistory } from '@woocommerce/navigation';

/**
 * Internal dependencies
 */
import './style.scss';
import { Controller, getPages } from './controller';
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

const TestPageA = props => {
	console.log( props );
	return <div>This is only a test AAAAAA</div>;
};

const TestPageB = props => {
	console.log( props );
	return <div>This is only a test BBBBBBB</div>;
};

function getQuery( searchString ) {
	if ( ! searchString ) {
		return {};
	}

	const search = searchString.substring( 1 );
	return parse( search );
}

function getBaseQuery( searchString ) {
	const query = getQuery( searchString );
	delete query.page;
	return query;
}

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

export class PageLayout extends Component {
	render() {
		// console.log(this.props);
		const query = getBaseQuery( window.location.search );
		const match = getRouteMatch( query );
		// return (
		// 	<Router history={ getHistory() }>
		// 		<Switch>
		//
		// 			<Route component={ TestPageA } />
		// 		</Switch>
		// 	</Router>
		// );
		const history = getHistory();
		return <Layout history={ history } location={ history.location } match={ match } />;
	}
}

// { getPages().map( page => {
// 	return <Route key={ page.path } path={ page.path } exact component={ Layout } />;
// } ) }

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
