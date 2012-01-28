/** @license
 * DOMTON : DOM Templating using jsON
 * version 0.2 - require plugin
 *
 * Copyright (c) 2012 Nicolas Joyard
 * Released under the MIT license.
 *
 * Author: Nicolas Joyard <joyard.nicolas@gmail.com>
 *
 * Code shamelessly inspired from Alex Sexton's hbs plugin
 * Only works in a browser environment for now
 */

/*jslint white: true, browser: true, plusplus: true */
/*global define, require, ActiveXObject */

define('dtn', ['domton'], function ( domton ) {
	"use strict";

	var fs, getXhr,
		progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
		fetchText,
		buildMap = [];

	getXhr = function () {
		//Would love to dump the ActiveX crap in here. Need IE 6 to die first.
		var xhr, i, progId;
		if (typeof XMLHttpRequest !== "undefined") {
			return new XMLHttpRequest();
		} else {
			for (i = 0; i < 3; i++) {
				progId = progIds[i];
				try {
					xhr = new ActiveXObject(progId);
				} catch (e) {}

				if (xhr) {
					progIds = [progId];  // so faster next time
					break;
				}
			}
		}

		if (!xhr) {
			throw new Error("getXhr(): XMLHttpRequest not available");
		}

		return xhr;
	};

	fetchText = function (url, callback) {
		var xhr = getXhr();
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function (evt) {
			//Do not explicitly handle errors, those should be
			//visible via console output in the browser.
			if (xhr.readyState === 4) {
				callback(xhr.responseText);
			}
		};
		xhr.send(null);
	};


	return {
		get: function () {
			return domton;
		},

		write: function (pluginName, name, write) {
			if (buildMap.hasOwnProperty(name)) {
				var text = buildMap[name];
				write(text);
			}
		},

		version: '0.2',

		load: function (name, parentRequire, load, config) {
			var path = parentRequire.toUrl(name + '.domton');
			
			fetchText(path, function (text) {
				var i;
				
				text = "/* START_TEMPLATE */\n" + 
					   "define('dtn!" + name + "',['dtn','domton'], function( dtn, domton ){ \n" +
					   "	var template = " + text + ";\n" +
					   "	return domton(template);\n" +
					   "});\n" +
					   "/* END_TEMPLATE */\n";

				//Hold on to the transformed text if a build.
				if (config.isBuild) {
					buildMap[name] = text;
				}

				//IE with conditional comments on cannot handle the
				//sourceURL trick, so skip it if enabled.
				/*@if (@_jscript) @else @*/
				if (!config.isBuild) {
					text += "\r\n//@ sourceURL=" + path;
				}
				/*@end@*/
				
				load.fromText(name, text);

				//Give result to load. Need to wait until the module
				//is fully parse, which will happen after this
				//execution.
				parentRequire([name], function (value) {
					load(value);
				});
			});
		}
	};
});
