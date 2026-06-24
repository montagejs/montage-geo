/*jshint node:true, browser:false */

// mod/core/range.js uses package-relative bare paths (e.g. "core/collections/...")
// that only resolve inside mod's mr context. When mr bootstraps and natively loads
// some mod files, those paths must also resolve via Node's native require. Patch
// Module._resolveFilename before mr starts so that bare "core/..." requests are
// redirected to the correct absolute location inside node_modules/mod/.
var Module = require('module');
var PATH_NATIVE = require('path');
var modRoot = PATH_NATIVE.join(__dirname, '..', 'node_modules', 'mod');
var _resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
    if (request === 'core' || request.startsWith('core/')) {
        request = PATH_NATIVE.join(modRoot, request);
    }
    return _resolveFilename.call(this, request, parent, isMain, options);
};

// mod's uuid.js references `global.crypto.getRandomValues`. In Node < 17,
// `global.crypto` is the Node crypto module, which lacks `getRandomValues`.
// The mr module system also injects its own `global` object into module scope,
// so we patch both the Node global and attach getRandomValues directly to
// globalThis so any execution context can reach it.
(function patchCrypto() {
    var _webcrypto = require('crypto').webcrypto;
    var _getRandomValues = _webcrypto.getRandomValues.bind(_webcrypto);
    if (typeof globalThis.crypto === 'undefined') {
        globalThis.crypto = { getRandomValues: _getRandomValues };
    } else if (typeof globalThis.crypto.getRandomValues !== 'function') {
        globalThis.crypto.getRandomValues = _getRandomValues;
    }
    // Also expose on the require('crypto') module object in case uuid.js
    // is loaded natively and resolves `global.crypto` as the crypto module.
    var _cryptoMod = require('crypto');
    if (typeof _cryptoMod.getRandomValues !== 'function') {
        _cryptoMod.getRandomValues = _getRandomValues;
    }
}());

var jasmineRequire = require('jasmine-core/lib/jasmine-core/jasmine.js');
var JasmineConsoleReporter = require('jasmine-console-reporter');

// Init
var jasmine = jasmineRequire.core(jasmineRequire);
var jasmineEnv = jasmine.getEnv();
    
// Export interface
var jasmineInterface = jasmineRequire.interface(jasmine, jasmineEnv);
global.jasmine = jasmine;
global.jasmineRequire = jasmineRequire;
for (var property in jasmineInterface) {
    if (jasmineInterface.hasOwnProperty(property)) {
       global[property] = jasmineInterface[property];
    }
} 

// Default reporter
jasmineEnv.addReporter(jasmineInterface.jsApiReporter);

// Html reporter
var consoleReporter = new JasmineConsoleReporter({
    colors: 1,         
    cleanStack: 1,      
    verbosity: 4,        
    listStyle: 'indent', 
    activity: false
});
jasmineEnv.addReporter(consoleReporter);

// Exit code
var exitCode = 0;
jasmineEnv.addReporter({
    specDone: function(result) {
        exitCode = exitCode || result.status === 'failed';
    }
});

// Execute
var mrRequire = require('mod/core/mr/bootstrap-node');
var PATH = require("path");
mrRequire.loadPackage(PATH.join(__dirname, ".")).then(function (mr) {
    return mr.async("all");
}).then(function () {
    console.log('Done');
    process.exit(exitCode);
}).thenReturn();

