'use strict';

var qs = require('querystring')
  , url = require('url')
  , xtend = require('xtend');

function parseLink(link) {
  try {
    var parts     =  link.split(';')
      , linkUrl   =  parts.shift().replace(/[<>]/g, '')
      , parsedUrl =  url.parse(linkUrl)
      , qry       =  qs.parse(parsedUrl.query);

    var info = parts
      .reduce(function (acc, p) {
        // rel="next" => 1: rel 2: next
        var m = p.match(/ *(.+) *= *"(.+)"/)
        if (m) acc[m[1]] = m[2];
        return acc;
      }, {});
    
    info = xtend(qry, info);
    info.url = linkUrl;
    return info;
  } catch (e) {
    return null;
  }
}

module.exports = function (linkHeader) {
   if (!linkHeader) return null;

   return linkHeader.split(/,\s*</)
    .map(parseLink)
    .filter(function (x) { return x && x.rel; })
    .reduce(function (acc, x) {
      acc[x.rel] = x;
      return acc;
    }, {});
};
