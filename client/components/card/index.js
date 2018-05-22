/** @format */
/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import classnames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import './style.scss';
import { EllipsisMenu } from '../ellipsis-menu';

/**
 * A basic card component with a header. The header can contain a title (required), an action (optional),
 * and an `EllipsisMenu` menu (optional).
*/
class Card extends Component {
	render() {
		const { action, children, menu, title } = this.props;
		const className = classnames( 'woo-dash__card', this.props.className, {
			'has-menu': !! menu,
			'has-action': !! action,
		} );
		return (
			<div className={ className }>
				<div className="woo-dash__card-header">
					<h2 className="woo-dash__card-title">{ title }</h2>
					{ action && <div className="woo-dash__card-action">{ action }</div> }
					{ menu && <div className="woo-dash__card-menu">{ menu }</div> }
				</div>
				<div className="woo-dash__card-body">{ children }</div>
			</div>
		);
	}
}

Card.propTypes = {
	/** One "primary" action for this card, appears in the card header */
	action: PropTypes.node,
	/** Extra classes to add to the card container. */
	className: PropTypes.string,
	/** An EllipsisMenu, with filters used to control the content visible in this card */
	menu: PropTypes.shape( {
		type: EllipsisMenu,
	} ),
	/** The title to use for this card. */
	title: PropTypes.string.isRequired,
};

export default Card;
