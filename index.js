'use strict';

var qs = require('querystring')
  , url = require('url')
  , xtend = require('xtend');

const PARSE_LINK_HEADER_MAXLEN = parseInt(process.env.PARSE_LINK_HEADER_MAXLEN) || 2000;
const PARSE_LINK_HEADER_THROW_ON_MAXLEN_EXCEEDED = process.env.PARSE_LINK_HEADER_THROW_ON_MAXLEN_EXCEEDED != null

function hasRel(x) {
  return x && x.rel;
}

function intoRels (acc, x) {
  function splitRel (rel) {
    acc[rel] = xtend(x, { rel: rel });
  }

  x.rel.split(/\s+/).forEach(splitRel);

  return acc;
}

function createObjects (acc, p) {
  // rel="next" => 1: rel 2: next
  var m = p.match(/\s*(.+)\s*=\s*"?([^"]+)"?/)
  if (m) acc[m[1]] = m[2];
  return acc;
}

function parseLink(link) {
  try {
    var m         =  link.match(/<?([^>]*)>(.*)/)
      , linkUrl   =  m[1]
      , parts     =  m[2].split(';')
      , parsedUrl =  url.parse(linkUrl)
      , qry       =  qs.parse(parsedUrl.query);

    parts.shift();

    var info = parts
      .reduce(createObjects, {});
    
    info = xtend(qry, info);
    info.url = linkUrl;
    return info;
  } catch (e) {
    return null;
  }
}

function checkHeader(linkHeader){
  if (!linkHeader) return false;

  if (linkHeader.length > PARSE_LINK_HEADER_MAXLEN) {
    if (PARSE_LINK_HEADER_THROW_ON_MAXLEN_EXCEEDED) {
      throw new Error('Input string too long, it should be under ' + PARSE_LINK_HEADER_MAXLEN + ' characters.');
    } else {
        return false;
      }
  }
  return true;
}

module.exports = function (linkHeader) {
  if (!checkHeader(linkHeader)) return null;

  return linkHeader.split(/,\s*</)
   .map(parseLink)
   .filter(hasRel)
   .reduce(intoRels, {});
};
