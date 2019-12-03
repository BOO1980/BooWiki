var CLOSURE_NO_DEPS = true;
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 *
 */


/**
 * @define {boolean} Overridden to true by the compiler when --closure_pass
 *     or --mark_as_compiled is specified.
 */
var COMPILED = false;


/**
 * Base namespace for the Closure library.  Checks to see goog is
 * already defined in the current scope before assigning to prevent
 * clobbering if base.js is loaded more than once.
 *
 * @const
 */
var goog = goog || {}; // Identifies this file as the Closure base.


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
 * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
 * because they are generally used for debugging purposes and it is difficult
 * for the JSCompiler to statically determine whether they are used.
 */
goog.DEBUG = true;


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.LOCALE = 'en';  // default to en


/**
 * Creates object stubs for a namespace.  The presence of one or more
 * goog.provide() calls indicate that the file defines the given
 * objects/namespaces.  Build tools also scan for provide/require statements
 * to discern dependencies, build dependency files (see deps.js), etc.
 * @see goog.require
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 */
goog.provide = function(name) {
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice. This is intended
    // to teach new developers that 'goog.provide' is effectively a variable
    // declaration. And when JSCompiler transforms goog.provide into a real
    // variable declaration, the compiled JS should work the same as the raw
    // JS--even when the raw JS uses goog.provide incorrectly.
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name);
};


/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (COMPILED && !goog.DEBUG) {
    opt_message = opt_message || '';
    throw Error('Importing test-only code into non-debug environment' +
                opt_message ? ': ' + opt_message : '.');
  }
};


if (!COMPILED) {

  /**
   * Check if the given name has been goog.provided. This will return false for
   * names that are available only as implicit namespaces.
   * @param {string} name name of the object to look for.
   * @return {boolean} Whether the name has been provided.
   * @private
   */
  goog.isProvided_ = function(name) {
    return !goog.implicitNamespaces_[name] && !!goog.getObjectByName(name);
  };

  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares
   * that 'goog' and 'goog.events' must be namespaces.
   *
   * @type {Object}
   * @private
   */
  goog.implicitNamespaces_ = {};
}


/**
 * Builds an object structure for the provided namespace path,
 * ensuring that names that already exist are not overwritten. For
 * example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Returns an object based on its fully qualified external name.  If you are
 * using a compilation pass that renames property names beware that using this
 * function will not find renamed properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  for (var part; part = parts.shift(); ) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {Object} obj The namespace to globalize.
 * @param {Object=} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {Array} provides An array of strings with the names of the objects
 *                         this file provides.
 * @param {Array} requires An array of strings with the names of the objects
 *                         this file requires.
 */
goog.addDependency = function(relPath, provides, requires) {
  if (!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    for (var i = 0; provide = provides[i]; i++) {
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};




// NOTE(user): The debug DOM loader was included in base.js as an orignal
// way to do "debug-mode" development.  The dependency system can sometimes
// be confusing, as can the debug DOM loader's asyncronous nature.
//
// With the DOM loader, a call to goog.require() is not blocking -- the
// script will not load until some point after the current script.  If a
// namespace is needed at runtime, it needs to be defined in a previous
// script, or loaded via require() with its registered dependencies.
// User-defined namespaces may need their own deps file.  See http://go/js_deps,
// http://go/genjsdeps, or, externally, DepsWriter.
// http://code.google.com/closure/library/docs/depswriter.html
//
// Because of legacy clients, the DOM loader can't be easily removed from
// base.js.  Work is being done to make it disableable or replaceable for
// different environments (DOM-less JavaScript interpreters like Rhino or V8,
// for example). See bootstrap/ for more information.


/**
 * @define {boolean} Whether to enable the debug loader.
 *
 * If enabled, a call to goog.require() will attempt to load the namespace by
 * appending a script tag to the DOM (if the namespace has been registered).
 *
 * If disabled, goog.require() will simply assert that the namespace has been
 * provided (and depend on the fact that some outside tool correctly ordered
 * the script).
 */
goog.ENABLE_DEBUG_LOADER = true;


/**
 * Implements a system for the dynamic resolution of dependencies
 * that works in parallel with the BUILD system. Note that all calls
 * to goog.require will be stripped by the JSCompiler when the
 * --closure_pass option is used.
 * @see goog.provide
 * @param {string} name Namespace to include (as was given in goog.provide())
 *     in the form "goog.package.part".
 */
goog.require = function(name) {

  // if the object already exists we do not need do do anything
  // TODO(user): If we start to support require based on file name this has
  //            to change
  // TODO(user): If we allow goog.foo.* this has to change
  // TODO(user): If we implement dynamic load after page load we should probably
  //            not remove this code for the compiled output
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      return;
    }

    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return;
      }
    }

    var errorMessage = 'goog.require could not find: ' + name;
    if (goog.global.console) {
      goog.global.console['error'](errorMessage);
    }


      throw Error(errorMessage);

  }
};


/**
 * Path for included scripts
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
goog.global.CLOSURE_BASE_PATH;


/**
 * Whether to write out Closure's deps file. By default,
 * the deps are written.
 * @type {boolean|undefined}
 */
goog.global.CLOSURE_NO_DEPS;


/**
 * A function to import a single script. This is meant to be overridden when
 * Closure is being run in non-HTML contexts, such as web workers. It's defined
 * in the global scope so that it can be set before base.js is loaded, which
 * allows deps.js to be imported properly.
 *
 * The function is passed the script source, which is a relative URI. It should
 * return true if the script was imported, false otherwise.
 */
goog.global.CLOSURE_IMPORT_SCRIPT;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
goog.nullFunction = function() {};


/**
 * The identity function. Returns its first argument.
 *
 * @param {...*} var_args The arguments of the function.
 * @return {*} The first argument.
 * @deprecated Use goog.functions.identity instead.
 */
goog.identityFunction = function(var_args) {
  return arguments[0];
};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 *
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error
 * will be thrown when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as
 * an argument because that would make it more difficult to obfuscate
 * our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be
 *   overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


/**
 * Adds a {@code getInstance} static method that always return the same instance
 * object.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 */
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    return ctor.instance_ || (ctor.instance_ = new ctor());
  };
};


if (!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  /**
   * Object used to keep track of urls that have already been added. This
   * record allows the prevention of circular dependencies.
   * @type {Object}
   * @private
   */
  goog.included_ = {};


  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts
   * @private
   * @type {Object}
   */
  goog.dependencies_ = {
    pathToNames: {}, // 1 to many
    nameToPath: {}, // 1 to 1
    requires: {}, // 1 to many
    // used when resolving dependencies to prevent us from
    // visiting the file twice
    visited: {},
    written: {} // used to keep track of script files we have written
  };


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != 'undefined' &&
           'write' in doc;  // XULDocument misses write.
  };


  /**
   * Tries to detect the base path of the base.js script that bootstraps Closure
   * @private
   */
  goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName('script');
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Imports a script if, and only if, that script hasn't already been imported.
   * (Must be called at execution time)
   * @param {string} src Script source.
   * @private
   */
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;
    if (!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /**
   * The default implementation of the import function. Writes a script tag to
   * import the script.
   *
   * @param {string} src The script source.
   * @return {boolean} True if the script was imported, false otherwise.
   * @private
   */
  goog.writeScriptTag_ = function(src) {
    if (goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      doc.write(
          '<script type="text/javascript" src="' + src + '"></' + 'script>');
      return true;
    } else {
      return false;
    }
  };


  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls importScript_ in the correct order.
   * @private
   */
  goog.writeScripts_ = function() {
    // the scripts we need to write this time
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // we have already visited this one. We can get here if we have cyclic
      // dependencies
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          // If the required name is defined, we assume that it was already
          // bootstrapped by other means.
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error('Undefined nameToPath for ' + requireName);
            }
          }
        }
      }

      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }

    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i]);
      } else {
        throw Error('Undefined script input');
      }
    }
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {?string} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  goog.findBasePath_();

  // Allow projects to manage the deps files themselves.
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + 'deps.js');
  }
}



//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {*} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // Check these first, so we can avoid calling Object.prototype.toString if
      // possible.
      //
      // IE improperly marshals tyepof across execution contexts, but a
      // cross-context object will still return false for "instanceof Object".
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      // HACK: In order to use an Object prototype method on the arbitrary
      //   value, the compiler requires the value be cast to type Object,
      //   even though the ECMA spec explicitly allows it.
      var className = Object.prototype.toString.call(
          /** @type {Object} */ (value));
      // In Firefox 3.6, attempting to access iframe window objects' length
      // property throws an NS_ERROR_FAILURE, so we need to special-case it
      // here.
      if (className == '[object Window]') {
        return 'object';
      }

      // We cannot always use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if ((className == '[object Array]' ||
           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case
           typeof value.length == 'number' &&
           typeof value.splice != 'undefined' &&
           typeof value.propertyIsEnumerable != 'undefined' &&
           !value.propertyIsEnumerable('splice')

          )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if ((className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }


    } else {
      return 'null';
    }

  } else if (s == 'function' && typeof value.call == 'undefined') {
    // In Safari typeof nodeList returns 'function', and on Firefox
    // typeof behaves similarly for HTML{Applet,Embed,Object}Elements
    // and RegExps.  We would like to return object for those and we can
    // detect an invalid function by making sure that the function
    // object has a call method.
    return 'object';
  }
  return s;
};


/**
 * Safe way to test whether a property is enumarable.  It allows testing
 * for enumerable on objects where 'propertyIsEnumerable' is overridden or
 * does not exist (like DOM nodes in IE). Does not use browser native
 * Object.propertyIsEnumerable.
 * @param {Object} object The object to test if the property is enumerable.
 * @param {string} propName The property name to check for.
 * @return {boolean} True if the property is enumarable.
 * @private
 */
goog.propertyIsEnumerableCustom_ = function(object, propName) {
  // KJS in Safari 2 is not ECMAScript compatible and lacks crucial methods
  // such as propertyIsEnumerable.  We therefore use a workaround.
  // Does anyone know a more efficient work around?
  if (propName in object) {
    for (var key in object) {
      if (key == propName &&
          Object.prototype.hasOwnProperty.call(object, propName)) {
        return true;
      }
    }
  }
  return false;
};


/**
 * Safe way to test whether a property is enumarable.  It allows testing
 * for enumerable on objects where 'propertyIsEnumerable' is overridden or
 * does not exist (like DOM nodes in IE).
 * @param {Object} object The object to test if the property is enumerable.
 * @param {string} propName The property name to check for.
 * @return {boolean} True if the property is enumarable.
 * @private
 */
goog.propertyIsEnumerable_ = function(object, propName) {
  // In IE if object is from another window, cannot use propertyIsEnumerable
  // from this window's Object. Will raise a 'JScript object expected' error.
  if (object instanceof Object) {
    return Object.prototype.propertyIsEnumerable.call(object, propName);
  } else {
    return goog.propertyIsEnumerableCustom_(object, propName);
  }
};


/**
 * Returns true if the specified value is not |undefined|.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.  Additionally, this function assumes that the global
 * undefined variable has not been redefined.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  return val !== undefined;
};


/**
 * Returns true if the specified value is |null|
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  return val != null;
};


/**
 * Returns true if the specified value is an array
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like
 * the value needs to be an object and have a getFullYear() function.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays
 * and functions.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = goog.typeOf(val);
  return type == 'object' || type == 'array' || type == 'function';
};


/**
 * Gets a unique ID for an object. This mutates the object so that further
 * calls with the same object as a parameter returns the same value. The unique
 * ID is guaranteed to be unique across the current session amongst objects that
 * are passed into {@code getUid}. There is no guarantee that the ID is unique
 * or consistent across sessions. It is unsafe to generate unique ID for
 * function prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(user): Make the type stricter, do not accept null.

  // In Opera window.hasOwnProperty exists but always returns false so we avoid
  // using it. As a consequence the unique ID generated for BaseClass.prototype
  // and SubClass.prototype will be the same.
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using {@code goog.getUid} in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(user): Make the type stricter, do not accept null.

  // DOM nodes in IE are not instance of Object and throws exception
  // for delete. Instead we try to use removeAttribute
  if ('removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure javascript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' +
    Math.floor(Math.random() * 2147483648).toString(36);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 * @deprecated Use goog.getUid instead.
 */
goog.getHashCode = goog.getUid;


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 * @deprecated Use goog.removeUid instead.
 */
goog.removeHashCode = goog.removeUid;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * Forward declaration for the clone method. This is necessary until the
 * compiler can better support duck-typing constructs as used in
 * goog.cloneObject.
 *
 * TODO(user): Remove once the JSCompiler can infer that the check for
 * proto.clone is safe in goog.cloneObject.
 *
 * @type {Function}
 */
Object.prototype.clone;


/**
 * A native implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 * @suppress {deprecated} The compiler thinks that Function.prototype.bind
 *     is deprecated because some people have declared a pure-JS version.
 *     Only the pure-JS version is truly deprecated.
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of |this| 'pre-specified'.<br><br>
 *
 * Remaining arguments specified at call-time are appended to the pre-
 * specified ones.<br><br>
 *
 * Also see: {@link #partial}.<br><br>
 *
 * Usage:
 * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @suppress {deprecated} See above.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default
      // Chrome extension environment. This means that for Chrome extensions,
      // they get the implementation of Function.prototype.bind that
      // calls goog.bind instead of the native one. Even worse, we don't want
      // to introduce a circular dependency between goog.bind and
      // Function.prototype.bind, so we have to hack this to make sure it
      // works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};


/**
 * Like bind(), except that a 'this object' is not required. Useful when the
 * target function is already bound.
 *
 * Usage:
 * var g = partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to fn.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};


/**
 * Copies all the members of a source object to a target object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 * @param {Object} target Target.
 * @param {Object} source Source.
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = Date.now || (function() {
  // Unary plus operator converts its operand to a number which in the case of
  // a date is done by calling getTime().
  return +new Date();
});


/**
 * Evals javascript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _et_ = 1;');
      if (typeof goog.global['_et_'] != 'undefined') {
        delete goog.global['_et_'];
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      var doc = goog.global.document;
      var scriptElt = doc.createElement('script');
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {?boolean}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @type {Object|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMapping_;


/**
 * Optional obfuscation style for CSS class names. Should be set to either
 * 'BY_WHOLE' or 'BY_PART' if defined.
 * @type {string|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMappingStyle_;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * This function works in tandem with @see goog.setCssNameMapping.
 *
 * Without any mapping set, the arguments are simple joined with a
 * hyphen and passed through unaltered.
 *
 * When there is a mapping, there are two possible styles in which
 * these mappings are used. In the BY_PART style, each part (i.e. in
 * between hyphens) of the passed in css name is rewritten according
 * to the map. In the BY_WHOLE style, the full css name is looked up in
 * the map directly. If a rewrite is not specified by the map, the
 * compiler will output a warning.
 *
 * When the mapping is passed to the compiler, it will replace calls
 * to goog.getCssName with the strings from the mapping, e.g.
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x= 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If one argument is passed it will be processed, if two are passed
 * only the modifier will be processed, as it is assumed the first
 * argument was generated as a result of calling goog.getCssName.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };

  var renameByParts = function(cssName) {
    // Remap all the parts individually.
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };

  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ?
        getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }

  if (opt_modifier) {
    return className + '-' + rename(opt_modifier);
  } else {
    return rename(className);
  }
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog": "a",
 *   "disabled": "b",
 * });
 *
 * var x = goog.getCssName('goog');
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --closure_pass flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 * @param {string=} opt_style The style of css name mapping. There are two valid
 *     options: 'BY_PART', and 'BY_WHOLE'.
 * @see goog.getCssName for a description.
 */
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};


/**
 * To use CSS renaming in compiled mode, one of the input files should have a
 * call to goog.setCssNameMapping() with an object literal that the JSCompiler
 * can extract and use to replace all calls to goog.getCssName(). In uncompiled
 * mode, JavaScript code should be loaded before this base.js file that declares
 * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
 * to ensure that the mapping is loaded before any calls to goog.getCssName()
 * are made in uncompiled mode.
 *
 * A hook for overriding the CSS name mapping.
 * @type {Object|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAPPING;


if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  // This does not call goog.setCssNameMapping() because the JSCompiler
  // requires that goog.setCssNameMapping() be called with an object literal.
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}


/**
 * Abstract implementation of goog.getMsg for use with localized messages.
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object=} opt_values Map of place holder name to value.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    var value = ('' + values[key]).replace(/\$/g, '$$$$');
    str = str.replace(new RegExp('\\{\\$' + key + '\\}', 'gi'), value);
  }
  return str;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated,
 * unless they are exported in turn via this function or
 * goog.exportProperty
 *
 * <p>Also handy for making public items that are defined in anonymous
 * closures.
 *
 * ex. goog.exportSymbol('Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction',
 *                       Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 */
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { }
 *
 * function ChildClass(a, b, c) {
 *   goog.base(this, a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // works
 * </pre>
 *
 * In addition, a superclass' implementation of a method can be invoked
 * as follows:
 *
 * <pre>
 * ChildClass.prototype.foo = function(a) {
 *   ChildClass.superClass_.foo.call(this, a);
 *   // other code
 * };
 * </pre>
 *
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * contructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass
 * the name of the method as the second argument to this function. If
 * you do not, you will get a runtime error. This calls the superclass'
 * method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express
 * inheritance relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the
 * compiler will do macro expansion to remove a lot of
 * the extra overhead that this function introduces. The compiler
 * will also enforce a lot of the assumptions that this function
 * makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain,
  // then one of two things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the
 * aliases applied.  In uncompiled code the function is simply run since the
 * aliases as written are valid JavaScript.
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *    (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  fn.call(goog.global);
};


goog.provide('gcm.urlutil');
/**
 * UrlUtil (<b>com.openbet.gcm.urlutil</b>) provides utility
 * functions for manipulating url string and request parameters.
 *
 * Using this util game/commonUI developer can get/add/update url request parameters.
 * This functionality is exposed in com.openbet.gcm.urlutil.
 *
 *
 * @author xliu
 * @namespace
 */

var UrlUtil = {};

/**
 * Gets a parameter value from the passed in URL There are other ways to
 * implement this that could be quicker This solution is used here because it is
 * easy to follow
 * @param {string} url url to add params.
 * @param {Object} params object representing params to be added.
 * @return {string} encoded string url.
 */
UrlUtil.addParametersToUrl = function(url, params) {

  for (var p in params) {
    var param = p + '=' + encodeURIComponent(params[p]);

    var sep = '&';
    if (url.indexOf('?') < 0) {
      sep = '?';
    } else {
      var lastChar = url.slice(-1);
      if (lastChar == '&') sep = '';
      if (lastChar == '?') sep = '';
    }
    url += sep + param;

  }
  return url;
};



/**
 * Gets a parameter value from the passed in URL There are other ways to
 * implement this that could be quicker This solution is used here because it is
 * easy to follow
 * @param {string} name request parameter name.
 * @param {string} search (this can be obtained from window.location.search).
 * @return {?string} request parameter value.
 */
UrlUtil.getSearchParameterByName = function(name, search) {

  if (typeof (name) !== 'string') {
    throw new Error(
      'gcmBridge.getSearchParameterByName: Invalid argument name - not a string');
  }
  if (typeof (search) !== 'string') {
    throw new Error(
      'gcmBridge.getSearchParameterByName: Invalid argument search - not a string');
  }

  /** @type {RegExp} */
  var pattern;
  /** @type {Array} */
  var match;
  pattern = new RegExp('[?&]' + name + '=([^&]*)');
  match = pattern.exec(search);

  if (match && match.length > 1)
    return decodeURIComponent(match[1].replace(/\+/g, ' '));
  else
    return null;
};

/**
 * Update a parameter value from the passed in URL. <br>
 * If the parameter does not exist in given url it will append this parameter
 * with the new value to the url.
 * @param {string} name request parameter name.
 * @param {string} newValue thenew value for request parameter.
 * @param {string} url (this can be obtained from window.location.href).
 * @return {?string} The new url with updated request parameter.
 */
UrlUtil.updateSearchParameterByName = function(name, newValue, url) {
  var originalValue = UrlUtil.getSearchParameterByName(name, url);
  var newURL = '';
  if (originalValue)
  {
    newURL = url.replace(name + '=' + originalValue, name + '=' + newValue);
  }
  else
  {
    var newParam = {};
    newParam[name] = newValue;
    newURL = UrlUtil.addParametersToUrl(url, newParam);
  }

  return newURL;
};




goog.exportSymbol('com.openbet.gcm.urlutil.getSearchParameterByName', UrlUtil.getSearchParameterByName);
goog.exportSymbol('com.openbet.gcm.urlutil.updateSearchParameterByName', UrlUtil.updateSearchParameterByName);
goog.exportSymbol('com.openbet.gcm.urlutil.addParametersToUrl', UrlUtil.addParametersToUrl);
goog.provide('gcm.xmlutil');
/**
 *
 * XmlUtil (<b>com.openbet.gcm.xmlutil</b>) provides utility
 * functions for dealing with XML from FOG and RGI.
 *
 * A game can optionally use these functions
 * to convert xml strings from FOG/RGI into objects in the correct
 * format for interacting with the GCM APIs.<br>
 * This functionality is exposed in com.openbet.gcm.xmlutil.
 *
 * @author xliu
 * @namespace
 */
var XmlUtil = {};

/**
 *
 * This function will parse FOG account XML node and FreebetSummary node
 * into an accountInfo object and a balances object as required by GCM
 * APIs.
 * The account node should look like this:<br>
 * <pre>
 *   &lt;Account balance="1000.00"
 *            ccy_code="GBP"
 *            held_funds=""
 *            adjusted_free_balance="No"
 *            ccy_decimal_separator="."
 *            ccy_thousand_separator=","/&gt;
 * </pre>
 * The FreebetSummary node should look like this:<br>
 * </pre>
 * &lt;FreebetSummary available_balance="1000.00" num_tokens="200"/&gt;
 * </pre>
 * @param {string} accountXml The xml text of Account node as in example.
 *                     This can be found in FOG response.
 * @param {string} freebetSummaryXml (Optional) The xml text of FreebetSummary node as
 *                     in example. This can be found in FOG response.
 *                     This parameter is optional.
 * @return {Object} The return value is an object combining accountInfo
 *                     and balances. It is in the format of:
 *                     {'accountInfo':{ ccy_code: 'GBP',
 *                                        ccy_decimal_separator: '.',
 *                                        ccy_thousand_separator: ','
 *                                      },
 *                     'balances':{
 *                                        'CASH': {amount: 1000},
 *                                        'FREEBETS': {amount: 1000}
 *                                      }
 *                     }.
 * @throws Error if there is malformed XML or the required xml attributes
 *         are not found
 **/
XmlUtil.getAccountInfoAndBalancesFromFOGXml = function(accountXml, freebetSummaryXml) {
  var xmlParser = new DOMParser();

  var warnArr = [];
  try {
    var xmlData = xmlParser.parseFromString(accountXml, 'text/xml');
    var accountNode = xmlData.getElementsByTagName('Account')[0];
    var ccyCode = accountNode.getAttribute('ccy_code');
    if (ccyCode == null) warnArr.push('ccyCode');
    var ccyDecimalSeparator = accountNode.getAttribute('ccy_decimal_separator');
    if (ccyDecimalSeparator == null) warnArr.push('ccyDecimalSeparator');
    var ccyThousandSeparator = accountNode.getAttribute('ccy_thousand_separator');
    if (ccyThousandSeparator == null) warnArr.push('ccyThousandSeparator');
    var balance = parseFloat(accountNode.getAttribute('balance'));
    if (isNaN(balance)) warnArr.push('balance');
  }
  catch (e) {
    throw Error('com.openbet.gcm.xmlutil.getAccountInfoAndBalancesFromFOGXml: cannot parse Account XML');
  }


  var freebets = null;
  if (goog.isDefAndNotNull(freebetSummaryXml)) {
    try {
      xmlData = xmlParser.parseFromString(freebetSummaryXml, 'text/xml');
      var freebetSummaryNode = xmlData.getElementsByTagName('FreebetSummary')[0];
      freebets = parseFloat(freebetSummaryNode.getAttribute('available_balance'));
      if (isNaN(freebets)) warnArr.push('freebets');
    }
    catch (e) {
      throw Error('com.openbet.gcm.xmlutil.getAccountInfoAndBalancesFromFOGXml: cannot parse FreebetSummary XML');
    }
  }

  if (warnArr.length > 0) {
    throw Error('com.openbet.gcm.xmlutil.getAccountInfoAndBalancesFromFOGXml: Missing Data from XML: ' +
                  warnArr.toString());
  }

  var accountObj = {
    'ccy_code': ccyCode,
    'ccy_decimal_separator': ccyDecimalSeparator,
    'ccy_thousand_separator': ccyThousandSeparator
  };

  var balancesObj = {};
  balancesObj['CASH'] = {'amount': balance};

  if (goog.isDefAndNotNull(freebets)) {
    balancesObj['FREEBET'] = {'amount': freebets};
  }

  return {'accountInfo': accountObj, 'balances': balancesObj};
};


/**
 * This function will parse RGI Customer XML node into a balances object and an
 * accountInfo object in the format required by GCM APIs.<br>
 * The expected Customer XML should be in the following format.<br>
 *<pre>
 * &lt;Customer cookie="" user_id="" ccy_code="GBP"
 *      ccy_decimal_separator="."
 *      ccy_thousand_separator=","
 *      affiliate=""&gt;
 *   &lt;Balance type="CASH" amount="1000.00"/&gt;
 *   &lt;Balance type="FREEBET" amount="2000.00"/&gt;
 * &lt;/Customer&gt;
 * </pre>
 * @param {string} customerXml The xml text of Customer node as in example.
 *                     This can be found in RGI response.
 * @return {Object} The return value is an object combining accountInfo
 *                     and balances. It is in the format of:
 *                     {'accountInfo':{ ccy_code: 'GBP',
 *                                        ccy_decimal_separator: '.',
 *                                        ccy_thousand_separator: ','
 *                                      },
 *                     'balances':{
 *                                        'CASH': {amount: 1000},
 *                                        'FREEBETS': {amount: 2000}
 *                                      }
 *                     }.
 * @throws Error if there is malformed XML or the required xml attributes are not found
 * */
XmlUtil.getAccountInfoAndBalancesFromRGIXml = function(customerXml) {
  var xmlParser = new DOMParser();
  var warnArr = [];
  try {
    var xmlData = xmlParser.parseFromString(customerXml, 'text/xml');
    var cutomerNode = xmlData.getElementsByTagName('Customer')[0];
    var ccyCode = cutomerNode.getAttribute('ccy_code');
    if (ccyCode == null) warnArr.push('ccyCode');
    var ccyDecimalSeparator = cutomerNode.getAttribute('ccy_decimal_separator');
    if (ccyDecimalSeparator == null) warnArr.push('ccyDecimalSeparator');
    var ccyThousandSeparator = cutomerNode.getAttribute('ccy_thousand_separator');
    if (ccyThousandSeparator == null) warnArr.push('ccyThousandSeparator');
  }
  catch (e) {
    throw Error('com.openbet.gcm.xmlutil.getAccountInfoAndBalancesFromRGIXml: Error parsing XML');
  }

  var accountObj = {
    'ccy_code': ccyCode,
    'ccy_decimal_separator': ccyDecimalSeparator,
    'ccy_thousand_separator': ccyThousandSeparator
  };

  var balancesObj = {};
  var balanceNodes = cutomerNode.getElementsByTagName('Balance');
  if (balanceNodes.length == 0) warnArr.push('balances');
  for (var i = 0, node; node = balanceNodes[i]; i++)
  {
    balancesObj[node.getAttribute('type')] = {'amount': parseFloat(node.getAttribute('amount'))};
  }


  if (warnArr.length > 0) {
    throw Error('com.openbet.gcm.xmlutil.getAccountInfoAndBalancesFromRGIXml: Missing Data from XML: ' +
                warnArr.toString());
  }

  return {'accountInfo': accountObj, 'balances': balancesObj};
};

/**
 * This function will parse FOG Error XML node and return an errorInfo
 * object as required by the gcm handleServerError function.
 *  <pre>&lt;Error xml:lang='en-GB' type='WARNING'
 *  code='igf.db.customer.Customer.GUEST_CUTOFF_MSG'
 *          msg='Your free session is over. Please register as a member to continue playing.'/&gt;</pre>
 *
 * @param {string} errorXml The xml text of the error node as in example.
 *                    This can be found in the FOG response.
 *
 * @return {Object} return a object combined errorCode and errorMessage in
 *          following format:
 *          {
 *            errorCode: code,
 *            errorMessage: msg
 *          }.
 * @throws Error if there is malformed XML, or the required xml attributes are not found
 * */
XmlUtil.getErrorInfoFromFOGXml = function(errorXml) {
  var errorObject;
  var warnArr = [];

  try {
    var xmlParser = new DOMParser();
    var xmlDoc = xmlParser.parseFromString(errorXml, 'text/xml');
    var rootNode = xmlDoc.getElementsByTagName('Error')[0];
    var errCode = rootNode.getAttribute('code');
    if (errCode == null) warnArr.push('ErrorCode');
    var errMessage = rootNode.getAttribute('msg');
    if (errMessage == null) warnArr.push('ErrorMessage');
  }
  catch (e)
  {
    throw Error('com.openbet.gcm.xmlutil.getErrorInfoFromFOGXml: Error parsing XML');
  }

  if (warnArr.length > 0) {
    throw Error('com.openbet.gcm.xmlutil.getErrorInfoFromFOGXml: Missing Data from XML: ' + warnArr.toString());
  }

  errorObject = {
    'errorCode': errCode,
    'errorMessage': errMessage
  };

  return errorObject;
};

/**
 * This function will parse RGI Error XML node and return an errorInfo
 * object as required by the gcm handleServerError function.
 * The node should look like this:
 *          <pre>&lt;Error xml:lang='en-GB' type='INVALID_FUNDS'
 *          code='igf.games.Game.INSUFFICIENT_FUNDS_P1' action='VOID_TXN'
 *          display='SHOW' msg='You have insufficient funds to place stake'/&gt;</pre>.
 * @param {string} errorXml The error node returned from the RGI server.
 *          This can be found in the RGI response.
 * @return {Object} return a object combined errorCode and errorMessage in
 *          following format:
 *          {
 *            errorType : errType,
 *            errorCode: errCode,
 *            errorAction: errAction,
 *            errorDisplay : errDisplay,
 *            errorMessage: errMessage
 *          }.
 * @throws Error if there is malformed XML, or the required xml attributes are not found
 * */
XmlUtil.getErrorInfoFromRGIXml = function(errorXml) {
  var errorObject;
  var warnArr = [];

  try {
    var xmlParser = new DOMParser();
    var xmlDoc = xmlParser.parseFromString(errorXml, 'text/xml');
    var rootNode = xmlDoc.getElementsByTagName('Error')[0];
    var errType = rootNode.getAttribute('type');
    if (errType == null) warnArr.push('ErrorType');
    var errCode = rootNode.getAttribute('code');
    if (errCode == null) warnArr.push('ErrorCode');
    var errAction = rootNode.getAttribute('action');
    if (errAction == null) warnArr.push('ErrorAction');
    var errDisplay = rootNode.getAttribute('display');
    if (errDisplay == null) warnArr.push('ErrorDisplay');
    var errMessage = rootNode.getAttribute('msg');
    if (errMessage == null) warnArr.push('ErrorMessage');
  }
  catch (e)
  {
    throw Error('com.openbet.gcm.xmlutil.getErrorInfoFromRGIXml: Error parsing XML');
  }

  if (warnArr.length > 0) {
    throw Error('com.openbet.gcm.xmlutil.getErrorInfoFromRGIXml: Missing Data from XML: ' + warnArr.toString());
  }

  errorObject = {
    'errorType' : errType,
    'errorCode': errCode,
    'errorAction': errAction,
    'errorDisplay' : errDisplay,
    'errorMessage': errMessage
  };

  return errorObject;
};
goog.exportSymbol('com.openbet.gcm.xmlutil.getAccountInfoAndBalancesFromFOGXml',
                    XmlUtil.getAccountInfoAndBalancesFromFOGXml);
goog.exportSymbol('com.openbet.gcm.xmlutil.getAccountInfoAndBalancesFromRGIXml',
                    XmlUtil.getAccountInfoAndBalancesFromRGIXml);
goog.exportSymbol('com.openbet.gcm.xmlutil.getErrorInfoFromFOGXml', XmlUtil.getErrorInfoFromFOGXml);
goog.exportSymbol('com.openbet.gcm.xmlutil.getErrorInfoFromRGIXml', XmlUtil.getErrorInfoFromRGIXml);
/**
 * @fileoverview Validation functions for input validation.
 * @author jguiton
 */
goog.provide('gcm.validate');

/**
 * The interface that a commonUI object must implement
 * @type {Array.<string>}
 * @private
 */
gcm.validate.commonUIIface_ = [
  'stakeUpdate', 'paidUpdate', 'balancesUpdate',
  'gameAnimationStart', 'gameAnimationComplete',
  'gameReady', 'loadProgressUpdate',
  'regOption', 'optionHasChanged',
  'configReady', 'handleError', 'sessionDurationUpdate'
];

/**
 * The interface that a game object must implement
 * @type {Array.<string>}
 * @private
 */
gcm.validate.gameIface_ = [
  'gameRevealed', 'gcmReady', 'optionHasChanged',
  'configReady', 'resume', 'balancesHasChanged'
];


/**
 * Check that a commonUI object implements the required interface.
 * @param {Object} commonUI a commonUI object.
 * @return {Array.<string>} the result of the check.
 */
gcm.validate.isCommonUI = function(commonUI) {

  var rsltArr = [];
  var len = gcm.validate.commonUIIface_.length;
  for (var i = 0; i < len; i++) {
    var functionName = gcm.validate.commonUIIface_[i];
      if (typeof commonUI[functionName] !== 'function') {
        rsltArr.push(functionName);
      }
  }
  return rsltArr;
};


/**
 * Check that a game object implements the required interface.
 * @param {Object} game a game object.
 * @return {Array.<string>} the result of the check.
 */
gcm.validate.isGame = function(game) {

  var rsltArr = [];
  var len = gcm.validate.gameIface_.length;
  for (var i = 0; i < len; i++) {
    var functionName = gcm.validate.gameIface_[i];
    if (typeof game[functionName] !== 'function') {
      rsltArr.push(functionName);
    }
  }
  return rsltArr;
};

/**
 * Check the a balances object is in the correct format
 * @param {Object} balances object.
 * @return {boolean} the result of the check.
 */
gcm.validate.isBalances = function(balances) {
  //return false if it's null object
  if (!balances)
    return false;

  //balances must include at least a CASH balance
  if (typeof balances['CASH'] !== 'object') {
    return false;
  }

  for (var type in balances) {
    if (typeof balances[type]['amount'] !== 'number') {
      return false;
    }
  }
  return true;
};

/**
 * Check that a errorInfo contains the correct properties.
 * @param {Object} errorInfo an errorInfo object.
 * @return {boolean} the result of the check.
 */
gcm.validate.isErrorInfo = function(errorInfo) {
  if (!errorInfo) {
    return false;
  }

  return !(typeof errorInfo['errorCode'] == 'undefined' || typeof errorInfo['errorMessage'] == 'undefined');
};

/**
 * Check the a accountInfo ccy params are in the correct format
 * @param {Object} accountInfo object.
 * @return {boolean} the result of the check.
 */
gcm.validate.isValidCurrencyOps = function(accountInfo) {

  if (!accountInfo)
    return false;

  var pattern = /^[.\D]$/;
  if (typeof accountInfo['ccy_thousand_separator'] == 'undefined' ||
      !pattern.test(accountInfo['ccy_thousand_separator'])) {
    return false;
  }

  if (typeof accountInfo['ccy_decimal_separator'] == 'undefined' ||
      !pattern.test(accountInfo['ccy_decimal_separator'])) {
    return false;
  }

  return !(typeof accountInfo['ccy_code'] == 'undefined' || accountInfo['ccy_code'] == '');


};

/**
 * Check the input is numeric
 * @param {number} value the number to validate.
 * @return {boolean} the result of the check.
 */
gcm.validate.isNumericValue = function(value) {
  return (typeof value) == 'number' && !isNaN(parseFloat(value)) && isFinite(value);
};


/**
 *
 * @param {number} value the number to validate.
 * @return {boolean} the result of the check.
 */
gcm.validate.isIntegerValue = function(value) {

  return (typeof value) == 'number' && !isNaN(parseInt(value, 10)) && parseInt(value, 10) == value && isFinite(value);
};


/**
 * @param {number} value the percentage value to validate.
 * @return {boolean} the result of the check.
 */
gcm.validate.isPercentValue = function(value) {

  if (gcm.validate.isNumericValue(value)) {
    return (parseFloat(value) < 100) && !(parseFloat(value) < 0);
  }
  return false;
};

/**
 * Checks that the input is a valid css height spec.
 * valid units: %,in,cm,mm,em,ex,pt,pc,px
 *
 * @param {string} value the number to validate.
 * @return {boolean} the result of the check.
 */
gcm.validate.isHeight = function(value) {
  var height = /^\d+(\.\d+)?(%|in|cm|mm|em|ex|pt|pc|px)/;
  return height.test(value);
};


/**
 * Checks that this is a string of non zero length with only letters and numbers
 * @param {string} str the value to validate.
 * @return {boolean} the result of the check.
 */
gcm.validate.isAlphaNumeric = function(str) {
  if (typeof str != 'string')
    return false;

  return /^[a-zA-Z0-9]+$/.test(str);
};

/**
 * Checks that string is valid game name
 * @param {string} str the value to validate.
 * @return {boolean} the result of the check.
 */
gcm.validate.isValidGameName = function(str) {
  if (typeof str != 'string')
    return false;

  return /^[a-zA-Z0-9\-_]+$/.test(str);
};


/**
 * Checks the string is a single letter. Useful for checking channels
 * @param {string} str the value to validate.
 * @return {boolean} the result of the check.
 */
gcm.validate.isSingleLetter = function(str) {
  return /^[a-zA-Z]$/.test(str);
};


/**
 * @param {Object} optionTypes enum of valid options.
 * @param {string} optionType for validation.
 * @return {boolean} the result of the check.
 */
gcm.validate.isEnumOption = function(optionTypes, optionType) {

  /**
   * @type {boolean}
   */
  var found = false;
  for (var key in optionTypes) {
    if (optionType === optionTypes[key]) {
      found = true;
      break;
    }
  }
  return found;
};

/**
 * @param {Object} callBack function passed through.
 * @return {boolean} the result.
 */
gcm.validate.isFunction = function(callBack) {
  return typeof callBack === 'function';

};



/**
 * @param {Element} elem value to be validated.
 * @return {boolean} Is the object a DOM element.
 */
gcm.validate.isElement = function(elem) {
  return Boolean(elem && typeof elem.appendChild === 'function');

};
goog.provide('gcmBridge');
goog.require('gcm.urlutil');
goog.require('gcm.validate');
// required xmlutil in gcm bridge to expose gcm utility to games.
goog.require('gcm.xmlutil');
// TODO move into main src/main/javascript/openbet/gcm directory.

/**
 * Game Client Middleware Bridge is available for game suppliers as a bridge
 * into the gcm module.<br>
 * GCM. Game Client Middleware<br>
 * (C) 2012 OpenBet Technologies Ltd. All rights reserved.<br>
 * <p>
 * The gcm module itself will reside in the commonUI iframe. gcmBridge takes care
 * of creating the iframe for the commonUI, loading the commonUI into it, then
 * once gcm is loaded into the commonUI iframe, gcmBridge will allow the game to
 * communicate with gcmBridge as if it were gcm itself. This way the game does
 * not need to know about the iframe details. gcmBridge will also manage the
 * iframe sizing: The commonUI will ask gcm to resize the commonUI iframe at
 * different times in order to show different sized displays over the game. gcm
 * will call through to gcmBridge to adjust the size of the iframe.
 * </p>
 *
 * @author asugar
 * @namespace
 */
var gcmBridge = {};

/**
 * @type {?string}
 * @private
 */
gcmBridge.gameName_;

/**
 * @type {?string}
 * @private
 */
gcmBridge.channel_;

// TODO create enum for playMode
/**
 * @type {?string}
 * @private
 */
gcmBridge.playMode_;

/**
 * @type {Element}
 * @private
 */
gcmBridge.ifrm_;

// TODO: change this to proper type {Gcm}
/**
 * @type {Object}
 * @private
 */
gcmBridge.gcm_;

// TODO: change this to proper type {Game}
/**
 * @type {Object}
 * @private
 */
gcmBridge.game_;

/**
 * checks if the uri paramater is a relative URI
 * This function protects us from
 * the potential security risk of rendering absolue url content that has been
 * specified as a request param
 * Note that not all relative URIs are allowed, but we do reject absolute URIs and
 * network-path references.
 * @param {string} url the URL to check.
 * @return {boolean} is this a relative url.
 */
gcmBridge.checkURIIsRelative = function(url) {

  if (typeof (url) !== 'string') {
    throw new Error(
        'gcmBridge.checkURIIsRelative: Invalid argument url - not a string');
  }

  // firstly we check that the URI doesn't start with either "<protocol>://" or
  // "//"
  // these would signify an absolute URI or a network-path reference, both of
  // which
  // would allow content from another domain.
  // anything else should be a URI requesting content from the same domain
  // note that www.google.com is not an absolute URI.  if you use 'www.google.com' as a link
  // from a page at http://www.openbet.com/games then the link will go to
  // http://www.openbet.com/games/www.google.com
  // also note that //www.google.com is a network-path reference.  If you use '//www.google.com'
  // as a link from a page at http://www.openbet.com/games then it will go to
  // http://www.google.com
  // more details can be found at http://tools.ietf.org/html/rfc3986

  if ((/^([a-z0-9+.-]+):\/\//).test(url)) {
    return false;
  }

  if ((/^\/\//).test(url)) {
    return false;
  }

  //we allow alphanumeric, "/", "_", "-", "." only
  //this is more restrictive than the full set of allowed URIs but we don't want to allow
  //features like request parameters etc. through at this stage
  return (/^[a-zA-Z0-9\/\.\-_]*$/).test(url);
};


// TODO: proper type for this object
/**
 * The game should call this init method on the gcmBridge as soon as possible
 * Here we create an iframe and load the commonUI into it
 * @param {Element} docBody document.body for the page. Used to create the
 *          iframe for the commonUI.
 * @param {string} currentUrl the full url of the game window, including the parameters:
 *          commonUIURL, gameName, channel and playMode. These parameters are extracted
 *          by gcmBridge and must be included for the currentUrl to be valid.
 * @param {Object} game this is the game object. gcmBridge will call gcmReady on
 *          it, once gcm is available.
 */
gcmBridge.init = function(docBody, currentUrl, game) {
  if (!gcm.validate.isElement(docBody)) {
    throw new Error('gcmBridge.init: Invalid argument docBody - not an Element');
  }
  if (typeof (currentUrl) !== 'string') {
    throw new Error(
        'gcmBrdige.init: Invalid argument currentUrl - not a String');
  }
  var gameCheck = gcm.validate.isGame(game);
  if (gameCheck.length > 0) {
    throw new Error('gcmBrige.init: Game Missing API Methods:' + gameCheck.toString());
  }
  gcmBridge.game_ = game;

  gcmBridge.gameName_ = UrlUtil.getSearchParameterByName('gameName', currentUrl);
  // check that gameName exists
  if (gcmBridge.gameName_ === null) {
    throw new Error(
        'gcmBridge.init: gameName request parameter has not been supplied');
  } else {
    // check that gameName is alphanumeric string
    if (!gcm.validate.isValidGameName(gcmBridge.gameName_)) {
      throw new Error(
          'gcmBridge.init: gameName request parameter is not alphanumeric string');
    }
  }

  gcmBridge.channel_ = UrlUtil.getSearchParameterByName('channel', currentUrl);
  // check that channel exists
  if (gcmBridge.channel_ === null) {
    throw new Error(
        'gcmBridge.init: channel request parameter has not been supplied');
  } else {
    // check that channel is a single letter
    if (!gcm.validate.isSingleLetter(gcmBridge.channel_)) {
      throw new Error(
          'gcmBridge.init: channel request parameter is not a single letter');
    }
  }


  gcmBridge.playMode_ = UrlUtil.getSearchParameterByName('playMode', currentUrl);
  // check that playMode exists
  if (gcmBridge.playMode_ === null) {
    throw new Error(
        'gcmBridge.init: playMode request parameter has not been supplied');
  } else {
    // check that playMode is either demo or real
    if (!(gcmBridge.playMode_ === 'demo' || gcmBridge.playMode_ === 'real')) {
      throw new Error(
          'gcmBridge.init: playMode request parameter is neither demo nor real');
    }
  }

  var commonUIUrl = UrlUtil.getSearchParameterByName('commonUIURL', currentUrl);
  if (commonUIUrl === null) {
    throw new Error(
        'gcmBridge.init: commonUIURL request parameter has not been supplied');
  }

  var reqParams = {
    'gameName': gcmBridge.gameName_,
    'playMode': gcmBridge.playMode_,
    'channel': gcmBridge.channel_
  };

  var commonUIUrlParams = UrlUtil.addParametersToUrl(commonUIUrl, reqParams);

  // initially we want the commonUI to take up the whole screen
  // by default for loading sequence
  // check the commonUI url is relative before loading
  // note that it is a security risk to allow absolute paths to be rendered
  // that have been passed in as request parameters
  if (gcmBridge.checkURIIsRelative(commonUIUrl)) {
    gcmBridge.makeIFrame_(docBody, commonUIUrlParams, 100, 100);
  } else {
    throw new Error(
        'gcmBridge.init: commonUIURL request parameter is not a relative URL');
  }

};

/**
 * create an iframe and add to document body
 * @param {Element} docBody the document body Element.
 * @param {string} url the url to load into the iframe.
 * @param {number} widthPct initial width percentage.
 * @param {number} heightPct initial height percentage.
 * @private
 */
gcmBridge.makeIFrame_ = function(docBody, url, widthPct, heightPct) {
  gcmBridge.ifrm_ = document.createElement('IFRAME');
  gcmBridge.ifrm_.name = 'commonUIIFrame';
  gcmBridge.ifrm_.setAttribute('src', url);
  gcmBridge.ifrm_.style.width = widthPct + '%';
  gcmBridge.ifrm_.style.height = heightPct + '%';
  gcmBridge.ifrm_.style.position = 'absolute';
  gcmBridge.ifrm_.setAttribute('scrolling', 'no');
  gcmBridge.ifrm_.style.border = 0;
  gcmBridge.ifrm_.style.top = 0;
  gcmBridge.ifrm_.style.left = 0;
  docBody.appendChild(gcmBridge.ifrm_);
};

// TODO: change this to proper type {GCM}
/**
 * gcm will call this method when it is ready
 * @param {Object} gcm - the gcm object from the iframe.
 */
gcmBridge.gcmReady = function(gcm) {
  gcmBridge.gcm_ = gcm;
  //inform gcm that game is available and pass through the game object
  gcmBridge.gcm_.setGame(gcmBridge.game_);
  // the gcm object
  gcmBridge.game_.gcmReady(gcmBridge.gcm_);
};

/**
 * GCM will call through to the gcm bridge when the commonUI iframe needs to be
 * resized For simplicity we request only a percentage height for now. In the
 * future we may include a range of options
 * @param {string} height new height of iframe in any css unit, e.g. "20%",
 *          "20px", "20em" are all valid.
 * @param {string} width (Optional) The new width of iframe, same format as height.
 */
gcmBridge.commonUIResize = function(height, width) {

  if (!gcm.validate.isHeight(height)) {
    throw new Error('gcmBridge.commonUIResize: Invalid height value ' + height);
  }

  if (height)
    gcmBridge.ifrm_.style.height = height;
  if (width)
  {
    gcmBridge.ifrm_.style.width = width;
    var currentWidth = gcmBridge.ifrm_.offsetWidth;
    gcmBridge.ifrm_.style.left = '50%';
    gcmBridge.ifrm_.style.marginLeft = (-currentWidth / 2) + 'px';
  }
};

/**
 * Returns the playMode included in the playMode request param Used by GCM
 * @return {?string} playMode.
 */
gcmBridge.getPlayMode = function() {
  return gcmBridge.playMode_;
};

/**
 * Returns the channel included in the channel request param Used by GCM
 * @return {?string} channel.
 */
gcmBridge.getChannel = function() {
  return gcmBridge.channel_;
};
gcmBridge.getLanguage = function() {
  //return 'en_GB';
  return 'en';
};

/**
 * Returns the gameName included in the playMode request param Used by GCM
 * @return {?string} gameName.
 */
gcmBridge.getGameName = function() {
  return gcmBridge.gameName_;
};

goog.exportSymbol('com.openbet.gcmBridge.getGameName', gcmBridge.getGameName);
goog.exportSymbol('com.openbet.gcmBridge.getChannel', gcmBridge.getChannel);
goog.exportSymbol('com.openbet.gcmBridge.getPlayMode', gcmBridge.getPlayMode);
goog.exportSymbol('com.openbet.gcmBridge.commonUIResize', gcmBridge.commonUIResize);
goog.exportSymbol('com.openbet.gcmBridge.gcmReady', gcmBridge.gcmReady);
goog.exportSymbol('com.openbet.gcmBridge.init', gcmBridge.init);
goog.exportSymbol('com.openbet.gcmBridge.checkURIIsRelative', gcmBridge.checkURIIsRelative);
goog.exportSymbol('com.openbet.gcmBridge.getLanguage', gcmBridge.getLanguage);
