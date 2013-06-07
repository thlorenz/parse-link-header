'use strict';

var qs = require('querystring')
  , url = require('url');

module.exports = function (link) {
  if (!link) return null;

  var headers =  link.replace(/[<>]/g, '').split(',');
  if (headers.length < 2) return null;

  var parts1  =  headers[0].split(';')
    , parts2  =  headers[1].split(';')
    ;

  try {
    // TODO: check partsx[1] to find actual 'next' and 'last'
    var parsedNext = url.parse(parts1[0])
      , parsedLast = url.parse(parts2[0])

    var qnext = qs.parse(parts1[0])
      , qlast = qs.parse(parts2[0])
      , nextPage = parseInt(qnext.page, 10)
      , lastPage = parseInt(qlast.page, 10)

    return { 
        next: { link: parts1[0], page: nextPage, perPage: qnext['per_page'] }
      , last: { link: parts2[0], page: lastPage, perPage: qlast['per_page'] }
    };
  } catch (e) {
    return null;
  }
};
