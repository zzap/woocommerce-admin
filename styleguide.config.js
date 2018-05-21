/** @format */
const path = require( 'path' );
const merge = require( 'webpack-merge' );

const gutenbergEntries = [
	'blocks',
	'components',
	'editor',
	'utils',
	'data',
	'viewport',
	'core-data',
	'plugins',
	'edit-post',
	'core-blocks',
];

const gutenbergPackages = [
	'date',
	'dom',
	'element',
];

const wordPressPackages = [
	'a11y',
	'dom-ready',
	'hooks',
	'i18n',
	'is-shallow-equal',
];

module.exports = {
	styleguideDir: 'dist/styleguide',
	components: 'client/components/**/*.{js,jsx}',
	sections: [
		{
			name: 'UI Components',
			components: 'client/components/**/*.{js,jsx}',
		},
		{
			name: 'Higher Order Components',
			content: 'client/components/higher-order/README.md',
		},
	],
	ignore: [
		'**/client/components/higher-order/**/*.{js,jsx}',
		'**/test/**',
		'**/*.test.{js,jsx}',
		'**/*.spec.{js,jsx}',
	],
	require: [
		// Set up the wp.* globals
		path.join( __dirname, 'client/styleguide/setup-globals.js' ),
	],
	dangerouslyUpdateWebpackConfig( webpackConfig ) {
		webpackConfig = merge.smart( webpackConfig, {
			externals: {
				'@wordpress/api-request': {
					this: [ 'wp', 'apiRequest' ],
				},
			},
			module: {
				rules: [
					{
						loader: 'babel-loader',
						test: /\.jsx?$/,
						exclude: /node_modules\/gutenberg\/node_modules/,
						include: [ /client/, /node_modules\/gutenberg/ ],
					},
					{
						test: /\.scss$/,
						include: /node_modules\/gutenberg/,
						loader: 'ignore-loader',
					},
				],
			},
			resolve: {
				alias: Object.assign(
					gutenbergEntries.reduce( ( memo, name ) => {
						memo[ `@wordpress/${ name }` ] = path.resolve( __dirname, `./node_modules/gutenberg/${ name }` );
						return memo;
					}, {} ),
					gutenbergPackages.reduce( ( memo, name ) => {
						memo[ `@wordpress/${ name }` ] = path.resolve( __dirname, `./node_modules/gutenberg/packages/${ name }` );
						return memo;
					}, {} ),
					wordPressPackages.reduce( ( memo, name ) => {
						memo[ `@wordpress/${ name }` ] = path.resolve(
							__dirname,
							`./node_modules/gutenberg/node_modules/@wordpress/${ name }`
						);
						return memo;
					}, {} )
				),
			},
		} );
		return webpackConfig;
	},
};
