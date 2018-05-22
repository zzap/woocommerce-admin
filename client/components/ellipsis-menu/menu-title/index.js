/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * This component is another valid Menu child but this does not have any accessibility attributes
 * associated (so this should not be used in place of the `EllipsisMenu` prop `label`).
 *
 * @return {Object} React component
 */
const MenuTitle = ( { children } ) => {
	return <div className="woo-dash__ellipsis-menu-title">{ children }</div>;
};

MenuTitle.propTypes = {
	/** A renderable component (or string) which will be displayed as the content of this item. */
	children: PropTypes.node,
};

export default MenuTitle;
