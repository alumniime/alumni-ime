'use strict';

import angular from 'angular';

/**
 * The Util service is for thin, globally reusable, utility functions
 */
export function UtilService($window) {
  'ngInject';

  var Util = {
    /**
     * Return a callback or noop function
     *
     * @param  {Function|*} cb - a 'potential' function
     * @return {Function}
     */
    safeCb(cb) {
      return angular.isFunction(cb) ? cb : angular.noop;
    },

    /**
     * Parse a given url with the use of an anchor element
     *
     * @param  {String} url - the url to parse
     * @return {Object}     - the parsed url, anchor element
     */
    urlParse(url) {
      var a = document.createElement('a');
      a.href = url;

      // Special treatment for IE, see http://stackoverflow.com/a/13405933 for details
      if(a.host === '') {
        a.href = a.href;
      }

      return a;
    },

    /**
     * Test whether or not a given url is same origin
     *
     * @param  {String}           url       - url to test
     * @param  {String|String[]}  [origins] - additional origins to test against
     * @return {Boolean}                    - true if url is same origin
     */
    isSameOrigin(url, origins) {
      url = Util.urlParse(url);
      origins = origins && [].concat(origins) || [];
      origins = origins.map(Util.urlParse);
      origins.push($window.location);
      origins = origins.filter(function (o) {
        let hostnameCheck = url.hostname === o.hostname;
        let protocolCheck = url.protocol === o.protocol;
        // 2nd part of the special treatment for IE fix (see above):
        // This part is when using well-known ports 80 or 443 with IE,
        // when $window.location.port==='' instead of the real port number.
        // Probably the same cause as this IE bug: https://goo.gl/J9hRta
        let portCheck = url.port === o.port || o.port === '' && (url.port === '80' || url.port
          === '443');
        return hostnameCheck && protocolCheck && portCheck;
      });
      return origins.length >= 1;
    },

    /**
     * Make pretty urls
     */
    convertToSlug(str) {
      str = str.replace(/^\s+|\s+$/g, '') // trim
        .toLowerCase();
      // remove accents, swap ñ for n, etc
      var from = 'ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;';
      var to = 'aaaaaeeeeeiiiiooooouuuunc------';
      for(let i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
      }
      return str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes
    },

    /**
     * Make pretty names
     */
    nameCase(str) {
      if(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++) {
          if (!['e', 'y', 'da', 'de', 'di', 'do', 'das', 'dos'].includes(str[i])) {
            if (str[i].indexOf('d\'') === 0) {
              str[i] = 'd\'' + str[i].charAt(2).toUpperCase() + str[i].slice(3);
            } else {
              str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
            }
          }
        }
        return str.join(' ');
      } else return '';
    },
    
    /**
     * Concatenate location fields
     */
    getLocationName(location) {
      if(location) { 
        var locationName = (location.LinkedinName ? location.LinkedinName.replace(' Area,', ',') : '');
        if(location.country && (location.country.CountryId === 1 || (location.city && location.city.Description))) {
          locationName = (location.city.state ? `${location.city.Description} - ${location.city.state.Code}` : location.city.Description);
        } else {
          locationName = (location.country ? location.country.Description : '');
        }
      }
      return locationName || '';
    },

    invalidDate(input) {
      if (input) {
        var reg = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
        if (input && input.match(reg)) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
  
    invalidPastDate(input) {
      if (input) {
        var reg = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
        var arr = input.split('/');
        var date = new Date(arr[2], arr[1] - 1, arr[0]);
        if (input && input.match(reg) && date < Date.now()) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
  
    invalidFutureDate(input) {
      if (input) {
        var reg = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
        var arr = input.split('/');
        var date = new Date(arr[2], arr[1] - 1, arr[0]);
        if (input && input.match(reg) && date > Date.now()) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
  
    /**
     * Convert strings using crypto SHA256
     */
    SHA256(r) {
      function n(r, n) {
        var t = (65535 & r) + (65535 & n),
          e = (r >> 16) + (n >> 16) + (t >> 16);
        return e << 16 | 65535 & t;
      }

      function t(r, n) {
        return r >>> n | r << 32 - n;
      }

      function e(r, n) {
        return r >>> n;
      }

      function o(r, n, t) {
        return r & n ^ ~r & t;
      }

      function u(r, n, t) {
        return r & n ^ r & t ^ n & t;
      }

      function f(r) {
        return t(r, 2) ^ t(r, 13) ^ t(r, 22);
      }

      function a(r) {
        return t(r, 6) ^ t(r, 11) ^ t(r, 25);
      }

      function c(r) {
        return t(r, 7) ^ t(r, 18) ^ e(r, 3);
      }

      function i(r) {
        return t(r, 17) ^ t(r, 19) ^ e(r, 10);
      }

      function h(r, t) {
        var e,
          h,
          C,
          g,
          A,
          d,
          v,
          S,
          l,
          m,
          y,
          w,
          b = new Array(1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298),
          p = new Array(1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225),
          B = new Array(64);
        r[t >> 5] |= 128 << 24 - t % 32, r[(t + 64 >> 9 << 4) + 15] = t;
        for(var l = 0; l < r.length; l += 16) {
          e = p[0], h = p[1], C = p[2], g = p[3], A = p[4], d = p[5], v = p[6], S = p[7];
          for(var m = 0; 64 > m; m++) 16 > m ? B[m] = r[m + l] : B[m] = n(n(n(i(B[m - 2]), B[m - 7]), c(B[m - 15])), B[m - 16]), y = n(n(n(n(S, a(A)), o(A, d, v)), b[m]), B[m]), w = n(f(e), u(e, h, C)), S = v, v = d, d = A, A = n(g, y), g = C, C = h, h = e, e = n(y, w);
          p[0] = n(e, p[0]), p[1] = n(h, p[1]), p[2] = n(C, p[2]), p[3] = n(g, p[3]), p[4] = n(A, p[4]), p[5] = n(d, p[5]), p[6] = n(v, p[6]), p[7] = n(S, p[7]);
        }
        return p;
      }

      function C(r) {
        for(var n = Array(), t = (1 << d) - 1, e = 0; e < r.length * d; e += d) n[e >> 5] |= (r.charCodeAt(e / d) & t) << 24 - e % 32;
        return n;
      }

      function g(r) {
        r = r.replace(/\r\n/g, '\n');
        for(var n = '', t = 0; t < r.length; t++) {
          var e = r.charCodeAt(t);
          128 > e ? n += String.fromCharCode(e) : e > 127 && 2048 > e ? (n += String.fromCharCode(e >> 6 | 192), n += String.fromCharCode(63 & e | 128)) : (n += String.fromCharCode(e >> 12 | 224), n += String.fromCharCode(e >> 6 & 63 | 128), n += String.fromCharCode(63 & e | 128));
        }
        return n;
      }

      function A(r) {
        for(var n = v ? '0123456789ABCDEF' : '0123456789abcdef', t = '', e = 0; e < 4 * r.length; e++) t += n.charAt(r[e >> 2] >> 8 * (3 - e % 4) + 4 & 15) + n.charAt(r[e >> 2] >> 8 * (3 - e % 4) & 15);
        return t;
      }

      var d = 8,
        v = 0;
      if(r) {
        return r = g(r), A(h(C(r), r.length * d));
      } else {
        return r;
      }
    }

  };

  return Util;
}
