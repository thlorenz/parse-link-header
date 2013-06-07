'use strict';
/*jshint asi: true */

var test = require('tape').test
var query = require('..')

var link = 
  '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100>; rel="next", ' + 
  '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100>; rel="last"'

test('querying a proper web link', function (t) {
  var res = query(link)
  t.deepEqual(
      query(link)
    , { next:
        { link: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100',
          page: '2',
          perPage: '100' },
        last:
        { link: ' https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100',
          page: '3',
          perPage: '100' } }
    , 'parses out link, page and perPage for next and last'
  )
  t.end()
  
})
