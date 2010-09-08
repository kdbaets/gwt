/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

function __MODULE_FUNC__() {
  // ---------------- INTERNAL GLOBALS ----------------

  // Cache symbols locally for good obfuscation
  var $wnd = window
  ,$doc = document
  ,$stats = $wnd.__gwtStatsEvent ? function(a) {return $wnd.__gwtStatsEvent(a);} : null
  ,$sessionId = $wnd.__gwtStatsSessionId ? $wnd.__gwtStatsSessionId : null

  // Whether the document body element has finished loading
  ,bodyDone
  
  // The downloaded script code, once it arrives
  ,compiledScript
  
  // The iframe holding the app's code
  ,scriptFrame

  // If non-empty, an alternate base url for this module
  ,base = ''

  // A map of properties that were declared in meta tags
  ,metaProps = {}

  // Maps property names onto sets of legal values for that property.
  ,values = []

  // Maps property names onto a function to compute that property.
  ,providers = []

  // A multi-tier lookup map that uses actual property values to quickly find
  // the strong name of the cache.js file to load.
  ,answers = []

  // Provides the module with the soft permutation id
  ,softPermutationId = 0

  // Error functions.  Default unset in compiled mode, may be set by meta props.
  ,onLoadErrorFunc, propertyErrorFunc

  ; // end of global vars

  $stats && $stats({
    moduleName: '__MODULE_NAME__',
    sessionId: $sessionId,
    subSystem: 'startup',
    evtGroup: 'bootstrap', 
    millis:(new Date()).getTime(), 
    type: 'begin',
  });

  // ------------------ TRUE GLOBALS ------------------

  // Maps to synchronize the loading of styles and scripts; resources are loaded
  // only once, even when multiple modules depend on them.  This API must not
  // change across GWT versions.
  if (!$wnd.__gwt_stylesLoaded) { $wnd.__gwt_stylesLoaded = {}; }
  if (!$wnd.__gwt_scriptsLoaded) { $wnd.__gwt_scriptsLoaded = {}; }

  // --------------- INTERNAL FUNCTIONS ---------------

  function isHostedMode() {
    var result = false;
    var query = $wnd.location.search;
    return (query.indexOf('gwt.codesvr=') != -1);
    isHostedMode = function() { return result; };
    return result;
  }
  
  // This function is called on two events: the body has finished
  // loading, and the script to install is available. For hosted
  // mode, install the hosted file as soon as the body is done.
  // For prod mode, additionally wait until the script to install
  // has been loaded, and then install the code.
  function maybeCreateFrame() {
    if (bodyDone && !scriptFrame && (isHostedMode() || compiledScript)) {
    	// Create the script frame, making sure it's invisible, but not
    	// "display:none", which keeps some browsers from running code in it.
    	scriptFrame = $doc.createElement('iframe');
        scriptFrame.src = 'javascript:""';
        scriptFrame.id = '__MODULE_NAME__';
        scriptFrame.style.cssText = 'position:absolute; width:0; height:0; border:none; left: -1000px; top: -1000px; !important';
        scriptFrame.tabIndex = -1;
        document.body.appendChild(scriptFrame);

        var doc = scriptFrame.contentDocument;
        if (!doc) {
          doc = scriptFrame.contentWindow.document;
        }
        // The missing content has been seen on Safari 3 and firebug will
        // behave incorrectly on soft refresh unless we explicitly set the content
        // of the frame. However, we don't want to do this when runAsync calls
        // installCode, so we do it here when we create the iframe.
        doc.open();
        doc.write('<html><head></head><body></body></html>');
        doc.close();

        // For some reason, adding this setTimeout makes code installation
        // more reliable.
        setTimeout(function() {
            if (isHostedMode()) {
              scriptFrame.contentWindow.name = '__MODULE_FUNC__';
              installCode(base + "__HOSTED_FILENAME__", true);
            } else {
              installCode(compiledScript, false);
            }
        })
    }
  }
  
  // Install code into scriptFrame
  //
  function installCode(code, isUrl) {
    var doc = scriptFrame.contentDocument;
    if (!doc) {
      doc = scriptFrame.contentWindow.document;
    }
    var docbody = doc.getElementsByTagName('body')[0];

    // Inject the fetched script into the script frame.
    // The script will call onScriptInstalled.
    var script = doc.createElement('script');
    script.language='javascript';
    if (isUrl) {
      script.src = code;
    } else {
      script.text = code;
    }
    docbody.appendChild(script);

    // Remove the tags to shrink the DOM a little.
    // It should have installed its code immediately after being added.
    docbody.removeChild(script);
  }

  __PROCESS_METAS__
  __COMPUTE_SCRIPT_BASE__
  
  /**
   * Determines whether or not a particular property value is allowed. Called by
   * property providers.
   *
   * @param propName the name of the property being checked
   * @param propValue the property value being tested
   */
  function __gwt_isKnownPropertyValue(propName, propValue) {
    return propValue in values[propName];
  }

  /**
   * Returns a meta property value, if any.  Used by DefaultPropertyProvider.
   */
  function __gwt_getMetaProperty(name) {
    var value = metaProps[name];
    return (value == null) ? null : value;
  }

  // Deferred-binding mapper function.  Sets a value into the several-level-deep
  // answers map. The keys are specified by a non-zero-length propValArray,
  // which should be a flat array target property values. Used by the generated
  // PERMUTATIONS code.
  //
  function unflattenKeylistIntoAnswers(propValArray, value) {
    var answer = answers;
    for (var i = 0, n = propValArray.length - 1; i < n; ++i) {
      // lazy initialize an empty object for the current key if needed
      answer = answer[propValArray[i]] || (answer[propValArray[i]] = []);
    }
    // set the final one to the value
    answer[propValArray[n]] = value;
  }

  // Computes the value of a given property.  propName must be a valid property
  // name. Used by the generated PERMUTATIONS code.
  //
  function computePropValue(propName) {
    var value = providers[propName](), allowedValuesMap = values[propName];
    if (value in allowedValuesMap) {
      return value;
    }
    var allowedValuesList = [];
    for (var k in allowedValuesMap) {
      allowedValuesList[allowedValuesMap[k]] = k;
    }
    if (propertyErrorFunc) {
      propertyErrorFunc(propName, allowedValuesList, value);
    }
    throw null;
  }

  // --------------- PROPERTY PROVIDERS --------------- 

// __PROPERTIES_BEGIN__
// __PROPERTIES_END__

  // --------------- EXPOSED FUNCTIONS ----------------

  // Called when the initial script code has been downloaded
  __MODULE_FUNC__.onScriptDownloaded = function(code) {
	compiledScript = code;
	maybeCreateFrame();
  }
  
  // Called when the compiled script has been installed
  //
  __MODULE_FUNC__.onScriptInstalled = function(gwtOnLoadFunc) {
    // remove the callback to prevent it being called twice
    __MODULE_FUNC__.onScriptInstalled = null;
    if (isHostedMode()) {
      scriptFrame.contentWindow.__gwt_getProperty = computePropValue;
    }
    gwtOnLoadFunc(onLoadErrorFunc, '__MODULE_NAME__', base, softPermutationId);
    // Record when the module EntryPoints return.
    $stats && $stats({
      moduleName: '__MODULE_NAME__',
      sessionId: $sessionId,
      subSystem: 'startup',
      evtGroup: 'moduleStartup',
      millis:(new Date()).getTime(),
      type: 'end',
    });
  }
  
  // Install code pulled in via runAsync
  //
  __MODULE_FUNC__.installCode = installCode;

  // --------------- STRAIGHT-LINE CODE ---------------

  // do it early for compile/browse rebasing
  processMetas();
  computeScriptBase();

  // --------------- WINDOW ONLOAD HOOK ---------------

  $stats && $stats({
    moduleName:'__MODULE_NAME__', 
    sessionId: $sessionId,
    subSystem:'startup', 
    evtGroup: 'bootstrap', 
    millis:(new Date()).getTime(), 
    type: 'selectingPermutation'
  });

  var strongName;
  if (!isHostedMode()) {
    try {
// __PERMUTATIONS_BEGIN__
      // Permutation logic
// __PERMUTATIONS_END__
      var idx = strongName.indexOf(':');
      if (idx != -1) {
        softPermutationId = +(strongName.substring(idx + 1));
        strongName = strongName.substring(0, idx);
      }
    } catch (e) {
      // intentionally silent on property failure
      return;
    }
  }

  var onBodyDoneTimerId;
  function onBodyDone() {
    if (!bodyDone) {
      bodyDone = true;
// __MODULE_STYLES_BEGIN__
     // Style resources are injected here to prevent operation aborted errors on ie
// __MODULE_STYLES_END__
      maybeCreateFrame();

      if ($doc.removeEventListener) {
        $doc.removeEventListener("DOMContentLoaded", onBodyDone, false);
      }
      if (onBodyDoneTimerId) {
        clearInterval(onBodyDoneTimerId);
      }
    }
  }

  // For everyone that supports DOMContentLoaded.
  if ($doc.addEventListener) {
    $doc.addEventListener("DOMContentLoaded", function() {
      onBodyDone();
    }, false);
  }

  // Fallback. If onBodyDone() gets fired twice, it's not a big deal.
  var onBodyDoneTimerId = setInterval(function() {
    if (/loaded|complete/.test($doc.readyState)) {
      onBodyDone();
    }
  }, 50);

  $stats && $stats({
    moduleName:'__MODULE_NAME__', 
    sessionId: $sessionId,
    subSystem:'startup', 
    evtGroup: 'bootstrap', 
    millis:(new Date()).getTime(), 
    type: 'end'
  });

  $stats && $stats({
    moduleName:'__MODULE_NAME__', 
    sessionId: $sessionId,
    subSystem:'startup', 
    evtGroup: 'loadExternalRefs', 
    millis:(new Date()).getTime(), 
    type: 'begin'
  });

// __MODULE_SCRIPTS_BEGIN__
  // Script resources are injected here
// __MODULE_SCRIPTS_END__
  // This is a bit ugly, but serves a purpose. We need to ensure that the stats
  // script runs before the compiled script. If they are both doc.write()n in
  // sequence, that should be the effect. Except on IE it turns out that a
  // script injected via doc.write() can execute immediately! Adding 'defer'
  // attributes to both seemed to fix this, but caused startup problems for
  // some apps. The final solution was simply to inject the compiled script
  // from *within* the stats script, guaranteeing order at the expense of near
  // total inscrutability :(
  var compiledScriptWrite = '';
  if (!isHostedMode()) {
    compiledScriptWrite = 'document.write("<script src=\\"' + base + strongName + '.cache.js\\"></scr" + "ipt>");';
  }

  $doc.write('<scr' + 'ipt><!-' + '-\n'
    + 'window.__gwtStatsEvent && window.__gwtStatsEvent({'
    + 'moduleName:"__MODULE_NAME__", sessionId:window.__gwtStatsSessionId, subSystem:"startup",'
    + 'evtGroup: "loadExternalRefs", millis:(new Date()).getTime(),'
    + 'type: "end"});'
    + 'window.__gwtStatsEvent && window.__gwtStatsEvent({'
    + 'moduleName:"__MODULE_NAME__", sessionId:window.__gwtStatsSessionId, subSystem:"startup",'
    + 'evtGroup: "moduleStartup", millis:(new Date()).getTime(),'
    + 'type: "moduleRequested"});'
    + compiledScriptWrite
    + '\n-' + '-></scr' + 'ipt>');
}

__MODULE_FUNC__();