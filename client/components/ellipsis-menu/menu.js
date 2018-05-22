/** @format */
/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import classnames from 'classnames';
import { IconButton, Dropdown, NavigableMenu } from '@wordpress/components';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import './style.scss';

/**
 * This is a dropdown menu hidden behind a vertical ellipsis icon. When clicked, the inner MenuItems are displayed.
 */
class EllipsisMenu extends Component {
	render() {
		const { children, label } = this.props;
		if ( ! children ) {
			return null;
		}

		const renderToggle = ( { onToggle, isOpen } ) => {
			const toggleClassname = classnames( 'woo-dash__ellipsis-menu-toggle', {
				'is-opened': isOpen,
			} );

			return (
				<IconButton
					className={ toggleClassname }
					onClick={ onToggle }
					icon="ellipsis"
					label={ label }
					aria-expanded={ isOpen }
				/>
			);
		};

		const renderContent = () => (
			<NavigableMenu className="woo-dash__ellipsis-menu-content">{ children }</NavigableMenu>
		);

		return (
			<div className="woo-dash__ellipsis-menu">
				<Dropdown
					contentClassName="woo-dash__ellipsis-menu-popover"
					position="bottom left"
					renderToggle={ renderToggle }
					renderContent={ renderContent }
				/>
			</div>
		);
	}
}

EllipsisMenu.propTypes = {
	/** The label shown when hovering/focusing on the icon button. */
	label: PropTypes.string.isRequired,
	/** `children`: A list of MenuTitle/MenuItem components. */
	children: PropTypes.node,
};

export default EllipsisMenu;
