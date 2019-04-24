<?php
/**
 * Premium Reports Proof of Concept.
 *
 * @package  WooCommerce Admin/Classes
 */

defined( 'ABSPATH' ) || exit;

/**
 * Makes requests to the WordPress.com/Jetpack Stats API
 */
class WC_Admin_Reports_Premium {

	/**
	 * Response
	 *
	 * @var object
	 */
	protected static $response;

	/**
	 * Totals
	 *
	 * @var array
	 */
	protected static $totals = array();

	/**
	 * Class instance.
	 *
	 * @var WC_Admin_Reports_Premium instance
	 */
	protected static $instance = null;

	/**
	 * Get class instance.
	 */
	public static function get_instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'woocommerce_rest_report_products_before', array( 'WC_Admin_Reports_Premium', 'make_stats_request' ) );
		add_filter( 'woocommerce_rest_prepare_report_products', array( 'WC_Admin_Reports_Premium', 'inject_stats_response' ), 10, 3 );
	}

	/**
	 * Makes a remote request to the WordPress.com stats API, and stores the data for later injection.
	 *
	 * @param array $args Request args.
	 */
	public static function make_stats_request( $args ) {
		if ( ! function_exists( 'stats_get_from_wpcom_v2_restapi' ) ) {
			return;
		}

		$earlier  = new DateTime( $args['after'] );
		$later    = new DateTime( $args['before'] );
		$quantity = $later->diff( $earlier )->format( '%a' );
		$date     = $later->format( 'Y-m-d' );

		// Make the request.
		$stats = stats_get_from_wpcom_v2_restapi( array(), 'events-by-product?unit=day&quantity=' . $quantity . '&date=' . $date );

		if ( empty( $stats->fields ) || empty( $stats->data ) ) {
			return;
		}

		$totals = array();
		// fields: 0: product_id, 1: product_views, 2: add_to_carts, 3: product_purchases, 4 sales, 5: currency.
		foreach ( $stats->data as $day ) {
			if ( empty( $day->data ) ) {
				continue;
			}

			foreach ( $day->data as $data ) {
				if ( empty( $totals[ $data[0] ] ) ) {
					$totals[ $data[0] ] = array(
						'product_views' => $data[1],
						'add_to_carts'  => $data[2],
					);

					continue;
				}
				$totals[ $data[0] ]['product_views'] += $data[1];
				$totals[ $data[0] ]['add_to_carts']  += $data[2];
			}
		}

		self::$response = $stats;
		self::$totals   = $totals;
	}

	/**
	 * Adds the correct product totals for product views and add to cart events to the products report response.
	 *
	 * @param WP_REST_Response $response The response object.
	 * @param object           $report   The original report object.
	 * @param WP_REST_Request  $request  Request used to generate the response.
	 *
	 * @return WP_REST_Response The injected response object.
	 */
	public static function inject_stats_response( $response, $report, $request ) {
		$product_id                      = $response->data['product_id'];
		$response->data['product_views'] = ! empty( self::$totals[ $product_id ]['product_views'] ) ? self::$totals[ $product_id ]['product_views'] : 0;
		$response->data['add_to_carts']  = ! empty( self::$totals[ $product_id ]['add_to_carts'] ) ? self::$totals[ $product_id ]['add_to_carts'] : 0;
		return $response;
	}
}

new WC_Admin_Reports_Premium();
