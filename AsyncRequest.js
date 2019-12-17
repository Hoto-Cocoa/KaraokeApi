/**
 * @file AsyncRequest.js
 * @author Hoto Cocoa <cocoa@hoto.us>
 * @license AGPL-3.0
 * @param {String} uri
 * @param {(Object|null)} headers
 * @param {String} method
 * @param {(String|Object|null)} data
 * @param {String} encoding
 */

module.exports = (uri = null, headers = {}, method = 'GET', data = null, encoding = 'UTF-8') => new Promise((resolve, reject) => { require('request')({ method, uri, headers, body: data, encoding }, (error, response, body) => error? reject(error) : resolve(response, body))});