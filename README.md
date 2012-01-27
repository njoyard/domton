# [DOMTON](http://github.com/k-o-x/domton) - DOM Templating using jsON

## Introduction

DOMTON is a library using JSON to template DOM node trees. Templates are rendered using a context object which properties are used to build the DOM node tree and fill node attributes.

## Template grammar

A DOMTON template can be one of the following :

* Element node
* Text node
* Control structure (with sub-templates)
* Array of templates

### Element nodes

Element nodes are represented using an object with a `tag` property, which value is used as the tagName attribute for the node. The special property `children` is a DOMTON template used to specify the child node list of this node. All other non-reserved properties (see below) are used as attribute values for the element node.

Examples:

> `{ "tag": "span", "className": "error", "innerHTML": "Hi Dave" }`

> `{ "tag": "div", "children": { "tag": "span", "innerHTML": "Hello World" } }`

### Text nodes

Text nodes are represented using an object with a single `text` property, which value is used as the text content for the node. All other properties of text nodes are ignored.

Example:

> `{ "text": "Hello" }`

### Control structures

Control structures are used to create node (sub-)trees depending on the value or existence of context properties.

#### if

This control structure allows rendering a sub-tree depending on the presence or value of a specific context property. The sub-tree represented by the `template` is not rendered if the property is undefined or falsy.

Example:

> `{ "if": "some.property", "template": { "text": "Some property is present" } }`

#### with

This control structure allows rendering a sub-tree with a narrowed down context.

Example:

> `{ "with": "staff.manager", "template": { "text": "{name}" } }`

#### each

This control structure allows iterating a sub-tree over a context array.

Example:

> `{ "each": "employees", "template": [ { "tag": "span", "innerHTML": "{name}" }, { "text": "{salary} $" } ] }`

#### neutral

You can also use an object containing only a `template` property without any control structure property. It is only useful to wrap template arrays to form a JSON compliant string :

> `{ "template": [...] }`

### Reserved properties

The following is a list of reserved property names in DOMTON. Please note that some of these may not be used yet.

> `children each else if tag template text then unless with`

## Context references and string interpolation

When referring to context variables, notably when using control structures, DOMTON expects period-separated chains of property names, eg. `obj.prop.val`. String values used in templates can also include context variable names enclosed in braces. For example `"foo {prop} {obj.val}"` with context `{ prop: "bar", obj: { val: "baz"} }` will be interpolated to `"foo bar baz"`.

## Limitations

Accessing sub-properties of undefined context properties is allowed by DOMTON. `one.two` will simply be considered undefined if `one` is not in the current context.

For now, you cannot use property dereferencing, ie. context interpolation in control structures (for example, `{ "each": "{eachPropName}" ... }` will not work as you may expect). Interpolation will also not be performed for `tag` values.

## License

DOMTON is distributed under the MIT license. See the file [`LICENSE`](http://github.com/k-o-x/domton) for more information.

Copyright (c) 2012 Nicolas Joyard
