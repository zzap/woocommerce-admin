/**
 * External dependencies
 */
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { OPTIONS_STORE_NAME } from '@woocommerce/data';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import CustomerEffortScoreTracks from './customer-effort-score-tracks';

/**
 * Maps the queue of CES tracks surveys to CustomerEffortScoreTracks
 * components. Note that generally there will only be a single survey per page
 * however this is designed to be flexible if multiple surveys per page are
 * added in the future.
 *
 * @param {Object}   props                      Component props.
 * @param {Array}    props.queue                The queue of surveys.
 * @param {boolean}  props.resolving            Whether the queue is resolving.
 * @param {Function} props.clearQueueFromOption Sets up clearing of the queue on the next page load.
 */
function CustomerEffortScoreTracksContainer( {
	queue,
	resolving,
	clearQueueFromOption,
} ) {
	if ( resolving ) {
		return null;
	}

	if ( queue.length ) {
		clearQueueFromOption();
	}

	return (
		<>
			{ queue.map( ( item, index ) => (
				<CustomerEffortScoreTracks
					key={ index }
					initiallyVisible={ true }
					trackName={ item.track_name }
					label={ item.label }
					trackProps={ item.props || {} }
				/>
			) ) }
		</>
	);
}

CustomerEffortScoreTracksContainer.propTypes = {
	/**
	 * The queue of CES tracks surveys to display.
	 */
	queue: PropTypes.arrayOf( PropTypes.object ),
	/**
	 * If the queue option is being resolved.
	 */
	resolving: PropTypes.bool,
	/**
	 * Set up clearing the queue on the next page load.
	 */
	clearQueueFromOption: PropTypes.func,
};

export default compose(
	withSelect( ( select ) => {
		const { getOption, isResolving } = select( OPTIONS_STORE_NAME );
		const queue = getOption( 'woocommerce_ces_tracks_queue' ) || [];
		const resolving = isResolving( 'getOption', [
			'woocommerce_ces_tracks_queue',
		] );

		return { queue, resolving };
	} ),
	withDispatch( ( dispatch ) => {
		const { updateOptions } = dispatch( OPTIONS_STORE_NAME );

		return {
			clearQueueFromOption: () => {
				// This sets an option that should be used on the next page
				// load to clear the CES tracks queue (see
				// CustomerEffortScoreTracks.php) - clearing the queue
				// directly puts this into an infinite loop which is picked
				// up by React.
				updateOptions( {
					woocommerce_clear_ces_tracks_queue: true,
				} );
			},
		};
	} )
)( CustomerEffortScoreTracksContainer );
