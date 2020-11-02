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

class UsageModal extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			isLoadingScripts: false,
			isRequestStarted: false,
		};
	}

	async componentDidUpdate( prevProps, prevState ) {
		const {
			hasErrors,
			isRequesting,
			onClose,
			onContinue,
			createNotice,
		} = this.props;
		const { isLoadingScripts, isRequestStarted } = this.state;

		// We can't rely on isRequesting props only because option update might be triggered by other component.
		if ( ! isRequestStarted ) {
			return;
		}

		const isRequestSuccessful =
			! isRequesting &&
			! isLoadingScripts &&
			( prevProps.isRequesting || prevState.isLoadingScripts ) &&
			! hasErrors;
		const isRequestError =
			! isRequesting && prevProps.isRequesting && hasErrors;

		if ( isRequestSuccessful ) {
			onClose();
			onContinue();
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

	updateTracking( { allowTracking } ) {
		const { updateOptions } = this.props;

		if ( allowTracking && typeof window.wcTracks.enable === 'function' ) {
			this.setState( { isLoadingScripts: true } );
			window.wcTracks.enable( () => {
				this.setState( { isLoadingScripts: false } );
			} );
		} else if ( ! allowTracking ) {
			window.wcTracks.isEnabled = false;
		}

		const trackingValue = allowTracking ? 'yes' : 'no';
		this.setState( { isRequestStarted: true } );
		updateOptions( {
			woocommerce_allow_tracking: trackingValue,
		} );
	}

	render() {
		// Bail if site has already opted in to tracking
		if ( this.props.allowTracking ) {
			const { onClose, onContinue } = this.props;
			onClose();
			onContinue();
			return null;
		}

		const { isRequesting } = this.props;
		const { isRequestStarted } = this.state;
		const isBusy = isRequestStarted && isRequesting;

		const title =
			this.props.title ||
			__( 'Build a better WooCommerce', 'woocommerce-admin' );
		const trackingMessage =
			this.props.message ||
			interpolateComponents( {
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

		const dismissActionText =
			this.props.dismissActionText ||
			__( 'No thanks', 'woocommerce-admin' );
		const acceptActionText =
			this.props.acceptActionText ||
			__( 'Yes, count me in!', 'woocommerce-admin' );

		return (
			<Modal
				title={ title }
				onRequestClose={ () => this.props.onClose() }
				className="woocommerce-profile-wizard__usage-modal"
			>
				<div className="woocommerce-profile-wizard__usage-wrapper">
					<div className="woocommerce-profile-wizard__usage-modal-message">
						{ trackingMessage }
					</div>
					<div className="woocommerce-profile-wizard__usage-modal-actions">
						<Button
							isTertiary
							isBusy={ isBusy }
							onClick={ () =>
								this.updateTracking( { allowTracking: false } )
							}
						>
							{ dismissActionText }
						</Button>
						<Button
							isPrimary
							isBusy={ isBusy }
							onClick={ () =>
								this.updateTracking( { allowTracking: true } )
							}
						>
							{ acceptActionText }
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
