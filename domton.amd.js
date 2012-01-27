/** @license
 * DOMTON : DOM Templating using jsON
 * version 0.1 - AMD version
 *
 * Copyright (c) 2012 Nicolas Joyard
 * Released under the MIT license.
 *
 * Author: Nicolas Joyard <joyard.nicolas@gmail.com>
 */

/*jslint white: true, browser: true, plusplus: true */
/*global define, require */

define(function() {
	"use strict";
	
	var reserved, getprop, interp, render,
		tidyNodes, appendChildren,
		interpRE;


	/* Reserved keys, not to be confused with node attributes */
	reserved = ['tag', 'text', 'children', 'template', 'each', 'if', 'with'];
	
	
	/* Interpolation regexp */
	interpRE = new RegExp('\\{([^}]*)}', 'g');


	/**
	 * Get property from context given property-accessor string
	 * @context: context object to search in
	 * @propstring: period-separated property chain (eg. "key.subkey.subsubkey")
	 *
	 * Return undefined if property not found.
	 */
	getprop = function(context, propstring) {
		var chain = propstring.split('.'),
			current = context,
			i, len;

		for (i = 0, len = chain.length; i < len; i++) {
			if (current.hasOwnProperty(chain[i])) {
				current = current[chain[i]];
			} else {
				return undefined;
			}
		}
	
		return current;
	};


	/**
	 * Interpolate string in context
	 * @context: context object to interpolate in
	 * @string: string to interpolate ; may contain context property accessors,
	 *			eg. "foo{bar.baz}" will be replaced by "foo" + context.bar.baz
	 */
	interp = function(context, string) {
		return string.replace(interpRE, function(m, p1) { return getprop(context, p1); });
	};
	
	
	/**
	 * Tidy up node list, removing undefined elements
	 * @nodes: node list to tidy up
	 *
	 * Return @nodes if it is not an array.
	 */
	tidyNodes = function(nodes) {
		if (Array.isArray(nodes)) {
			return nodes.filter(function(n) { return !!n; });
		} else {
			return nodes;
		}
	};
	
	
	/**
	 * Append child or children to parent node
	 * @parent: node to append children to
	 * @children: child or children array to append (may be undefined or null).
	 */
	appendChildren = function(parent, children) {
		if (Array.isArray(children)) {
			children.forEach(function(c) {
				parent.appendChild(c);
			});
		} else if (!!children) {
			parent.appendChild(children);
		}
	};


	/**
	 * Render JSON template in context
	 */
	render = function(context, json) {
		var ctxRender = render.bind(null, context),
			ctxInterp = interp.bind(null, context),
			ctxGetProp = getprop.bind(null, context),
			node, array, ctx;
	
		if (Array.isArray(json)) {
			return tidyNodes(json.map(ctxRender));
		}
	
		if (json.hasOwnProperty('template')) {
			if (json.hasOwnProperty('if')) {
				if (ctxGetProp(json['if'])) {
					return ctxRender(json.template);
				} else {
					return undefined;
				}
			} else if (json.hasOwnProperty('each')) {
				array = ctxGetProp(json.each);
				if (!Array.isArray(array)) {
					throw new Error("'each' target is not an array");
				}

				return tidyNodes(array.map(function(subContext) {
					return render(subContext, json.template);
				}));
			} else if (json.hasOwnProperty('with')) {
				ctx = ctxGetProp(json['with']);
				if (typeof ctx === 'undefined') {
					throw new Error("'with' target not found");
				}
				
				return render(ctx, json.template);
			} else {
				return ctxRender(json.template);
			}
		}
		
		if (json.hasOwnProperty('if') || json.hasOwnProperty('each') || json.hasOwnProperty('with')) {
			throw new Error("Missing 'template' key for control structure");
		}
	
		if (json.hasOwnProperty('text')) {
			return document.createTextNode(ctxInterp(json.text));
		}
	
		if (json.hasOwnProperty('tag')) {
			node = document.createElement(json.tag);
		
			Object.keys(json).forEach(function(key) {
				if (reserved.indexOf(key) === -1) {
					node[key] = ctxInterp(json[key]);
				}
			});
		
			if (json.hasOwnProperty('children')) {
				appendChildren(node, ctxRender(json.children));
			}
		
			return node;
		}
	
		throw new Error("Invalid template JSON");
	};
	
	
	/* Public interface */
	return function(template) {
		return function(context) {
			return render(context, template);
		};
	};
});
