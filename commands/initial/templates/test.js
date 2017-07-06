require('core-js/es6');
require('core-js/es7');
require('zone.js/dist/zone');
require('zone.js/dist/long-stack-trace-zone');
require('zone.js/dist/async-test');
require('zone.js/dist/fake-async-test');
require('zone.js/dist/sync-test');
require('zone.js/dist/proxy');
require('zone.js/dist/jasmine-patch');

const browserTesting = require('@angular/platform-browser-dynamic/testing');
const coreTesting = require('@angular/core/testing');
const context = require.context('./', true, /\.spec\.ts$/);
var locationRegex = '\\.spec\\.ts$';
if (ngl && ngl.libs) {
    const libsRegex = window.ngl.libs.join('|');
    locationRegex = '(' + libsRegex + ').*' + locationRegex ;
}
const contextRegex = new RegExp(locationRegex);

Error.stackTraceLimit = Infinity;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;

coreTesting.TestBed.resetTestEnvironment();
coreTesting.TestBed.initTestEnvironment(
    browserTesting.BrowserDynamicTestingModule,
    browserTesting.platformBrowserDynamicTesting()
);

context.keys().forEach(function(key) {
    if (contextRegex.test(key)) {
        context(key);
    }
});
