'use strict';

/*
Require all .js files for code coverage with Istanbul
 */

var requireWalk = require('require-walk');

requireWalk(__dirname)();