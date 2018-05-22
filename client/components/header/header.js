/** @format */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { isArray, noop } from 'lodash';
import { IconButton } from '@wordpress/components';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import './style.scss';

/**
 * A basic component for the app header. The header outputs breadcrumbs via the `sections` prop (required)
 * and a toggle button to show the timeline sidebar (hidden via CSS if no applicable to the page).
 *
 * Note: `onToggle` & `isSidebarOpen` are passed through the `Slot` call, and aren't required when using `<Header />` in section components.
 */
class Header extends Component {
	render() {
		const { sections, onToggle, isSidebarOpen } = this.props;
		const _sections = isArray( sections ) ? sections : [ sections ];

		return (
			<div className="woo-dash__header">
				<h1>
					<span>
						<Link to="/">WooCommerce</Link>
					</span>
					{ _sections.map( ( subSection, i ) => <span key={ i }>{ subSection }</span> ) }
				</h1>
				<div className="woo-dash__header-toggle">
					<IconButton
						className="woo-dash__header-button"
						onClick={ onToggle }
						icon="clock"
						label={ __( 'Show Sidebar', 'woo-dash' ) }
						aria-expanded={ isSidebarOpen }
					/>
				</div>
			</div>
		);
	}
}

Header.propTypes = {
	/** Used to generate breadcrumbs. Accepts a single node/elemnt or an array of nodes. */
	sections: PropTypes.node.isRequired,
	/** The toggle callback when "open sidebar" button is clicked. */
	onToggle: PropTypes.func.isRequired,
	/** Boolean describing whether the sidebar is toggled visible. */
	isSidebarOpen: PropTypes.bool,
};

Header.defaultProps = {
	onToggle: noop,
};

export default Header;
