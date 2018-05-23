#!/usr/bin/env node
const path = require( 'path' );
const fs = require( 'fs' );
const glob = require( 'glob' );
const reactDocs = require( 'react-docgen' );
const ReactDocGenMarkdownRenderer = require( 'react-docgen-markdown-renderer' );
const _ = require( 'lodash' );

const componentsGlob = path.resolve( __dirname, '../client/components/**/*.js' );
const options = {
	ignore: [ '**/test/**/*.js', '**/higher-order/**/*.js' ],
};

const renderer = new ReactDocGenMarkdownRenderer( {
	componentsBasePath: path.dirname( __dirname ),
} );

glob( componentsGlob, options, ( err, files ) => {
	if ( err ) {
		console.warn( err );
		return;
	}
	files.forEach( filePath => {
		fs.readFile( filePath, _.partial( parseDocs, filePath ) );
	} );
} );

function parseDocs( filePath, error, content ) {
	if ( error ) {
		console.warn( error );
		return;
	}
	const docsPath = path.dirname( filePath ) + '/README.md';
	if ( fs.existsSync( docsPath ) ) {
		// Don't overwrite existing readme
		return;
	}
	try {
		const componentInfo = reactDocs.parse( content );
		console.log( componentInfo );
		fs.writeFile( docsPath, renderer.render( filePath, componentInfo, [] ), ( writeError ) => {
			if ( writeError ) {
				console.log( `Error writing ${ docsPath }: `, writeError );
			}
		} );
	} catch ( parseErr ) {
		console.log( parseErr );
	}
}
