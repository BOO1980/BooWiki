CLOSURE_NO_DEPS = true;
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


/**
 * @author cramacha
 * Date: 12/07/13
 */
goog.provide('gcm.liveserv.MessageHandler');

/**
 * Liveserv message handler interface.
 *
 * @interface
 */
function MessageHandler() {}

/**
 * Returns if the handler init is complete.
 *
 * @type {function()}
 */
MessageHandler.prototype.isInitComplete;

/**
 * Inits the message handler.
 *
 * @type {function(!function())}
 */
MessageHandler.prototype.init;

/**
 * Returns the channel type of the message handler.
 *
 * @type {function()}
 */
MessageHandler.prototype.getChannelType;

/**
 * Handles liveserv message.
 *
 * @type {function(!Object)}
 */
MessageHandler.prototype.handleMessage;
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides a base class for custom Error objects such that the
 * stack is correctly maintained.
 *
 * You should never need to throw goog.debug.Error(msg) directly, Error(msg) is
 * sufficient.
 *
 */

goog.provide('goog.debug.Error');



/**
 * Base class for custom error objects.
 * @param {*=} opt_msg The message associated with the error.
 * @constructor
 * @extends {Error}
 */
goog.debug.Error = function(opt_msg) {

  // Ensure there is a stack trace.
  this.stack = new Error().stack || '';

  if (opt_msg) {
    this.message = String(opt_msg);
  }
};
goog.inherits(goog.debug.Error, Error);


/** @override */
goog.debug.Error.prototype.name = 'CustomError';
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
 * @fileoverview Utilities for string manipulation.
 */


/**
 * Namespace for string utilities
 */
goog.provide('goog.string');
goog.provide('goog.string.Unicode');


/**
 * Common Unicode string characters.
 * @enum {string}
 */
goog.string.Unicode = {
  NBSP: '\xa0'
};


/**
 * Fast prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix}.
 */
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};


/**
 * Fast suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix}.
 */
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};


/**
 * Case-insensitive prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix  A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(
      prefix, str.substr(0, prefix.length)) == 0;
};


/**
 * Case-insensitive suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(
      suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} str The string containing the pattern.
 * @param {...*} var_args The items to substitute into the pattern.
 * @return {string} A copy of {@code str} in which each occurrence of
 *     {@code %s} has been replaced an argument from {@code var_args}.
 */
goog.string.subs = function(str, var_args) {
  // This appears to be slow, but testing shows it compares more or less
  // equivalent to the regex.exec method.
  for (var i = 1; i < arguments.length; i++) {
    // We cast to String in case an argument is a Function.  Replacing $&, for
    // example, with $$$& stops the replace from subsituting the whole match
    // into the resultant string.  $$$& in the first replace becomes $$& in the
    //  second, which leaves $& in the resultant string.  Also:
    // $$, $`, $', $n $nn
    var replacement = String(arguments[i]).replace(/\$/g, '$$$$');
    str = str.replace(/\%s/, replacement);
  }
  return str;
};


/**
 * Converts multiple whitespace chars (spaces, non-breaking-spaces, new lines
 * and tabs) to a single space, and strips leading and trailing whitespace.
 * @param {string} str Input string.
 * @return {string} A copy of {@code str} with collapsed whitespace.
 */
goog.string.collapseWhitespace = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');
};


/**
 * Checks if a string is empty or contains only whitespaces.
 * @param {string} str The string to check.
 * @return {boolean} True if {@code str} is empty or whitespace only.
 */
goog.string.isEmpty = function(str) {
  // testing length == 0 first is actually slower in all browsers (about the
  // same in Opera).
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return /^[\s\xa0]*$/.test(str);
};


/**
 * Checks if a string is null, empty or contains only whitespaces.
 * @param {*} str The string to check.
 * @return {boolean} True if{@code str} is null, empty, or whitespace only.
 */
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str));
};


/**
 * Checks if a string is all breaking whitespace.
 * @param {string} str The string to check.
 * @return {boolean} Whether the string is all breaking whitespace.
 */
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};


/**
 * Checks if a string contains all letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} consists entirely of letters.
 */
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};


/**
 * Checks if a string contains only numbers.
 * @param {*} str string to check. If not a string, it will be
 *     casted to one.
 * @return {boolean} True if {@code str} is numeric.
 */
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};


/**
 * Checks if a string contains only numbers or letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} is alphanumeric.
 */
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};


/**
 * Checks if a character is a space character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {code ch} is a space.
 */
goog.string.isSpace = function(ch) {
  return ch == ' ';
};


/**
 * Checks if a character is a valid unicode character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {code ch} is a valid unicode character.
 */
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= ' ' && ch <= '~' ||
         ch >= '\u0080' && ch <= '\uFFFD';
};


/**
 * Takes a string and replaces newlines with a space. Multiple lines are
 * replaced with a single space.
 * @param {string} str The string from which to strip newlines.
 * @return {string} A copy of {@code str} stripped of newlines.
 */
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, ' ');
};


/**
 * Replaces Windows and Mac new lines with unix style: \r or \r\n with \n.
 * @param {string} str The string to in which to canonicalize newlines.
 * @return {string} {@code str} A copy of {@code} with canonicalized newlines.
 */
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};


/**
 * Normalizes whitespace in a string, replacing all whitespace chars with
 * a space.
 * @param {string} str The string in which to normalize whitespace.
 * @return {string} A copy of {@code str} with all whitespace normalized.
 */
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, ' ');
};


/**
 * Normalizes spaces in a string, replacing all consecutive spaces and tabs
 * with a single space. Replaces non-breaking space with a space.
 * @param {string} str The string in which to normalize spaces.
 * @return {string} A copy of {@code str} with all consecutive spaces and tabs
 *    replaced with a single space.
 */
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, ' ');
};


/**
 * Removes the breaking spaces from the left and right of the string and
 * collapses the sequences of breaking spaces in the middle into single spaces.
 * The original and the result strings render the same way in HTML.
 * @param {string} str A string in which to collapse spaces.
 * @return {string} Copy of the string with normalized breaking spaces.
 */
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, ' ').replace(
      /^[\t\r\n ]+|[\t\r\n ]+$/g, '');
};


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
};


/**
 * Trims whitespaces at the left end of a string.
 * @param {string} str The string to left trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimLeft = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims whitespaces at the right end of a string.
 * @param {string} str The string to right trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimRight = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+$/, '');
};


/**
 * A string comparator that ignores case.
 * -1 = str1 less than str2
 *  0 = str1 equals str2
 *  1 = str1 greater than str2
 *
 * @param {string} str1 The string to compare.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} The comparator result, as described above.
 */
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();

  if (test1 < test2) {
    return -1;
  } else if (test1 == test2) {
    return 0;
  } else {
    return 1;
  }
};


/**
 * Regular expression used for splitting a string into substrings of fractional
 * numbers, integers, and non-numeric characters.
 * @type {RegExp}
 * @private
 */
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;


/**
 * String comparison function that handles numbers in a way humans might expect.
 * Using this function, the string "File 2.jpg" sorts before "File 10.jpg". The
 * comparison is mostly case-insensitive, though strings that are identical
 * except for case are sorted with the upper-case strings before lower-case.
 *
 * This comparison function is significantly slower (about 500x) than either
 * the default or the case-insensitive compare. It should not be used in
 * time-critical code, but should be fast enough to sort several hundred short
 * strings (like filenames) with a reasonable delay.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.numerateCompare = function(str1, str2) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return -1;
  }
  if (!str2) {
    return 1;
  }

  // Using match to split the entire string ahead of time turns out to be faster
  // for most inputs than using RegExp.exec or iterating over each character.
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);

  var count = Math.min(tokens1.length, tokens2.length);

  for (var i = 0; i < count; i++) {
    var a = tokens1[i];
    var b = tokens2[i];

    // Compare pairs of tokens, returning if one token sorts before the other.
    if (a != b) {

      // Only if both tokens are integers is a special comparison required.
      // Decimal numbers are sorted as strings (e.g., '.09' < '.1').
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }

  // If one string is a substring of the other, the shorter string sorts first.
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }

  // The two strings must be equivalent except for case (perfect equality is
  // tested at the head of the function.) Revert to default ASCII-betical string
  // comparison to stablize the sort.
  return str1 < str2 ? -1 : 1;
};


/**
 * Regular expression used for determining if a string needs to be encoded.
 * @type {RegExp}
 * @private
 */
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;


/**
 * URL-encodes a string
 * @param {*} str The string to url-encode.
 * @return {string} An encoded copy of {@code str} that is safe for urls.
 *     Note that '#', ':', and other characters used to delimit portions
 *     of URLs *will* be encoded.
 */
goog.string.urlEncode = function(str) {
  str = String(str);
  // Checking if the search matches before calling encodeURIComponent avoids an
  // extra allocation in IE6. This adds about 10us time in FF and a similiar
  // over head in IE6 for lower working set apps, but for large working set
  // apps like Gmail, it saves about 70us per call.
  if (!goog.string.encodeUriRegExp_.test(str)) {
    return encodeURIComponent(str);
  }
  return str;
};


/**
 * URL-decodes the string. We need to specially handle '+'s because
 * the javascript library doesn't convert them to spaces.
 * @param {string} str The string to url decode.
 * @return {string} The decoded {@code str}.
 */
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};


/**
 * Converts \n to <br>s or <br />s.
 * @param {string} str The string in which to convert newlines.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} A copy of {@code str} with converted newlines.
 */
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
};


/**
 * Escape double quote '"' characters in addition to '&', '<', and '>' so that a
 * string can be included in an HTML tag attribute value within double quotes.
 *
 * It should be noted that > doesn't need to be escaped for the HTML or XML to
 * be valid, but it has been decided to escape it for consistency with other
 * implementations.
 *
 * NOTE(user):
 * HtmlEscape is often called during the generation of large blocks of HTML.
 * Using statics for the regular expressions and strings is an optimization
 * that can more than half the amount of time IE spends in this function for
 * large apps, since strings and regexes both contribute to GC allocations.
 *
 * Testing for the presence of a character before escaping increases the number
 * of function calls, but actually provides a speed increase for the average
 * case -- since the average case often doesn't require the escaping of all 4
 * characters and indexOf() is much cheaper than replace().
 * The worst case does suffer slightly from the additional calls, therefore the
 * opt_isLikelyToContainHtmlChars option has been included for situations
 * where all 4 HTML entities are very likely to be present and need escaping.
 *
 * Some benchmarks (times tended to fluctuate +-0.05ms):
 *                                     FireFox                     IE6
 * (no chars / average (mix of cases) / all 4 chars)
 * no checks                     0.13 / 0.22 / 0.22         0.23 / 0.53 / 0.80
 * indexOf                       0.08 / 0.17 / 0.26         0.22 / 0.54 / 0.84
 * indexOf + re test             0.07 / 0.17 / 0.28         0.19 / 0.50 / 0.85
 *
 * An additional advantage of checking if replace actually needs to be called
 * is a reduction in the number of object allocations, so as the size of the
 * application grows the difference between the various methods would increase.
 *
 * @param {string} str string to be escaped.
 * @param {boolean=} opt_isLikelyToContainHtmlChars Don't perform a check to see
 *     if the character needs replacing - use this option if you expect each of
 *     the characters to appear often. Leave false if you expect few html
 *     characters to occur in your strings, such as if you are escaping HTML.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {

  if (opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, '&amp;')
          .replace(goog.string.ltRe_, '&lt;')
          .replace(goog.string.gtRe_, '&gt;')
          .replace(goog.string.quotRe_, '&quot;');

  } else {
    // quick test helps in the case when there are no chars to replace, in
    // worst case this makes barely a difference to the time taken
    if (!goog.string.allRe_.test(str)) return str;

    // str.indexOf is faster than regex.test in this case
    if (str.indexOf('&') != -1) {
      str = str.replace(goog.string.amperRe_, '&amp;');
    }
    if (str.indexOf('<') != -1) {
      str = str.replace(goog.string.ltRe_, '&lt;');
    }
    if (str.indexOf('>') != -1) {
      str = str.replace(goog.string.gtRe_, '&gt;');
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, '&quot;');
    }
    return str;
  }
};


/**
 * Regular expression that matches an ampersand, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.amperRe_ = /&/g;


/**
 * Regular expression that matches a less than sign, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.ltRe_ = /</g;


/**
 * Regular expression that matches a greater than sign, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.gtRe_ = />/g;


/**
 * Regular expression that matches a double quote, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.quotRe_ = /\"/g;


/**
 * Regular expression that matches any character that needs to be escaped.
 * @type {RegExp}
 * @private
 */
goog.string.allRe_ = /[&<>\"]/;


/**
 * Unescapes an HTML string.
 *
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, '&')) {
    // We are careful not to use a DOM if we do not have one. We use the []
    // notation so that the JSCompiler will not complain about these objects and
    // fields in the case where we have no DOM.
    if ('document' in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      // Fall back on pure XML entities
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};


/**
 * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
 * entities. This function is XSS-safe and whitespace-preserving.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} The unescaped {@code str} string.
 */
goog.string.unescapeEntitiesUsingDom_ = function(str) {
  var seen = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'};
  var div = document.createElement('div');
  // Match as many valid entity characters as possible. If the actual entity
  // happens to be shorter, it will still work as innerHTML will return the
  // trailing characters unchanged. Since the entity characters do not include
  // open angle bracket, there is no chance of XSS from the innerHTML use.
  // Since no whitespace is passed to innerHTML, whitespace is preserved.
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    // Check for cached entity.
    var value = seen[s];
    if (value) {
      return value;
    }
    // Check for numeric entity.
    if (entity.charAt(0) == '#') {
      // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex numbers.
      var n = Number('0' + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    // Fall back to innerHTML otherwise.
    if (!value) {
      // Append a non-entity character to avoid a bug in Webkit that parses
      // an invalid entity at the end of innerHTML text as the empty string.
      div.innerHTML = s + ' ';
      // Then remove the trailing character from the result.
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    // Cache and return.
    return seen[s] = value;
  });
};


/**
 * Unescapes XML entities.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch (entity) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      default:
        if (entity.charAt(0) == '#') {
          // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
          var n = Number('0' + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        // For invalid entities we just return the entity
        return s;
    }
  });
};


/**
 * Regular expression that matches an HTML entity.
 * See also HTML5: Tokenization / Tokenizing character references.
 * @private
 * @type {!RegExp}
 */
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;


/**
 * Do escaping of whitespace to preserve spatial formatting. We use character
 * entity #160 to make it safer for xml.
 * @param {string} str The string in which to escape whitespace.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, ' &#160;'), opt_xml);
};


/**
 * Strip quote characters around a string.  The second argument is a string of
 * characters to treat as quotes.  This can be a single character or a string of
 * multiple character and in that case each of those are treated as possible
 * quote characters. For example:
 *
 * <pre>
 * goog.string.stripQuotes('"abc"', '"`') --> 'abc'
 * goog.string.stripQuotes('`abc`', '"`') --> 'abc'
 * </pre>
 *
 * @param {string} str The string to strip.
 * @param {string} quoteChars The quote characters to strip.
 * @return {string} A copy of {@code str} without the quotes.
 */
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0; i < length; i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};


/**
 * Truncates a string to a certain length and adds '...' if necessary.  The
 * length also accounts for the ellipsis, so a maximum length of 10 and a string
 * 'Hello World!' produces 'Hello W...'.
 * @param {string} str The string to truncate.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cut off in the middle.
 * @return {string} The truncated {@code str} string.
 */
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (str.length > chars) {
    str = str.substring(0, chars - 3) + '...';
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Truncate a string in the middle, adding "..." if necessary,
 * and favoring the beginning of the string.
 * @param {string} str The string to truncate the middle of.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cutoff in the middle.
 * @param {number=} opt_trailingChars Optional number of trailing characters to
 *     leave at the end of the string, instead of truncating as close to the
 *     middle as possible.
 * @return {string} A truncated copy of {@code str}.
 */
goog.string.truncateMiddle = function(str, chars,
    opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + '...' + str.substring(endPoint);
  } else if (str.length > chars) {
    // Favor the beginning of the string:
    var half = Math.floor(chars / 2);
    var endPos = str.length - half;
    half += chars % 2;
    str = str.substring(0, half) + '...' + str.substring(endPos);
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Special chars that need to be escaped for goog.string.quote.
 * @private
 * @type {Object}
 */
goog.string.specialEscapeChars_ = {
  '\0': '\\0',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B', // '\v' is not supported in JScript
  '"': '\\"',
  '\\': '\\\\'
};


/**
 * Character mappings used internally for goog.string.escapeChar.
 * @private
 * @type {Object}
 */
goog.string.jsEscapeCache_ = {
  '\'': '\\\''
};


/**
 * Encloses a string in double quotes and escapes characters so that the
 * string is a valid JS string.
 * @param {string} s The string to quote.
 * @return {string} A copy of {@code s} surrounded by double quotes.
 */
goog.string.quote = function(s) {
  s = String(s);
  if (s.quote) {
    return s.quote();
  } else {
    var sb = ['"'];
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] ||
          ((cc > 31 && cc < 127) ? ch : goog.string.escapeChar(ch));
    }
    sb.push('"');
    return sb.join('');
  }
};


/**
 * Takes a string and returns the escaped string for that character.
 * @param {string} str The string to escape.
 * @return {string} An escaped string representing {@code str}.
 */
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0; i < str.length; i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join('');
};


/**
 * Takes a character and returns the escaped string for that character. For
 * example escapeChar(String.fromCharCode(15)) -> "\\x0E".
 * @param {string} c The character to escape.
 * @return {string} An escaped string representing {@code c}.
 */
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }

  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }

  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    // tab is 9 but handled above
    if (cc < 256) {
      rv = '\\x';
      if (cc < 16 || cc > 256) {
        rv += '0';
      }
    } else {
      rv = '\\u';
      if (cc < 4096) { // \u1000
        rv += '0';
      }
    }
    rv += cc.toString(16).toUpperCase();
  }

  return goog.string.jsEscapeCache_[c] = rv;
};


/**
 * Takes a string and creates a map (Object) in which the keys are the
 * characters in the string. The value for the key is set to true. You can
 * then use goog.object.map or goog.array.map to change the values.
 * @param {string} s The string to build the map from.
 * @return {Object} The map of characters used.
 */
// TODO(arv): It seems like we should have a generic goog.array.toMap. But do
//            we want a dependency on goog.array in goog.string?
goog.string.toMap = function(s) {
  var rv = {};
  for (var i = 0; i < s.length; i++) {
    rv[s.charAt(i)] = true;
  }
  return rv;
};


/**
 * Checks whether a string contains a given character.
 * @param {string} s The string to test.
 * @param {string} ss The substring to test for.
 * @return {boolean} True if {@code s} contains {@code ss}.
 */
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1;
};


/**
 * Removes a substring of a specified length at a specific
 * index in a string.
 * @param {string} s The base string from which to remove.
 * @param {number} index The index at which to remove the substring.
 * @param {number} stringLength The length of the substring to remove.
 * @return {string} A copy of {@code s} with the substring removed or the full
 *     string if nothing is removed or the input is invalid.
 */
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  // If the index is greater or equal to 0 then remove substring
  if (index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) +
        s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};


/**
 *  Removes the first occurrence of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), '');
  return s.replace(re, '');
};


/**
 *  Removes all occurrences of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), 'g');
  return s.replace(re, '');
};


/**
 * Escapes characters in the string that are not safe to use in a RegExp.
 * @param {*} s The string to escape. If not a string, it will be casted
 *     to one.
 * @return {string} A RegExp safe, escaped copy of {@code s}.
 */
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
      replace(/\x08/g, '\\x08');
};


/**
 * Repeats a string n times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat.
 * @return {string} A string containing {@code length} repetitions of
 *     {@code string}.
 */
goog.string.repeat = function(string, length) {
  return new Array(length + 1).join(string);
};


/**
 * Pads number to given length and optionally rounds it to a given precision.
 * For example:
 * <pre>padNumber(1.25, 2, 3) -> '01.250'
 * padNumber(1.25, 2) -> '01.25'
 * padNumber(1.25, 2, 1) -> '01.3'
 * padNumber(1.25, 0) -> '1.25'</pre>
 *
 * @param {number} num The number to pad.
 * @param {number} length The desired length.
 * @param {number=} opt_precision The desired precision.
 * @return {string} {@code num} as a string with the given options.
 */
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf('.');
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat('0', Math.max(0, length - index)) + s;
};


/**
 * Returns a string representation of the given object, with
 * null and undefined being returned as the empty string.
 *
 * @param {*} obj The object to convert.
 * @return {string} A string representation of the {@code obj}.
 */
goog.string.makeSafe = function(obj) {
  return obj == null ? '' : String(obj);
};


/**
 * Concatenates string expressions. This is useful
 * since some browsers are very inefficient when it comes to using plus to
 * concat strings. Be careful when using null and undefined here since
 * these will not be included in the result. If you need to represent these
 * be sure to cast the argument to a String first.
 * For example:
 * <pre>buildString('a', 'b', 'c', 'd') -> 'abcd'
 * buildString(null, undefined) -> ''
 * </pre>
 * @param {...*} var_args A list of strings to concatenate. If not a string,
 *     it will be casted to one.
 * @return {string} The concatenation of {@code var_args}.
 */
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, '');
};


/**
 * Returns a string with at least 64-bits of randomness.
 *
 * Doesn't trust Javascript's random function entirely. Uses a combination of
 * random and current timestamp, and then encodes the string in base-36 to
 * make it shorter.
 *
 * @return {string} A random string, e.g. sn1s7vb4gcic.
 */
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) +
         Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};


/**
 * Compares two version numbers.
 *
 * @param {string|number} version1 Version of first item.
 * @param {string|number} version2 Version of second item.
 *
 * @return {number}  1 if {@code version1} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code version2} is higher.
 */
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  // Trim leading and trailing whitespace and split the versions into
  // subversions.
  var v1Subs = goog.string.trim(String(version1)).split('.');
  var v2Subs = goog.string.trim(String(version2)).split('.');
  var subCount = Math.max(v1Subs.length, v2Subs.length);

  // Iterate over the subversions, as long as they appear to be equivalent.
  for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || '';
    var v2Sub = v2Subs[subIdx] || '';

    // Split the subversions into pairs of numbers and qualifiers (like 'b').
    // Two different RegExp objects are needed because they are both using
    // the 'g' flag.
    var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
      var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
      // Break if there are no more matches.
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }

      // Parse the numeric part of the subversion. A missing number is
      // equivalent to 0.
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);

      // Compare the subversion components. The number has the highest
      // precedence. Next, if the numbers are equal, a subversion without any
      // qualifier is always higher than a subversion with any qualifier. Next,
      // the qualifiers are compared as strings.
      order = goog.string.compareElements_(v1CompNum, v2CompNum) ||
          goog.string.compareElements_(v1Comp[2].length == 0,
              v2Comp[2].length == 0) ||
          goog.string.compareElements_(v1Comp[2], v2Comp[2]);
      // Stop as soon as an inequality is discovered.
    } while (order == 0);
  }

  return order;
};


/**
 * Compares elements of a version number.
 *
 * @param {string|number|boolean} left An element from a version number.
 * @param {string|number|boolean} right An element from a version number.
 *
 * @return {number}  1 if {@code left} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code right} is higher.
 * @private
 */
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
};


/**
 * Maximum value of #goog.string.hashCode, exclusive. 2^32.
 * @type {number}
 * @private
 */
goog.string.HASHCODE_MAX_ = 0x100000000;


/**
 * String hash function similar to java.lang.String.hashCode().
 * The hash code for a string is computed as
 * s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
 * where s[i] is the ith character of the string and n is the length of
 * the string. We mod the result to make it between 0 (inclusive) and 2^32
 * (exclusive).
 * @param {string} str A string.
 * @return {number} Hash value for {@code str}, between 0 (inclusive) and 2^32
 *  (exclusive). The empty string returns 0.
 */
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0; i < str.length; ++i) {
    result = 31 * result + str.charCodeAt(i);
    // Normalize to 4 byte range, 0 ... 2^32.
    result %= goog.string.HASHCODE_MAX_;
  }
  return result;
};


/**
 * The most recent unique ID. |0 is equivalent to Math.floor in this case.
 * @type {number}
 * @private
 */
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0;


/**
 * Generates and returns a string which is unique in the current document.
 * This is useful, for example, to create unique IDs for DOM elements.
 * @return {string} A unique id.
 */
goog.string.createUniqueString = function() {
  return 'goog_' + goog.string.uniqueStringCounter_++;
};


/**
 * Converts the supplied string to a number, which may be Ininity or NaN.
 * This function strips whitespace: (toNumber(' 123') === 123)
 * This function accepts scientific notation: (toNumber('1e1') === 10)
 *
 * This is better than Javascript's built-in conversions because, sadly:
 *     (Number(' ') === 0) and (parseFloat('123a') === 123)
 *
 * @param {string} str The string to convert.
 * @return {number} The number the supplied string represents, or NaN.
 */
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmpty(str)) {
    return NaN;
  }
  return num;
};


/**
 * A memoized cache for goog.string.toCamelCase.
 * @type {Object.<string>}
 * @private
 */
goog.string.toCamelCaseCache_ = {};


/**
 * Converts a string from selector-case to camelCase (e.g. from
 * "multi-part-string" to "multiPartString"), useful for converting
 * CSS selectors and HTML dataset keys to their equivalent JS properties.
 * @param {string} str The string in selector-case form.
 * @return {string} The string in camelCase form.
 */
goog.string.toCamelCase = function(str) {
  return goog.string.toCamelCaseCache_[str] ||
      (goog.string.toCamelCaseCache_[str] =
          String(str).replace(/\-([a-z])/g, function(all, match) {
            return match.toUpperCase();
          }));
};


/**
 * A memoized cache for goog.string.toSelectorCase.
 * @type {Object.<string>}
 * @private
 */
goog.string.toSelectorCaseCache_ = {};


/**
 * Converts a string from camelCase to selector-case (e.g. from
 * "multiPartString" to "multi-part-string"), useful for converting JS
 * style and dataset properties to equivalent CSS selectors and HTML keys.
 * @param {string} str The string in camelCase form.
 * @return {string} The string in selector-case form.
 */
goog.string.toSelectorCase = function(str) {
  return goog.string.toSelectorCaseCache_[str] ||
      (goog.string.toSelectorCaseCache_[str] =
          String(str).replace(/([A-Z])/g, '-$1').toLowerCase());
};
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utilities to check the preconditions, postconditions and
 * invariants runtime.
 *
 * Methods in this package should be given special treatment by the compiler
 * for type-inference. For example, <code>goog.asserts.assert(foo)</code>
 * will restrict <code>foo</code> to a truthy value.
 *
 * The compiler has an option to disable asserts. So code like:
 * <code>
 * var x = goog.asserts.assert(foo()); goog.asserts.assert(bar());
 * </code>
 * will be transformed into:
 * <code>
 * var x = foo();
 * </code>
 * The compiler will leave in foo() (because its return value is used),
 * but it will remove bar() because it assumes it does not have side-effects.
 *
 */

goog.provide('goog.asserts');
goog.provide('goog.asserts.AssertionError');

goog.require('goog.debug.Error');
goog.require('goog.string');


/**
 * @define {boolean} Whether to strip out asserts or to leave them in.
 */
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;



/**
 * Error object for failed assertions.
 * @param {string} messagePattern The pattern that was used to form message.
 * @param {!Array.<*>} messageArgs The items to substitute into the pattern.
 * @constructor
 * @extends {goog.debug.Error}
 */
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  // Remove the messagePattern afterwards to avoid permenantly modifying the
  // passed in array.
  messageArgs.shift();

  /**
   * The message pattern used to format the error message. Error handlers can
   * use this to uniquely identify the assertion.
   * @type {string}
   */
  this.messagePattern = messagePattern;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);


/** @override */
goog.asserts.AssertionError.prototype.name = 'AssertionError';


/**
 * Throws an exception with the given message and "Assertion failed" prefixed
 * onto it.
 * @param {string} defaultMessage The message to use if givenMessage is empty.
 * @param {Array.<*>} defaultArgs The substitution arguments for defaultMessage.
 * @param {string|undefined} givenMessage Message supplied by the caller.
 * @param {Array.<*>} givenArgs The substitution arguments for givenMessage.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 * @private
 */
goog.asserts.doAssertFailure_ =
    function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = 'Assertion failed';
  if (givenMessage) {
    message += ': ' + givenMessage;
    var args = givenArgs;
  } else if (defaultMessage) {
    message += ': ' + defaultMessage;
    args = defaultArgs;
  }
  // The '' + works around an Opera 10 bug in the unit tests. Without it,
  // a stack trace is added to var message above. With this, a stack trace is
  // not added until this line (it causes the extra garbage to be added after
  // the assertion message instead of in the middle of it).
  throw new goog.asserts.AssertionError('' + message, args || []);
};


/**
 * Checks if the condition evaluates to true if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {*} The value of the condition.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
goog.asserts.assert = function(condition, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_('', null, opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};


/**
 * Fails if goog.asserts.ENABLE_ASSERTS is true. This function is useful in case
 * when we want to add a check in the unreachable area like switch-case
 * statement:
 *
 * <pre>
 *  switch(type) {
 *    case FOO: doSomething(); break;
 *    case BAR: doSomethingElse(); break;
 *    default: goog.assert.fail('Unrecognized type: ' + type);
 *      // We have only 2 types - "default:" section is unreachable code.
 *  }
 * </pre>
 *
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} Failure.
 */
goog.asserts.fail = function(opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError(
        'Failure' + (opt_message ? ': ' + opt_message : ''),
        Array.prototype.slice.call(arguments, 1));
  }
};


/**
 * Checks if the value is a number if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {number} The value, guaranteed to be a number when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 */
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_('Expected number but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {number} */ (value);
};


/**
 * Checks if the value is a string if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {string} The value, guaranteed to be a string when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a string.
 */
goog.asserts.assertString = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_('Expected string but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {string} */ (value);
};


/**
 * Checks if the value is a function if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Function} The value, guaranteed to be a function when asserts
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a function.
 */
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_('Expected function but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Function} */ (value);
};


/**
 * Checks if the value is an Object if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Object} The value, guaranteed to be a non-null object.
 * @throws {goog.asserts.AssertionError} When the value is not an object.
 */
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_('Expected object but got %s: %s.',
        [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Object} */ (value);
};


/**
 * Checks if the value is an Array if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Array} The value, guaranteed to be a non-null array.
 * @throws {goog.asserts.AssertionError} When the value is not an array.
 */
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_('Expected array but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Array} */ (value);
};


/**
 * Checks if the value is a boolean if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {boolean} The value, guaranteed to be a boolean when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a boolean.
 */
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_('Expected boolean but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {boolean} */ (value);
};


/**
 * Checks if the value is an instance of the user-defined type if
 * goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {!Function} type A user-defined constructor.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the value is not an instance of
 *     type.
 */
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_('instanceof check failed.', null,
        opt_message, Array.prototype.slice.call(arguments, 3));
  }
};

// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Simple utilities for dealing with URI strings.
 *
 * This is intended to be a lightweight alternative to constructing goog.Uri
 * objects.  Whereas goog.Uri adds several kilobytes to the binary regardless
 * of how much of its functionality you use, this is designed to be a set of
 * mostly-independent utilities so that the compiler includes only what is
 * necessary for the task.  Estimated savings of porting is 5k pre-gzip and
 * 1.5k post-gzip.  To ensure the savings remain, future developers should
 * avoid adding new functionality to existing functions, but instead create
 * new ones and factor out shared code.
 *
 * Many of these utilities have limited functionality, tailored to common
 * cases.  The query parameter utilities assume that the parameter keys are
 * already encoded, since most keys are compile-time alphanumeric strings.  The
 * query parameter mutation utilities also do not tolerate fragment identifiers.
 *
 * By design, these functions can be slower than goog.Uri equivalents.
 * Repeated calls to some of functions may be quadratic in behavior for IE,
 * although the effect is somewhat limited given the 2kb limit.
 *
 * One advantage of the limited functionality here is that this approach is
 * less sensitive to differences in URI encodings than goog.Uri, since these
 * functions modify the strings in place, rather than decoding and
 * re-encoding.
 *
 * Uses features of RFC 3986 for parsing/formatting URIs:
 *   http://gbiv.com/protocols/uri/rfc/rfc3986.html
 *
 */

goog.provide('goog.uri.utils');
goog.provide('goog.uri.utils.ComponentIndex');
goog.provide('goog.uri.utils.QueryArray');
goog.provide('goog.uri.utils.QueryValue');
goog.provide('goog.uri.utils.StandardQueryParam');

goog.require('goog.asserts');
goog.require('goog.string');


/**
 * Character codes inlined to avoid object allocations due to charCode.
 * @enum {number}
 * @private
 */
goog.uri.utils.CharCode_ = {
  AMPERSAND: 38,
  EQUAL: 61,
  HASH: 35,
  QUESTION: 63
};


/**
 * Builds a URI string from already-encoded parts.
 *
 * No encoding is performed.  Any component may be omitted as either null or
 * undefined.
 *
 * @param {?string=} opt_scheme The scheme such as 'http'.
 * @param {?string=} opt_userInfo The user name before the '@'.
 * @param {?string=} opt_domain The domain such as 'www.google.com', already
 *     URI-encoded.
 * @param {(string|number|null)=} opt_port The port number.
 * @param {?string=} opt_path The path, already URI-encoded.  If it is not
 *     empty, it must begin with a slash.
 * @param {?string=} opt_queryData The URI-encoded query data.
 * @param {?string=} opt_fragment The URI-encoded fragment identifier.
 * @return {string} The fully combined URI.
 */
goog.uri.utils.buildFromEncodedParts = function(opt_scheme, opt_userInfo,
    opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
  var out = [];

  if (opt_scheme) {
    out.push(opt_scheme, ':');
  }

  if (opt_domain) {
    out.push('//');

    if (opt_userInfo) {
      out.push(opt_userInfo, '@');
    }

    out.push(opt_domain);

    if (opt_port) {
      out.push(':', opt_port);
    }
  }

  if (opt_path) {
    out.push(opt_path);
  }

  if (opt_queryData) {
    out.push('?', opt_queryData);
  }

  if (opt_fragment) {
    out.push('#', opt_fragment);
  }

  return out.join('');
};


/**
 * A regular expression for breaking a URI into its component parts.
 *
 * {@link http://www.gbiv.com/protocols/uri/rfc/rfc3986.html#RFC2234} says
 * As the "first-match-wins" algorithm is identical to the "greedy"
 * disambiguation method used by POSIX regular expressions, it is natural and
 * commonplace to use a regular expression for parsing the potential five
 * components of a URI reference.
 *
 * The following line is the regular expression for breaking-down a
 * well-formed URI reference into its components.
 *
 * <pre>
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 * </pre>
 *
 * The numbers in the second line above are only to assist readability; they
 * indicate the reference points for each subexpression (i.e., each paired
 * parenthesis). We refer to the value matched for subexpression <n> as $<n>.
 * For example, matching the above expression to
 * <pre>
 *     http://www.ics.uci.edu/pub/ietf/uri/#Related
 * </pre>
 * results in the following subexpression matches:
 * <pre>
 *    $1 = http:
 *    $2 = http
 *    $3 = //www.ics.uci.edu
 *    $4 = www.ics.uci.edu
 *    $5 = /pub/ietf/uri/
 *    $6 = <undefined>
 *    $7 = <undefined>
 *    $8 = #Related
 *    $9 = Related
 * </pre>
 * where <undefined> indicates that the component is not present, as is the
 * case for the query component in the above example. Therefore, we can
 * determine the value of the five components as
 * <pre>
 *    scheme    = $2
 *    authority = $4
 *    path      = $5
 *    query     = $7
 *    fragment  = $9
 * </pre>
 *
 * The regular expression has been modified slightly to expose the
 * userInfo, domain, and port separately from the authority.
 * The modified version yields
 * <pre>
 *    $1 = http              scheme
 *    $2 = <undefined>       userInfo -\
 *    $3 = www.ics.uci.edu   domain     | authority
 *    $4 = <undefined>       port     -/
 *    $5 = /pub/ietf/uri/    path
 *    $6 = <undefined>       query without ?
 *    $7 = Related           fragment without #
 * </pre>
 * @type {!RegExp}
 * @private
 */
goog.uri.utils.splitRe_ = new RegExp(
    '^' +
    '(?:' +
      '([^:/?#.]+)' +                     // scheme - ignore special characters
                                          // used by other URL parts such as :,
                                          // ?, /, #, and .
    ':)?' +
    '(?://' +
      '(?:([^/?#]*)@)?' +                 // userInfo
      '([\\w\\d\\-\\u0100-\\uffff.%]*)' + // domain - restrict to letters,
                                          // digits, dashes, dots, percent
                                          // escapes, and unicode characters.
      '(?::([0-9]+))?' +                  // port
    ')?' +
    '([^?#]+)?' +                         // path
    '(?:\\?([^#]*))?' +                   // query
    '(?:#(.*))?' +                        // fragment
    '$');


/**
 * The index of each URI component in the return value of goog.uri.utils.split.
 * @enum {number}
 */
goog.uri.utils.ComponentIndex = {
  SCHEME: 1,
  USER_INFO: 2,
  DOMAIN: 3,
  PORT: 4,
  PATH: 5,
  QUERY_DATA: 6,
  FRAGMENT: 7
};


/**
 * Splits a URI into its component parts.
 *
 * Each component can be accessed via the component indices; for example:
 * <pre>
 * goog.uri.utils.split(someStr)[goog.uri.utils.CompontentIndex.QUERY_DATA];
 * </pre>
 *
 * @param {string} uri The URI string to examine.
 * @return {!Array.<string|undefined>} Each component still URI-encoded.
 *     Each component that is present will contain the encoded value, whereas
 *     components that are not present will be undefined or empty, depending
 *     on the browser's regular expression implementation.  Never null, since
 *     arbitrary strings may still look like path names.
 */
goog.uri.utils.split = function(uri) {
  // See @return comment -- never null.
  return /** @type {!Array.<string|undefined>} */ (
      uri.match(goog.uri.utils.splitRe_));
};


/**
 * @param {?string} uri A possibly null string.
 * @return {?string} The string URI-decoded, or null if uri is null.
 * @private
 */
goog.uri.utils.decodeIfPossible_ = function(uri) {
  return uri && decodeURIComponent(uri);
};


/**
 * Gets a URI component by index.
 *
 * It is preferred to use the getPathEncoded() variety of functions ahead,
 * since they are more readable.
 *
 * @param {goog.uri.utils.ComponentIndex} componentIndex The component index.
 * @param {string} uri The URI to examine.
 * @return {?string} The still-encoded component, or null if the component
 *     is not present.
 * @private
 */
goog.uri.utils.getComponentByIndex_ = function(componentIndex, uri) {
  // Convert undefined, null, and empty string into null.
  return goog.uri.utils.split(uri)[componentIndex] || null;
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The protocol or scheme, or null if none.  Does not
 *     include trailing colons or slashes.
 */
goog.uri.utils.getScheme = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.SCHEME, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The user name still encoded, or null if none.
 */
goog.uri.utils.getUserInfoEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.USER_INFO, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The decoded user info, or null if none.
 */
goog.uri.utils.getUserInfo = function(uri) {
  return goog.uri.utils.decodeIfPossible_(
      goog.uri.utils.getUserInfoEncoded(uri));
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The domain name still encoded, or null if none.
 */
goog.uri.utils.getDomainEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.DOMAIN, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The decoded domain, or null if none.
 */
goog.uri.utils.getDomain = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getDomainEncoded(uri));
};


/**
 * @param {string} uri The URI to examine.
 * @return {?number} The port number, or null if none.
 */
goog.uri.utils.getPort = function(uri) {
  // Coerce to a number.  If the result of getComponentByIndex_ is null or
  // non-numeric, the number coersion yields NaN.  This will then return
  // null for all non-numeric cases (though also zero, which isn't a relevant
  // port number).
  return Number(goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.PORT, uri)) || null;
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The path still encoded, or null if none. Includes the
 *     leading slash, if any.
 */
goog.uri.utils.getPathEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.PATH, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The decoded path, or null if none.  Includes the leading
 *     slash, if any.
 */
goog.uri.utils.getPath = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getPathEncoded(uri));
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The query data still encoded, or null if none.  Does not
 *     include the question mark itself.
 */
goog.uri.utils.getQueryData = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.QUERY_DATA, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The fragment identifier, or null if none.  Does not
 *     include the hash mark itself.
 */
goog.uri.utils.getFragmentEncoded = function(uri) {
  // The hash mark may not appear in any other part of the URL.
  var hashIndex = uri.indexOf('#');
  return hashIndex < 0 ? null : uri.substr(hashIndex + 1);
};


/**
 * @param {string} uri The URI to examine.
 * @param {?string} fragment The encoded fragment identifier, or null if none.
 *     Does not include the hash mark itself.
 * @return {string} The URI with the fragment set.
 */
goog.uri.utils.setFragmentEncoded = function(uri, fragment) {
  return goog.uri.utils.removeFragment(uri) + (fragment ? '#' + fragment : '');
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The decoded fragment identifier, or null if none.  Does
 *     not include the hash mark.
 */
goog.uri.utils.getFragment = function(uri) {
  return goog.uri.utils.decodeIfPossible_(
      goog.uri.utils.getFragmentEncoded(uri));
};


/**
 * Extracts everything up to the port of the URI.
 * @param {string} uri The URI string.
 * @return {string} Everything up to and including the port.
 */
goog.uri.utils.getHost = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(
      pieces[goog.uri.utils.ComponentIndex.SCHEME],
      pieces[goog.uri.utils.ComponentIndex.USER_INFO],
      pieces[goog.uri.utils.ComponentIndex.DOMAIN],
      pieces[goog.uri.utils.ComponentIndex.PORT]);
};


/**
 * Extracts the path of the URL and everything after.
 * @param {string} uri The URI string.
 * @return {string} The URI, starting at the path and including the query
 *     parameters and fragment identifier.
 */
goog.uri.utils.getPathAndAfter = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(null, null, null, null,
      pieces[goog.uri.utils.ComponentIndex.PATH],
      pieces[goog.uri.utils.ComponentIndex.QUERY_DATA],
      pieces[goog.uri.utils.ComponentIndex.FRAGMENT]);
};


/**
 * Gets the URI with the fragment identifier removed.
 * @param {string} uri The URI to examine.
 * @return {string} Everything preceding the hash mark.
 */
goog.uri.utils.removeFragment = function(uri) {
  // The hash mark may not appear in any other part of the URL.
  var hashIndex = uri.indexOf('#');
  return hashIndex < 0 ? uri : uri.substr(0, hashIndex);
};


/**
 * Ensures that two URI's have the exact same domain, scheme, and port.
 *
 * Unlike the version in goog.Uri, this checks protocol, and therefore is
 * suitable for checking against the browser's same-origin policy.
 *
 * @param {string} uri1 The first URI.
 * @param {string} uri2 The second URI.
 * @return {boolean} Whether they have the same domain and port.
 */
goog.uri.utils.haveSameDomain = function(uri1, uri2) {
  var pieces1 = goog.uri.utils.split(uri1);
  var pieces2 = goog.uri.utils.split(uri2);
  return pieces1[goog.uri.utils.ComponentIndex.DOMAIN] ==
             pieces2[goog.uri.utils.ComponentIndex.DOMAIN] &&
         pieces1[goog.uri.utils.ComponentIndex.SCHEME] ==
             pieces2[goog.uri.utils.ComponentIndex.SCHEME] &&
         pieces1[goog.uri.utils.ComponentIndex.PORT] ==
             pieces2[goog.uri.utils.ComponentIndex.PORT];
};


/**
 * Asserts that there are no fragment or query identifiers, only in uncompiled
 * mode.
 * @param {string} uri The URI to examine.
 * @private
 */
goog.uri.utils.assertNoFragmentsOrQueries_ = function(uri) {
  // NOTE: would use goog.asserts here, but jscompiler doesn't know that
  // indexOf has no side effects.
  if (goog.DEBUG && (uri.indexOf('#') >= 0 || uri.indexOf('?') >= 0)) {
    throw Error('goog.uri.utils: Fragment or query identifiers are not ' +
        'supported: [' + uri + ']');
  }
};


/**
 * Supported query parameter values by the parameter serializing utilities.
 *
 * If a value is null or undefined, the key-value pair is skipped, as an easy
 * way to omit parameters conditionally.  Non-array parameters are converted
 * to a string and URI encoded.  Array values are expanded into multiple
 * &key=value pairs, with each element stringized and URI-encoded.
 *
 * @typedef {*}
 */
goog.uri.utils.QueryValue;


/**
 * An array representing a set of query parameters with alternating keys
 * and values.
 *
 * Keys are assumed to be URI encoded already and live at even indices.  See
 * goog.uri.utils.QueryValue for details on how parameter values are encoded.
 *
 * Example:
 * <pre>
 * var data = [
 *   // Simple param: ?name=BobBarker
 *   'name', 'BobBarker',
 *   // Conditional param -- may be omitted entirely.
 *   'specialDietaryNeeds', hasDietaryNeeds() ? getDietaryNeeds() : null,
 *   // Multi-valued param: &house=LosAngeles&house=NewYork&house=null
 *   'house', ['LosAngeles', 'NewYork', null]
 * ];
 * </pre>
 *
 * @typedef {!Array.<string|goog.uri.utils.QueryValue>}
 */
goog.uri.utils.QueryArray;


/**
 * Appends a URI and query data in a string buffer with special preconditions.
 *
 * Internal implementation utility, performing very few object allocations.
 *
 * @param {!Array.<string|undefined>} buffer A string buffer.  The first element
 *     must be the base URI, and may have a fragment identifier.  If the array
 *     contains more than one element, the second element must be an ampersand,
 *     and may be overwritten, depending on the base URI.  Undefined elements
 *     are treated as empty-string.
 * @return {string} The concatenated URI and query data.
 * @private
 */
goog.uri.utils.appendQueryData_ = function(buffer) {
  if (buffer[1]) {
    // At least one query parameter was added.  We need to check the
    // punctuation mark, which is currently an ampersand, and also make sure
    // there aren't any interfering fragment identifiers.
    var baseUri = /** @type {string} */ (buffer[0]);
    var hashIndex = baseUri.indexOf('#');
    if (hashIndex >= 0) {
      // Move the fragment off the base part of the URI into the end.
      buffer.push(baseUri.substr(hashIndex));
      buffer[0] = baseUri = baseUri.substr(0, hashIndex);
    }
    var questionIndex = baseUri.indexOf('?');
    if (questionIndex < 0) {
      // No question mark, so we need a question mark instead of an ampersand.
      buffer[1] = '?';
    } else if (questionIndex == baseUri.length - 1) {
      // Question mark is the very last character of the existing URI, so don't
      // append an additional delimiter.
      buffer[1] = undefined;
    }
  }

  return buffer.join('');
};


/**
 * Appends key=value pairs to an array, supporting multi-valued objects.
 * @param {string} key The key prefix.
 * @param {goog.uri.utils.QueryValue} value The value to serialize.
 * @param {!Array.<string>} pairs The array to which the 'key=value' strings
 *     should be appended.
 * @private
 */
goog.uri.utils.appendKeyValuePairs_ = function(key, value, pairs) {
  if (goog.isArray(value)) {
    // It's an array, so append all elements.  Here, we must convince
    // jscompiler that it is, indeed, an array.
    value = /** @type {Array} */ (value);
    for (var j = 0; j < value.length; j++) {
      pairs.push('&', key);
      // Check for empty string, null and undefined get encoded
      // into the url as literal strings
      if (value[j] !== '') {
        pairs.push('=', goog.string.urlEncode(value[j]));
      }
    }
  } else if (value != null) {
    // Not null or undefined, so safe to append.
    pairs.push('&', key);
    // Check for empty string, null and undefined get encoded
    // into the url as literal strings
    if (value !== '') {
      pairs.push('=', goog.string.urlEncode(value));
    }
  }
};


/**
 * Builds a buffer of query data from a sequence of alternating keys and values.
 *
 * @param {!Array.<string|undefined>} buffer A string buffer to append to.  The
 *     first element appended will be an '&', and may be replaced by the caller.
 * @param {goog.uri.utils.QueryArray|Arguments} keysAndValues An array with
 *     alternating keys and values -- see the typedef.
 * @param {number=} opt_startIndex A start offset into the arary, defaults to 0.
 * @return {!Array.<string|undefined>} The buffer argument.
 * @private
 */
goog.uri.utils.buildQueryDataBuffer_ = function(
    buffer, keysAndValues, opt_startIndex) {
  goog.asserts.assert(Math.max(keysAndValues.length - (opt_startIndex || 0),
      0) % 2 == 0, 'goog.uri.utils: Key/value lists must be even in length.');

  for (var i = opt_startIndex || 0; i < keysAndValues.length; i += 2) {
    goog.uri.utils.appendKeyValuePairs_(
        keysAndValues[i], keysAndValues[i + 1], buffer);
  }

  return buffer;
};


/**
 * Builds a query data string from a sequence of alternating keys and values.
 * Currently generates "&key&" for empty args.
 *
 * @param {goog.uri.utils.QueryArray} keysAndValues Alternating keys and
 *     values.  See the typedef.
 * @param {number=} opt_startIndex A start offset into the arary, defaults to 0.
 * @return {string} The encoded query string, in the for 'a=1&b=2'.
 */
goog.uri.utils.buildQueryData = function(keysAndValues, opt_startIndex) {
  var buffer = goog.uri.utils.buildQueryDataBuffer_(
      [], keysAndValues, opt_startIndex);
  buffer[0] = ''; // Remove the leading ampersand.
  return buffer.join('');
};


/**
 * Builds a buffer of query data from a map.
 *
 * @param {!Array.<string|undefined>} buffer A string buffer to append to.  The
 *     first element appended will be an '&', and may be replaced by the caller.
 * @param {Object.<goog.uri.utils.QueryValue>} map An object where keys are
 *     URI-encoded parameter keys, and the values conform to the contract
 *     specified in the goog.uri.utils.QueryValue typedef.
 * @return {!Array.<string|undefined>} The buffer argument.
 * @private
 */
goog.uri.utils.buildQueryDataBufferFromMap_ = function(buffer, map) {
  for (var key in map) {
    goog.uri.utils.appendKeyValuePairs_(key, map[key], buffer);
  }

  return buffer;
};


/**
 * Builds a query data string from a map.
 * Currently generates "&key&" for empty args.
 *
 * @param {Object} map An object where keys are URI-encoded parameter keys,
 *     and the values are arbitrary types or arrays.  Keys with a null value
 *     are dropped.
 * @return {string} The encoded query string, in the for 'a=1&b=2'.
 */
goog.uri.utils.buildQueryDataFromMap = function(map) {
  var buffer = goog.uri.utils.buildQueryDataBufferFromMap_([], map);
  buffer[0] = '';
  return buffer.join('');
};


/**
 * Appends URI parameters to an existing URI.
 *
 * The variable arguments may contain alternating keys and values.  Keys are
 * assumed to be already URI encoded.  The values should not be URI-encoded,
 * and will instead be encoded by this function.
 * <pre>
 * appendParams('http://www.foo.com?existing=true',
 *     'key1', 'value1',
 *     'key2', 'value?willBeEncoded',
 *     'key3', ['valueA', 'valueB', 'valueC'],
 *     'key4', null);
 * result: 'http://www.foo.com?existing=true&' +
 *     'key1=value1&' +
 *     'key2=value%3FwillBeEncoded&' +
 *     'key3=valueA&key3=valueB&key3=valueC'
 * </pre>
 *
 * A single call to this function will not exhibit quadratic behavior in IE,
 * whereas multiple repeated calls may, although the effect is limited by
 * fact that URL's generally can't exceed 2kb.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {...(goog.uri.utils.QueryArray|string|goog.uri.utils.QueryValue)} var_args
 *     An array or argument list conforming to goog.uri.utils.QueryArray.
 * @return {string} The URI with all query parameters added.
 */
goog.uri.utils.appendParams = function(uri, var_args) {
  return goog.uri.utils.appendQueryData_(
      arguments.length == 2 ?
      goog.uri.utils.buildQueryDataBuffer_([uri], arguments[1], 0) :
      goog.uri.utils.buildQueryDataBuffer_([uri], arguments, 1));
};


/**
 * Appends query parameters from a map.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {Object} map An object where keys are URI-encoded parameter keys,
 *     and the values are arbitrary types or arrays.  Keys with a null value
 *     are dropped.
 * @return {string} The new parameters.
 */
goog.uri.utils.appendParamsFromMap = function(uri, map) {
  return goog.uri.utils.appendQueryData_(
      goog.uri.utils.buildQueryDataBufferFromMap_([uri], map));
};


/**
 * Appends a single URI parameter.
 *
 * Repeated calls to this can exhibit quadratic behavior in IE6 due to the
 * way string append works, though it should be limited given the 2kb limit.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {string} key The key, which must already be URI encoded.
 * @param {*} value The value, which will be stringized and encoded (assumed
 *     not already to be encoded).
 * @return {string} The URI with the query parameter added.
 */
goog.uri.utils.appendParam = function(uri, key, value) {
  return goog.uri.utils.appendQueryData_(
      [uri, '&', key, '=', goog.string.urlEncode(value)]);
};


/**
 * Finds the next instance of a query parameter with the specified name.
 *
 * Does not instantiate any objects.
 *
 * @param {string} uri The URI to search.  May contain a fragment identifier
 *     if opt_hashIndex is specified.
 * @param {number} startIndex The index to begin searching for the key at.  A
 *     match may be found even if this is one character after the ampersand.
 * @param {string} keyEncoded The URI-encoded key.
 * @param {number} hashOrEndIndex Index to stop looking at.  If a hash
 *     mark is present, it should be its index, otherwise it should be the
 *     length of the string.
 * @return {number} The position of the first character in the key's name,
 *     immediately after either a question mark or a dot.
 * @private
 */
goog.uri.utils.findParam_ = function(
    uri, startIndex, keyEncoded, hashOrEndIndex) {
  var index = startIndex;
  var keyLength = keyEncoded.length;

  // Search for the key itself and post-filter for surronuding punctuation,
  // rather than expensively building a regexp.
  while ((index = uri.indexOf(keyEncoded, index)) >= 0 &&
      index < hashOrEndIndex) {
    var precedingChar = uri.charCodeAt(index - 1);
    // Ensure that the preceding character is '&' or '?'.
    if (precedingChar == goog.uri.utils.CharCode_.AMPERSAND ||
        precedingChar == goog.uri.utils.CharCode_.QUESTION) {
      // Ensure the following character is '&', '=', '#', or NaN
      // (end of string).
      var followingChar = uri.charCodeAt(index + keyLength);
      if (!followingChar ||
          followingChar == goog.uri.utils.CharCode_.EQUAL ||
          followingChar == goog.uri.utils.CharCode_.AMPERSAND ||
          followingChar == goog.uri.utils.CharCode_.HASH) {
        return index;
      }
    }
    index += keyLength + 1;
  }

  return -1;
};


/**
 * Regular expression for finding a hash mark or end of string.
 * @type {RegExp}
 * @private
 */
goog.uri.utils.hashOrEndRe_ = /#|$/;


/**
 * Determines if the URI contains a specific key.
 *
 * Performs no object instantiations.
 *
 * @param {string} uri The URI to process.  May contain a fragment
 *     identifier.
 * @param {string} keyEncoded The URI-encoded key.  Case-sensitive.
 * @return {boolean} Whether the key is present.
 */
goog.uri.utils.hasParam = function(uri, keyEncoded) {
  return goog.uri.utils.findParam_(uri, 0, keyEncoded,
      uri.search(goog.uri.utils.hashOrEndRe_)) >= 0;
};


/**
 * Gets the first value of a query parameter.
 * @param {string} uri The URI to process.  May contain a fragment.
 * @param {string} keyEncoded The URI-encoded key.  Case-sensitive.
 * @return {?string} The first value of the parameter (URI-decoded), or null
 *     if the parameter is not found.
 */
goog.uri.utils.getParamValue = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var foundIndex = goog.uri.utils.findParam_(
      uri, 0, keyEncoded, hashOrEndIndex);

  if (foundIndex < 0) {
    return null;
  } else {
    var endPosition = uri.indexOf('&', foundIndex);
    if (endPosition < 0 || endPosition > hashOrEndIndex) {
      endPosition = hashOrEndIndex;
    }
    // Progress forth to the end of the "key=" or "key&" substring.
    foundIndex += keyEncoded.length + 1;
    // Use substr, because it (unlike substring) will return empty string
    // if foundIndex > endPosition.
    return goog.string.urlDecode(
        uri.substr(foundIndex, endPosition - foundIndex));
  }
};


/**
 * Gets all values of a query parameter.
 * @param {string} uri The URI to process.  May contain a framgnet.
 * @param {string} keyEncoded The URI-encoded key.  Case-snsitive.
 * @return {!Array.<string>} All URI-decoded values with the given key.
 *     If the key is not found, this will have length 0, but never be null.
 */
goog.uri.utils.getParamValues = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var position = 0;
  var foundIndex;
  var result = [];

  while ((foundIndex = goog.uri.utils.findParam_(
      uri, position, keyEncoded, hashOrEndIndex)) >= 0) {
    // Find where this parameter ends, either the '&' or the end of the
    // query parameters.
    position = uri.indexOf('&', foundIndex);
    if (position < 0 || position > hashOrEndIndex) {
      position = hashOrEndIndex;
    }

    // Progress forth to the end of the "key=" or "key&" substring.
    foundIndex += keyEncoded.length + 1;
    // Use substr, because it (unlike substring) will return empty string
    // if foundIndex > position.
    result.push(goog.string.urlDecode(uri.substr(
        foundIndex, position - foundIndex)));
  }

  return result;
};


/**
 * Regexp to find trailing question marks and ampersands.
 * @type {RegExp}
 * @private
 */
goog.uri.utils.trailingQueryPunctuationRe_ = /[?&]($|#)/;


/**
 * Removes all instances of a query parameter.
 * @param {string} uri The URI to process.  Must not contain a fragment.
 * @param {string} keyEncoded The URI-encoded key.
 * @return {string} The URI with all instances of the parameter removed.
 */
goog.uri.utils.removeParam = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var position = 0;
  var foundIndex;
  var buffer = [];

  // Look for a query parameter.
  while ((foundIndex = goog.uri.utils.findParam_(
      uri, position, keyEncoded, hashOrEndIndex)) >= 0) {
    // Get the portion of the query string up to, but not including, the ?
    // or & starting the parameter.
    buffer.push(uri.substring(position, foundIndex));
    // Progress to immediately after the '&'.  If not found, go to the end.
    // Avoid including the hash mark.
    position = Math.min((uri.indexOf('&', foundIndex) + 1) || hashOrEndIndex,
        hashOrEndIndex);
  }

  // Append everything that is remaining.
  buffer.push(uri.substr(position));

  // Join the buffer, and remove trailing punctuation that remains.
  return buffer.join('').replace(
      goog.uri.utils.trailingQueryPunctuationRe_, '$1');
};


/**
 * Replaces all existing definitions of a parameter with a single definition.
 *
 * Repeated calls to this can exhibit quadratic behavior in IE6 due to the
 * way string append works, though it should be limited given the 2kb limit.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {string} keyEncoded The key, which must already be URI encoded.
 * @param {*} value The value, which will be stringized and encoded (assumed
 *     not already to be encoded).
 * @return {string} The URI with the query parameter added.
 */
goog.uri.utils.setParam = function(uri, keyEncoded, value) {
  return goog.uri.utils.appendParam(
      goog.uri.utils.removeParam(uri, keyEncoded), keyEncoded, value);
};


/**
 * Generates a URI path using a given URI and a path with checks to
 * prevent consecutive "//". The baseUri passed in must not contain
 * query or fragment identifiers. The path to append may not contain query or
 * fragment identifiers.
 *
 * @param {string} baseUri URI to use as the base.
 * @param {string} path Path to append.
 * @return {string} Updated URI.
 */
goog.uri.utils.appendPath = function(baseUri, path) {
  goog.uri.utils.assertNoFragmentsOrQueries_(baseUri);

  // Remove any trailing '/'
  if (goog.string.endsWith(baseUri, '/')) {
    baseUri = baseUri.substr(0, baseUri.length - 1);
  }
  // Remove any leading '/'
  if (goog.string.startsWith(path, '/')) {
    path = path.substr(1);
  }
  return goog.string.buildString(baseUri, '/', path);
};


/**
 * Standard supported query parameters.
 * @enum {string}
 */
goog.uri.utils.StandardQueryParam = {

  /** Unused parameter for unique-ifying. */
  RANDOM: 'zx'
};


/**
 * Sets the zx parameter of a URI to a random value.
 * @param {string} uri Any URI.
 * @return {string} That URI with the "zx" parameter added or replaced to
 *     contain a random string.
 */
goog.uri.utils.makeUnique = function(uri) {
  return goog.uri.utils.setParam(uri,
      goog.uri.utils.StandardQueryParam.RANDOM, goog.string.getRandomString());
};
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview File which defines dummy object to work around undefined
 * properties compiler warning for weak dependencies on
 * {@link goog.debug.ErrorHandler#protectEntryPoint}.
 *
 */

goog.provide('goog.debug.errorHandlerWeakDep');


/**
 * Dummy object to work around undefined properties compiler warning.
 * @type {Object}
 */
goog.debug.errorHandlerWeakDep = {
  /**
   * @param {Function} fn An entry point function to be protected.
   * @param {boolean=} opt_tracers Whether to install tracers around the
   *     fn.
   * @return {Function} A protected wrapper function that calls the
   *     entry point function.
   */
  protectEntryPoint: function(fn, opt_tracers) { return fn; }
};
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
 * @fileoverview Rendering engine detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For information on the browser brand (such as Safari versus Chrome), see
 * goog.userAgent.product.
 * @see ../demos/useragent.html
 */

goog.provide('goog.userAgent');

goog.require('goog.string');


/**
 * @define {boolean} Whether we know at compile-time that the browser is IE.
 */
goog.userAgent.ASSUME_IE = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is GECKO.
 */
goog.userAgent.ASSUME_GECKO = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is WEBKIT.
 */
goog.userAgent.ASSUME_WEBKIT = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is a
 *     mobile device running WebKit e.g. iPhone or Android.
 */
goog.userAgent.ASSUME_MOBILE_WEBKIT = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is OPERA.
 */
goog.userAgent.ASSUME_OPERA = false;


/**
 * Whether we know the browser engine at compile-time.
 * @type {boolean}
 * @private
 */
goog.userAgent.BROWSER_KNOWN_ =
    goog.userAgent.ASSUME_IE ||
    goog.userAgent.ASSUME_GECKO ||
    goog.userAgent.ASSUME_MOBILE_WEBKIT ||
    goog.userAgent.ASSUME_WEBKIT ||
    goog.userAgent.ASSUME_OPERA;


/**
 * Returns the userAgent string for the current browser.
 * Some user agents (I'm thinking of you, Gears WorkerPool) do not expose a
 * navigator object off the global scope.  In that case we return null.
 *
 * @return {?string} The userAgent string or null if there is none.
 */
goog.userAgent.getUserAgentString = function() {
  return goog.global['navigator'] ? goog.global['navigator'].userAgent : null;
};


/**
 * @return {Object} The native navigator object.
 */
goog.userAgent.getNavigator = function() {
  // Need a local navigator reference instead of using the global one,
  // to avoid the rare case where they reference different objects.
  // (goog.gears.FakeWorkerPool, for example).
  return goog.global['navigator'];
};


/**
 * Initializer for goog.userAgent.
 *
 * This is a named function so that it can be stripped via the jscompiler
 * option for stripping types.
 * @private
 */
goog.userAgent.init_ = function() {
  /**
   * Whether the user agent string denotes Opera.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedOpera_ = false;

  /**
   * Whether the user agent string denotes Internet Explorer. This includes
   * other browsers using Trident as its rendering engine. For example AOL
   * and Netscape 8
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedIe_ = false;

  /**
   * Whether the user agent string denotes WebKit. WebKit is the rendering
   * engine that Safari, Android and others use.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWebkit_ = false;

  /**
   * Whether the user agent string denotes a mobile device.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMobile_ = false;

  /**
   * Whether the user agent string denotes Gecko. Gecko is the rendering
   * engine used by Mozilla, Mozilla Firefox, Camino and many more.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedGecko_ = false;

  var ua;
  if (!goog.userAgent.BROWSER_KNOWN_ &&
      (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = ua.indexOf('Opera') == 0;
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ &&
        ua.indexOf('MSIE') != -1;
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ &&
        ua.indexOf('WebKit') != -1;
    // WebKit also gives navigator.product string equal to 'Gecko'.
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ &&
        ua.indexOf('Mobile') != -1;
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ &&
        !goog.userAgent.detectedWebkit_ && navigator.product == 'Gecko';
  }
};


if (!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_();
}


/**
 * Whether the user agent is Opera.
 * @type {boolean}
 */
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;


/**
 * Whether the user agent is Internet Explorer. This includes other browsers
 * using Trident as its rendering engine. For example AOL and Netscape 8
 * @type {boolean}
 */
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;


/**
 * Whether the user agent is Gecko. Gecko is the rendering engine used by
 * Mozilla, Mozilla Firefox, Camino and many more.
 * @type {boolean}
 */
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_GECKO :
    goog.userAgent.detectedGecko_;


/**
 * Whether the user agent is WebKit. WebKit is the rendering engine that
 * Safari, Android and others use.
 * @type {boolean}
 */
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT :
    goog.userAgent.detectedWebkit_;


/**
 * Whether the user agent is running on a mobile device.
 * @type {boolean}
 */
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT ||
                        goog.userAgent.detectedMobile_;


/**
 * Used while transitioning code to use WEBKIT instead.
 * @type {boolean}
 * @deprecated Use {@link goog.userAgent.product.SAFARI} instead.
 * TODO(nicksantos): Delete this from goog.userAgent.
 */
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;


/**
 * @return {string} the platform (operating system) the user agent is running
 *     on. Default to empty string because navigator.platform may not be defined
 *     (on Rhino, for example).
 * @private
 */
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || '';
};


/**
 * The platform (operating system) the user agent is running on. Default to
 * empty string because navigator.platform may not be defined (on Rhino, for
 * example).
 * @type {string}
 */
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();


/**
 * @define {boolean} Whether the user agent is running on a Macintosh operating
 *     system.
 */
goog.userAgent.ASSUME_MAC = false;


/**
 * @define {boolean} Whether the user agent is running on a Windows operating
 *     system.
 */
goog.userAgent.ASSUME_WINDOWS = false;


/**
 * @define {boolean} Whether the user agent is running on a Linux operating
 *     system.
 */
goog.userAgent.ASSUME_LINUX = false;


/**
 * @define {boolean} Whether the user agent is running on a X11 windowing
 *     system.
 */
goog.userAgent.ASSUME_X11 = false;


/**
 * @type {boolean}
 * @private
 */
goog.userAgent.PLATFORM_KNOWN_ =
    goog.userAgent.ASSUME_MAC ||
    goog.userAgent.ASSUME_WINDOWS ||
    goog.userAgent.ASSUME_LINUX ||
    goog.userAgent.ASSUME_X11;


/**
 * Initialize the goog.userAgent constants that define which platform the user
 * agent is running on.
 * @private
 */
goog.userAgent.initPlatform_ = function() {
  /**
   * Whether the user agent is running on a Macintosh operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Mac');

  /**
   * Whether the user agent is running on a Windows operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWindows_ = goog.string.contains(
      goog.userAgent.PLATFORM, 'Win');

  /**
   * Whether the user agent is running on a Linux operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Linux');

  /**
   * Whether the user agent is running on a X11 windowing system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() &&
      goog.string.contains(goog.userAgent.getNavigator()['appVersion'] || '',
          'X11');
};


if (!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_();
}


/**
 * Whether the user agent is running on a Macintosh operating system.
 * @type {boolean}
 */
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;


/**
 * Whether the user agent is running on a Windows operating system.
 * @type {boolean}
 */
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;


/**
 * Whether the user agent is running on a Linux operating system.
 * @type {boolean}
 */
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;


/**
 * Whether the user agent is running on a X11 windowing system.
 * @type {boolean}
 */
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;


/**
 * @return {string} The string that describes the version number of the user
 *     agent.
 * @private
 */
goog.userAgent.determineVersion_ = function() {
  // All browsers have different ways to detect the version and they all have
  // different naming schemes.

  // version is a string rather than a number because it may contain 'b', 'a',
  // and so on.
  var version = '', re;

  if (goog.userAgent.OPERA && goog.global['opera']) {
    var operaVersion = goog.global['opera'].version;
    version = typeof operaVersion == 'function' ? operaVersion() : operaVersion;
  } else {
    if (goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/;
    } else if (goog.userAgent.IE) {
      re = /MSIE\s+([^\);]+)(\)|;)/;
    } else if (goog.userAgent.WEBKIT) {
      // WebKit/125.4
      re = /WebKit\/(\S+)/;
    }
    if (re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : '';
    }
  }
  if (goog.userAgent.IE) {
    // IE9 can be in document mode 9 but be reporting an inconsistent user agent
    // version.  If it is identifying as a version lower than 9 we take the
    // documentMode as the version instead.  IE8 has similar behavior.
    // It is recommended to set the X-UA-Compatible header to ensure that IE9
    // uses documentMode 9.
    var docMode = goog.userAgent.getDocumentMode_();
    if (docMode > parseFloat(version)) {
      return String(docMode);
    }
  }
  return version;
};


/**
 * @return {number|undefined} Returns the document mode (for testing).
 * @private
 */
goog.userAgent.getDocumentMode_ = function() {
  // NOTE(user): goog.userAgent may be used in context where there is no DOM.
  var doc = goog.global['document'];
  return doc ? doc['documentMode'] : undefined;
};


/**
 * The version of the user agent. This is a string because it might contain
 * 'b' (as in beta) as well as multiple dots.
 * @type {string}
 */
goog.userAgent.VERSION = goog.userAgent.determineVersion_();


/**
 * Compares two version numbers.
 *
 * @param {string} v1 Version of first item.
 * @param {string} v2 Version of second item.
 *
 * @return {number}  1 if first argument is higher
 *                   0 if arguments are equal
 *                  -1 if second argument is higher.
 * @deprecated Use goog.string.compareVersions.
 */
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};


/**
 * Cache for {@link goog.userAgent.isVersion}. Calls to compareVersions are
 * surprisingly expensive and as a browsers version number is unlikely to change
 * during a session we cache the results.
 * @type {Object}
 * @private
 */
goog.userAgent.isVersionCache_ = {};


/**
 * Whether the user agent version is higher or the same as the given version.
 * NOTE: When checking the version numbers for Firefox and Safari, be sure to
 * use the engine's version, not the browser's version number.  For example,
 * Firefox 3.0 corresponds to Gecko 1.9 and Safari 3.0 to Webkit 522.11.
 * Opera and Internet Explorer versions match the product release number.<br>
 * @see <a href="http://en.wikipedia.org/wiki/Safari_version_history">
 *     Webkit</a>
 * @see <a href="http://en.wikipedia.org/wiki/Gecko_engine">Gecko</a>
 *
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 */
goog.userAgent.isVersion = function(version) {
  return goog.userAgent.isVersionCache_[version] ||
      (goog.userAgent.isVersionCache_[version] =
          goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0);
};


/**
 * Cache for {@link goog.userAgent.isDocumentMode}.
 * Browsers document mode version number is unlikely to change during a session
 * we cache the results.
 * @type {Object}
 * @private
 */
goog.userAgent.isDocumentModeCache_ = {};


/**
 * Whether the IE effective document mode is higher or the same as the given
 * document mode version.
 * NOTE: Only for IE, return false for another browser.
 *
 * @param {number} documentMode The document mode version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *     same as the given version.
 */
goog.userAgent.isDocumentMode = function(documentMode) {
  return goog.userAgent.isDocumentModeCache_[documentMode] ||
      (goog.userAgent.isDocumentModeCache_[documentMode] = goog.userAgent.IE &&
      document.documentMode && document.documentMode >= documentMode);
};
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Listener object.
 * @see ../demos/events.html
 */


/**
 * Namespace for events
 */
goog.provide('goog.events.Listener');



/**
 * Simple class that stores information about a listener
 * @constructor
 */
goog.events.Listener = function() {
};


/**
 * Counter used to create a unique key
 * @type {number}
 * @private
 */
goog.events.Listener.counter_ = 0;


/**
 * Whether the listener is a function or an object that implements handleEvent.
 * @type {boolean}
 * @private
 */
goog.events.Listener.prototype.isFunctionListener_;


/**
 * Call back function or an object with a handleEvent function.
 * @type {Function|Object|null}
 */
goog.events.Listener.prototype.listener;


/**
 * Proxy for callback that passes through {@link goog.events#HandleEvent_}
 * @type {Function}
 */
goog.events.Listener.prototype.proxy;


/**
 * Object or node that callback is listening to
 * @type {Object|goog.events.EventTarget}
 */
goog.events.Listener.prototype.src;


/**
 * Type of event
 * @type {string}
 */
goog.events.Listener.prototype.type;


/**
 * Whether the listener is being called in the capture or bubble phase
 * @type {boolean}
 */
goog.events.Listener.prototype.capture;


/**
 * Optional object whose context to execute the listener in
 * @type {Object|undefined}
 */
goog.events.Listener.prototype.handler;


/**
 * The key of the listener.
 * @type {number}
 */
goog.events.Listener.prototype.key = 0;


/**
 * Whether the listener has been removed.
 * @type {boolean}
 */
goog.events.Listener.prototype.removed = false;


/**
 * Whether to remove the listener after it has been called.
 * @type {boolean}
 */
goog.events.Listener.prototype.callOnce = false;


/**
 * Initializes the listener.
 * @param {Function|Object} listener Callback function, or an object with a
 *     handleEvent function.
 * @param {Function} proxy Wrapper for the listener that patches the event.
 * @param {Object} src Source object for the event.
 * @param {string} type Event type.
 * @param {boolean} capture Whether in capture or bubble phase.
 * @param {Object=} opt_handler Object in whose context to execute the callback.
 */
goog.events.Listener.prototype.init = function(listener, proxy, src, type,
                                               capture, opt_handler) {
  // we do the test of the listener here so that we do  not need to
  // continiously do this inside handleEvent
  if (goog.isFunction(listener)) {
    this.isFunctionListener_ = true;
  } else if (listener && listener.handleEvent &&
      goog.isFunction(listener.handleEvent)) {
    this.isFunctionListener_ = false;
  } else {
    throw Error('Invalid listener argument');
  }

  this.listener = listener;
  this.proxy = proxy;
  this.src = src;
  this.type = type;
  this.capture = !!capture;
  this.handler = opt_handler;
  this.callOnce = false;
  this.key = ++goog.events.Listener.counter_;
  this.removed = false;
};


/**
 * Calls the internal listener
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} The result of the internal listener call.
 */
goog.events.Listener.prototype.handleEvent = function(eventObject) {
  if (this.isFunctionListener_) {
    return this.listener.call(this.handler || this.src, eventObject);
  }
  return this.listener.handleEvent.call(this.listener, eventObject);
};
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
 * @fileoverview Utilities for manipulating objects/maps/hashes.
 */

goog.provide('goog.object');


/**
 * Calls a function for each element in an object/map/hash.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object)
 *     and the return value is irrelevant.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 */
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call(opt_obj, obj[key], key, obj);
  }
};


/**
 * Calls a function for each element in an object/map/hash. If that call returns
 * true, adds the element to a new object.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This
 *     function takes 3 arguments (the element, the index and the object)
 *     and should return a boolean. If the return value is true the
 *     element is added to the result object. If it is false the
 *     element is not included.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {!Object} a new object in which only elements that passed the test
 *     are present.
 */
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};


/**
 * For every element in an object/map/hash calls a function and inserts the
 * result into a new object.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object)
 *     and should return something. The result will be inserted
 *     into a new object.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {!Object} a new object with the results from f.
 */
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj);
  }
  return res;
};


/**
 * Calls a function for each element in an object/map/hash. If any
 * call returns true, returns true (without checking the rest). If
 * all calls return false, returns false.
 *
 * @param {Object} obj The object to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} true if any element passes the test.
 */
goog.object.some = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      return true;
    }
  }
  return false;
};


/**
 * Calls a function for each element in an object/map/hash. If
 * all calls return true, returns true. If any call returns false, returns
 * false at this point and does not continue to check the remaining elements.
 *
 * @param {Object} obj The object to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} false if any element fails the test.
 */
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call(opt_obj, obj[key], key, obj)) {
      return false;
    }
  }
  return true;
};


/**
 * Returns the number of key-value pairs in the object map.
 *
 * @param {Object} obj The object for which to get the number of key-value
 *     pairs.
 * @return {number} The number of key-value pairs in the object map.
 */
goog.object.getCount = function(obj) {
  // JS1.5 has __count__ but it has been deprecated so it raises a warning...
  // in other words do not use. Also __count__ only includes the fields on the
  // actual object and not in the prototype chain.
  var rv = 0;
  for (var key in obj) {
    rv++;
  }
  return rv;
};


/**
 * Returns one key from the object map, if any exists.
 * For map literals the returned key will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object} obj The object to pick a key from.
 * @return {string|undefined} The key or undefined if the object is empty.
 */
goog.object.getAnyKey = function(obj) {
  for (var key in obj) {
    return key;
  }
};


/**
 * Returns one value from the object map, if any exists.
 * For map literals the returned value will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object} obj The object to pick a value from.
 * @return {*} The value or undefined if the object is empty.
 */
goog.object.getAnyValue = function(obj) {
  for (var key in obj) {
    return obj[key];
  }
};


/**
 * Whether the object/hash/map contains the given object as a value.
 * An alias for goog.object.containsValue(obj, val).
 *
 * @param {Object} obj The object in which to look for val.
 * @param {*} val The object for which to check.
 * @return {boolean} true if val is present.
 */
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};


/**
 * Returns the values of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the values.
 * @return {!Array} The values in the object/map/hash.
 */
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};


/**
 * Returns the keys of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the keys.
 * @return {!Array.<string>} Array of property keys.
 */
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = key;
  }
  return res;
};


/**
 * Get a value from an object multiple levels deep.  This is useful for
 * pulling values from deeply nested objects, such as JSON responses.
 * Example usage: getValueByKeys(jsonObj, 'foo', 'entries', 3)
 *
 * @param {!Object} obj An object to get the value from.  Can be array-like.
 * @param {...(string|number|!Array.<number|string>)} var_args A number of keys
 *     (as strings, or nubmers, for array-like objects).  Can also be
 *     specified as a single array of keys.
 * @return {*} The resulting value.  If, at any point, the value for a key
 *     is undefined, returns undefined.
 */
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;

  // Start with the 2nd parameter for the variable parameters syntax.
  for (var i = isArrayLike ? 0 : 1; i < keys.length; i++) {
    obj = obj[keys[i]];
    if (!goog.isDef(obj)) {
      break;
    }
  }

  return obj;
};


/**
 * Whether the object/map/hash contains the given key.
 *
 * @param {Object} obj The object in which to look for key.
 * @param {*} key The key for which to check.
 * @return {boolean} true If the map contains the key.
 */
goog.object.containsKey = function(obj, key) {
  return key in obj;
};


/**
 * Whether the object/map/hash contains the given value. This is O(n).
 *
 * @param {Object} obj The object in which to look for val.
 * @param {*} val The value for which to check.
 * @return {boolean} true If the map contains the value.
 */
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its key.
 * @param {Object} obj The object to search in.
 * @param {function(*, string, Object): boolean} f The function to call for
 *     every element. Takes 3 arguments (the value, the key and the object) and
 *     should return a boolean.
 * @param {Object=} opt_this An optional "this" context for the function.
 * @return {string|undefined} The key of an element for which the function
 *     returns true or undefined if no such element is found.
 */
goog.object.findKey = function(obj, f, opt_this) {
  for (var key in obj) {
    if (f.call(opt_this, obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its value.
 * @param {Object} obj The object to search in.
 * @param {function(*, string, Object): boolean} f The function to call for
 *     every element. Takes 3 arguments (the value, the key and the object) and
 *     should return a boolean.
 * @param {Object=} opt_this An optional "this" context for the function.
 * @return {*} The value of an element for which the function returns true or
 *     undefined if no such element is found.
 */
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key];
};


/**
 * Whether the object/map/hash is empty.
 *
 * @param {Object} obj The object to test.
 * @return {boolean} true if obj is empty.
 */
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
};


/**
 * Removes all key value pairs from the object/map/hash.
 *
 * @param {Object} obj The object to clear.
 */
goog.object.clear = function(obj) {
  for (var i in obj) {
    delete obj[i];
  }
};


/**
 * Removes a key-value pair based on the key.
 *
 * @param {Object} obj The object from which to remove the key.
 * @param {*} key The key to remove.
 * @return {boolean} Whether an element was removed.
 */
goog.object.remove = function(obj, key) {
  var rv;
  if ((rv = key in obj)) {
    delete obj[key];
  }
  return rv;
};


/**
 * Adds a key-value pair to the object. Throws an exception if the key is
 * already in use. Use set if you want to change an existing pair.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} val The value to add.
 */
goog.object.add = function(obj, key, val) {
  if (key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};


/**
 * Returns the value for the given key.
 *
 * @param {Object} obj The object from which to get the value.
 * @param {string} key The key for which to get the value.
 * @param {*=} opt_val The value to return if no item is found for the given
 *     key (default is undefined).
 * @return {*} The value for the given key.
 */
goog.object.get = function(obj, key, opt_val) {
  if (key in obj) {
    return obj[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the object/map/hash.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} value The value to add.
 */
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};


/**
 * Adds a key-value pair to the object/map/hash if it doesn't exist yet.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} value The value to add if the key wasn't present.
 * @return {*} The value of the entry at the end of the function.
 */
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : (obj[key] = value);
};


/**
 * Does a flat clone of the object.
 *
 * @param {Object} obj Object to clone.
 * @return {!Object} Clone of the input object.
 */
goog.object.clone = function(obj) {
  // We cannot use the prototype trick because a lot of methods depend on where
  // the actual key is set.

  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
  // We could also use goog.mixin but I wanted this to be independent from that.
};


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.object.unsafeClone</code> does not detect reference loops. Objects
 * that refer to themselves will cause infinite recursion.
 *
 * <code>goog.object.unsafeClone</code> is unaware of unique identifiers, and
 * copies UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 */
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * Returns a new object in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * @param {Object} obj The object to transpose.
 * @return {!Object} The transposed object.
 */
goog.object.transpose = function(obj) {
  var transposed = {};
  for (var key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};


/**
 * The names of the fields that are defined on Object.prototype.
 * @type {Array.<string>}
 * @private
 */
goog.object.PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * Example:
 * var o = {};
 * goog.object.extend(o, {a: 0, b: 1});
 * o; // {a: 0, b: 1}
 * goog.object.extend(o, {c: 2});
 * o; // {a: 0, b: 1, c: 2}
 *
 * @param {Object} target  The object to modify.
 * @param {...Object} var_args The objects from which values will be copied.
 */
goog.object.extend = function(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }

    // For IE the for-in-loop does not contain any properties that are not
    // enumerable on the prototype object (for example isPrototypeOf from
    // Object.prototype) and it will also not include 'replace' on objects that
    // extend String and change 'replace' (not that it is common for anyone to
    // extend anything except Object).

    for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
};


/**
 * Creates a new object built from the key-value pairs provided as arguments.
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise even arguments are used as
 *     the property names and odd arguments are used as the property values.
 * @return {!Object} The new object.
 * @throws {Error} If there are uneven number of arguments or there is only one
 *     non array argument.
 */
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }

  if (argLength % 2) {
    throw Error('Uneven number of arguments');
  }

  var rv = {};
  for (var i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};


/**
 * Creates a new object where the property names come from the arguments but
 * the value is always set to true
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise the arguments are used
 *     as the property names.
 * @return {!Object} The new object.
 */
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0]);
  }

  var rv = {};
  for (var i = 0; i < argLength; i++) {
    rv[arguments[i]] = true;
  }
  return rv;
};
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Browser capability checks for the events package.
 *
 */


goog.provide('goog.events.BrowserFeature');

goog.require('goog.userAgent');


/**
 * Enum of browser capabilities.
 * @enum {boolean}
 */
goog.events.BrowserFeature = {
  /**
   * Whether the button attribute of the event is W3C compliant.  False in
   * Internet Explorer prior to version 9; document-version dependent.
   */
  HAS_W3C_BUTTON: !goog.userAgent.IE || goog.userAgent.isDocumentMode(9),

  /**
   * Whether the browser supports full W3C event model.
   */
  HAS_W3C_EVENT_SUPPORT: !goog.userAgent.IE || goog.userAgent.isDocumentMode(9),

  /**
   * To prevent default in IE7 for certain keydown events we need set the
   * keyCode to -1.
   */
  SET_KEY_CODE_TO_PREVENT_DEFAULT: goog.userAgent.IE &&
      !goog.userAgent.isVersion('8')
};
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
 * @fileoverview Utilities for manipulating arrays.
 *
 */


goog.provide('goog.array');
goog.provide('goog.array.ArrayLike');

goog.require('goog.asserts');


/**
 * @define {boolean} NATIVE_ARRAY_PROTOTYPES indicates whether the code should
 * rely on Array.prototype functions, if available.
 *
 * The Array.prototype functions can be defined by external libraries like
 * Prototype and setting this flag to false forces closure to use its own
 * goog.array implementation.
 *
 * If your javascript can be loaded by a third party site and you are wary about
 * relying on the prototype functions, specify
 * "--define goog.NATIVE_ARRAY_PROTOTYPES=false" to the JSCompiler.
 */
goog.NATIVE_ARRAY_PROTOTYPES = true;


/**
 * @typedef {Array|NodeList|Arguments|{length: number}}
 */
goog.array.ArrayLike;


/**
 * Returns the last element in an array without removing it.
 * @param {goog.array.ArrayLike} array The array.
 * @return {*} Last item in array.
 */
goog.array.peek = function(array) {
  return array[array.length - 1];
};


/**
 * Reference to the original {@code Array.prototype}.
 * @private
 */
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;


// NOTE(user): Since most of the array functions are generic it allows you to
// pass an array-like object. Strings have a length and are considered array-
// like. However, the 'in' operator does not work on strings so we cannot just
// use the array path even if the browser supports indexing into strings. We
// therefore end up splitting the string.


/**
 * Returns the index of the first element of an array with a specified
 * value, or -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-indexof}
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} obj The object for which we are searching.
 * @param {number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at index 0.
 * @return {number} The index of the first matching array element.
 */
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                     goog.array.ARRAY_PROTOTYPE_.indexOf ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ?
          0 : (opt_fromIndex < 0 ?
               Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex);

      if (goog.isString(arr)) {
        // Array.prototype.indexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.indexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i < arr.length; i++) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };


/**
 * Returns the index of the last element of an array with a specified value, or
 * -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-lastindexof}
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} obj The object for which we are searching.
 * @param {?number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at the end of the array.
 * @return {number} The index of the last matching array element.
 */
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                         goog.array.ARRAY_PROTOTYPE_.lastIndexOf ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);

      // Firefox treats undefined and null as 0 in the fromIndex argument which
      // leads it to always return -1
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
      return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;

      if (fromIndex < 0) {
        fromIndex = Math.max(0, arr.length + fromIndex);
      }

      if (goog.isString(arr)) {
        // Array.prototype.lastIndexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.lastIndexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i >= 0; i--) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };


/**
 * Calls a function for each element in an array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-foreach}
 *
 * @param {goog.array.ArrayLike} arr Array or array like object over
 *     which to iterate.
 * @param {?function(this: T, ...)} f The function to call for every element.
 *     This function takes 3 arguments (the element, the index and the array).
 *     The return value is ignored. The function is called only for indexes of
 *     the array which have assigned values; it is not called for indexes which
 *     have been deleted or which have never been assigned values.
 * @param {T=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @template T
 */
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES &&
                     goog.array.ARRAY_PROTOTYPE_.forEach ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          f.call(opt_obj, arr2[i], i, arr);
        }
      }
    };


/**
 * Calls a function for each element in an array, starting from the last
 * element rather than the first.
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array). The return
 *     value is ignored.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 */
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; --i) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};


/**
 * Calls a function for each element in an array, and if the function returns
 * true adds the element to a new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-filter}
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array in which only elements that passed the test are
 *     present.
 */
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES &&
                    goog.array.ARRAY_PROTOTYPE_.filter ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = [];
      var resLength = 0;
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          var val = arr2[i];  // in case f mutates arr2
          if (f.call(opt_obj, val, i, arr)) {
            res[resLength++] = val;
          }
        }
      }
      return res;
    };


/**
 * Calls a function for each element in an array and inserts the result into a
 * new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-map}
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return something. The result will be inserted into a new array.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array with the results from f.
 */
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES &&
                 goog.array.ARRAY_PROTOTYPE_.map ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = new Array(l);
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          res[i] = f.call(opt_obj, arr2[i], i, arr);
        }
      }
      return res;
    };


/**
 * Passes every element of an array into a function and accumulates the result.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduce}
 *
 * For example:
 * var a = [1, 2, 3, 4];
 * goog.array.reduce(a, function(r, v, i, arr) {return r + v;}, 0);
 * returns 10
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {*} val The initial value to pass into the function on the first call.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {*} Result of evaluating f repeatedly across the values of the array.
 */
goog.array.reduce = function(arr, f, val, opt_obj) {
  if (arr.reduce) {
    if (opt_obj) {
      return arr.reduce(goog.bind(f, opt_obj), val);
    } else {
      return arr.reduce(f, val);
    }
  }
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};


/**
 * Passes every element of an array into a function and accumulates the result,
 * starting from the last element and working towards the first.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduceright}
 *
 * For example:
 * var a = ['a', 'b', 'c'];
 * goog.array.reduceRight(a, function(r, v, i, arr) {return r + v;}, '');
 * returns 'cba'
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {*} val The initial value to pass into the function on the first call.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {*} Object returned as a result of evaluating f repeatedly across the
 *     values of the array.
 */
goog.array.reduceRight = function(arr, f, val, opt_obj) {
  if (arr.reduceRight) {
    if (opt_obj) {
      return arr.reduceRight(goog.bind(f, opt_obj), val);
    } else {
      return arr.reduceRight(f, val);
    }
  }
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};


/**
 * Calls f for each element of an array. If any call returns true, some()
 * returns true (without checking the remaining elements). If all calls
 * return false, some() returns false.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-some}
 *
 * @param {goog.array.ArrayLike} arr The array to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} true if any element passes the test.
 */
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES &&
                  goog.array.ARRAY_PROTOTYPE_.some ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
          return true;
        }
      }
      return false;
    };


/**
 * Call f for each element of an array. If all calls return true, every()
 * returns true. If any call returns false, every() returns false and
 * does not continue to check the remaining elements.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-every}
 *
 * @param {goog.array.ArrayLike} arr The array to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} false if any element fails the test.
 */
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES &&
                   goog.array.ARRAY_PROTOTYPE_.every ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
          return false;
        }
      }
      return true;
    };


/**
 * Search an array for the first element that satisfies a given condition and
 * return that element.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {*} The first array element that passes the test, or null if no
 *     element is found.
 */
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array for the first element that satisfies a given condition and
 * return its index.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the first array element that passes the test,
 *     or -1 if no element is found.
 */
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = 0; i < l; i++) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return that element.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {*} The last array element that passes the test, or null if no
 *     element is found.
 */
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return its index.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the last array element that passes the test,
 *     or -1 if no element is found.
 */
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; i--) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Whether the array contains the given object.
 * @param {goog.array.ArrayLike} arr The array to test for the presence of the
 *     element.
 * @param {*} obj The object for which to test.
 * @return {boolean} true if obj is present.
 */
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0;
};


/**
 * Whether the array is empty.
 * @param {goog.array.ArrayLike} arr The array to test.
 * @return {boolean} true if empty.
 */
goog.array.isEmpty = function(arr) {
  return arr.length == 0;
};


/**
 * Clears the array.
 * @param {goog.array.ArrayLike} arr Array or array like object to clear.
 */
goog.array.clear = function(arr) {
  // For non real arrays we don't have the magic length so we delete the
  // indices.
  if (!goog.isArray(arr)) {
    for (var i = arr.length - 1; i >= 0; i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};


/**
 * Pushes an item into an array, if it's not already in the array.
 * @param {Array} arr Array into which to insert the item.
 * @param {*} obj Value to add.
 */
goog.array.insert = function(arr, obj) {
  if (!goog.array.contains(arr, obj)) {
    arr.push(obj);
  }
};


/**
 * Inserts an object at the given index of the array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {*} obj The object to insert.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj);
};


/**
 * Inserts at the given index of the array, all elements of another array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {goog.array.ArrayLike} elementsToAdd The array of elements to add.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd);
};


/**
 * Inserts an object into an array before a specified object.
 * @param {Array} arr The array to modify.
 * @param {*} obj The object to insert.
 * @param {*=} opt_obj2 The object before which obj should be inserted. If obj2
 *     is omitted or not found, obj is inserted at the end of the array.
 */
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if (arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj);
  } else {
    goog.array.insertAt(arr, obj, i);
  }
};


/**
 * Removes the first occurrence of a particular value from an array.
 * @param {goog.array.ArrayLike} arr Array from which to remove value.
 * @param {*} obj Object to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if ((rv = i >= 0)) {
    goog.array.removeAt(arr, i);
  }
  return rv;
};


/**
 * Removes from an array the element at index i
 * @param {goog.array.ArrayLike} arr Array or array like object from which to
 *     remove value.
 * @param {number} i The index to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);

  // use generic form of splice
  // splice returns the removed items and if successful the length of that
  // will be 1
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1;
};


/**
 * Removes the first value that satisfies the given condition.
 * @param {goog.array.ArrayLike} arr Array from which to remove value.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {boolean} True if an element was removed.
 */
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if (i >= 0) {
    goog.array.removeAt(arr, i);
    return true;
  }
  return false;
};


/**
 * Returns a new array that is the result of joining the arguments.  If arrays
 * are passed then their items are added, however, if non-arrays are passed they
 * will be added to the return array as is.
 *
 * Note that ArrayLike objects will be added as is, rather than having their
 * items added.
 *
 * goog.array.concat([1, 2], [3, 4]) -> [1, 2, 3, 4]
 * goog.array.concat(0, [1, 2]) -> [0, 1, 2]
 * goog.array.concat([1, 2], null) -> [1, 2, null]
 *
 * There is bug in all current versions of IE (6, 7 and 8) where arrays created
 * in an iframe become corrupted soon (not immediately) after the iframe is
 * destroyed. This is common if loading data via goog.net.IframeIo, for example.
 * This corruption only affects the concat method which will start throwing
 * Catastrophic Errors (#-2147418113).
 *
 * See http://endoflow.com/scratch/corrupted-arrays.html for a test case.
 *
 * Internally goog.array should use this, so that all methods will continue to
 * work on these broken array objects.
 *
 * @param {...*} var_args Items to concatenate.  Arrays will have each item
 *     added, while primitives and objects will be added as is.
 * @return {!Array} The new resultant array.
 */
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(
      goog.array.ARRAY_PROTOTYPE_, arguments);
};


/**
 * Does a shallow copy of an array.
 * @param {goog.array.ArrayLike} arr  Array or array-like object to clone.
 * @return {!Array} Clone of the input array.
 */
goog.array.clone = function(arr) {
  if (goog.isArray(arr)) {
    return goog.array.concat(/** @type {!Array} */ (arr));
  } else { // array like
    // Concat does not work with non arrays.
    var rv = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      rv[i] = arr[i];
    }
    return rv;
  }
};


/**
 * Converts an object to an array.
 * @param {goog.array.ArrayLike} object  The object to convert to an array.
 * @return {!Array} The object converted into an array. If object has a
 *     length property, every property indexed with a non-negative number
 *     less than length will be included in the result. If object does not
 *     have a length property, an empty array will be returned.
 */
goog.array.toArray = function(object) {
  if (goog.isArray(object)) {
    // This fixes the JS compiler warning and forces the Object to an Array type
    return goog.array.concat(/** @type {!Array} */ (object));
  }
  // Clone what we hope to be an array-like object to an array.
  // We could check isArrayLike() first, but no check we perform would be as
  // reliable as simply making the call.
  return goog.array.clone(/** @type {Array} */ (object));
};


/**
 * Extends an array with another array, element, or "array like" object.
 * This function operates 'in-place', it does not create a new Array.
 *
 * Example:
 * var a = [];
 * goog.array.extend(a, [0, 1]);
 * a; // [0, 1]
 * goog.array.extend(a, 2);
 * a; // [0, 1, 2]
 *
 * @param {Array} arr1  The array to modify.
 * @param {...*} var_args The elements or arrays of elements to add to arr1.
 */
goog.array.extend = function(arr1, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var arr2 = arguments[i];
    // If we have an Array or an Arguments object we can just call push
    // directly.
    var isArrayLike;
    if (goog.isArray(arr2) ||
        // Detect Arguments. ES5 says that the [[Class]] of an Arguments object
        // is "Arguments" but only V8 and JSC/Safari gets this right. We instead
        // detect Arguments by checking for array like and presence of "callee".
        (isArrayLike = goog.isArrayLike(arr2)) &&
            // The getter for callee throws an exception in strict mode
            // according to section 10.6 in ES5 so check for presence instead.
            arr2.hasOwnProperty('callee')) {
      arr1.push.apply(arr1, arr2);

    } else if (isArrayLike) {
      // Otherwise loop over arr2 to prevent copying the object.
      var len1 = arr1.length;
      var len2 = arr2.length;
      for (var j = 0; j < len2; j++) {
        arr1[len1 + j] = arr2[j];
      }
    } else {
      arr1.push(arr2);
    }
  }
};


/**
 * Adds or removes elements from an array. This is a generic version of Array
 * splice. This means that it might work on other objects similar to arrays,
 * such as the arguments object.
 *
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {number|undefined} index The index at which to start changing the
 *     array. If not defined, treated as 0.
 * @param {number} howMany How many elements to remove (0 means no removal. A
 *     value below 0 is treated as zero and so is any other non number. Numbers
 *     are floored).
 * @param {...*} var_args Optional, additional elements to insert into the
 *     array.
 * @return {!Array} the removed elements.
 */
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);

  return goog.array.ARRAY_PROTOTYPE_.splice.apply(
      arr, goog.array.slice(arguments, 1));
};


/**
 * Returns a new array from a segment of an array. This is a generic version of
 * Array slice. This means that it might work on other objects similar to
 * arrays, such as the arguments object.
 *
 * @param {goog.array.ArrayLike} arr The array from which to copy a segment.
 * @param {number} start The index of the first element to copy.
 * @param {number=} opt_end The index after the last element to copy.
 * @return {!Array} A new array containing the specified segment of the original
 *     array.
 */
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);

  // passing 1 arg to slice is not the same as passing 2 where the second is
  // null or undefined (in that case the second argument is treated as 0).
  // we could use slice on the arguments object and then use apply instead of
  // testing the length
  if (arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start);
  } else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end);
  }
};


/**
 * Removes all duplicates from an array (retaining only the first
 * occurrence of each array element).  This function modifies the
 * array in place and doesn't change the order of the non-duplicate items.
 *
 * For objects, duplicates are identified as having the same unique ID as
 * defined by {@link goog.getUid}.
 *
 * Runtime: N,
 * Worstcase space: 2N (no dupes)
 *
 * @param {goog.array.ArrayLike} arr The array from which to remove duplicates.
 * @param {Array=} opt_rv An optional array in which to return the results,
 *     instead of performing the removal inplace.  If specified, the original
 *     array will remain unchanged.
 */
goog.array.removeDuplicates = function(arr, opt_rv) {
  var returnArray = opt_rv || arr;

  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while (cursorRead < arr.length) {
    var current = arr[cursorRead++];

    // Prefix each type with a single character representing the type to
    // prevent conflicting keys (e.g. true and 'true').
    var key = goog.isObject(current) ?
        'o' + goog.getUid(current) :
        (typeof current).charAt(0) + current;

    if (!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current;
    }
  }
  returnArray.length = cursorInsert;
};


/**
 * Searches the specified array for the specified target using the binary
 * search algorithm.  If no opt_compareFn is specified, elements are compared
 * using <code>goog.array.defaultCompare</code>, which compares the elements
 * using the built in < and > operators.  This will produce the expected
 * behavior for homogeneous arrays of String(s) and Number(s). The array
 * specified <b>must</b> be sorted in ascending order (as defined by the
 * comparison function).  If the array is not sorted, results are undefined.
 * If the array contains multiple instances of the specified target value, any
 * of these instances may be found.
 *
 * Runtime: O(log n)
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} target The sought value.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 */
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr,
      opt_compareFn || goog.array.defaultCompare, false /* isEvaluator */,
      target);
};


/**
 * Selects an index in the specified array using the binary search algorithm.
 * The evaluator receives an element and determines whether the desired index
 * is before, at, or after it.  The evaluator must be consistent (formally,
 * goog.array.map(goog.array.map(arr, evaluator, opt_obj), goog.math.sign)
 * must be monotonically non-increasing).
 *
 * Runtime: O(log n)
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {Function} evaluator Evaluator function that receives 3 arguments
 *     (the element, the index and the array). Should return a negative number,
 *     zero, or a positive number depending on whether the desired index is
 *     before, at, or after the element passed to it.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within evaluator.
 * @return {number} Index of the leftmost element matched by the evaluator, if
 *     such exists; otherwise (-(insertion point) - 1). The insertion point is
 *     the index of the first element for which the evaluator returns negative,
 *     or arr.length if no such element exists. The return value is non-negative
 *     iff a match is found.
 */
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true /* isEvaluator */,
      undefined /* opt_target */, opt_obj);
};


/**
 * Implementation of a binary search algorithm which knows how to use both
 * comparison functions and evaluators. If an evaluator is provided, will call
 * the evaluator with the given optional data object, conforming to the
 * interface defined in binarySelect. Otherwise, if a comparison function is
 * provided, will call the comparison function against the given data object.
 *
 * This implementation purposefully does not use goog.bind or goog.partial for
 * performance reasons.
 *
 * Runtime: O(log n)
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {Function} compareFn Either an evaluator or a comparison function,
 *     as defined by binarySearch and binarySelect above.
 * @param {boolean} isEvaluator Whether the function is an evaluator or a
 *     comparison function.
 * @param {*=} opt_target If the function is a comparison function, then this is
 *     the target to binary search for.
 * @param {Object=} opt_selfObj If the function is an evaluator, this is an
  *    optional this object for the evaluator.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 * @private
 */
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target,
    opt_selfObj) {
  var left = 0;  // inclusive
  var right = arr.length;  // exclusive
  var found;
  while (left < right) {
    var middle = (left + right) >> 1;
    var compareResult;
    if (isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr);
    } else {
      compareResult = compareFn(opt_target, arr[middle]);
    }
    if (compareResult > 0) {
      left = middle + 1;
    } else {
      right = middle;
      // We are looking for the lowest index so we can't return immediately.
      found = !compareResult;
    }
  }
  // left is the index if found, or the insertion point otherwise.
  // ~left is a shorthand for -left - 1.
  return found ? left : ~left;
};


/**
 * Sorts the specified array into ascending order.  If no opt_compareFn is
 * specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s), unlike the native sort,
 * but will give unpredictable results for heterogenous lists of strings and
 * numbers with different numbers of digits.
 *
 * This sort is not guaranteed to be stable.
 *
 * Runtime: Same as <code>Array.prototype.sort</code>
 *
 * @param {Array} arr The array to be sorted.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is to be ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 */
goog.array.sort = function(arr, opt_compareFn) {
  // TODO(user): Update type annotation since null is not accepted.
  goog.asserts.assert(arr.length != null);

  goog.array.ARRAY_PROTOTYPE_.sort.call(
      arr, opt_compareFn || goog.array.defaultCompare);
};


/**
 * Sorts the specified array into ascending order in a stable way.  If no
 * opt_compareFn is specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s).
 *
 * Runtime: Same as <code>Array.prototype.sort</code>, plus an additional
 * O(n) overhead of copying the array twice.
 *
 * @param {Array} arr The array to be sorted.
 * @param {function(*, *): number=} opt_compareFn Optional comparison function
 *     by which the array is to be ordered. Should take 2 arguments to compare,
 *     and return a negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 */
goog.array.stableSort = function(arr, opt_compareFn) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] = {index: i, value: arr[i]};
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index;
  };
  goog.array.sort(arr, stableCompareFn);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].value;
  }
};


/**
 * Sorts an array of objects by the specified object key and compare
 * function. If no compare function is provided, the key values are
 * compared in ascending order using <code>goog.array.defaultCompare</code>.
 * This won't work for keys that get renamed by the compiler. So use
 * {'foo': 1, 'bar': 2} rather than {foo: 1, bar: 2}.
 * @param {Array.<Object>} arr An array of objects to sort.
 * @param {string} key The object key to sort by.
 * @param {Function=} opt_compareFn The function to use to compare key
 *     values.
 */
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key]);
  });
};


/**
 * Tells if the array is sorted.
 * @param {!Array} arr The array.
 * @param {Function=} opt_compareFn Function to compare the array elements.
 *     Should take 2 arguments to compare, and return a negative number, zero,
 *     or a positive number depending on whether the first argument is less
 *     than, equal to, or greater than the second.
 * @param {boolean=} opt_strict If true no equal elements are allowed.
 * @return {boolean} Whether the array is sorted.
 */
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for (var i = 1; i < arr.length; i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if (compareResult > 0 || compareResult == 0 && opt_strict) {
      return false;
    }
  }
  return true;
};


/**
 * Compares two arrays for equality. Two arrays are considered equal if they
 * have the same length and their corresponding elements are equal according to
 * the comparison function.
 *
 * @param {goog.array.ArrayLike} arr1 The first array to compare.
 * @param {goog.array.ArrayLike} arr2 The second array to compare.
 * @param {Function=} opt_equalsFn Optional comparison function.
 *     Should take 2 arguments to compare, and return true if the arguments
 *     are equal. Defaults to {@link goog.array.defaultCompareEquality} which
 *     compares the elements using the built-in '===' operator.
 * @return {boolean} Whether the two arrays are equal.
 */
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if (!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) ||
      arr1.length != arr2.length) {
    return false;
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for (var i = 0; i < l; i++) {
    if (!equalsFn(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
};


/**
 * @deprecated Use {@link goog.array.equals}.
 * @param {goog.array.ArrayLike} arr1 See {@link goog.array.equals}.
 * @param {goog.array.ArrayLike} arr2 See {@link goog.array.equals}.
 * @param {Function=} opt_equalsFn See {@link goog.array.equals}.
 * @return {boolean} See {@link goog.array.equals}.
 */
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn);
};


/**
 * 3-way array compare function.
 * @param {!goog.array.ArrayLike} arr1 The first array to compare.
 * @param {!goog.array.ArrayLike} arr2 The second array to compare.
 * @param {(function(*, *): number)=} opt_compareFn Optional comparison function
 *     by which the array is to be ordered. Should take 2 arguments to compare,
 *     and return a negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @return {number} Negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 */
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for (var i = 0; i < l; i++) {
    var result = compare(arr1[i], arr2[i]);
    if (result != 0) {
      return result;
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length);
};


/**
 * Compares its two arguments for order, using the built in < and >
 * operators.
 * @param {*} a The first object to be compared.
 * @param {*} b The second object to be compared.
 * @return {number} A negative number, zero, or a positive number as the first
 *     argument is less than, equal to, or greater than the second.
 */
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};


/**
 * Compares its two arguments for equality, using the built in === operator.
 * @param {*} a The first object to compare.
 * @param {*} b The second object to compare.
 * @return {boolean} True if the two arguments are equal, false otherwise.
 */
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};


/**
 * Inserts a value into a sorted array. The array is not modified if the
 * value is already present.
 * @param {Array} array The array to modify.
 * @param {*} value The object to insert.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @return {boolean} True if an element was inserted.
 */
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if (index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true;
  }
  return false;
};


/**
 * Removes a value from a sorted array.
 * @param {Array} array The array to modify.
 * @param {*} value The object to remove.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @return {boolean} True if an element was removed.
 */
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return (index >= 0) ? goog.array.removeAt(array, index) : false;
};


/**
 * Splits an array into disjoint buckets according to a splitting function.
 * @param {Array} array The array.
 * @param {Function} sorter Function to call for every element.  This
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a valid object key (a string, number, etc), or undefined, if
 *     that object should not be placed in a bucket.
 * @return {!Object} An object, with keys being all of the unique return values
 *     of sorter, and values being arrays containing the items for
 *     which the splitter returned that key.
 */
goog.array.bucket = function(array, sorter) {
  var buckets = {};

  for (var i = 0; i < array.length; i++) {
    var value = array[i];
    var key = sorter(value, i, array);
    if (goog.isDef(key)) {
      // Push the value to the right bucket, creating it if necessary.
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value);
    }
  }

  return buckets;
};


/**
 * Returns an array consisting of the given value repeated N times.
 *
 * @param {*} value The value to repeat.
 * @param {number} n The repeat count.
 * @return {!Array.<*>} An array with the repeated value.
 */
goog.array.repeat = function(value, n) {
  var array = [];
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
};


/**
 * Returns an array consisting of every argument with all arrays
 * expanded in-place recursively.
 *
 * @param {...*} var_args The values to flatten.
 * @return {!Array.<*>} An array containing the flattened values.
 */
goog.array.flatten = function(var_args) {
  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element));
    } else {
      result.push(element);
    }
  }
  return result;
};


/**
 * Rotates an array in-place. After calling this method, the element at
 * index i will be the element previously at index (i - n) %
 * array.length, for all values of i between 0 and array.length - 1,
 * inclusive.
 *
 * For example, suppose list comprises [t, a, n, k, s]. After invoking
 * rotate(array, 1) (or rotate(array, -4)), array will comprise [s, t, a, n, k].
 *
 * @param {!Array.<*>} array The array to rotate.
 * @param {number} n The amount to rotate.
 * @return {!Array.<*>} The array.
 */
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);

  if (array.length) {
    n %= array.length;
    if (n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n));
    } else if (n < 0) {
      goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n));
    }
  }
  return array;
};


/**
 * Creates a new array for which the element at position i is an array of the
 * ith element of the provided arrays.  The returned array will only be as long
 * as the shortest array provided; additional values are ignored.  For example,
 * the result of zipping [1, 2] and [3, 4, 5] is [[1,3], [2, 4]].
 *
 * This is similar to the zip() function in Python.  See {@link
 * http://docs.python.org/library/functions.html#zip}
 *
 * @param {...!goog.array.ArrayLike} var_args Arrays to be combined.
 * @return {!Array.<!Array>} A new array of arrays created from provided arrays.
 */
goog.array.zip = function(var_args) {
  if (!arguments.length) {
    return [];
  }
  var result = [];
  for (var i = 0; true; i++) {
    var value = [];
    for (var j = 0; j < arguments.length; j++) {
      var arr = arguments[j];
      // If i is larger than the array length, this is the shortest array.
      if (i >= arr.length) {
        return result;
      }
      value.push(arr[i]);
    }
    result.push(value);
  }
};


/**
 * Shuffles the values in the specified array using the Fisher-Yates in-place
 * shuffle (also known as the Knuth Shuffle). By default, calls Math.random()
 * and so resets the state of that random number generator. Similarly, may reset
 * the state of the any other specified random number generator.
 *
 * Runtime: O(n)
 *
 * @param {!Array} arr The array to be shuffled.
 * @param {Function=} opt_randFn Optional random function to use for shuffling.
 *     Takes no arguments, and returns a random number on the interval [0, 1).
 *     Defaults to Math.random() using JavaScript's built-in Math library.
 */
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;

  for (var i = arr.length - 1; i > 0; i--) {
    // Choose a random array index in [0, i] (inclusive with i).
    var j = Math.floor(randFn() * (i + 1));

    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A global registry for entry points into a program,
 * so that they can be instrumented. Each module should register their
 * entry points with this registry. Designed to be compiled out
 * if no instrumentation is requested.
 *
 * Entry points may be registered before or after a call to
 * goog.debug.entryPointRegistry.monitorAll. If an entry point is registered
 * later, the existing monitor will instrument the new entry point.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.debug.EntryPointMonitor');
goog.provide('goog.debug.entryPointRegistry');

goog.require('goog.asserts');



/**
 * @interface
 */
goog.debug.EntryPointMonitor = function() {};


/**
 * Instruments a function.
 *
 * @param {!Function} fn A function to instrument.
 * @return {!Function} The instrumented function.
 */
goog.debug.EntryPointMonitor.prototype.wrap;


/**
 * Try to remove an instrumentation wrapper created by this monitor.
 * If the function passed to unwrap is not a wrapper created by this
 * monitor, then we will do nothing.
 *
 * Notice that some wrappers may not be unwrappable. For example, if other
 * monitors have applied their own wrappers, then it will be impossible to
 * unwrap them because their wrappers will have captured our wrapper.
 *
 * So it is important that entry points are unwrapped in the reverse
 * order that they were wrapped.
 *
 * @param {!Function} fn A function to unwrap.
 * @return {!Function} The unwrapped function, or {@code fn} if it was not
 *     a wrapped function created by this monitor.
 */
goog.debug.EntryPointMonitor.prototype.unwrap;


/**
 * An array of entry point callbacks.
 * @type {!Array.<function(!Function)>}
 * @private
 */
goog.debug.entryPointRegistry.refList_ = [];


/**
 * Monitors that should wrap all the entry points.
 * @type {!Array.<!goog.debug.EntryPointMonitor>}
 * @private
 */
goog.debug.entryPointRegistry.monitors_ = [];


/**
 * Whether goog.debug.entryPointRegistry.monitorAll has ever been called.
 * Checking this allows the compiler to optimize out the registrations.
 * @type {boolean}
 * @private
 */
goog.debug.entryPointRegistry.monitorsMayExist_ = false;


/**
 * Register an entry point with this module.
 *
 * The entry point will be instrumented when a monitor is passed to
 * goog.debug.entryPointRegistry.monitorAll. If this has already occurred, the
 * entry point is instrumented immediately.
 *
 * @param {function(!Function)} callback A callback function which is called
 *     with a transforming function to instrument the entry point. The callback
 *     is responsible for wrapping the relevant entry point with the
 *     transforming function.
 */
goog.debug.entryPointRegistry.register = function(callback) {
  // Don't use push(), so that this can be compiled out.
  goog.debug.entryPointRegistry.refList_[
      goog.debug.entryPointRegistry.refList_.length] = callback;
  // If no one calls monitorAll, this can be compiled out.
  if (goog.debug.entryPointRegistry.monitorsMayExist_) {
    var monitors = goog.debug.entryPointRegistry.monitors_;
    for (var i = 0; i < monitors.length; i++) {
      callback(goog.bind(monitors[i].wrap, monitors[i]));
    }
  }
};


/**
 * Configures a monitor to wrap all entry points.
 *
 * Entry points that have already been registered are immediately wrapped by
 * the monitor. When an entry point is registered in the future, it will also
 * be wrapped by the monitor when it is registered.
 *
 * @param {!goog.debug.EntryPointMonitor} monitor An entry point monitor.
 */
goog.debug.entryPointRegistry.monitorAll = function(monitor) {
  goog.debug.entryPointRegistry.monitorsMayExist_ = true;
  var transformer = goog.bind(monitor.wrap, monitor);
  for (var i = 0; i < goog.debug.entryPointRegistry.refList_.length; i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer);
  }
  goog.debug.entryPointRegistry.monitors_.push(monitor);
};


/**
 * Try to unmonitor all the entry points that have already been registered. If
 * an entry point is registered in the future, it will not be wrapped by the
 * monitor when it is registered. Note that this may fail if the entry points
 * have additional wrapping.
 *
 * @param {!goog.debug.EntryPointMonitor} monitor The last monitor to wrap
 *     the entry points.
 * @throws {Error} If the monitor is not the most recently configured monitor.
 */
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function(monitor) {
  var monitors = goog.debug.entryPointRegistry.monitors_;
  goog.asserts.assert(monitor == monitors[monitors.length - 1],
      'Only the most recent monitor can be unwrapped.');
  var transformer = goog.bind(monitor.unwrap, monitor);
  for (var i = 0; i < goog.debug.entryPointRegistry.refList_.length; i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer);
  }
  monitors.length--;
};
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Definition of the goog.events.EventWrapper interface.
 *
 */

goog.provide('goog.events.EventWrapper');



/**
 * Interface for event wrappers.
 * @interface
 */
goog.events.EventWrapper = function() {
};


/**
 * Adds an event listener using the wrapper on a DOM Node or an object that has
 * implemented {@link goog.events.EventTarget}. A listener can only be added
 * once to an object.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_scope Element in whose scope to call the listener.
 * @param {goog.events.EventHandler=} opt_eventHandler Event handler to add
 *     listener to.
 */
goog.events.EventWrapper.prototype.listen = function(src, listener, opt_capt,
    opt_scope, opt_eventHandler) {
};


/**
 * Removes an event listener added using goog.events.EventWrapper.listen.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to remove listener
 *    from.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_scope Element in whose scope to call the listener.
 * @param {goog.events.EventHandler=} opt_eventHandler Event handler to remove
 *     listener from.
 */
goog.events.EventWrapper.prototype.unlisten = function(src, listener, opt_capt,
    opt_scope, opt_eventHandler) {
};
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Event Types.
 *
 */


goog.provide('goog.events.EventType');

goog.require('goog.userAgent');


/**
 * Constants for event names.
 * @enum {string}
 */
goog.events.EventType = {
  // Mouse events
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  MOUSEDOWN: 'mousedown',
  MOUSEUP: 'mouseup',
  MOUSEOVER: 'mouseover',
  MOUSEOUT: 'mouseout',
  MOUSEMOVE: 'mousemove',
  SELECTSTART: 'selectstart', // IE, Safari, Chrome

  // Key events
  KEYPRESS: 'keypress',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',

  // Focus
  BLUR: 'blur',
  FOCUS: 'focus',
  DEACTIVATE: 'deactivate', // IE only
  // NOTE: The following two events are not stable in cross-browser usage.
  //     WebKit and Opera implement DOMFocusIn/Out.
  //     IE implements focusin/out.
  //     Gecko implements neither see bug at
  //     https://bugzilla.mozilla.org/show_bug.cgi?id=396927.
  // The DOM Events Level 3 Draft deprecates DOMFocusIn in favor of focusin:
  //     http://dev.w3.org/2006/webapi/DOM-Level-3-Events/html/DOM3-Events.html
  // You can use FOCUS in Capture phase until implementations converge.
  FOCUSIN: goog.userAgent.IE ? 'focusin' : 'DOMFocusIn',
  FOCUSOUT: goog.userAgent.IE ? 'focusout' : 'DOMFocusOut',

  // Forms
  CHANGE: 'change',
  SELECT: 'select',
  SUBMIT: 'submit',
  INPUT: 'input',
  PROPERTYCHANGE: 'propertychange', // IE only

  // Drag and drop
  DRAGSTART: 'dragstart',
  DRAGENTER: 'dragenter',
  DRAGOVER: 'dragover',
  DRAGLEAVE: 'dragleave',
  DROP: 'drop',

  // WebKit touch events.
  TOUCHSTART: 'touchstart',
  TOUCHMOVE: 'touchmove',
  TOUCHEND: 'touchend',
  TOUCHCANCEL: 'touchcancel',

  // Misc
  CONTEXTMENU: 'contextmenu',
  ERROR: 'error',
  HELP: 'help',
  LOAD: 'load',
  LOSECAPTURE: 'losecapture',
  READYSTATECHANGE: 'readystatechange',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  UNLOAD: 'unload',

  // HTML 5 History events
  // See http://www.w3.org/TR/html5/history.html#event-definitions
  HASHCHANGE: 'hashchange',
  PAGEHIDE: 'pagehide',
  PAGESHOW: 'pageshow',
  POPSTATE: 'popstate',

  // Copy and Paste
  // Support is limited. Make sure it works on your favorite browser
  // before using.
  // http://www.quirksmode.org/dom/events/cutcopypaste.html
  COPY: 'copy',
  PASTE: 'paste',
  CUT: 'cut',
  BEFORECOPY: 'beforecopy',
  BEFORECUT: 'beforecut',
  BEFOREPASTE: 'beforepaste',

  // HTML 5 worker events
  MESSAGE: 'message',
  CONNECT: 'connect',

  // CSS transition events. Based on the browser support described at:
  // https://developer.mozilla.org/en/css/css_transitions#Browser_compatibility
  TRANSITIONEND: goog.userAgent.WEBKIT ? 'webkitTransitionEnd' :
      (goog.userAgent.OPERA ? 'oTransitionEnd' : 'transitionend')
};
// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Definition of the disposable interface.  A disposable object
 * has a dispose method to to clean up references and resources.
 */


goog.provide('goog.disposable.IDisposable');



/**
 * Interface for a disposable object.  If a instance requires cleanup
 * (references COM objects, DOM notes, or other disposable objects), it should
 * implement this interface (it may subclass goog.Disposable).
 * @interface
 */
goog.disposable.IDisposable = function() {};


/**
 * Disposes of the object and its resources.
 * @return {void} Nothing.
 */
goog.disposable.IDisposable.prototype.dispose;


/**
 * @return {boolean} Whether the object has been disposed of.
 */
goog.disposable.IDisposable.prototype.isDisposed;
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Implements the disposable interface. The dispose method is used
 * to clean up references and resources.
 */


goog.provide('goog.Disposable');
goog.provide('goog.dispose');

goog.require('goog.disposable.IDisposable');



/**
 * Class that provides the basic implementation for disposable objects. If your
 * class holds one or more references to COM objects, DOM nodes, or other
 * disposable objects, it should extend this class or implement the disposable
 * interface (defined in goog.disposable.IDisposable).
 * @constructor
 * @implements {goog.disposable.IDisposable}
 */
goog.Disposable = function() {
  if (goog.Disposable.ENABLE_MONITORING) {
    goog.Disposable.instances_[goog.getUid(this)] = this;
  }
};


/**
 * @define {boolean} Whether to enable the monitoring of the goog.Disposable
 *     instances. Switching on the monitoring is only recommended for debugging
 *     because it has a significant impact on performance and memory usage.
 *     If switched off, the monitoring code compiles down to 0 bytes.
 *     The monitoring expects that all disposable objects call the
 *     {@code goog.Disposable} base constructor.
 */
goog.Disposable.ENABLE_MONITORING = false;


/**
 * Maps the unique ID of every undisposed {@code goog.Disposable} object to
 * the object itself.
 * @type {!Object.<number, !goog.Disposable>}
 * @private
 */
goog.Disposable.instances_ = {};


/**
 * @return {!Array.<!goog.Disposable>} All {@code goog.Disposable} objects that
 *     haven't been disposed of.
 */
goog.Disposable.getUndisposedObjects = function() {
  var ret = [];
  for (var id in goog.Disposable.instances_) {
    if (goog.Disposable.instances_.hasOwnProperty(id)) {
      ret.push(goog.Disposable.instances_[Number(id)]);
    }
  }
  return ret;
};


/**
 * Clears the registry of undisposed objects but doesn't dispose of them.
 */
goog.Disposable.clearUndisposedObjects = function() {
  goog.Disposable.instances_ = {};
};


/**
 * Whether the object has been disposed of.
 * @type {boolean}
 * @private
 */
goog.Disposable.prototype.disposed_ = false;


/**
 * Disposables that should be disposed when this object is disposed.
 * @type {Array.<goog.disposable.IDisposable>}
 * @private
 */
goog.Disposable.prototype.dependentDisposables_;


/**
 * @return {boolean} Whether the object has been disposed of.
 */
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_;
};


/**
 * @return {boolean} Whether the object has been disposed of.
 * @deprecated Use {@link #isDisposed} instead.
 */
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;


/**
 * Disposes of the object. If the object hasn't already been disposed of, calls
 * {@link #disposeInternal}. Classes that extend {@code goog.Disposable} should
 * override {@link #disposeInternal} in order to delete references to COM
 * objects, DOM nodes, and other disposable objects. Reentrant.
 *
 * @return {void} Nothing.
 */
goog.Disposable.prototype.dispose = function() {
  if (!this.disposed_) {
    // Set disposed_ to true first, in case during the chain of disposal this
    // gets disposed recursively.
    this.disposed_ = true;
    this.disposeInternal();
    if (goog.Disposable.ENABLE_MONITORING) {
      var uid = goog.getUid(this);
      if (!goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw Error(this + ' did not call the goog.Disposable base ' +
            'constructor or was disposed of after a clearUndisposedObjects ' +
            'call');
      }
      delete goog.Disposable.instances_[uid];
    }
  }
};


/**
 * Associates a disposable object with this object so that they will be disposed
 * together.
 * @param {goog.disposable.IDisposable} disposable that will be disposed when
 *     this object is disposed.
 */
goog.Disposable.prototype.registerDisposable = function(disposable) {
  if (!this.dependentDisposables_) {
    this.dependentDisposables_ = [];
  }
  this.dependentDisposables_.push(disposable);
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects. Classes that extend {@code goog.Disposable} should
 * override this method.
 * Not reentrant. To avoid calling it twice, it must only be called from the
 * subclass' {@code disposeInternal} method. Everywhere else the public
 * {@code dispose} method must be used.
 * For example:
 * <pre>
 *   mypackage.MyClass = function() {
 *     goog.base(this);
 *     // Constructor logic specific to MyClass.
 *     ...
 *   };
 *   goog.inherits(mypackage.MyClass, goog.Disposable);
 *
 *   mypackage.MyClass.prototype.disposeInternal = function() {
 *     goog.base(this, 'disposeInternal');
 *     // Dispose logic specific to MyClass.
 *     ...
 *   };
 * </pre>
 * @protected
 */
goog.Disposable.prototype.disposeInternal = function() {
  if (this.dependentDisposables_) {
    goog.disposeAll.apply(null, this.dependentDisposables_);
  }
};


/**
 * Calls {@code dispose} on the argument if it supports it. If obj is not an
 *     object with a dispose() method, this is a no-op.
 * @param {*} obj The object to dispose of.
 */
goog.dispose = function(obj) {
  if (obj && typeof obj.dispose == 'function') {
    obj.dispose();
  }
};


/**
 * Calls {@code dispose} on each member of the list that supports it. (If the
 * member is an ArrayLike, then {@code goog.disposeAll()} will be called
 * recursively on each of its members.) If the member is not an object with a
 * {@code dispose()} method, then it is ignored.
 * @param {...*} var_args The list.
 */
goog.disposeAll = function(var_args) {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    var disposable = arguments[i];
    if (goog.isArrayLike(disposable)) {
      goog.disposeAll.apply(null, disposable);
    } else {
      goog.dispose(disposable);
    }
  }
};
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A base class for event objects.
 *
 */


goog.provide('goog.events.Event');

goog.require('goog.Disposable');



/**
 * A base class for event objects, so that they can support preventDefault and
 * stopPropagation.
 *
 * @param {string} type Event Type.
 * @param {Object=} opt_target Reference to the object that is the target of
 *     this event. It has to implement the {@code EventTarget} interface
 *     declared at {@link http://developer.mozilla.org/en/DOM/EventTarget}.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.events.Event = function(type, opt_target) {
  goog.Disposable.call(this);

  /**
   * Event type.
   * @type {string}
   */
  this.type = type;

  /**
   * Target of the event.
   * @type {Object|undefined}
   */
  this.target = opt_target;

  /**
   * Object that had the listener attached.
   * @type {Object|undefined}
   */
  this.currentTarget = this.target;
};
goog.inherits(goog.events.Event, goog.Disposable);


/** @override */
goog.events.Event.prototype.disposeInternal = function() {
  delete this.type;
  delete this.target;
  delete this.currentTarget;
};


/**
 * Whether to cancel the event in internal capture/bubble processing for IE.
 * @type {boolean}
 * @suppress {underscore} Technically public, but referencing this outside
 *     this package is strongly discouraged.
 */
goog.events.Event.prototype.propagationStopped_ = false;


/**
 * Return value for in internal capture/bubble processing for IE.
 * @type {boolean}
 * @suppress {underscore} Technically public, but referencing this outside
 *     this package is strongly discouraged.
 */
goog.events.Event.prototype.returnValue_ = true;


/**
 * Stops event propagation.
 */
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true;
};


/**
 * Prevents the default action, for example a link redirecting to a url.
 */
goog.events.Event.prototype.preventDefault = function() {
  this.returnValue_ = false;
};


/**
 * Stops the propagation of the event. It is equivalent to
 * {@code e.stopPropagation()}, but can be used as the callback argument of
 * {@link goog.events.listen} without declaring another function.
 * @param {!goog.events.Event} e An event.
 */
goog.events.Event.stopPropagation = function(e) {
  e.stopPropagation();
};


/**
 * Prevents the default action. It is equivalent to
 * {@code e.preventDefault()}, but can be used as the callback argument of
 * {@link goog.events.listen} without declaring another function.
 * @param {!goog.events.Event} e An event.
 */
goog.events.Event.preventDefault = function(e) {
  e.preventDefault();
};
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Useful compiler idioms.
 *
 */

goog.provide('goog.reflect');


/**
 * Syntax for object literal casts.
 * @see http://go/jscompiler-renaming
 * @see http://code.google.com/p/closure-compiler/wiki/
 *      ExperimentalTypeBasedPropertyRenaming
 *
 * Use this if you have an object literal whose keys need to have the same names
 * as the properties of some class even after they are renamed by the compiler.
 *
 * @param {!Function} type Type to cast to.
 * @param {Object} object Object literal to cast.
 * @return {Object} The object literal.
 */
goog.reflect.object = function(type, object) {
  return object;
};


/**
 * To assert to the compiler that an operation is needed when it would
 * otherwise be stripped. For example:
 * <code>
 *     // Force a layout
 *     goog.reflect.sinkValue(dialog.offsetHeight);
 * </code>
 * @type {!Function}
 */
goog.reflect.sinkValue = function(x) {
  goog.reflect.sinkValue[' '](x);
  return x;
};


/**
 * The compiler should optimize this function away iff no one ever uses
 * goog.reflect.sinkValue.
 */
goog.reflect.sinkValue[' '] = goog.nullFunction;


/**
 * Check if a property can be accessed without throwing an exception.
 * @param {Object} obj The owner of the property.
 * @param {string} prop The property name.
 * @return {boolean} Whether the property is accessible. Will also return true
 *     if obj is null.
 */
goog.reflect.canAccessProperty = function(obj, prop) {
  /** @preserveTry */
  try {
    goog.reflect.sinkValue(obj[prop]);
    return true;
  } catch (e) {}
  return false;
};
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A patched, standardized event object for browser events.
 *
 * <pre>
 * The patched event object contains the following members:
 * - type           {string}    Event type, e.g. 'click'
 * - timestamp      {Date}      A date object for when the event was fired
 * - target         {Object}    The element that actually triggered the event
 * - currentTarget  {Object}    The element the listener is attached to
 * - relatedTarget  {Object}    For mouseover and mouseout, the previous object
 * - offsetX        {number}    X-coordinate relative to target
 * - offsetY        {number}    Y-coordinate relative to target
 * - clientX        {number}    X-coordinate relative to viewport
 * - clientY        {number}    Y-coordinate relative to viewport
 * - screenX        {number}    X-coordinate relative to the edge of the screen
 * - screenY        {number}    Y-coordinate relative to the edge of the screen
 * - button         {number}    Mouse button. Use isButton() to test.
 * - keyCode        {number}    Key-code
 * - ctrlKey        {boolean}   Was ctrl key depressed
 * - altKey         {boolean}   Was alt key depressed
 * - shiftKey       {boolean}   Was shift key depressed
 * - metaKey        {boolean}   Was meta key depressed
 * - state          {Object}    History state object
 *
 * NOTE: The keyCode member contains the raw browser keyCode. For normalized
 * key and character code use {@link goog.events.KeyHandler}.
 * </pre>
 *
 */

goog.provide('goog.events.BrowserEvent');
goog.provide('goog.events.BrowserEvent.MouseButton');

goog.require('goog.events.BrowserFeature');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.reflect');
goog.require('goog.userAgent');



/**
 * Accepts a browser event object and creates a patched, cross browser event
 * object.
 * The content of this object will not be initialized if no event object is
 * provided. If this is the case, init() needs to be invoked separately.
 * @param {Event=} opt_e Browser event object.
 * @param {Node=} opt_currentTarget Current target for event.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
  if (opt_e) {
    this.init(opt_e, opt_currentTarget);
  }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);


/**
 * Normalized button constants for the mouse.
 * @enum {number}
 */
goog.events.BrowserEvent.MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
};


/**
 * Static data for mapping mouse buttons.
 * @type {Array.<number>}
 */
goog.events.BrowserEvent.IEButtonMap = [
  1, // LEFT
  4, // MIDDLE
  2  // RIGHT
];


/**
 * Target that fired the event.
 * @override
 * @type {Node}
 */
goog.events.BrowserEvent.prototype.target = null;


/**
 * Node that had the listener attached.
 * @override
 * @type {Node|undefined}
 */
goog.events.BrowserEvent.prototype.currentTarget;


/**
 * For mouseover and mouseout events, the related object for the event.
 * @type {Node}
 */
goog.events.BrowserEvent.prototype.relatedTarget = null;


/**
 * X-coordinate relative to target.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.offsetX = 0;


/**
 * Y-coordinate relative to target.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.offsetY = 0;


/**
 * X-coordinate relative to the window.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.clientX = 0;


/**
 * Y-coordinate relative to the window.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.clientY = 0;


/**
 * X-coordinate relative to the monitor.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.screenX = 0;


/**
 * Y-coordinate relative to the monitor.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.screenY = 0;


/**
 * Which mouse button was pressed.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.button = 0;


/**
 * Keycode of key press.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.keyCode = 0;


/**
 * Keycode of key press.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.charCode = 0;


/**
 * Whether control was pressed at time of event.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.ctrlKey = false;


/**
 * Whether alt was pressed at time of event.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.altKey = false;


/**
 * Whether shift was pressed at time of event.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.shiftKey = false;


/**
 * Whether the meta key was pressed at time of event.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.metaKey = false;


/**
 * History state object, only set for PopState events where it's a copy of the
 * state object provided to pushState or replaceState.
 * @type {Object}
 */
goog.events.BrowserEvent.prototype.state;


/**
 * Whether the default platform modifier key was pressed at time of event.
 * (This is control for all platforms except Mac, where it's Meta.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.platformModifierKey = false;


/**
 * The browser event object.
 * @type {Event}
 * @private
 */
goog.events.BrowserEvent.prototype.event_ = null;


/**
 * Accepts a browser event object and creates a patched, cross browser event
 * object.
 * @param {Event} e Browser event object.
 * @param {Node=} opt_currentTarget Current target for event.
 */
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  var type = this.type = e.type;
  goog.events.Event.call(this, type);

  // TODO(nicksantos): Change this.target to type EventTarget.
  this.target = /** @type {Node} */ (e.target) || e.srcElement;

  this.currentTarget = opt_currentTarget;

  var relatedTarget = /** @type {Node} */ (e.relatedTarget);
  if (relatedTarget) {
    // There's a bug in FireFox where sometimes, relatedTarget will be a
    // chrome element, and accessing any property of it will get a permission
    // denied exception. See:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=497780
    if (goog.userAgent.GECKO) {
      if (!goog.reflect.canAccessProperty(relatedTarget, 'nodeName')) {
        relatedTarget = null;
      }
    }
    // TODO(user): Use goog.events.EventType when it has been refactored into its
    // own file.
  } else if (type == goog.events.EventType.MOUSEOVER) {
    relatedTarget = e.fromElement;
  } else if (type == goog.events.EventType.MOUSEOUT) {
    relatedTarget = e.toElement;
  }

  this.relatedTarget = relatedTarget;

  this.offsetX = e.offsetX !== undefined ? e.offsetX : e.layerX;
  this.offsetY = e.offsetY !== undefined ? e.offsetY : e.layerY;
  this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
  this.screenX = e.screenX || 0;
  this.screenY = e.screenY || 0;

  this.button = e.button;

  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode || (type == 'keypress' ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  this.state = e.state;
  this.event_ = e;
  delete this.returnValue_;
  delete this.propagationStopped_;
};


/**
 * Tests to see which button was pressed during the event. This is really only
 * useful in IE and Gecko browsers. And in IE, it's only useful for
 * mousedown/mouseup events, because click only fires for the left mouse button.
 *
 * Safari 2 only reports the left button being clicked, and uses the value '1'
 * instead of 0. Opera only reports a mousedown event for the middle button, and
 * no mouse events for the right button. Opera has default behavior for left and
 * middle click that can only be overridden via a configuration setting.
 *
 * There's a nice table of this mess at http://www.unixpapa.com/js/mouse.html.
 *
 * @param {goog.events.BrowserEvent.MouseButton} button The button
 *     to test for.
 * @return {boolean} True if button was pressed.
 */
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if (!goog.events.BrowserFeature.HAS_W3C_BUTTON) {
    if (this.type == 'click') {
      return button == goog.events.BrowserEvent.MouseButton.LEFT;
    } else {
      return !!(this.event_.button &
          goog.events.BrowserEvent.IEButtonMap[button]);
    }
  } else {
    return this.event_.button == button;
  }
};


/**
 * Whether this has an "action"-producing mouse button.
 *
 * By definition, this includes left-click on windows/linux, and left-click
 * without the ctrl key on Macs.
 *
 * @return {boolean} The result.
 */
goog.events.BrowserEvent.prototype.isMouseActionButton = function() {
  // Webkit does not ctrl+click to be a right-click, so we
  // normalize it to behave like Gecko and Opera.
  return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) &&
      !(goog.userAgent.WEBKIT && goog.userAgent.MAC && this.ctrlKey);
};


/**
 * @override
 */
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.events.BrowserEvent.superClass_.stopPropagation.call(this);
  if (this.event_.stopPropagation) {
    this.event_.stopPropagation();
  } else {
    this.event_.cancelBubble = true;
  }
};


/**
 * @override
 */
goog.events.BrowserEvent.prototype.preventDefault = function() {
  goog.events.BrowserEvent.superClass_.preventDefault.call(this);
  var be = this.event_;
  if (!be.preventDefault) {
    be.returnValue = false;
    if (goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) {
      /** @preserveTry */
      try {
        // Most keys can be prevented using returnValue. Some special keys
        // require setting the keyCode to -1 as well:
        //
        // In IE7:
        // F3, F5, F10, F11, Ctrl+P, Crtl+O, Ctrl+F (these are taken from IE6)
        //
        // In IE8:
        // Ctrl+P, Crtl+O, Ctrl+F (F1-F12 cannot be stopped through the event)
        //
        // We therefore do this for all function keys as well as when Ctrl key
        // is pressed.
        var VK_F1 = 112;
        var VK_F12 = 123;
        if (be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
          be.keyCode = -1;
        }
      } catch (ex) {
        // IE throws an 'access denied' exception when trying to change
        // keyCode in some situations (e.g. srcElement is input[type=file],
        // or srcElement is an anchor tag rewritten by parent's innerHTML).
        // Do nothing in this case.
      }
    }
  } else {
    be.preventDefault();
  }
};


/**
 * @return {Event} The underlying browser event object.
 */
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_;
};


/** @override */
goog.events.BrowserEvent.prototype.disposeInternal = function() {
  goog.events.BrowserEvent.superClass_.disposeInternal.call(this);
  this.event_ = null;
  this.target = null;
  this.currentTarget = null;
  this.relatedTarget = null;
};
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Event Manager.
 *
 * Provides an abstracted interface to the browsers' event
 * systems. This uses an indirect lookup of listener functions to avoid circular
 * references between DOM (in IE) or XPCOM (in Mozilla) objects which leak
 * memory. This makes it easier to write OO Javascript/DOM code.
 *
 * It simulates capture & bubble in Internet Explorer.
 *
 * The listeners will also automagically have their event objects patched, so
 * your handlers don't need to worry about the browser.
 *
 * Example usage:
 * <pre>
 * goog.events.listen(myNode, 'click', function(e) { alert('woo') });
 * goog.events.listen(myNode, 'mouseover', mouseHandler, true);
 * goog.events.unlisten(myNode, 'mouseover', mouseHandler, true);
 * goog.events.removeAll(myNode);
 * goog.events.removeAll();
 * </pre>
 *
 *                                            in IE and event object patching]
 *
 * @supported IE6+, FF1.5+, WebKit, Opera.
 * @see ../demos/events.html
 * @see ../demos/event-propagation.html
 * @see ../demos/stopevent.html
 */


// This uses 3 lookup tables/trees.
// listenerTree_ is a tree of type -> capture -> src uid -> [Listener]
// listeners_ is a map of key -> [Listener]
//
// The key is a field of the Listener. The Listener class also has the type,
// capture and the src so one can always trace back in the tree
//
// sources_: src uid -> [Listener]


goog.provide('goog.events');

goog.require('goog.array');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.debug.errorHandlerWeakDep');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.BrowserFeature');
goog.require('goog.events.Event');
goog.require('goog.events.EventWrapper');
goog.require('goog.events.Listener');
goog.require('goog.object');
goog.require('goog.userAgent');


/**
 * @define {boolean} Whether to always assume the garbage collector is good.
 * @deprecated This is no longer needed and will be removed once apps are
 * updated.
 */
goog.events.ASSUME_GOOD_GC = false;


/**
 * Container for storing event listeners and their proxies
 * @private
 * @type {Object.<goog.events.Listener>}
 */
goog.events.listeners_ = {};


/**
 * The root of the listener tree
 * @private
 * @type {Object}
 */
goog.events.listenerTree_ = {};


/**
 * Lookup for mapping source UIDs to listeners.
 * @private
 * @type {Object}
 */
goog.events.sources_ = {};


/**
 * String used to prepend to IE event types.  Not a constant so that it is not
 * inlined.
 * @type {string}
 * @private
 */
goog.events.onString_ = 'on';


/**
 * Map of computed on strings for IE event types. Caching this removes an extra
 * object allocation in goog.events.listen which improves IE6 performance.
 * @type {Object}
 * @private
 */
goog.events.onStringMap_ = {};


/**
 * Separator used to split up the various parts of an event key, to help avoid
 * the possibilities of collisions.
 * @type {string}
 * @private
 */
goog.events.keySeparator_ = '_';


/**
 * Adds an event listener for a specific event on a DOM Node or an object that
 * has implemented {@link goog.events.EventTarget}. A listener can only be
 * added once to an object and if it is added again the key for the listener
 * is returned.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {string|Array.<string>} type Event type or array of event types.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?number} Unique key for the listener.
 */
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if (!type) {
    throw Error('Invalid event type');
  } else if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  } else {
    var capture = !!opt_capt;
    var map = goog.events.listenerTree_;

    if (!(type in map)) {
      map[type] = {count_: 0, remaining_: 0};
    }
    map = map[type];

    if (!(capture in map)) {
      map[capture] = {count_: 0, remaining_: 0};
      map.count_++;
    }
    map = map[capture];

    var srcUid = goog.getUid(src);
    var listenerArray, listenerObj;

    // The remaining_ property is used to be able to short circuit the iteration
    // of the event listeners.
    //
    // Increment the remaining event listeners to call even if this event might
    // already have been fired. At this point we do not know if the event has
    // been fired and it is too expensive to find out. By incrementing it we are
    // guaranteed that we will not skip any event listeners.
    map.remaining_++;

    // Do not use srcUid in map here since that will cast the number to a
    // string which will allocate one string object.
    if (!map[srcUid]) {
      listenerArray = map[srcUid] = [];
      map.count_++;
    } else {
      listenerArray = map[srcUid];
      // Ensure that the listeners do not already contain the current listener
      for (var i = 0; i < listenerArray.length; i++) {
        listenerObj = listenerArray[i];
        if (listenerObj.listener == listener &&
            listenerObj.handler == opt_handler) {

          // If this listener has been removed we should not return its key. It
          // is OK that we create new listenerObj below since the removed one
          // will be cleaned up later.
          if (listenerObj.removed) {
            break;
          }

          // We already have this listener. Return its key.
          return listenerArray[i].key;
        }
      }
    }

    var proxy = goog.events.getProxy();
    proxy.src = src;
    listenerObj = new goog.events.Listener();
    listenerObj.init(listener, proxy, src, type, capture, opt_handler);
    var key = listenerObj.key;
    proxy.key = key;

    listenerArray.push(listenerObj);
    goog.events.listeners_[key] = listenerObj;

    if (!goog.events.sources_[srcUid]) {
      goog.events.sources_[srcUid] = [];
    }
    goog.events.sources_[srcUid].push(listenerObj);


    // Attach the proxy through the browser's API
    if (src.addEventListener) {
      if (src == goog.global || !src.customEvent_) {
        src.addEventListener(type, proxy, capture);
      }
    } else {
      // The else above used to be else if (src.attachEvent) and then there was
      // another else statement that threw an exception warning the developer
      // they made a mistake. This resulted in an extra object allocation in IE6
      // due to a wrapper object that had to be implemented around the element
      // and so was removed.
      src.attachEvent(goog.events.getOnString_(type), proxy);
    }

    return key;
  }
};


/**
 * Helper function for returning a proxy function.
 * @return {Function} A new or reused function object.
 */
goog.events.getProxy = function() {
  var proxyCallbackFunction = goog.events.handleBrowserEvent_;
  // Use a local var f to prevent one allocation.
  var f = goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT ?
      function(eventObject) {
        return proxyCallbackFunction.call(f.src, f.key, eventObject);
      } :
      function(eventObject) {
        var v = proxyCallbackFunction.call(f.src, f.key, eventObject);
        // NOTE(user): In IE, we hack in a capture phase. However, if
        // there is inline event handler which tries to prevent default (for
        // example <a href="..." onclick="return false">...</a>) in a
        // descendant element, the prevent default will be overridden
        // by this listener if this listener were to return true. Hence, we
        // return undefined.
        if (!v) return v;
      };
  return f;
};


/**
 * Adds an event listener for a specific event on a DomNode or an object that
 * has implemented {@link goog.events.EventTarget}. After the event has fired
 * the event listener is removed from the target.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {string|Array.<string>} type Event type or array of event types.
 * @param {Function|Object} listener Callback method.
 * @param {boolean=} opt_capt Fire in capture phase?.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?number} Unique key for the listener.
 */
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  var key = goog.events.listen(src, type, listener, opt_capt, opt_handler);
  var listenerObj = goog.events.listeners_[key];
  listenerObj.callOnce = true;
  return key;
};


/**
 * Adds an event listener with a specific event wrapper on a DOM Node or an
 * object that has implemented {@link goog.events.EventTarget}. A listener can
 * only be added once to an object.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 */
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt,
    opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler);
};


/**
 * Removes an event listener which was added with listen().
 *
 * @param {EventTarget|goog.events.EventTarget} src The target to stop
 *     listening to events on.
 * @param {string|Array.<string>} type The name of the event without the 'on'
 *     prefix.
 * @param {Function|Object} listener The listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?boolean} indicating whether the listener was there to remove.
 */
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  var capture = !!opt_capt;

  var listenerArray = goog.events.getListeners_(src, type, capture);
  if (!listenerArray) {
    return false;
  }

  for (var i = 0; i < listenerArray.length; i++) {
    if (listenerArray[i].listener == listener &&
        listenerArray[i].capture == capture &&
        listenerArray[i].handler == opt_handler) {
      return goog.events.unlistenByKey(listenerArray[i].key);
    }
  }

  return false;
};


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {?number} key The key returned by listen() for this event listener.
 * @return {boolean} indicating whether the listener was there to remove.
 */
goog.events.unlistenByKey = function(key) {
  // Do not use key in listeners here since that will cast the number to a
  // string which will allocate one string object.
  if (!goog.events.listeners_[key]) {
    return false;
  }
  var listener = goog.events.listeners_[key];

  if (listener.removed) {
    return false;
  }

  var src = listener.src;
  var type = listener.type;
  var proxy = listener.proxy;
  var capture = listener.capture;

  if (src.removeEventListener) {
    // EventTarget calls unlisten so we need to ensure that the source is not
    // an event target to prevent re-entry.
    // TODO(user): What is this goog.global for? Why would anyone listen to
    // events on the [[Global]] object? Is it supposed to be window? Why would
    // we not want to allow removing event listeners on the window?
    if (src == goog.global || !src.customEvent_) {
      src.removeEventListener(type, proxy, capture);
    }
  } else if (src.detachEvent) {
    src.detachEvent(goog.events.getOnString_(type), proxy);
  }

  var srcUid = goog.getUid(src);
  var listenerArray = goog.events.listenerTree_[type][capture][srcUid];

  // In a perfect implementation we would decrement the remaining_ field here
  // but then we would need to know if the listener has already been fired or
  // not. We therefore skip doing this and in this uncommon case the entire
  // ancestor chain will need to be traversed as before.

  // Remove from sources_
  if (goog.events.sources_[srcUid]) {
    var sourcesArray = goog.events.sources_[srcUid];
    goog.array.remove(sourcesArray, listener);
    if (sourcesArray.length == 0) {
      delete goog.events.sources_[srcUid];
    }
  }

  listener.removed = true;
  listenerArray.needsCleanup_ = true;
  goog.events.cleanUp_(type, capture, srcUid, listenerArray);

  delete goog.events.listeners_[key];

  return true;
};


/**
 * Removes an event listener which was added with listenWithWrapper().
 *
 * @param {EventTarget|goog.events.EventTarget} src The target to stop
 *     listening to events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {Function|Object} listener The listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 */
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt,
    opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler);
};


/**
 * Cleans up the listener array as well as the listener tree
 * @param {string} type  The type of the event.
 * @param {boolean} capture Whether to clean up capture phase listeners instead
 *     bubble phase listeners.
 * @param {number} srcUid  The unique ID of the source.
 * @param {Array.<goog.events.Listener>} listenerArray The array being cleaned.
 * @private
 */
goog.events.cleanUp_ = function(type, capture, srcUid, listenerArray) {
  // The listener array gets locked during the dispatch phase so that removals
  // of listeners during this phase does not screw up the indeces. This method
  // is called after we have removed a listener as well as after the dispatch
  // phase in case any listeners were removed.
  if (!listenerArray.locked_) { // catches both 0 and not set
    if (listenerArray.needsCleanup_) {
      // Loop over the listener array and remove listeners that have removed set
      // to true. This could have been done with filter or something similar but
      // we want to change the array in place and we want to minimize
      // allocations. Adding a listener during this phase adds to the end of the
      // array so that works fine as long as the length is rechecked every in
      // iteration.
      for (var oldIndex = 0, newIndex = 0;
           oldIndex < listenerArray.length;
           oldIndex++) {
        if (listenerArray[oldIndex].removed) {
          var proxy = listenerArray[oldIndex].proxy;
          proxy.src = null;
          continue;
        }
        if (oldIndex != newIndex) {
          listenerArray[newIndex] = listenerArray[oldIndex];
        }
        newIndex++;
      }
      listenerArray.length = newIndex;

      listenerArray.needsCleanup_ = false;

      // In case the length is now zero we release the object.
      if (newIndex == 0) {
        delete goog.events.listenerTree_[type][capture][srcUid];
        goog.events.listenerTree_[type][capture].count_--;

        if (goog.events.listenerTree_[type][capture].count_ == 0) {
          delete goog.events.listenerTree_[type][capture];
          goog.events.listenerTree_[type].count_--;
        }

        if (goog.events.listenerTree_[type].count_ == 0) {
          delete goog.events.listenerTree_[type];
        }
      }

    }
  }
};


/**
 * Removes all listeners from an object, if no object is specified it will
 * remove all listeners that have been registered.  You can also optionally
 * remove listeners of a particular type or capture phase.
 *
 * @param {Object=} opt_obj Object to remove listeners from.
 * @param {string=} opt_type Type of event to, default is all types.
 * @param {boolean=} opt_capt Whether to remove the listeners from the capture
 *     or bubble phase.  If unspecified, will remove both.
 * @return {number} Number of listeners removed.
 */
goog.events.removeAll = function(opt_obj, opt_type, opt_capt) {
  var count = 0;

  var noObj = opt_obj == null;
  var noType = opt_type == null;
  var noCapt = opt_capt == null;
  opt_capt = !!opt_capt;

  if (!noObj) {
    var srcUid = goog.getUid(/** @type {Object} */ (opt_obj));
    if (goog.events.sources_[srcUid]) {
      var sourcesArray = goog.events.sources_[srcUid];
      for (var i = sourcesArray.length - 1; i >= 0; i--) {
        var listener = sourcesArray[i];
        if ((noType || opt_type == listener.type) &&
            (noCapt || opt_capt == listener.capture)) {
          goog.events.unlistenByKey(listener.key);
          count++;
        }
      }
    }
  } else {
    // Loop over the sources_ map instead of over the listeners_ since it is
    // smaller which results in fewer allocations.
    goog.object.forEach(goog.events.sources_, function(listeners) {
      for (var i = listeners.length - 1; i >= 0; i--) {
        var listener = listeners[i];
        if ((noType || opt_type == listener.type) &&
            (noCapt || opt_capt == listener.capture)) {
          goog.events.unlistenByKey(listener.key);
          count++;
        }
      }
    });
  }

  return count;
};


/**
 * Gets the listeners for a given object, type and capture phase.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {string} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {Array.<goog.events.Listener>} Array of listener objects.
 */
goog.events.getListeners = function(obj, type, capture) {
  return goog.events.getListeners_(obj, type, capture) || [];
};


/**
 * Gets the listeners for a given object, type and capture phase.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {?string} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {Array.<goog.events.Listener>?} Array of listener objects.
 *     Returns null if object has no listeners of that type.
 * @private
 */
goog.events.getListeners_ = function(obj, type, capture) {
  var map = goog.events.listenerTree_;
  if (type in map) {
    map = map[type];
    if (capture in map) {
      map = map[capture];
      var objUid = goog.getUid(obj);
      if (map[objUid]) {
        return map[objUid];
      }
    }
  }

  return null;
};


/**
 * Gets the goog.events.Listener for the event or null if no such listener is
 * in use.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node from which to get
 *     listeners.
 * @param {?string} type The name of the event without the 'on' prefix.
 * @param {Function|Object} listener The listener function to get.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *                            whether the listener is fired during the
 *                            capture or bubble phase of the event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.Listener?} the found listener or null if not found.
 */
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  var capture = !!opt_capt;
  var listenerArray = goog.events.getListeners_(src, type, capture);
  if (listenerArray) {
    for (var i = 0; i < listenerArray.length; i++) {
      // If goog.events.unlistenByKey is called during an event dispatch
      // then the listener array won't get cleaned up and there might be
      // 'removed' listeners in the list. Ignore those.
      if (!listenerArray[i].removed &&
          listenerArray[i].listener == listener &&
          listenerArray[i].capture == capture &&
          listenerArray[i].handler == opt_handler) {
        // We already have this listener. Return its key.
        return listenerArray[i];
      }
    }
  }
  return null;
};


/**
 * Returns whether an event target has any active listeners matching the
 * specified signature. If either the type or capture parameters are
 * unspecified, the function will match on the remaining criteria.
 *
 * @param {EventTarget|goog.events.EventTarget} obj Target to get listeners for.
 * @param {string=} opt_type Event type.
 * @param {boolean=} opt_capture Whether to check for capture or bubble-phase
 *     listeners.
 * @return {boolean} Whether an event target has one or more listeners matching
 *     the requested type and/or capture phase.
 */
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  var objUid = goog.getUid(obj);
  var listeners = goog.events.sources_[objUid];

  if (listeners) {
    var hasType = goog.isDef(opt_type);
    var hasCapture = goog.isDef(opt_capture);

    if (hasType && hasCapture) {
      // Lookup in the listener tree whether the specified listener exists.
      var map = goog.events.listenerTree_[opt_type];
      return !!map && !!map[opt_capture] && objUid in map[opt_capture];

    } else if (!(hasType || hasCapture)) {
      // Simple check for whether the event target has any listeners at all.
      return true;

    } else {
      // Iterate through the listeners for the event target to find a match.
      return goog.array.some(listeners, function(listener) {
        return (hasType && listener.type == opt_type) ||
               (hasCapture && listener.capture == opt_capture);
      });
    }
  }

  return false;
};


/**
 * Provides a nice string showing the normalized event objects public members
 * @param {Object} e Event Object.
 * @return {string} String of the public members of the normalized event object.
 */
goog.events.expose = function(e) {
  var str = [];
  for (var key in e) {
    if (e[key] && e[key].id) {
      str.push(key + ' = ' + e[key] + ' (' + e[key].id + ')');
    } else {
      str.push(key + ' = ' + e[key]);
    }
  }
  return str.join('\n');
};


/**
 * Returns a string wth on prepended to the specified type. This is used for IE
 * which expects "on" to be prepended. This function caches the string in order
 * to avoid extra allocations in steady state.
 * @param {string} type Event type strng.
 * @return {string} The type string with 'on' prepended.
 * @private
 */
goog.events.getOnString_ = function(type) {
  if (type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type];
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type;
};


/**
 * Fires an object's listeners of a particular type and phase
 *
 * @param {Object} obj Object whose listeners to call.
 * @param {string} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 */
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  var map = goog.events.listenerTree_;
  if (type in map) {
    map = map[type];
    if (capture in map) {
      return goog.events.fireListeners_(map[capture], obj, type,
                                        capture, eventObject);
    }
  }
  return true;
};


/**
 * Fires an object's listeners of a particular type and phase.
 *
 * @param {Object} map Object with listeners in it.
 * @param {Object} obj Object whose listeners to call.
 * @param {string} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 * @private
 */
goog.events.fireListeners_ = function(map, obj, type, capture, eventObject) {
  var retval = 1;

  var objUid = goog.getUid(obj);
  if (map[objUid]) {
    map.remaining_--;
    var listenerArray = map[objUid];

    // If locked_ is not set (and if already 0) initialize it to 1.
    if (!listenerArray.locked_) {
      listenerArray.locked_ = 1;
    } else {
      listenerArray.locked_++;
    }

    try {
      // Events added in the dispatch phase should not be dispatched in
      // the current dispatch phase. They will be included in the next
      // dispatch phase though.
      var length = listenerArray.length;
      for (var i = 0; i < length; i++) {
        var listener = listenerArray[i];
        // We might not have a listener if the listener was removed.
        if (listener && !listener.removed) {
          retval &=
              goog.events.fireListener(listener, eventObject) !== false;
        }
      }
    } finally {
      listenerArray.locked_--;
      goog.events.cleanUp_(type, capture, objUid, listenerArray);
    }
  }

  return Boolean(retval);
};


/**
 * Fires a listener with a set of arguments
 *
 * @param {goog.events.Listener} listener The listener object to call.
 * @param {Object} eventObject The event object to pass to the listener.
 * @return {boolean} Result of listener.
 */
goog.events.fireListener = function(listener, eventObject) {
  var rv = listener.handleEvent(eventObject);
  if (listener.callOnce) {
    goog.events.unlistenByKey(listener.key);
  }
  return rv;
};


/**
 * Gets the total number of listeners currently in the system.
 * @return {number} Number of listeners.
 */
goog.events.getTotalListenerCount = function() {
  return goog.object.getCount(goog.events.listeners_);
};


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.EventTarget} src  The event target.
 * @param {string|Object|goog.events.Event} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the handlers returns false) this will also return false.
 *     If there are no handlers, or if all handlers return true, this returns
 *     true.
 */
goog.events.dispatchEvent = function(src, e) {
  var type = e.type || e;
  var map = goog.events.listenerTree_;
  if (!(type in map)) {
    return true;
  }

  // If accepting a string or object, create a custom event object so that
  // preventDefault and stopPropagation work with the event.
  if (goog.isString(e)) {
    e = new goog.events.Event(e, src);
  } else if (!(e instanceof goog.events.Event)) {
    var oldEvent = e;
    e = new goog.events.Event(type, src);
    goog.object.extend(e, oldEvent);
  } else {
    e.target = e.target || src;
  }

  var rv = 1, ancestors;

  map = map[type];
  var hasCapture = true in map;
  var targetsMap;

  if (hasCapture) {
    // Build ancestors now
    ancestors = [];
    for (var parent = src; parent; parent = parent.getParentEventTarget()) {
      ancestors.push(parent);
    }

    targetsMap = map[true];
    targetsMap.remaining_ = targetsMap.count_;

    // Call capture listeners
    for (var i = ancestors.length - 1;
         !e.propagationStopped_ && i >= 0 && targetsMap.remaining_;
         i--) {
      e.currentTarget = ancestors[i];
      rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type,
                                       true, e) &&
            e.returnValue_ != false;
    }
  }

  var hasBubble = false in map;
  if (hasBubble) {
    targetsMap = map[false];
    targetsMap.remaining_ = targetsMap.count_;

    if (hasCapture) { // We have the ancestors.

      // Call bubble listeners
      for (var i = 0; !e.propagationStopped_ && i < ancestors.length &&
           targetsMap.remaining_;
           i++) {
        e.currentTarget = ancestors[i];
        rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type,
                                         false, e) &&
              e.returnValue_ != false;
      }
    } else {
      // In case we don't have capture we don't have to build up the
      // ancestors array.

      for (var current = src;
           !e.propagationStopped_ && current && targetsMap.remaining_;
           current = current.getParentEventTarget()) {
        e.currentTarget = current;
        rv &= goog.events.fireListeners_(targetsMap, current, e.type,
                                         false, e) &&
              e.returnValue_ != false;
      }
    }
  }

  return Boolean(rv);
};


/**
 * Installs exception protection for the browser event entry point using the
 * given error handler.
 *
 * @param {goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry point.
 */
goog.events.protectBrowserEventEntryPoint = function(errorHandler) {
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(
      goog.events.handleBrowserEvent_);
};


/**
 * Handles an event and dispatches it to the correct listeners. This
 * function is a proxy for the real listener the user specified.
 *
 * @param {string} key Unique key for the listener.
 * @param {Event=} opt_evt Optional event object that gets passed in via the
 *     native event handlers.
 * @return {boolean} Result of the event handler.
 * @this {goog.events.EventTarget|Object} The object or Element that
 *     fired the event.
 * @private
 */
goog.events.handleBrowserEvent_ = function(key, opt_evt) {
  // If the listener isn't there it was probably removed when processing
  // another listener on the same event (e.g. the later listener is
  // not managed by closure so that they are both fired under IE)
  if (!goog.events.listeners_[key]) {
    return true;
  }

  var listener = goog.events.listeners_[key];
  var type = listener.type;
  var map = goog.events.listenerTree_;

  if (!(type in map)) {
    return true;
  }
  map = map[type];
  var retval, targetsMap;
  // Synthesize event propagation if the browser does not support W3C
  // event model.
  if (!goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    var ieEvent = opt_evt ||
        /** @type {Event} */ (goog.getObjectByName('window.event'));

    // Check if we have any capturing event listeners for this type.
    var hasCapture = true in map;
    var hasBubble = false in map;

    if (hasCapture) {
      if (goog.events.isMarkedIeEvent_(ieEvent)) {
        return true;
      }

      goog.events.markIeEvent_(ieEvent);
    }

    var evt = new goog.events.BrowserEvent();
    evt.init(ieEvent, this);

    retval = true;
    try {
      if (hasCapture) {
        var ancestors = [];

        for (var parent = evt.currentTarget;
             parent;
             parent = parent.parentNode) {
          ancestors.push(parent);
        }

        targetsMap = map[true];
        targetsMap.remaining_ = targetsMap.count_;

        // Call capture listeners
        for (var i = ancestors.length - 1;
             !evt.propagationStopped_ && i >= 0 && targetsMap.remaining_;
             i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type,
                                               true, evt);
        }

        if (hasBubble) {
          targetsMap = map[false];
          targetsMap.remaining_ = targetsMap.count_;

          // Call bubble listeners
          for (var i = 0;
               !evt.propagationStopped_ && i < ancestors.length &&
               targetsMap.remaining_;
               i++) {
            evt.currentTarget = ancestors[i];
            retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type,
                                                 false, evt);
          }
        }

      } else {
        // Bubbling, let IE handle the propagation.
        retval = goog.events.fireListener(listener, evt);
      }

    } finally {
      if (ancestors) {
        ancestors.length = 0;
      }
      evt.dispose();
    }
    return retval;
  } // IE

  // Caught a non-IE DOM event. 1 additional argument which is the event object
  var be = new goog.events.BrowserEvent(opt_evt, this);
  try {
    retval = goog.events.fireListener(listener, be);
  } finally {
    be.dispose();
  }
  return retval;
};


/**
 * This is used to mark the IE event object so we do not do the Closure pass
 * twice for a bubbling event.
 * @param {Event} e The IE browser event.
 * @private
 */
goog.events.markIeEvent_ = function(e) {
  // Only the keyCode and the returnValue can be changed. We use keyCode for
  // non keyboard events.
  // event.returnValue is a bit more tricky. It is undefined by default. A
  // boolean false prevents the default action. In a window.onbeforeunload and
  // the returnValue is non undefined it will be alerted. However, we will only
  // modify the returnValue for keyboard events. We can get a problem if non
  // closure events sets the keyCode or the returnValue

  var useReturnValue = false;

  if (e.keyCode == 0) {
    // We cannot change the keyCode in case that srcElement is input[type=file].
    // We could test that that is the case but that would allocate 3 objects.
    // If we use try/catch we will only allocate extra objects in the case of a
    // failure.
    /** @preserveTry */
    try {
      e.keyCode = -1;
      return;
    } catch (ex) {
      useReturnValue = true;
    }
  }

  if (useReturnValue ||
      /** @type {boolean|undefined} */ (e.returnValue) == undefined) {
    e.returnValue = true;
  }
};


/**
 * This is used to check if an IE event has already been handled by the Closure
 * system so we do not do the Closure pass twice for a bubbling event.
 * @param {Event} e  The IE browser event.
 * @return {boolean} True if the event object has been marked.
 * @private
 */
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined;
};


/**
 * Counter to create unique event ids.
 * @type {number}
 * @private
 */
goog.events.uniqueIdCounter_ = 0;


/**
 * Creates a unique event id.
 *
 * @param {string} identifier The identifier.
 * @return {string} A unique identifier.
 */
goog.events.getUniqueId = function(identifier) {
  return identifier + '_' + goog.events.uniqueIdCounter_++;
};


// Register the browser event handler as an entry point, so that
// it can be monitored for exception handling, etc.
goog.debug.entryPointRegistry.register(
    /**
     * @param {function(!Function): !Function} transformer The transforming
     *     function.
     */
    function(transformer) {
      goog.events.handleBrowserEvent_ = transformer(
          goog.events.handleBrowserEvent_);
    });
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Implementation of EventTarget as defined by W3C DOM 2/3.
 *
 * @see ../demos/eventtarget.html
 */


/**
 * Namespace for events
 */
goog.provide('goog.events.EventTarget');

goog.require('goog.Disposable');
goog.require('goog.events');



/**
 * Inherit from this class to give your object the ability to dispatch events.
 * Note that this class provides event <em>sending</em> behaviour, not event
 * receiving behaviour: your object will be able to broadcast events, and other
 * objects will be able to listen for those events using goog.events.listen().
 *
 * <p>The name "EventTarget" reflects the fact that this class implements the
 * <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html">
 * EventTarget interface</a> as defined by W3C DOM 2/3, with a few differences:
 * <ul>
 * <li>Event objects do not have to implement the Event interface. An object
 *     is treated as an event object if it has a 'type' property.
 * <li>You can use a plain string instead of an event object; an event-like
 *     object will be created with the 'type' set to the string value.
 * </ul>
 *
 * <p>Unless propagation is stopped, an event dispatched by an EventTarget
 * will bubble to the parent returned by <code>getParentEventTarget</code>.
 * To set the parent, call <code>setParentEventTarget</code> or override
 * <code>getParentEventTarget</code> in a subclass.  Subclasses that don't
 * support changing the parent should override the setter to throw an error.
 *
 * <p>Example usage:
 * <pre>
 *   var source = new goog.events.EventTarget();
 *   function handleEvent(event) {
 *     alert('Type: ' + e.type + '\nTarget: ' + e.target);
 *   }
 *   goog.events.listen(source, 'foo', handleEvent);
 *   ...
 *   source.dispatchEvent({type: 'foo'}); // will call handleEvent
 *   // or source.dispatchEvent('foo');
 *   ...
 *   goog.events.unlisten(source, 'foo', handleEvent);
 *
 *   // You can also use the Listener interface:
 *   var listener = {
 *     handleEvent: function(event) {
 *       ...
 *     }
 *   };
 *   goog.events.listen(source, 'bar', listener);
 * </pre>
 *
 * @constructor
 * @extends {goog.Disposable}
 */
goog.events.EventTarget = function() {
  goog.Disposable.call(this);
};
goog.inherits(goog.events.EventTarget, goog.Disposable);


/**
 * Used to tell if an event is a real event in goog.events.listen() so we don't
 * get listen() calling addEventListener() and vice-versa.
 * @type {boolean}
 * @private
 */
goog.events.EventTarget.prototype.customEvent_ = true;


/**
 * Parent event target, used during event bubbling.
 * @type {goog.events.EventTarget?}
 * @private
 */
goog.events.EventTarget.prototype.parentEventTarget_ = null;


/**
 * Returns the parent of this event target to use for bubbling.
 *
 * @return {goog.events.EventTarget} The parent EventTarget or null if there
 * is no parent.
 */
goog.events.EventTarget.prototype.getParentEventTarget = function() {
  return this.parentEventTarget_;
};


/**
 * Sets the parent of this event target to use for bubbling.
 *
 * @param {goog.events.EventTarget?} parent Parent EventTarget (null if none).
 */
goog.events.EventTarget.prototype.setParentEventTarget = function(parent) {
  this.parentEventTarget_ = parent;
};


/**
 * Adds an event listener to the event target. The same handler can only be
 * added once per the type. Even if you add the same handler multiple times
 * using the same type then it will only be called once when the event is
 * dispatched.
 *
 * Supported for legacy but use goog.events.listen(src, type, handler) instead.
 *
 * @param {string} type The type of the event to listen for.
 * @param {Function|Object} handler The function to handle the event. The
 *     handler can also be an object that implements the handleEvent method
 *     which takes the event object as argument.
 * @param {boolean=} opt_capture In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase
 *     of the event.
 * @param {Object=} opt_handlerScope Object in whose scope to call the listener.
 */
goog.events.EventTarget.prototype.addEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  goog.events.listen(this, type, handler, opt_capture, opt_handlerScope);
};


/**
 * Removes an event listener from the event target. The handler must be the
 * same object as the one added. If the handler has not been added then
 * nothing is done.
 * @param {string} type The type of the event to listen for.
 * @param {Function|Object} handler The function to handle the event. The
 *     handler can also be an object that implements the handleEvent method
 *     which takes the event object as argument.
 * @param {boolean=} opt_capture In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase
 *     of the event.
 * @param {Object=} opt_handlerScope Object in whose scope to call the listener.
 */
goog.events.EventTarget.prototype.removeEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  goog.events.unlisten(this, type, handler, opt_capture, opt_handlerScope);
};


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {string|Object|goog.events.Event} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the handlers returns false this will also return false.
 */
goog.events.EventTarget.prototype.dispatchEvent = function(e) {
  return goog.events.dispatchEvent(this, e);
};


/**
 * Unattach listeners from this object.  Classes that extend EventTarget may
 * need to override this method in order to remove references to DOM Elements
 * and additional listeners, it should be something like this:
 * <pre>
 * MyClass.prototype.disposeInternal = function() {
 *   MyClass.superClass_.disposeInternal.call(this);
 *   // Dispose logic for MyClass
 * };
 * </pre>
 * @override
 * @protected
 */
goog.events.EventTarget.prototype.disposeInternal = function() {
  goog.events.EventTarget.superClass_.disposeInternal.call(this);
  goog.events.removeAll(this);
  this.parentEventTarget_ = null;
};
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
 * @fileoverview A timer class to which other classes and objects can
 * listen on.  This is only an abstraction above setInterval.
 *
 * @see ../demos/timers.html
 */

goog.provide('goog.Timer');

goog.require('goog.events.EventTarget');



/**
 * Class for handling timing events.
 *
 * @param {number=} opt_interval Number of ms between ticks (Default: 1ms).
 * @param {Object=} opt_timerObject  An object that has setTimeout, setInterval,
 *     clearTimeout and clearInterval (eg Window).
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.Timer = function(opt_interval, opt_timerObject) {
  goog.events.EventTarget.call(this);

  /**
   * Number of ms between ticks
   * @type {number}
   * @private
   */
  this.interval_ = opt_interval || 1;

  /**
   * An object that implements setTimout, setInterval, clearTimeout and
   * clearInterval. We default to the window object. Changing this on
   * goog.Timer.prototype changes the object for all timer instances which can
   * be useful if your environment has some other implementation of timers than
   * the window object.
   * @type {Object}
   * @private
   */
  this.timerObject_ = opt_timerObject || goog.Timer.defaultTimerObject;

  /**
   * Cached tick_ bound to the object for later use in the timer.
   * @type {Function}
   * @private
   */
  this.boundTick_ = goog.bind(this.tick_, this);

 /**
  * Firefox browser often fires the timer event sooner
  * (sometimes MUCH sooner) than the requested timeout. So we
  * compare the time to when the event was last fired, and
  * reschedule if appropriate. See also goog.Timer.intervalScale
  * @type {number}
  * @private
  */
  this.last_ = goog.now();
};
goog.inherits(goog.Timer, goog.events.EventTarget);


/**
 * Maximum timeout value.
 *
 * Timeout values too big to fit into a signed 32-bit integer may cause
 * overflow in FF, Safari, and Chrome, resulting in the timeout being
 * scheduled immediately.  It makes more sense simply not to schedule these
 * timeouts, since 24.8 days is beyond a reasonable expectation for the
 * browser to stay open.
 *
 * @type {number}
 * @private
 */
goog.Timer.MAX_TIMEOUT_ = 2147483647;


/**
 * Whether this timer is enabled
 * @type {boolean}
 */
goog.Timer.prototype.enabled = false;


/**
 * An object that implements setTimout, setInterval, clearTimeout and
 * clearInterval. We default to the window object. Changing this on
 * goog.Timer.prototype changes the object for all timer instances which can be
 * useful if your environment has some other implementation of timers than the
 * window object.
 * @type {Object}
 */
goog.Timer.defaultTimerObject = goog.global['window'];


/**
 * A variable that controls the timer error correction. If the
 * timer is called before the requested interval times
 * intervalScale, which often happens on mozilla, the timer is
 * rescheduled. See also this.last_
 * @type {number}
 */
goog.Timer.intervalScale = 0.8;


/**
 * Variable for storing the result of setInterval
 * @type {?number}
 * @private
 */
goog.Timer.prototype.timer_ = null;


/**
 * Gets the interval of the timer.
 * @return {number} interval Number of ms between ticks.
 */
goog.Timer.prototype.getInterval = function() {
  return this.interval_;
};


/**
 * Sets the interval of the timer.
 * @param {number} interval Number of ms between ticks.
 */
goog.Timer.prototype.setInterval = function(interval) {
  this.interval_ = interval;
  if (this.timer_ && this.enabled) {
    // Stop and then start the timer to reset the interval.
    this.stop();
    this.start();
  } else if (this.timer_) {
    this.stop();
  }
};


/**
 * Callback for the setTimeout used by the timer
 * @private
 */
goog.Timer.prototype.tick_ = function() {
  if (this.enabled) {
    var elapsed = goog.now() - this.last_;
    if (elapsed > 0 &&
        elapsed < this.interval_ * goog.Timer.intervalScale) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_,
          this.interval_ - elapsed);
      return;
    }

    this.dispatchTick();
    // The timer could be stopped in the timer event handler.
    if (this.enabled) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_,
          this.interval_);
      this.last_ = goog.now();
    }
  }
};


/**
 * Dispatches the TICK event. This is its own method so subclasses can override.
 */
goog.Timer.prototype.dispatchTick = function() {
  this.dispatchEvent(goog.Timer.TICK);
};


/**
 * Starts the timer.
 */
goog.Timer.prototype.start = function() {
  this.enabled = true;

  // If there is no interval already registered, start it now
  if (!this.timer_) {
    // IMPORTANT!
    // window.setInterval in FireFox has a bug - it fires based on
    // absolute time, rather than on relative time. What this means
    // is that if a computer is sleeping/hibernating for 24 hours
    // and the timer interval was configured to fire every 1000ms,
    // then after the PC wakes up the timer will fire, in rapid
    // succession, 3600*24 times.
    // This bug is described here and is already fixed, but it will
    // take time to propagate, so for now I am switching this over
    // to setTimeout logic.
    //     https://bugzilla.mozilla.org/show_bug.cgi?id=376643
    //
    this.timer_ = this.timerObject_.setTimeout(this.boundTick_,
        this.interval_);
    this.last_ = goog.now();
  }
};


/**
 * Stops the timer.
 */
goog.Timer.prototype.stop = function() {
  this.enabled = false;
  if (this.timer_) {
    this.timerObject_.clearTimeout(this.timer_);
    this.timer_ = null;
  }
};


/** @override */
goog.Timer.prototype.disposeInternal = function() {
  goog.Timer.superClass_.disposeInternal.call(this);
  this.stop();
  delete this.timerObject_;
};


/**
 * Constant for the timer's event type
 * @type {string}
 */
goog.Timer.TICK = 'tick';


/**
 * Calls the given function once, after the optional pause.
 *
 * The function is always called asynchronously, even if the delay is 0. This
 * is a common trick to schedule a function to run after a batch of browser
 * event processing.
 *
 * @param {Function} listener Function or object that has a handleEvent method.
 * @param {number=} opt_delay Milliseconds to wait; default is 0.
 * @param {Object=} opt_handler Object in whose scope to call the listener.
 * @return {number} A handle to the timer ID.
 */
goog.Timer.callOnce = function(listener, opt_delay, opt_handler) {
  if (goog.isFunction(listener)) {
    if (opt_handler) {
      listener = goog.bind(listener, opt_handler);
    }
  } else if (listener && typeof listener.handleEvent == 'function') {
    // using typeof to prevent strict js warning
    listener = goog.bind(listener.handleEvent, listener);
  } else {
   throw Error('Invalid listener argument');
  }

  if (opt_delay > goog.Timer.MAX_TIMEOUT_) {
    // Timeouts greater than MAX_INT return immediately due to integer
    // overflow in many browsers.  Since MAX_INT is 24.8 days, just don't
    // schedule anything at all.
    return -1;
  } else {
    return goog.Timer.defaultTimerObject.setTimeout(
        listener, opt_delay || 0);
  }
};


/**
 * Clears a timeout initiated by callOnce
 * @param {?number} timerId a timer ID.
 */
goog.Timer.clear = function(timerId) {
  goog.Timer.defaultTimerObject.clearTimeout(timerId);
};
// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Defines the collection interface.
 *
 */

goog.provide('goog.structs.Collection');



/**
 * An interface for a collection of values.
 * @interface
 */
goog.structs.Collection = function() {};


/**
 * @param {*} value Value to add to the collection.
 */
goog.structs.Collection.prototype.add;


/**
 * @param {*} value Value to remove from the collection.
 */
goog.structs.Collection.prototype.remove;


/**
 * @param {*} value Value to find in the tree.
 * @return {boolean} Whether the collection contains the specified value.
 */
goog.structs.Collection.prototype.contains;


/**
 * @return {number} The number of values stored in the collection.
 */
goog.structs.Collection.prototype.getCount;

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
 * @fileoverview Generics method for collection-like classes and objects.
 *
 *
 * This file contains functions to work with collections. It supports using
 * Map, Set, Array and Object and other classes that implement collection-like
 * methods.
 */


goog.provide('goog.structs');

goog.require('goog.array');
goog.require('goog.object');


// We treat an object as a dictionary if it has getKeys or it is an object that
// isn't arrayLike.


/**
 * Returns the number of values in the collection-like object.
 * @param {Object} col The collection-like object.
 * @return {number} The number of values in the collection-like object.
 */
goog.structs.getCount = function(col) {
  if (typeof col.getCount == 'function') {
    return col.getCount();
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return col.length;
  }
  return goog.object.getCount(col);
};


/**
 * Returns the values of the collection-like object.
 * @param {Object} col The collection-like object.
 * @return {!Array} The values in the collection-like object.
 */
goog.structs.getValues = function(col) {
  if (typeof col.getValues == 'function') {
    return col.getValues();
  }
  if (goog.isString(col)) {
    return col.split('');
  }
  if (goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(col[i]);
    }
    return rv;
  }
  return goog.object.getValues(col);
};


/**
 * Returns the keys of the collection. Some collections have no notion of
 * keys/indexes and this function will return undefined in those cases.
 * @param {Object} col The collection-like object.
 * @return {!Array|undefined} The keys in the collection.
 */
goog.structs.getKeys = function(col) {
  if (typeof col.getKeys == 'function') {
    return col.getKeys();
  }
  // if we have getValues but no getKeys we know this is a key-less collection
  if (typeof col.getValues == 'function') {
    return undefined;
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(i);
    }
    return rv;
  }

  return goog.object.getKeys(col);
};


/**
 * Whether the collection contains the given value. This is O(n) and uses
 * equals (==) to test the existence.
 * @param {Object} col The collection-like object.
 * @param {*} val The value to check for.
 * @return {boolean} True if the map contains the value.
 */
goog.structs.contains = function(col, val) {
  if (typeof col.contains == 'function') {
    return col.contains(val);
  }
  if (typeof col.containsValue == 'function') {
    return col.containsValue(val);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains(/** @type {Array} */ (col), val);
  }
  return goog.object.containsValue(col, val);
};


/**
 * Whether the collection is empty.
 * @param {Object} col The collection-like object.
 * @return {boolean} True if empty.
 */
goog.structs.isEmpty = function(col) {
  if (typeof col.isEmpty == 'function') {
    return col.isEmpty();
  }

  // We do not use goog.string.isEmpty because here we treat the string as
  // collection and as such even whitespace matters

  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty(/** @type {Array} */ (col));
  }
  return goog.object.isEmpty(col);
};


/**
 * Removes all the elements from the collection.
 * @param {Object} col The collection-like object.
 */
goog.structs.clear = function(col) {
  // NOTE(user): This should not contain strings because strings are immutable
  if (typeof col.clear == 'function') {
    col.clear();
  } else if (goog.isArrayLike(col)) {
    goog.array.clear((/** @type {goog.array.ArrayLike} */ col));
  } else {
    goog.object.clear(col);
  }
};


/**
 * Calls a function for each value in a collection. The function takes
 * three arguments; the value, the key and the collection.
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and the return value is irrelevant.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within {@code f}.
 */
goog.structs.forEach = function(col, f, opt_obj) {
  if (typeof col.forEach == 'function') {
    col.forEach(f, opt_obj);
  } else if (goog.isArrayLike(col) || goog.isString(col)) {
    goog.array.forEach(/** @type {Array} */ (col), f, opt_obj);
  } else {
    var keys = goog.structs.getKeys(col);
    var values = goog.structs.getValues(col);
    var l = values.length;
    for (var i = 0; i < l; i++) {
      f.call(opt_obj, values[i], keys && keys[i], col);
    }
  }
};


/**
 * Calls a function for every value in the collection. When a call returns true,
 * adds the value to a new collection (Array is returned by default).
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean. If the
 *     return value is true the value is added to the result collection. If it
 *     is false the value is not included.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {!Object|!Array} A new collection where the passed values are
 *     present. If col is a key-less collection an array is returned.  If col
 *     has keys and values a plain old JS object is returned.
 */
goog.structs.filter = function(col, f, opt_obj) {
  if (typeof col.filter == 'function') {
    return col.filter(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter(/** @type {!Array} */ (col), f, opt_obj);
  }

  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0; i < l; i++) {
      if (f.call(opt_obj, values[i], keys[i], col)) {
        rv[keys[i]] = values[i];
      }
    }
  } else {
    // We should not use goog.array.filter here since we want to make sure that
    // the index is undefined as well as make sure that col is passed to the
    // function.
    rv = [];
    for (var i = 0; i < l; i++) {
      if (f.call(opt_obj, values[i], undefined, col)) {
        rv.push(values[i]);
      }
    }
  }
  return rv;
};


/**
 * Calls a function for every value in the collection and adds the result into a
 * new collection (defaults to creating a new Array).
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function
 *     takes 3 arguments (the value, the key or undefined if the collection has
 *     no notion of keys, and the collection) and should return something. The
 *     result will be used as the value in the new collection.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {!Object|!Array} A new collection with the new values.  If col is a
 *     key-less collection an array is returned.  If col has keys and values a
 *     plain old JS object is returned.
 */
goog.structs.map = function(col, f, opt_obj) {
  if (typeof col.map == 'function') {
    return col.map(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map(/** @type {!Array} */ (col), f, opt_obj);
  }

  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0; i < l; i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col);
    }
  } else {
    // We should not use goog.array.map here since we want to make sure that
    // the index is undefined as well as make sure that col is passed to the
    // function.
    rv = [];
    for (var i = 0; i < l; i++) {
      rv[i] = f.call(opt_obj, values[i], undefined, col);
    }
  }
  return rv;
};


/**
 * Calls f for each value in a collection. If any call returns true this returns
 * true (without checking the rest). If all returns false this returns false.
 *
 * @param {Object|Array|string} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {boolean} True if any value passes the test.
 */
goog.structs.some = function(col, f, opt_obj) {
  if (typeof col.some == 'function') {
    return col.some(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some(/** @type {!Array} */ (col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (f.call(opt_obj, values[i], keys && keys[i], col)) {
      return true;
    }
  }
  return false;
};


/**
 * Calls f for each value in a collection. If all calls return true this return
 * true this returns true. If any returns false this returns false at this point
 *  and does not continue to check the remaining values.
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {boolean} True if all key-value pairs pass the test.
 */
goog.structs.every = function(col, f, opt_obj) {
  if (typeof col.every == 'function') {
    return col.every(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every(/** @type {!Array} */ (col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return false;
    }
  }
  return true;
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Python style iteration utilities.
 */


goog.provide('goog.iter');
goog.provide('goog.iter.Iterator');
goog.provide('goog.iter.StopIteration');

goog.require('goog.array');
goog.require('goog.asserts');


// TODO(user): Add more functions from Python's itertools.
// http://docs.python.org/library/itertools.html


/**
 * @typedef {goog.iter.Iterator|{length:number}|{__iterator__}}
 */
goog.iter.Iterable;


// For script engines that already support iterators.
if ('StopIteration' in goog.global) {
  /**
   * Singleton Error object that is used to terminate iterations.
   * @type {Error}
   */
  goog.iter.StopIteration = goog.global['StopIteration'];
} else {
  /**
   * Singleton Error object that is used to terminate iterations.
   * @type {Error}
   * @suppress {duplicate}
   */
  goog.iter.StopIteration = Error('StopIteration');
}



/**
 * Class/interface for iterators.  An iterator needs to implement a {@code next}
 * method and it needs to throw a {@code goog.iter.StopIteration} when the
 * iteration passes beyond the end.  Iterators have no {@code hasNext} method.
 * It is recommended to always use the helper functions to iterate over the
 * iterator or in case you are only targeting JavaScript 1.7 for in loops.
 * @constructor
 */
goog.iter.Iterator = function() {};


/**
 * Returns the next value of the iteration.  This will throw the object
 * {@see goog.iter#StopIteration} when the iteration passes the end.
 * @return {*} Any object or value.
 */
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};


/**
 * Returns the {@code Iterator} object itself.  This is used to implement
 * the iterator protocol in JavaScript 1.7
 * @param {boolean=} opt_keys  Whether to return the keys or values. Default is
 *     to only return the values.  This is being used by the for-in loop (true)
 *     and the for-each-in loop (false).  Even though the param gives a hint
 *     about what the iterator will return there is no guarantee that it will
 *     return the keys when true is passed.
 * @return {!goog.iter.Iterator} The object itself.
 */
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this;
};


/**
 * Returns an iterator that knows how to iterate over the values in the object.
 * @param {goog.iter.Iterable} iterable  If the object is an iterator it
 *     will be returned as is.  If the object has a {@code __iterator__} method
 *     that will be called to get the value iterator.  If the object is an
 *     array-like object we create an iterator for that.
 * @return {!goog.iter.Iterator} An iterator that knows how to iterate over the
 *     values in {@code iterable}.
 */
goog.iter.toIterator = function(iterable) {
  if (iterable instanceof goog.iter.Iterator) {
    return iterable;
  }
  if (typeof iterable.__iterator__ == 'function') {
    return iterable.__iterator__(false);
  }
  if (goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while (true) {
        if (i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        // Don't include deleted elements.
        if (!(i in iterable)) {
          i++;
          continue;
        }
        return iterable[i++];
      }
    };
    return newIter;
  }


  // TODO(user): Should we fall back on goog.structs.getValues()?
  throw Error('Not implemented');
};


/**
 * Calls a function for each element in the iterator with the element of the
 * iterator passed as argument.
 *
 * @param {goog.iter.Iterable} iterable  The iterator to iterate
 *     over.  If the iterable is an object {@code toIterator} will be called on
 *     it.
 * @param {Function} f  The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and the
 *     return value is irrelevant.  The reason for passing undefined as the
 *     second argument is so that the same function can be used in
 *     {@see goog.array#forEach} as well as others.
 * @param {Object=} opt_obj  The object to be used as the value of 'this' within
 *     {@code f}.
 */
goog.iter.forEach = function(iterable, f, opt_obj) {
  if (goog.isArrayLike(iterable)) {
    /** @preserveTry */
    try {
      goog.array.forEach((/** @type {goog.array.ArrayLike} */ iterable), f,
                         opt_obj);
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  } else {
    iterable = goog.iter.toIterator(iterable);
    /** @preserveTry */
    try {
      while (true) {
        f.call(opt_obj, iterable.next(), undefined, iterable);
      }
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }
};


/**
 * Calls a function for every element in the iterator, and if the function
 * returns true adds the element to a new iterator.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and should
 *     return a boolean.  If the return value is true the element will be
 *     included  in the returned iteror.  If it is false the element is not
 *     included.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator in which only elements that
 *     passed the test are present.
 */
goog.iter.filter = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterable.next();
      if (f.call(opt_obj, val, undefined, iterable)) {
        return val;
      }
    }
  };
  return newIter;
};


/**
 * Creates a new iterator that returns the values in a range.  This function
 * can take 1, 2 or 3 arguments:
 * <pre>
 * range(5) same as range(0, 5, 1)
 * range(2, 5) same as range(2, 5, 1)
 * </pre>
 *
 * @param {number} startOrStop  The stop value if only one argument is provided.
 *     The start value if 2 or more arguments are provided.  If only one
 *     argument is used the start value is 0.
 * @param {number=} opt_stop  The stop value.  If left out then the first
 *     argument is used as the stop value.
 * @param {number=} opt_step  The number to increment with between each call to
 *     next.  This can be negative.
 * @return {!goog.iter.Iterator} A new iterator that returns the values in the
 *     range.
 */
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0;
  var stop = startOrStop;
  var step = opt_step || 1;
  if (arguments.length > 1) {
    start = startOrStop;
    stop = opt_stop;
  }
  if (step == 0) {
    throw Error('Range step argument must not be zero');
  }

  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if (step > 0 && start >= stop || step < 0 && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv;
  };
  return newIter;
};


/**
 * Joins the values in a iterator with a delimiter.
 * @param {goog.iter.Iterable} iterable  The iterator to get the values from.
 * @param {string} deliminator  The text to put between the values.
 * @return {string} The joined value string.
 */
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator);
};


/**
 * For every element in the iterator call a function and return a new iterator
 * with that value.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and should
 *     return a new value.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator that returns the results of
 *     applying the function to each element in the original iterator.
 */
goog.iter.map = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterable.next();
      return f.call(opt_obj, val, undefined, iterable);
    }
  };
  return newIter;
};


/**
 * Passes every element of an iterator into a function and accumulates the
 * result.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element. This function
 *     takes 2 arguments (the function's previous result or the initial value,
 *     and the value of the current element).
 *     function(previousValue, currentElement) : newValue.
 * @param {*} val The initial value to pass into the function on the first call.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {*} Result of evaluating f repeatedly across the values of
 *     the iterator.
 */
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  var rval = val;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val);
  });
  return rval;
};


/**
 * Goes through the values in the iterator. Calls f for each these and if any of
 * them returns true, this returns true (without checking the rest). If all
 * return false this will return false.
 *
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {boolean} true if any value passes the test.
 */
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  /** @preserveTry */
  try {
    while (true) {
      if (f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return true;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return false;
};


/**
 * Goes through the values in the iterator. Calls f for each these and if any of
 * them returns false this returns false (without checking the rest). If all
 * return true this will return true.
 *
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {boolean} true if every value passes the test.
 */
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  /** @preserveTry */
  try {
    while (true) {
      if (!f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return true;
};


/**
 * Takes zero or more iterators and returns one iterator that will iterate over
 * them in the order chained.
 * @param {...goog.iter.Iterator} var_args  Any number of iterator objects.
 * @return {!goog.iter.Iterator} Returns a new iterator that will iterate over
 *     all the given iterators' contents.
 */
goog.iter.chain = function(var_args) {
  var args = arguments;
  var length = args.length;
  var i = 0;
  var newIter = new goog.iter.Iterator;

  /**
   * @return {*} The next item in the iteration.
   * @this {goog.iter.Iterator}
   */
  newIter.next = function() {
    /** @preserveTry */
    try {
      if (i >= length) {
        throw goog.iter.StopIteration;
      }
      var current = goog.iter.toIterator(args[i]);
      return current.next();
    } catch (ex) {
      if (ex !== goog.iter.StopIteration || i >= length) {
        throw ex;
      } else {
        // In case we got a StopIteration increment counter and try again.
        i++;
        return this.next();
      }
    }
  };

  return newIter;
};


/**
 * Builds a new iterator that iterates over the original, but skips elements as
 * long as a supplied function returns true.
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator that drops elements from the
 *     original iterator as long as {@code f} is true.
 */
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var dropping = true;
  newIter.next = function() {
    while (true) {
      var val = iterable.next();
      if (dropping && f.call(opt_obj, val, undefined, iterable)) {
        continue;
      } else {
        dropping = false;
      }
      return val;
    }
  };
  return newIter;
};


/**
 * Builds a new iterator that iterates over the original, but only as long as a
 * supplied function returns true.
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object in f when called.
 * @return {!goog.iter.Iterator} A new iterator that keeps elements in the
 *     original iterator as long as the function is true.
 */
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var taking = true;
  newIter.next = function() {
    while (true) {
      if (taking) {
        var val = iterable.next();
        if (f.call(opt_obj, val, undefined, iterable)) {
          return val;
        } else {
          taking = false;
        }
      } else {
        throw goog.iter.StopIteration;
      }
    }
  };
  return newIter;
};


/**
 * Converts the iterator to an array
 * @param {goog.iter.Iterable} iterable  The iterator to convert to an array.
 * @return {!Array} An array of the elements the iterator iterates over.
 */
goog.iter.toArray = function(iterable) {
  // Fast path for array-like.
  if (goog.isArrayLike(iterable)) {
    return goog.array.toArray((/** @type {!goog.array.ArrayLike} */ iterable));
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val);
  });
  return array;
};


/**
 * Iterates over 2 iterators and returns true if they contain the same sequence
 * of elements and have the same length.
 * @param {goog.iter.Iterable} iterable1  The first iterable object.
 * @param {goog.iter.Iterable} iterable2  The second iterable object.
 * @return {boolean} true if the iterators contain the same sequence of
 *     elements and have the same length.
 */
goog.iter.equals = function(iterable1, iterable2) {
  iterable1 = goog.iter.toIterator(iterable1);
  iterable2 = goog.iter.toIterator(iterable2);
  var b1, b2;
  /** @preserveTry */
  try {
    while (true) {
      b1 = b2 = false;
      var val1 = iterable1.next();
      b1 = true;
      var val2 = iterable2.next();
      b2 = true;
      if (val1 != val2) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    } else {
      if (b1 && !b2) {
        // iterable1 done but iterable2 is not done.
        return false;
      }
      if (!b2) {
        /** @preserveTry */
        try {
          // iterable2 not done?
          val2 = iterable2.next();
          // iterable2 not done but iterable1 is done
          return false;
        } catch (ex1) {
          if (ex1 !== goog.iter.StopIteration) {
            throw ex1;
          }
          // iterable2 done as well... They are equal
          return true;
        }
      }
    }
  }
  return false;
};


/**
 * Advances the iterator to the next position, returning the given default value
 * instead of throwing an exception if the iterator has no more entries.
 * @param {goog.iter.Iterable} iterable The iterable object.
 * @param {*} defaultValue The value to return if the iterator is empty.
 * @return {*} The next item in the iteration, or defaultValue if the iterator
 *     was empty.
 */
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next();
  } catch (e) {
    if (e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue;
  }
};


/**
 * Cartesian product of zero or more sets.  Gives an iterator that gives every
 * combination of one element chosen from each set.  For example,
 * ([1, 2], [3, 4]) gives ([1, 3], [1, 4], [2, 3], [2, 4]).
 * @see http://docs.python.org/library/itertools.html#itertools.product
 * @param {...!goog.array.ArrayLike.<*>} var_args Zero or more sets, as arrays.
 * @return {!goog.iter.Iterator} An iterator that gives each n-tuple (as an
 *     array).
 */
goog.iter.product = function(var_args) {
  var someArrayEmpty = goog.array.some(arguments, function(arr) {
    return !arr.length;
  });

  // An empty set in a cartesian product gives an empty set.
  if (someArrayEmpty || !arguments.length) {
    return new goog.iter.Iterator();
  }

  var iter = new goog.iter.Iterator();
  var arrays = arguments;

  // The first indicies are [0, 0, ...]
  var indicies = goog.array.repeat(0, arrays.length);

  iter.next = function() {

    if (indicies) {
      var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) {
        return arrays[arrayIndex][valueIndex];
      });

      // Generate the next-largest indicies for the next call.
      // Increase the rightmost index. If it goes over, increase the next
      // rightmost (like carry-over addition).
      for (var i = indicies.length - 1; i >= 0; i--) {
        // Assertion prevents compiler warning below.
        goog.asserts.assert(indicies);
        if (indicies[i] < arrays[i].length - 1) {
          indicies[i]++;
          break;
        }

        // We're at the last indicies (the last element of every array), so
        // the iteration is over on the next call.
        if (i == 0) {
          indicies = null;
          break;
        }
        // Reset the index in this column and loop back to increment the
        // next one.
        indicies[i] = 0;
      }
      return retVal;
    }

    throw goog.iter.StopIteration;
  };

  return iter;
};


/**
 * Create an iterator to cycle over the iterable's elements indefinitely.
 * For example, ([1, 2, 3]) would return : 1, 2, 3, 1, 2, 3, ...
 * @see: http://docs.python.org/library/itertools.html#itertools.cycle.
 * @param {!goog.iter.Iterable} iterable The iterable object.
 * @return {!goog.iter.Iterator} An iterator that iterates indefinitely over
 * the values in {@code iterable}.
 */
goog.iter.cycle = function(iterable) {

  var baseIterator = goog.iter.toIterator(iterable);

  // We maintain a cache to store the iterable elements as we iterate
  // over them. The cache is used to return elements once we have
  // iterated over the iterable once.
  var cache = [];
  var cacheIndex = 0;

  var iter = new goog.iter.Iterator();

  // This flag is set after the iterable is iterated over once
  var useCache = false;

  iter.next = function() {
    var returnElement = null;

    // Pull elements off the original iterator if not using cache
    if (!useCache) {

      try {
        // Return the element from the iterable
        returnElement = baseIterator.next();
        cache.push(returnElement);
        return returnElement;
      } catch (e) {
        // If an exception other than StopIteration is thrown
        // or if there are no elements to iterate over (the iterable was empty)
        // throw an exception
        if (e != goog.iter.StopIteration || goog.array.isEmpty(cache)) {
          throw e;
        }
        // set useCache to true after we know that a 'StopIteration' exception
        // was thrown and the cache is not empty (to handle the 'empty iterable'
        // use case)
        useCache = true;
      }
    }

    returnElement = cache[cacheIndex];
    cacheIndex = (cacheIndex + 1) % cache.length;

    return returnElement;
  };

  return iter;
};
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
 * @fileoverview Datastructure: Hash Map.
 *
 *
 * This file contains an implementation of a Map structure. It implements a lot
 * of the methods used in goog.structs so those functions work on hashes.  For
 * convenience with common usage the methods accept any type for the key, though
 * internally they will be cast to strings.
 */


goog.provide('goog.structs.Map');

goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.object');
goog.require('goog.structs');



/**
 * Class for Hash Map datastructure.
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 */
goog.structs.Map = function(opt_map, var_args) {

  /**
   * Underlying JS object used to implement the map.
   * @type {!Object}
   * @private
   */
  this.map_ = {};

  /**
   * An array of keys. This is necessary for two reasons:
   *   1. Iterating the keys using for (var key in this.map_) allocates an
   *      object for every key in IE which is really bad for IE6 GC perf.
   *   2. Without a side data structure, we would need to escape all the keys
   *      as that would be the only way we could tell during iteration if the
   *      key was an internal key or a property of the object.
   *
   * This array can contain deleted keys so it's necessary to check the map
   * as well to see if the key is still in the map (this doesn't require a
   * memory allocation in IE).
   * @type {!Array.<string>}
   * @private
   */
  this.keys_ = [];

  var argLength = arguments.length;

  if (argLength > 1) {
    if (argLength % 2) {
      throw Error('Uneven number of arguments');
    }
    for (var i = 0; i < argLength; i += 2) {
      this.set(arguments[i], arguments[i + 1]);
    }
  } else if (opt_map) {
    this.addAll(/** @type {Object} */ (opt_map));
  }
};


/**
 * The number of key value pairs in the map.
 * @private
 * @type {number}
 */
goog.structs.Map.prototype.count_ = 0;


/**
 * Version used to detect changes while iterating.
 * @private
 * @type {number}
 */
goog.structs.Map.prototype.version_ = 0;


/**
 * @return {number} The number of key-value pairs in the map.
 */
goog.structs.Map.prototype.getCount = function() {
  return this.count_;
};


/**
 * Returns the values of the map.
 * @return {!Array} The values in the map.
 */
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();

  var rv = [];
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key]);
  }
  return rv;
};


/**
 * Returns the keys of the map.
 * @return {!Array.<string>} Array of string values.
 */
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return /** @type {!Array.<string>} */ (this.keys_.concat());
};


/**
 * Whether the map contains the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the map contains the key.
 */
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key);
};


/**
 * Whether the map contains the given value. This is O(n).
 * @param {*} val The value to check for.
 * @return {boolean} Whether the map contains the value.
 */
goog.structs.Map.prototype.containsValue = function(val) {
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    if (goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Whether this map is equal to the argument map.
 * @param {goog.structs.Map} otherMap The map against which to test equality.
 * @param {function(*, *) : boolean=} opt_equalityFn Optional equality function
 *     to test equality of values. If not specified, this will test whether
 *     the values contained in each map are identical objects.
 * @return {boolean} Whether the maps are equal.
 */
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if (this === otherMap) {
    return true;
  }

  if (this.count_ != otherMap.getCount()) {
    return false;
  }

  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;

  this.cleanupKeysArray_();
  for (var key, i = 0; key = this.keys_[i]; i++) {
    if (!equalityFn(this.get(key), otherMap.get(key))) {
      return false;
    }
  }

  return true;
};


/**
 * Default equality test for values.
 * @param {*} a The first value.
 * @param {*} b The second value.
 * @return {boolean} Whether a and b reference the same object.
 */
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b;
};


/**
 * @return {boolean} Whether the map is empty.
 */
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0;
};


/**
 * Removes all key-value pairs from the map.
 */
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0;
};


/**
 * Removes a key-value pair based on the key. This is O(logN) amortized due to
 * updating the keys array whenever the count becomes half the size of the keys
 * in the keys array.
 * @param {*} key  The key to remove.
 * @return {boolean} Whether object was removed.
 */
goog.structs.Map.prototype.remove = function(key) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;

    // clean up the keys array if the threshhold is hit
    if (this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_();
    }

    return true;
  }
  return false;
};


/**
 * Cleans up the temp keys array by removing entries that are no longer in the
 * map.
 * @private
 */
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if (this.count_ != this.keys_.length) {
    // First remove keys that are no longer in the map.
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }

  if (this.count_ != this.keys_.length) {
    // If the count still isn't correct, that means we have duplicates. This can
    // happen when the same key is added and removed multiple times. Now we have
    // to allocate one extra Object to remove the duplicates. This could have
    // been done in the first pass, but in the common case, we can avoid
    // allocating an extra object by only doing this when necessary.
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (!(goog.structs.Map.hasKey_(seen, key))) {
        this.keys_[destIndex++] = key;
        seen[key] = 1;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
};


/**
 * Returns the value for the given key.  If the key is not found and the default
 * value is not given this will return {@code undefined}.
 * @param {*} key The key to get the value for.
 * @param {*=} opt_val The value to return if no item is found for the given
 *     key, defaults to undefined.
 * @return {*} The value for the given key.
 */
goog.structs.Map.prototype.get = function(key, opt_val) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the map.
 * @param {*} key The key.
 * @param {*} value The value to add.
 */
goog.structs.Map.prototype.set = function(key, value) {
  if (!(goog.structs.Map.hasKey_(this.map_, key))) {
    this.count_++;
    this.keys_.push(key);
    // Only change the version if we add a new key.
    this.version_++;
  }
  this.map_[key] = value;
};


/**
 * Adds multiple key-value pairs from another goog.structs.Map or Object.
 * @param {Object} map  Object containing the data to add.
 */
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if (map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues();
  } else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map);
  }
  // we could use goog.array.forEach here but I don't want to introduce that
  // dependency just for this.
  for (var i = 0; i < keys.length; i++) {
    this.set(keys[i], values[i]);
  }
};


/**
 * Clones a map and returns a new map.
 * @return {!goog.structs.Map} A new map with the same key-value pairs.
 */
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this);
};


/**
 * Returns a new map in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * It acts very similarly to {goog.object.transpose(Object)}.
 *
 * @return {!goog.structs.Map} The transposed map.
 */
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map();
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key);
  }

  return transposed;
};


/**
 * @return {!Object} Object representation of the map.
 */
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  var obj = {};
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key];
  }
  return obj;
};


/**
 * Returns an iterator that iterates over the keys in the map.  Removal of keys
 * while iterating might have undesired side effects.
 * @return {!goog.iter.Iterator} An iterator over the keys in the map.
 */
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true);
};


/**
 * Returns an iterator that iterates over the values in the map.  Removal of
 * keys while iterating might have undesired side effects.
 * @return {!goog.iter.Iterator} An iterator over the values in the map.
 */
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false);
};


/**
 * Returns an iterator that iterates over the values or the keys in the map.
 * This throws an exception if the map was mutated since the iterator was
 * created.
 * @param {boolean=} opt_keys True to iterate over the keys. False to iterate
 *     over the values.  The default value is false.
 * @return {!goog.iter.Iterator} An iterator over the values or keys in the map.
 */
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  // Clean up keys to minimize the risk of iterating over dead keys.
  this.cleanupKeysArray_();

  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;

  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      if (version != selfObj.version_) {
        throw Error('The map has changed since the iterator was created');
      }
      if (i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key];
    }
  };
  return newIter;
};


/**
 * Safe way to test for hasOwnProperty.  It even allows testing for
 * 'hasOwnProperty'.
 * @param {Object} obj The object to test for presence of the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the object has the key.
 * @private
 */
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
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
 * @fileoverview Datastructure: Set.
 *
 *
 * This class implements a set data structure. Adding and removing is O(1). It
 * supports both object and primitive values. Be careful because you can add
 * both 1 and new Number(1), because these are not the same. You can even add
 * multiple new Number(1) because these are not equal.
 */


goog.provide('goog.structs.Set');

goog.require('goog.structs');
goog.require('goog.structs.Collection');
goog.require('goog.structs.Map');



/**
 * A set that can contain both primitives and objects.  Adding and removing
 * elements is O(1).  Primitives are treated as identical if they have the same
 * type and convert to the same string.  Objects are treated as identical only
 * if they are references to the same object.  WARNING: A goog.structs.Set can
 * contain both 1 and (new Number(1)), because they are not the same.  WARNING:
 * Adding (new Number(1)) twice will yield two distinct elements, because they
 * are two different objects.  WARNING: Any object that is added to a
 * goog.structs.Set will be modified!  Because goog.getUid() is used to
 * identify objects, every object in the set will be mutated.
 * @param {Array|Object=} opt_values Initial values to start with.
 * @constructor
 * @implements {goog.structs.Collection}
 */
goog.structs.Set = function(opt_values) {
  this.map_ = new goog.structs.Map;
  if (opt_values) {
    this.addAll(opt_values);
  }
};


/**
 * Obtains a unique key for an element of the set.  Primitives will yield the
 * same key if they have the same type and convert to the same string.  Object
 * references will yield the same key only if they refer to the same object.
 * @param {*} val Object or primitive value to get a key for.
 * @return {string} A unique key for this value/object.
 * @private
 */
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if (type == 'object' && val || type == 'function') {
    return 'o' + goog.getUid(/** @type {Object} */ (val));
  } else {
    return type.substr(0, 1) + val;
  }
};


/**
 * @return {number} The number of elements in the set.
 */
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount();
};


/**
 * Add a primitive or an object to the set.
 * @param {*} element The primitive or object to add.
 */
goog.structs.Set.prototype.add = function(element) {
  this.map_.set(goog.structs.Set.getKey_(element), element);
};


/**
 * Adds all the values in the given collection to this set.
 * @param {Array|Object} col A collection containing the elements to add.
 */
goog.structs.Set.prototype.addAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.add(values[i]);
  }
};


/**
 * Removes all values in the given collection from this set.
 * @param {Array|Object} col A collection containing the elements to remove.
 */
goog.structs.Set.prototype.removeAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.remove(values[i]);
  }
};


/**
 * Removes the given element from this set.
 * @param {*} element The primitive or object to remove.
 * @return {boolean} Whether the element was found and removed.
 */
goog.structs.Set.prototype.remove = function(element) {
  return this.map_.remove(goog.structs.Set.getKey_(element));
};


/**
 * Removes all elements from this set.
 */
goog.structs.Set.prototype.clear = function() {
  this.map_.clear();
};


/**
 * Tests whether this set is empty.
 * @return {boolean} True if there are no elements in this set.
 */
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty();
};


/**
 * Tests whether this set contains the given element.
 * @param {*} element The primitive or object to test for.
 * @return {boolean} True if this set contains the given element.
 */
goog.structs.Set.prototype.contains = function(element) {
  return this.map_.containsKey(goog.structs.Set.getKey_(element));
};


/**
 * Tests whether this set contains all the values in a given collection.
 * Repeated elements in the collection are ignored, e.g.  (new
 * goog.structs.Set([1, 2])).containsAll([1, 1]) is True.
 * @param {Object} col A collection-like object.
 * @return {boolean} True if the set contains all elements.
 */
goog.structs.Set.prototype.containsAll = function(col) {
  return goog.structs.every(col, this.contains, this);
};


/**
 * Finds all values that are present in both this set and the given collection.
 * @param {Array|Object} col A collection.
 * @return {goog.structs.Set} A new set containing all the values (primitives
 *     or objects) present in both this set and the given collection.
 */
goog.structs.Set.prototype.intersection = function(col) {
  var result = new goog.structs.Set();

  var values = goog.structs.getValues(col);
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    if (this.contains(value)) {
      result.add(value);
    }
  }

  return result;
};


/**
 * Returns an array containing all the elements in this set.
 * @return {!Array} An array containing all the elements in this set.
 */
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues();
};


/**
 * Creates a shallow clone of this set.
 * @return {goog.structs.Set} A new set containing all the same elements as
 *     this set.
 */
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this);
};


/**
 * Tests whether the given collection consists of the same elements as this set,
 * regardless of order, without repetition.  Primitives are treated as equal if
 * they have the same type and convert to the same string; objects are treated
 * as equal if they are references to the same object.  This operation is O(n).
 * @param {Object} col A collection.
 * @return {boolean} True if the given collection consists of the same elements
 *     as this set, regardless of order, without repetition.
 */
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col);
};


/**
 * Tests whether the given collection contains all the elements in this set.
 * Primitives are treated as equal if they have the same type and convert to the
 * same string; objects are treated as equal if they are references to the same
 * object.  This operation is O(n).
 * @param {Object} col A collection.
 * @return {boolean} True if this set is a subset of the given collection.
 */
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if (this.getCount() > colCount) {
    return false;
  }
  // TODO(user) Find the minimal collection size where the conversion makes
  // the contains() method faster.
  if (!(col instanceof goog.structs.Set) && colCount > 5) {
    // Convert to a goog.structs.Set so that goog.structs.contains runs in
    // O(1) time instead of O(n) time.
    col = new goog.structs.Set(col);
  }
  return goog.structs.every(this, function(value) {
    return goog.structs.contains(col, value);
  });
};


/**
 * Returns an iterator that iterates over the elements in this set.
 * @param {boolean=} opt_keys This argument is ignored.
 * @return {goog.iter.Iterator} An iterator over the elements in this set.
 */
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  return this.map_.__iterator__(false);
};
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
 * @fileoverview Logging and debugging utilities.
 *

 * @see ../demos/debug.html
 */

goog.provide('goog.debug');

goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.structs.Set');
goog.require('goog.userAgent');


/**
 * Catches onerror events fired by windows and similar objects.
 * @param {function(Object)} logFunc The function to call with the error
 *    information.
 * @param {boolean=} opt_cancel Whether to stop the error from reaching the
 *    browser.
 * @param {Object=} opt_target Object that fires onerror events.
 */
goog.debug.catchErrors = function(logFunc, opt_cancel, opt_target) {
  var target = opt_target || goog.global;
  var oldErrorHandler = target.onerror;
  // Chrome interprets onerror return value backwards (http://crbug.com/92062).
  // Safari doesn't support onerror at all.
  var retVal = goog.userAgent.WEBKIT ? !opt_cancel : !!opt_cancel;
  target.onerror = function(message, url, line) {
    if (oldErrorHandler) {
      oldErrorHandler(message, url, line);
    }
    logFunc({
      message: message,
      fileName: url,
      line: line
    });
    return retVal;
  };
};


/**
 * Creates a string representing an object and all its properties.
 * @param {Object|null|undefined} obj Object to expose.
 * @param {boolean=} opt_showFn Show the functions as well as the properties,
 *     default is false.
 * @return {string} The string representation of {@code obj}.
 */
goog.debug.expose = function(obj, opt_showFn) {
  if (typeof obj == 'undefined') {
    return 'undefined';
  }
  if (obj == null) {
    return 'NULL';
  }
  var str = [];

  for (var x in obj) {
    if (!opt_showFn && goog.isFunction(obj[x])) {
      continue;
    }
    var s = x + ' = ';
    /** @preserveTry */
    try {
      s += obj[x];
    } catch (e) {
      s += '*** ' + e + ' ***';
    }
    str.push(s);
  }
  return str.join('\n');
};


/**
 * Creates a string representing a given primitive or object, and for an
 * object, all its properties and nested objects.  WARNING: If an object is
 * given, it and all its nested objects will be modified.  To detect reference
 * cycles, this method identifies objects using goog.getUid() which mutates the
 * object.
 * @param {*} obj Object to expose.
 * @param {boolean=} opt_showFn Also show properties that are functions (by
 *     default, functions are omitted).
 * @return {string} A string representation of {@code obj}.
 */
goog.debug.deepExpose = function(obj, opt_showFn) {
  var previous = new goog.structs.Set();
  var str = [];

  var helper = function(obj, space) {
    var nestspace = space + '  ';

    var indentMultiline = function(str) {
      return str.replace(/\n/g, '\n' + space);
    };

    /** @preserveTry */
    try {
      if (!goog.isDef(obj)) {
        str.push('undefined');
      } else if (goog.isNull(obj)) {
        str.push('NULL');
      } else if (goog.isString(obj)) {
        str.push('"' + indentMultiline(obj) + '"');
      } else if (goog.isFunction(obj)) {
        str.push(indentMultiline(String(obj)));
      } else if (goog.isObject(obj)) {
        if (previous.contains(obj)) {
          // TODO(user): This is a bug; it falsely detects non-loops as loops
          // when the reference tree contains two references to the same object.
          str.push('*** reference loop detected ***');
        } else {
          previous.add(obj);
          str.push('{');
          for (var x in obj) {
            if (!opt_showFn && goog.isFunction(obj[x])) {
              continue;
            }
            str.push('\n');
            str.push(nestspace);
            str.push(x + ' = ');
            helper(obj[x], nestspace);
          }
          str.push('\n' + space + '}');
        }
      } else {
        str.push(obj);
      }
    } catch (e) {
      str.push('*** ' + e + ' ***');
    }
  };

  helper(obj, '');
  return str.join('');
};


/**
 * Recursively outputs a nested array as a string.
 * @param {Array} arr The array.
 * @return {string} String representing nested array.
 */
goog.debug.exposeArray = function(arr) {
  var str = [];
  for (var i = 0; i < arr.length; i++) {
    if (goog.isArray(arr[i])) {
      str.push(goog.debug.exposeArray(arr[i]));
    } else {
      str.push(arr[i]);
    }
  }
  return '[ ' + str.join(', ') + ' ]';
};


/**
 * Exposes an exception that has been caught by a try...catch and outputs the
 * error with a stack trace.
 * @param {Object} err Error object or string.
 * @param {Function=} opt_fn Optional function to start stack trace from.
 * @return {string} Details of exception.
 */
goog.debug.exposeException = function(err, opt_fn) {
  /** @preserveTry */
  try {
    var e = goog.debug.normalizeErrorObject(err);

    // Create the error message
    var error = 'Message: ' + goog.string.htmlEscape(e.message) +
        '\nUrl: <a href="view-source:' + e.fileName + '" target="_new">' +
        e.fileName + '</a>\nLine: ' + e.lineNumber + '\n\nBrowser stack:\n' +
        goog.string.htmlEscape(e.stack + '-> ') +
        '[end]\n\nJS stack traversal:\n' + goog.string.htmlEscape(
            goog.debug.getStacktrace(opt_fn) + '-> ');
    return error;
  } catch (e2) {
    return 'Exception trying to expose exception! You win, we lose. ' + e2;
  }
};


/**
 * Normalizes the error/exception object between browsers.
 * @param {Object} err Raw error object.
 * @return {Object} Normalized error object.
 */
goog.debug.normalizeErrorObject = function(err) {
  var href = goog.getObjectByName('window.location.href');
  if (goog.isString(err)) {
    return {
      'message': err,
      'name': 'Unknown error',
      'lineNumber': 'Not available',
      'fileName': href,
      'stack': 'Not available'
    };
  }

  var lineNumber, fileName;
  var threwError = false;

  try {
    lineNumber = err.lineNumber || err.line || 'Not available';
  } catch (e) {
    // Firefox 2 sometimes throws an error when accessing 'lineNumber':
    // Message: Permission denied to get property UnnamedClass.lineNumber
    lineNumber = 'Not available';
    threwError = true;
  }

  try {
    fileName = err.fileName || err.filename || err.sourceURL || href;
  } catch (e) {
    // Firefox 2 may also throw an error when accessing 'filename'.
    fileName = 'Not available';
    threwError = true;
  }

  // The IE Error object contains only the name and the message.
  // The Safari Error object uses the line and sourceURL fields.
  if (threwError || !err.lineNumber || !err.fileName || !err.stack) {
    return {
      'message': err.message,
      'name': err.name,
      'lineNumber': lineNumber,
      'fileName': fileName,
      'stack': err.stack || 'Not available'
    };
  }

  // Standards error object
  return err;
};


/**
 * Converts an object to an Error if it's a String,
 * adds a stacktrace if there isn't one,
 * and optionally adds an extra message.
 * @param {Error|string} err  the original thrown object or string.
 * @param {string=} opt_message  optional additional message to add to the
 *     error.
 * @return {Error} If err is a string, it is used to create a new Error,
 *     which is enhanced and returned.  Otherwise err itself is enhanced
 *     and returned.
 */
goog.debug.enhanceError = function(err, opt_message) {
  var error = typeof err == 'string' ? Error(err) : err;
  if (!error.stack) {
    error.stack = goog.debug.getStacktrace(arguments.callee.caller);
  }
  if (opt_message) {
    // find the first unoccupied 'messageX' property
    var x = 0;
    while (error['message' + x]) {
      ++x;
    }
    error['message' + x] = String(opt_message);
  }
  return error;
};


/**
 * Gets the current stack trace. Simple and iterative - doesn't worry about
 * catching circular references or getting the args.
 * @param {number=} opt_depth Optional maximum depth to trace back to.
 * @return {string} A string with the function names of all functions in the
 *     stack, separated by \n.
 */
goog.debug.getStacktraceSimple = function(opt_depth) {
  var sb = [];
  var fn = arguments.callee.caller;
  var depth = 0;

  while (fn && (!opt_depth || depth < opt_depth)) {
    sb.push(goog.debug.getFunctionName(fn));
    sb.push('()\n');
    /** @preserveTry */
    try {
      fn = fn.caller;
    } catch (e) {
      sb.push('[exception trying to get caller]\n');
      break;
    }
    depth++;
    if (depth >= goog.debug.MAX_STACK_DEPTH) {
      sb.push('[...long stack...]');
      break;
    }
  }
  if (opt_depth && depth >= opt_depth) {
    sb.push('[...reached max depth limit...]');
  } else {
    sb.push('[end]');
  }

  return sb.join('');
};


/**
 * Max length of stack to try and output
 * @type {number}
 */
goog.debug.MAX_STACK_DEPTH = 50;


/**
 * Gets the current stack trace, either starting from the caller or starting
 * from a specified function that's currently on the call stack.
 * @param {Function=} opt_fn Optional function to start getting the trace from.
 *     If not provided, defaults to the function that called this.
 * @return {string} Stack trace.
 */
goog.debug.getStacktrace = function(opt_fn) {
  return goog.debug.getStacktraceHelper_(opt_fn || arguments.callee.caller, []);
};


/**
 * Private helper for getStacktrace().
 * @param {Function} fn Function to start getting the trace from.
 * @param {Array} visited List of functions visited so far.
 * @return {string} Stack trace starting from function fn.
 * @private
 */
goog.debug.getStacktraceHelper_ = function(fn, visited) {
  var sb = [];

  // Circular reference, certain functions like bind seem to cause a recursive
  // loop so we need to catch circular references
  if (goog.array.contains(visited, fn)) {
    sb.push('[...circular reference...]');

  // Traverse the call stack until function not found or max depth is reached
  } else if (fn && visited.length < goog.debug.MAX_STACK_DEPTH) {
    sb.push(goog.debug.getFunctionName(fn) + '(');
    var args = fn.arguments;
    for (var i = 0; i < args.length; i++) {
      if (i > 0) {
        sb.push(', ');
      }
      var argDesc;
      var arg = args[i];
      switch (typeof arg) {
        case 'object':
          argDesc = arg ? 'object' : 'null';
          break;

        case 'string':
          argDesc = arg;
          break;

        case 'number':
          argDesc = String(arg);
          break;

        case 'boolean':
          argDesc = arg ? 'true' : 'false';
          break;

        case 'function':
          argDesc = goog.debug.getFunctionName(arg);
          argDesc = argDesc ? argDesc : '[fn]';
          break;

        case 'undefined':
        default:
          argDesc = typeof arg;
          break;
      }

      if (argDesc.length > 40) {
        argDesc = argDesc.substr(0, 40) + '...';
      }
      sb.push(argDesc);
    }
    visited.push(fn);
    sb.push(')\n');
    /** @preserveTry */
    try {
      sb.push(goog.debug.getStacktraceHelper_(fn.caller, visited));
    } catch (e) {
      sb.push('[exception trying to get caller]\n');
    }

  } else if (fn) {
    sb.push('[...long stack...]');
  } else {
    sb.push('[end]');
  }
  return sb.join('');
};


/**
 * Set a custom function name resolver.
 * @param {function(Function): string} resolver Resolves functions to their
 *     names.
 */
goog.debug.setFunctionResolver = function(resolver) {
  goog.debug.fnNameResolver_ = resolver;
};


/**
 * Gets a function name
 * @param {Function} fn Function to get name of.
 * @return {string} Function's name.
 */
goog.debug.getFunctionName = function(fn) {
  if (goog.debug.fnNameCache_[fn]) {
    return goog.debug.fnNameCache_[fn];
  }
  if (goog.debug.fnNameResolver_) {
    var name = goog.debug.fnNameResolver_(fn);
    if (name) {
      goog.debug.fnNameCache_[fn] = name;
      return name;
    }
  }

  // Heuristically determine function name based on code.
  var functionSource = String(fn);
  if (!goog.debug.fnNameCache_[functionSource]) {
    var matches = /function ([^\(]+)/.exec(functionSource);
    if (matches) {
      var method = matches[1];
      goog.debug.fnNameCache_[functionSource] = method;
    } else {
      goog.debug.fnNameCache_[functionSource] = '[Anonymous]';
    }
  }

  return goog.debug.fnNameCache_[functionSource];
};


/**
 * Makes whitespace visible by replacing it with printable characters.
 * This is useful in finding diffrences between the expected and the actual
 * output strings of a testcase.
 * @param {string} string whose whitespace needs to be made visible.
 * @return {string} string whose whitespace is made visible.
 */
goog.debug.makeWhitespaceVisible = function(string) {
  return string.replace(/ /g, '[_]')
      .replace(/\f/g, '[f]')
      .replace(/\n/g, '[n]\n')
      .replace(/\r/g, '[r]')
      .replace(/\t/g, '[t]');
};


/**
 * Hash map for storing function names that have already been looked up.
 * @type {Object}
 * @private
 */
goog.debug.fnNameCache_ = {};


/**
 * Resolves functions to their names.  Resolved function names will be cached.
 * @type {function(Function):string}
 * @private
 */
goog.debug.fnNameResolver_;
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
 * @fileoverview Definition of the LogRecord class. Please minimize
 * dependencies this file has on other closure classes as any dependency it
 * takes won't be able to use the logging infrastructure.
 *
 */

goog.provide('goog.debug.LogRecord');



/**
 * LogRecord objects are used to pass logging requests between
 * the logging framework and individual log Handlers.
 * @constructor
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {string} loggerName The name of the source logger.
 * @param {number=} opt_time Time this log record was created if other than now.
 *     If 0, we use #goog.now.
 * @param {number=} opt_sequenceNumber Sequence number of this log record. This
 *     should only be passed in when restoring a log record from persistence.
 */
goog.debug.LogRecord = function(level, msg, loggerName,
    opt_time, opt_sequenceNumber) {
  this.reset(level, msg, loggerName, opt_time, opt_sequenceNumber);
};


/**
 * Time the LogRecord was created.
 * @type {number}
 * @private
 */
goog.debug.LogRecord.prototype.time_;


/**
 * Level of the LogRecord
 * @type {goog.debug.Logger.Level}
 * @private
 */
goog.debug.LogRecord.prototype.level_;


/**
 * Message associated with the record
 * @type {string}
 * @private
 */
goog.debug.LogRecord.prototype.msg_;


/**
 * Name of the logger that created the record.
 * @type {string}
 * @private
 */
goog.debug.LogRecord.prototype.loggerName_;


/**
 * Sequence number for the LogRecord. Each record has a unique sequence number
 * that is greater than all log records created before it.
 * @type {number}
 * @private
 */
goog.debug.LogRecord.prototype.sequenceNumber_ = 0;


/**
 * Exception associated with the record
 * @type {Object}
 * @private
 */
goog.debug.LogRecord.prototype.exception_ = null;


/**
 * Exception text associated with the record
 * @type {?string}
 * @private
 */
goog.debug.LogRecord.prototype.exceptionText_ = null;


/**
 * @define {boolean} Whether to enable log sequence numbers.
 */
goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS = true;


/**
 * A sequence counter for assigning increasing sequence numbers to LogRecord
 * objects.
 * @type {number}
 * @private
 */
goog.debug.LogRecord.nextSequenceNumber_ = 0;


/**
 * Sets all fields of the log record.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {string} loggerName The name of the source logger.
 * @param {number=} opt_time Time this log record was created if other than now.
 *     If 0, we use #goog.now.
 * @param {number=} opt_sequenceNumber Sequence number of this log record. This
 *     should only be passed in when restoring a log record from persistence.
 */
goog.debug.LogRecord.prototype.reset = function(level, msg, loggerName,
    opt_time, opt_sequenceNumber) {
  if (goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS) {
    this.sequenceNumber_ = typeof opt_sequenceNumber == 'number' ?
        opt_sequenceNumber : goog.debug.LogRecord.nextSequenceNumber_++;
  }

  this.time_ = opt_time || goog.now();
  this.level_ = level;
  this.msg_ = msg;
  this.loggerName_ = loggerName;
  delete this.exception_;
  delete this.exceptionText_;
};


/**
 * Get the source Logger's name.
 *
 * @return {string} source logger name (may be null).
 */
goog.debug.LogRecord.prototype.getLoggerName = function() {
  return this.loggerName_;
};


/**
 * Get the exception that is part of the log record.
 *
 * @return {Object} the exception.
 */
goog.debug.LogRecord.prototype.getException = function() {
  return this.exception_;
};


/**
 * Set the exception that is part of the log record.
 *
 * @param {Object} exception the exception.
 */
goog.debug.LogRecord.prototype.setException = function(exception) {
  this.exception_ = exception;
};


/**
 * Get the exception text that is part of the log record.
 *
 * @return {?string} Exception text.
 */
goog.debug.LogRecord.prototype.getExceptionText = function() {
  return this.exceptionText_;
};


/**
 * Set the exception text that is part of the log record.
 *
 * @param {string} text The exception text.
 */
goog.debug.LogRecord.prototype.setExceptionText = function(text) {
  this.exceptionText_ = text;
};


/**
 * Get the source Logger's name.
 *
 * @param {string} loggerName source logger name (may be null).
 */
goog.debug.LogRecord.prototype.setLoggerName = function(loggerName) {
  this.loggerName_ = loggerName;
};


/**
 * Get the logging message level, for example Level.SEVERE.
 * @return {goog.debug.Logger.Level} the logging message level.
 */
goog.debug.LogRecord.prototype.getLevel = function() {
  return this.level_;
};


/**
 * Set the logging message level, for example Level.SEVERE.
 * @param {goog.debug.Logger.Level} level the logging message level.
 */
goog.debug.LogRecord.prototype.setLevel = function(level) {
  this.level_ = level;
};


/**
 * Get the "raw" log message, before localization or formatting.
 *
 * @return {string} the raw message string.
 */
goog.debug.LogRecord.prototype.getMessage = function() {
  return this.msg_;
};


/**
 * Set the "raw" log message, before localization or formatting.
 *
 * @param {string} msg the raw message string.
 */
goog.debug.LogRecord.prototype.setMessage = function(msg) {
  this.msg_ = msg;
};


/**
 * Get event time in milliseconds since 1970.
 *
 * @return {number} event time in millis since 1970.
 */
goog.debug.LogRecord.prototype.getMillis = function() {
  return this.time_;
};


/**
 * Set event time in milliseconds since 1970.
 *
 * @param {number} time event time in millis since 1970.
 */
goog.debug.LogRecord.prototype.setMillis = function(time) {
  this.time_ = time;
};


/**
 * Get the sequence number.
 * <p>
 * Sequence numbers are normally assigned in the LogRecord
 * constructor, which assigns unique sequence numbers to
 * each new LogRecord in increasing order.
 * @return {number} the sequence number.
 */
goog.debug.LogRecord.prototype.getSequenceNumber = function() {
  return this.sequenceNumber_;
};

// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A buffer for log records. The purpose of this is to improve
 * logging performance by re-using old objects when the buffer becomes full and
 * to eliminate the need for each app to implement their own log buffer. The
 * disadvantage to doing this is that log handlers cannot maintain references to
 * log records and expect that they are not overwriten at a later point.
 *
 * @author agrieve@google.com (Andrew Grieve)
 */

goog.provide('goog.debug.LogBuffer');

goog.require('goog.asserts');
goog.require('goog.debug.LogRecord');



/**
 * Creates the log buffer.
 * @constructor
 */
goog.debug.LogBuffer = function() {
  goog.asserts.assert(goog.debug.LogBuffer.isBufferingEnabled(),
      'Cannot use goog.debug.LogBuffer without defining ' +
      'goog.debug.LogBuffer.CAPACITY.');
  this.clear();
};


/**
 * A static method that always returns the same instance of LogBuffer.
 * @return {!goog.debug.LogBuffer} The LogBuffer singleton instance.
 */
goog.debug.LogBuffer.getInstance = function() {
  if (!goog.debug.LogBuffer.instance_) {
    // This function is written with the return statement after the assignment
    // to avoid the jscompiler StripCode bug described in http://b/2608064.
    // After that bug is fixed this can be refactored.
    goog.debug.LogBuffer.instance_ = new goog.debug.LogBuffer();
  }
  return goog.debug.LogBuffer.instance_;
};


/**
 * @define {number} The number of log records to buffer. 0 means disable
 * buffering.
 */
goog.debug.LogBuffer.CAPACITY = 0;


/**
 * The array to store the records.
 * @type {!Array.<!goog.debug.LogRecord|undefined>}
 * @private
 */
goog.debug.LogBuffer.prototype.buffer_;


/**
 * The index of the most recently added record or -1 if there are no records.
 * @type {number}
 * @private
 */
goog.debug.LogBuffer.prototype.curIndex_;


/**
 * Whether the buffer is at capacity.
 * @type {boolean}
 * @private
 */
goog.debug.LogBuffer.prototype.isFull_;


/**
 * Adds a log record to the buffer, possibly overwriting the oldest record.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {string} loggerName The name of the source logger.
 * @return {!goog.debug.LogRecord} The log record.
 */
goog.debug.LogBuffer.prototype.addRecord = function(level, msg, loggerName) {
  var curIndex = (this.curIndex_ + 1) % goog.debug.LogBuffer.CAPACITY;
  this.curIndex_ = curIndex;
  if (this.isFull_) {
    var ret = this.buffer_[curIndex];
    ret.reset(level, msg, loggerName);
    return ret;
  }
  this.isFull_ = curIndex == goog.debug.LogBuffer.CAPACITY - 1;
  return this.buffer_[curIndex] =
      new goog.debug.LogRecord(level, msg, loggerName);
};


/**
 * @return {boolean} Whether the log buffer is enabled.
 */
goog.debug.LogBuffer.isBufferingEnabled = function() {
  return goog.debug.LogBuffer.CAPACITY > 0;
};


/**
 * Removes all buffered log records.
 */
goog.debug.LogBuffer.prototype.clear = function() {
  this.buffer_ = new Array(goog.debug.LogBuffer.CAPACITY);
  this.curIndex_ = -1;
  this.isFull_ = false;
};


/**
 * Calls the given function for each buffered log record, starting with the
 * oldest one.
 * @param {function(!goog.debug.LogRecord)} func The function to call.
 */
goog.debug.LogBuffer.prototype.forEachRecord = function(func) {
  var buffer = this.buffer_;
  // Corner case: no records.
  if (!buffer[0]) {
    return;
  }
  var curIndex = this.curIndex_;
  var i = this.isFull_ ? curIndex : -1;
  do {
    i = (i + 1) % goog.debug.LogBuffer.CAPACITY;
    func(/** @type {!goog.debug.LogRecord} */ (buffer[i]));
  } while (i != curIndex);
};

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
 * @fileoverview Definition of the Logger class. Please minimize dependencies
 * this file has on other closure classes as any dependency it takes won't be
 * able to use the logging infrastructure.
 *
 * @see ../demos/debug.html
 */

goog.provide('goog.debug.LogManager');
goog.provide('goog.debug.Logger');
goog.provide('goog.debug.Logger.Level');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug');
goog.require('goog.debug.LogBuffer');
goog.require('goog.debug.LogRecord');



/**
 * The Logger is an object used for logging debug messages. Loggers are
 * normally named, using a hierarchical dot-separated namespace. Logger names
 * can be arbitrary strings, but they should normally be based on the package
 * name or class name of the logged component, such as goog.net.BrowserChannel.
 *
 * The Logger object is loosely based on the java class
 * java.util.logging.Logger. It supports different levels of filtering for
 * different loggers.
 *
 * The logger object should never be instantiated by application code. It
 * should always use the goog.debug.Logger.getLogger function.
 *
 * @constructor
 * @param {string} name The name of the Logger.
 */
goog.debug.Logger = function(name) {
  /**
   * Name of the Logger. Generally a dot-separated namespace
   * @type {string}
   * @private
   */
  this.name_ = name;
};


/**
 * Parent Logger.
 * @type {goog.debug.Logger}
 * @private
 */
goog.debug.Logger.prototype.parent_ = null;


/**
 * Level that this logger only filters above. Null indicates it should
 * inherit from the parent.
 * @type {goog.debug.Logger.Level}
 * @private
 */
goog.debug.Logger.prototype.level_ = null;


/**
 * Map of children loggers. The keys are the leaf names of the children and
 * the values are the child loggers.
 * @type {Object}
 * @private
 */
goog.debug.Logger.prototype.children_ = null;


/**
 * Handlers that are listening to this logger.
 * @type {Array.<Function>}
 * @private
 */
goog.debug.Logger.prototype.handlers_ = null;


/**
 * @define {boolean} Toggles whether loggers other than the root logger can have
 *     log handlers attached to them and whether they can have their log level
 *     set. Logging is a bit faster when this is set to false.
 */
goog.debug.Logger.ENABLE_HIERARCHY = true;


if (!goog.debug.Logger.ENABLE_HIERARCHY) {
  /**
   * @type {!Array.<Function>}
   * @private
   */
  goog.debug.Logger.rootHandlers_ = [];


  /**
   * @type {goog.debug.Logger.Level}
   * @private
   */
  goog.debug.Logger.rootLevel_;
}



/**
 * The Level class defines a set of standard logging levels that
 * can be used to control logging output.  The logging Level objects
 * are ordered and are specified by ordered integers.  Enabling logging
 * at a given level also enables logging at all higher levels.
 * <p>
 * Clients should normally use the predefined Level constants such
 * as Level.SEVERE.
 * <p>
 * The levels in descending order are:
 * <ul>
 * <li>SEVERE (highest value)
 * <li>WARNING
 * <li>INFO
 * <li>CONFIG
 * <li>FINE
 * <li>FINER
 * <li>FINEST  (lowest value)
 * </ul>
 * In addition there is a level OFF that can be used to turn
 * off logging, and a level ALL that can be used to enable
 * logging of all messages.
 *
 * @param {string} name The name of the level.
 * @param {number} value The numeric value of the level.
 * @constructor
 */
goog.debug.Logger.Level = function(name, value) {
  /**
   * The name of the level
   * @type {string}
   */
  this.name = name;

  /**
   * The numeric value of the level
   * @type {number}
   */
  this.value = value;
};


/**
 * @return {string} String representation of the logger level.
 */
goog.debug.Logger.Level.prototype.toString = function() {
  return this.name;
};


/**
 * OFF is a special level that can be used to turn off logging.
 * This level is initialized to <CODE>Number.MAX_VALUE</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.OFF =
    new goog.debug.Logger.Level('OFF', Infinity);


/**
 * SHOUT is a message level for extra debugging loudness.
 * This level is initialized to <CODE>1200</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.SHOUT = new goog.debug.Logger.Level('SHOUT', 1200);


/**
 * SEVERE is a message level indicating a serious failure.
 * This level is initialized to <CODE>1000</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.SEVERE = new goog.debug.Logger.Level('SEVERE', 1000);


/**
 * WARNING is a message level indicating a potential problem.
 * This level is initialized to <CODE>900</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.WARNING = new goog.debug.Logger.Level('WARNING', 900);


/**
 * INFO is a message level for informational messages.
 * This level is initialized to <CODE>800</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.INFO = new goog.debug.Logger.Level('INFO', 800);


/**
 * CONFIG is a message level for static configuration messages.
 * This level is initialized to <CODE>700</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.CONFIG = new goog.debug.Logger.Level('CONFIG', 700);


/**
 * FINE is a message level providing tracing information.
 * This level is initialized to <CODE>500</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.FINE = new goog.debug.Logger.Level('FINE', 500);


/**
 * FINER indicates a fairly detailed tracing message.
 * This level is initialized to <CODE>400</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.FINER = new goog.debug.Logger.Level('FINER', 400);

/**
 * FINEST indicates a highly detailed tracing message.
 * This level is initialized to <CODE>300</CODE>.
 * @type {!goog.debug.Logger.Level}
 */

goog.debug.Logger.Level.FINEST = new goog.debug.Logger.Level('FINEST', 300);


/**
 * ALL indicates that all messages should be logged.
 * This level is initialized to <CODE>Number.MIN_VALUE</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.ALL = new goog.debug.Logger.Level('ALL', 0);


/**
 * The predefined levels.
 * @type {!Array.<!goog.debug.Logger.Level>}
 * @final
 */
goog.debug.Logger.Level.PREDEFINED_LEVELS = [
  goog.debug.Logger.Level.OFF,
  goog.debug.Logger.Level.SHOUT,
  goog.debug.Logger.Level.SEVERE,
  goog.debug.Logger.Level.WARNING,
  goog.debug.Logger.Level.INFO,
  goog.debug.Logger.Level.CONFIG,
  goog.debug.Logger.Level.FINE,
  goog.debug.Logger.Level.FINER,
  goog.debug.Logger.Level.FINEST,
  goog.debug.Logger.Level.ALL];


/**
 * A lookup map used to find the level object based on the name or value of
 * the level object.
 * @type {Object}
 * @private
 */
goog.debug.Logger.Level.predefinedLevelsCache_ = null;


/**
 * Creates the predefined levels cache and populates it.
 * @private
 */
goog.debug.Logger.Level.createPredefinedLevelsCache_ = function() {
  goog.debug.Logger.Level.predefinedLevelsCache_ = {};
  for (var i = 0, level; level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
       i++) {
    goog.debug.Logger.Level.predefinedLevelsCache_[level.value] = level;
    goog.debug.Logger.Level.predefinedLevelsCache_[level.name] = level;
  }
};


/**
 * Gets the predefined level with the given name.
 * @param {string} name The name of the level.
 * @return {goog.debug.Logger.Level} The level, or null if none found.
 */
goog.debug.Logger.Level.getPredefinedLevel = function(name) {
  if (!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_();
  }

  return goog.debug.Logger.Level.predefinedLevelsCache_[name] || null;
};


/**
 * Gets the highest predefined level <= #value.
 * @param {number} value Level value.
 * @return {goog.debug.Logger.Level} The level, or null if none found.
 */
goog.debug.Logger.Level.getPredefinedLevelByValue = function(value) {
  if (!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_();
  }

  if (value in goog.debug.Logger.Level.predefinedLevelsCache_) {
    return goog.debug.Logger.Level.predefinedLevelsCache_[value];
  }

  for (var i = 0; i < goog.debug.Logger.Level.PREDEFINED_LEVELS.length; ++i) {
    var level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
    if (level.value <= value) {
      return level;
    }
  }
  return null;
};


/**
 * Find or create a logger for a named subsystem. If a logger has already been
 * created with the given name it is returned. Otherwise a new logger is
 * created. If a new logger is created its log level will be configured based
 * on the LogManager configuration and it will configured to also send logging
 * output to its parent's handlers. It will be registered in the LogManager
 * global namespace.
 *
 * @param {string} name A name for the logger. This should be a dot-separated
 * name and should normally be based on the package name or class name of the
 * subsystem, such as goog.net.BrowserChannel.
 * @return {!goog.debug.Logger} The named logger.
 */
goog.debug.Logger.getLogger = function(name) {
  return goog.debug.LogManager.getLogger(name);
};


/**
 * Logs a message to profiling tools, if available.
 * {@see http://code.google.com/webtoolkit/speedtracer/logging-api.html}
 * {@see http://msdn.microsoft.com/en-us/library/dd433074(VS.85).aspx}
 * @param {string} msg The message to log.
 */
goog.debug.Logger.logToProfilers = function(msg) {
  // Using goog.global, as loggers might be used in window-less contexts.
  if (goog.global['console']) {
    if (goog.global['console']['timeStamp']) {
      // Logs a message to Firebug, Web Inspector, SpeedTracer, etc.
      goog.global['console']['timeStamp'](msg);
    } else if (goog.global['console']['markTimeline']) {
      // TODO(user): markTimeline is deprecated. Drop this else clause entirely
      // after Chrome M14 hits stable.
      goog.global['console']['markTimeline'](msg);
    }
  }

  if (goog.global['msWriteProfilerMark']) {
    // Logs a message to the Microsoft profiler
    goog.global['msWriteProfilerMark'](msg);
  }
};


/**
 * Gets the name of this logger.
 * @return {string} The name of this logger.
 */
goog.debug.Logger.prototype.getName = function() {
  return this.name_;
};


/**
 * Adds a handler to the logger. This doesn't use the event system because
 * we want to be able to add logging to the event system.
 * @param {Function} handler Handler function to add.
 */
goog.debug.Logger.prototype.addHandler = function(handler) {
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    if (!this.handlers_) {
      this.handlers_ = [];
    }
    this.handlers_.push(handler);
  } else {
    goog.asserts.assert(!this.name_,
        'Cannot call addHandler on a non-root logger when ' +
        'goog.debug.Logger.ENABLE_HIERARCHY is false.');
    goog.debug.Logger.rootHandlers_.push(handler);
  }
};


/**
 * Removes a handler from the logger. This doesn't use the event system because
 * we want to be able to add logging to the event system.
 * @param {Function} handler Handler function to remove.
 * @return {boolean} Whether the handler was removed.
 */
goog.debug.Logger.prototype.removeHandler = function(handler) {
  var handlers = goog.debug.Logger.ENABLE_HIERARCHY ? this.handlers_ :
      goog.debug.Logger.rootHandlers_;
  return !!handlers && goog.array.remove(handlers, handler);
};


/**
 * Returns the parent of this logger.
 * @return {goog.debug.Logger} The parent logger or null if this is the root.
 */
goog.debug.Logger.prototype.getParent = function() {
  return this.parent_;
};


/**
 * Returns the children of this logger as a map of the child name to the logger.
 * @return {!Object} The map where the keys are the child leaf names and the
 *     values are the Logger objects.
 */
goog.debug.Logger.prototype.getChildren = function() {
  if (!this.children_) {
    this.children_ = {};
  }
  return this.children_;
};


/**
 * Set the log level specifying which message levels will be logged by this
 * logger. Message levels lower than this value will be discarded.
 * The level value Level.OFF can be used to turn off logging. If the new level
 * is null, it means that this node should inherit its level from its nearest
 * ancestor with a specific (non-null) level value.
 *
 * @param {goog.debug.Logger.Level} level The new level.
 */
goog.debug.Logger.prototype.setLevel = function(level) {
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    this.level_ = level;
  } else {
    goog.asserts.assert(!this.name_,
        'Cannot call setLevel() on a non-root logger when ' +
        'goog.debug.Logger.ENABLE_HIERARCHY is false.');
    goog.debug.Logger.rootLevel_ = level;
  }
};


/**
 * Gets the log level specifying which message levels will be logged by this
 * logger. Message levels lower than this value will be discarded.
 * The level value Level.OFF can be used to turn off logging. If the level
 * is null, it means that this node should inherit its level from its nearest
 * ancestor with a specific (non-null) level value.
 *
 * @return {goog.debug.Logger.Level} The level.
 */
goog.debug.Logger.prototype.getLevel = function() {
  return this.level_;
};


/**
 * Returns the effective level of the logger based on its ancestors' levels.
 * @return {goog.debug.Logger.Level} The level.
 */
goog.debug.Logger.prototype.getEffectiveLevel = function() {
  if (!goog.debug.Logger.ENABLE_HIERARCHY) {
    return goog.debug.Logger.rootLevel_;
  }
  if (this.level_) {
    return this.level_;
  }
  if (this.parent_) {
    return this.parent_.getEffectiveLevel();
  }
  goog.asserts.fail('Root logger has no level set.');
  return null;
};


/**
 * Check if a message of the given level would actually be logged by this
 * logger. This check is based on the Loggers effective level, which may be
 * inherited from its parent.
 * @param {goog.debug.Logger.Level} level The level to check.
 * @return {boolean} Whether the message would be logged.
 */
goog.debug.Logger.prototype.isLoggable = function(level) {
  return level.value >= this.getEffectiveLevel().value;
};


/**
 * Log a message. If the logger is currently enabled for the
 * given message level then the given message is forwarded to all the
 * registered output Handler objects.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {Error|Object=} opt_exception An exception associated with the
 *     message.
 */
goog.debug.Logger.prototype.log = function(level, msg, opt_exception) {
  // java caches the effective level, not sure it's necessary here
  if (this.isLoggable(level)) {
    this.doLogRecord_(this.getLogRecord(level, msg, opt_exception));
  }
};


/**
 * Creates a new log record and adds the exception (if present) to it.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {Error|Object=} opt_exception An exception associated with the
 *     message.
 * @return {!goog.debug.LogRecord} A log record.
 */
goog.debug.Logger.prototype.getLogRecord = function(level, msg, opt_exception) {
  if (goog.debug.LogBuffer.isBufferingEnabled()) {
    var logRecord =
        goog.debug.LogBuffer.getInstance().addRecord(level, msg, this.name_);
  } else {
    logRecord = new goog.debug.LogRecord(level, String(msg), this.name_);
  }
  if (opt_exception) {
    logRecord.setException(opt_exception);
    logRecord.setExceptionText(
        goog.debug.exposeException(opt_exception, arguments.callee.caller));
  }
  return logRecord;
};


/**
 * Log a message at the Logger.Level.SHOUT level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.shout = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.SHOUT, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.SEVERE level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.severe = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.SEVERE, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.WARNING level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.warning = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.WARNING, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.INFO level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.info = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.INFO, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.CONFIG level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.config = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.CONFIG, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.FINE level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.fine = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINE, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.FINER level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.finer = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINER, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.FINEST level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.finest = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINEST, msg, opt_exception);
};


/**
 * Log a LogRecord. If the logger is currently enabled for the
 * given message level then the given message is forwarded to all the
 * registered output Handler objects.
 * @param {goog.debug.LogRecord} logRecord A log record to log.
 */
goog.debug.Logger.prototype.logRecord = function(logRecord) {
  if (this.isLoggable(logRecord.getLevel())) {
    this.doLogRecord_(logRecord);
  }
};


/**
 * Log a LogRecord.
 * @param {goog.debug.LogRecord} logRecord A log record to log.
 * @private
 */
goog.debug.Logger.prototype.doLogRecord_ = function(logRecord) {
  goog.debug.Logger.logToProfilers('log:' + logRecord.getMessage());
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    var target = this;
    while (target) {
      target.callPublish_(logRecord);
      target = target.getParent();
    }
  } else {
    for (var i = 0, handler; handler = goog.debug.Logger.rootHandlers_[i++]; ) {
      handler(logRecord);
    }
  }
};


/**
 * Calls the handlers for publish.
 * @param {goog.debug.LogRecord} logRecord The log record to publish.
 * @private
 */
goog.debug.Logger.prototype.callPublish_ = function(logRecord) {
  if (this.handlers_) {
    for (var i = 0, handler; handler = this.handlers_[i]; i++) {
      handler(logRecord);
    }
  }
};


/**
 * Sets the parent of this logger. This is used for setting up the logger tree.
 * @param {goog.debug.Logger} parent The parent logger.
 * @private
 */
goog.debug.Logger.prototype.setParent_ = function(parent) {
  this.parent_ = parent;
};


/**
 * Adds a child to this logger. This is used for setting up the logger tree.
 * @param {string} name The leaf name of the child.
 * @param {goog.debug.Logger} logger The child logger.
 * @private
 */
goog.debug.Logger.prototype.addChild_ = function(name, logger) {
  this.getChildren()[name] = logger;
};


/**
 * There is a single global LogManager object that is used to maintain a set of
 * shared state about Loggers and log services. This is loosely based on the
 * java class java.util.logging.LogManager.
 */
goog.debug.LogManager = {};


/**
 * Map of logger names to logger objects
 *
 * @type {!Object}
 * @private
 */
goog.debug.LogManager.loggers_ = {};


/**
 * The root logger which is the root of the logger tree.
 * @type {goog.debug.Logger}
 * @private
 */
goog.debug.LogManager.rootLogger_ = null;


/**
 * Initialize the LogManager if not already initialized
 */
goog.debug.LogManager.initialize = function() {
  if (!goog.debug.LogManager.rootLogger_) {
    goog.debug.LogManager.rootLogger_ = new goog.debug.Logger('');
    goog.debug.LogManager.loggers_[''] = goog.debug.LogManager.rootLogger_;
    goog.debug.LogManager.rootLogger_.setLevel(goog.debug.Logger.Level.CONFIG);
  }
};


/**
 * Returns all the loggers
 * @return {!Object} Map of logger names to logger objects.
 */
goog.debug.LogManager.getLoggers = function() {
  return goog.debug.LogManager.loggers_;
};


/**
 * Returns the root of the logger tree namespace, the logger with the empty
 * string as its name
 *
 * @return {!goog.debug.Logger} The root logger.
 */
goog.debug.LogManager.getRoot = function() {
  goog.debug.LogManager.initialize();
  return /** @type {!goog.debug.Logger} */ (goog.debug.LogManager.rootLogger_);
};


/**
 * Method to find a named logger.
 *
 * @param {string} name A name for the logger. This should be a dot-separated
 * name and should normally be based on the package name or class name of the
 * subsystem, such as goog.net.BrowserChannel.
 * @return {!goog.debug.Logger} The named logger.
 */
goog.debug.LogManager.getLogger = function(name) {
  goog.debug.LogManager.initialize();
  var ret = goog.debug.LogManager.loggers_[name];
  return ret || goog.debug.LogManager.createLogger_(name);
};


/**
 * Creates a function that can be passed to goog.debug.catchErrors. The function
 * will log all reported errors using the given logger.
 * @param {goog.debug.Logger=} opt_logger The logger to log the errors to.
 *     Defaults to the root logger.
 * @return {function(Object)} The created function.
 */
goog.debug.LogManager.createFunctionForCatchErrors = function(opt_logger) {
  return function(info) {
    var logger = opt_logger || goog.debug.LogManager.getRoot();
    logger.severe('Error: ' + info.message + ' (' + info.fileName +
                  ' @ Line: ' + info.line + ')');
  };
};


/**
 * Creates the named logger. Will also create the parents of the named logger
 * if they don't yet exist.
 * @param {string} name The name of the logger.
 * @return {!goog.debug.Logger} The named logger.
 * @private
 */
goog.debug.LogManager.createLogger_ = function(name) {
  // find parent logger
  var logger = new goog.debug.Logger(name);
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    var lastDotIndex = name.lastIndexOf('.');
    var parentName = name.substr(0, lastDotIndex);
    var leafName = name.substr(lastDotIndex + 1);
    var parentLogger = goog.debug.LogManager.getLogger(parentName);

    // tell the parent about the child and the child about the parent
    parentLogger.addChild_(leafName, logger);
    logger.setParent_(parentLogger);
  }

  goog.debug.LogManager.loggers_[name] = logger;
  return logger;
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Class used by XHR wrappers to publish their state to IframeIo
 * or other components that need to know if any XmlHttpRequests are active.
 *
 * IframeIo needs to know if any XmlHttpRequests have been initiated from the
 * result of an incremental data response, so that it can delay the destruction
 * of the iframe.  Otherwise firefox will error since the source context no
 * longer exists.
 *
 * This class means that IframeIo does not have an explicit dependency on
 * XhrIo.
 *
 * See https://bugzilla.mozilla.org/show_bug.cgi?id=369939 for a description of
 * the problem and a minimal test case.
 *
 * This class's methods are no-ops for non-Gecko browsers.
 *
 */

goog.provide('goog.net.xhrMonitor');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.userAgent');



/**
 * Class used for singleton goog.net.xhrMonitor which can be used for monitoring
 * whether there any XmlHttpRequests have been opened in a given execution
 * context, and allowing query of when they are closed.
 * @constructor
 * @private
 */
goog.net.XhrMonitor_ = function() {
  if (!goog.userAgent.GECKO) return;

  /**
   * A map of context identifiers to an array of XHR unique IDs that were
   * created in the context.
   * String -> Array.<String>
   * @type {Object}
   * @private
   */
  this.contextsToXhr_ = {};

  /**
   * Inverse lookup from an XHR unique ID to any context that was open when it
   * was created.  There should rarely be multiple open contexts, but support
   * has been added for completeness.
   * String -> Array.<String>
   * @type {Object}
   * @private
   */
  this.xhrToContexts_ = {};

  /**
   * Stack of active contexts.
   * @type {Array.<string>}
   * @private
   */
  this.stack_ = [];

};


/**
 * Returns a string key for the argument -- Either the string itself, the
 * unique ID of the object, or an empty string otherwise.
 * @param {Object|string} obj The object to make a key for.
 * @return {string|number} A string key for the argument.
 */
goog.net.XhrMonitor_.getKey = function(obj) {
  return goog.isString(obj) ? obj :
         goog.isObject(obj) ? goog.getUid(obj) :
         '';
};


/**
 * A reference to the xhrMonitor logger.
 * @type {goog.debug.Logger}
 * @private
 */
goog.net.XhrMonitor_.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.net.xhrMonitor');


/**
 * Flag indicating that the monitor should be used.
 * Should be set to false for worker threads as they do not have access
 * to iframes, which is what the monitor is needed for.
 * @type {boolean}
 * @private
 */
goog.net.XhrMonitor_.prototype.enabled_ = goog.userAgent.GECKO;


/**
 * Set the enabled flag.
 * @param {boolean} val The new value.
 */
goog.net.XhrMonitor_.prototype.setEnabled = function(val) {
  this.enabled_ = goog.userAgent.GECKO && val;
};


/**
 * Pushes a new context onto the stack.
 * @param {Object|string} context An object or string indicating the source of
 *     the execution context.
 */
goog.net.XhrMonitor_.prototype.pushContext = function(context) {
  if (!this.enabled_) return;

  var key = goog.net.XhrMonitor_.getKey(context);
  this.logger_.finest('Pushing context: ' + context + ' (' + key + ')');
  this.stack_.push(key);
};


/**
 * Pops the most recent context off the stack.
 */
goog.net.XhrMonitor_.prototype.popContext = function() {
  if (!this.enabled_) return;

  var context = this.stack_.pop();
  this.logger_.finest('Popping context: ' + context);
  this.updateDependentContexts_(context);
};


/**
 * Checks to see if there are any outstanding XmlHttpRequests that were
 * started in the given context.
 * @param {Object|string} context An object or string indicating the execution
 *     context to check.
 * @return {boolean} Whether there are any outstanding requests linked to the
 *     context.
 */
goog.net.XhrMonitor_.prototype.isContextSafe = function(context) {
  if (!this.enabled_) return true;

  var deps = this.contextsToXhr_[goog.net.XhrMonitor_.getKey(context)];
  this.logger_.fine('Context is safe : ' + context + ' - ' + deps);
  return !deps;
};


/**
 * Marks an XHR object as being open.
 * @param {Object} xhr An XmlHttpRequest object that is about to be opened.
 */
goog.net.XhrMonitor_.prototype.markXhrOpen = function(xhr) {
  if (!this.enabled_) return;

  var uid = goog.getUid(xhr);
  this.logger_.fine('Opening XHR : ' + uid);

  // Update all contexts that are currently on the stack.
  for (var i = 0; i < this.stack_.length; i++) {
    var context = this.stack_[i];
    this.addToMap_(this.contextsToXhr_, context, uid);
    this.addToMap_(this.xhrToContexts_, uid, context);
  }
};


/**
 * Marks an XHR object as being closed.
 * @param {Object} xhr An XmlHttpRequest object whose request has completed.
 */
goog.net.XhrMonitor_.prototype.markXhrClosed = function(xhr) {
  if (!this.enabled_) return;

  var uid = goog.getUid(xhr);
  this.logger_.fine('Closing XHR : ' + uid);

  // Delete the XHR look up and remove the XHR from any contexts.
  delete this.xhrToContexts_[uid];
  for (var context in this.contextsToXhr_) {
    goog.array.remove(this.contextsToXhr_[context], uid);
    if (this.contextsToXhr_[context].length == 0) {
      delete this.contextsToXhr_[context];
    }
  }
};


/**
 * Updates any contexts that were dependent on the given XHR request with any
 * XHRs that were opened by the same XHR.  This is used to track Iframes that
 * open XHRs which then in turn open an XHR.
 * @param {string} xhrUid The unique ID for the XHR to update.
 * @private
 */
goog.net.XhrMonitor_.prototype.updateDependentContexts_ = function(xhrUid) {
  // Update any contexts that are dependent on this XHR with any requests
  // registered with the XHR as a base context.  This is used for the situation
  // when an XHR event triggers another XHR.  The original XHR is closed, but
  // the source context needs to be informed about any XHRs that were opened as
  // a result of the first.
  var contexts = this.xhrToContexts_[xhrUid];
  var xhrs = this.contextsToXhr_[xhrUid];
  if (contexts && xhrs) {
    this.logger_.finest('Updating dependent contexts');
    goog.array.forEach(contexts, function(context) {
      goog.array.forEach(xhrs, function(xhr) {
        this.addToMap_(this.contextsToXhr_, context, xhr);
        this.addToMap_(this.xhrToContexts_, xhr, context);
      }, this);
    }, this);
  }
};


/**
 * Adds a value to a map of arrays.  If an array hasn't been created for the
 * provided key, then one is created.
 * @param {Object} map The map to add to.
 * @param {string|number} key the key.
 * @param {string|number} value The value.
 * @private
 */
goog.net.XhrMonitor_.prototype.addToMap_ = function(map, key, value) {
  if (!map[key]) {
    map[key] = [];
  }
  if (!goog.array.contains(map[key], value)) {
    map[key].push(value);
  }
};


/**
 * Singleton XhrMonitor object
 * @type {goog.net.XhrMonitor_}
 */
goog.net.xhrMonitor = new goog.net.XhrMonitor_();
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Error codes shared between goog.net.IframeIo and
 * goog.net.XhrIo.
 */

goog.provide('goog.net.ErrorCode');


/**
 * Error codes
 * @enum {number}
 */
goog.net.ErrorCode = {

  /**
   * There is no error condition.
   */
  NO_ERROR: 0,

  /**
   * The most common error from iframeio, unfortunately, is that the browser
   * responded with an error page that is classed as a different domain. The
   * situations, are when a browser error page  is shown -- 404, access denied,
   * DNS failure, connection reset etc.)
   *
   */
  ACCESS_DENIED: 1,

  /**
   * Currently the only case where file not found will be caused is when the
   * code is running on the local file system and a non-IE browser makes a
   * request to a file that doesn't exist.
   */
  FILE_NOT_FOUND: 2,

  /**
   * If Firefox shows a browser error page, such as a connection reset by
   * server or access denied, then it will fail silently without the error or
   * load handlers firing.
   */
  FF_SILENT_ERROR: 3,

  /**
   * Custom error provided by the client through the error check hook.
   */
  CUSTOM_ERROR: 4,

  /**
   * Exception was thrown while processing the request.
   */
  EXCEPTION: 5,

  /**
   * The Http response returned a non-successful http status code.
   */
  HTTP_ERROR: 6,

  /**
   * The request was aborted.
   */
  ABORT: 7,

  /**
   * The request timed out.
   */
  TIMEOUT: 8,

  /**
   * The resource is not available offline.
   */
  OFFLINE: 9
};


/**
 * Returns a friendly error message for an error code. These messages are for
 * debugging and are not localized.
 * @param {goog.net.ErrorCode} errorCode An error code.
 * @return {string} A message for debugging.
 */
goog.net.ErrorCode.getDebugMessage = function(errorCode) {
  switch (errorCode) {
    case goog.net.ErrorCode.NO_ERROR:
      return 'No Error';

    case goog.net.ErrorCode.ACCESS_DENIED:
      return 'Access denied to content document';

    case goog.net.ErrorCode.FILE_NOT_FOUND:
      return 'File not found';

    case goog.net.ErrorCode.FF_SILENT_ERROR:
      return 'Firefox silently errored';

    case goog.net.ErrorCode.CUSTOM_ERROR:
      return 'Application custom error';

    case goog.net.ErrorCode.EXCEPTION:
      return 'An exception occurred';

    case goog.net.ErrorCode.HTTP_ERROR:
      return 'Http response at 400 or 500 level';

    case goog.net.ErrorCode.ABORT:
      return 'Request was aborted';

    case goog.net.ErrorCode.TIMEOUT:
      return 'Request timed out';

    case goog.net.ErrorCode.OFFLINE:
      return 'The resource is not available offline';

    default:
      return 'Unrecognized error code';
  }
};
// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Constants for HTTP status codes.
 */

goog.provide('goog.net.HttpStatus');


/**
 * HTTP Status Codes defined in RFC 2616.
 * @see http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
 * @enum {number}
 */
goog.net.HttpStatus = {
  // Informational 1xx
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,

  // Successful 2xx
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,

  // Redirection 3xx
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,

  // Client Error 4xx
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  REQUEST_ENTITY_TOO_LARGE: 413,
  REQUEST_URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  REQUEST_RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,

  // Server Error 5xx
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,

  /*
   * IE returns this code for 204 due to its use of URLMon, which returns this
   * code for 'Operation Aborted'. The status text is 'Unknown', the response
   * headers are ''. Known to occur on IE 6 on XP through IE9 on Win7.
   */
  QUIRK_IE_NO_CONTENT: 1223
};
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
 * @fileoverview JSON utility functions.
 */


goog.provide('goog.json');
goog.provide('goog.json.Serializer');


/**
 * Tests if a string is an invalid JSON string. This only ensures that we are
 * not using any invalid characters
 * @param {string} s The string to test.
 * @return {boolean} True if the input is a valid JSON string.
 * @private
 */
goog.json.isValid_ = function(s) {
  // All empty whitespace is not valid.
  if (/^\s*$/.test(s)) {
    return false;
  }

  // This is taken from http://www.json.org/json2.js which is released to the
  // public domain.
  // Changes: We dissallow \u2028 Line separator and \u2029 Paragraph separator
  // inside strings.  We also treat \u2028 and \u2029 as whitespace which they
  // are in the RFC but IE and Safari does not match \s to these so we need to
  // include them in the reg exps in all places where whitespace is allowed.
  // We allowed \x7f inside strings because some tools don't escape it,
  // e.g. http://www.json.org/java/org/json/JSONObject.java

  // Parsing happens in three stages. In the first stage, we run the text
  // against regular expressions that look for non-JSON patterns. We are
  // especially concerned with '()' and 'new' because they can cause invocation,
  // and '=' because it can cause mutation. But just to be safe, we want to
  // reject all unexpected forms.

  // We split the first stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace all backslash pairs with '@' (a non-JSON character). Second, we
  // replace all simple value tokens with ']' characters. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or ']' or
  // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

  // Don't make these static since they have the global flag.
  var backslashesRe = /\\["\\\/bfnrtu]/g;
  var simpleValuesRe =
      /"[^"\\\n\r\u2028\u2029\x00-\x08\x10-\x1f\x80-\x9f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
  var openBracketsRe = /(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g;
  var remainderRe = /^[\],:{}\s\u2028\u2029]*$/;

  return remainderRe.test(s.replace(backslashesRe, '@').
      replace(simpleValuesRe, ']').
      replace(openBracketsRe, ''));
};


/**
 * Parses a JSON string and returns the result. This throws an exception if
 * the string is an invalid JSON string.
 *
 * Note that this is very slow on large strings. If you trust the source of
 * the string then you should use unsafeParse instead.
 *
 * @param {*} s The JSON string to parse.
 * @return {Object} The object generated from the JSON string.
 */
goog.json.parse = function(s) {
  var o = String(s);
  if (goog.json.isValid_(o)) {
    /** @preserveTry */
    try {
      return /** @type {Object} */ (eval('(' + o + ')'));
    } catch (ex) {
    }
  }
  throw Error('Invalid JSON string: ' + o);
};


/**
 * Parses a JSON string and returns the result. This uses eval so it is open
 * to security issues and it should only be used if you trust the source.
 *
 * @param {string} s The JSON string to parse.
 * @return {Object} The object generated from the JSON string.
 */
goog.json.unsafeParse = function(s) {
  return /** @type {Object} */ (eval('(' + s + ')'));
};


/**
 * JSON replacer, as defined in Section 15.12.3 of the ES5 spec.
 *
 * TODO(nicksantos): Array should also be a valid replacer.
 *
 * @typedef {function(this:Object, string, *): *}
 */
goog.json.Replacer;


/**
 * Serializes an object or a value to a JSON string.
 *
 * @param {*} object The object to serialize.
 * @param {?goog.json.Replacer=} opt_replacer A replacer function
 *     called for each (key, value) pair that determines how the value
 *     should be serialized. By defult, this just returns the value
 *     and allows default serialization to kick in.
 * @throws Error if there are loops in the object graph.
 * @return {string} A JSON string representation of the input.
 */
goog.json.serialize = function(object, opt_replacer) {
  // TODO(nicksantos): Change this to default to JSON.stringify when available.
  // I need to fiddle with the default externs a bit to make this happen.
  return new goog.json.Serializer(opt_replacer).serialize(object);
};



/**
 * Class that is used to serialize JSON objects to a string.
 * @param {?goog.json.Replacer=} opt_replacer Replacer.
 * @constructor
 */
goog.json.Serializer = function(opt_replacer) {
  /**
   * @type {goog.json.Replacer|null|undefined}
   * @private
   */
  this.replacer_ = opt_replacer;
};


/**
 * Serializes an object or a value to a JSON string.
 *
 * @param {*} object The object to serialize.
 * @throws Error if there are loops in the object graph.
 * @return {string} A JSON string representation of the input.
 */
goog.json.Serializer.prototype.serialize = function(object) {
  var sb = [];
  this.serialize_(object, sb);
  return sb.join('');
};


/**
 * Serializes a generic value to a JSON string
 * @private
 * @param {*} object The object to serialize.
 * @param {Array} sb Array used as a string builder.
 * @throws Error if there are loops in the object graph.
 */
goog.json.Serializer.prototype.serialize_ = function(object, sb) {
  switch (typeof object) {
    case 'string':
      this.serializeString_((/** @type {string} */ object), sb);
      break;
    case 'number':
      this.serializeNumber_((/** @type {number} */ object), sb);
      break;
    case 'boolean':
      sb.push(object);
      break;
    case 'undefined':
      sb.push('null');
      break;
    case 'object':
      if (object == null) {
        sb.push('null');
        break;
      }
      if (goog.isArray(object)) {
        this.serializeArray_((/** @type {!Array} */ object), sb);
        break;
      }
      // should we allow new String, new Number and new Boolean to be treated
      // as string, number and boolean? Most implementations do not and the
      // need is not very big
      this.serializeObject_((/** @type {Object} */ object), sb);
      break;
    case 'function':
      // Skip functions.
      // TODO(user) Should we return something here?
      break;
    default:
      throw Error('Unknown type: ' + typeof object);
  }
};


/**
 * Character mappings used internally for goog.string.quote
 * @private
 * @type {Object}
 */
goog.json.Serializer.charToJsonCharCache_ = {
  '\"': '\\"',
  '\\': '\\\\',
  '/': '\\/',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',

  '\x0B': '\\u000b' // '\v' is not supported in JScript
};


/**
 * Regular expression used to match characters that need to be replaced.
 * The S60 browser has a bug where unicode characters are not matched by
 * regular expressions. The condition below detects such behaviour and
 * adjusts the regular expression accordingly.
 * @private
 * @type {RegExp}
 */
goog.json.Serializer.charsToReplace_ = /\uffff/.test('\uffff') ?
    /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;


/**
 * Serializes a string to a JSON string
 * @private
 * @param {string} s The string to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeString_ = function(s, sb) {
  // The official JSON implementation does not work with international
  // characters.
  sb.push('"', s.replace(goog.json.Serializer.charsToReplace_, function(c) {
    // caching the result improves performance by a factor 2-3
    if (c in goog.json.Serializer.charToJsonCharCache_) {
      return goog.json.Serializer.charToJsonCharCache_[c];
    }

    var cc = c.charCodeAt(0);
    var rv = '\\u';
    if (cc < 16) {
      rv += '000';
    } else if (cc < 256) {
      rv += '00';
    } else if (cc < 4096) { // \u1000
      rv += '0';
    }
    return goog.json.Serializer.charToJsonCharCache_[c] = rv + cc.toString(16);
  }), '"');
};


/**
 * Serializes a number to a JSON string
 * @private
 * @param {number} n The number to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeNumber_ = function(n, sb) {
  sb.push(isFinite(n) && !isNaN(n) ? n : 'null');
};


/**
 * Serializes an array to a JSON string
 * @private
 * @param {Array} arr The array to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeArray_ = function(arr, sb) {
  var l = arr.length;
  sb.push('[');
  var sep = '';
  for (var i = 0; i < l; i++) {
    sb.push(sep);

    var value = arr[i];
    this.serialize_(
        this.replacer_ ? this.replacer_.call(arr, String(i), value) : value,
        sb);

    sep = ',';
  }
  sb.push(']');
};


/**
 * Serializes an object to a JSON string
 * @private
 * @param {Object} obj The object to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeObject_ = function(obj, sb) {
  sb.push('{');
  var sep = '';
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var value = obj[key];
      // Skip functions.
      // TODO(ptucker) Should we return something for function properties?
      if (typeof value != 'function') {
        sb.push(sep);
        this.serializeString_(key, sb);
        sb.push(':');

        this.serialize_(
            this.replacer_ ? this.replacer_.call(obj, key, value) : value,
            sb);

        sep = ',';
      }
    }
  }
  sb.push('}');
};
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Interface for a factory for creating XMLHttpRequest objects
 * and metadata about them.
 * @author dbk@google.com (David Barrett-Kahn)
 */

goog.provide('goog.net.XmlHttpFactory');



/**
 * Abstract base class for an XmlHttpRequest factory.
 * @constructor
 */
goog.net.XmlHttpFactory = function() {
};


/**
 * Cache of options - we only actually call internalGetOptions once.
 * @type {Object}
 * @private
 */
goog.net.XmlHttpFactory.prototype.cachedOptions_ = null;


/**
 * @return {!(XMLHttpRequest|GearsHttpRequest)} A new XMLHttpRequest instance.
 */
goog.net.XmlHttpFactory.prototype.createInstance = goog.abstractMethod;


/**
 * @return {Object} Options describing how xhr objects obtained from this
 *     factory should be used.
 */
goog.net.XmlHttpFactory.prototype.getOptions = function() {
  return this.cachedOptions_ ||
      (this.cachedOptions_ = this.internalGetOptions());
};


/**
 * Override this method in subclasses to preserve the caching offered by
 * getOptions().
 * @return {Object} Options describing how xhr objects obtained from this
 *     factory should be used.
 * @protected
 */
goog.net.XmlHttpFactory.prototype.internalGetOptions = goog.abstractMethod;
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Implementation of XmlHttpFactory which allows construction from
 * simple factory methods.
 * @author dbk@google.com (David Barrett-Kahn)
 */

goog.provide('goog.net.WrapperXmlHttpFactory');

goog.require('goog.net.XmlHttpFactory');



/**
 * An xhr factory subclass which can be constructed using two factory methods.
 * This exists partly to allow the preservation of goog.net.XmlHttp.setFactory()
 * with an unchanged signature.
 * @param {function() : !(XMLHttpRequest|GearsHttpRequest)} xhrFactory A
 *     function which returns a new XHR object.
 * @param {function() : !Object} optionsFactory A function which returns the
 *     options associated with xhr objects from this factory.
 * @extends {goog.net.XmlHttpFactory}
 * @constructor
 */
goog.net.WrapperXmlHttpFactory = function(xhrFactory, optionsFactory) {
  goog.net.XmlHttpFactory.call(this);

  /**
   * XHR factory method.
   * @type {function() : !(XMLHttpRequest|GearsHttpRequest)}
   * @private
   */
  this.xhrFactory_ = xhrFactory;

  /**
   * Options factory method.
   * @type {function() : !Object}
   * @private
   */
  this.optionsFactory_ = optionsFactory;
};
goog.inherits(goog.net.WrapperXmlHttpFactory, goog.net.XmlHttpFactory);


/** @override */
goog.net.WrapperXmlHttpFactory.prototype.createInstance = function() {
  return this.xhrFactory_();
};


/** @override */
goog.net.WrapperXmlHttpFactory.prototype.getOptions = function() {
  return this.optionsFactory_();
};

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
 * @fileoverview Low level handling of XMLHttpRequest.
 */

goog.provide('goog.net.DefaultXmlHttpFactory');
goog.provide('goog.net.XmlHttp');
goog.provide('goog.net.XmlHttp.OptionType');
goog.provide('goog.net.XmlHttp.ReadyState');

goog.require('goog.net.WrapperXmlHttpFactory');
goog.require('goog.net.XmlHttpFactory');


/**
 * Static class for creating XMLHttpRequest objects.
 * @return {!(XMLHttpRequest|GearsHttpRequest)} A new XMLHttpRequest object.
 */
goog.net.XmlHttp = function() {
  return goog.net.XmlHttp.factory_.createInstance();
};


/**
 * Gets the options to use with the XMLHttpRequest objects obtained using
 * the static methods.
 * @return {Object} The options.
 */
goog.net.XmlHttp.getOptions = function() {
  return goog.net.XmlHttp.factory_.getOptions();
};


/**
 * Type of options that an XmlHttp object can have.
 * @enum {number}
 */
goog.net.XmlHttp.OptionType = {
  /**
   * Whether a goog.nullFunction should be used to clear the onreadystatechange
   * handler instead of null.
   */
  USE_NULL_FUNCTION: 0,

  /**
   * NOTE(user): In IE if send() errors on a *local* request the readystate
   * is still changed to COMPLETE.  We need to ignore it and allow the
   * try/catch around send() to pick up the error.
   */
  LOCAL_REQUEST_ERROR: 1
};


/**
 * Status constants for XMLHTTP, matches:
 * http://msdn.microsoft.com/library/default.asp?url=/library/
 *   en-us/xmlsdk/html/0e6a34e4-f90c-489d-acff-cb44242fafc6.asp
 * @enum {number}
 */
goog.net.XmlHttp.ReadyState = {
  /**
   * Constant for when xmlhttprequest.readyState is uninitialized
   */
  UNINITIALIZED: 0,

  /**
   * Constant for when xmlhttprequest.readyState is loading.
   */
  LOADING: 1,

  /**
   * Constant for when xmlhttprequest.readyState is loaded.
   */
  LOADED: 2,

  /**
   * Constant for when xmlhttprequest.readyState is in an interactive state.
   */
  INTERACTIVE: 3,

  /**
   * Constant for when xmlhttprequest.readyState is completed
   */
  COMPLETE: 4
};


/**
 * The global factory instance for creating XMLHttpRequest objects.
 * @type {goog.net.XmlHttpFactory}
 * @private
 */
goog.net.XmlHttp.factory_;


/**
 * Sets the factories for creating XMLHttpRequest objects and their options.
 * @param {Function} factory The factory for XMLHttpRequest objects.
 * @param {Function} optionsFactory The factory for options.
 * @deprecated Use setGlobalFactory instead.
 */
goog.net.XmlHttp.setFactory = function(factory, optionsFactory) {
  goog.net.XmlHttp.setGlobalFactory(new goog.net.WrapperXmlHttpFactory(
      (/** @type {function() : !(XMLHttpRequest|GearsHttpRequest)} */ factory),
      (/** @type {function() : !Object}*/ optionsFactory)));
};


/**
 * Sets the global factory object.
 * @param {!goog.net.XmlHttpFactory} factory New global factory object.
 */
goog.net.XmlHttp.setGlobalFactory = function(factory) {
  goog.net.XmlHttp.factory_ = factory;
};



/**
 * Default factory to use when creating xhr objects.  You probably shouldn't be
 * instantiating this directly, but rather using it via goog.net.XmlHttp.
 * @extends {goog.net.XmlHttpFactory}
 * @constructor
 */
goog.net.DefaultXmlHttpFactory = function() {
  goog.net.XmlHttpFactory.call(this);
};
goog.inherits(goog.net.DefaultXmlHttpFactory, goog.net.XmlHttpFactory);


/** @override */
goog.net.DefaultXmlHttpFactory.prototype.createInstance = function() {
  var progId = this.getProgId_();
  if (progId) {
    return new ActiveXObject(progId);
  } else {
    return new XMLHttpRequest();
  }
};


/** @override */
goog.net.DefaultXmlHttpFactory.prototype.internalGetOptions = function() {
  var progId = this.getProgId_();
  var options = {};
  if (progId) {
    options[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] = true;
    options[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR] = true;
  }
  return options;
};


/**
 * The ActiveX PROG ID string to use to create xhr's in IE. Lazily initialized.
 * @type {?string}
 * @private
 */
goog.net.DefaultXmlHttpFactory.prototype.ieProgId_ = null;


/**
 * Initialize the private state used by other functions.
 * @return {string} The ActiveX PROG ID string to use to create xhr's in IE.
 * @private
 */
goog.net.DefaultXmlHttpFactory.prototype.getProgId_ = function() {
  // The following blog post describes what PROG IDs to use to create the
  // XMLHTTP object in Internet Explorer:
  // http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
  // However we do not (yet) fully trust that this will be OK for old versions
  // of IE on Win9x so we therefore keep the last 2.
  if (!this.ieProgId_ && typeof XMLHttpRequest == 'undefined' &&
      typeof ActiveXObject != 'undefined') {
    // Candidate Active X types.
    var ACTIVE_X_IDENTS = ['MSXML2.XMLHTTP.6.0', 'MSXML2.XMLHTTP.3.0',
                           'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
    for (var i = 0; i < ACTIVE_X_IDENTS.length; i++) {
      var candidate = ACTIVE_X_IDENTS[i];
      /** @preserveTry */
      try {
        new ActiveXObject(candidate);
        // NOTE(user): cannot assign progid and return candidate in one line
        // because JSCompiler complaings: BUG 658126
        this.ieProgId_ = candidate;
        return candidate;
      } catch (e) {
        // do nothing; try next choice
      }
    }

    // couldn't find any matches
    throw Error('Could not create ActiveXObject. ActiveX might be disabled,' +
                ' or MSXML might not be installed');
  }

  return /** @type {string} */ (this.ieProgId_);
};


//Set the global factory to an instance of the default factory.
goog.net.XmlHttp.setGlobalFactory(new goog.net.DefaultXmlHttpFactory());
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
 * @fileoverview Common events for the network classes.
 */


goog.provide('goog.net.EventType');


/**
 * Event names for network events
 * @enum {string}
 */
goog.net.EventType = {
  COMPLETE: 'complete',
  SUCCESS: 'success',
  ERROR: 'error',
  ABORT: 'abort',
  READY: 'ready',
  READY_STATE_CHANGE: 'readystatechange',
  TIMEOUT: 'timeout',
  INCREMENTAL_DATA: 'incrementaldata',
  PROGRESS: 'progress'
};
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
 * @fileoverview Wrapper class for handling XmlHttpRequests.
 *
 * One off requests can be sent through goog.net.XhrIo.send() or an
 * instance can be created to send multiple requests.  Each request uses its
 * own XmlHttpRequest object and handles clearing of the event callback to
 * ensure no leaks.
 *
 * XhrIo is event based, it dispatches events when a request finishes, fails or
 * succeeds or when the ready-state changes. The ready-state or timeout event
 * fires first, followed by a generic completed event. Then the abort, error,
 * or success event is fired as appropriate. Lastly, the ready event will fire
 * to indicate that the object may be used to make another request.
 *
 * The error event may also be called before completed and
 * ready-state-change if the XmlHttpRequest.open() or .send() methods throw.
 *
 * This class does not support multiple requests, queuing, or prioritization.
 *
 * Tested = IE6, FF1.5, Safari, Opera 8.5
 *
 * TODO(user): Error cases aren't playing nicely in Safari.
 *
 */


goog.provide('goog.net.XhrIo');
goog.provide('goog.net.XhrIo.ResponseType');

goog.require('goog.Timer');
goog.require('goog.debug.Logger');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.debug.errorHandlerWeakDep');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.ErrorCode');
goog.require('goog.net.EventType');
goog.require('goog.net.HttpStatus');
goog.require('goog.net.XmlHttp');
goog.require('goog.net.xhrMonitor');
goog.require('goog.object');
goog.require('goog.structs');
goog.require('goog.structs.Map');
goog.require('goog.uri.utils');



/**
 * Basic class for handling XMLHttpRequests.
 * @param {goog.net.XmlHttpFactory=} opt_xmlHttpFactory Factory to use when
 *     creating XMLHttpRequest objects.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.net.XhrIo = function(opt_xmlHttpFactory) {
  goog.events.EventTarget.call(this);

  /**
   * Map of default headers to add to every request, use:
   * XhrIo.headers.set(name, value)
   * @type {goog.structs.Map}
   */
  this.headers = new goog.structs.Map();

  /**
   * Optional XmlHttpFactory
   * @type {goog.net.XmlHttpFactory}
   * @private
   */
  this.xmlHttpFactory_ = opt_xmlHttpFactory || null;
};
goog.inherits(goog.net.XhrIo, goog.events.EventTarget);


/**
 * Response types that may be requested for XMLHttpRequests.
 * @enum {string}
 * @see http://dev.w3.org/2006/webapi/XMLHttpRequest-2/#the-responsetype-attribute
 */
goog.net.XhrIo.ResponseType = {
  DEFAULT: '',
  TEXT: 'text',
  DOCUMENT: 'document',
  // Not supported as of Chrome 10.0.612.1 dev
  BLOB: 'blob',
  ARRAY_BUFFER: 'arraybuffer'
};


/**
 * A reference to the XhrIo logger
 * @type {goog.debug.Logger}
 * @private
 */
goog.net.XhrIo.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.net.XhrIo');


/**
 * The Content-Type HTTP header name
 * @type {string}
 */
goog.net.XhrIo.CONTENT_TYPE_HEADER = 'Content-Type';


/**
 * The pattern matching the 'http' and 'https' URI schemes
 * @type {!RegExp}
 */
goog.net.XhrIo.HTTP_SCHEME_PATTERN = /^https?:?$/i;


/**
 * The Content-Type HTTP header value for a url-encoded form
 * @type {string}
 */
goog.net.XhrIo.FORM_CONTENT_TYPE =
    'application/x-www-form-urlencoded;charset=utf-8';


/**
 * All non-disposed instances of goog.net.XhrIo created
 * by {@link goog.net.XhrIo.send} are in this Array.
 * @see goog.net.XhrIo.cleanup
 * @type {Array.<goog.net.XhrIo>}
 * @private
 */
goog.net.XhrIo.sendInstances_ = [];


/**
 * Static send that creates a short lived instance of XhrIo to send the
 * request.
 * @see goog.net.XhrIo.cleanup
 * @param {string|goog.Uri} url Uri to make request to.
 * @param {Function=} opt_callback Callback function for when request is
 *     complete.
 * @param {string=} opt_method Send method, default: GET.
 * @param {string|GearsBlob=} opt_content Post data. This can be a Gears blob
 *     if the underlying HTTP request object is a Gears HTTP request.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 * @param {number=} opt_timeoutInterval Number of milliseconds after which an
 *     incomplete request will be aborted; 0 means no timeout is set.
 */
goog.net.XhrIo.send = function(url, opt_callback, opt_method, opt_content,
                               opt_headers, opt_timeoutInterval) {
  var x = new goog.net.XhrIo();
  goog.net.XhrIo.sendInstances_.push(x);
  if (opt_callback) {
    goog.events.listen(x, goog.net.EventType.COMPLETE, opt_callback);
  }
  goog.events.listen(x,
                     goog.net.EventType.READY,
                     goog.partial(goog.net.XhrIo.cleanupSend_, x));
  if (opt_timeoutInterval) {
    x.setTimeoutInterval(opt_timeoutInterval);
  }
  x.send(url, opt_method, opt_content, opt_headers);
};


/**
 * Disposes all non-disposed instances of goog.net.XhrIo created by
 * {@link goog.net.XhrIo.send}.
 * {@link goog.net.XhrIo.send} cleans up the goog.net.XhrIo instance
 * it creates when the request completes or fails.  However, if
 * the request never completes, then the goog.net.XhrIo is not disposed.
 * This can occur if the window is unloaded before the request completes.
 * We could have {@link goog.net.XhrIo.send} return the goog.net.XhrIo
 * it creates and make the client of {@link goog.net.XhrIo.send} be
 * responsible for disposing it in this case.  However, this makes things
 * significantly more complicated for the client, and the whole point
 * of {@link goog.net.XhrIo.send} is that it's simple and easy to use.
 * Clients of {@link goog.net.XhrIo.send} should call
 * {@link goog.net.XhrIo.cleanup} when doing final
 * cleanup on window unload.
 */
goog.net.XhrIo.cleanup = function() {
  var instances = goog.net.XhrIo.sendInstances_;
  while (instances.length) {
    instances.pop().dispose();
  }
};


/**
 * Installs exception protection for all entry point introduced by
 * goog.net.XhrIo instances which are not protected by
 * {@link goog.debug.ErrorHandler#protectWindowSetTimeout},
 * {@link goog.debug.ErrorHandler#protectWindowSetInterval}, or
 * {@link goog.events.protectBrowserEventEntryPoint}.
 *
 * @param {goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry point(s).
 */
goog.net.XhrIo.protectEntryPoints = function(errorHandler) {
  goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ =
      errorHandler.protectEntryPoint(
          goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_);
};


/**
 * Disposes of the specified goog.net.XhrIo created by
 * {@link goog.net.XhrIo.send} and removes it from
 * {@link goog.net.XhrIo.pendingStaticSendInstances_}.
 * @param {goog.net.XhrIo} XhrIo An XhrIo created by
 *     {@link goog.net.XhrIo.send}.
 * @private
 */
goog.net.XhrIo.cleanupSend_ = function(XhrIo) {
  XhrIo.dispose();
  goog.array.remove(goog.net.XhrIo.sendInstances_, XhrIo);
};


/**
 * Whether XMLHttpRequest is active.  A request is active from the time send()
 * is called until onReadyStateChange() is complete, or error() or abort()
 * is called.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.active_ = false;


/**
 * Reference to an XMLHttpRequest object that is being used for the transfer.
 * @type {XMLHttpRequest|GearsHttpRequest}
 * @private
 */
goog.net.XhrIo.prototype.xhr_ = null;


/**
 * The options to use with the current XMLHttpRequest object.
 * @type {Object}
 * @private
 */
goog.net.XhrIo.prototype.xhrOptions_ = null;


/**
 * Last URL that was requested.
 * @type {string|goog.Uri}
 * @private
 */
goog.net.XhrIo.prototype.lastUri_ = '';


/**
 * Method for the last request.
 * @type {string}
 * @private
 */
goog.net.XhrIo.prototype.lastMethod_ = '';


/**
 * Last error code.
 * @type {goog.net.ErrorCode}
 * @private
 */
goog.net.XhrIo.prototype.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;


/**
 * Last error message.
 * @type {Error|string}
 * @private
 */
goog.net.XhrIo.prototype.lastError_ = '';


/**
 * This is used to ensure that we don't dispatch an multiple ERROR events. This
 * can happen in IE when it does a synchronous load and one error is handled in
 * the ready statte change and one is handled due to send() throwing an
 * exception.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.errorDispatched_ = false;


/**
 * Used to make sure we don't fire the complete event from inside a send call.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.inSend_ = false;


/**
 * Used in determining if a call to {@link #onReadyStateChange_} is from within
 * a call to this.xhr_.open.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.inOpen_ = false;


/**
 * Used in determining if a call to {@link #onReadyStateChange_} is from within
 * a call to this.xhr_.abort.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.inAbort_ = false;


/**
 * Number of milliseconds after which an incomplete request will be aborted and
 * a {@link goog.net.EventType.TIMEOUT} event raised; 0 means no timeout is set.
 * @type {number}
 * @private
 */
goog.net.XhrIo.prototype.timeoutInterval_ = 0;


/**
 * Window timeout ID used to cancel the timeout event handler if the request
 * completes successfully.
 * @type {Object}
 * @private
 */
goog.net.XhrIo.prototype.timeoutId_ = null;


/**
 * The requested type for the response. The empty string means use the default
 * XHR behavior.
 * @type {goog.net.XhrIo.ResponseType}
 * @private
 */
goog.net.XhrIo.prototype.responseType_ = goog.net.XhrIo.ResponseType.DEFAULT;


/**
 * Whether a "credentialed" request is to be sent (one that is aware of cookies
 * and authentication) . This is applicable only for cross-domain requests and
 * more recent browsers that support this part of the HTTP Access Control
 * standard.
 *
 * @see http://dev.w3.org/2006/webapi/XMLHttpRequest-2/#withcredentials
 *
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.withCredentials_ = false;


/**
 * Returns the number of milliseconds after which an incomplete request will be
 * aborted, or 0 if no timeout is set.
 * @return {number} Timeout interval in milliseconds.
 */
goog.net.XhrIo.prototype.getTimeoutInterval = function() {
  return this.timeoutInterval_;
};


/**
 * Sets the number of milliseconds after which an incomplete request will be
 * aborted and a {@link goog.net.EventType.TIMEOUT} event raised; 0 means no
 * timeout is set.
 * @param {number} ms Timeout interval in milliseconds; 0 means none.
 */
goog.net.XhrIo.prototype.setTimeoutInterval = function(ms) {
  this.timeoutInterval_ = Math.max(0, ms);
};


/**
 * Sets the desired type for the response. At time of writing, this is only
 * supported in very recent versions of WebKit (10.0.612.1 dev and later).
 *
 * If this is used, the response may only be accessed via {@link #getResponse}.
 *
 * @param {goog.net.XhrIo.ResponseType} type The desired type for the response.
 */
goog.net.XhrIo.prototype.setResponseType = function(type) {
  this.responseType_ = type;
};


/**
 * Gets the desired type for the response.
 * @return {goog.net.XhrIo.ResponseType} The desired type for the response.
 */
goog.net.XhrIo.prototype.getResponseType = function() {
  return this.responseType_;
};


/**
 * Sets whether a "credentialed" request that is aware of cookie and
 * authentication information should be made. This option is only supported by
 * browsers that support HTTP Access Control. As of this writing, this option
 * is not supported in IE.
 *
 * @param {boolean} withCredentials Whether this should be a "credentialed"
 *     request.
 */
goog.net.XhrIo.prototype.setWithCredentials = function(withCredentials) {
  this.withCredentials_ = withCredentials;
};


/**
 * Gets whether a "credentialed" request is to be sent.
 * @return {boolean} The desired type for the response.
 */
goog.net.XhrIo.prototype.getWithCredentials = function() {
  return this.withCredentials_;
};


/**
 * Instance send that actually uses XMLHttpRequest to make a server call.
 * @param {string|goog.Uri} url Uri to make request to.
 * @param {string=} opt_method Send method, default: GET.
 * @param {string|GearsBlob=} opt_content Post data. This can be a Gears blob
 *     if the underlying HTTP request object is a Gears HTTP request.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 */
goog.net.XhrIo.prototype.send = function(url, opt_method, opt_content,
                                         opt_headers) {
  if (this.xhr_) {
    throw Error('[goog.net.XhrIo] Object is active with another request');
  }

  var method = opt_method ? opt_method.toUpperCase() : 'GET';

  this.lastUri_ = url;
  this.lastError_ = '';
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
  this.lastMethod_ = method;
  this.errorDispatched_ = false;
  this.active_ = true;

  // Use the factory to create the XHR object and options
  this.xhr_ = this.createXhr();
  this.xhrOptions_ = this.xmlHttpFactory_ ?
      this.xmlHttpFactory_.getOptions() : goog.net.XmlHttp.getOptions();

  // We tell the Xhr Monitor that we are opening an XMLHttpRequest.  This stops
  // IframeIo from destroying iframes that may have been the source of the
  // execution context, which can result in an error in FF.  See xhrmonitor.js
  // for more details.
  goog.net.xhrMonitor.markXhrOpen(this.xhr_);

  // Set up the onreadystatechange callback
  this.xhr_.onreadystatechange = goog.bind(this.onReadyStateChange_, this);

  /**
   * Try to open the XMLHttpRequest (always async), if an error occurs here it
   * is generally permission denied
   * @preserveTry
   */
  try {
    this.logger_.fine(this.formatMsg_('Opening Xhr'));
    this.inOpen_ = true;
    this.xhr_.open(method, url, true);  // Always async!
    this.inOpen_ = false;
  } catch (err) {
    this.logger_.fine(this.formatMsg_('Error opening Xhr: ' + err.message));
    this.error_(goog.net.ErrorCode.EXCEPTION, err);
    return;
  }

  // We can't use null since this won't allow POSTs to have a content length
  // specified which will cause some proxies to return a 411 error.
  var content = opt_content || '';

  var headers = this.headers.clone();

  // Add headers specific to this request
  if (opt_headers) {
    goog.structs.forEach(opt_headers, function(value, key) {
      headers.set(key, value);
    });
  }

  if (method == 'POST' &&
      !headers.containsKey(goog.net.XhrIo.CONTENT_TYPE_HEADER)) {
    // For POST requests, default to the url-encoded form content type.
    headers.set(goog.net.XhrIo.CONTENT_TYPE_HEADER,
                goog.net.XhrIo.FORM_CONTENT_TYPE);
  }

  // Add the headers to the Xhr object
  goog.structs.forEach(headers, function(value, key) {
    this.xhr_.setRequestHeader(key, value);
  }, this);

  if (this.responseType_) {
    this.xhr_.responseType = this.responseType_;
  }

  if (goog.object.containsKey(this.xhr_, 'withCredentials')) {
    this.xhr_.withCredentials = this.withCredentials_;
  }

  /**
   * Try to send the request, or other wise report an error (404 not found).
   * @preserveTry
   */
  try {
    if (this.timeoutId_) {
      // This should never happen, since the if (this.active_) above shouldn't
      // let execution reach this point if there is a request in progress...
      goog.Timer.defaultTimerObject.clearTimeout(this.timeoutId_);
      this.timeoutId_ = null;
    }
    if (this.timeoutInterval_ > 0) {
      this.logger_.fine(this.formatMsg_('Will abort after ' +
          this.timeoutInterval_ + 'ms if incomplete'));
      this.timeoutId_ = goog.Timer.defaultTimerObject.setTimeout(
          goog.bind(this.timeout_, this), this.timeoutInterval_);
    }
    this.logger_.fine(this.formatMsg_('Sending request'));
    this.inSend_ = true;
    this.xhr_.send(content);
    this.inSend_ = false;

  } catch (err) {
    this.logger_.fine(this.formatMsg_('Send error: ' + err.message));
    this.error_(goog.net.ErrorCode.EXCEPTION, err);
  }
};


/**
 * Creates a new XHR object.
 * @return {XMLHttpRequest|GearsHttpRequest} The newly created XHR object.
 * @protected
 */
goog.net.XhrIo.prototype.createXhr = function() {
  return this.xmlHttpFactory_ ?
      this.xmlHttpFactory_.createInstance() : goog.net.XmlHttp();
};


/**
 * Override of dispatchEvent.  We need to keep track if an XMLHttpRequest is
 * being sent from the context of another requests' response.  If it is then, we
 * make the XHR send async.
 * @override
 */
goog.net.XhrIo.prototype.dispatchEvent = function(e) {
  if (this.xhr_) {
    goog.net.xhrMonitor.pushContext(this.xhr_);
    try {
      return goog.net.XhrIo.superClass_.dispatchEvent.call(this, e);
    } finally {
      goog.net.xhrMonitor.popContext();
    }
  } else {
    return goog.net.XhrIo.superClass_.dispatchEvent.call(this, e);
  }
};


/**
 * The request didn't complete after {@link goog.net.XhrIo#timeoutInterval_}
 * milliseconds; raises a {@link goog.net.EventType.TIMEOUT} event and aborts
 * the request.
 * @private
 */
goog.net.XhrIo.prototype.timeout_ = function() {
  if (typeof goog == 'undefined') {
    // If goog is undefined then the callback has occurred as the application
    // is unloading and will error.  Thus we let it silently fail.
  } else if (this.xhr_) {
    this.lastError_ = 'Timed out after ' + this.timeoutInterval_ +
                      'ms, aborting';
    this.lastErrorCode_ = goog.net.ErrorCode.TIMEOUT;
    this.logger_.fine(this.formatMsg_(this.lastError_));
    this.dispatchEvent(goog.net.EventType.TIMEOUT);
    this.abort(goog.net.ErrorCode.TIMEOUT);
  }
};


/**
 * Something errorred, so inactivate, fire error callback and clean up
 * @param {goog.net.ErrorCode} errorCode The error code.
 * @param {Error} err The error object.
 * @private
 */
goog.net.XhrIo.prototype.error_ = function(errorCode, err) {
  this.active_ = false;
  if (this.xhr_) {
    this.inAbort_ = true;
    this.xhr_.abort();  // Ensures XHR isn't hung (FF)
    this.inAbort_ = false;
  }
  this.lastError_ = err;
  this.lastErrorCode_ = errorCode;
  this.dispatchErrors_();
  this.cleanUpXhr_();
};


/**
 * Dispatches COMPLETE and ERROR in case of an error. This ensures that we do
 * not dispatch multiple error events.
 * @private
 */
goog.net.XhrIo.prototype.dispatchErrors_ = function() {
  if (!this.errorDispatched_) {
    this.errorDispatched_ = true;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ERROR);
  }
};


/**
 * Abort the current XMLHttpRequest
 * @param {goog.net.ErrorCode=} opt_failureCode Optional error code to use -
 *     defaults to ABORT.
 */
goog.net.XhrIo.prototype.abort = function(opt_failureCode) {
  if (this.xhr_ && this.active_) {
    this.logger_.fine(this.formatMsg_('Aborting'));
    this.active_ = false;
    this.inAbort_ = true;
    this.xhr_.abort();
    this.inAbort_ = false;
    this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ABORT);
    this.cleanUpXhr_();
  }
};


/**
 * Nullifies all callbacks to reduce risks of leaks.
 * @override
 * @protected
 */
goog.net.XhrIo.prototype.disposeInternal = function() {
  if (this.xhr_) {
    // We explicitly do not call xhr_.abort() unless active_ is still true.
    // This is to avoid unnecessarily aborting a successful request when
    // dispose() is called in a callback triggered by a complete response, but
    // in which browser cleanup has not yet finished.
    // (See http://b/issue?id=1684217.)
    if (this.active_) {
      this.active_ = false;
      this.inAbort_ = true;
      this.xhr_.abort();
      this.inAbort_ = false;
    }
    this.cleanUpXhr_(true);
  }

  goog.net.XhrIo.superClass_.disposeInternal.call(this);
};


/**
 * Internal handler for the XHR object's readystatechange event.  This method
 * checks the status and the readystate and fires the correct callbacks.
 * If the request has ended, the handlers are cleaned up and the XHR object is
 * nullified.
 * @private
 */
goog.net.XhrIo.prototype.onReadyStateChange_ = function() {
  if (!this.inOpen_ && !this.inSend_ && !this.inAbort_) {
    // Were not being called from within a call to this.xhr_.send
    // this.xhr_.abort, or this.xhr_.open, so this is an entry point
    this.onReadyStateChangeEntryPoint_();
  } else {
    this.onReadyStateChangeHelper_();
  }
};


/**
 * Used to protect the onreadystatechange handler entry point.  Necessary
 * as {#onReadyStateChange_} maybe called from within send or abort, this
 * method is only called when {#onReadyStateChange_} is called as an
 * entry point.
 * {@see #protectEntryPoints}
 * @private
 */
goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = function() {
  this.onReadyStateChangeHelper_();
};


/**
 * Helper for {@link #onReadyStateChange_}.  This is used so that
 * entry point calls to {@link #onReadyStateChange_} can be routed through
 * {@link #onReadyStateChangeEntryPoint_}.
 * @private
 */
goog.net.XhrIo.prototype.onReadyStateChangeHelper_ = function() {
  if (!this.active_) {
    // can get called inside abort call
    return;
  }

  if (typeof goog == 'undefined') {
    // NOTE(user): If goog is undefined then the callback has occurred as the
    // application is unloading and will error.  Thus we let it silently fail.

  } else if (
      this.xhrOptions_[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR] &&
      this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE &&
      this.getStatus() == 2) {
    // NOTE(user): In IE if send() errors on a *local* request the readystate
    // is still changed to COMPLETE.  We need to ignore it and allow the
    // try/catch around send() to pick up the error.
    this.logger_.fine(this.formatMsg_(
        'Local request error detected and ignored'));

  } else {

    // In IE when the response has been cached we sometimes get the callback
    // from inside the send call and this usually breaks code that assumes that
    // XhrIo is asynchronous.  If that is the case we delay the callback
    // using a timer.
    if (this.inSend_ &&
        this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE) {
      goog.Timer.defaultTimerObject.setTimeout(
          goog.bind(this.onReadyStateChange_, this), 0);
      return;
    }

    this.dispatchEvent(goog.net.EventType.READY_STATE_CHANGE);

    // readyState indicates the transfer has finished
    if (this.isComplete()) {
      this.logger_.fine(this.formatMsg_('Request complete'));

      this.active_ = false;

      // Call the specific callbacks for success or failure. Only call the
      // success if the status is 200 (HTTP_OK) or 304 (HTTP_CACHED)
      if (this.isSuccess()) {
        this.dispatchEvent(goog.net.EventType.COMPLETE);
        this.dispatchEvent(goog.net.EventType.SUCCESS);
      } else {
        this.lastErrorCode_ = goog.net.ErrorCode.HTTP_ERROR;
        this.lastError_ = this.getStatusText() + ' [' + this.getStatus() + ']';
        this.dispatchErrors_();
      }

      this.cleanUpXhr_();
    }
  }
};


/**
 * Remove the listener to protect against leaks, and nullify the XMLHttpRequest
 * object.
 * @param {boolean=} opt_fromDispose If this is from the dispose (don't want to
 *     fire any events).
 * @private
 */
goog.net.XhrIo.prototype.cleanUpXhr_ = function(opt_fromDispose) {
  if (this.xhr_) {
    // Save reference so we can mark it as closed after the READY event.  The
    // READY event may trigger another request, thus we must nullify this.xhr_
    var xhr = this.xhr_;
    var clearedOnReadyStateChange =
        this.xhrOptions_[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] ?
            goog.nullFunction : null;
    this.xhr_ = null;
    this.xhrOptions_ = null;

    if (this.timeoutId_) {
      // Cancel any pending timeout event handler.
      goog.Timer.defaultTimerObject.clearTimeout(this.timeoutId_);
      this.timeoutId_ = null;
    }

    if (!opt_fromDispose) {
      goog.net.xhrMonitor.pushContext(xhr);
      this.dispatchEvent(goog.net.EventType.READY);
      goog.net.xhrMonitor.popContext();
    }

    // Mark the request as having completed.
    goog.net.xhrMonitor.markXhrClosed(xhr);

    try {
      // NOTE(user): Not nullifying in FireFox can still leak if the callbacks
      // are defined in the same scope as the instance of XhrIo. But, IE doesn't
      // allow you to set the onreadystatechange to NULL so nullFunction is
      // used.
      xhr.onreadystatechange = clearedOnReadyStateChange;
    } catch (e) {
      // This seems to occur with a Gears HTTP request. Delayed the setting of
      // this onreadystatechange until after READY is sent out and catching the
      // error to see if we can track down the problem.
      this.logger_.severe('Problem encountered resetting onreadystatechange: ' +
                          e.message);
    }
  }
};


/**
 * @return {boolean} Whether there is an active request.
 */
goog.net.XhrIo.prototype.isActive = function() {
  return !!this.xhr_;
};


/**
 * @return {boolean} Whether the request has completed.
 */
goog.net.XhrIo.prototype.isComplete = function() {
  return this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE;
};


/**
 * @return {boolean} Whether the request completed with a success.
 */
goog.net.XhrIo.prototype.isSuccess = function() {
  switch (this.getStatus()) {
    case 0:         // Used for local XHR requests
      return !this.isLastUriEffectiveSchemeHttp_();

    case goog.net.HttpStatus.OK:
    case goog.net.HttpStatus.CREATED:
    case goog.net.HttpStatus.ACCEPTED:
    case goog.net.HttpStatus.NO_CONTENT:
    case goog.net.HttpStatus.NOT_MODIFIED:
    case goog.net.HttpStatus.QUIRK_IE_NO_CONTENT:
      return true;

    default:
      return false;
  }
};


/**
 * @return {boolean} whether the effective scheme of the last URI that was
 *     fetched was 'http' or 'https'.
 * @private
 */
goog.net.XhrIo.prototype.isLastUriEffectiveSchemeHttp_ = function() {
  var lastUriScheme = goog.isString(this.lastUri_) ?
      goog.uri.utils.getScheme(this.lastUri_) :
      (/** @type {!goog.Uri} */ this.lastUri_).getScheme();
  // if it's an absolute URI, we're done.
  if (lastUriScheme) {
    return goog.net.XhrIo.HTTP_SCHEME_PATTERN.test(lastUriScheme);
  }

  // if it's a relative URI, it inherits the scheme of the page.
  if (self.location) {
    return goog.net.XhrIo.HTTP_SCHEME_PATTERN.test(self.location.protocol);
  } else {
    // This case can occur from a web worker in Firefox 3.5 . All other browsers
    // with web workers support self.location from the worker.
    return true;
  }
};


/**
 * Get the readystate from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {goog.net.XmlHttp.ReadyState} goog.net.XmlHttp.ReadyState.*.
 */
goog.net.XhrIo.prototype.getReadyState = function() {
  return this.xhr_ ?
      /** @type {goog.net.XmlHttp.ReadyState} */ (this.xhr_.readyState) :
      goog.net.XmlHttp.ReadyState.UNINITIALIZED;
};


/**
 * Get the status from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {number} Http status.
 */
goog.net.XhrIo.prototype.getStatus = function() {
  /**
   * IE doesn't like you checking status until the readystate is greater than 2
   * (i.e. it is recieving or complete).  The try/catch is used for when the
   * page is unloading and an ERROR_NOT_AVAILABLE may occur when accessing xhr_.
   * @preserveTry
   */
  try {
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ?
        this.xhr_.status : -1;
  } catch (e) {
    this.logger_.warning('Can not get status: ' + e.message);
    return -1;
  }
};


/**
 * Get the status text from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {string} Status text.
 */
goog.net.XhrIo.prototype.getStatusText = function() {
  /**
   * IE doesn't like you checking status until the readystate is greater than 2
   * (i.e. it is recieving or complete).  The try/catch is used for when the
   * page is unloading and an ERROR_NOT_AVAILABLE may occur when accessing xhr_.
   * @preserveTry
   */
  try {
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ?
        this.xhr_.statusText : '';
  } catch (e) {
    this.logger_.fine('Can not get status: ' + e.message);
    return '';
  }
};


/**
 * Get the last Uri that was requested
 * @return {string} Last Uri.
 */
goog.net.XhrIo.prototype.getLastUri = function() {
  return String(this.lastUri_);
};


/**
 * Get the response text from the Xhr object
 * Will only return correct result when called from the context of a callback.
 * @return {string} Result from the server, or '' if no result available.
 */
goog.net.XhrIo.prototype.getResponseText = function() {
  /** @preserveTry */
  try {
    return this.xhr_ ? this.xhr_.responseText : '';
  } catch (e) {
    // http://www.w3.org/TR/XMLHttpRequest/#the-responsetext-attribute
    // states that responseText should return '' (and responseXML null)
    // when the state is not LOADING or DONE. Instead, IE and Gears can
    // throw unexpected exceptions, eg, when a request is aborted or no
    // data is available yet.
    this.logger_.fine('Can not get responseText: ' + e.message);
    return '';
  }
};


/**
 * Get the response XML from the Xhr object
 * Will only return correct result when called from the context of a callback.
 * @return {Document} The DOM Document representing the XML file, or null
 * if no result available.
 */
goog.net.XhrIo.prototype.getResponseXml = function() {
  /** @preserveTry */
  try {
    return this.xhr_ ? this.xhr_.responseXML : null;
  } catch (e) {
    this.logger_.fine('Can not get responseXML: ' + e.message);
    return null;
  }
};


/**
 * Get the response and evaluates it as JSON from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @param {string=} opt_xssiPrefix Optional XSSI prefix string to use for
 *     stripping of the response before parsing. This needs to be set only if
 *     your backend server prepends the same prefix string to the JSON response.
 * @return {Object|undefined} JavaScript object.
 */
goog.net.XhrIo.prototype.getResponseJson = function(opt_xssiPrefix) {
  if (!this.xhr_) {
    return undefined;
  }

  var responseText = this.xhr_.responseText;
  if (opt_xssiPrefix && responseText.indexOf(opt_xssiPrefix) == 0) {
    responseText = responseText.substring(opt_xssiPrefix.length);
  }

  return goog.json.parse(responseText);
};


/**
 * Get the response as the type specificed by {@link #setResponseType}. At time
 * of writing, this is only directly supported in very recent versions of WebKit
 * (10.0.612.1 dev and later). If the field is not supported directly, we will
 * try to emulate it.
 *
 * Emulating the response means following the rules laid out at
 * http://dev.w3.org/2006/webapi/XMLHttpRequest-2/#the-response-attribute.
 *
 * On browsers with no support for this (Chrome < 10, Firefox < 4, etc), only
 * response types of DEFAULT or TEXT may be used, and the response returned will
 * be the text response.
 *
 * On browsers with Mozilla's draft support for array buffers (Firefox 4, 5),
 * only response types of DEFAULT, TEXT, and ARRAY_BUFFER may be used, and the
 * response returned will be either the text response or the Mozilla
 * implementation of the array buffer response.
 *
 * On browsers will full support, any valid response type supported by the
 * browser may be used, and the response provided by the browser will be
 * returned.
 *
 * @return {*} The response.
 */
goog.net.XhrIo.prototype.getResponse = function() {
  /** @preserveTry */
  try {
    if (!this.xhr_) {
      return null;
    }
    if ('response' in this.xhr_) {
      return this.xhr_.response;
    }
    switch (this.responseType_) {
      case goog.net.XhrIo.ResponseType.DEFAULT:
      case goog.net.XhrIo.ResponseType.TEXT:
        return this.xhr_.responseText;
        // DOCUMENT and BLOB don't need to be handled here because they are
        // introduced in the same spec that adds the .response field, and would
        // have been caught above.
        // ARRAY_BUFFER needs an implementation for Firefox 4, where it was
        // implemented using a draft spec rather than the final spec.
      case goog.net.XhrIo.ResponseType.ARRAY_BUFFER:
        if ('mozResponseArrayBuffer' in this.xhr_) {
          return this.xhr_.mozResponseArrayBuffer;
        }
    }
    // Fell through to a response type that is not supported on this browser.
    this.logger_.severe('Response type ' + this.responseType_ + ' is not ' +
                        'supported on this browser');
    return null;
  } catch (e) {
    this.logger_.fine('Can not get response: ' + e.message);
    return null;
  }
};


/**
 * Get the value of the response-header with the given name from the Xhr object
 * Will only return correct result when called from the context of a callback
 * and the request has completed
 * @param {string} key The name of the response-header to retrieve.
 * @return {string|undefined} The value of the response-header named key.
 */
goog.net.XhrIo.prototype.getResponseHeader = function(key) {
  return this.xhr_ && this.isComplete() ?
      this.xhr_.getResponseHeader(key) : undefined;
};


/**
 * Gets the text of all the headers in the response.
 * Will only return correct result when called from the context of a callback
 * and the request has completed.
 * @return {string} The value of the response headers or empty string.
 */
goog.net.XhrIo.prototype.getAllResponseHeaders = function() {
  return this.xhr_ && this.isComplete() ?
      this.xhr_.getAllResponseHeaders() : '';
};


/**
 * Get the last error message
 * @return {goog.net.ErrorCode} Last error code.
 */
goog.net.XhrIo.prototype.getLastErrorCode = function() {
  return this.lastErrorCode_;
};


/**
 * Get the last error message
 * @return {string} Last error message.
 */
goog.net.XhrIo.prototype.getLastError = function() {
  return goog.isString(this.lastError_) ? this.lastError_ :
      String(this.lastError_);
};


/**
 * Adds the last method, status and URI to the message.  This is used to add
 * this information to the logging calls.
 * @param {string} msg The message text that we want to add the extra text to.
 * @return {string} The message with the extra text appended.
 * @private
 */
goog.net.XhrIo.prototype.formatMsg_ = function(msg) {
  return msg + ' [' + this.lastMethod_ + ' ' + this.lastUri_ + ' ' +
      this.getStatus() + ']';
};


// Register the xhr handler as an entry point, so that
// it can be monitored for exception handling, etc.
goog.debug.entryPointRegistry.register(
    /**
     * @param {function(!Function): !Function} transformer The transforming
     *     function.
     */
    function(transformer) {
      goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ =
          transformer(goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_);
    });
/**
 * This class is for sending requests to Service Framework based Web Services.
 */
goog.provide('gcm.net.ws');
goog.require('goog.net.XhrIo');

/**
 * timeout setting in milliseconds
 * @type {number}
 */
gcm.net.ws.TIMOUT_MILLIS = 30000;

/**
 * http headers to add to the request
 * specify accept xml
 * @type {string}
 */
gcm.net.ws.APPLICATION_XML = 'application/xml;';
/**
 * http headers to add to the request
 * specify accept json
 * @type {string}
 */
gcm.net.ws.APPLICATION_JSON = 'application/json;';


/**
 * @param {string} url config web service url.
 * @param {Object=} xmlResponseHandlerObject object on which to invoke responseHandler with the response.
 * @param {?function(Document)=} xmlResponseHandler function.
 * @param {?function(string, string, string, string, Object=)=} errorHandler Error handling function.
 * */
gcm.net.ws.getXmlResponse = function(url, xmlResponseHandlerObject, xmlResponseHandler, errorHandler) {
  gcm.net.ws.requestWSResponse(gcm.net.ws.APPLICATION_XML, url,
    xmlResponseHandlerObject, xmlResponseHandler, errorHandler);
};


/**
 * @param {string} url config web service url.
 * @param {Object=} jsonResponseHandlerObject object on which to invoke responseHandler with the response.
 * @param {Function=} jsonResponseHandler function.
 * @param {?function(string, string, string, string, Object=)=} errorHandler Error handling function.
 * */
gcm.net.ws.getJsonResponse = function(url, jsonResponseHandlerObject, jsonResponseHandler, errorHandler) {
  gcm.net.ws.requestWSResponse(gcm.net.ws.APPLICATION_JSON, url,
    jsonResponseHandlerObject, jsonResponseHandler, errorHandler);
};

/**
 * @param {string} url config web service url.
 * @param {string} content The content of request.
 * @param {Object=} jsonResponseHandlerObject object on which to invoke responseHandler with the response.
 * @param {Function=} jsonResponseHandler function.
 * @param {?function(string, string, string, string, Object=)=} errorHandler Error handling function.
 * */
gcm.net.ws.postJsonRequest = function(url, content, jsonResponseHandlerObject, jsonResponseHandler, errorHandler) {
  gcm.net.ws.requestWSResponse(gcm.net.ws.APPLICATION_JSON, url,
    jsonResponseHandlerObject, jsonResponseHandler, errorHandler, content);
};

/**
 * @param {string} url config web service url.
 * @param {string} content The content of request.
 * @param {Object=} xmlResponseHandlerObject object on which to invoke responseHandler with the response.
 * @param {?function(Document)=} xmlResponseHandler function.
 * @param {?function(string, string, string, string, Object=)=} errorHandler Error handling function.
 * */
gcm.net.ws.postXmlRequest = function(url, content, xmlResponseHandlerObject, xmlResponseHandler, errorHandler) {
  gcm.net.ws.requestWSResponse(gcm.net.ws.APPLICATION_XML, url,
    xmlResponseHandlerObject, xmlResponseHandler, errorHandler, content);
};

/**
 * @param {string} type expected response type, should be gcm.net.ws.APPLICATION_XML or gcm.net.ws.APPLICATION_JSON.
 * @param {string} url config web service url.
 * @param {Object=} responseHandlerObject object on which to invoke responseHandler with the response.
 * @param {Function=} responseHandler function.
 * @param {?function(string, string, string, string, Object=)=} errorHandler Error handling function.
 * @param {string=} content The content of request.
 * */
gcm.net.ws.requestWSResponse = function(type, url, responseHandlerObject, responseHandler, errorHandler, content) {
  //find out send type
  var sendMethod = content ? 'POST' : 'GET';
  var errorCode, errorMessage;

  //CORE FIX FOR LOCAL GCM TRYING TO POST AND CAUSING A CONSOLE ERROR
  if (url && url.substr(url.length - 7) === "gamelog")
  {
    sendMethod = 'GET';
  }
  //CORE FIX FOR LOCAL GCM TRYING TO POST AND CAUSING A CONSOLE ERROR
  
  //setup http headers
  var headers = new goog.structs.Map();
  headers.set('Accept', type);
  if ('POST' == sendMethod)
    headers.set('Content-Type', type);

  goog.net.XhrIo.send(url, function(e) {
    var xhr = /** @type {goog.net.XhrIo} */ (e.target);
    if (xhr.isSuccess()) {
      if (responseHandlerObject) {
        switch (type) {
        case gcm.net.ws.APPLICATION_XML:
          responseHandler.call(responseHandlerObject, xhr.getResponseXml());
          break;
        case gcm.net.ws.APPLICATION_JSON:
          responseHandler.call(responseHandlerObject, xhr.getResponseJson());
          break;
        }
      }
    }
    else {
      var errorObj = gcm.net.ws.handleError_(url, xhr, type);
      errorCode = errorObj.errorCode;
      errorMessage = errorObj.errorMessage;
      if (errorHandler)  {
        var errorParams = {'url': url};
        // compare error code to list of known errors
        // figure out the error category
        var errorCategory = gcm.error.getErrorCategory(errorCode);
        // figure out the error type
        var errorSeverity = gcm.error.getErrorSeverity(errorCode);

        errorHandler.call(responseHandlerObject, errorCategory, errorSeverity, errorCode, errorMessage, errorParams);
      }
      throw new Error('An error has occurred communicating with url:' + url + '\nError Code: ' + errorCode +
      '\nError Message: ' + errorMessage);
    }
  }, sendMethod, content, headers, gcm.net.ws.TIMOUT_MILLIS);
};

/**
 * @private
 * @param {string} url config web service url.
 * @param {goog.net.XhrIo} xhr google closure XHRIO Object.
 * @param {string} contentType response content type.
 * @return {Object} errorObj the error object in following format.
 * {'errorCode': errorcode ,'errorMessage': errormessage}
 *
 */
gcm.net.ws.handleError_ = function(url, xhr, contentType) {
  var errorCode, errorMessage = '';
  if (xhr.getLastErrorCode() === goog.net.ErrorCode.ABORT) {
    errorCode = 'goog.net.ErrorCode.ABORT';
  } else if (xhr.getLastErrorCode() === goog.net.ErrorCode.TIMEOUT) {
    errorCode = 'goog.net.ErrorCode.TIMEOUT';
  } else if (xhr.getLastErrorCode() === goog.net.ErrorCode.ACCESS_DENIED) {
    errorCode = 'goog.net.ErrorCode.ACCESS_DENIED';
  } else if (xhr.getLastErrorCode() === goog.net.ErrorCode.HTTP_ERROR) {
    if (xhr.getStatus() == 400 || xhr.getStatus() == 401) {
      //this is a bad request(400) or unauthorized request(401)
      //we can retreive details from response body
      switch (contentType) {
        case gcm.net.ws.APPLICATION_JSON:
          var errorJson = xhr.getResponseJson();
          errorMessage = errorJson['Message'];
          errorCode = errorJson['Code'];
          break;
        case gcm.net.ws.APPLICATION_XML:
          var errorNode = xhr.getResponseXml().getElementsByTagName('ServiceError')[0];
          errorMessage = errorNode.getElementsByTagName('Message')[0].childNodes[0].nodeValue;
          errorCode = errorNode.getElementsByTagName('Code')[0].childNodes[0].nodeValue;
          break;
        default:
          errorMessage = 'cannot parse error response, unknown response content type: [' + contentType + ']';
          errorCode = 'UNKNOWN';
      }
    } else if (xhr.getStatus() == 500) {
      errorCode = 'INTERNAL_SERVER_ERROR';
      errorMessage = '500: An internal server error has occurred';
    } else if (xhr.getStatus() == 503) {
      errorCode = 'SERVICE_UNAVAILABLE';
      errorMessage = '503: Service Unavailable';
    } else if (xhr.getStatus() == 0) {
      errorCode = 'INTERNET_DISCONNECTED';
      errorMessage = 'Sorry, A Network Error Occurred';
    } else {
      errorCode = 'goog.net.ErrorCode.HTTP_ERROR';
    }
  } else {
    errorCode = 'UNKNOWN';
    errorMessage = 'com.openbet.gcm.net.ws.getJsonResponse: unknown error';
  }

  if ('' == errorMessage)
    errorMessage = goog.net.ErrorCode.getDebugMessage(errorCode);

  return {'errorCode': errorCode, 'errorMessage': errorMessage};
};
/**
 * @author cramacha
 * Date: 21/05/13
 */
goog.provide('gcm.liveserv.LiveServ');
goog.require('gcm.liveserv.MessageHandler');
goog.require('gcm.net.ws');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.json');
goog.require('goog.structs');
goog.require('goog.structs.Map');

/**
 * This class is managed by gcm and has the liveserv functionalities.
 * It creates a liveserv frame, requests authentication token from gcm-ws,
 * subscribes and handles messages from liveserv channels.
 *
 * @param {!string} webServiceUrlBase The base url for gcm web service, e.g. /gcm-ws".
 * @param {Object} gameWindow The game window object.
 * @constructor
 */
function LiveServ(webServiceUrlBase, gameWindow) {
  this.liveServWSUrlBase_ = webServiceUrlBase + LiveServ.SERVICE_URL;
  this.gameWindow_ = gameWindow;
  this.tokenRequested_ = false;
  this.timeOutInterval_ = 5;
}

/**
 * @const The relative URL of this web service.
 */
LiveServ.SERVICE_URL = '/liveserv/';

/**
 * Adds message event listener to commonUI window to handle liveserv API and creates liveserv frame.
 *
 * @param {GCMConfig} gcmConfig The config module to retrieve related config from gcm-ws.
 * @param {goog.structs.Map.<string, MessageHandler>} handlers The handler objects for liveserv messages.
 * @param {Function} onReadyCallback The callback function after init.
 */
LiveServ.prototype.run = function(gcmConfig, handlers, onReadyCallback) {
  this.onReadyCallback_ = onReadyCallback;
  this.handlers_ = null;
  if (typeof window.postMessage === 'function' && gcmConfig.checkConfigEnabled('liveserv') &&
      gcmConfig.checkConfigEnabled('liveserv.channels') && gcmConfig.getConfig('liveserv.channels.list') &&
      handlers && handlers.getCount() > 0) {
    this.handlers_ = handlers;
    var enabledChannelTypes = gcmConfig.getConfig('liveserv.channels.list').split(/[\s,]+/);
    var supportedChannelTypes = this.handlers_.getKeys();
    // Removing handlers for non-enabled channels since we add all available handlers in gcm before calling
    // liveserv run and at this point, remove those which are not required based on the list of enabled
    // channels retrieved from the gcm-ws.
    for (var i = 0; i < supportedChannelTypes.length; i++) {
      var channelType = supportedChannelTypes[i];
      if (goog.array.contains(enabledChannelTypes, channelType))
        this.handlers_.get(channelType).init(gcm.delegate.create(this, this.onHandlerInitCallBack_));
      else
        this.handlers_.remove(channelType);
    }
  }
  if (!this.handlers_ || this.handlers_.getCount() === 0)
    this.onReadyCallback_();
};

/**
 * This method will be called by individual handlers when init is complete. On invocation, if all the handlers'
 * init is complete, create liveserv frame and inform gcm that liveserv init is complete and that game ui can
 * be enabled. Else, wait until the next invocation by another handler.
 *
 * @private
 */
LiveServ.prototype.onHandlerInitCallBack_ = function() {
  var handlersInitComplete = true;
  // Return if any handler init is not complete
  goog.structs.forEach(this.handlers_, function(val, key, map) {
    if (!val.isInitComplete()) {
      handlersInitComplete = false;
      return;
    }
  });
  if (handlersInitComplete) {
    // Make liveserv frame
    goog.events.listen(window, goog.events.EventType.MESSAGE, this.messageEventHandler_, false, this);
    this.makeIFrame_('../' + this.liveServWSUrlBase_ + 'frame.html');
    this.onReadyCallback_();
  }
};

/**
 * Request liveserv auth token from gcm-ws.
 *
 * @private
 */
LiveServ.prototype.requestLiveServToken_ = function() {
  gcm.net.ws.getJsonResponse(this.liveServWSUrlBase_ + 'token.json', this,
    this.liveServTokenResponseHandler_, this.liveServTokenErrorResponseHandler_);
};

/**
 * Creates an iframe to handle liveserv API.
 *
 * @param {!string} url The url to load into the iframe.
 * @private
 */
LiveServ.prototype.makeIFrame_ = function(url) {
  var liveServFrame_ = this.gameWindow_.document.createElement('IFRAME');
  liveServFrame_.name = 'pushIFrameParent';
  liveServFrame_.setAttribute('src', url);
  liveServFrame_.style.width = '25px';
  liveServFrame_.style.height = '15px';
  liveServFrame_.style.position = 'absolute';
  liveServFrame_.setAttribute('scrolling', 'no');
  liveServFrame_.style.border = '0px';
  liveServFrame_.style.top = '0px';
  liveServFrame_.style.left = '-9999px';
  this.gameWindow_.document.body.appendChild(liveServFrame_);
  liveServFrame_['contentWindow']['commonUIWindow'] = window;
};

/**
 * The function to handle 'message' event in commonUI.
 * <p>
 * Handles the messages posted from liveserv window.
 *
 * @param {!goog.events.BrowserEvent} event The message event in window.
 * @private
 */
LiveServ.prototype.messageEventHandler_ = function(event) {
  var messageEvent = event.getBrowserEvent();
  if (messageEvent.origin !== window.location.protocol + '//' + window.location.host) {
    throw new Error('Liveserv.messageEventHandler_: Message received from invalid origin');
  } else {
    var data = goog.json.parse(messageEvent.data);
    if (data['message_type'] == 'liveserv_init') {
      /** @type {Window} */
      this.liveServWindow_ = messageEvent.source;
      this.requestLiveServToken_();
    } else if (data['message_type'] == 'liveserv_notification') {
      // Handle the data using appropriate handler
      this.handlers_.get(data['channel_type']).handleMessage(data);
    }
  }
};

/**
 * The function to post messages to liveserv iframe window.
 *
 * @param {!Object} message The message to be posted in json format.
 * @private
 */
LiveServ.prototype.postMessageToLiveServWindow_ = function(message) {
  this.liveServWindow_.postMessage(goog.json.serialize(message),
    window.location.protocol + '//' + window.location.host);
  this.tokenRequested_ = true;
};

/**
 * Parse the auth token response from gcm-ws.
 *
 * @param {!Object} jsonResponse The response in JSON format.
 * @private
 */
LiveServ.prototype.liveServTokenResponseHandler_ = function(jsonResponse) {
  // Parse the response
  var liveServToken = jsonResponse['LiveServToken'];
  var expiryTime = parseInt(jsonResponse['TokenExpiry'], 10);
  var liveServChannelId = parseInt(jsonResponse['ChannelId'], 10);

  if (!(liveServToken && liveServChannelId && expiryTime)) {
    this.setTimeoutOnError_();
    throw new Error('com.openbet.gcm.liveserv.LiveServ.liveServTokenResponseHandler_:' +
      ' Failed to parse token response');
  }
  // Requesting token after half life (1000ms / 2)
  setTimeout(gcm.delegate.create(this, this.requestLiveServToken_), expiryTime * 500);

  // Token already sent to liveserv API and so refreshing the token
  if (this.tokenRequested_) {
    var pushJSONResponse = {'message_type': 'token_refresh', 'token_value': liveServToken};
    // Call function to push message to liveserv API
    this.postMessageToLiveServWindow_(pushJSONResponse);
  } else {
    // Token being sent to liveserv API for the first time
    // Create an array of required channels
    var channels = new Array();
    goog.structs.forEach(this.handlers_, function(val, key, map) {
        var channel = val.getChannelType() + ((val.getChannelId) ? val.getChannelId() : liveServChannelId);
        goog.array.insert(channels, channel);
      }
    );
    // Message to be sent to liveserv frame
    var pushJSONResponse = {'message_type': 'liveserv_init', 'channels': channels, 'token_value': liveServToken};
    // Call function to push message to liveserv API
    this.postMessageToLiveServWindow_(pushJSONResponse);
  }
  // Reset the time out interval for error after any successful request
  this.timeOutInterval_ = 5;
};

/**
 * @private
 */
LiveServ.prototype.setTimeoutOnError_ = function() {
  setTimeout(gcm.delegate.create(this, this.requestLiveServToken_), this.timeOutInterval_ * 1e3);
  if (this.timeOutInterval_ < 30)
    this.timeOutInterval_ += 5;
};

/**
 * @private
 */
LiveServ.prototype.liveServTokenErrorResponseHandler_ = function() {
  this.setTimeoutOnError_();
};
/**
 * */
goog.provide('gcm.event.GCMEvent');

/**
 * @class
 * Model data of Event Object. Which is used by any EventDispatcher Object.
 *
 * @see EventDispatcher
 *
 * @constructor
 *
 * @param {string} name Event string.
 * @param {*=} body (Optional) Event body, can be ignored.
 *
 * @property {string} name Event name, used when adding event listeners.
 * @property {*} body Event body, can be null.
 */
function GCMEvent(name, body)
{
  this.name = name;
  this.body = body;
  this.target = null;
}

/** @type {string}*/
GCMEvent.COMPLETE = 'complete';
goog.provide('gcm.event.EventDispatcher');
goog.require('gcm.event.GCMEvent');

/**
 * @class
 *
 * @constructor
 * */
function EventDispatcher() {
  /** @private
   * @type {Object}
   * */
  this.listeners_ = {};
}

/**
 * @param {string} eventStr Event name.
 * @param {Function} eventListener Event listener function, will be invoked when event is dispatched.
 * @param {Object=} scope (Optional) Event The caller of event listener function, by default is window.
 * */
EventDispatcher.prototype.addEventListener = function(eventStr, eventListener, scope) {
  if (!this.listeners_[eventStr]) {
    this.listeners_[eventStr] = new Array();
  }

  for (var i = 0; i < this.listeners_[eventStr].length; ++i) {
    var listenerObj = this.listeners_[eventStr][i];
    //Skip add event listener if the same listener is already in list.
    if (listenerObj.func == eventListener && listenerObj.scope == scope)
        return;
  }

  this.listeners_[eventStr].push({func: eventListener, scope: scope});
};

/**
 * @param {string} eventStr Event name.
 * @param {Function=} eventListener (Optional) The listener to be removed, if this parameter is not
 *                    provided all listeners under event name will be removed.
 * @param {Object=} scope (Optional) Event The caller of event listener function, by default is window.
 * */
EventDispatcher.prototype.removeEventListener = function(eventStr, eventListener, scope) {
  var listenerQueue = this.listeners_[eventStr];

  if (listenerQueue) {
    if (eventListener) {
      for (var i = 0; i < listenerQueue.length; ++i) {
        var currentListener = listenerQueue[i].func;
        var caller = listenerQueue[i].scope;
        if (eventListener == currentListener && scope == caller) {
          listenerQueue.splice(i, 1);
          break;
        }
      }
    }
    else
      listenerQueue.splice(0, listenerQueue.length);
  }
};

/**
 * @param {GCMEvent} event The event object been dispatched.
 * */
EventDispatcher.prototype.dispatchEvent = function(event)
{
  event.target = this;
  var listenerQueue = this.listeners_[event.name];

  if (listenerQueue) {
    for (var i = 0; i < listenerQueue.length; ++i) {
      var func = listenerQueue[i].func;
      var scope = listenerQueue[i].scope;
      func.call(scope, event);
    }
  }
};
/**
 * @author xliu
 */
goog.provide('gcm.config.GameConfig');
goog.require('gcm.event.EventDispatcher');
goog.require('gcm.net.ws');
goog.inherits(GameConfig, EventDispatcher);
/**
 * @extends EventDispatcher
 * @class
 * <p>
 * This class is managed by gcm and aims to get game config from web service.<br>
 * @param {string} webServiceUrl the base url for the gcm web service, e.g. /gcm-ws.
 *        It takes a errorObject when error occurs.
 *        <pre>
 *          {
 *              errorCode: code,
 *              errorMessage: msg
 *          }
 *        </pre>.
 * @constructor
 */
function GameConfig(webServiceUrl) {
  EventDispatcher.call(this);

  this.webServiceUrlBase_ = webServiceUrl + GameConfig.SERVICE_URL;
}

/** @const The relative URL of this web service*/
GameConfig.SERVICE_URL = '/config/';

/**
 * The possible play modes:
 * demo , real and freespin
 * @enum {string}
 */
GameConfig.PlayMode = {
  DEMO: 'demo',
  REAL: 'real',
  FREESPIN: 'freespin'
};

/**
 * @type {GameConfig.PlayMode}
 * @private
 */
GameConfig.prototype.playMode_;

/**
 * @type {string}
 * @private
 */
GameConfig.prototype.channel_;

/**
 * is the config ready
 * This is false until we have retrieved config from server
 * @type {boolean}
 * @private
 */
GameConfig.prototype.ready_ = false;

/**
 * name of game
 * @type {string}
 * @private
 */
GameConfig.prototype.gameName_;

/**
 * class of game (tcggame.cg_class)
 * @type {string}
 * @private
 */
GameConfig.prototype.gameClass_;

/**
 * url of FOG Server
 * @type {string}
 * @private
 */
GameConfig.prototype.gameServerUrl_;

/**
 * @type {string}
 * @private
 */
GameConfig.prototype.webServiceUrlBase_;

/**
 * @type {boolean}
 * @private
 */
GameConfig.prototype.freespinsPlay_;

/**
 * @type {boolean}
 * @private
 */
GameConfig.prototype.loggedIn_;

/**
 * call the web service to retrieve game config data
 */
GameConfig.prototype.init = function() {
  this.getGameConfigFromWs_();
};

/**
 * @private
 */
GameConfig.prototype.getGameConfigFromWs_ = function() {
  //TODO remove this file type suffix - this is currently needed for
  //testing on dummy xml files aliased into apache on localhost
  var url = this.webServiceUrlBase_ + this.gameName_ + '.xml';

  gcm.net.ws.getXmlResponse(url, this, this.responseHandler);
};


/**
 * Handle a successful response from gcm gameconfig web service.<br>
 * We expect the response to have the following format:
 * <pre>
 *   &lt;GameConfigResponse&gt;
 *     &lt;GameName&gt;GameNameNodeValue&lt;/GameName&gt;
 *     &lt;GameServerUrl&gt;GameServerUrlNodeValue&lt;/GameServerUrl&gt;
 *     &lt;GameClass&gt;GameClassNodeValue&lt;/GameClass&gt;
 *     &lt;FreespinPlay&gt;Y&lt;/FreespinPlay&gt;
 *     &lt;LoggedIn&gt;true&lt;/LoggedIn&gt;
 *   &lt;/GameConfigResponse&gt;
 * </pre>
 * @param {Document} xmlDocResponse response body in XML format.
 */
GameConfig.prototype.responseHandler = function(xmlDocResponse) {
  /** @type {Node} */
  var configNode;
  /** @type {string} */
  var gameName;
  /** @type {string} */
  var gameServerUrl;
  /** @type {string} */
  var gameClass;
  /** @type {boolean} */
  var loggedIn;
  /** @type {string} */
  var freespinPlay;

  try {
    configNode = xmlDocResponse.getElementsByTagName('GameConfigResponse')[0];
    gameName = configNode.getElementsByTagName('GameName')[0].childNodes[0].nodeValue;
    gameServerUrl = configNode.getElementsByTagName('GameServerUrl')[0].childNodes[0].nodeValue;
    gameClass = configNode.getElementsByTagName('GameClass')[0].childNodes[0].nodeValue;
    loggedIn = String.prototype.toLowerCase.call(
    configNode.getElementsByTagName('LoggedIn')[0].childNodes[0].nodeValue) == 'true';

    if(configNode.getElementsByTagName('FreespinPlay')[0]) {
        freespinPlay = configNode.getElementsByTagName('FreespinPlay')[0].childNodes[0].nodeValue;
    }
    
  } catch (e) {
    throw new Error('com.openbet.gcm.gameconfig.handleGameConfigWsResponse: failed to parse gameconfig response');
  }

  if (gameName !== this.gameName_) {
    throw new Error('com.openbet.gcm.gameconfig.handleGameConfigWsResponse: unexpected game name');
  }
  this.ready_ = true;
  this.gameClass_ = gameClass;
  this.gameServerUrl_ = gameServerUrl;
  this.loggedIn_ = loggedIn;
  this.freespinPlay_ = freespinPlay;
  this.dispatchEvent(new GCMEvent(GCMEvent.COMPLETE));
};

/**
 * @param {string} name Game name passed from game through gcm.
 * */
GameConfig.prototype.setGameName = function(name)
{
  this.gameName_ = name;
};

/**
 * Returns the game name.
 * @return {string} the game name.
 * */
GameConfig.prototype.getGameName = function()
{
  return this.gameName_;
};

/**
 * @param {GameConfig.PlayMode} mode Game mode passed from game through gcm.
 * */
GameConfig.prototype.setPlayMode = function(mode)
{
  this.playMode_ = mode;
};

/**
 * Returns the play mode.
 * @return {GameConfig.PlayMode} the play mode.
 * */
GameConfig.prototype.getPlayMode = function()
{
  return this.playMode_;
};

/**
 * @param {string} channel Game channel passed from game through gcm.
 * */
GameConfig.prototype.setChannel = function(channel)
{
  this.channel_ = channel;
};

/**
 * is the config ready to be used
 * @return {boolean} return the ready state of config.
 */
GameConfig.prototype.isReady = function() {
  return this.ready_;
};

/**
 * @param {boolean} loggedIn flag to indicate whether the player is logged in.
 */
GameConfig.prototype.setLoggedIn = function(loggedIn)
{
  this.loggedIn_ = loggedIn;
};

/**
 * @param {boolean} freespinPlay value to indicate whether the game is available for
 * freespin play.
 */
GameConfig.prototype.setFreespinPlay = function(freespinPlay)
{
  this.freespinPlay_ = freespinPlay;
};

/**
 * returns freespinPlay flag value
 * @return {boolean} return the freespin play availablity of game.
 */
GameConfig.prototype.isFreespinPlayEnabled = function() {
  if ('Y' == this.freespinPlay_)
    return true;
  else
    return false;
};

/**
 * Retrieves game configuration information.<br>
 * The game or commonUI can call this to retrieve the configuration it requires
 * to initialize.<br>
 * The returned configuration items will be gameName, playMode, channel, gameClass, gameServerUrl<br>
 * loggedIn and freespinPlay
 * For now only gameName, playMode and channel are available
 * @return {Object} the config object.
 */
GameConfig.prototype.getConfig = function() {
  if (this.ready_) {
    return {
      'gameName': this.gameName_,
      'playMode': this.playMode_,
      'channel': this.channel_,
      'gameClass': this.gameClass_,
      'gameServerUrl': this.gameServerUrl_,
      'loggedIn' : this.loggedIn_
    };
  } else {
    throw new Error('GameConfig.prototype.getConfig: Config is not ready');
  }
};
/**
 * @fileoverview
 * This is the singleton base constructor for any class using singleton partten. <br>
 * To make a class into singleton class by this contructor, change return value of
 * original constructor to:<br>
 * <pre>
 *   function A() {
 *    //constructor code
 *    //...
 *
 *    return SingletonBase.call(this);
 *   }
 * </pre>
 *
 * to get a reference of singleton class A, create new instance by:<br>
 *   <b>var a = new A()</b> <br>
 * or use reference on constructor: <br>
 *   <b>var a = A.instance</b>
 *
 * @author xliu
 * Date: 07/05/13
 */
goog.provide('gcm.SingletonBase');

/**
 * @this {*} this pointer should be point to a reference of a singleton class instance.
 * This function is used only in singleton class constructor.
 * @return {*} The singleton instance of given class.
 * */
function SingletonBase() {
  if (!this.constructor.instance)
    this.constructor.instance = this;
  return this.constructor.instance;
}
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
  'configReady', 'handleError'
];

/**
 * The interface that a 2.X+ commonUI object must implement
 * @type {Array.<string>}
 * @private
 */
gcm.validate.commonUIIfaceV2_ = [  
  'handleSessionStats',
  'handleFreebetAward',
  'handleBonusBarFilled',
  'handleBonusBarUpdate',
  'handleSessionDurationUpdate'
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
 * Check that a commonUI object implements the 2.X interface.
 * @param {Object} commonUI a commonUI object.
 * @return {Array.<string>} the result of the check.
 */
gcm.validate.isCommonUIV2 = function(commonUI) {

  var rsltArr = [];
  var len = gcm.validate.commonUIIfaceV2_.length;
  for (var i = 0; i < len; i++) {
    var functionName = gcm.validate.commonUIIfaceV2_[i];
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
 * @param {string} fundMode determines whether game is use any other fund mode than cash or freebet.
 * @return {boolean} the result of the check.
 */
gcm.validate.isBalances = function(balances, fundMode) {
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
  if (fundMode && 'FREESPIN' == fundMode) {
    if (typeof balances['FREESPIN'] !== 'object')
      return false;
  }
  else {
    if (typeof balances['FREESPIN'] == 'object')
      return false;
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
 * CCY code can be empty.
 *
 * @param {Object} accountInfo object.
 * @return {boolean} the result of the check.
 */
gcm.validate.isValidCurrencyOps = function(accountInfo) {

  if (!accountInfo)
    return false;

  var patternSeparator = /^[\D]$/;
  var patternCCY = /^[\D]*$/;

  return patternSeparator.test(accountInfo['ccy_thousand_separator']) &&
    patternSeparator.test(accountInfo['ccy_decimal_separator']) &&
    patternCCY.test(accountInfo['ccy_code']);
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
    return (parseFloat(value) <= 100) && !(parseFloat(value) < 0);
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
 * Checks that string is valid language
 * language can be just a 
 * @param {string} str the value to validate.
 * @return {boolean} the result of the check.
 */
gcm.validate.isValidLanguage = function(str) {
  if (typeof str != 'string')
    return false;

  var lang_array = str.split("-");
  var patternLanguage = /^[a-z]{2}$/;

  if (lang_array.length === 1)
    return patternLanguage.test(lang_array[0]);

  if (lang_array.length === 2) {
    var patternCountry = /^[A-Z]{2}$/;
    return patternLanguage.test(lang_array[0]) && patternCountry.test(lang_array[1]);
  }

  // otherwise
  return false;
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
 * Checks the string is a single digit. Useful for checking channels
 * @param {string} str the value to validate.
 * @return {boolean} the result of the check.
 */
gcm.validate.isSingleDigit = function(str) {
	  return /^[0-9]$/.test(str);
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
/**
 * @author xliu
 * Date: 17/07/12
 * */

goog.provide('gcm.gamecontrol.GameStateController');
goog.require('gcm.SingletonBase');
goog.require('gcm.validate');

/**
 * @class
 * This GameStateController is a singleton class. <br>
 * This class manages game states and coordinates state actions between game and commonUI.
 *
 * @constructor
 */
function GameStateController() {
  /** @private
   * @type {?function()}*/
  this.gameResumeCallback_ = null;

  /**
   * The life-cycle state the system is in
   * @type {GameStateController.STATE}
   * @private
   */
  this.playState_ = GameStateController.STATE.IDLE;

  /**
   * @private
   * @type {Object}
   * */
  this.commonUI_ = null;

  /**
   * @private
   * @type {NotificationHandler}
   * */
  this.notificationHandler_ = null;

  return SingletonBase.call(this);
}


/**
 * The possible life-cycle states that the system can be in:
 * COMMONUI_NOTIFY, GAME_ANIMATING and IDLE.
 * @enum {string}
 */
GameStateController.STATE = {
  COMMONUI_NOTIFY: 'COMMONUI_NOTIFY',
  GAME_ANIMATING: 'GAME_ANIMATING',
  IDLE: 'IDLE'
};

/**
 * This is called by gcmCore to initialize this controller
 * @param {Object} commonUI A reference of commonUI.
 * */
GameStateController.prototype.init = function(commonUI) {
  this.commonUI_ = commonUI;
  /**
   * @type {NotificationHandler}
   * A reference to singleton instance gcm.notification.NotificationHandler, the constructor will
   * return a reference to the singleton instance.
   * */
  this.notificationHandler_ = new NotificationHandler();
};

/**
 * The game should call gameAnimationStart when it starts it's game play
 * animation After this the commonUI is not permitted to display any content
 * until gameAnimationComplete() is invoked by the game.
 */
GameStateController.prototype.gameAnimationStart = function() {
  this.playState_ = GameStateController.STATE.GAME_ANIMATING;
  if (this.commonUI_) {
    this.commonUI_.gameAnimationStart();
  }
};

/**
 * The game should call gameAnimationComplete(resumeCallback) when the game
 * animation is complete. This will have the effect of handing over control to
 * GCM so that any pending notifications can be shown in the commonUI. Once GCM
 * has completed showing any notifications in the commonUI, the resumeCallback
 * will be called.
 * @param {Function} resumeCallback the callback function that should be
 *          called when the commonUI has completed dealing with notifications.
 */
GameStateController.prototype.gameAnimationComplete = function(resumeCallback) {

  if (!gcm.validate.isFunction(resumeCallback)) {
    throw new Error('gcm.gameAnimationComplete: Invalid callback function');
  }

  //save game resumeCallback for later use
  this.gameResumeCallback_ = resumeCallback;

  // Set game state to IDLE as animation finished
  this.playState_ = GameStateController.STATE.IDLE;

  if (this.notificationHandler_.hasPendingNotification()) {
    this.notificationHandler_.addEventListener(GCMEvent.COMPLETE, this.onNotificationHandleComplete_, this);
    this.notificationHandler_.handleNotification();
  }
  else {
    this.gameResume_();
  }
};

/**
 * This function should be used by gcm Notification Handler.
 */
GameStateController.prototype.notifyCommonUIStart = function() {
  this.playState_ = GameStateController.STATE.COMMONUI_NOTIFY;
};

/**
 * This function should be used by gcm Notification Handler.
 */
GameStateController.prototype.notifyCommonUIEnd = function() {
  this.playState_ = GameStateController.STATE.IDLE;
};

/**
 * @return {boolean} if game is in idle state.
 * */
GameStateController.prototype.isGameIdle = function() {
  return this.playState_ == GameStateController.STATE.IDLE;
};

/**
 * @private
 * This is a listener function.
 * */
GameStateController.prototype.onNotificationHandleComplete_ = function() {
  this.notificationHandler_.removeEventListener(GCMEvent.COMPLETE, this.onNotificationHandleComplete_, this);
  this.notificationHandler_.removeEventListener(GCMEvent.COMPLETE, this.gameResume_, this);
  this.gameResume_();
};

/**
 * @private
 * Whis function will be called to resume game after in game notifications.
 * */
GameStateController.prototype.gameResume_ = function() {
  if(this.gameResumeCallback_) {
      this.gameResumeCallback_();  
      this.gameResumeCallback_ = null;
  }  
  
  if (this.commonUI_) {
    // tell the commonUI that animation is complete so that it can enable
    // any UI that was disabled during game play
    // (for example the open topbar button)
    this.commonUI_.gameAnimationComplete();
  }
};
goog.provide('gcm.delegate');

/**
 * @param {Object} scope The object make that function call.
 * @param {Function} func The function need to be delegated.
 * @param {...*} var_args Rest of the params.
 * @return {Function} The generated delegate function.
 * */

gcm.delegate.create = function(scope, func, var_args) {
  var args = Array.prototype.slice.call(arguments, 2);

  //if no extra param provided return a dynamic delegate function
  //else return a static delegate function using extra param.
  return undefined === args[0] ?
    function() {
      func.apply(scope, arguments);
    }
    :
    function() {
      func.apply(scope, args);
    };
};
/**
 * @author X.Liu
 */
goog.provide('gcm.notification.NotificationHandler');

goog.require('gcm.SingletonBase');
goog.require('gcm.delegate');
goog.require('gcm.event.EventDispatcher');
goog.inherits(NotificationHandler, EventDispatcher);
/**
 * @extends EventDispatcher
 * @class
 * This is a singleton class.<br>
 * This Class is the notification function module of gcm
 * It is responsible for:
 *  - Receiving notification message from other modules in GCM
 *  - Each notification should be parsed and send to commonUI by commonUI API
 *  - Resume on critical notification, notification callback function will be invoked on resumption.
 *
 * @constructor
 */
function NotificationHandler() {
  EventDispatcher.call(this);

  /** @type {Object}
   * @private The reference to commonUI instance. passed from gcmCore
   * */
  this.commonUI_ = null;

  /** @type {boolean}
   * @private If commonUI supports V2 notifications or not. passed from gcmCore
   * */
  this.commonUIV2Compatible_ = true;

  /** @type {GameStateController}
   * @private
   * */
  this.gameStateController_ = null;

  /** @type {Array}
   * @private
   * */
  this.noteQueue_ = [];

  /** @type {GCMNotification}
   * @private The notification that waiting for user acknowledgement.
   * */
  this.outstandingNotification_ = null;

  return SingletonBase.call(this);
}

/**
 * Assign commonUI reference to notification handler.
 * @param {Object} commonUI A reference of commonUI instance.
 * @param {boolean} commonUIV2Compatible If commonUi supports V2 functionality
 * */
NotificationHandler.prototype.init = function(commonUI, commonUIV2Compatible) {
  this.commonUI_ = commonUI;  
  this.commonUIV2Compatible_ = commonUIV2Compatible;
  this.noteQueue_ = [];
  this.outstandingNotification_ = null;
  /**@type {GameStateController}
   * A reference to singleton instance gcm.GameStateController, the constructor will
   * return a reference to the singleton instance.
   * */
  this.gameStateController_ = new GameStateController();
};

/**
 * This function will be called by other modules in GCM to pass notification to commonUI.
 *
 * @param {GCMNotification=} notification (Optional) The notification object to be handled,
 *                        it contains different information depend on notification type.
 *                        This param is optional, if it's not provided Notification handler will
 *                        try to handle the next pending notification in waiting queue.
 * */
NotificationHandler.prototype.handleNotification = function(notification) {
  if (notification) {
    if (notification.isUnique())
      this.handleUniqueNotification_(notification);

    this.queueNotification_(notification);
  }

  //process the head notification in queue based on its importance level.
  if (this.commonUI_ && !this.outstandingNotification_) {
    var firstNote = this.noteQueue_.shift();
    if (firstNote) {
      // The notification will be send to CommonUI asap if its type is present in GCM Notification ASAP array element
      var isNotificationAsap = GCMNotification.ASAP.indexOf(firstNote.type);

      if (isNotificationAsap >= 0) {
        this.handleAlertNotification_(firstNote);
      } else if (firstNote.type == GCMNotification.TYPE.SESSION_TIMER) {

        var sessionDuration = firstNote.body[GCMNotification.SESSION_TIMER.DURATION];

        // 1.X commonUIs can't handle this so we are skipping it for those
        if(this.commonUIV2Compatible_) {
          this.commonUI_.handleSessionDurationUpdate(sessionDuration);
        }

        this.continueHandlePendingNotifications_();

      } else if (firstNote.type == GCMNotification.TYPE.BONUS_BAR) {

        var bonusBarPercent = firstNote.body[GCMNotification.BONUS_BAR.PERCENT];

        // 1.X commonUIs can't handle this so we are skipping it for those
        if(this.commonUIV2Compatible_) {
          this.commonUI_.handleBonusBarUpdate(bonusBarPercent);  
        }
        this.continueHandlePendingNotifications_();

      } else {
        if (this.gameStateController_.isGameIdle()) {
          this.handleAlertNotification_(firstNote);
        } else {
          this.noteQueue_.unshift(firstNote);
        }
      }
    }
  }
};

/**
 * Check whether have more pending notification in waiting queue or not.
 * @return {boolean} Treu for DO have pending notification.
 * */
NotificationHandler.prototype.hasPendingNotification = function() {
  return this.noteQueue_.length > 0;
};

/**
 * This resume function will be called by gcmCore.resume(), meaning user acknowledged the current
 * outstanding notification and process to waiting notifications.
 * Notification handler will trigger outstanding notification resumption callback function (if have
 * any), clear the oustanding notification, and then continue handle pending notification in the queue.
 *
 * @param {*=} feedback (Optional) This parameter is from commonUI as feedback of user acknowledgement to
 *              current outstanding notification, which will be passed to notification callback function.
 *              Feedback content is depend on notification type.
 * */
NotificationHandler.prototype.resume = function(feedback) {
  try
  {
    if (this.outstandingNotification_)
      this.outstandingNotification_.invokeCallback(feedback);
  }
  catch (e) {
    throw e;
  }
  //This finally block ensure outstanding notification always get cleared on resumption
  //regardless of any possible exception in callback function.
  finally {
    this.outstandingNotification_ = null;
    this.gameStateController_.notifyCommonUIEnd();
    this.continueHandlePendingNotifications_();
  }
};

/**
 * @private
 * Called when process of notification queue complete.
 * */
NotificationHandler.prototype.continueHandlePendingNotifications_ = function()
{
  if (this.hasPendingNotification())
    this.handleNotification();
  else
    this.dispatchEvent(new GCMEvent(GCMEvent.COMPLETE));
};

/**
 * @private
 * Called when process of notification queue complete.
 *
 * @param {GCMNotification} notification a notification object.
 * */
NotificationHandler.prototype.handleAlertNotification_ = function(notification)
{
  this.outstandingNotification_ = notification;

  this.gameStateController_.notifyCommonUIStart();
  var timeout = notification.body[GCMNotification.TIMEOUT];

  if (notification.type == GCMNotification.TYPE.ERROR) {
    var errorCategory = notification.body[GCMNotification.ERROR.CATEGORY];
    var errorSeverity = notification.body[GCMNotification.ERROR.SEVERITY];
    var errorCode = notification.body[GCMNotification.ERROR.CODE];
    var errorMessage = notification.body[GCMNotification.ERROR.MESSAGE];
    var errorParams = notification.body[GCMNotification.ERROR.PARAMS];
    this.commonUI_.handleError(errorCategory, errorSeverity, errorCode, errorMessage, errorParams, timeout);

  } else if (notification.type == GCMNotification.TYPE.SESSION_STATS) {
    var sessonStakes = notification.body[GCMNotification.SESSION_STATS.STAKES];
    var sessionWinnings = notification.body[GCMNotification.SESSION_STATS.WINNINGS];
    var sessionTurnover = notification.body[GCMNotification.SESSION_STATS.TURNOVER];    
    // 1.X commonUIs can't handle this so we are skipping it for those
    if(this.commonUIV2Compatible_) {
      this.commonUI_.handleSessionStats(sessonStakes, sessionWinnings, sessionTurnover, timeout);
    }

  } else if (notification.type == GCMNotification.TYPE.BONUS_BAR_FILLED) {
    // 1.X commonUIs can't handle this so we are skipping it for those
    if(this.commonUIV2Compatible_) {
      this.commonUI_.handleBonusBarFilled(timeout);
    }

  } else if (notification.type == GCMNotification.TYPE.FREEBET_REWARD) {
    var freebetAmount = notification.body[GCMNotification.FREEBET.AMOUNT];
    // 1.X commonUIs can't handle this so we are skipping it for those
    if(this.commonUIV2Compatible_) {
      this.commonUI_.handleFreebetAward(freebetAmount, timeout);  
    }

  } else {
    this.outstandingNotification_ = null;
    throw Error('NotificationHandler.handleNotification: Unknown notification type [' + notification.type + '].');
  }
};

/**
 * @private
 * Handles notification marked as unique.
 * Any unique notification in queue with the same type of passed in notification
 * will be removed from the queue.
 *
 * @param {GCMNotification} notification a notification object.
 * */
NotificationHandler.prototype.handleUniqueNotification_ = function(notification)
{
  if (!notification.isUnique())
    return;

  for (var index = 0; index < this.noteQueue_.length; ++index) {
    var currentNote = this.noteQueue_[index];
    if (currentNote.isUnique() && currentNote.type == notification.type) {
      this.noteQueue_.splice(index, 1);
      index--;
    }
  }
};

/**
 * @private
 * add notification into queue.Only ERROR notifications will be put
 * in the front of the notification queue and other notifications are added based on
 * first come first serve
 *
 * @param {GCMNotification} notification a notification object.
 * */
NotificationHandler.prototype.queueNotification_ = function(notification)
{
  if (notification.type == GCMNotification.TYPE.ERROR) {
    if (this.noteQueue_.length > 0) {
      for (var index = 0; index < this.noteQueue_.length; ++index) {
        var newNotification = this.noteQueue_[index];
        if (newNotification.type == GCMNotification.TYPE.ERROR) {
          continue;
        } else {
          break;
        }
      }
      this.noteQueue_.splice(index, 0, notification);
    } else {
      this.noteQueue_.push(notification);
    }
  } else {
       this.noteQueue_.push(notification);
  }
};
goog.provide('gcm.currencycodemap');


/**
 * The mapping of currency symbol through intl currency code.
 * The source of information is mostly from wikipedia and CLDR. Since there is
 * no authoritive source, items are judged by personal perception.
 *
 * @type {Object}
 * @const
 */

gcm.currencycodemap = {
  'AED': '\u062F\u002e\u0625',
  'ARS': '$',
  'AUD': '$',
  'BDT': '\u09F3',
  'BRL': 'R$',
  'CAD': '$',
  'CHF': 'Fr.',
  'CLP': '$',
  'CNY': '\u00a5',
  'COP': '$',
  'CRC': '\u20a1',
  'CUP': '$',
  'CZK': 'K\u010d',
  'DKK': 'kr',
  'DOP': '$',
  'EGP': '\u00a3',
  'EUR': '\u20ac',
  'GBP': '\u00a3',
  'HKD': '$',
  'HRK': 'kn',
  'HUF': 'Ft',
  'IDR': 'Rp',
  'ILS': '\u20AA',
  'INR': 'Rs',
  'IQD': '\u0639\u062F',
  'ISK': 'kr',
  'JMD': '$',
  'JPY': '\u00a5',
  'KRW': '\u20A9',
  'KWD': '\u062F\u002e\u0643',
  'LKR': 'Rs',
  'LVL': 'Ls',
  'MNT': '\u20AE',
  'MXN': '$',
  'MYR': 'RM',
  'NOK': 'kr',
  'NZD': '$',
  'PAB': 'B/.',
  'PEN': 'S/.',
  'PHP': 'P',
  'PKR': 'Rs.',
  'PLN': 'z\u0142',
  'RON': 'L',
  'RUB': '\u0440\u0443\u0431',
  'SAR': '\u0633\u002E\u0631',
  'SEK': 'kr',
  'SGD': '$',
  'SKK': 'Sk',
  'SYP': 'SYP',
  'THB': '\u0e3f',
  'TRY': 'TL',
  'TWD': 'NT$',
  'USD': '$',
  'UYU': '$',
  'VEF': 'Bs.F',
  'VND': '\u20AB',
  'XAF': 'FCFA',
  'XCD': '$',
  'YER': 'YER',
  'ZAR': 'R'
};
/**
 * @fileoverview
 * CurrencyFormat contains internal functionality for GCM.<br>
 * None of the functions are exported for public use.
 */
goog.provide('gcm.currencyformat');
goog.require('gcm.SingletonBase');
goog.require('gcm.currencycodemap');
goog.require('gcm.validate');

/**
 * @class
 * This is a singleton untility class for GCM to format currency display based on given format. <br>
 * CurrencyFormat contains internal functionality for GCM.<br>
 * None of the functions are exported for public use.
 * @constructor
 **/
function CurrencyFormat() {
  /** @const
   * @private
   * How many digits we have in fractional part of a numerical value
   * By default is 2 digits
   * */
  this.digitsOfFractional_ = 2;
  /** @const
   * @private
   * How many digits we have for a thousand separator in a numerical value
   * By default is 3 digits
   * */
  this.digitsOfThousand_ = 3;

  return SingletonBase.call(this);
}

/**
 * Initialize format specifying thousand separator, decimal separator and currency code.
 *
 * @param {string} thousandSeparator In UK style is ',' .
 * @param {string} decimalSeparator In UK style is '.' .
 * @param {string} ccyCode In UK currency is 'GBP'.
 * */
CurrencyFormat.prototype.init = function(thousandSeparator, decimalSeparator, ccyCode) {
  this.thousandSeparator = thousandSeparator;
  this.decimalSeparator = decimalSeparator;
  this.ccyCode = ccyCode;
};

/**
 * Called by commonUI for the currency formatting
 * return formatted currency object.
 *
 * @param {number} value money value to format.
 * @return {Object} ccyObj an object containing money information in the following format
 *         {display: 'Â£10.00', code:'GBP', value: 10.00 , currency_symbol: 'Â£',
 *         ccy_thousand_separator: ',', ccy_decimal_separator: '.'}.
 * */
CurrencyFormat.prototype.format = function(value)
{
  /** @const */
  var fractionalUnit = Math.pow(10, this.digitsOfFractional_);
  /** @const */
  var thousandUnit = Math.pow(10, this.digitsOfThousand_);

  if (!gcm.validate.isNumericValue(value)) {
    throw new Error('CurrencyFormat.format: value parameter is not a number');
  }

  var digitValue = parseFloat(value);

  var sign = "";
  if(digitValue < 0){
    digitValue = digitValue * -1;
    sign = "-";
  }

  var intPart = Math.floor(digitValue);
  var decimalPart = Math.round(digitValue * fractionalUnit) % fractionalUnit;

  //handle decimal part
  var decimalString = this.padZero_(decimalPart, this.digitsOfFractional_);

  //handle thousand separator
  var intStrParts = [];
  var intString = '0';
  while (intPart > 0)
  {
    var intSegment = intPart - Math.floor(intPart / thousandUnit) * thousandUnit;
    if (intPart != intSegment)
      intSegment = this.padZero_(intSegment, this.digitsOfThousand_);

    intStrParts.unshift(intSegment);
    intPart = Math.floor(intPart / thousandUnit);
  }

  if (intStrParts.length > 0)
    intString = intStrParts.join(this.thousandSeparator);

  var ccySymbol = gcm.currencycodemap[this.ccyCode];
  var currencyString = intString + this.decimalSeparator + decimalString;
  var displayString;
  if (ccySymbol)
    displayString = sign + ccySymbol + currencyString;
  else
    displayString = sign + currencyString + this.ccyCode;


  return {
    'display': displayString,
    'code': this.ccyCode,
    'value': value,
    'amount': value,
    'currency_symbol': ccySymbol,
    'ccy_thousand_separator': this.thousandSeparator,
    'ccy_decimal_separator': this.decimalSeparator
  };

};

/**
 * add zeroes to fill digit segments
 * @private
 * @param {number} value numerical value for padding.
 * @param {number} maxDigits maximum number of digits.
 * @return {string} result the padded string.
 * */
CurrencyFormat.prototype.padZero_ = function(value, maxDigits)
{
  /**@type {string}*/
  var result = String(value);

  for (var i = 1; i < maxDigits; i++)
  {
    if (value < Math.pow(10, i))
      result = '0' + result;
  }

  return result;
};
/**
 * @author X.Liu
 */
goog.provide('gcm.Account');

goog.require('gcm.currencyformat');
goog.require('gcm.validate');

/**
 * @class
 * This class is a functional module of gcm that is responsible for:
 * <ul>
 *   <li>Manage player account details</li>
 *   <li>Update commonUI to show play account detail</li>
 *   <li>Forge player display balance if game animation in progress</li>
 * </ul>
 *
 * @constructor
 */
function Account() {
  /**@type {CurrencyFormat}
   * @private
   * get instance of singleton class CurrencyFormat
   * */
  this.ccyFormater_ = new CurrencyFormat();

  /**@type {Object}
   * @private
   * */
  this.balances_ = {};

  /**@type {number}
   * @private
   * */
  this.paid_ = 0;

  /**@type {number}
   * @private
   * */
  this.stake_ = 0;

  /**@type {boolean}
   * @private
   * */
  this.accountActivated_ = false;

  /**@type {Object}
   * @private
   * */
  this.commonUI_ = null;

  /**@type {Object}
   * @private
   * */
  this.game_ = null;

  /**@type {string}
   * @private
   * */
  this.fundMode_;

}

/**
 * The possible balance types supported:
 * CASH, FREEBET and FREESPIN.
 * @enum {string}
 */
Account.BalanceTypes = {
  CASH: 'CASH',
  FREEBET: 'FREEBET',
  FREESPIN: 'FREESPIN'
};

/**
 * @param {Object} commonUI The commonUI object passed from GCM.
 *                 Account class will use this object to update commonUI account Display.
 * */
Account.prototype.setCommonUI = function(commonUI) {
  this.commonUI_ = commonUI;

  // if gcm has already received game state from the game, then
  // we should send these to the commonUI immediately
  if (this.accountActivated_)
  {
    this.showCurrentBalance();
    this.stakeUpdate(this.stake_);
    this.paidUpdate(this.paid_);
  }
};

/**
 * @param {Object} game The game object passed from GCM.
 *                 Account class will use this object to update game when the commonUI changes the balance.
 * */
Account.prototype.setGame = function(game) {
  this.game_ = game;
};

/**
 * @param {string} fundMode This param is set when a game is played using a fund mode other than cash or freebet.
 *                 Account class will use this object to determine the fund mode used for game play.
 * */
Account.prototype.setFundMode = function(fundMode) {
  this.fundMode_ = fundMode;
};

/**
 * This function is called by game at start-up phase, to set initial balance.
 * @param {Object} balances
 *            An map of balances in this format:
 *    <pre>
 *    {
 *        'CASH': {amount: '1000.00'},
 *        'FREEBET': {amount: '2000.00'},
 *        'FREESPIN': {amount: '100.00', count: 5}
 *    }
 *    </pre>.
 * @return {Object} formattedBalances a balances object containing ccy format objects
 *        for each balance type:
 *    <pre>
 *    {
 *        'CASH': {display: 'Â£10.00', code:'GBP', value: 10.00 ,
 *                 currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.'},
 *        'FREEBET': {display: 'Â£10.00', code:'GBP', value: 10.00 ,
 *                 currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.'},
 *        'FREESPIN': {display: 'Â£100.00', code:'GBP', value: 100.00 ,
 *                 currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.', count: 5}
 *    }
 *    </pre>.
 **/
Account.prototype.accountInit = function(balances) {
  //mark account object as activated
  this.accountActivated_ = true;

  //update balances and return formatted balances
  return this.balancesUpdate(balances);
};


/**
 * The game should call this function with a balanceFudge parameter when it
 * wants to hide the winnings, then when the winnings have been revealed
 * in the game, game should call it again without the balanceFudge parameter
 * to display the actual balance.
 *
 * The commonUI is also able to call this function in order to update the balance
 * after a quick deposit.  The commonUI should use the calledFromCommonUI parameter
 * to show that this has happened, and so that GCM will call through to the game with
 * the update balance information.
 *
 * @param {Object} balances A map of balances with following format:  <br>
 * <code>
 *            {
 *                'CASH': {amount: 1000.00},
 *                'FREEBET': {amount: 2000.00},
 *                'FREESPIN': {amount: '100.00', count: 5}
 *            }
 * </code>
 * For a game, the data should be taken
 * from Game Server response.  Note that there are utility functions available on GCM to convert from
 * FOG and RGI XML format for account and balance and convert to the required format for this method.
 *
 * Note that when called by a commonUI, the commonUI may want to update only the cash amount (it may not
 * have visibility of the freebet and other balance amounts).  The commonUI can pass a balances object to
 * this function, which only includes the 'CASH' amount - this is allowed, and in this case GCM will keep the
 * 'FREEBET' and other balance type amounts at their previous level - only the cash balance will be updated.
 *
 * @param {number=} balanceFudge (Optional) the numeric amount to decrement the displayed
 *          balance by until the game play is complete. This will usually be the
 *          game winnings, which have not yet been shown to the player in the
 *          game animation.<br>
 *          If this parameter is not provided, gcm will display the actual balance.
 * @param {boolean=} changedFromCommonUI (Optional) this should be set to true when this function is called
 * by the commonUI.
 * @return {Object} formattedBalances a balances object containing ccy format objects
 *        for each balance type:
 *            {
 *                'CASH': {display: 'Â£10.00', code:'GBP', value: 10.00 ,
 *              currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.'},
 *                'FREEBET': {display: 'Â£10.00', code:'GBP', value: 10.00 ,
 *              currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.'},
 *                'FREESPIN': {display: 'Â£100.00', code:'GBP', value: 100.00 ,
 *              currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.', count: 5}
 *            }.
 */
Account.prototype.balancesUpdate = function(balances, balanceFudge, changedFromCommonUI) {
  if (!gcm.validate.isBalances(balances, this.fundMode_)) {
    throw new Error('gcm.balancesUpdate: Invalid balances format');
  }

  if (!balanceFudge) {
    balanceFudge = 0;
  }

  //copy balances
  var type;
  //don't clear the balances - we want to maintain any balance types
  //which are not included in the balances parameter, so that the commonUI
  //is able to just update the cash amount
  for (type in balances) {
    this.balances_[type] = {};
    this.balances_[type]['amount'] = balances[type]['amount'];
  }

  //copy to fudgedBalances (note that we copy the balances_ not the balances, so
  //that we are including any persisted freebet balance etc.)
  var fudgedBalances = {};
  for (type in this.balances_) {
    fudgedBalances[type] = {};
    fudgedBalances[type]['amount'] = this.balances_[type]['amount'];
  }
  //deduct balanceFudge from CASH balance
  fudgedBalances[Account.BalanceTypes.CASH]['amount'] = +
  this.balances_[Account.BalanceTypes.CASH]['amount'] - balanceFudge;

  var formattedBalances = {};
  //format each balance
  for (type in fudgedBalances) {
    formattedBalances[type] = {};
    formattedBalances[type] = this.ccyFormater_.format(fudgedBalances[type]['amount']);
  }

  if (this.fundMode_ && 'FREESPIN' == this.fundMode_) {
    this.balances_[Account.BalanceTypes.FREESPIN]['count'] = balances['FREESPIN']['count'];
    formattedBalances[Account.BalanceTypes.FREESPIN]['count'] = this.balances_['FREESPIN']['count'];
  }

  if (this.commonUI_) {
    this.commonUI_.balancesUpdate(formattedBalances);
  }
  if (goog.isBoolean(changedFromCommonUI) &&
      changedFromCommonUI &&
      this.game_) {
    //make a copy of balances to pass onto game
    var balancesCopy = {};
    for (type in this.balances_) {
      balancesCopy[type] = {};
      balancesCopy[type]['amount'] = this.balances_[type]['amount'];
    }
    if (this.fundMode_ && 'FREESPIN' == this.fundMode_) {
      balancesCopy[Account.BalanceTypes.FREESPIN]['count'] = this.balances_['FREESPIN']['count'];
    }
    this.game_.balancesHasChanged(balancesCopy);
  }
  return formattedBalances;
};

/**
 * This function displays the real current balance store in this account Object.
 * This is used when game animation finishes the commonUI need to be updated with
 * the proper user balances.
 *
 * @param {boolean=} calledFromGCM (Optional) this should be set to true when this function is called
 * by the GCM so that both game and commonUI are notified.
 * */
Account.prototype.showCurrentBalance = function(calledFromGCM) {
  if (this.commonUI_) {
    var formattedBalances = {};
    //format each balance
    for (var type in this.balances_) {
      formattedBalances[type] = {};
      formattedBalances[type] = this.ccyFormater_.format(this.balances_[type]['amount']);
    }
    this.commonUI_.balancesUpdate(formattedBalances);
  }
  if (goog.isBoolean(calledFromGCM) && calledFromGCM && this.game_)
    this.game_.balancesHasChanged(formattedBalances);
};

/**
 * The game must call this each time paid changes, even though not all commonUI
 * implementations will choose to display paid in the commonUI.
 * @param {number} paid numeric value.
 * @return {Object} the ccy format object of the paid value in the format:
 *        {display: 'Â£10.00', code:'GBP', value: 10.00 , currency_symbol: 'Â£',
 *        ccy_thousand_separator: ',', ccy_decimal_separator: '.'}.
 */
Account.prototype.paidUpdate = function(paid) {
  //we need to check if accountInit has been called, and throw an exception
  //if not. It is not permitted to use this API until accountInit has been called

  if(!paid){
    paid = 0.00;    
  }

  if (!this.accountActivated_)
  {
    throw new Error('gcm.paidUpdate: account is not activated. Update cancelled');
  }

  if (!gcm.validate.isNumericValue(paid)) {
    throw new Error('gcm.paidUpdate: Invalid paid value:' + paid);
  }

  this.paid_ = paid;
  var formatedValue = this.ccyFormater_.format(this.paid_);
  if (this.commonUI_) {
    this.commonUI_.paidUpdate(formatedValue);
  }

  return formatedValue;
};

/**
 * The game must call this each time the stake changes, even though not all
 * commonUI implementations will choose to display stake in the commonUI.
 * @param {number} stake numeric value.
 * @return {Object} the ccy format object of the stake value in the format:
 *        {display: 'Â£10.00', code:'GBP', value: 10.00 , currency_symbol: 'Â£',
 *        ccy_thousand_separator: ',', ccy_decimal_separator: '.'}.
 */
Account.prototype.stakeUpdate = function(stake) {
  //we need to check if accountInit has been called, and throw an exception
  //if not. It is not permitted to use this API until accountInit has been called
  
  if(!stake){
    stake = 0.00;   
  }

  if (!this.accountActivated_)
  {
    throw new Error('gcm.paidUpdate: account is not activated. Update cancelled');
  }

  if (!gcm.validate.isNumericValue(stake)) {
    throw new Error('gcm.stakeUpdate: Invalid stake value:' + stake);
  }

  this.stake_ = stake;
  var formatedValue = this.ccyFormater_.format(this.stake_);

  if (this.commonUI_) {
    this.commonUI_.stakeUpdate(formatedValue);
  }

  return formatedValue;
};

/**
 * Called by gcm when a freebet is awarded. The updated freebet balance will be sent to
 * commonui and the updated balance will be sent to game.
 *
 * @param {number} freebet The freebet balance.
 */
Account.prototype.freebetUpdate = function(freebet) {
  // we need to check if accountInit has been called, and silently return
  // if not (Takes care of bonus push init scenario where account will not be initiated and
  // the commonui and game need not be notified of the freebet balance.
  if (this.accountActivated_)
  {
    if (!gcm.validate.isNumericValue(freebet)) {
      throw new Error('gcm.freebetUpdate: Invalid freebet value:' + freebet);
    }

    this.balances_[Account.BalanceTypes.FREEBET]['amount'] = freebet;
    this.showCurrentBalance(true);
  }
};

/**
 * Called by gcm to check whether the freespins round has finished/not.
 *
 * @return {boolean} returns true if freespin round has finished, false otherwise.
 **/
Account.prototype.checkFreespinFinished = function() {
  if (this.balances_[Account.BalanceTypes.FREESPIN])
  {
    if (this.balances_[Account.BalanceTypes.FREESPIN]['count'] == 0) {
      return true;
    }
  }
  return false;
};
/**
 *
 * @author xliu
 * Date: 30/04/13
 */
goog.provide('gcm.notification.model.GCMNotification');

/**
 * @class The base class of notification data model.
 * @constructor
 *
 * @param {string} type The type of a notification, should be from the enum list
 *                      GCMNotification.TYPE defined in GCMNotification class.
 * @param {Object} body The body of a notification with its content depending on
 *                      The type of a notification.
 * @param {Function=} callback (optional) The callback function a notification. This is
 *                      optional and only applies if notification expects resumption.
 */
function GCMNotification(type, body, callback) {
  this.type = type;
  this.body = body;

  /** @private
   * @type {Function|undefined}
   * The callback function a notification. This is optional
   * and only applies if notification expects resumption.*/
  this.callback_ = callback;

  /** @private
   * @type {boolean}*/
  this.isUnique_ = false;
}

/**
 * enumerate of notification types
 * @enum {string}
 * */
GCMNotification.TYPE = {
  ERROR: 'ERROR',
  SESSION_TIMER: 'SESSION_TIMER',
  SESSION_STATS: 'SESSION_STATS',
  BONUS_BAR: 'BONUS_BAR',
  BONUS_BAR_FILLED: 'BONUS_BAR_FILLED',
  FREEBET_REWARD: 'FREEBET_REWARD'
};

/**
 * Enumeration of parameters within body of error notification.
 * Critical notification. Should be displayed straight away regardless of game state,
 * then wait for CommonUI callback, meanwhile queueing all other pending notifications.
 */
GCMNotification.ERROR = {
        CATEGORY: 'errorCategory',
        SEVERITY: 'errorSeverity',
        CODE: 'errorCode',
        MESSAGE: 'errorMessage',
        PARAMS: 'errorParams'
};

/**
 * Enumeration of parameters within body of session stats notification.
 * Session Stats information: Important notification. Should be displayed as soon as game is idle state,
 * then wait forCommonUI callback, meanwhile queueing all other pending notifications.
 */
GCMNotification.SESSION_STATS = {
        STAKES: 'stakes',
        WINNINGS: 'winnings',
        TURNOVER: 'turnover'
};

/**
 * Enumeration of parameters within body of session timer notification.
 * Session Timer information: Normal notification. Pushed to CommonUI immediately and no need to wait for confirmation.
 */
GCMNotification.SESSION_TIMER = {
        DURATION: 'duration'
};

/**
 * Enumeration of parameters within body of bonus bar notification.
 * Bonus Bar percentage change: Normal notification.
 * Pushed to CommonUI immediately and no need to wait for confirmation.
 */
GCMNotification.BONUS_BAR = {
        PERCENT: 'percent'
};

/**
 * Enumeration of parameters within body of freebet  notification.
 * Freebet reward message: Important notification. Should be displayed as soon as game is idle state,
 * then wait forCommonUI callback, meanwhile queueing all other pending notifications.
 */
GCMNotification.FREEBET = {
        AMOUNT: 'freebet'
};

/**
 * Any of the critical/important notification types detailed here
 * can have an optional timeout field in the notification body.
 * If the user does not acknoledge within this time, the notification will be cleared.
 */
GCMNotification.TIMEOUT = 'timeout';

/** @type {Array}
 * array of asap notifications types
 * */
GCMNotification.ASAP = [
  GCMNotification.TYPE.ERROR
  ];

/** @type {Array}
 * array of acknowledgement required notification types
 * */
GCMNotification.ACK = [
  GCMNotification.TYPE.ERROR,
  GCMNotification.TYPE.SESSION_TIMER,
  GCMNotification.TYPE.SESSION_STATS,
  GCMNotification.TYPE.BONUS_BAR,
  GCMNotification.TYPE.BONUS_BAR_FILLED,
  GCMNotification.TYPE.FREEBET_REWARD
  ];
/**
 * Returns the unique state of this notification. A unique notification can only have once instance in
 * a notification queue.
 * @return {boolean} the unique state of this notification.
 * */
GCMNotification.prototype.isUnique = function() {
  return this.isUnique_;
};

/**
 * Invokes the callback function of notification, which should be done at
 * resumption of outstanding notification.
 * @param {*=} param The feedback parameter of notification. Its content depends
 *              on the notification specific. Which should be defined in notification
 *              data model.
 * */
GCMNotification.prototype.invokeCallback = function(param) {
  if (this.callback_)
    this.callback_.call(null, param);
};

/**
 * For notifications that should only have one unique instance in queue of a same type.
 * The newer instance of a unique notification will replace the old one in queue, but
 * not take the old notifications position in queue.
 * */
GCMNotification.prototype.markAsUnique = function() {
  this.isUnique_ = true;
};
/**
 * @author cramacha
 * Date: 30/07/13
 */
goog.provide('gcm.notification.model.FreebetNotification');
goog.require('gcm.notification.model.GCMNotification');
goog.inherits(FreebetNotification, GCMNotification);
/**
 * @class
 *
 * @extends GCMNotification
 *
 * @constructor
 * @param {number} custTokenId The customer token id.
 * @param {Object} data The notification data.
 * @param {Function} callback The callback function to be invoked after acknowledging the token.
 */
function FreebetNotification(custTokenId, data, callback) {
  this.custTokenId_ = custTokenId;
  GCMNotification.call(this, GCMNotification.TYPE.FREEBET_REWARD, data, callback);
}

/**
 * @override
 */
FreebetNotification.prototype.invokeCallback = function(param) {
  if (this.callback_)
    this.callback_.call(null, this.custTokenId_, param);
};
/**
 * @author cramacha
 * Date: 29/07/13
 */
goog.provide('gcm.Promotions');
goog.require('gcm.Account');
goog.require('gcm.SingletonBase');
goog.require('gcm.currencyformat');
goog.require('gcm.notification.model.FreebetNotification');
goog.require('goog.json');

/**
 * This class is managed by gcm and aim to handle promotions.
 *
 * @param {!string} webServiceUrlBase The base url for gcm web service, e.g. /gcm-ws".
 * @param {!string}  gameName The game name.
 * @param {Account}  account The account object for communicating with commonUI and game.
 * @constructor
 */
function Promotions(webServiceUrlBase, gameName, account) {
  this.promotionsWSUrlBase_ = webServiceUrlBase;
  this.gameName_ = gameName;
  this.account_ = account;
  this.formatter_ = new CurrencyFormat();
  this.notificationHandler_ = new NotificationHandler();
  return SingletonBase.call(this);
}

/**
 * @const The relative URL of freebets web service.
 */
Promotions.FREEBETS_URL = '/freebets/';

/**
 * @const The timeout for bpush alerts
 */
Promotions.TIMEOUT = 30;

/**
 * The game name.
 *
 * @return {string} The game name.
 */
Promotions.prototype.gameName = function() {
  return this.gameName_;
};

/**
 * Request freebet balance from gcm-ws.
 *
 * @private
 */
Promotions.prototype.updateFreebetBalance_ = function() {
  gcm.net.ws.getJsonResponse(this.promotionsWSUrlBase_ + Promotions.FREEBETS_URL + this.gameName_ + '.json', this,
    this.freebetBalanceResponseHandler_);
};

/**
 * Activate freebet token via gcm-ws.
 *
 * @param {number} custTokenId The customer token id.
 * @private
 */
Promotions.prototype.activateFreebetToken_ = function(custTokenId) {
  var postData = {'Action': 'activate', 'CustTokenId': custTokenId};
  gcm.net.ws.postJsonRequest(this.promotionsWSUrlBase_ + Promotions.FREEBETS_URL + this.gameName_ + '.json',
    goog.json.serialize(postData), this, this.freebetBalanceResponseHandler_);
};

/**
 * Parse the freebet balance response from gcm-ws.
 *
 * @param {!Object} jsonResponse The response in JSON format.
 * @private
 */
Promotions.prototype.freebetBalanceResponseHandler_ = function(jsonResponse) {
  this.account_.freebetUpdate(jsonResponse['Balance']);
};

/**
 * Handles bbar notifications. A bbar update notification is sent.
 * A fill notification is also sent before update if win is set to true.
 *
 * @param {number}  percent The percentage filled.
 * @param {boolean} win Has bbar been filled.
 */
Promotions.prototype.sendBBARNotification = function(percent, win) {
  if (!percent || isNaN(percent) || !goog.isBoolean(win))
    throw Error('com.openbet.gcm.Promotions.sendBBARNotification: invalid bonus bar notification');
  // Handle BBAR fill notification
  if (win) {
    var bBarFillNotification = new GCMNotification(GCMNotification.TYPE.BONUS_BAR_FILLED,
        {'timeout' : Promotions.TIMEOUT});
    bBarFillNotification.markAsUnique();
    this.notificationHandler_.handleNotification(bBarFillNotification);
  }
  // Handle BBAR update notification
  var bBarUpdNotification = new GCMNotification(GCMNotification.TYPE.BONUS_BAR,
      {'percent' : percent});
  bBarUpdNotification.markAsUnique();
  this.notificationHandler_.handleNotification(bBarUpdNotification);
};

/**
 * Handles freebet notifications.
 *
 * @param {number}  custTokenId The customer token id.
 * @param {number}  amount The freebet amount won.
 * @param {boolean} autoActivate Is the token to be auto activated or does it require acknowledgement?
 */
Promotions.prototype.sendFreebetNotification = function(custTokenId, amount, autoActivate) {
  if (!custTokenId || isNaN(custTokenId) || !amount || isNaN(amount) || !autoActivate ||
    (autoActivate != 'Y' && autoActivate != 'N'))
    throw Error('com.openbet.gcm.Promotions.sendFreebetNotification: invalid freebet notification');
  //Handle freebet notification
  var freeBetNotification;
  if (autoActivate == 'Y')
    freeBetNotification = new FreebetNotification(custTokenId,
       {'freebet' : this.formatter_.format(amount).display, 'timeout': Promotions.TIMEOUT},
       gcm.delegate.create(this, this.updateFreebetBalance_));
  else
    freeBetNotification = new FreebetNotification(custTokenId,
       {'freebet' : this.formatter_.format(amount).display}, gcm.delegate.create(this, this.activateFreebetToken_));
  this.notificationHandler_.handleNotification(freeBetNotification);
};

/**
 * Adds event listener to notification handler.
 *
 * @param {Function}  callback The callback function to add to event listener list.
 * @param {Object} scope The caller of event listener function.
 */
Promotions.prototype.listenToNotificationHandler = function(callback, scope) {
  this.notificationHandler_.addEventListener(GCMEvent.COMPLETE, callback, scope);
};

/**
 * Removes event listener from notification handler.
 *
 * @param {Function}  callback The callback function to remove from event listener list.
 * @param {Object} scope The caller of event listener function.
 */
Promotions.prototype.unlistenToNotificationHandler = function(callback, scope) {
  this.notificationHandler_.removeEventListener(GCMEvent.COMPLETE, callback, scope);
};
/**
 * @fileoverview
 * This class handles the Games Menu for GCM which is loaded from gcm Games Menu List webservice.
 *
 * @author jpaisley
 * Date: 28/11/12
 * Time: 13:56
 */

goog.provide('gcm.gamelist.GameList');
goog.require('gcm.net.ws');

/**
 * This class manage by gcm and aims to get games menu from web service.
 *
 * @param {string} lang the string identifying the required language.
 * @param {Function} GameListCallback Function called when menu is received from web service.
 * @param {string} webServiceUrlBase the base url for the games menu web service, e.g. /gcm-ws/GameList.
 * @param {string=} listName the string identifying the required menu list.
 * @constructor
 */
function GameList(lang, GameListCallback, webServiceUrlBase, listName)
{
  this.listName_ = listName;
  this.lang_ = lang;
  this.GameListCallback_ = GameListCallback;
  this.webServiceUrlBase_ = webServiceUrlBase;
  this.ready_ = false;
}

/**
 * This is called by gcmCore to retrieve the games
 * list for a specified menu and language
 */
GameList.prototype.init = function() {
  this.getGameListFromWs_();
};

/**
 * Flag to indicate whether game
 * list function is available
 *
 * @private
 */
GameList.enabled_ = false;

/**
 * Called by gcmCore to enable/disable
 * the game list functionality depending
 * on configuration settings
 *
 * @param {boolean} enabled Whether to the gamelist is configured to be enabled.
 * */
GameList.setEnabled = function(enabled) {
  GameList.enabled_ = enabled;
};

/**
 * Check whether the game list has been configured to be enabled.
 * Defaults to false if gcmConfigReady has not occured yet.
 * @return {boolean} Whether game list is enabled or not.
 */
GameList.isEnabled = function() {
  return GameList.enabled_;
};

/**
 * Makes a call to the GCM web service
 * Retrieves the list of games for the list name
 * and language provided in the constructor if any.
 *
 * Returns a JSON response
 *
 * @private
 */
GameList.prototype.getGameListFromWs_ = function() {
  //TODO remove this file type suffix - this is currently needed for
  //testing on dummy xml files aliased into apache on localhost
  var url;

  if (goog.isDef(this.listName_)) {
    url = this.webServiceUrlBase_ + '/gamelist/' + this.listName_ + '?lang=' + this.lang_;
  } else {
    url = this.webServiceUrlBase_ + '/gamelist' + '?lang=' + this.lang_;
  }

  gcm.net.ws.getJsonResponse(url, this, this.GameListResponseHandler_);
};

/**
 * Handle returning JSON response from web service
 * @private
 * @param {Object|undefined} jsonResponse The response in JSON format.
 * */
GameList.prototype.GameListResponseHandler_ = function(jsonResponse)
{
 //TODO add in a JSON validate method.
  try {
    this.ready_ = true;
  } catch (e) {
    throw new Error('com.openbet.gcm.config.GameList.GameListResponseHandler_: validation of GameList JSON failed');
  }

  this.GameListCallback_(jsonResponse);
};
/**
 * @fileoverview Error functions.
 * @author asugar
 */
goog.provide('gcm.errormap');

/**
 * enumerate of error category
 **/
gcm.errormap.errorCategory = {
  CRITICAL: 'CRITICAL',
  LOGIN_ERROR: 'LOGIN_ERROR',
  RECOVERABLE_ERROR: 'RECOVERABLE_ERROR',
  NON_RECOVERABLE_ERROR: 'NON_RECOVERABLE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  MULTI_CHOICE_DIALOG: 'MULTI_CHOICE_DIALOG',
  OTHER_GAME_IN_PROGRESS: 'OTHER_GAME_IN_PROGRESS',
  REALITY_CHECK: 'REALITY_CHECK'
};

/**
 * enumerate of error severity
 **/
gcm.errormap.errorSeverity = {
  WARNING: 'WARNING',
  INFO: 'INFO',
  ERROR: 'ERROR'
};

/**
 * enumerate of error codes
 * error code mapping for fog server errors.
 **/
gcm.errormap.fogerrorCode = {
  ERR_NO_LOGIN_COOKIE: 'igf.servlet.Servlet.ERR_NO_LOGIN_COOKIE',
  REGION_BLOCKED: 'igf.servlet.Sevlet.REGION_BLOCKED',
  GUEST_CUTOFF_MSG: 'igf.db.customer.Customer.GUEST_CUTOFF_MSG',
  LOCKED_ACCOUNT: 'igf.db.customer.Customer.LOCKED_ACCOUNT',
  FAILED_TO_FIND_GAME_DETAILS: 'igf.games.db.GameDetail.FAILED_TO_FIND_GAME_DETAILS',
  REQ_GAME_NOT_FREE_PLAY: 'igf.games.db.GameDetail.REQ_GAME_NOT_FREE_PLAY',
  STAKE_LOWER_THAN_ALLOW_MIN: 'igf.games.Game.STAKE_LOWER_THAN_ALLOW_MIN',
  STAKE_HIGHER_THAN_ALLOW_MAX: 'igf.games.Game.STAKE_HIGHER_THAN_ALLOW_MAX',
  CANNOT_CLOSE_GAME_IN_PROGRESS: 'igf.games.bet.multibet.MultiBet.CANNOT_CLOSE_GAME_IN_PROGRESS',
  JACKPOT_CHANGED_DUE_TO_WIN: 'igf.db.progressive.Progressive.JACKPOT_CHANGED_DUE_TO_WIN',
  NUM_JACKPOTS_CHANGED: 'igf.db.progressive.Progressive.NUM_JACKPOTS_CHANGED',
  MAX_WINNINGS_EXCEEDED: 'igf.games.Game.MAX_WINNINGS_EXCEEDED',
  INSUFFICIENT_FUNDS_P1: 'igf.games.Game.INSUFFICIENT_FUNDS_P1',
  INSUFFICIENT_FUNDS_FREEPLAY: 'igf.games.Game.INSUFFICIENT_FUNDS_FREEPLAY',
  DECRYPT_LOGIN_COOKIE_FAILED_P1: 'igf.db.customer.Customer.DECRYPT_LOGIN_COOKIE_FAILED_P1',
  WARN_CUM_PLAY_COUNT_P1: 'igf.db.customer.PlayerProtection.WARN_CUM_PLAY_COUNT_P1',
  REACHED_MAX_WINNINGS_P2: 'igf.db.customer.Customer.REACHED_MAX_WINNINGS_P2',
  ERR_SPLITTING_FRONT_HAND_BETTER: 'igf.games.games.paigowpoker.action.SplitAction.ERR_SPLITTING_FRONT_HAND_BETTER',
  REALITY_CHECK: 'igf.games.realityCheck.RC_SESSION_EXPIRED'
};

/**
 * enumerate of error codes
 * error code mapping for rgi server errors.
 **/
gcm.errormap.rgierrorCode = {
  INSUFFICIENT_FUNDS: 'ERR:CUST:IGF:INSUFFICIENT_FUNDS',
  FAILED_DB_GET_FREESPIN_TOKEN: 'igf.games.FundMode.FAILED_DB_GET_FREESPIN_TOKEN',
  FREESPIN_TOKEN_EXPIRED: 'igf.games.FundMode.FREESPIN_TOKEN_EXPIRED',
  FREESPIN_TOKEN_NOT_ACTIVE: 'igf.games.FundMode.FREESPIN_TOKEN_NOT_ACTIVE',
  DETAILS_NOT_PRESENT_P1: 'igf.servlet.XMLRequest.DETAILS_NOT_PRESENT_P1',
  WRONG_FREESPIN_STAKE_PER_LINE: 'igf.games.FundMode.WRONG_FREESPIN_STAKE_PER_LINE',
  WRONG_FREESPIN_NUM_LINES: 'igf.games.FundMode.WRONG_FREESPIN_NUM_LINES',
  WRONG_FREESPIN_STAKE_AMOUNT: 'igf.games.FundMode.WRONG_FREESPIN_STAKE_AMOUNT',
  FREESPIN_TOKEN_REDEEMED: 'igf.games.FundMode.FREESPIN_TOKEN_REDEEMED',
  WARN_SESSION_ACK_DUE_P1: 'igf.db.customer.Session.WARN_SESSION_ACK_DUE_P1'
};

/**
 * enumerate of error codes
 * error code mapping for gcm webservice errors.
 **/
gcm.errormap.gcmserviceerrorCode = {
  ERR_NO_LOGIN_COOKIE: 'OB_SF_AUTHENTICATION_ERROR',
  WS_ABORT: 'goog.net.ErrorCode.ABORT',
  WS_ACCESS_DENIED: 'goog.net.ErrorCode.ACCESS_DENIED',
  WS_FS_SUMMARY_DATA_NOT_FOUND: 'FREESPIN_SUMMARY_DATA_NOT_FOUND',
  WS_FS_TOKEN_NOT_FOUND: 'FREESPIN_TOKEN_NOT_FOUND',
  WS_HTTP_ERROR: 'goog.net.ErrorCode.HTTP_ERROR',
  WS_TIMEOUT: 'goog.net.ErrorCode.TIMEOUT'
};
/**
 * GameActivityLogger implementation, managed by GCM. Logger supports 3 types of
 * logging:
 * 1) Registering event handlers to be fired on click events of game DOM elements.
 * 2) Mouse click x & y co-ordinates as a percentage relative to game window.
 * 3) Direct logger interaction from game code.
 *
 * @author mparker
 * @namespace
 */

goog.provide('gcm.activitylog.GameActivityLogger');

goog.require('goog.events');

/**
 * @class This class is managed by gcm and handles user defined actions as well
 *        as mouse clicks.
 *
 * @constructor
 */
function GameActivityLogger(desktop)
{
  this.gameLog_ = null;
  this.config_ = {};
  this.mouseDownXPercent_ = null;
  this.mouseDownYPercent_ = null;
  this.desktop = desktop;


}

/**
 * Initialise the heatmap functionality of the logger.
 *
 * @param {Object}
 *            gameLog instance of GCMGameLog.
 */
GameActivityLogger.prototype.run = function(gameLog)
{
  if(this.desktop) {
    this.gameWindow = window.frames["gameIFrame"];
  } else{
    this.gameWindow = window['parent'];
  }
  this.gameWidth_ = this.gameWindow['innerWidth']; 
  this.gameHeight_ = this.gameWindow['innerHeight'];

  this.MAX_JSON_LENGTH = 1000;
  this.gameLog_ = gameLog;
  this.config_ = this.gameLog_.getConfig();
  // Mouse click Only enable if clickEnabled is set to true.
  if (this.config_['clickEnabled'])
  {
    goog.events.listen(this.gameWindow, 'mousedown', gcm.delegate.create(this, this.mouseDown_));
    goog.events.listen(this.gameWindow, 'mouseup', gcm.delegate.create(this, this.mouseClick_));
    goog.events.listen(document, 'mousedown', gcm.delegate.create(this, this.mouseDown_));
    goog.events.listen(document, 'mouseup', gcm.delegate.create(this, this.mouseClick_));
  }
};

/**
 * This function will be called by gcm (which gets called by the game).
 *
 * @param {Element|string} element for the log event to be bound to; either a element
 *            reference or an element id string.
 * @param {string} eventType the type of event to be bound.
 * @param {Function|Object} data the data to be logged, or the callback function that
 * will be run when this event is fired. This function should query any data needed on
 * the page at the time of the event, and return it as an object of name/value pairs.
 * If the function determines that the event should not be fired, it should return
 * false.
 *
 * Accepted values for the return type of the callback function are object, and false.
 * Undefined and null values will be treated as an error, so the caller of this function
 * should ensure that if the data is not available then the callback should return an empty
 * object. The callback functions will be executed when setUpLogging is called, to validate
 * the return type, so the appropriate checks should be made to make sure no errors are thrown
 * in the console when the game is loaded.
 *
 * Also note that there is a max size for the data to be logged. The data passed to setUpLogging,
 * or returned by the callback function passed to setUpLogging, must be no more than 1000 characters.
 *
 * For examples please see the example game.
 */
GameActivityLogger.prototype.setUpLogging = function(element, eventType, data)
{
  if (this.config_['actionEnabled'])
  {
    if (typeof eventType !== 'string')
      throw new Error('Event type must be a string.');

    var obj = this.getElement_(element);

    this.validateDataType_(data);

    var me = this;

    // register the click handler
    goog.events.listen(obj, 'click', function()
    {
      var logData = {};
      if (data)
      {
        if (typeof data === 'function')
        {
          logData = data(); //run the callback function to get the data
          if (logData === false) //if the function returns false, do not log the event
            return;
          else if (!logData) // if the function does not return a value (e.g. if there is an
            //if condition that returns false under certain circumstances, but no object data passed
            // under the opposite circumstance, then the function would not return anything
            logData = {};
        } else if (typeof data === 'object')
          logData = data;
      }
      me.validateDataLength_(logData);
      me.logEvent(eventType, logData);
    });
  }

};

/**
 * Get the element from the DOM.
 *
 * @param {Object|Function} data the data to be logged or callback function to be run when the event is fired.
 *
 * @private
 */
GameActivityLogger.prototype.validateDataType_ = function(data)
{
  //check third argument is correct type (an object, or a function that returns and object or false)
  //we perform these checks during set up logging, not as part of the event handler, so that all errors
  //can be seen immediately
  if (data && typeof data !== 'function' && typeof data !== 'object')
    throw new Error('Third argument must be an object or a function that returns either an object or false.');
  else if (data && typeof data === 'function') {
    var result = data.call(this);
    if (result && result !== false && typeof result !== 'object')
      throw new Error('Return value of callback function must be an object.');
  }
};

/**
 * Get the element from the DOM.
 *
 * @param {Element|string} element the element reference or id of the element.
 *
 * @return {Element} the element reference.
 *
 * @private
 */
GameActivityLogger.prototype.getElement_ = function(element)
{
  var obj;
  if (typeof element === 'object')
    obj = element;
  else if (typeof element === 'string')
  {
    // try to get element from game
    obj = this.gameWindow.document.getElementById(element);
    if (!obj) // get element from commonui
      obj = document.getElementById(element);
    if (!obj) // if object length still 0, element doesn't exist
      throw new Error('First argument (' + element + ') refers to an element that does not exist.');
  } else
    throw new Error('First argument must be an element reference or ID of an element.');

  return obj;
};

/**
 * Validate that a data object is less than MAX_JSON_LENGTH when stringified.
 * MAX_JSON_LENGTH is currently set to 1000.
 *
 * @param {Object} data the data object to be validated.
 *
 * @private
 */
GameActivityLogger.prototype.validateDataLength_ = function(data)
{
  var dataString = window['JSON'].stringify(data);
  if (dataString.length > this.MAX_JSON_LENGTH)
    throw new Error('Data too long, max ' + this.MAX_JSON_LENGTH +
        ' characters, was ' + dataString.length + ': ' + dataString);
};

/**
 * Event fired when mouse is pressed. Records the percentage of the x and y co-ordinates
 * relative to the game window.
 *
 * @param {Object} e the google closure BrowserEvent that is fired when the mouse is pressed.
 *
 * @private
 */
GameActivityLogger.prototype.mouseDown_ = function(e)
{
  var event = e['event_'];
  var x = event.touches ? event.touches[0].pageX : event.pageX;
  var y = event.touches ? event.touches[0].pageY : event.pageY;

  this.mouseDownXPercent_ = Math.round((x / this.gameWidth_) * 100);
  this.mouseDownYPercent_ = Math.round((y / this.gameHeight_) * 100);
};

/**
 * Log an event directly.
 *
 * @param {string} name the name of the event.
 * @param {Object} data the data to be logged with the event.
 */
GameActivityLogger.prototype.logEvent = function(name, data)
{

  if (typeof name === 'string' && typeof data === 'object')
  {
    this.gameLog_.logAction(name, data);
  } else
    throw new Error('logEvent(name, data): name argument should be a string and data argument should be an object');
};

/**
 * Event fired when mouse is clicked. Log the click event to GCM
 *
 * @param {Object} event the DOM event that is fired when the mouse is clicked.
 *
 * @private
 */
GameActivityLogger.prototype.mouseClick_ = function(event)
{
  // on mobile, x and y can only be inspected on mouse down, not mouse up,
  // so we get the values on mouse down and store them, then use them here
  this.gameLog_.logClick(this.mouseDownXPercent_, this.mouseDownYPercent_);

};
/**
 * @fileoverview Server Error functions.
 * @author asugar
 */
goog.provide('gcm.error');

goog.require('gcm.errormap');

/**
 * get Error Category of given error code
 * default Error Category is NON_RECOVERABLE_ERROR
 * @param {string} error Error code for category checking.
 * @return {string} error category.
 * */
gcm.error.getErrorCategory = function(error) {
  switch (error) {
    case gcm.errormap.fogerrorCode.ERR_NO_LOGIN_COOKIE:
    case gcm.errormap.fogerrorCode.DECRYPT_LOGIN_COOKIE_FAILED_P1:
    case gcm.errormap.gcmserviceerrorCode.ERR_NO_LOGIN_COOKIE:
      return gcm.errormap.errorCategory.LOGIN_ERROR;

    case gcm.errormap.fogerrorCode.INSUFFICIENT_FUNDS_P1:
    case gcm.errormap.rgierrorCode.INSUFFICIENT_FUNDS:  
      return gcm.errormap.errorCategory.INSUFFICIENT_FUNDS;

    case gcm.errormap.fogerrorCode.JACKPOT_CHANGED_DUE_TO_WIN:
    case gcm.errormap.fogerrorCode.NUM_JACKPOTS_CHANGED:
    case gcm.errormap.fogerrorCode.STAKE_HIGHER_THAN_ALLOW_MAX:
    case gcm.errormap.fogerrorCode.STAKE_LOWER_THAN_ALLOW_MIN:
    case gcm.errormap.fogerrorCode.WARN_CUM_PLAY_COUNT_P1:
    case gcm.errormap.fogerrorCode.INSUFFICIENT_FUNDS_FREEPLAY:
    case gcm.errormap.fogerrorCode.ERR_SPLITTING_FRONT_HAND_BETTER:
    case gcm.errormap.rgierrorCode.WARN_SESSION_ACK_DUE_P1:
      return gcm.errormap.errorCategory.RECOVERABLE_ERROR;

    case gcm.errormap.fogerrorCode.CANNOT_CLOSE_GAME_IN_PROGRESS:
    case gcm.errormap.fogerrorCode.GUEST_CUTOFF_MSG:
    case gcm.errormap.fogerrorCode.MAX_WINNINGS_EXCEEDED:
    case gcm.errormap.fogerrorCode.REACHED_MAX_WINNINGS_P2:
    case gcm.errormap.gcmserviceerrorCode.WS_ABORT:
    case gcm.errormap.gcmserviceerrorCode.WS_ACCESS_DENIED:
    case gcm.errormap.gcmserviceerrorCode.WS_HTTP_ERROR:
      return gcm.errormap.errorCategory.NON_RECOVERABLE_ERROR;

    case gcm.errormap.fogerrorCode.REGION_BLOCKED:
    case gcm.errormap.fogerrorCode.REQ_GAME_NOT_FREE_PLAY:
    case gcm.errormap.fogerrorCode.FAILED_TO_FIND_GAME_DETAILS:
    case gcm.errormap.fogerrorCode.LOCKED_ACCOUNT:
    case gcm.errormap.gcmserviceerrorCode.WS_FS_SUMMARY_DATA_NOT_FOUND:
    case gcm.errormap.gcmserviceerrorCode.WS_FS_TOKEN_NOT_FOUND:
    case gcm.errormap.rgierrorCode.DETAILS_NOT_PRESENT_P1:
    case gcm.errormap.rgierrorCode.FAILED_DB_GET_FREESPIN_TOKEN:
    case gcm.errormap.rgierrorCode.FREESPIN_TOKEN_EXPIRED:
    case gcm.errormap.rgierrorCode.FREESPIN_TOKEN_NOT_ACTIVE:
    case gcm.errormap.rgierrorCode.FREESPIN_TOKEN_REDEEMED:
    case gcm.errormap.rgierrorCode.WRONG_FREESPIN_NUM_LINES:
    case gcm.errormap.rgierrorCode.WRONG_FREESPIN_STAKE_AMOUNT:
    case gcm.errormap.rgierrorCode.WRONG_FREESPIN_STAKE_PER_LINE:
      return gcm.errormap.errorCategory.CRITICAL;
    
    case gcm.errormap.gcmserviceerrorCode.WS_TIMEOUT:
      return gcm.errormap.errorCategory.CONNECTION_ERROR;

    case gcm.errormap.fogerrorCode.REALITY_CHECK:
      return gcm.errormap.errorCategory.REALITY_CHECK;

    default:
      return gcm.errormap.errorCategory.NON_RECOVERABLE_ERROR;
  }
};

/**
 * get Error Severity of given error code
 * @param {string} error Error code for type checking.
 * @return {string} error type.
 * */
gcm.error.getErrorSeverity = function(error) {
  switch (error) {
  case gcm.errormap.fogerrorCode.ERR_NO_LOGIN_COOKIE:
  case gcm.errormap.fogerrorCode.LOCKED_ACCOUNT:
  case gcm.errormap.fogerrorCode.DECRYPT_LOGIN_COOKIE_FAILED_P1:
  case gcm.errormap.fogerrorCode.GUEST_CUTOFF_MSG:
  case gcm.errormap.fogerrorCode.REALITY_CHECK:
  case gcm.errormap.gcmserviceerrorCode.ERR_NO_LOGIN_COOKIE:
  case gcm.errormap.gcmserviceerrorCode.WS_ABORT:
  case gcm.errormap.gcmserviceerrorCode.WS_ACCESS_DENIED:
  case gcm.errormap.gcmserviceerrorCode.WS_FS_SUMMARY_DATA_NOT_FOUND:
  case gcm.errormap.gcmserviceerrorCode.WS_FS_TOKEN_NOT_FOUND:
  case gcm.errormap.gcmserviceerrorCode.WS_HTTP_ERROR:
  case gcm.errormap.gcmserviceerrorCode.WS_TIMEOUT:
  case gcm.errormap.rgierrorCode.DETAILS_NOT_PRESENT_P1:
  case gcm.errormap.rgierrorCode.FAILED_DB_GET_FREESPIN_TOKEN:
  case gcm.errormap.rgierrorCode.FREESPIN_TOKEN_EXPIRED:
  case gcm.errormap.rgierrorCode.FREESPIN_TOKEN_NOT_ACTIVE:
  case gcm.errormap.rgierrorCode.FREESPIN_TOKEN_REDEEMED:
  case gcm.errormap.rgierrorCode.WRONG_FREESPIN_NUM_LINES:
  case gcm.errormap.rgierrorCode.WRONG_FREESPIN_STAKE_AMOUNT:
  case gcm.errormap.rgierrorCode.WRONG_FREESPIN_STAKE_PER_LINE:
    return gcm.errormap.errorSeverity.ERROR;

  case gcm.errormap.fogerrorCode.JACKPOT_CHANGED_DUE_TO_WIN:
  case gcm.errormap.fogerrorCode.NUM_JACKPOTS_CHANGED:
  case gcm.errormap.fogerrorCode.STAKE_HIGHER_THAN_ALLOW_MAX:
  case gcm.errormap.fogerrorCode.STAKE_LOWER_THAN_ALLOW_MIN:
  case gcm.errormap.fogerrorCode.WARN_CUM_PLAY_COUNT_P1:
  case gcm.errormap.fogerrorCode.INSUFFICIENT_FUNDS_P1:
  case gcm.errormap.fogerrorCode.INSUFFICIENT_FUNDS_FREEPLAY:
    return gcm.errormap.errorSeverity.INFO;

  default:
    return gcm.errormap.errorSeverity.ERROR;
  }
};
/**
 * @author xliu
 * Date: 01/05/13
 */
goog.provide('gcm.notification.model.SessionNotification');
goog.require('gcm.notification.model.GCMNotification');
goog.inherits(SessionNotification, GCMNotification);
/**
 * @class
 * This is data model for Session stats notification. <br>
 * The type of session stats notification is 'SESSION_STATS'.
 * The body of this notification should be in the format of:
 *     <pre>
 *       {
 *         stakes: string
 *         winnings: string
 *         turnover: string
 *       }
 *     </pre>
 * This notification requires user acknowledgement and expects user feedback,
 * CommonUI should pass the user choice as notification feedback parameter
 * in the format of: <br>
 *     <pre>
 *       {
 *         sessionContinue: boolean
 *       }
 *     </pre>
 *
 * @extends GCMNotification
 *
 * @constructor
 * @param {string} stakes Player stakes in current session.
 * @param {string} winnings Player winnings in current session.
 * @param {string} turnover Player turnover in current session.
 * @param {Function} callback The callback function to be invoked after player made a choice.
 *                  CommonUI should pass the user choice as notification feedback parameter
 *                  in the format of: <br>
 *                    <pre>
 *                      {sessionContinue: boolean}
 *                    </pre>
 *                   .
 * */
function SessionNotification(stakes, winnings, turnover, callback) {
  var stats = {
    'stakes': stakes,
    'winnings': winnings,
    'turnover': turnover
  };
  GCMNotification.call(this, GCMNotification.TYPE.SESSION_STATS, stats, callback);
}

/**
 * @author xliu
 * Date: 02/10/12
 * Time: 13:43
 */
goog.provide('gcm.session.GameSession');
goog.require('gcm.currencyformat');
goog.require('gcm.net.ws');
goog.require('gcm.notification.model.SessionNotification');


/**
 * @class
 * This class is to handle game session request and response, including session timer and session acknowledgement.
 *
 * @constructor
 * @param {string} webServiceUrl the base url for the gcm config web service, e.g. /gcm-ws.
 */
function GameSession(webServiceUrl) {
  this.sessionWSUrlBase_ = webServiceUrl + GameSession.SERVICE_URL;

  /** @private
   * @type {NotificationHandler}
   * A reference to singleton instance gcm.notification.NotificationHandler, the constructor will
   * return a reference to the singleton instance.
   * */
  this.notificationHandler_ = new NotificationHandler();

  this.timerRequestInterval_ = 0;
  this.ackDisplayRequested_ = false;

  this.ackDue_ = null;

  this.timerIntervalID = null;
  this.timerRequestFailTimes = 0;
}

/** @const The relative URL of this web service*/
GameSession.SERVICE_URL = '/session/';

/**
 * session timer request interval, in seconds.
 * @type {number}
 * */
GameSession.DEFAULT_TIMER_REQUEST_INTERVAL = 300;

/**
 * session ack local update interval, in seconds.
 * @type {number}
 * */
GameSession.ACK_UPDATE_INTERVAL = 5;

/**
 * This function will be called by GCM to start the whole game session system.
 *
 * @param {GCMConfig} gcmConfig The config module to retrieve related config from gcm-ws.
 * */
GameSession.prototype.run = function(gcmConfig)
{
  if (gcmConfig.checkConfigEnabled('session'))
  {
    if (gcmConfig.checkConfigEnabled('session.timer'))
    {
      //set timer request interval from config
       this.timerRequestInterval_ = parseInt(gcmConfig.getConfig('session.timer.interval'), 10) ||
            GameSession.DEFAULT_TIMER_REQUEST_INTERVAL;


      //send off the first request straight away
      this.requestSessionTimer_();

      //Start session timer request interval
      //Intervals using second as time unit thus *1e3
      this.timerIntervalID = setInterval(gcm.delegate.create(this, this.requestSessionTimer_),
            this.timerRequestInterval_ * 1e3);
    }

    if (gcmConfig.checkConfigEnabled('session.stats'))
    {
      //start seesion ack update interval
      setInterval(gcm.delegate.create(this, this.localSessionAckUpdate_), GameSession.ACK_UPDATE_INTERVAL * 1e3);
    }
  }
};

/**
 * @private
 */
GameSession.prototype.localSessionAckUpdate_ = function()
{
  if (null === this.ackDue_)
    return;

  this.ackDue_ -= GameSession.ACK_UPDATE_INTERVAL;

  if (this.ackDue_ <= 0 && !this.ackDisplayRequested_)
    gcm.net.ws.getXmlResponse(this.sessionWSUrlBase_ + 'stats.xml', this, this.sessionStatsResponseHandler_);
};

/**
 * @private
 * */
GameSession.prototype.requestSessionTimer_ = function()
{
  gcm.net.ws.getXmlResponse(this.sessionWSUrlBase_ + 'timer.xml', this,
    this.sessionTimerResponseHandler_, this.sessionTimerErrorResponseHandler_);
};

/**
 * @private
 * @param {Document} xmlDocResponse The response in XML format.
 * */
GameSession.prototype.sessionTimerResponseHandler_ = function(xmlDocResponse)
{
  var timerNode, duration;

  try {
    timerNode = xmlDocResponse.getElementsByTagName('SessionTimerResponse')[0];
    duration = parseInt(timerNode.getElementsByTagName('Duration')[0].childNodes[0].nodeValue, 10);
    if (timerNode.getElementsByTagName('AckDue')[0])
      this.ackDue_ = parseInt(timerNode.getElementsByTagName('AckDue')[0].childNodes[0].nodeValue, 10);
  } catch (e) {
    throw Error('com.openbet.gcm.session.GameSession.sessionTimerResponseHandler: failed to parse session response');
  }

  this.timerRequestFailTimes = 0;

  var timerNotification = new GCMNotification(GCMNotification.TYPE.SESSION_TIMER, {'duration': duration});
  this.notificationHandler_.handleNotification(timerNotification);
};

/**
 * @private
 * @param {Document} xmlDocResponse The response in XML format.
 * */
GameSession.prototype.sessionContinueResponseHandler_ = function(xmlDocResponse)
{
  var root, sessionExtended;

  try {
    root = xmlDocResponse.getElementsByTagName('SessionContinueResponse')[0];
    sessionExtended = root.getElementsByTagName('Extended')[0].childNodes[0].nodeValue;
  } catch (e) {
    throw new Error('com.openbet.gcm.session.GameSession.sessionContinueResponseHandler: failed to parse response');
  }

  if ('true' == sessionExtended)
  {
    //if session extend, reset ackDue to a larger number than timer request interval
    //ackDue will be updated when next timer request made.
    this.ackDue_ = this.timerRequestInterval_ * 10;
  }
  this.ackDisplayRequested_ = false;
};

/**
 * @private
 * @param {Object} feedback CommonUI should pass the user choice as notification feedback parameter
 *                  in the format of: <br>
 *                    <pre>
 *                      {sessionContinue: boolean}
 *                    </pre><br>
 *                  sessionContinue set to true means user wish to continue on current session.
 * */
GameSession.prototype.sessionStatsUserFeedback_ = function(feedback)
{
  if (feedback && feedback['sessionContinue']) {
    gcm.net.ws.getXmlResponse(this.sessionWSUrlBase_ + 'continue.xml', this, this.sessionContinueResponseHandler_);
  }
  else {
    //GCM do not handle session end response
    gcm.net.ws.getXmlResponse(this.sessionWSUrlBase_ + 'end.xml');
  }
};

/**
 * @private
 * @param {Document} xmlDocResponse The response in XML format.
 * */
GameSession.prototype.sessionStatsResponseHandler_ = function(xmlDocResponse)
{
  var statsNode, stakes, winnings, turnover;

  try {
    statsNode = xmlDocResponse.getElementsByTagName('SessionStatsResponse')[0];
    stakes = parseFloat(statsNode.getElementsByTagName('Stakes')[0].childNodes[0].nodeValue);
    winnings = parseFloat(statsNode.getElementsByTagName('Winnings')[0].childNodes[0].nodeValue);
    turnover = parseFloat(statsNode.getElementsByTagName('Turnover')[0].childNodes[0].nodeValue);
  } catch (e) {
    throw Error('com.openbet.gcm.session.GameSession.sessionStatsResponseHandler: failed to parse session response');
  }

  //get instance of singleton class CurrencyFormat
  var formater = new CurrencyFormat();
  var notification = new SessionNotification(
    formater.format(stakes).display,
    formater.format(winnings).display,
    formater.format(turnover).display,
    gcm.delegate.create(this, this.sessionStatsUserFeedback_));
  this.notificationHandler_.handleNotification(notification);
  this.ackDisplayRequested_ = true;
};

/**
 * @private
 * */
GameSession.prototype.sessionTimerErrorResponseHandler_ = function()
{
  this.timerRequestFailTimes++;
  if (this.timerRequestFailTimes >= 3)
    clearInterval(this.timerIntervalID);
};
/**
 * @author aalonzi
 */
goog.provide('gcm.config.AccountConfig');
goog.require('gcm.event.EventDispatcher');
goog.require('gcm.net.ws');
goog.inherits(AccountConfig, EventDispatcher);
/**
 * @extends EventDispatcher
 * @class
 * <p>
 * This class is managed by gcm and aims to get account config from web service.<br>
 * @param {string} webServiceUrl the base url for the gcm web service, e.g. /gcm-ws.
 *        It takes a errorObject when error occurs.
 *        <pre>
 *          {
 *              errorCode: code,
 *              errorMessage: msg
 *          }
 *        </pre>.
 * @constructor
 */
function AccountConfig(webServiceUrl) {
  EventDispatcher.call(this);

  this.webServiceUrlBase_ = webServiceUrl + AccountConfig.SERVICE_URL;
}

/** @const The relative URL of this web service **/
AccountConfig.SERVICE_URL = '/config/account';

/**
 * Attributes that indicates whether the config is ready or not.
 * @type {boolean}
 * @private
 */
AccountConfig.prototype.ready_ = false;

/**
 * This method calls the web service in order to retrieve account config data.
 * @param {GameConfig.PlayMode} playMode modality of game launching.
 */
AccountConfig.prototype.init = function(playMode) {
  this.getAccountConfigFromWs_(playMode);
};

/**
 * @private
 * @param {GameConfig.PlayMode} playMode modality of game launching.
 */
AccountConfig.prototype.getAccountConfigFromWs_ = function(playMode) {
  //TODO remove this file type suffix - this is currently needed for
  //testing on dummy xml files aliased into apache on localhost
  
  //CHANGES MADE BY CORE TO MATCH CURRENCY TO COOKIE
  var currencyCode = "GBP";

  function getParameterByName(name)
  {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.parent.location.href);
    if(results == null)
      return "";
    else
      return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
  
  var passedCurrencyCode = String(getParameterByName("currencyCode"));

  if (passedCurrencyCode !== "")
  {
    currencyCode = passedCurrencyCode;
  }

  var url = this.webServiceUrlBase_ + '_' + currencyCode +'.xml';

  //CHANGES MADE BY CORE TO MATCH CURRENCY TO COOKIE

  // append playMode parameter
  url += '?playMode=' + playMode;

  gcm.net.ws.getXmlResponse(url, this, this.responseHandler);
};


/**
 * This method Handles a successful response from gcm AccountConfig web service.<br>
 * We expect the response to have the following format:
 * <pre>
 *   &lt;AccountConfigResponse&gt;
 *     &lt;CurrencyFormat&gt;
 *       &lt;Code&gt;GBP&lt;/Code&gt;
 *       &lt;DecimalSeparator&gt;.&lt;/DecimalSeparator&gt;
 *       &lt;ThousandSeparator&gt;,&lt;/ThousandSeparator&gt;
 *     &lt;/CurrencyFormat&gt;
 *   &lt;/AccountConfigResponse&gt;
 * </pre>.
 * @param {Document} xmlDocResponse response body in XML format.
 */
AccountConfig.prototype.responseHandler = function(xmlDocResponse) {
  /** @type {Node} */
  var configNode;
  /** @type {Node} */
  var currencyFormatNode;
  /** @type {string} */
  var currencyCode;
  /** @type {string} */
  var currencyFormatDecimalSeparator;
  /** @type {string} */
  var currencyFormatThousandSeparator;

  try {
    configNode = xmlDocResponse.getElementsByTagName('AccountConfigResponse')[0];

    // get currency format and its values
    currencyFormatNode = configNode.getElementsByTagName('CurrencyFormat')[0];
    currencyCode = currencyFormatNode.getElementsByTagName('Code')[0].childNodes[0].nodeValue;
    currencyFormatDecimalSeparator = currencyFormatNode
                .getElementsByTagName('DecimalSeparator')[0].childNodes[0].nodeValue;
    currencyFormatThousandSeparator = currencyFormatNode
                .getElementsByTagName('ThousandSeparator')[0].childNodes[0].nodeValue;

  } catch (e) {
    throw new Error('gcm.config.AccountConfig.handleAccountConfigWsResponse: failed to parse accountconfig response');
  }

  // set values in the current object
  this.ready_ = true;

  // update the CCYFormatter Singleton (referenced in Account.js)
  var currencyFormat = new CurrencyFormat();
  currencyFormat.init(currencyFormatThousandSeparator, currencyFormatDecimalSeparator, currencyCode);

  this.dispatchEvent(new GCMEvent(GCMEvent.COMPLETE));
};

/**
 * This method returns a boolean that indicates if the config is ready to be used.
 * @return {boolean} return the ready state of config.
 */
AccountConfig.prototype.isReady = function() {
  return this.ready_;
};
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
 *                                        'FREEBET': {amount: 1000}
 *                                      }
 *                     }.
 * @throws Error if there is malformed XML or the required xml attributes
 *         are not found
 **/
XmlUtil.getAccountInfoAndBalancesFromFOGXml = function(accountXml, freebetSummaryXml) {
  if ( window.DOMParser ) { // Standard
      var xmlParser = new DOMParser();
      var xmlData = xmlParser.parseFromString( accountXml , "text/xml" );
  } else { // IE
      xmlData = new ActiveXObject( "Microsoft.XMLDOM" );
      xmlData.async = "false";
      xmlData.loadXML( accountXml );
  }

  var warnArr = [];
  try {
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
 *   &lt;Balance type="FREESPIN" amount="100.00" count="5"/&gt;
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
 *                                        'FREEBET': {amount: 2000},
 *                                        'FREESPIN': {amount: 100, count: 5}
 *                                      }
 *                     }.
 * @throws Error if there is malformed XML or the required xml attributes are not found
 * */
XmlUtil.getAccountInfoAndBalancesFromRGIXml = function(customerXml) {
    if ( window.DOMParser ) { // Standard
        var xmlParser = new DOMParser();
        var xmlData = xmlParser.parseFromString( customerXml , "text/xml" );
    } else { // IE
        var xmlData = new ActiveXObject( "Microsoft.XMLDOM" );
        xmlData.async = "false";
        xmlData.loadXML( customerXml );
    }
  var warnArr = [];
  try {    
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
    if ('FREESPIN' == node.getAttribute('type'))
      balancesObj[node.getAttribute('type')]['count'] = parseInt(node.getAttribute('count'),10);
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
 * @throws Error if there is malformed XML
 * */
XmlUtil.getErrorInfoFromFOGXml = function(errorXml) {
  var errorObject;

  try {
    if ( window.DOMParser ) { // Standard
        var xmlParser = new DOMParser();
        var xmlDoc = xmlParser.parseFromString( errorXml , "text/xml" );
    } else { // IE
        var xmlDoc = new ActiveXObject( "Microsoft.XMLDOM" );
        xmlDoc.async = "false";
        xmlDoc.loadXML( errorXml );
    }
    var rootNode = xmlDoc.getElementsByTagName('Error')[0];
    var errCode = rootNode.getAttribute('code');
    if (!errCode) {
        errCode = 'UNKNOWN';
    }
    var errMessage = rootNode.getAttribute('msg');
    if (!errMessage) {
        errMessage = 'An unexpected error has occurred. Please try again.';
    }
  }
  catch (e)
  {
    throw Error('com.openbet.gcm.xmlutil.getErrorInfoFromFOGXml: Error parsing XML');
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

    if ( window.DOMParser ) { // Standard
        var xmlParser = new DOMParser();
        var xmlDoc = xmlParser.parseFromString( errorXml , "text/xml" );
    } else { // IE
        var xmlDoc = new ActiveXObject( "Microsoft.XMLDOM" );
        xmlDoc.async = "false";
        xmlDoc.loadXML( errorXml );
    }

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
 * @author slakshmi
 */
goog.provide('gcm.config.FreespinConfig');
goog.require('gcm.event.EventDispatcher');
goog.require('gcm.net.ws');
goog.inherits(FreespinConfig, EventDispatcher);
/**
 * @extends EventDispatcher
 * @class
 * <p>
 * This class is managed by gcm and aims to get freespins config from web service.<br>
 * @param {string} webServiceUrl the base url for the gcm web service, e.g. /gcm-ws.
 * @param {string} configParam the base url for the gcm web service, e.g. /gcm-ws.
 *        It takes a errorObject when error occurs.
 *        <pre>
 *          {
 *              errorCode: code,
 *              errorMessage: msg
 *          }
 *        </pre>.
 * @constructor
 */
function FreespinConfig(webServiceUrl, configParam, errorHandler) {
  EventDispatcher.call(this);
  this.webserviceUrlBase_ = webServiceUrl + FreespinConfig.SERVICE_URL;
  this.configParam_ = configParam;
  if (errorHandler)
    this.errorHandler_ = errorHandler;
  else
    this.errorHandler_ = null;
}

/**
 * @const The relative URL of freespins token config web service.
 */
FreespinConfig.SERVICE_URL = '/freespin/token/';

/**
 * The freespin config param value with name
 *
 * @return {string} The config param and value
 */
FreespinConfig.prototype.configParam = function() {
  return this.configParam_;
};

/**
 * @type {number}
 * @private
 */
FreespinConfig.prototype.stakePerLine_;

/**
 * @type {number}
 * @private
 */
FreespinConfig.prototype.numOfLines_;

/**
 * @type {number}
 * @private
 */
FreespinConfig.prototype.numOfSpins_;

/**
 * @type {number}
 * @private
 */
FreespinConfig.prototype.freespinTokenId_;

/**
 * @type {string}
 * @private
 */
FreespinConfig.prototype.webServiceUrlBase_;

/**
 * is the config ready
 * This is false until we have retrieved config from server
 * @type {boolean}
 * @private
 */
FreespinConfig.prototype.ready_ = false;

/**
 * call the web service to retrieve freespin config data
 */
FreespinConfig.prototype.init = function() {
  if (!this.ready_) {
   this.getFreespinConfigFromWS_();
  }
};

/**
 * Request freespin token config from gcm-ws.
 *
 * @private
 */
FreespinConfig.prototype.getFreespinConfigFromWS_ = function() {
  var url = this.webserviceUrlBase_ + this.configParam_;
  gcm.net.ws.getXmlResponse(url, this, this.responseHandler, this.errorHandler_);
};

/**
 * This method Handles a successful response from gcm FreespinConfig web service.<br>
 * We expect the response to have the following format:
 * <pre>
 *   &lt;custTokens&gt;
 *     &lt;freeSpinToken&gt;
 *       &nbsp;stake_per_line&#61;&quot;1&quot;
 *       &nbsp;num_spins&#61;&quot;5&quot;
 *       &nbsp;num_lines&#61;&quot;10&quot;
 *       &nbsp;id&#61;&quot;11&quot;/&gt;
 *   &lt;/custTokens&gt;
 * </pre>.
 * @param {Document} xmlDocResponse response body in XML format.
 */
 FreespinConfig.prototype.responseHandler = function(xmlDocResponse) {
  /** @type {Node} */
  var configNode;
  /** @type {number} */
  var stakePerLine;
  /** @type {number} */
  var numOfLines;
  /** @type {number} */
  var numOfSpins;
  /** @type {number} */
  var freespinTokenId;
  var errorCategory, errorSeverity, errorCode, errorMessage;
  var errorHandler = this.errorHandler_;
  try {
    configNode = xmlDocResponse.getElementsByTagName('custTokens')[0];
    if ( configNode && configNode.hasChildNodes()) {
      var freespinTokenNode = configNode.getElementsByTagName('freeSpinToken')[0];
      stakePerLine = parseFloat(freespinTokenNode.getAttributeNode('stake_per_line').value);
      numOfLines = parseInt(freespinTokenNode.getAttributeNode('num_lines').value, 10);
      numOfSpins = parseInt(freespinTokenNode.getAttributeNode('num_spins').value, 10);
      freespinTokenId = parseInt(freespinTokenNode.getAttributeNode('id').value, 10);
    } else {
      errorCode = 'FREESPIN_TOKEN_NOT_FOUND';
      errorMessage = 'User does not have any active freespin tokens for this game';
    }
  } catch (e) {
    errorCode = 'UNKNOWN';
    errorMessage = e.message;
  } finally {
    if (errorCode) {
      if (errorHandler) {
        // compare error code to list of known errors
        // figure out the error category
        var errorCategory = gcm.error.getErrorCategory(errorCode);
        // figure out the error type
        var errorSeverity = gcm.error.getErrorSeverity(errorCode);
        errorHandler.call(this, errorCategory, errorSeverity, errorCode, errorMessage);
      } else {
	throw new Error('An error has occurred at:' +
         'gcm.config.FreespinConfig.responseHandler:' + '\nError Code: ' + errorCode +
         '\nError Message: ' + errorMessage);
      }
    }
  }
  this.stakePerLine_ = stakePerLine;
  this.numOfLines_ = numOfLines;
  this.numOfSpins_ = numOfSpins;
  this.freespinTokenId_ = freespinTokenId;
  this.ready_ = true;
  this.dispatchEvent(new GCMEvent(GCMEvent.COMPLETE));
 };

/**
 * Returns the stake per line.
 * @return {number} the stakePerLine.
 * */
FreespinConfig.prototype.getStakePerLine = function()
{
 return this.stakePerLine_;
};

/**
 * Set the stake per line.
* @param {number} stakePerLine stakefromline passed from game through gcm.
 * */
FreespinConfig.prototype.setStakePerLine = function(stakePerLine)
{
 this.stakePerLine_ = stakePerLine;
};

/**
 * Returns the number of lines.
 * @return {number} the numOfLines.
 * */
FreespinConfig.prototype.getNumOfLines = function()
{
 return this.numOfLines_;
};

/**
 * Set the number of lines
* @param {number} numOfLines numOfLines passed from game through gcm.
 * */
FreespinConfig.prototype.setNumOfLines = function(numOfLines)
{
 this.numOfLines_ = numOfLines;
};

/**
 * Returns the number of spins.
 * @return {number} the numOfSpins.
 * */
FreespinConfig.prototype.getNumOfSpins = function()
{
 return this.numOfSpins_;
};

/**
 * Set the number of spins
* @param {number} numOfSpins numOfSpins passed from game through gcm.
 * */
FreespinConfig.prototype.setNumOfSpins = function(numOfSpins)
{
 this.numOfSpins_ = numOfSpins;
};

/**
 * Returns the freespin Token Id.
 * @return {number} the freespinTokenId.
 * */
FreespinConfig.prototype.getFreespinTokenId = function()
{
 return this.freespinTokenId_;
};

/**
 * Set the freespin token ID
* @param {number} freespinTokenId freespinTokenId passed from game through gcm.
 * */
FreespinConfig.prototype.setFreespinTokenId = function(freespinTokenId)
{
 this.freespinTokenId_ = freespinTokenId;
};

/**
 * is the config ready to be used
 * @return {boolean} return the ready state of config.
 */
FreespinConfig.prototype.isReady = function() {
  return this.ready_;
};

/**
 * Set the ready state of freespin Config
* @param {boolean} ready ready state of config.
 * */
FreespinConfig.prototype.setReady = function(ready)
{
 this.ready_ = ready;
};

/**
 * Retrieves game configuration information.<br>
 * The commonUI can call this to retrieve the configuration
 * The returned configuration items will be stakePerLine, numOfLines, numOfSpins and <br>
 * freespinTokenId
 * @return {Object} the config object.
 */
FreespinConfig.prototype.getConfig = function() {
  if (this.ready_) {
    return {
      'stake_per_line' : this.stakePerLine_,
      'num_spins' : this.numOfSpins_,
      'num_lines' : this.numOfLines_,
      'tokenID' : this.freespinTokenId_
    };
  } else {
    throw new Error('FreespinConfig.prototype.getConfig: Config is not ready');
  }
};
/**
 * @fileoverview
 * This class handles all the calls from GCM to flash topbar.
 *
 * @author slakshmi
 * Date: 30/04/2015
 **/

goog.provide('gcm.faux.FauxGCMGame');


/**
 * @type {Object}
 * @private
 */
FauxGCMGame.fauxFlashTopbar = null;

/**
 * @type {boolean}
 * @private
 */
FauxGCMGame.miniGame = false;

/**
 * @constructor
 */
function FauxGCMGame(miniGame) {
  if (miniGame){
    FauxGCMGame.miniGame = true;
  }
}

/**
 *  This method grabs flash topbar object
 * @return {Object} flash object
 */
FauxGCMGame.getFlashTopbar = function() {

        if(FauxGCMGame.miniGame) {

            FauxGCMGame.fauxFlashTopbar = document.getElementById("game");    

        } else {

            if(document.getElementById("gameIFrame").contentDocument.getElementById("game")){

                FauxGCMGame.fauxFlashTopbar = document.getElementById("gameIFrame").contentDocument.getElementById("game"); 

            } else {

                FauxGCMGame.fauxFlashTopbar = document.getElementById("gameIFrame").contentDocument.getElementById("shell");    
                
            }           
        }
              
    return FauxGCMGame.fauxFlashTopbar;

};

/**
 * This method calls flash topbar to launch the game in real play Mode.
 */
FauxGCMGame.prototype.realPlayClicked = function() {
    FauxGCMGame.getFlashTopbar()["realPlayClicked"]();
};

/**
 * This method calls flash topbar to launch the game in freespin play Mode.
 */
FauxGCMGame.prototype.freeSpinsClicked = function() {
    FauxGCMGame.getFlashTopbar()["freeSpinsClicked"]();
};

/**
 * This method calls flash topbar to launch the game in real play Mode. This call will be initiated from
 * freespins summary screen.
 */
FauxGCMGame.prototype.onFreespinRealPlayClicked = function() {
    FauxGCMGame.getFlashTopbar()["onFreespinRealPlayClicked"]();
};

/**
 * This method calls flash topbar to give notice about an option that has changed value
 */
FauxGCMGame.prototype.optionHasChanged = function(optionType, newValue) {
    FauxGCMGame.getFlashTopbar()["optionHasChanged"](optionType, newValue);
};

FauxGCMGame.prototype.gameRevealed = function(){
	// This is NA for Flash games
	// For future use and also passing verification by implementing the interface
};

FauxGCMGame.prototype.gcmReady = function(gcm){
	// This is NA for Flash games
	// For future use and also passing verification by implementing the interface
};

FauxGCMGame.prototype.configReady = function(){
	// This is NA for Flash games
	// For future use and also passing verification by implementing the interface
};

/**
 * This method calls flash topbar to tell that Ok button on error popup has been clicked
 */
FauxGCMGame.prototype.resume = function(errorParamIndex){
    FauxGCMGame.getFlashTopbar()["commonUIErrorOKClicked"]();
};

FauxGCMGame.prototype.balancesHasChanged = function(balances){
	// Flash games do not have the capability to update their balances through topbar	
	// For future use and also passing verification by implementing the interface
};

/*
* This method calls flash topbar to get Menu Structure json response
* @return {Object} topBarConfig Object
*/
FauxGCMGame.prototype.getMenuStructure = function(){
    return FauxGCMGame.getFlashTopbar()["getMenuStructure"]();
};/**
 * @author xliu
 * Date: 28/11/12
 * Time: 13:56
 */

goog.provide('gcm.config.GCMConfig');
goog.require('gcm.event.EventDispatcher');
goog.require('gcm.net.ws');
goog.inherits(GCMConfig, EventDispatcher);
/**
 * @extends EventDispatcher
 * @class
 * This class handles the config for GCM which is loaded from gcm config webservice.
 *
 * @constructor
 * @param {string} webServiceUrl the base url for the game config web service, e.g. /gcm-ws/.
 */
function GCMConfig(webServiceUrl) {
  EventDispatcher.call(this);

  this.wsUrlBase_ = webServiceUrl + GCMConfig.SERVICE_URL;
  this.config_ = {};
  this.ready_ = false;

  gcm.net.ws.getXmlResponse(this.wsUrlBase_ + 'services.xml', this, this.configResponseHandler_);
}

/** @const The relative URL of this web service*/
GCMConfig.SERVICE_URL = '/config/gcm/';

/**
 * @param {string} nameStr The name of a specific gcm config, such as 'session.timer'.
 * @return {Object|string|null} the object contain requested gcm config,
 *                              or a specific config depending on given string.
 * */
GCMConfig.prototype.getConfig = function(nameStr) {
  var namespaces = nameStr.split('.');
  var scope = this.config_;

  for (var i = 0; i < namespaces.length; ++i)
  {
    if (!scope[namespaces[i]])
      return null;
    else
      scope = scope[namespaces[i]];
  }

  return scope;
};

/**
 * Check if a gcm service config is enabled. If a service is not explicitly declared as enabled=false,
 * it will be by default treated as enabled.
 * @param {string} configName The name of a specific gcm config, such as 'session.timer'.
 * @return {boolean} result of enable checking..
 * */
GCMConfig.prototype.checkConfigEnabled = function(configName) {
  var configObj = this.getConfig(configName);
  return !configObj || !configObj['enabled'] || 'false' != String.prototype.toLowerCase.call(configObj['enabled']);
};



/**
 * @private
 * @param {Document} xmlDocResponse The response in XML format.
 * */
GCMConfig.prototype.configResponseHandler_ = function(xmlDocResponse) {
  try {
    var serviceConfigurations = xmlDocResponse.getElementsByTagName('ServiceConfiguration');
    for (var i = 0; i < serviceConfigurations.length; ++i) {
      var configDom = serviceConfigurations[i];
      var serviceName = configDom.getElementsByTagName('ServiceName')[0].childNodes[0].nodeValue;
      if (serviceName) {
        var configObj = this.newConfig_(serviceName);
        if (configDom.getElementsByTagName('Enabled')[0])
          configObj['enabled'] = configDom.getElementsByTagName('Enabled')[0].childNodes[0].nodeValue;
        else
          configObj['enabled'] = 'true';
        var propertiesNode = configDom.getElementsByTagName('Parameters');
        if (propertiesNode.length > 0) {
          var properties = propertiesNode[0].getElementsByTagName('ServiceProperty');
          for (var j = 0; j < properties.length; ++j) {
            var key = properties[j].getElementsByTagName('key')[0].childNodes[0].nodeValue;
            configObj[key] = properties[j].getElementsByTagName('value')[0].childNodes[0].nodeValue;
          }
        }
      }
    }
  } catch (e) {
    throw new Error('com.openbet.gcm.session.GameSession.configResponseHandler_: failed to parse gcm config response');
  }

  // Set mute with the value defined in gcm-ws.properties
  var muteValue = null === this.getConfig('gameoption.mute') ? false : this.getConfig('gameoption.mute')['enabled'] == 'true';
  GameInfo.setDefaultOption(GameInfo.OptionTypes.MUTE, muteValue);

  this.ready_ = true;
  this.dispatchEvent(new GCMEvent(GCMEvent.COMPLETE));
};

/**
 * is the config ready to be used
 * @return {boolean} return the ready state of config.
 */
GCMConfig.prototype.isReady = function() {
  return this.ready_;
};

/**
 * Create a new config Object.
 * @private
 * @param {string} nameStr The name of a specific gcm config, such as 'session.timer'.
 * @return {?Object} the object contain requested gcm config,
 *                              or a specific config depending on given string.
 * */
GCMConfig.prototype.newConfig_ = function(nameStr) {
  var namespaces = nameStr.split('.');
  var scope = this.config_;

  for (var i = 0; i < namespaces.length; ++i)
  {
    if (scope[namespaces[i]] == undefined) {
      scope[namespaces[i]] = {};
    }

    scope = scope[namespaces[i]];

  }
  return scope;
};
/**
 * @fileoverview
 * This class handles collating game activity data, and sending it to the web service for logging.
 *
 * This library can be configured by settings:
 * gamelog.options.maxentry and gamelog.options.mintimebetweensends
 *
 * logger.js calls logClick and logAction on GCMGameLog to add data.  Once maxentry data points have
 * been added then GCMGameLog will send the data to the web service where the data will be logged.
 * If the configured mintimebetweensends has already elapsed then GCMGameLog will start to collect data again
 * until maxentry is reached.  If the configured mintimebetweensends has not elapsed then we wait until it does
 * before we allow more data to be collected.  In this way some data will be discarded if data is collected faster
 * than can be sent to the server in the mintimebetweensends intervals.
 * The amount of data lost can be adjusted by adjusting the mintimebetweensends and maxentry settings for
 * optimal performance.
 *
 * @author xliu
 */
goog.provide('gcm.activitylog.GCMGameLog');
goog.require('gcm.delegate');
goog.require('gcm.net.ws');

/**
 * @class This class handles collating game activity data, and sending it to the web service for logging
 *
 * @param {string} webServiceUrlBase the base url for the gcm web service, e.g. /gcm-ws.
 * @param {string} gameName the name of current game.
 * @constructor
 */
function GCMGameLog(webServiceUrlBase, gameName) {
  this.webServiceUrl_ = webServiceUrlBase + GCMGameLog.SERVICE_URL;
  this.gameName_ = gameName;
  this.sessionID_ = (new Date()).getTime() + '' + Math.floor(Math.random() * 1e7);
  this.config_ = {};
  this.dataSendLimitReached_ = false;
}

/** @const The default max record number for each send.*/
GCMGameLog.DEFAULT_MAX_ENTRY = 100;
/** @const The default min time between each send.*/
GCMGameLog.DEFAULT_MIN_TIME_BETWEEN_SENDS = 120;
/** @const The Types of log event.*/
GCMGameLog.LOG_EVENT_TYPE = {
  ACTION: 'action',
  CLICK: 'click'
};

/** @const The relative URL of this web service*/
GCMGameLog.SERVICE_URL = '/gamelog';


/**
 * This function will be called by GCM to start the game logging module.
 * Invoke this function after gcm config ready to make sure logging module has acquired correct config.
 * @param {GCMConfig} gcmConfig The config module to retrieve related config from gcm-ws.
 * */
GCMGameLog.prototype.run = function(gcmConfig) {
  if (gcmConfig.checkConfigEnabled('gamelog')) {
    /** @type {function()}*/
    var toLowerCase = String.prototype.toLowerCase;
    var attribute;
    this.config_ = {
      'enabled': true,
      'clickEnabled': (attribute = gcmConfig.getConfig('gamelog.options.logclick')) &&
        toLowerCase.call(attribute) == 'true',
      'actionEnabled': (attribute = gcmConfig.getConfig('gamelog.options.logaction')) &&
        toLowerCase.call(attribute) == 'true'
    };

    this.setMaxStoreEntry_(parseInt(gcmConfig.getConfig('gamelog.options.maxentry'), 10) ||
      GCMGameLog.DEFAULT_MAX_ENTRY);
    this.setMinTimeBetweenSends_(parseInt(gcmConfig.getConfig('gamelog.options.mintimebetweensends'), 10) ||
      GCMGameLog.DEFAULT_MIN_TIME_BETWEEN_SENDS);
    this.resetData_();
    this.startCountDown_();
  }
};

/**
 * Common UI can access to GCM logging config by this API.
 * @return {Object} The config Object in this format:
 *      {
 *          enabled: boolean,
 *          clickEnabled: boolean,
 *          actionEnabled: boolean
 *      }.
 * */
GCMGameLog.prototype.getConfig = function() {
  if (this.config_) {
    return this.config_;
  }
  else
    return {'enabled': false};
};

/**
 * log a click event
 * @param {number} x The percentage of the x point of click event relative to the game window.
 * @param {number} y The percentage of the y point of click event relative to the game window.
 * */
GCMGameLog.prototype.logClick = function(x, y) {
  if (this.config_['clickEnabled'])
    this.addDataEntry_(GCMGameLog.LOG_EVENT_TYPE.CLICK, [x, y]);
};

/**
 * log an action event
 * @param {string} name The name of user action.
 * @param {Object} data The related data of this action.
 * */
GCMGameLog.prototype.logAction = function(name, data) {
  if (this.config_['actionEnabled'])
    this.addDataEntry_(GCMGameLog.LOG_EVENT_TYPE.ACTION, {'name': name, 'data': data});
};


/**
 * adds the data, and if we have reached the maxentry then we send the data to the web service.
 * @private
 * @param {string} eventType The type of the event to be added. should be from GCMGameLog.LOG_EVENT_TYPE.
 * @param {*} data The data associated with the event.
 * */
GCMGameLog.prototype.addDataEntry_ = function(eventType, data) {
  if (this.config_['enabled'] && !this.dataSendLimitReached_) {
    if (eventType === GCMGameLog.LOG_EVENT_TYPE.CLICK) {
      this.storedData_['clickData'].push(data);
      this.storedDataEntries_++;
    } else if (eventType === GCMGameLog.LOG_EVENT_TYPE.ACTION) {
      this.storedData_['actionData'].push(data);
      this.storedDataEntries_++;
    }
    if (this.storedDataEntries_ >= this.maxStoreEntry_) {
      this.dataSendLimitReached_ = true;
      //send data immediately on reaching limit
      //the limit will be reset after the countdown timer completes
      this.sendLogDataAndReset_();
    }
  }
};

/**
 * reset the locally stored data
 * @private
 * */
GCMGameLog.prototype.resetData_ = function() {
  //reset data
  this.storedData_ = {
    'clickData': [],
    'actionData': []
  };
  this.storedDataEntries_ = 0;
};

/**
 * resets the data and starts the countdown timer
 * @private
 * */
GCMGameLog.prototype.restart_ = function() {
  this.resetData_();
  this.dataSendLimitReached_ = false;
  this.startCountDown_();
};


/**
 * sends the data to the web service and resets the locally stored data
 * @private
 * */
GCMGameLog.prototype.sendLogDataAndReset_ = function() {
  if (this.config_['enabled'] && this.storedDataEntries_ > 0)
  {
    try {
      var actionData = window['JSON'].stringify(this.storedData_['actionData']);
      var clickData = window['JSON'].stringify(this.storedData_['clickData']);
      var request = {
        'sessionID': this.sessionID_,
        'gameName': this.gameName_,
        'clickData': clickData,
        'actionData': actionData
      };
      gcm.net.ws.postJsonRequest(this.webServiceUrl_, window['JSON'].stringify(request));
    }
    catch (e) {
      throw e;
    }
    finally {
      this.resetData_();
    }
  }
};

/**
 * @private
 */
GCMGameLog.prototype.countDownComplete_ = function() {
  if (this.dataSendLimitReached_) {
    //if we reached the data limit and sent the data already
    //during this time then allow data collection again
    this.dataSendLimitReached_ = false;
  } else {
    //if we didn't reach the data limit during this time
    //then send the data now and reset
    this.sendLogDataAndReset_();
  }
  this.startCountDown_();
};

/**
 * @private
 * @param {number} maxEntry The maximum entry number of log events, when it is reached.
 * */
GCMGameLog.prototype.setMaxStoreEntry_ = function(maxEntry) {
  if (typeof maxEntry == 'number' && maxEntry > 0)
    this.maxStoreEntry_ = maxEntry;
};

/**
 * @private
 * @param {number} interval minimum time between sends to log data to ws, in seconds.
 * */
GCMGameLog.prototype.setMinTimeBetweenSends_ = function(interval) {
  if (typeof interval == 'number' && interval > 0)
    this.minTimeBetweenSends_ = interval * 1e3;
};

/**
 * @private
 * */
GCMGameLog.prototype.startCountDown_ = function() {
  clearTimeout(this.intervalID_);
  this.intervalID_ = setTimeout(gcm.delegate.create(this, this.countDownComplete_), this.minTimeBetweenSends_);
};

/**
 * @author xliu
 * Date: 30/04/13
 */
goog.provide('gcm.notification.model.ErrorNotification');
goog.require('gcm.notification.model.GCMNotification');
goog.inherits(ErrorNotification, GCMNotification);
/**
 * @class This is data model of GCM error notification.
 * @extends GCMNotification
 * This is data model for Error notification. <br>
 * The type of session stats notification is 'ERROR'.
 * The body of this notification should be in the format of:
 *     <pre>
 *       {
 *         errorCategory: string
 *         errorSeverity: string
 *         errorCode: string
 *         errorMessage: string
 *         errorParams: object
 *       }
 *     </pre>
 *
 * @constructor
 * @param {string} errorCategory the category of current error.
 *                 The current error categories are:
 *                 {
 *                     CRITICAL,
 *                     INSUFFICIENT_FUNDS,
 *                     LOGIN_ERROR,
 *                     RECOVERABLE_ERROR,
 *                     NON_RECOVERABLE_ERROR,
 *                     CONNECTION_ERROR,
 *                     MULTI_CHOICE_DIALOG,
                       OTHER_GAME_IN_PROGRESS
 *                 }.
 * @param {string} errorSeverity this signifies the severity of the error and can
 *          be 'WARNING', 'INFO' or 'ERROR'.
 * @param {string} errorCode the error code string. Note that usually nothing
 *          should be done with this parameter. The commonUI is not expected to
 *          do any business logic based on the error code, but it is passed
 *          through in case the commonUI wishes to log the error codes that
 *          have been sent.
 * @param {string} errorMessage the error message provide by game.
 * @param {Object=} errorParams (Optional) JSON object parameter to allow game to pass additional
 *          information to the commonUI on how to handle the error. Key,value pairs
 *          must be provided in a valid JSON format.
 *          e.g {'suppressMessage':'true'}.
 * */
function ErrorNotification(errorCategory, errorSeverity, errorCode, errorMessage, errorParams) {
  var errorBody = {
    'errorCategory': errorCategory,
    'errorSeverity': errorSeverity,
    'errorCode': errorCode,
    'errorMessage': errorMessage,
    'errorParams' : errorParams
  };

  GCMNotification.call(this, GCMNotification.TYPE.ERROR, errorBody, ErrorNotification.setErrorParamIndex);

}

/**
 * Sets error param index
 * @param {*} errorParamIndex Index to be set.
 */
ErrorNotification.setErrorParamIndex = function(errorParamIndex) {
  ErrorNotification.gameErrorParamIndex = errorParamIndex;
};

/**
 * Retrieves error param index.
 * @return {*} The error param index.
 */
ErrorNotification.getErrorParamIndex = function() {
  return ErrorNotification.gameErrorParamIndex;
};

/**
 * @author X.Liu
 */
goog.provide('gcm.ErrorHandler');

goog.require('gcm.delegate');
goog.require('gcm.error');
goog.require('gcm.errormap');
goog.require('gcm.notification.model.ErrorNotification');
goog.require('gcm.validate');

/**
 * @class
 * This Class is a functional module of gcm
 * It is responsible for:
 *  - Receiving error message from game
 *  - Send Error notification to notification handler.
 * @constructor
 *
 */
function ErrorHandler() {
  /**
   * @private
   * @type {NotificationHandler}
   * A reference to singleton instance gcm.notification.NotificationHandler, the constructor will
   * return a reference to the singleton instance.
   * */
  this.notificationHandler_ = new NotificationHandler();
}

/**
 * The game should call handleServerError with every error that it receives from
 * the game server.
 * GCM will categorize the error based on the error code in the errorInfo object.
 * <code>
 * The current error categories include:
 *                 {
 *                     CRITICAL,
 *                     INSUFFICIENT_FUNDS,
 *                     LOGIN_ERROR,
 *                     RECOVERABLE_ERROR,
 *                     NON_RECOVERABLE_ERROR,
 *                     CONNECTION_ERROR,
 *                     MULTI_CHOICE_DIALOG,
 *                     OTHER_GAME_IN_PROGRESS
 *                 }.
 * Default error category is NON_RECOVERABLE_ERROR.
 * </code>
 * GCM will also supply the error severity for known errors. i.e. 'WARNING', 'INFO'
 * or 'ERROR'.  This can be used by the commonUI to display different colours and titles for the
 * error dialogs if desired.<br>
 * GCM will pass the error onto the commonUI to both display the error and decide
 * what it would like to do after the error has been shown (business logic should be
 * based on the errorCategory supplied by GCM)<br>
 *
 * Note that the errorInfo object parameter required for this function can
 * be created using com.openbet.gcm.xmlutil.getErrorInfoFromFOGXml() which takes
 * the XML Error response from the FOG/RGI server and converts it into the
 * required object format.  Alternatively the object can be created directly by the
 * game's FOG response parsing code.
 * Additional parameters can be be passed from the game to the CommomUI. This must be
 * specified in JSON format in key value pairs.
 * For example:
 *              {'suppressMessage':'true'}.
 * @param {Object} errorInfo The error object in the following format:
 * <code>
 *          {
 *            errorCode: code,
 *            errorMessage: msg
 *          }</code>.
 * @throws Error if the params are invalid.
 */
ErrorHandler.prototype.handleServerError = function(errorInfo) {
  /** @type {string} */
  var errorSeverity;

  /** @type {string} */
  var errorCategory;

  //validate the error object
  if (!gcm.validate.isErrorInfo(errorInfo)) {
    throw new Error('gcm.handleServerError: Invalid Error object');
  }

  /** @type {string} */
  var errorCode = errorInfo['errorCode'];

  /** @type {string} */
  var errorMSG = errorInfo['errorMessage'];

  // compare error code to list of known errors
  // figure out the error category
  errorCategory = gcm.error.getErrorCategory(errorCode);
  // figure out the error type
  errorSeverity = gcm.error.getErrorSeverity(errorCode);

  //send error notification
  this.notificationHandler_.handleNotification(new ErrorNotification(errorCategory,
    errorSeverity, errorCode, errorMSG));
};


/**
 * The game should call handleError on gcm for any error to be displayed and handled
 * by the CommonUI. <br>
 * GCM will call commonUI.handleError() to pass this error to commonUI for handling.
 * The commonUI is responsible for both the display and the logic for what happens
 * after an error is displayed to the user.<br>
 *
 * @param {string} errorCategory the category of current error.
 *                 The current error categories are:
 *                 {
 *                     CRITICAL,
 *                     INSUFFICIENT_FUNDS,
 *                     LOGIN_ERROR,
 *                     RECOVERABLE_ERROR,
 *                     NON_RECOVERABLE_ERROR,
 *                     CONNECTION_ERROR,
 *                     MULTI_CHOICE_DIALOG,
                       OTHER_GAME_IN_PROGRESS
 *                 }.
 * @param {string} errorSeverity this signifies the severity of the error and can
 *          be 'WARNING', 'INFO' or 'ERROR'.
 * @param {string} errorCode the error code string. Note that usually nothing
 *          should be done with this parameter. The commonUI is not expected to
 *          do any business logic based on the error code, but it is passed
 *          through in case the commonUI wishes to log the error codes that
 *          have been sent.
 * @param {string} errorMessage the error message provide by game.
 * @param {Object=} errorParams (Optional) JSON object parameter to allow game to pass additional
 *          information to the commonUI on how to handle the error. Key,value pairs
 *          must be provided in a valid JSON format.
 *          e.g {'suppressMessage':'true'}.
 */
ErrorHandler.prototype.handleError = function(errorCategory, errorSeverity, errorCode, errorMessage, errorParams)
{
  //validation
  if (!gcm.validate.isEnumOption(gcm.errormap.errorCategory, errorCategory)) {
    errorCategory = gcm.errormap.errorCategory.NON_RECOVERABLE_ERROR;
  }
  if (!gcm.validate.isEnumOption(gcm.errormap.errorSeverity, errorSeverity)) {
    errorSeverity = gcm.errormap.errorSeverity.ERROR;
  }
  if (!goog.isDefAndNotNull(errorCode)) {
    errorCode = 'UNKNOWN';
  }

  if (!goog.isDefAndNotNull(errorMessage)) {
    errorMessage = 'An unexpected error has occurred. Please try again.';
  }
  if (errorParams != null) {
    if (!(typeof errorParams === 'object')) {
      throw new Error('gcm.handleError: Invalid errorParams type');
    }
  }

  //send error notification
  this.notificationHandler_.handleNotification(new ErrorNotification(errorCategory,
    errorSeverity, errorCode, errorMessage, errorParams));
};


/**
 * check if the an error is for reality check
 * @param {string} error Error code for type checking.
 * @return {boolean} returns true if reality check error , false otherwise.
 * */
ErrorHandler.prototype.isRealityCheckError = function (error)
{
  if ( error == null || error.search(gcm.errormap.fogerrorCode.REALITY_CHECK) == -1 ) {
    return false;
  } else {
    return true;
  }
};


/**
 * This is the callback function that will be called when gcm gets the reality check details from gcm-ws
 * @param {Object} realityCheckDetails JSON object parameter to pass additional params to commonUI
 * Example of realityCheckDetails object :
 *
 * { "realityCheckInfo": {"custId": "3", "realityCheckPeriod": "1800", "sessionTime": "3000", "remainingTime": "0"},
 *   "rcParams" : {"param1": "value1", "param2": "value2",...,"paramN":"valueN"}
 * }
 * Note: rcParams Object param in this response is an optional parameter and can contain unrestricted number of params.
 *
 */
ErrorHandler.prototype.handleRealityCheckError = function (realityCheckDetails)
{
  var errorCode = gcm.errormap.fogerrorCode.REALITY_CHECK;

  var errorCategory = gcm.error.getErrorCategory(errorCode);

  var errorSeverity = gcm.error.getErrorSeverity(errorCode);

  var realityCheckInfo = realityCheckDetails['realityCheckInfo'];

  // comstruct the default reality check message
  var errorMessage="You have requested a Reality Check after every " + realityCheckInfo['realityCheckPeriod']/60 +
              " minutes of play.\nYour gaming session has now reached "+ realityCheckInfo['sessionTime']/60 +
              " minutes.\nTo continue playing select 'continue Playing' below or to stop " +
              "playing click 'Log Out'.\nYou may also view your account history to review your playing history.";

  // Include the realityCheckDetails in errorParams so that commonUI is free to customize the errorMessage.
  var errorParams = realityCheckDetails;

  //send error notification
  this.notificationHandler_.handleNotification(new ErrorNotification(errorCategory,
    errorSeverity, errorCode, errorMessage, errorParams));
};
/**
 * @author cramacha
 * Date: 12/07/13
 */
goog.provide('gcm.liveserv.BPushHandler');
goog.require('gcm.Promotions');
goog.require('gcm.liveserv.MessageHandler');
goog.require('goog.json');

/**
 * This class is managed by gcm and aim to handle bpush notifications.
 *
 * @constructor
 * @implements {MessageHandler}
 * @param {!string} webServiceUrlBase The base url for gcm web service, e.g. /gcm-ws".
 * @param {Promotions} promotions The promotions object.
 */
function BPushHandler(webServiceUrlBase, promotions) {
  this.channelType_ = 'GBPUSH';
  this.bPushWSUrlBase_ = webServiceUrlBase + BPushHandler.SERVICE_URL;
  this.promotions_ = promotions;
  this.initComplete_ = false;
}

/**
 * @const The relative URL of this web service.
 */
BPushHandler.SERVICE_URL = '/bonus-push/';

/**
 * enumerate of liveserv subject
 * @enum {!string}
 */
BPushHandler.SUBJECT = {
  BONUS_BAR: 'BBAUPD0000000000',
  FREEBET_REWARD: 'FREEBA0000000000'
};

/**
 * Init bonus push from gcm-ws.
 *
 * @param {Function} onInitCallback The call back function after init.
 */
BPushHandler.prototype.init = function(onInitCallback) {
  this.onInitCallback_ = onInitCallback;
  gcm.net.ws.getJsonResponse(this.bPushWSUrlBase_ + 'init.json', this, this.initResponseHandler_,
    this.initErrorResponseHandler_);
};

/**
 * Parse the promotion init response from gcm-ws.
 *
 * @param {!Object} jsonResponse The response in JSON format.
 * @private
 */
BPushHandler.prototype.initResponseHandler_ = function(jsonResponse) {
  try {
    if (jsonResponse['BBarUpdate']['PercentageEarned'])
      this.promotions_.sendBBARNotification(jsonResponse['BBarUpdate']['PercentageEarned'], false);
    var freebets = jsonResponse['CustTokens']['CustToken'];
    if (freebets && freebets.length > 0) {
      this.promotions_.listenToNotificationHandler(this.onInitComplete_, this);
      // send freebet notifications
      for (var i = 0; i < freebets.length; i++) {
        var freebet = freebets[i];
        this.promotions_.sendFreebetNotification(freebet['Id'], freebet['Value'], freebet['AutoActivate']);
      }
    } else
      this.makeOnInitCallback_();
  } catch (e) {
    this.onInitComplete_();
    throw Error('com.openbet.gcm.liveserv.BPushHandler.initResponseHandler_: failed to initialize');
  }
};

/**
 * @private
 */
BPushHandler.prototype.initErrorResponseHandler_ = function() {
  this.makeOnInitCallback_();
};

/**
 * @private
 */
BPushHandler.prototype.makeOnInitCallback_ = function() {
  this.initComplete_ = true;
  this.onInitCallback_();
};

/**
 * Removes event listener from notification handler and notifies that the game can be revealed.
 *
 * @private
 */
BPushHandler.prototype.onInitComplete_ = function() {
  this.promotions_.unlistenToNotificationHandler(this.onInitComplete_, this);
  this.makeOnInitCallback_();
};

/**
 * @inheritDoc
 */
BPushHandler.prototype.isInitComplete = function() {
  return this.initComplete_;
};

/**
 * @inheritDoc
 */
BPushHandler.prototype.getChannelType = function() {
  return this.channelType_;
};

/**
 * Parse liveserv notification and push it to notification queue.
 *
 * @inheritDoc
 */
BPushHandler.prototype.handleMessage = function(liveServResponse) {
  // Retrieving the payload sent from liveserv
  var data = goog.json.parse(liveServResponse['payload']);

  if (liveServResponse['subject'] == BPushHandler.SUBJECT.BONUS_BAR) {
    // send bbar notifications
    this.promotions_.sendBBARNotification(data['PercentageEarned'], data['BBarWin']['Win']);
  } else if (liveServResponse['subject'] == BPushHandler.SUBJECT.FREEBET_REWARD) {
    // send freebet notification
    this.promotions_.sendFreebetNotification(data['Id'], data['Value'], data['AutoActivate']);
  }
};

goog.provide('gcm.gamecontrol.GameInfo');
goog.require('gcm.validate');

/**
 *
 * This GameInfo is a singleton class for:
 *  - Manage game options, which is registered from game and will notify commonUI for the
 *    regitered options
 *  - Manage game display elements registration, (i.e. About Box), also commonUI will be notified
 *    for registered displays
 *  - Bypass game display information to commonUI (i.e. game loading percentage information)
 *  - Manage option change actions, keep game and gcm in consistency for any changed game option
 *    during game play.
 *
 * @author xliu
 * Date: 17/07/12
 * Time: 15:19
 * @namespace
 */

var GameInfo = {};

/**
 * A reference of game instance
 * @type {Object}
 * @private
 */
GameInfo.game_ = null;

/**
 * A reference of commonUI instance
 * @type {Object}
 * @private
 */
GameInfo.commonUI_ = null;

/**
 * The possible options that can be registered with gcm:
 * MUTE and TURBO.
 * Also display options are treated as option too, such as:
 * ABOUT, GAME_PREFERENCES, PAYTABLE.
 * @enum {string}
 */
GameInfo.OptionTypes = {
  MUTE: 'MUTE',
  TURBO: 'TURBO',
  ABOUT: 'ABOUT',
  HELP: 'HELP',
  PAYTABLE: 'PAYTABLE',
  GAME_PREFERENCES: 'GAME_PREFERENCES',
  QUALITY : 'QUALITY',
  CLOTH_COLOR : 'CLOTH_COLOR',
  GAME_FEATURE : 'GAME_FEATURE',
  AMBIENCE_SOUND : 'AMBIENCE_SOUND'
};

/**
 * map of OptionTypes to boolean value
 * @type {Object.<boolean|string>}
 * @private
 */
GameInfo.options_ = {};


/**
 * Holds default value for options defined in gcm-ws.properties
 * @private
 */
GameInfo.defaultOptions_ = {};


/**
 * This is a hard-coded default value which might change from the gcm config webservice
 */
GameInfo.defaultOptions_[GameInfo.OptionTypes.MUTE] = false;

/**
 * This is a hard-coded default value
 */
GameInfo.defaultOptions_[GameInfo.OptionTypes.QUALITY] = 'HIGH';

/**
 * This is a hard-coded default value
 */
GameInfo.defaultOptions_[GameInfo.OptionTypes.CLOTH_COLOR] = 'BLUE';

/**
 * This function is called by gcm to pass the reference of game instance
 * @param {Object} game A reference to game.
 * */
GameInfo.setGame = function(game) {
  GameInfo.game_ = game;
};


/**
 * This is called from GCMConfig.js after the properties file is parsed
 * @param {GameInfo.OptionTypes} type Type of default option.
 * @param {boolean} value value of default option.
 */
GameInfo.setDefaultOption = function(type, value) {
    GameInfo.defaultOptions_[type] = value;
};

/**
 * Retrieves the default value for a given type of property
 * @param {GameInfo.OptionTypes} type Type of the default option.
 * @return {string} The value associated for the given type.
 */
GameInfo.getDefaultOption = function(type) {
    return GameInfo.defaultOptions_[type];
};


/**
 * This function is called by gcm to pass the reference of commonUI instance
 * @param {Object} commonUI A reference to commonUI.
 * */
GameInfo.setCommonUI = function(commonUI)
{
  GameInfo.commonUI_ = commonUI;

  // if gcm has already had options registered to it, then tell the commonUI
  var typeKey;
  for (typeKey in GameInfo.options_) {
    GameInfo.commonUI_.regOption(typeKey, GameInfo.options_[typeKey]);
  }
};
/**
 * Either the game or the commonUI can call this method on gcm to state that an
 * option has changed. There could be UI in both the game and the commonUI to
 * control options such as MUTE and TURBO, and the new value should be reflected
 * in both places
 * @param {string} optionType one of MUTE, TURBO.
 * @param {string} changedFrom one of COMMONUI, GAME. This tells gcm whether the
 *          option was switched in the game or the commonUI.
 * @param {boolean} newValue the new value of the option.
 */
GameInfo.optionHasChanged = function(optionType, changedFrom, newValue) {
  if (!(changedFrom === 'COMMONUI' || changedFrom === 'GAME')) {
    throw new Error('gcm.optionHasChanged: changedFrom must be COMMONUI or GAME. Received ' + changedFrom);
  }

  if (!gcm.validate.isEnumOption(GameInfo.OptionTypes, optionType)) {
    throw new Error('gcm.optionHasChanged: Unknown optionType ' +
      optionType + ' in change request from ' + changedFrom);
  }

  if (optionType === 'QUALITY' || optionType === 'CLOTH_COLOR') {
     if (GameInfo.options_[optionType] === '') {
               throw new Error('else :gcm.optionHasChanged: option changed - ' + optionType +
                ' - has not been registered: '+ GameInfo.options_[optionType]);
     }
  } else {
      if (!goog.isBoolean(newValue)) {
         throw new Error('gcm.optionHasChanged: newValue must be boolean.  Received ' + newValue);
      }
      if (!goog.isBoolean(GameInfo.options_[optionType])) {
              throw new Error('gcm.optionHasChanged: option changed - ' + optionType +
              ' - has not been registered: '+ GameInfo.options_[optionType]);
      }
  }

  GameInfo.options_[optionType] = newValue;

  if (changedFrom === 'GAME') {
    // tell the commonUI about the change
    GameInfo.commonUI_.optionHasChanged(optionType, newValue);
  } else if (changedFrom === 'COMMONUI') {
    // tell the game about the change
    GameInfo.game_.optionHasChanged(optionType, newValue);
  }
};

/**
 * This is an optional call for the game to make to GCM. The game can choose to
 * use this facility if they choose to allow the commonUI to control game
 * options.
 * @param {string} optionType must be one of 'MUTE', 'TURBO', 'ABOUT', 'GAME_PREFERENCE' or 'PAYTABLE'.
 *          We can extend this list in the future.
 * @return {boolean|string} the initial value of the option is returned back to the
 *         game. GCM can potentially in the future save these options in cookies
 *         or against the account, so that we have persistence of options.
 * @throws Error if the optionType params are invalid
 */
GameInfo.regOption = function(optionType) {
  if (!gcm.validate.isEnumOption(GameInfo.OptionTypes, optionType)) {
    throw new Error('gcm.regOption: Unknown optionType ' + optionType);
  }

  if(GameInfo.options_[optionType] === undefined)
  {
    switch (optionType)
    {
      case GameInfo.OptionTypes.MUTE:
        GameInfo.options_[optionType] = GameInfo.defaultOptions_[GameInfo.OptionTypes.MUTE];
        break;
      case GameInfo.OptionTypes.TURBO:
        // turbo option should default to false
        GameInfo.options_[optionType] = false;
        break;
      case GameInfo.OptionTypes.QUALITY:
        GameInfo.options_[optionType] = GameInfo.defaultOptions_[GameInfo.OptionTypes.QUALITY];
        break;
      case GameInfo.OptionTypes.CLOTH_COLOR:
        GameInfo.options_[optionType] = GameInfo.defaultOptions_[GameInfo.OptionTypes.CLOTH_COLOR];
        break;
      default:
        GameInfo.options_[optionType] = false;
    }
  }
  // setup the option in the commonUI if the commonUI is available
  // otherwise we will tell the commonUI when the commonUI calls commonUIReady
  if (GameInfo.commonUI_) {
    GameInfo.commonUI_.regOption(optionType, GameInfo.options_[optionType]);
  }
  return GameInfo.options_[optionType];
};

/**
 * The game must call this on gcm so that the commonUI can be updated with
 * loading progress and display progress in a loading screen
 * @param {number} percentLoaded the percentage of the loading process complete.
 */
GameInfo.loadProgressUpdate = function(percentLoaded) {

  if (!gcm.validate.isPercentValue(percentLoaded)) {
    throw new Error('gcm.loadProgressUpdate: Invalid percentLoaded value:' +
      percentLoaded);
  }

  if (GameInfo.commonUI_) {
    GameInfo.commonUI_.loadProgressUpdate(percentLoaded);
  }
};
/**
 * @fileoverview
 * This class handles the retrieval of reality checks details of a player for GCM, which is loaded
 * from gcm reality checks webservice.
 *
 * @author hnair
 * Date: 26/10/15
 */

goog.provide('gcm.realitycheck.RealityCheckDetails');
goog.require('gcm.net.ws');

/**
 * This class manage by gcm and aims to get reality check details from web service.
 *
 * @param {Function} RealityCheckCallback Function called when reality check details are received from web service.
 * @param {string} webServiceUrlBase the base url for the reality check web service, e.g. /gcm-ws/realitycheck.
 * @constructor
 */
function RealityCheckDetails(RealityCheckCallback, webServiceUrlBase)
{
  this.RealityCheckCallback_ = RealityCheckCallback;
  this.webServiceUrlBase_ = webServiceUrlBase;
  this.ready_ = false;
}

/**
 * This is called by gcmCore to retrieve the reality details
 */
RealityCheckDetails.prototype.init = function() {
  this.getRealityCheckDetailsFromWs_();
};

/**
 * Makes a call to the GCM web service
 * Retrieves the details of reality check for a player
 *
 * Returns a JSON response
 *
 * @private
 */
RealityCheckDetails.prototype.getRealityCheckDetailsFromWs_ = function() {
  //TODO remove this file type suffix - this is currently needed for
  //testing on dummy xml files aliased into apache on localhost
  var url = this.webServiceUrlBase_ + '/realitycheck/details';

  gcm.net.ws.getJsonResponse(url, this, this.ResponseHandler_);
};

/**
 * Handle returning JSON response from web service
 * @private
 * @param {Object|undefined} jsonResponse The response in JSON format.
 * */
RealityCheckDetails.prototype.ResponseHandler_ = function(jsonResponse)
{
  var realityCheckInfo, rcParams;
  try {
    this.ready_ = true;
  } catch (e) {
    throw new Error('com.openbet.gcm.realitycheck.RealityCheckDetails.ResponseHandler_: validation of RealityCheckDetails JSON failed');
  }
  this.RealityCheckCallback_(jsonResponse);
};
/**
 * @fileoverview
 * This class handles the acknowledgement of reality checks from a player's reality check error screen using 
 * reality check acknowledge web service.
 *
 * @author slakshmi
 * Date: 23/11/15
 */

goog.provide('gcm.realitycheck.AckRealityCheck');
goog.require('gcm.net.ws');
goog.require('goog.json');

/**
 * This class manage by gcm and aims to acknowledge reality check response using web service.
 *
 * @param {string} webServiceUrlBase the base url for the reality check web service, e.g. /gcm-ws/realitycheck.
 * @constructor
 */
function AckRealityCheck(webServiceUrlBase,errorHandler)
{
  this.webServiceUrlBase_ = webServiceUrlBase;
  this.ready_ = false;
  if (errorHandler)
    this.errorHandler_ = errorHandler;
  else
    this.errorHandler_ = null;
}

/**
 * This is called by gcmCore to acknowledge the reality check response from a player.
 */
AckRealityCheck.prototype.init = function(playerChoice, params) {
  this.ackRealityCheckDetailsUsingWs_(playerChoice, params);
};

/**
 * Makes a call to the GCM web service
 * Acknowledges the reality Check response from a player
 *
 * Returns a JSON response
 *
 * @private
 */
AckRealityCheck.prototype.ackRealityCheckDetailsUsingWs_ = function(playerChoice, params) {
  //TODO remove this file type suffix - this is currently needed for
  //testing on dummy xml files aliased into apache on localhost
  var url = this.webServiceUrlBase_ + '/realitycheck/acknowledge';
  if (params !== null && params !== undefined) {
    var rcParams = window['JSON'].stringify(params);
    var ackRealityCheckData = {'userChoice' : playerChoice, 'rcParams' : rcParams};
  } else {
    var ackRealityCheckData = {'userChoice' : playerChoice};
  };
  
  gcm.net.ws.postJsonRequest(url, window['JSON'].stringify(ackRealityCheckData), this, this.ResponseHandler_,this.errorHandler_);
};

/**
 * Handle returning JSON response from web service
 * @private
 * @param {Object|undefined} jsonResponse The response in JSON format.
 * */
AckRealityCheck.prototype.ResponseHandler_ = function(jsonResponse)
{
  var errorHandler = this.errorHandler_;
  var errorCategory, errorSeverity, errorCode, errorMessage;
 //TODO add in a JSON validate method.
  try {
    this.ready_ = true;
  } catch (e) {
  	throw new Error('com.openbet.gcm.realitycheck.AckRealityCheck.ResponseHandler_:'+e.message);
  } 
};
goog.provide('gcm.Launcher');

/**
 * @class
 * This class includes static functions for launching desktop html5 games. 
 * Based on the code previously part of example lobby.
 */

  function Launcher() {       
  }
  
  /** @type {Object} */
  var pageParams = {};  

  /** @type {Object} */
  var gameParams = {};

  /**
   * Will make a request to the available web service using the gameName, channel, and playmode:
   * http://openbet.com/gcm-ws/gamelaunch/ChainReactors?playMode=real&channel=I&loginToken=blah&lang=en
   *
   * @param {Object} pageParameters collection of values for the request
   */
/*
  Launcher.launchGameWS = function(pageParameters, isDesktop) {
    
    pageParams = pageParameters;
    
    //Create the Header parameters from the supplied input.
    var headerParams = Launcher.createHeaderParams(pageParams["playMode"]);

    var xmlhttp = Launcher.createHttpRequestObj();

    //Take the supplied gameName.
    var m_gameName = pageParams["gameName"];

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {

          if(isDesktop) {
            Launcher.handleLaunchResponse(xmlhttp.responseText);  
          } else {
            Launcher.handleMobileLaunchResponse(xmlhttp.responseText);  
          }
          
        }
        else {
          try {
            //Show error if unsuccessful using message supplied by GCM
            if ( window.DOMParser ) { // Standard
                var xmlParser = new DOMParser();
                var xmlData = xmlParser.parseFromString( xmlhttp.responseText , "text/xml" );
            } else { // IE
                var xmlData = new ActiveXObject( "Microsoft.XMLDOM" );
                xmlData.async = "false";
                xmlData.loadXML( xmlhttp.responseText );
            }

            var messageNode = xmlData.getElementsByTagName('Message')[0];
            var respText = messageNode.childNodes[0].nodeValue;
            //Display Web Service message. 
            alert('Error:'+xmlhttp.status+'\nMessage:'+respText);
          }
          catch (err) {
            //If request fails display status code
            alert('Error:'+xmlhttp.status+'\nMessage:'+respText);
          }
        }
      }
    };
    //Make a gameLaunch request to gcm-ws
    xmlhttp.open('POST', gcmCore.gcmWebServiceBaseUrl_ + "/gamelaunch/" + m_gameName, true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send(headerParams);
  };*/

  // NEW FUNCTION SUPPLIED BY CORE TO ALLOW GAMES TO LOAD WITHOUT INDIVIDUAL SETTINGS FILES
  Launcher.launchGameWS = function(pageParameters, isDesktop) {
    
    pageParams = pageParameters;
    
    //Create the Header parameters from the supplied input.
    var headerParams = Launcher.createHeaderParams(pageParams["playMode"]);

    pageParams = pageParameters;
    
    var headerParams = Launcher.createHeaderParams(pageParams["playMode"]);
    var coreCookie = pageParams["coreCookie"];

    var playMode = pageParams["playMode"];
    var channel = pageParams["channel"];
    var gameName = pageParams["gameName"];
    var gameLocation = pageParams["gameLocation"];
    var lang = pageParams["lang"];
    if (lang)
    {
      var lang_array = lang.split("-");
      if (lang_array[0]) 
      {
        lang = lang_array[0];
      }
      if (lang_array[1]) 
      {
        lang = lang + "-" + lang_array[1].toUpperCase();
      }
    }
    var cookie = "";
    if( String(coreCookie) )
    {
      cookie = cookie + String(coreCookie);
    }

    var response = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>";

    response = response + "<GameLaunchResponse><GameUrlMethod>GET</GameUrlMethod>";

    response = response + "<GameUrl>../"+gameLocation+"/index.html?gcmParams=gcmPlayMode%3D"+playMode+"%7CgcmChannel%3DI%7CgcmLang%3D"+lang+"%7CgcmGameName%3D"+gameName+"%7CgcmcommonUIURL%3D..%2F..%2Fgcm-example-commonui-desktop%2Fcommonui.html&amp;gcmPlayMode="+playMode+"&amp;playMode="+playMode+"&amp;gcmChannel="+channel+"&amp;channel="+channel+"&amp;commonUIURL=../../gcm-example-commonui-desktop/commonui.html&amp;gcmGameName="+gameName+"&amp;gameName="+gameName+"&amp;coreCookie="+cookie+"&amp;lang="+lang+"</GameUrl>";

    response = response + "</GameLaunchResponse>";

    if(isDesktop) {
    	Launcher.handleLaunchResponse(response);  
    } else {
    	Launcher.handleMobileLaunchResponse(response);  
    }

  };

// NEW FUNCTION SUPPLIED BY CORE TO ALLOW GAMES TO LOAD WITHOUT INDIVIDUAL SETTINGS FILES
  
  /**
   * @private
   * @param {string} name, the string to be searched 
   * @param {string} search, the string to be searched in
   * */
  Launcher.getSearchParameterByName = function(name, search) {

    if (typeof (name) !== 'string') {
      throw new Error(
        'getSearchParameterByName: Invalid argument name - not a string');
    }
    if (typeof (search) !== 'string') {
      throw new Error(
        'getSearchParameterByName: Invalid argument search - not a string');
    }

    /** @type {RegExp} */
    var pattern;
    /** @type {Array} */
    var match;
    pattern = new RegExp('[?&]' + name + '=([^&]*)');
    match = pattern.exec(search);

    if (match && match.length > 1) {      
      return decodeURIComponent(match[1].replace(/\+/g, ' '));
    } else {
      return null;
    }

  };

  /**
   * @private
   * this function will convert the gcm parameters and create an easily accessible object
   * @param {string} gcmParams gcm parameter string
   * @return {Object} gcm parameters object
   * */
  Launcher.getGCMParams = function(gcmParams) {

    var gcmParamsObject = {};
    if (gcmParams != null) {
      var extractedGCMParams = decodeURIComponent(gcmParams).split('|');
      var i = 0;
      for (i = 0; i < extractedGCMParams.length; i++) {
        var gcmParameter = extractedGCMParams[i].split('=');
        var gcmParameterKey = gcmParameter[0];
        gcmParameterKey = gcmParameterKey.replace('gcm', '');
        gcmParameterKey = gcmParameterKey.charAt(0) + gcmParameterKey.slice(1);
        gcmParamsObject[gcmParameterKey] = gcmParameter[1];
      }
    }
    return gcmParamsObject;
  };

/**
   * @private
   * this function will get a parameters object and append the properties to a url
   * @param {String} url, base url before to add parameters
   * @param {Object} params, parameters to be added   
   * */
  Launcher.addParametersToUrl = function(url, params) {

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
   * @private
   * this function is the handler function for the ajax request to the gamelaunch web service for mobile games
   * @param xmlResponse, the xml response returned from the ajax request
   * */
  Launcher.handleMobileLaunchResponse = function(xmlResponse) {

    if ( window.DOMParser ) { // Standard
        var xmlParser = new DOMParser();
        var xmlData = xmlParser.parseFromString( xmlResponse , "text/xml" );
    } else { // IE
        var xmlData = new ActiveXObject( "Microsoft.XMLDOM" );
        xmlData.async = "false";
        xmlData.loadXML( xmlResponse );
    }

    var gameLaunchURL = xmlData.getElementsByTagName('GameUrl')[0].childNodes[0].nodeValue;    
    var urlMethodNode = xmlData.getElementsByTagName('GameUrlMethod')[0];    

    if(urlMethodNode && urlMethodNode.childNodes[0].nodeValue == 'POST')
    {
      //extract url post params
      var params = {};
      var postDataNode = xmlData.getElementsByTagName('GamePostData')[0];
      if(postDataNode)
      {
        var paramNodeList = postDataNode.getElementsByTagName('Param');
        for(var i=0; i<paramNodeList.length; ++i)
        {
          params[paramNodeList[i].getAttribute('name')] = paramNodeList[i].childNodes[0].nodeValue;
        }
      }

      post_to_url(gameLaunchURL, params);
    }
    else
    {
      //Redirect to the game URL returned from the gameLaunch web service response
      top.window.location = gameLaunchURL;
      //return launchURL;
    }

  }

  /**
   * @private
   * this function will convert all params into POST param and submit to target URL.
   * */
  function post_to_url(path, params) {
    var method = "post"; // Set method to get by default, if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
      if(params.hasOwnProperty(key)) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  }

  /**
   * @private
   * this function is the handler function for the ajax request to the gamelaunch web service
   * @param xmlResponse, the xml response returned from the ajax request
   * */
  Launcher.handleLaunchResponse = function(xmlResponse) {

    if ( window.DOMParser ) { // Standard
        var xmlParser = new DOMParser();
        var xmlData = xmlParser.parseFromString( xmlResponse , "text/xml" );
    } else { // IE
        var xmlData = new ActiveXObject( "Microsoft.XMLDOM" );
        xmlData.async = "false";
        xmlData.loadXML( xmlResponse );
    }

    var gameLaunchURL = xmlData.getElementsByTagName('GameUrl')[0].firstChild.wholeText;    
    var gcmParams = Launcher.getSearchParameterByName('gcmParams', gameLaunchURL);
    var gcmParamsObject = Launcher.getGCMParams(gcmParams);

    if (xmlData.getElementsByTagName('CommonUIURL')[0]) {
        var commonUIUrl = xmlData.getElementsByTagName('CommonUIURL')[0].firstChild.wholeText;    
    } else {
        var commonUIUrl = gcmParamsObject['commonUIURL'].slice(0, gcmParamsObject['commonUIURL'].length);
    }
    
    var reqParams = {
      'gameName': pageParams["gameName"],
      'playMode': pageParams["playMode"],
      'channel': pageParams["channel"]
    };

    var commonUIUrlParams = Launcher.addParametersToUrl(commonUIUrl, reqParams);

    document.getElementById("commonUIIFrame").onload = function() {      

        window.frames["commonUIFrame"]["commonUI"]["init"](goog.getObjectByName('com.openbet.gcm'));      
        Launcher.loadGame(xmlData);  
     
    }

    if(window.attachEvent){
      document.getElementById("commonUIIFrame").attachEvent('onload', function() {  

        window.frames["commonUIFrame"]["commonUI"]["init"](goog.getObjectByName('com.openbet.gcm'));
        Launcher.loadGame(xmlData);      

      });   
    }

    document.getElementById("commonUIIFrame").src = commonUIUrlParams;
    
  };

  /**
   * @private
   * this function will load the game to the iframe once the commonUi is initialized   
   * @param xmlData, parsed xml response from launch WS
   * */
  Launcher.loadGame = function(xmlData) {

    var gameLaunchURL = xmlData.getElementsByTagName('GameUrl')[0].childNodes[0].nodeValue;    
    var urlMethodNode = xmlData.getElementsByTagName('GameUrlMethod')[0];

    if(gcmCore.clientType === "flash") {
        gcmCore.gameReady();              
    }

    if(urlMethodNode && urlMethodNode.childNodes[0].nodeValue == 'POST')
    {
      //extract url post params
      
      var postDataNode = xmlData.getElementsByTagName('GamePostData')[0];
      if(postDataNode)
      {
        var paramNodeList = postDataNode.getElementsByTagName('Param');
        for(var i=0; i<paramNodeList.length; ++i)
        {
          gameParams[paramNodeList[i].getAttribute('name')] = paramNodeList[i].childNodes[0] ? paramNodeList[i].childNodes[0].nodeValue : '';
        }
      }
      Launcher.post_to_url(gameLaunchURL, gameParams);
    }
    else
    {
      document.getElementById("gameIFrame").src = decodeURIComponent(gameLaunchURL);
    }

  };

  /**
   * @private
   * this function will convert all params into POST param and submit to target URL.
   * @param {string} path, the path to submit the link of the form
   * @param {Object} params, the parameters object to be posted   
   * */
  Launcher.post_to_url = function(path, params) {
    var method = "post"; // Set method to get by default, if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    // sets the target to game frame to load the RGI game
    form.setAttribute("target", "gameFrame");

    for(var key in params) {
      if(params.hasOwnProperty(key)) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  };

  /*
   * @private
   * Create header params from selected values.
   * @param {String} _playMode, real, freespin or demo
   * @return {String} header params
   */
  Launcher.createHeaderParams = function(_playMode) {
    var token = '';
    var parts = document.cookie.split('casino_login=');
    
    if (parts.length == 2){
      token = parts.pop().split(";").shift();
    }
      
    var tokenParam = '';

    if(token && ( _playMode == 'real' || _playMode == 'freespin' || _playMode == 'demo' )) {
      tokenParam = 'loginToken='+encodeURIComponent(token);
    }
	
	var parameters;
	
	// If there's a lang parameter within pageParam it will be added by the for loop
	if (pageParams.hasOwnProperty("lang")) {
		parameters = tokenParam;
	}
	else {
		if (tokenParam !== '') {
			tokenParam = '&' + tokenParam;
		}
		parameters = 'lang=en'+ tokenParam;
	}
	
    for (var property in pageParams) {
		if (pageParams.hasOwnProperty(property)) {
			// lang parameter needs to be lowercased
			if (property === "lang") {
				pageParams[property] = pageParams[property].toLowerCase();
			}
			// if no lang in pageParams and tokenParam still empty parameters will be empty for the first elmt of pageParam
			if (parameters === '') {
				parameters = property + '=' + pageParams[property];
			}
			else {
				parameters = parameters + '&' + property + '=' + pageParams[property];
			}
		}
	}	
	
	return parameters;
  };

  /*
   * @private   
   * Create http request object.
   * @return {XMLHttpRequest or ActiveXObject} for IE5,6 compatibility.
   */
  Launcher.createHttpRequestObj = function() {
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
      return new XMLHttpRequest();
    }
    else {// code for IE6, IE5
      return new ActiveXObject('Microsoft.XMLHTTP');
    }
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
 * @param {string} name request parameter name.
 * @param {string} newValue thenew value for request parameter.
 * @param {string} url (this can be obtained from window.location.href).
 * @return {?string} The new url with updated request parameter.
 */
UrlUtil.updateSearchParameterByName = function(name, newValue, url) {
  var originalValue = UrlUtil.getSearchParameterByName(name, url);
  var newURL = url;
  if (originalValue)
  {
    newURL = url.replace(name + '=' + originalValue, name + '=' + newValue);
  }
  return newURL;
};

/**
 * This function returns a object of gcm params. <br>
 * For getting the gcm parameter's values, first gcmParams parameter's value will be
 * fetched from URL using UrlUtil.getSearchParameterByName function. The example of gcmParams variable
 * is detailed below : <br>
 * gcmParams=gcmPlayMode%3Dreal|   <br>
 *           gcmChannel%3DI| <br>
 *           gcmGameName%3Dgcm-example-game| <br>
 *           gcmCommonUIURL%3D%2Fgcm-tests%2Fgcm-example-commonui%2Fcommonui.html   <br>
 * The returned gcmParams variable is passed in this function to extract gcm parameters and its values.  <br>
 * All the extracted items will stored in array object as gcmParamsObject.
 * @param {string} gcmParams gcmParams value as string.
 * @return {Object} gcmParamsObject Object contains decoded gcm Parameters and its values. <br>
 *                                  the indices of values are removed 'gcm' prefix. <br>
 *                                  e.g. 'gcmGameName' will become 'gameName' as index in the returned object.
 */
UrlUtil.getGCMParams = function(gcmParams) {
  var gcmParamsObject = {};
  if (gcmParams != null) {
    var extractedGCMParams = decodeURIComponent(gcmParams).split('|');
    var i = 0;
    for (i = 0; i < extractedGCMParams.length; i++) {
      var gcmParameter = extractedGCMParams[i].split('=');
      var gcmParameterKey = gcmParameter[0];
      gcmParameterKey = gcmParameterKey.replace('gcm', '');
      gcmParameterKey = gcmParameterKey.charAt(0).toLowerCase() + gcmParameterKey.slice(1);
      gcmParamsObject[gcmParameterKey] = gcmParameter[1];
    }
  }
  return gcmParamsObject;
};


/**
 * This function updates the parameter value in gcmParams request parameter
 * @param {string} name request parameter name.
 * @param {string} newValue the new value for request parameter.
 * @param {string} url (this can be obtained from window.location.href).
 * @return {?string} The new url with updated request parameter.
 * This function will be called only when gcmParams request parameter needs
 * to be updated.
 * For example changing the gcmPlayMode from "demo" to "real.
 */
UrlUtil.updateGCMParams = function(name, newValue, url) {
  var gcmParams = '';
  var originalValue = '';

  var gcmParamsObject = new Array();
  var gcmParams = UrlUtil.getSearchParameterByName('gcmParams', url);
  if (gcmParams != null) {
    gcmParamsObject = UrlUtil.getGCMParams(gcmParams);
    var gcmParameterKey = name.replace('gcm', '');
    gcmParameterKey = gcmParameterKey.charAt(0).toLowerCase() + gcmParameterKey.slice(1);
    originalValue = gcmParamsObject[gcmParameterKey];
  }
  var newURL = url;
  if (originalValue)
  {
    newURL = url.replace(name + '%3D' + originalValue, name + '%3D' + newValue);
  }
  return newURL;
};

/**
 * This function is used to expose gcm param values to commonUI/Game. <br>
 * As soon as gcm.js is loaded during game loading phase, commonUI or Game can call this function to get gameplay information
 * such playMode, gameName, channel etc without having to wait for configReady() call from GCM.
 * CommonUI no longer needs to read this information from url passed by Game and Game no longer has to worry about passing
 * these params to CommonUI.
 * Currently this function provides all the parameters available in gcmParams object. This can be extended to included
 * any other url params.
 * gcmParams=gcmPlayMode%3Dreal|   <br>
 *           gcmChannel%3DI| <br>
 *           gcmGameName%3Dgcm-example-game| <br>
 *           gcmCommonUIURL%3D%2Fgcm-tests%2Fgcm-example-commonui%2Fcommonui.html   <br>
 * @return {Object} urlParamsObject Object contains params like playMode, gameName etc
 */
UrlUtil.getUrlParams = function() {

  var urlParamsObject = {};
  var gcmParams = UrlUtil.getSearchParameterByName('gcmParams',window.parent.location.href);
  if (gcmParams) {
    urlParamsObject = UrlUtil.getGCMParams(gcmParams);
  } else {
    // In case we do not have gcmParams in game window url, we should search for the params in commonUI window url.
    // These data items are added to commonUI url from OpenBet gcmBridge.
    urlParamsObject['gameName'] = UrlUtil.getSearchParameterByName('gameName', window.location.search);
    urlParamsObject['playMode'] = UrlUtil.getSearchParameterByName('playMode', window.location.search);
    urlParamsObject['channel'] = UrlUtil.getSearchParameterByName('channel', window.location.search);
  }
  return urlParamsObject;
}

/**
 * checks if the uri paramater is a relative URI
 * This function protects us from
 * the potential security risk of rendering absolute url content that has been
 * specified as a request param
 * Note that not all relative URIs are allowed, but we do reject absolute URIs and
 * network-path references.
 * @param {string} url the URL to check.
 * @return {boolean} is this a relative url.
 */
UrlUtil.checkURIIsRelative = function(url) {

  if (typeof (url) !== 'string') {
    throw new Error(
        'UrlUtil.checkURIIsRelative: Invalid argument url - not a string');
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





goog.exportSymbol('com.openbet.gcm.urlutil.getSearchParameterByName', UrlUtil.getSearchParameterByName);
goog.exportSymbol('com.openbet.gcm.urlutil.updateSearchParameterByName', UrlUtil.updateSearchParameterByName);
goog.exportSymbol('com.openbet.gcm.urlutil.getGCMParams', UrlUtil.getGCMParams);
goog.exportSymbol('com.openbet.gcm.urlutil.updateGCMParams', UrlUtil.updateGCMParams);
goog.exportSymbol('com.openbet.gcm.urlutil.getUrlParams', UrlUtil.getUrlParams);
goog.exportSymbol('com.openbet.gcm.urlutil.addParametersToUrl', UrlUtil.addParametersToUrl);
goog.exportSymbol('com.openbet.gcm.urlutil.checkURIIsRelative', UrlUtil.checkURIIsRelative);
/**
 * @fileoverview
 * This class handles the freespin token summary data which is loaded from freespin token webservice.
 *
 * @author hnair
 * Date: 18/06/14
 **/

goog.provide('gcm.freespin.FreespinTokenSummary');
goog.require('gcm.net.ws');

/**
 * This class is managed by gcm and aims to get freespin token summary data from token web service.
 *
 * @param {number} freespinTokenId the unique id of a freespin token.
 * @param {Function} FreespinTokenSummaryCallback Function called when freespin token summary data
 * is received from token web service.
 * @param {string} webServiceUrlBase the base url for the token summary web service, e.g. /gcm-ws/.
 * @param {?function(string, string, string, string, Object=)=} errorHandler Error handling function.
 * @constructor
 */
function FreespinTokenSummary(freespinTokenId, FreespinTokenSummaryCallback, webServiceUrlBase, errorHandler)
{
  this.freespinTokenId_ = freespinTokenId;
  this.FreespinTokenSummaryCallback_ = FreespinTokenSummaryCallback;
  this.webServiceUrlBase_ = webServiceUrlBase;
  this.ready_ = false;
  if (errorHandler)
   this.errorHandler_ = errorHandler;
  else
   this.errorHandler_ = null;
}

/**
 * This is called by gcmCore to retrieve the summary
 * data for a freespin token
 **/
FreespinTokenSummary.prototype.init = function() {
  this.getSummaryDataFromWs_();
};

/**
 * Makes a call to the token web service
 * Retrieves the summary data on the
 * spends made on the requested freespin token.
 *
 * Returns a XML response
 *
 * @private
 */
FreespinTokenSummary.prototype.getSummaryDataFromWs_ = function() {
  var url;
  url = this.webServiceUrlBase_ + '/freespin/summary/' + this.freespinTokenId_ + ".xml";
  gcm.net.ws.getXmlResponse(url, this, this.SummaryDataResponseHandler_, this.errorHandler_);
};

/**
 * Handle returning XML response from web service freespin summary web-service and
 * formats it into a freespin token summary object.
 * @private
 * @param {Document} xmlResponse The response in XML format.
 * */
FreespinTokenSummary.prototype.SummaryDataResponseHandler_ = function(xmlResponse)
{
  var freespinTokenSummaryObj = {};
  var freespinSummary = [];
  var errorCategory, errorSeverity, errorCode, errorMessage;
  var errorHandler = this.errorHandler_;
  try {
     this.ready_ = true;
     var freespinTokenId = xmlResponse.getElementsByTagName('freeSpinTokenSummary')[0].getAttribute('id');
     var ccyCode = xmlResponse.getElementsByTagName('freeSpinTokenSummary')[0].getAttribute('ccy_code');
     var freespinSummaryNodes = xmlResponse.getElementsByTagName('freeSpinSummary');
     if ( freespinSummaryNodes.length > 0) {
       for (var i = 0; i < freespinSummaryNodes.length; i++) {
         var gameName = freespinSummaryNodes[i].getAttribute('gameName');
         var spinsRedeemed = freespinSummaryNodes[i].getAttribute('spinsRedeemed');
         var winnings = freespinSummaryNodes[i].getAttribute('winnings');
         freespinSummary[i] = {
           'gameName' : gameName,
           'spins' : spinsRedeemed,
           'winnings' : winnings
           };
       }
       freespinTokenSummaryObj = { 'tokenID': freespinTokenId, 'ccyCode': ccyCode,
       'freespinSummary': freespinSummary};
     } else {
       errorCode = 'FREESPIN_SUMMARY_DATA_NOT_FOUND';
       errorMessage = 'Could not find freespin token summary details for the requested token';
     }
   } catch (e) {
     errorMessage = e.message;
     errorCode = 'UNKNOWN';
  }
  if (errorCode) {
    if (errorHandler) {
      // compare error code to list of known errors
      // figure out the error category
      var errorCategory = gcm.error.getErrorCategory(errorCode);
      // figure out the error type
      var errorSeverity = gcm.error.getErrorSeverity(errorCode);

      errorHandler.call(this, errorCategory, errorSeverity, errorCode, errorMessage);
    }
    throw new Error('An unknown error at occurred at:' +
    'com.openbet.gcm.freespin.FreespinTokenSummary.SummaryDataResponseHandler_' + '\nError Code: ' + errorCode
    + '\nError Message: ' + errorMessage);
  }
  this.FreespinTokenSummaryCallback_(freespinTokenSummaryObj);
};
goog.provide('gcm');
goog.require('gcm.Launcher');
goog.require('gcm.Account');
goog.require('gcm.ErrorHandler');
goog.require('gcm.Promotions');
goog.require('gcm.activitylog.GCMGameLog');
goog.require('gcm.activitylog.GameActivityLogger');
goog.require('gcm.config.AccountConfig');
goog.require('gcm.config.FreespinConfig');
goog.require('gcm.config.GCMConfig');
goog.require('gcm.config.GameConfig');
goog.require('gcm.error');
goog.require('gcm.errormap');
goog.require('gcm.faux.FauxGCMGame');
goog.require('gcm.freespin.FreespinTokenSummary');
goog.require('gcm.gamecontrol.GameInfo');
goog.require('gcm.gamecontrol.GameStateController');
goog.require('gcm.gamelist.GameList');
goog.require('gcm.liveserv.BPushHandler');
goog.require('gcm.liveserv.LiveServ');
goog.require('gcm.notification.NotificationHandler');
goog.require('gcm.realitycheck.AckRealityCheck');
goog.require('gcm.realitycheck.RealityCheckDetails');
goog.require('gcm.session.GameSession');
goog.require('gcm.urlutil');
goog.require('gcm.validate');
goog.require('gcm.xmlutil');
goog.require('goog.structs.Map');
goog.require('gcm.currencyformat');

/** *
 *
 * gcmCore (<b>com.openbet.gcm</b>) is the main main gcm interface.
 * (C) 2012 OpenBet Technologies Ltd. All rights reserved.<br>
 * <p>
 * gcmCore is the main GCM interface. This is exposed within the commonUI window
 * as openbet.gcm. When gcm is referred to elsewhere it will be referring to
 * this API.
 * </p>
 * <h1>Game Integration:</h1>
 * <p>
 * In order to integrate with GCM, the game must supply a game Javascript
 * object. Please see the jsDocs for the example game for details and examples
 * of the methods which must be implemented. Also please note the methods on gcm
 * that the game calls.
 * </p>
 * <h1>CommonUI Integration:</h1>
 * <p>
 * In order to integrate with GCM, the commonUI must supply a commonUI Javascript
 * object. Please see the jsDocs for the example commonUI for details and
 * examples of the methods which must be implemented. Also please note the
 * methods on gcm that the commonUI calls.
 * </p>
 *
 * @author asugar
 * @namespace
 */
var gcmCore = {};

/**
 * @type {Object}
 * @private
 */
gcmCore.gcmBridge_;

/**
 * @type {Object}
 * @private
 */
gcmCore.gameWindow_;

/**
 * @type {Object}
 * @private
 */
gcmCore.commonUI_;

/**
 * @type {Object}
 * @private
 */
gcmCore.game_;

/**
 * @type {boolean}
 * @private
 */
gcmCore.isGameReady_ = false;

/**
 * @type {GameConfig}
 * @private
 */
gcmCore.gameConfig_ = null;

/**
 * @type {GameSession}
 * @private
 */
gcmCore.gameSession_ = null;

/**
 * @type {LiveServ}
 * @private
 */
gcmCore.liveServ_ = null;

/**
 * @type {goog.structs.Map.<string, MessageHandler>}
 * @private
 */
gcmCore.liveServHandlers_ = new goog.structs.Map();

/**
 * @type {GCMConfig}
 * @private
 */
gcmCore.gcmConfig_ = null;

/**
 * @type {AccountConfig}
 * @private
 */
gcmCore.accountConfig_ = null;

/**
 * @type {GCMGameLog}
 * @private
 */
gcmCore.gameLog_ = null;

/**
 * @type {GameActivityLogger}
 * @private
 */
gcmCore.logger_ = new GameActivityLogger(false);
/**
 * @type {ErrorHandler}
 * @private
 */
gcmCore.errorHandler_ = new ErrorHandler();

/**
 * @type {Account}
 * @private
 */
gcmCore.account_ = new Account();

/**
 * @type {GameStateController}
 * @private
 */
gcmCore.gameStateController_ = new GameStateController();

/**
 * @type {NotificationHandler}
 * @private
 */
gcmCore.notificationHandler_ = new NotificationHandler();

/**
 * @type {string}
 * @private
 */
gcmCore.gcmWebServiceBaseUrl_;

/**
 * @type {FreespinConfig}
 * @private
 */
gcmCore.freespinConfig_ = null;

/**
 * @type {Object}
 * @private
 */
gcmCore.gcmParamsObject_ = {};

/**
 * @type {Object}
 * @private
 */
gcmCore.footerWindow_;

/**
 * @type {Object}
 * @private
 */
gcmCore.sidebarWindow_;

/**
 * @type {string}
 * @private
 */
gcmCore.device;

/**
 * @type {string}
 * @private
 */
gcmCore.version;

/**
 * @type {string}
 * @private
 */
gcmCore.clientType;

/**
 * @type {Object}
 * @private
 */
gcmCore.bPushHandler_;

/**
 * The commonUI should call this method when it is loaded.<br>
 * The commonUI should pass in an object on which all the commonUI methods can be
 * invoked<br>
 * If game loading finished before commonUI ready, this function will call
 * commonUI.gameReady() to continue game sequence.
 * @param {Object} commonUI a commonUI object.
 */
gcmCore.commonUIReady = function(commonUI) {

  var consCheck = gcm.validate.isCommonUI(commonUI);
  if (consCheck.length > 0) {
    throw new Error('gcm.commonUIReady: CommonUI Missing API Methods:' +
          consCheck.toString());
  }

  var consCheck2 = gcm.validate.isCommonUIV2(commonUI);
  var commonUIV2Compatible = (consCheck2.length === 0);

  gcmCore.commonUI_ = commonUI;

  //set commonUI for account instance
  gcmCore.account_.setCommonUI(gcmCore.commonUI_);

  //set commonUI for game information module
  GameInfo.setCommonUI(gcmCore.commonUI_);

  //set commonUI for gcm notification handler  
  gcmCore.notificationHandler_.init(gcmCore.commonUI_, commonUIV2Compatible);
  
  //init GameStateController
  gcmCore.gameStateController_.init(gcmCore.commonUI_);

  if (gcmCore.gameConfig_.isReady()) {
    gcmCore.commonUI_.configReady();
  }

  //if game ready before commonUI, inform commonUI
  if (gcmCore.isGameReady_) {
    gcmCore.commonUI_.gameReady();
  }
    
};

/**
 * called by GAME when its config is ready (desktop only)
 * @public
 */
gcmCore.gameConfigReady = function() {
    gcmCore.configReady_();
};

/**
 * called by common UI 
 * @public
 */
gcmCore.getClientType = function() {
  return gcmCore.clientType;
}

/**
 * called when GAME config is ready
 * @private
 */
gcmCore.configReady_ = function() {
  if (typeof gcmCore.commonUI_ !== 'undefined') {
    //commonUI is already loaded we can tell it about the config
    gcmCore.commonUI_.configReady();
  }
  if (typeof gcmCore.game_ !== 'undefined') {
    //game is already loaded we can tell it about the config
    gcmCore.game_.configReady();
  }
};


gcmCore.miniInit = function(gcmWebServiceBaseUrl) {

  //Store the web service base url
  gcmCore.commonUI_ = goog.getObjectByName('commonUI', window); ;
  gcmCore.setGame(new FauxGCMGame(true));
  gcmCore.gcmWebServiceBaseUrl_ = gcmWebServiceBaseUrl;
  gcmCore.notificationHandler_.init(gcmCore.commonUI_, false);

}

/**
 * The commonUI should call init on gcm as soon as possible.
 * @param {Document} gameWindow reference to game window.
 * @param {Document} commonUIWindow reference to commonUI window.
 * @param {string} gcmWebServiceBaseUrl web service url.
 */

gcmCore.init = function(gameWindow, commonUIWindow, gcmWebServiceBaseUrl, sidebarWindow, footerWindow, pageParams, miniGame) {

  if(miniGame) {
    gcmCore.miniInit(gcmWebServiceBaseUrl);
    return;
  }
  
  if(pageParams){
    gcmCore.device = pageParams["device"];
    gcmCore.clientType = pageParams["clientType"];  
  }

  if (!goog.isDefAndNotNull(gameWindow)) {
    throw new Error('gcm.init: Please specify gameWindow argument');
  }
  if (!goog.isDefAndNotNull(commonUIWindow)) {
    throw new Error('gcm.init: Please specify commonUIWindow argument');
  }
  if (!goog.isDefAndNotNull(gcmWebServiceBaseUrl)) {
    throw new Error('gcm.init: Please specify gcmWebServiceBaseUrl argument');
  }

  //Store the web service base url
  gcmCore.gcmWebServiceBaseUrl_ = gcmWebServiceBaseUrl;

  //set game window to error handler
  gcmCore.gameWindow_ = gameWindow;

  //set gcmBridge, by default use bridge on game page
  //if no then use custom bridge on console

 if(!gcmCore.isDesktop()){

    gcmCore.gcmBridge_ = goog.getObjectByName('com.openbet.gcmBridge', gameWindow);
    if (!gcmCore.gcmBridge_) {
      gcmCore.gcmBridge_ = goog.getObjectByName('gcmBridge', commonUIWindow);
    }
    if (!gcmCore.gcmBridge_) {
      throw Error('gcm.init() gcmBridge not found on either game window or console window.');
    }
    if (!goog.isDefAndNotNull(gcmCore.gcmBridge_)) {
      throw new Error('Cannot find com.openbet.gcmBridge on gameWindow');
    }
    var gcmParams = UrlUtil.getSearchParameterByName('gcmParams', gameWindow.location.href);
    if (gcmParams) {
      gcmCore.gcmParamsObject_ = UrlUtil.getGCMParams(gcmParams);
    } else {
      // In case we do not have gcmParams in game window url, we need to use gcmBridge to get the params.
      gcmCore.gcmParamsObject_['gameName'] = gcmCore.gcmBridge_.getGameName();
      gcmCore.gcmParamsObject_['playMode'] = gcmCore.gcmBridge_.getPlayMode();
      gcmCore.gcmParamsObject_['channel'] = gcmCore.gcmBridge_.getChannel();
    }
  }



  //set sidebar window to error handler
  gcmCore.sidebarWindow_ = sidebarWindow;

  //set footer window to error handler
  gcmCore.footerWindow_ = footerWindow; 

  //we will start the process of retrieving config now
  //commonUI and game can continue to communicate with gcm before config
  //is loaded. However until we have called configReady() on game and commonUI
  //they are not allowed to ask for the config
  gcmCore.gameConfig_ = new GameConfig(gcmWebServiceBaseUrl);


  if(gcmCore.isDesktop()){
    //we will get the game url and parameters
    var arr = window.location.search.substr(1).split("&");
    var len = arr.length;
    var lobbyParams = {};
    
    for (var i = 0; i < len; i++) {

      var elem = arr[i].split("="); 
      lobbyParams[elem[0]] = elem[1];

    } 

    gcmCore.gameConfig_.setGameName(lobbyParams["gameName"]);
    gcmCore.gameConfig_.setPlayMode(lobbyParams["playMode"]);
    gcmCore.gameConfig_.setChannel(lobbyParams["channel"]);            

  } else {

    gcmCore.gameConfig_.setGameName(gcmCore.gcmParamsObject_['gameName']);
    gcmCore.gameConfig_.setPlayMode(gcmCore.gcmParamsObject_['playMode']);
    gcmCore.gameConfig_.setChannel(gcmCore.gcmParamsObject_['channel']);

  }

  gcmCore.gameConfig_.addEventListener(GCMEvent.COMPLETE, gcmCore.configResponseReceived_);
  //send gcm config request
  gcmCore.gameConfig_.init();

  //init gcm config web service
  gcmCore.gcmConfig_ = new GCMConfig(gcmWebServiceBaseUrl);
  gcmCore.gcmConfig_.addEventListener(GCMEvent.COMPLETE, gcmCore.configResponseReceived_);

  //init account config web service
  gcmCore.accountConfig_ = new AccountConfig(gcmWebServiceBaseUrl);
  gcmCore.accountConfig_.addEventListener(GCMEvent.COMPLETE, gcmCore.configResponseReceived_);
  
  if(gcmCore.isDesktop()){
    gcmCore.accountConfig_.init(lobbyParams["playMode"]);
  } else {
    gcmCore.accountConfig_.init(gcmCore.gcmParamsObject_['playMode']);
  }

  //init game session web service
  gcmCore.gameSession_ = new GameSession(gcmWebServiceBaseUrl);

  //init liveserv service
  gcmCore.liveServ_ = new LiveServ(gcmCore.gcmWebServiceBaseUrl_, gcmCore.gameWindow_);

  //init game log module  
  if(gcmCore.isDesktop()){
    gcmCore.gameLog_ = new GCMGameLog(gcmWebServiceBaseUrl, lobbyParams["gameName"]);    
    // if the game is a desktop game, this is the point we launch the game
    Launcher.launchGameWS(pageParams, true);
  } else {
    gcmCore.gameLog_ = new GCMGameLog(gcmWebServiceBaseUrl, gcmCore.gcmParamsObject_['gameName']);
  }
  //init fauxGCMGame
  if(gcmCore.isFlash()) {
    gcmCore.setGame(new FauxGCMGame(false));
  }
};

/**
 * This is the event listener function for gcm config request, game config request and account config request.
 * This listener makes sure all configs returned before notifying game and commonUI that GCM config is ready.
 * @param {GCMEvent} e GCMEvent triggered.
 * @private
 */
gcmCore.configResponseReceived_ = function(e) {
    if ((e.target instanceof GCMConfig)) {
        //Continue with gcm ready
        //make gcm available to the game through the gcmBridge
        var gcm = window['com']['openbet']['gcm'];
        if (!goog.isDefAndNotNull(gcm)) {
              throw new Error('Cannot find com.openbet.gcm on commonUIWindow');
        }
        if(!gcmCore.isDesktop()){
          gcmCore.gcmBridge_.gcmReady(gcm);
        }
    } else if ((e.target instanceof GameConfig)) {
      if (gcmCore.gameConfig_.isFreespinPlayEnabled() && gcmCore.gameConfig_.getPlayMode() === GameConfig.PlayMode.FREESPIN) {
        gcmCore.getFreespinConfig_('');
      }
    }
    if (gcmCore.gcmConfig_.isReady() && gcmCore.gameConfig_.isReady() && gcmCore.accountConfig_.isReady()) {
    //do GCM components setup based on config
    gcmCore.gcmConfigReady_();

      if (! gcmCore.account_.fundMode_) {
        //notify game and commonUI that config is ready
        gcmCore.configReady_();
      } else if ('FREESPIN' == gcmCore.account_.fundMode_) {
        if (gcmCore.freespinConfig_.isReady()) {
          //notify game and commonUI that config is ready
          gcmCore.configReady_();
        }
      }
    }
};

/**
 * @private
 */
gcmCore.gcmConfigReady_ = function() {
  gcmCore.gameSession_.run(gcmCore.gcmConfig_);
  gcmCore.gameLog_.run(gcmCore.gcmConfig_);
  gcmCore.logger_ = new GameActivityLogger(gcmCore.isDesktop());
  gcmCore.logger_.run(gcmCore.gameLog_);
  GameList.setEnabled(gcmCore.gcmConfig_.checkConfigEnabled('gamelist'));
  if (gcmCore.gameConfig_.getPlayMode() === GameConfig.PlayMode.REAL) {
    //init promotions and bpush. Promotions can be set to global scope if required elsewhere.
    var promotions = new Promotions(gcmCore.gcmWebServiceBaseUrl_, gcmCore.gameConfig_.getGameName(), gcmCore.account_);
    gcmCore.bPushHandler_ = new BPushHandler(gcmCore.gcmWebServiceBaseUrl_, promotions);
    gcmCore.liveServHandlers_.set(gcmCore.bPushHandler_.getChannelType(), gcmCore.bPushHandler_);
  }
};


/**
 * This function is called only when a game is launched in freespin mode
 * and the game is freespin-enabled(determined from gameConfig response).
 * @private
 * @param {string} tokenId (optional)
 */
gcmCore.getFreespinConfig_ = function(tokenId) {

  if (tokenId != '') {
  var freespinConfigParam = 'tokenId/'+ tokenId;
  } else {
  var freespinConfigParam = 'gameName/'+ gcmCore.gameConfig_.getGameName();
  }
  if (gcmCore.gcmParamsObject_) {
    if (gcmCore.gcmParamsObject_['channel']) {
        freespinConfigParam = freespinConfigParam + "?channel=" + gcmCore.gcmParamsObject_['channel'];
    }
    if (gcmCore.gcmParamsObject_['fundModeID']) {
      freespinConfigParam = 'tokenId/' + gcmCore.gcmParamsObject_['fundModeID'];
    }
  }
  gcmCore.account_.setFundMode(GameConfig.PlayMode.FREESPIN.toUpperCase());
  gcmCore.freespinConfig_ = new FreespinConfig(gcmCore.gcmWebServiceBaseUrl_, freespinConfigParam, gcmCore.handleError);
  gcmCore.freespinConfig_.addEventListener(GCMEvent.COMPLETE, gcmCore.configResponseReceived_);
  gcmCore.freespinConfig_.init();
};


/**
 * After the commonUI has shown the game it should call this method to say it has
 * done so, so that the liveserv init notifications can come in. Once the callback from
 * liveserv is received, game ui can be enabled.
 */
gcmCore.gameRevealed = function() {
  gcmCore.liveServ_.run(gcmCore.gcmConfig_, gcmCore.liveServHandlers_, gcmCore.liveServReady_);
};

/**
 * After the liverserv init is complete, tell game to enable UI.
 *
 * @private
 */
gcmCore.liveServReady_ = function() {
  // tell the game that it can enable it's UI
  if (gcmCore.game_) {
    gcmCore.game_.gameRevealed();
  }
};

/**
 * The game should call this method when it is loaded and initialized.<br>
 *
 */
gcmCore.gameReady = function() {
  gcmCore.isGameReady_ = true;

  if (gcmCore.commonUI_) {
    gcmCore.commonUI_.gameReady();
  }

};

/**
 * gcmBridge will call this method from gcmReady(),
 * passing in the game object
 * supplied by the game on gcmBridge init()
 * @param {Object} game a game object.
 */
gcmCore.setGame = function(game) {
  var gameCheck = gcm.validate.isGame(game);
  if (gameCheck.length > 0) {
    throw new Error('gcm.gameReady: Game Missing API Methods:' +
                    gameCheck.toString());
  }

  gcmCore.game_ = game;

  //set game for account instance
  gcmCore.account_.setGame(gcmCore.game_);

  //init GameInfor management module
  //according to gcm sequence diagram commonUI should be already
  //set to gcm by the time game gets set.
  GameInfo.setGame(gcmCore.game_);
};

/**
 * The game must call this each time the stake changes, even though not all
 * commonUI implementations will choose to display stake in the commonUI.
 * @param {number} stake numeric value.
 * @return {Object} the ccy format object of the stake value in the format:
 *        {display: 'Â£10.00', code:'GBP', value: 10.00 , currency_symbol: 'Â£',
 *        ccy_thousand_separator: ',', ccy_decimal_separator: '.'}.
 */
gcmCore.stakeUpdate = function(stake) {
  return gcmCore.account_.stakeUpdate(stake);
};

/**
 * The game must call this each time paid changes, even though not all commonUI
 * implementations will choose to display paid in the commonUI.
 * @param {number} paid numeric value.
 * @return {Object} the ccy format object of the paid value in the format:
 *        {display: 'Â£10.00', code:'GBP', value: 10.00 , currency_symbol: 'Â£',
 *        ccy_thousand_separator: ',', ccy_decimal_separator: '.'}.
 */
gcmCore.paidUpdate = function(paid) {
  return gcmCore.account_.paidUpdate(paid);
};

/**
 * The game should call this function with a balanceFudge parameter when it
 * wants to hide the winnings, then when the winnings have been revealed
 * in the game, game should call it again without the balanceFudge parameter
 * to display the actual balance.
 *
 * The commonUI is also able to call this function in order to update the balance
 * after a quick deposit.  The commonUI should use the calledFromCommonUI parameter
 * to show that this has happened, and so that GCM will call through to the game with
 * the update balance information.
 *
 * @param balances A map of balances with following format:  <br>
 * <code>
 *            {
 *                'CASH': {amount: 1000.00},
 *                'FREEBET': {amount: 2000.00},
 *                'FREESPIN': {amount: '100.00', count: 5}
 *            }
 * </code>
 * The above given balance object will contain a 'FREESPIN' balance only if game is freespin enabled and
 * launched in freespin mode.
 * For a game, the data should be taken
 * from Game Server response.  Note that there are utility functions available on GCM to convert from
 * FOG and RGI XML format for account and balance and convert to the required format for this method.
 *
 * Note that when called by a commonUI, the commonUI may want to update only the cash amount (it may not
 * have visibility of the freebet and other balance amounts).  The commonUI can pass a balances object to
 * this function, which only includes the 'CASH' amount - this is allowed, and in this case GCM will keep the
 * 'FREEBET' and other balance type amounts at their previous level - only the cash balance will be updated.
 *
 * @param {number=} balanceFudge (Optional) the numeric amount to decrement the displayed
 *          balance by until the game play is complete. This will usually be the
 *          game winnings, which have not yet been shown to the player in the
 *          game animation.<br>
 *          If this parameter is not provided, gcm will display the actual balance.
 * @param {boolean=} changedFromCommonUI (Optional) this should be set to true when this function is called
 *          by the commonUI.
 * @return {Object} formattedBalances a balances object containing ccy format objects
 *        for each balance type:
 *            {
 *                'CASH': {display: 'Â£10.00', code:'GBP', value: 10.00 ,
 *              currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.'},
 *                'FREEBET': {display: 'Â£10.00', code:'GBP', value: 10.00 ,
 *              currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.'},
 *                'FREESPIN': {display: 'Â£100.00', code:'GBP', value: 100.00 ,
 *              currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.', count: 5}
 *            }
 */
gcmCore.balancesUpdate = function(balances, balanceFudge, changedFromCommonUI) {
  return gcmCore.account_.balancesUpdate(balances, balanceFudge, changedFromCommonUI);
};


/**
 * This function is called by the flash games (via faux tpobar) which in turn
 * calls balancesUpdate with the same parameters the only differences is the balances
 * object is parsed to an object from json string. For details of the function see
 * documentation for balancesUpdate. 
 */
gcmCore.flashBalancesUpdate = function(balances, balanceFudge, changedFromCommonUI) {
  var parsedBalances = window.JSON.parse(balances);
  gcmCore.balancesUpdate(parsedBalances, balanceFudge, changedFromCommonUI);
};

/**
 * This function is called by a game at start-up phase, to set initial balance.
 * The below given balance object will contain a 'FREESPIN' balance only if game is freespin-enabled and
 * launched in freespin mode.
 * @param {Object} accountInfo <b>deprecated</b>: this parameter is not used.
 * @param {Array} balances A map of balances in this format:
 *         <pre>
 *           {
 *               'CASH': {amount: '1000.00'},
 *               'FREEBET': {amount: '2000.00'},
 *               'FREESPIN': {amount: '100.00', count: 5}
 *           }
 *         </pre>.
 *  @return {Object} formattedBalances A balances object containing ccy format objects
 *          for each balance type:
 *          <pre>
 *            {
 *                'CASH': {display: 'Â£10.00', code:'GBP', value: 10.00 ,
 *                         currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.'},
 *                'FREEBET': {display: 'Â£10.00', code:'GBP', value: 10.00 ,
 *                         currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.'},
 *                'FREESPIN': {display: 'Â£100.00', code:'GBP', value: 100.00 ,
 *                         currency_symbol: 'Â£', ccy_thousand_separator: ',', ccy_decimal_separator: '.', count: 5}
 *            }
 *          </pre>.
 **/
gcmCore.accountInit = function(accountInfo, balances)
{
  return gcmCore.account_.accountInit(balances);
};

/**
 * This API can be called by common UI to modify the height and width of common UI iframe.
 * @param {string} height new height of iframe in any css unit, e.g. '20%',
 *          '20px', '20em' are all valid.
 * @param {string} width (Optional) The new width of iframe, same format as height.
 * @param {string} offsetX Gap between top/bottom and start of the iframe.
 * @param {string} offsetY Gap between sides and start of the iframe.
 */
gcmCore.commonUIResize = function(height, width, offsetX, offsetY) {
  // for now we trust the commonUI to not ask for more window size during
  // game animation. The commonUI is told when game animation starts and ends
  if (!gcm.validate.isHeight(height)) {
    throw new Error('gcm.commonUIResize: Invalid height value ' + height);
  }
  if (width && !gcm.validate.isHeight(width))
  {
    throw new Error('gcm.commonUIResize: Invalid width value ' + width);
  }

 if(gcmCore.isDesktop()){
    gcmCore.commonUIResizeForDesktop(height, width, offsetX, offsetY);      
  }  else {    
    gcmCore.gcmBridge_.commonUIResize(height, width, offsetX, offsetY);  
  }


};

/**
 * This API can be called by DESKTOP common UI to modify the height and width of desktop common UI iframe.
 * @param {string} height new height of iframe in any css unit, e.g. '20%',
 *          '20px', '20em' are all valid.
 * @param {string} width (Optional) The new width of iframe, same format as height.
 * @param {string} offsetX Gap between top/bottom and start of the iframe.
 * @param {string} offsetY Gap between sides and start of the iframe.
 */
gcmCore.commonUIResizeForDesktop = function(height, width, offsetX, offsetY) {

  var commonUIIFrame = document.getElementById("commonUIIFrame");

  if (offsetX && offsetY)
  {
    commonUIIFrame.style.height = height;
    commonUIIFrame.style.width = width;
    commonUIIFrame.style.left = offsetX;
    commonUIIFrame.style.top = offsetY;
    commonUIIFrame.style.marginLeft = 0;
  }
  else
  {
    if (height) {
      commonUIIFrame.style.height = height;
    }    
    if (width)
    {
      commonUIIFrame.style.width = width;
      var currentWidth = commonUIIFrame.offsetWidth;
      commonUIIFrame.style.left = '50%';
      commonUIIFrame.style.marginLeft = (-currentWidth / 2) + 'px';
    }
  }
};

/**
 * The game should call handleServerError with every error that it receives from
 * the game server.
 * GCM will categorize the error based on the error code in the errorInfo object.
 * <code>
 * The current error categories include:
 *                 {
 *                     CRITICAL,
 *                     INSUFFICIENT_FUNDS,
 *                     LOGIN_ERROR,
 *                     RECOVERABLE_ERROR,
 *                     NON_RECOVERABLE_ERROR,
 *                     CONNECTION_ERROR,
 *                     MULTI_CHOICE_DIALOG,
 *                     OTHER_GAME_IN_PROGRESS
 *                 }.
 * Default error category is NON_RECOVERABLE_ERROR.
 * </code>
 * GCM will also supply the error severity for known errors. i.e. 'WARNING', 'INFO'
 * or 'ERROR'.  This can be used by the commonUI to display different colours and titles for the
 * error dialogs if desired.<br>
 * GCM will pass the error onto the commonUI to both display the error and decide
 * what it would like to do after the error has been shown (business logic should be
 * based on the errorCategory supplied by GCM)<br>
 *
 * Note that the errorInfo object parameter required for this function can
 * be created using com.openbet.gcm.xmlutil.getErrorInfoFromFOGXml() which takes
 * the XML Error response from the FOG/RGI server and converts it into the
 * required object format.  Alternatively the object can be created directly by the
 * game's FOG response parsing code.
 * @param {Object} errorInfo The error object in the following format:
 * <code>
 *          {
 *            errorCode: code,
 *            errorMessage: msg
 *          }</code>.
 * @throws Error if the params are invalid.
 */
gcmCore.handleServerError = function(errorInfo) {

  if (gcmCore.errorHandler_.isRealityCheckError(errorInfo['errorCode'])) {
    // Before handling a reality check error, reality check details such as realityCheckPeriod, sessionTime etc
    // needs to be retrieved and then handleRealityCheckError is called on gcmCore.
    gcmCore.getRealityCheckDetails(gcmCore.handleRealityCheckError);
  } else {
    gcmCore.errorHandler_.handleServerError(errorInfo);
    //listen to COMPLETE event of notification handler to be sure all pending notifications
    //are handled before game resume.
    gcmCore.notificationHandler_.addEventListener(GCMEvent.COMPLETE, gcmCore.onHandleErrorComplete_);
  }
};

/**
 * The game should call handleError on gcm for any error to be displayed and handled
 * by the CommonUI. <br>
 * GCM will call commonUI.handleError() to pass this error to commonUI for handling.
 * The commonUI is responsible for both the display and the logic for what happens
 * after an error is displayed to the user.<br>
 *
 * @param {string} errorCategory the category of current error.
 *                 The current error categories are:
 *                 {
 *                     CRITICAL,
 *                     INSUFFICIENT_FUNDS,
 *                     LOGIN_ERROR,
 *                     RECOVERABLE_ERROR,
 *                     NON_RECOVERABLE_ERROR,
 *                     CONNECTION_ERROR,
 *                     MULTI_CHOICE_DIALOG,
 *                     OTHER_GAME_IN_PROGRESS
 *                 }.
 * @param {string} errorSeverity this signifies the severity of the error and can
 *          be 'WARNING', 'INFO' or 'ERROR'.
 * @param {string} errorCode the error code string. Note that usually nothing
 *          should be done with this parameter. The commonUI is not expected to
 *          do any business logic based on the error code, but it is passed
 *          through in case the commonUI wishes to log the error codes that
 *          have been sent.
 * @param {string} errorMessage the error message provide by game.
 * @param {Object=} errorParams (Optional) the optional JSON object parameter to allow the game to pass additional
 *          information to the commonUI on how to handle the error. Name key, value pairs
 *          must be provided in a valid JSON format.
 *          This parameter is used for (and not restricted to) error categories
 *          "OTHER_GAME_IN_PROGRESS" and "MULTI_CHOICE_DIALOG".
 *
 *          Usage in "OTHER_GAME_IN_PROGRESS"
 *          Raising a "OTHER_GAME_IN_PROGRESS" error category will inform the CommonUI that more than
 *          one game is already in progress.
 *          The CommonUI can relaunch the corresponding game by using game information provided in errorParams argument.
 *          When calling an error of this category type the game name must be provided as part of the error parameters
 *          in JSON format in a 'gameName' tag. Any additional game launching information can be provided within
 *          a 'gameInProgressParams' tag in the JSON object.
 *
 *          Example of errorParams object for a "OTHER_GAME_IN_PROGRESS" error:
 *              {'gameName': 'ChainReactors'}
 *              {'gameInProgressParams': {
 *                         'channel': 'I',
 *                         'lang': 'en',
 *                         'playMode': 'real',
 *                         'loginToken': 'tqQRojxew8fBeadMe/8gtOk8nz1+PeuCSE0AQdKyw0Og4wpnFyZhrVh2VhZhp67gz10s8Y2==',
 *                         'affId': '1'
 *                         }
 *              }}
 *
 *
 *          Usage in "MULTI_CHOICE_DIALOG"
 *          Raising a "MULTI_CHOICE_DIALOG" error category will inform the CommonUI that the error dialog can be
 *          displayed with multiple options.  These options will be provided in errorParams object.
 *          When the user acknowledges the error dialog, the selected option's index will be returned to the game.
 *
 *          Example of errorParams object for a "OTHER_GAME_IN_PROGRESS" error:
 *              {'options' : ['Ok', 'Cancel', 'Quit']}
 *
 *
 *          Usage in providing additional error handling information
 *          This is an example of how this parameter can be used when the error category raised
 *          is not a "OTHER_GAME_IN_PROGRESS" or "MULTI_CHOICE_DIALOG" type.
 *          This example provides a method to suppress an error message if for example the previous
 *          error was a "MULTI_CHOICE_DIALOG" error category type and the player selected an option to "close the game".
 *          This could result in the game raising a Critical error to inform the CommonUI that it is closing the game.
 *          This error can be suppressed since the player has chosen to close the game.
 *
 *          This example scenario would require additional information to be provided in the following format:
 *              {'suppressMessage':'true'}
 *
 */
gcmCore.handleError = function(errorCategory, errorSeverity, errorCode, errorMessage, errorParams)
{
  if (gcmCore.errorHandler_.isRealityCheckError(errorMessage)) {
    // Before handling a reality check error, reality check details such as realityCheckPeriod, sessionTime etc
    // needs to be retrieved and then handleRealityCheckError is called on gcmCore.
    gcmCore.getRealityCheckDetails(gcmCore.handleRealityCheckError);
  } else {
    //listen to COMPLETE event of notification handler to be sure all pending notifications
    //are handled before game resume.
    gcmCore.notificationHandler_.addEventListener(GCMEvent.COMPLETE, gcmCore.onHandleErrorComplete_);
    gcmCore.errorHandler_.handleError(errorCategory, errorSeverity, errorCode, errorMessage, errorParams);
  }
};

/**
 * handleRealityCheckError function is called for handling reality check error.
 * Existing flash and HTML5 games make use of handleError or handlerServerError for all types of error handling.
 * So this function does not get called directly by Game and through one of the above mentioned functions.
 * Once the error is processed, GCM will call commonUI.handleError() to pass this error to commonUI for handling.
 * The commonUI is responsible for both the display and the logic for what happens
 * after a reality check error is displayed to the user.
 *
 * @param {Object} realityCheckDetails JSON object parameter. This object is added to errorParams
 * when calling handleError on commonUI.
 * Example of realityCheckDetails object :
 *
 * { "realityCheckInfo": {"custId": "3", "realityCheckPeriod": "1800", "sessionTime": "3000", "remainingTime":"0"},
 *   "rcParams" : {"param1": "value1", "param2": "value2",...,"paramN":"valueN"}
 * }
 * Note: rcParams Object param in this response is an optional parameter and can contain unrestricted number of params.
 *
 */
gcmCore.handleRealityCheckError = function(realityCheckDetails)
{
  //listen to COMPLETE event of notification handler to be sure all pending notifications
  //are handled before game resume.
  gcmCore.notificationHandler_.addEventListener(GCMEvent.COMPLETE, gcmCore.onHandleErrorComplete_);
  gcmCore.errorHandler_.handleRealityCheckError(realityCheckDetails);
};

/**
 * @private
 * Event listener function used when error handling complete.
 * */
gcmCore.onHandleErrorComplete_ = function()
{
  gcmCore.notificationHandler_.removeEventListener(GCMEvent.COMPLETE, gcmCore.onHandleErrorComplete_);

  var errorParamIndex = ErrorNotification.getErrorParamIndex();

  if (errorParamIndex != undefined) {
      gcmCore.game_.resume(errorParamIndex);
      ErrorNotification.setErrorParamIndex(undefined);
  } else {
      gcmCore.game_.resume();
  }
};


/**
 * This function is called by commonUI when it's done handling recoverable error.
 * gcm will call game.resume() to resume the game play.
 *
 * @param {*=} feedback (Optional) The feedback from user for the resumption
 *            of current outstanding notification. The feedback detail depend
 *            on notification type. Notifications expect feedback including:<br>
 *              - SESSION_TIMER <br>
 *            Please find more detail in notification model class.
 *
 * @see SessionNotification
 */
gcmCore.resume = function(feedback)
{
  gcmCore.notificationHandler_.resume(feedback);
};

 /**
 * Retrieves game configuration information.<br>
 * The game or commonUI can call this to retrieve the configuration it requires
 * to initialize.<br>
 * The returned configuration items will be gameName, playMode, channel, gameClass and gameServerUrl<br>
 * For now only gameName, playMode and channel are available
 * If the freespinPlay = true and playMode is freespin, freespinConfig is added in config object.
 * freespinConfig {
 *                 "stake_per_line": "1",
 *                 "num_lines": "10",
 *                 "num_spins": "5",
 *                 "tokenID": "266"
 *                }
 * @return {Object} the config object.
 */
gcmCore.getConfig = function() {
  var config = gcmCore.gameConfig_.getConfig();
  if ( 'FREESPIN' == gcmCore.account_.fundMode_ ) {
     config['freespinConfig'] = gcmCore.freespinConfig_.getConfig();
  }
  return config;
};

/**
 * This is an optional call for the game to make to GCM. The game can choose to
 * use this facility if they choose to allow the commonUI to control game
 * options.<br>
 * Options can be registered are including game setting options such as 'MUTE'
 * 'TURBO' and game display options such as 'PAYTABLE', 'ABOUT', 'HELP' and 'GAME_PREFERENCE'
 * @param {string} optionType must be one of MUTE, TURBO. We can extend this list
 *          in the future.
 * @return {boolean|string} the initial value of the option is returned back to the
 *         game. GCM can potentially in the future save these options in cookies
 *         or against the account, so that we have persistence of options.
 * @throws Error if the optionType params are invalid
 */
gcmCore.regOption = function(optionType) {
  return GameInfo.regOption(optionType);
};

/**
 * Either the game or the commonUI can call this method on gcm to state that an
 * option has changed. There could be UI in both the game and the commonUI to
 * control options such as MUTE and TURBO, also the display option such as
 * show about box or game preferences. and the new value should be reflected
 * in both places
 * @param {string} optionType one of MUTE, TURBO, ABOUT or GAME_PREFERENCE.
 * @param {string} changedFrom one of COMMONUI, GAME. This tells gcm whether the
 *          option was switched in the game or the commonUI.
 * @param {boolean} newValue the new value of the option.
 */
gcmCore.optionHasChanged = function(optionType, changedFrom, newValue) {
  GameInfo.optionHasChanged(optionType, changedFrom, newValue);
};

/**
 * The game must call this on gcm so that the commonUI can be updated with
 * loading progress and display progress in a loading screen
 * @param {number} percentLoaded the percentage of the loading process complete.
 */
gcmCore.loadProgressUpdate = function(percentLoaded) {
  GameInfo.loadProgressUpdate(percentLoaded);
};

/**
 * The game should call gameAnimationStart when it starts it's game play
 * animation After this the commonUI is not permitted to display any content
 * until gameAnimationComplete() is invoked by the game.
 */
gcmCore.gameAnimationStart = function() {
  gcmCore.gameStateController_.gameAnimationStart();
};

/**
 * The game should call gameAnimationComplete(resumeCallback) when the game
 * animation is complete. This will have the effect of handing over control to
 * GCM so that any pending notifications can be shown in the commonUI. Once GCM
 * has completed showing any notifications in the commonUI, the resumeCallback
 * will be called.
 * @param {Function} resumeCallback the callback function that should be
 *          called when the commonUI has completed dealing with notifications.
 */
gcmCore.gameAnimationComplete = function(resumeCallback) {
  if ('FREESPIN' == gcmCore.account_.fundMode_ && gcmCore.account_.checkFreespinFinished()) {
    gcmCore.getFreespinSummaryData(gcmCore.freespinConfig_.getFreespinTokenId(), gcmCore.displayFreespinSummary);
  }
  gcmCore.gameStateController_.gameAnimationComplete(resumeCallback);
};

/**
 * <b>deprecated</b>: This function should no longer be used.CommonUI should implement its own function
 * which makes use of game launch web-service when launching games in real-play. A sample implementation
 * has been added to example commonUI in GCM bundle from version 2.1.0 onwards.
 *
 */
gcmCore.playForReal = function() {
 
 if (gcmCore.isDesktop()) {

  window.top.location = String(window.top.location).replace("demo", "real");

 } else {

  var pageParams = {};      

  var arr = window.location.search.substr(1).split("&");
  var len = arr.length;     
    
  for (var i = 0; i < len; i++) {
    var elem = arr[i].split("="); 
    pageParams[elem[0]] = elem[1];        
  }     

  pageParams["playMode"] = "real";

  Launcher.launchGameWS(pageParams, false);

 }
    
};

/**
 * This will be called by common UI to retrieve the games list
 * @param {string} lang the string identifying the required language.
 * @param {Function} gameListCallback the callback function that should be
 *          called when the games list data is received. This function should set up the
 *          common ui menu and append it to the document. A games list will be returned
 *          in a JSON structure.
 *
 *              var gameJSON ={
 *                  "gamesList": {
 *                      "displayName": "Games Menu",
 *                      "categories": [
 *                          {
 *                              "id": "1",
 *                              "name": "Package24",
 *                              "games": [
 *                                  {
 *                                      "id": "1",
 *                                      "gameName": "GameName1",
 *                                      "displayName": "FirstGame",
 *                                      "position": "1"
 *                                  }
 *                              ]
 *                          },
 *                          {
 *                              "id": "2",
 *                              "name": "Package25",
 *                              "games": [
 *                                  {
 *                                      "id": "1",
 *                                      "gameName": "GameName1",
 *                                      "displayName": "FirstGame",
 *                                      "position": "1"
 *                                  },
 *                                  {
 *                                      "id": "2",
 *                                      "gameName": "GameName2",
 *                                      "displayName": "SecondGame",
 *                                      "position": "1"
 *                                  }
 *                              ]
 *                          }
 *                      ]
 *                  }
 *              };
 *
 *
 * @param {string=} listName the optional string identifying the required menu list
 *          a default backend property for list name is used if no list name provided.
 * */
gcmCore.getGameList = function(lang, gameListCallback, listName) {
  if (!gcm.validate.isFunction(gameListCallback)) {
    throw new Error('gcm.getGameList: Invalid game list callback ' + gameListCallback);
  }

  if (GameList.isEnabled()) {
    //TODO we need to look at how we can queue up the communication of the
    //web services and then make the data available to game\commonUI, otherwise
    //we are going to have ready calls littered all over the api.
    var gameList = new GameList(lang, gameListCallback, gcmCore.gcmWebServiceBaseUrl_, listName);
    //send gcm Menu request
    gameList.init();
  }
};


/**
 * This function will be called by GCM when it receives a reality check error from Game.
 * @param {Function} realityCheckCallback the callback function that should be
 * called when gcm web-service returns the reality check details in a JSON object.
 * @return {Object} the realityCheckDetails object.
 * Example of realityCheckDetails object :
 *
 * { "realityCheckInfo": {"custId": "3", "realityCheckPeriod": "1800", "sessionTime": "3000", "remainingTime":"0"},
 *   "rcParams" : {"param1": "value1", "param2": "value2",...,"paramN":"valueN"}
 * }
 * Note: rcParams Object param in this response is an optional parameter and can contain unrestricted number of params.
 *
 */
gcmCore.getRealityCheckDetails = function (realityCheckCallback) {

 var realityCheckDetails = new RealityCheckDetails (realityCheckCallback ,gcmCore.gcmWebServiceBaseUrl_);

 //send reality check details request
 realityCheckDetails.init();
};



/**
 * GCM calls this function when a freespin round is finished(indicated by a zero freespin balance) to
 * retrieve spent details for a finished freespin token.
 * CommonUI can also optionally call this function to retrieve token spend details for a specific freespin token.
 * @param {number} freespinTokenId token id of a freespin token.
 * @param {Function} freespinTokenSummaryCallback The callback function to call when the summary data is available
 * from token web-service.
 *
 * */
gcmCore.getFreespinSummaryData = function(freespinTokenId, freespinTokenSummaryCallback) {
  var freespinSummaryData = new FreespinTokenSummary(freespinTokenId, freespinTokenSummaryCallback
  , gcmCore.gcmWebServiceBaseUrl_, gcmCore.handleError);
  freespinSummaryData.init();
};

/**
 * This is the callback function passed by GCM when it requests for freespin token summary details from
 * token web-service.
 * This function is used to call the displayFreespinSummary function on CommonUI when the freespin summary data response
 * is received from token web-service.
 * @param {Object} freespinSummaryDataObj this is the freespin summary data object in following format.
 * {
 *   "tokenID": "15",
 *   "ccy_code": "GBP",
 *   "freespinSummary": [
 *                        {
 *                          "gameName": "ChainReactors",
 *                          "spins": "6",
 *                          "winnings": "100.00"
 *                        },
 *                        {
 *                          "gameName": "CircusSlot",
 *                          "spins": "4",
 *                          "winnings": "12.00"
 *                        }
 *                      ]
 * }
 *
 * */
gcmCore.displayFreespinSummary = function(freespinSummaryDataObj) {
  gcmCore.commonUI_.displayFreespinSummary(freespinSummaryDataObj);
};

/**
 * This is callback function called by flash to get Option value
 * for the request option type.
 * @param {string} optionType this is the option Type.
 * @return {boolean} true or false (optionType value)
 * */
gcmCore.getOptionValue = function(optionType) {
  return gcmCore.commonUI_.getOptionValue(optionType);
};

/**
 * This is callback function called by flash to set Game Version
 * */
gcmCore.setGameVersion = function(version) {
    gcmCore.version = version;
};

/**
 * This is callback function called by flash to show About info
 * */
gcmCore.showOpenbetAbout = function(visibility) {
  gcmCore.commonUI_.showOpenbetAbout(gcmCore.version, visibility);
};

/**
 * This is callback function called by flash to toggle the Balance display
 * and returns its new display value(boolean)
 * @return {boolean} true or false
 * */
gcmCore.toggleBalanceDisplay = function() {
  return gcmCore.commonUI_.toggleBalanceDisplay();
};

/**
 * This is the callback function called by Flash to display freespin dialog
 * This function is used to call the displayFreespinDialog function on CommonUI when the freespin config data
 * is received from flash topbar. It will request freespinConfig method if the flash returns empty freespinConfig obj
 * @param {Object} freespinConfigObj this is the freespin config data object in following format.
 * {
 *   "stake_per_line": "1.00",
 *   "num_spins": "5",
 *   "num_lines": "20",
 *   "tokenID": "1",
 * }
 *
 * */
gcmCore.getLanguage = function() {
  return 'GBP';
}
gcmCore.showFreeSpinScreen = function(freespinConfigObj) {
    gcmCore.setFreespinConfig(freespinConfigObj);
    gcmCore.commonUI_.displayFreespinDialog(freespinConfigObj);
};

/**
 * This is the callback function called by Flash to set freespinconfig information.
 * This method is called in FauxFlashTopbar.as_setGCMMethods method.
 * @param {Object} freespinConfigObj this is the freespin config data object in following format.
 * {
 *   "stake_per_line": "1.00",
 *   "num_spins": "5",
 *   "num_lines": "20",
 *   "tokenID": "1",
 * }
 *
 * */
gcmCore.setFreespinConfig = function(freespinConfigObj) {
    if (gcmCore.freespinConfig_ == null) {
        gcmCore.freespinConfig_ = new FreespinConfig(gcmCore.gcmWebServiceBaseUrl_, '', gcmCore.handleError);
    }
    if (freespinConfigObj) {
        gcmCore.freespinConfig_.setStakePerLine(freespinConfigObj['stake_per_line']);
        gcmCore.freespinConfig_.setNumOfLines(freespinConfigObj['num_lines']);
        gcmCore.freespinConfig_.setNumOfSpins(freespinConfigObj['num_spins']);
        gcmCore.freespinConfig_.setFreespinTokenId(freespinConfigObj['tokenID']);
        gcmCore.freespinConfig_.setReady(true);
    }
};

/**
* This method is called by Flash to notify the playMode to commonUI
*/
gcmCore.setPlayMode = function(playMode) {
   if (playMode && playMode === 'freespin') {
      gcmCore.account_.setFundMode(GameConfig.PlayMode.FREESPIN.toUpperCase());
   } else if (playMode === 'real') {
      gcmCore.account_.setFundMode('');
   }
   gcmCore.commonUI_.setPlayMode(playMode);
};


/**
* This method is called by commonUI to notify flash topbar through FauxGCMGame to launch the game in freespins playMode
*/
gcmCore.freeSpinsClicked = function() {
    gcmCore.account_.setFundMode(GameConfig.PlayMode.FREESPIN.toUpperCase());
    gcmCore.game_.freeSpinsClicked();

};

/**
* This method is called by commonUI to notify flash through FauxGCMGame to launch the game in real playMode
*/
gcmCore.realPlayClicked = function() {
    gcmCore.game_.realPlayClicked();
};


/**
* This method is called from freespins summary screen to notify flash through FauxGCMGame to launch the game in real playMode
*/
gcmCore.onFreespinRealPlayClicked = function() {
    gcmCore.game_.onFreespinRealPlayClicked();
};

/**
* This method will call flash through FauxGCMGame to get topBarConfigObj to register options
* @param {Object} menuStructureObj
*/
gcmCore.setMenuStructure = function(menuStructureObj) {
    if (gcmCore.isFlash()) {
        if(menuStructureObj != '') {
           gcmCore.commonUI_.setMenuStructure(menuStructureObj);
       } else {
           throw new Error('Invalid Menu Structure received from flash');
       }
    }
};


/**
 * This function is used by game to retrieve CSRF token from GCM.
 * @return {string} The CSRF token from GCM. if no CSRF token this returns empty string.
 * */
gcmCore.getCSRFToken = function()
{
  var token = '';
  if(gcmCore.gcmConfig_.checkConfigEnabled('settings.csrf'))
  {
    var csrfCookieName = gcmCore.gcmConfig_.getConfig('settings.csrf.cookiename') || 'CSRF_COOKIE';
    var parts = document.cookie.split(csrfCookieName+'=');
    if (parts.length == 2)
        token = parts.pop().split(';').shift();
  }
  return token;
};

/**
 * This function is used to determine if desktop or mobile settings are used.
 * @return {boolean} true if desktop setting
 * */
gcmCore.isDesktop = function() {

  if(gcmCore.device) {
    return (gcmCore.device === "desktop");
  } else {
    return (window.parent === window);
  }
}

/**
 * This function is used to determine if the client type is flash or not.
 * @return {boolean} true if flash
 * */
gcmCore.isFlash = function() {
  return (gcmCore.clientType === "flash")
}

/**
 * This function is called by commonUI when a player acknowledges a reality check message.
 * @param {String} playerChoice It can be either 'continue' or 'logout'
 * @param {Object} rcParams optional list of additional parameters (eg actionId) required by the operator for doing
 * reality checks
 * rcParams Object Format
 * {
 *  "param1":"value1",
 *  "param2":"value2",
 *   ................,
 *  "paramN": "valueN"
 * }
 *
 * */

gcmCore.acknowledgeRealityCheck = function (playerChoice, rcParams) {

  // Call gcm web-service with player choice and record it
  var ackRealityCheck = new AckRealityCheck (gcmCore.gcmWebServiceBaseUrl_,gcmCore.handleError);

 //send acknowledge reality check request
 ackRealityCheck.init(playerChoice, rcParams);
  
 //commenting this out since we already have it on onHandleErrorComplete_
 //gcmCore.game_.resume();
};

/**
 * Flash Games call this function when there is a freebetAward
 * @param {number} freebetAmount Amount of freeebet reward
 * */
gcmCore.showBonusWin = function(freebetAmount, desc) {  
   // we are going to ignore update from the game if bpush is active
  if(!gcmCore.bPushHandler_.isInitComplete()) {
    if(freebetAmount)
    {
      var formatter_ = new CurrencyFormat();       
      gcmCore.commonUI_.handleFreebetAward(formatter_.format(parseFloat(freebetAmount)).display);   
    } else {
      gcmCore.commonUI_.handleFreebetAwardDesc(desc);
    }
  }    
}

/**
 * Flash Games call this function when there is an update to bonus bar percentage.
 * @param {string} bonusPercent Percentage of bonus bar update
 * */
gcmCore.setBonusPercent = function(bonusPercent) { 
  // we are going to ignore updates from the game if bpush is active
   if(!gcmCore.bPushHandler_.isInitComplete() && bonusPercent > 0) {
    gcmCore.commonUI_.handleBonusBarUpdate(bonusPercent);  
  }       
}

/**
 * Games can call this function to get a currency formatted string of a decimal amount.
 * @param {number} amount Amount to be formatted.
 * @return {string} formatted string representation.
 * */
gcmCore.formatAmount = function(amount) {
   var formatter_ = new CurrencyFormat();
   return formatter_.format(parseFloat(amount)).display;
}

// export public interface into gcm
goog.exportSymbol('com.openbet.gcm.init', gcmCore.init);
goog.exportSymbol('com.openbet.gcm.optionHasChanged', gcmCore.optionHasChanged);
goog.exportSymbol('com.openbet.gcm.regOption', gcmCore.regOption);
goog.exportSymbol('com.openbet.gcm.getConfig', gcmCore.getConfig);
goog.exportSymbol('com.openbet.gcm.handleServerError', gcmCore.handleServerError);
goog.exportSymbol('com.openbet.gcm.gameAnimationStart', gcmCore.gameAnimationStart);
goog.exportSymbol('com.openbet.gcm.gameAnimationComplete', gcmCore.gameAnimationComplete);
goog.exportSymbol('com.openbet.gcm.commonUIResize', gcmCore.commonUIResize);
goog.exportSymbol('com.openbet.gcm.flashBalancesUpdate', gcmCore.flashBalancesUpdate);
goog.exportSymbol('com.openbet.gcm.balancesUpdate', gcmCore.balancesUpdate);
goog.exportSymbol('com.openbet.gcm.loadProgressUpdate', gcmCore.loadProgressUpdate);
goog.exportSymbol('com.openbet.gcm.paidUpdate', gcmCore.paidUpdate);
goog.exportSymbol('com.openbet.gcm.stakeUpdate', gcmCore.stakeUpdate);
goog.exportSymbol('com.openbet.gcm.gameReady', gcmCore.gameReady);
goog.exportSymbol('com.openbet.gcm.setGame', gcmCore.setGame);
goog.exportSymbol('com.openbet.gcm.commonUIReady', gcmCore.commonUIReady);
goog.exportSymbol('com.openbet.gcm.gameRevealed', gcmCore.gameRevealed);
goog.exportSymbol('com.openbet.gcm.accountInit', gcmCore.accountInit);
goog.exportSymbol('com.openbet.gcm.playForReal', gcmCore.playForReal);
goog.exportSymbol('com.openbet.gcm.handleError', gcmCore.handleError);
goog.exportSymbol('com.openbet.gcm.resume', gcmCore.resume);
goog.exportSymbol('com.openbet.gcm.getFreespinSummaryData', gcmCore.getFreespinSummaryData);
goog.exportSymbol('com.openbet.gcm.getGameList', gcmCore.getGameList);
goog.exportSymbol('com.openbet.gcm.getCSRFToken', gcmCore.getCSRFToken);
goog.exportSymbol('com.openbet.gcm.isDesktop', gcmCore.isDesktop);
goog.exportSymbol('com.openbet.gcm.isFlash', gcmCore.isFlash);
goog.exportSymbol('com.openbet.gcm.gameConfigReady', gcmCore.gameConfigReady);
goog.exportSymbol('com.openbet.gcm.getClientType', gcmCore.getClientType);
goog.exportSymbol('com.openbet.gcm.showFreeSpinScreen', gcmCore.showFreeSpinScreen);
goog.exportSymbol('com.openbet.gcm.setFreespinConfig', gcmCore.setFreespinConfig);
goog.exportSymbol('com.openbet.gcm.setPlayMode', gcmCore.setPlayMode);
goog.exportSymbol('com.openbet.gcm.freeSpinsClicked', gcmCore.freeSpinsClicked);
goog.exportSymbol('com.openbet.gcm.realPlayClicked', gcmCore.realPlayClicked);
goog.exportSymbol('com.openbet.gcm.onFreespinRealPlayClicked', gcmCore.onFreespinRealPlayClicked);
goog.exportSymbol('com.openbet.gcm.getOptionValue', gcmCore.getOptionValue);
goog.exportSymbol('com.openbet.gcm.toggleBalanceDisplay', gcmCore.toggleBalanceDisplay);
goog.exportSymbol('com.openbet.gcm.setGameVersion', gcmCore.setGameVersion);
goog.exportSymbol('com.openbet.gcm.setMenuStructure', gcmCore.setMenuStructure);
goog.exportSymbol('com.openbet.gcm.showOpenbetAbout', gcmCore.showOpenbetAbout);
goog.exportSymbol('com.openbet.gcm.acknowledgeRealityCheck', gcmCore.acknowledgeRealityCheck);
goog.exportSymbol('com.openbet.gcm.showBonusWin', gcmCore.showBonusWin);
goog.exportSymbol('com.openbet.gcm.setBonusPercent', gcmCore.setBonusPercent);
goog.exportSymbol('com.openbet.gcm.formatAmount', gcmCore.formatAmount);
goog.exportSymbol('com.openbet.gcm.getLanguage', gcmCore.getLanguage);



//We use gcm.delegate here to alter the function context, by default goog.exportSymbol
//will create the namespace com.openbet.gcm.activitylog and assign functions to it.
//These functions will be run with the context of that namespace, but we want the context
//to be the logger object, so the "this" pointer works as expected.
goog.exportSymbol('com.openbet.gcm.activitylog.logEvent', gcm.delegate.create(gcmCore.logger_,
    gcmCore.logger_.logEvent));
goog.exportSymbol('com.openbet.gcm.activitylog.setUpLogging', gcm.delegate.create(gcmCore.logger_,
    gcmCore.logger_.setUpLogging));

//Check if there is custom bridge script specified
//if so we need to load cust bridge in head
var custBridgeURL = UrlUtil.getSearchParameterByName('customBridge', window.location.search);

if (custBridgeURL)
{
  //check that the custom bridge url is relative for security reasons
  if (!UrlUtil.checkURIIsRelative(custBridgeURL)) {
    throw new Error('custBridgeURL request parameter is not a relative URL');
  }
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', custBridgeURL);
  document.head.appendChild(script);
}

