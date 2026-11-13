#!/bin/sh
# 有 node 時直接執行；否則以 macOS 內建 JavaScriptCore（jsc）加最小 require/assert 墊片執行。
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then node engine.test.js && node content.test.js; exit $?; fi
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc
[ -x "$JSC" ] || { echo "需要 node 或 macOS jsc"; exit 1; }
for t in engine.test.js content.test.js; do
  "$JSC" -e '
var console={log:print};var module=undefined;
function fail(m){throw new Error(m||"assertion failed");}
function eq(a,b){if(a===b)return true;if(typeof a!=="object"||typeof b!=="object"||!a||!b)return false;var ka=Object.keys(a),kb=Object.keys(b);if(ka.length!==kb.length)return false;return ka.every(function(k){return eq(a[k],b[k]);});}
var __A={equal:function(a,b,m){if(a!==b)fail((m||"")+" expected "+b+" got "+a);},ok:function(v,m){if(!v)fail(m);},deepEqual:function(a,b,m){if(!eq(a,b))fail((m||"")+" deepEqual "+JSON.stringify(a)+" vs "+JSON.stringify(b));},throws:function(f){try{f();}catch(e){return;}fail("expected throw");},doesNotThrow:function(f,m){try{f();}catch(e){fail((m||"")+": "+e.message);}}};
load("engine.js");load("content.js");
function require(n){return n.indexOf("assert")>=0?__A:n.indexOf("engine")>=0?Insomnia:InsomniaContent;}
' -e "load('$t')" || exit 1
done
