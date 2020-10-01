/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import interpolateComponents from 'interpolate-components';
import { Button, Modal } from '@wordpress/components';
import { Link } from '@woocommerce/components';
import { OPTIONS_STORE_NAME } from '@woocommerce/data';

const DEFAULT_TITLE = __( 'Build a better WooCommerce', 'woocommerce-admin' );

const DEFAULT_TRACKING_MESSAGE = interpolateComponents( {
	mixedString: __(
		'Get improved features and faster fixes by sharing non-sensitive data via {{link}}usage tracking{{/link}} ' +
			'that shows us how WooCommerce is used. No personal data is tracked or stored.',
		'woocommerce-admin'
	),
	components: {
		link: (
			<Link
				href="https://woocommerce.com/usage-tracking"
				target="_blank"
				type="external"
			/>
		),
	},
} );

class UsageModal extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			isLoadingScripts: false,
		};
	}

	async componentDidUpdate( prevProps, prevState ) {
		const { hasErrors, isRequesting, onClose, createNotice } = this.props;
		const { isLoadingScripts } = this.state;
		const isRequestSuccessful =
			! isRequesting &&
			! isLoadingScripts &&
			( prevProps.isRequesting || prevState.isLoadingScripts ) &&
			! hasErrors;
		const isRequestError =
			! isRequesting && prevProps.isRequesting && hasErrors;

		if ( isRequestSuccessful ) {
			onClose();
		}

		if ( isRequestError ) {
			createNotice(
				'error',
				__(
					'There was a problem updating your preferences.',
					'woocommerce-admin'
				)
			);
			onClose();
		}
	}

	enableTracking() {
		const { updateOptions } = this.props;

		if ( typeof window.wcTracks.enable === 'function' ) {
			this.setState( { isLoadingScripts: true } );
			window.wcTracks.enable( () => {
				this.setState( { isLoadingScripts: false } );
			} );
		}

		updateOptions( { woocommerce_allow_tracking: 'yes' } );
	}

	render() {
		// Bail if site has already opted in to tracking
		if ( this.props.allowTracking ) {
			const { onClose } = this.props;
			onClose();
			return null;
		}

		const {
			isRequesting,
			title = DEFAULT_TITLE,
			trackingMessage = DEFAULT_TRACKING_MESSAGE,
		} = this.props;

		return (
			<Modal
				title={ title }
				isDismissible={ false }
				onRequestClose={ () => this.props.onClose() }
				className="woocommerce-profile-wizard__usage-modal"
			>
				<div className="woocommerce-profile-wizard__usage-wrapper">
					<div className="woocommerce-profile-wizard__usage-modal-message">
						{ trackingMessage }
					</div>
					<div className="components-guide__footer">
						<Button
							isBusy={ isRequesting }
							onClick={ () => this.props.onClose() }
						>
							{ __( 'No thanks', 'woocommerce-admin' ) }
						</Button>

						<Button
							isPrimary
							isBusy={ isRequesting }
							onClick={ () => this.enableTracking() }
						>
							{ __( 'I agree', 'woocommerce-admin' ) }
						</Button>
					</div>
				</div>
			</Modal>
		);
	}
}

export default compose(
	withSelect( ( select ) => {
		const {
			getOption,
			getOptionsUpdatingError,
			isOptionsUpdating,
		} = select( OPTIONS_STORE_NAME );

		const allowTracking =
			getOption( 'woocommerce_allow_tracking' ) === 'yes';
		const isRequesting = Boolean( isOptionsUpdating() );
		const hasErrors = Boolean( getOptionsUpdatingError() );

		return {
			allowTracking,
			isRequesting,
			hasErrors,
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { createNotice } = dispatch( 'core/notices' );
		const { updateOptions } = dispatch( OPTIONS_STORE_NAME );

		return {
			createNotice,
			updateOptions,
		};
	} )
)( UsageModal );
