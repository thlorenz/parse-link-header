'use strict';
/*jshint asi: true */

var test = require('tape').test
var fs = require('fs')
var vm = require('vm')
var source = fs.readFileSync(require.resolve('..'), 'utf8')
var link = '<https://example.com/?page=2>; rel="next"'

function loadParser (globals) {
  globals.require = require
  globals.module = { exports: {} }
  vm.runInNewContext(source, globals)
  return globals.module.exports
}

function checkDefaults (t, globals) {
  var parse
  try {
    parse = loadParser(globals)
  } catch (err) {
    t.fail('module loads without environment variables: ' + err.message)
    return
  }
  t.equal(parse(link).next.page, '2', 'parses a valid header')
  t.equal(parse(new Array(2002).join(' ')), null, 'keeps the default length limit')
}

test('loading without a process global uses the defaults', function (t) {
  checkDefaults(t, {})
  t.end()
})

test('loading with a process shim without env uses the defaults', function (t) {
  checkDefaults(t, { process: {} })
  t.end()
})

test('loading with empty environment variables uses the defaults', function (t) {
  checkDefaults(t, { process: { env: {} } })
  t.end()
})

test('environment variables still customize the length limit', function (t) {
  var parse = loadParser({ process: { env: { PARSE_LINK_HEADER_MAXLEN: String(link.length) } } })
  t.equal(parse(link).next.page, '2', 'accepts a header at the custom limit')
  t.equal(parse(link + ' '), null, 'rejects a header above the custom limit')
  t.end()
})

test('a defined throw option still reports the custom length limit', function (t) {
  var parse = loadParser({ process: { env: {
    PARSE_LINK_HEADER_MAXLEN: String(link.length),
    PARSE_LINK_HEADER_THROW_ON_MAXLEN_EXCEEDED: ''
  } } })
  t.throws(function () { parse(link + ' ') }, new RegExp('under ' + link.length + ' characters'))
  t.end()
})
