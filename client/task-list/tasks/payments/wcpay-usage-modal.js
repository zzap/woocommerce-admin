/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { getQuery, updateQueryString } from '@woocommerce/navigation';
import interpolateComponents from 'interpolate-components';
import { Button, Modal } from '@wordpress/components';
import { Link } from '@woocommerce/components';
import { OPTIONS_STORE_NAME } from '@woocommerce/data';

class WCPayUsageModal extends Component {
	constructor( props ) {
		super( props );
		const query = getQuery();
		this.state = {
			isOpen:
				! props.allowTracking &&
				query[ 'wcpay-connection-success' ] === '1',
			isLoadingScripts: false,
			isRequestStarted: false,
		};
	}

	async componentDidUpdate( prevProps, prevState ) {
		const { hasErrors, isRequesting, createNotice } = this.props;
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
			this.closeModal();
			this.setState( { isRequestStarted: false } );
		}

		if ( isRequestError ) {
			createNotice(
				'error',
				__(
					'There was a problem updating your preferences.',
					'woocommerce-admin'
				)
			);
			this.closeModal();
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

		this.setState( { isRequestStarted: true } );
		updateOptions( { woocommerce_allow_tracking: 'yes' } );
	}

	closeModal() {
		this.setState( { isOpen: false, isRequestStarted: false } );
		updateQueryString( { 'wcpay-connection-success': undefined } );
	}

	render() {
		const { isOpen, isRequestStarted } = this.state;
		const { isRequesting } = this.props;

		if ( ! isOpen ) {
			return null;
		}

		const isBusy = isRequestStarted && isRequesting;
		const title = __( 'Build a better WooCommerce', 'woocommerce-admin' );
		const trackingMessage = interpolateComponents( {
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

		return (
			<Modal
				title={ title }
				isDismissible={ false }
				onRequestClose={ () => this.closeModal() }
				className="woocommerce-profile-wizard__usage-modal"
			>
				<div className="woocommerce-profile-wizard__usage-wrapper">
					<div className="woocommerce-profile-wizard__usage-modal-message">
						{ trackingMessage }
					</div>
					<div className="components-guide__footer">
						<Button
							isBusy={ isBusy }
							onClick={ () => this.closeModal() }
						>
							{ __( 'No thanks', 'woocommerce-admin' ) }
						</Button>

						<Button
							isPrimary
							isBusy={ isBusy }
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
)( WCPayUsageModal );
