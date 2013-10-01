// Copyright 2002-2013, University of Colorado Boulder

/**
 * String plugin, loads a string using a syntax like:
 * var title = require( 'string!JOHN_TRAVOLTAGE/johnTravoltage.name' );
 *
 * The reasons we need our own string plugin:
 * So we can only include the (possibly) strings that are needed for a sim
 * So we can enumerate all of the used strings, for purposed of a translation utility
 * For uniformity with image and audio plugin
 *
 * TODO: exclude the plugin itself from build file.  RequireJS docs said there is an easy way to do so
 * TODO: Currently hard coded to use john-travoltage & english.  Provide support for any project and any language.
 * @author Sam Reid
 */
define( function() {

  //Keep track of the images that are used during dependency resolution so they can be created at build time
  var buildMap = {};

  return {
    load: function( name, parentRequire, onload, config ) {

      var url = parentRequire.toUrl( name );
      console.log( 'found url: ' + url );
      var question = url.lastIndexOf( '?' );
      var key = question < 0 ? url.substring( url.lastIndexOf( '/' ) + 1 ) : url.substring( url.lastIndexOf( '/' ) + 1, question );

      var project = name.substring( 0, name.indexOf( '/' ) );

      if ( config.isBuild ) {
        buildMap[name] = url;
        onload( null );
      }
      else {
        //Load it through the module system
        parentRequire( [project + '/../nls/john-travoltage-strings_en'], function( stringFile ) {
          console.log( 'loaded through module system: ' + stringFile );
          onload( stringFile[key] );
        } );
      }
    },

    //write method based on RequireJS official text plugin by James Burke
    //https://github.com/jrburke/requirejs/blob/master/text.js
    write: function( pluginName, moduleName, write ) {
      if ( moduleName in buildMap ) {
        var filename = buildMap[moduleName];
        var file = filename.substring( 0, filename.lastIndexOf( '/' ) ) + '/../nls/john-travoltage-strings_en.js';

        //Load the string file, and evaluate with eval().  TODO: should these be JSON?
        //TODO: This may be inefficient at build time, since the same file may be loaded many times (one per string at worst)
        //TODO: We could cache those file loads

        //Load the file from the file system
        //TODO: What if it is UTF-16 or something?
        var loadedFile = fs.readFileSync( file, 'utf8' );

        //TODO: if the file doesn't use define({}), this will not work
        loadedFile = loadedFile.substring( loadedFile.indexOf( 'define' ) + 'define'.length );
        var evaled = eval( loadedFile );
        var key = moduleName.substring( moduleName.lastIndexOf( '/' ) + 1 );
        var value = evaled[key];

        console.log( 'pluginName: ' + pluginName );
        console.log( 'moduleName: ' + moduleName );
        console.log( 'found filename: ' + filename );
        console.log( 'file', file );
        console.log( 'loaded file', loadedFile );
        console.log( 'evaled', evaled );

        console.log( key );
        console.log( value );

        //Write code that will load the image and register with a global `phetImages` to make sure everything loaded, see SimLauncher.js
        write( 'define("' + pluginName + '!' + moduleName + '", function(){ return "' + value + '";});\n' );
      }
    }
  };
} );