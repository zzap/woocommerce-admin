/** @format */
const fs = require( 'fs' );
const path = require( 'path' );
const merge = require( 'webpack-merge' );

function getStyleguidePath( ...paths ) {
	return fs.realpathSync( path.join( __dirname, 'client/styleguide/', ...paths ) );
}

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
	sections: [
		{
			name: 'UI Components',
			components: 'client/components/**/*.{js,jsx}',
			ignore: [
				'**/client/components/header/index.js',
				'**/client/components/ellipsis-menu/index.js',
			],
		},
		{
			name: 'Higher Order Components',
			content: 'client/components/higher-order/README.md',
		},
		{
			name: 'Layout Components',
			components: 'client/layout/**/*.{js,jsx}',
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
		getStyleguidePath( 'setup-globals.js' ),
	],
	template: {
		head: {
			// Add gutenberg CSS
			links: [
				{
					rel: 'stylesheet',
					href: 'client/styleguide/components.css',
				},
				{
					rel: 'stylesheet',
					href: 'client/styleguide/core-blocks.css',
				},
				{
					rel: 'stylesheet',
					href: 'client/styleguide/edit-post.css',
				},
				{
					rel: 'stylesheet',
					href: 'client/styleguide/editor.css',
				},
			],
		},
	},
	getExampleFilename( componentPath ) {
		return path.dirname( componentPath ) + '/Example.md';
	},
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
					{
						test: /\.css$/,
						loader: 'css-loader',
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
