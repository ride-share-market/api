'use strict';

var assert = require('assert'),
  R = require('ramda');

//function userFormat(obj) {
//  return [{
//    _id: obj[0]._id,
//    provider: obj[0].currentProvider,
//    displayName: obj[0].providers[obj[0].currentProvider].displayName,
//    url: obj[0].providers[obj[0].currentProvider].url,
//    image: obj[0].providers[obj[0].currentProvider].image.url
//  }];
//}

module.exports = function (obj) {
  assert.equal(typeof (obj), 'object', 'argument obj must be an object');

  // Filters to extract values from received stored OAuth objects
  var providerFilters = {
    google: function (providers) {
      return {
        displayName: providers.google.displayName,
        url: providers.google.url,
        image: providers.google.image.url
      };
    },
    facebook: function (providers) {
      return {
        displayName: providers.facebook.name,
        url: providers.facebook.link,
        image: 'https://graph.facebook.com/' + providers.facebook.id + '/picture'
      };
    },
    linkedin: function (providers) {
      return {
        displayName: providers.linkedin.name,
        url: providers.linkedin.publicProfileUrl,
        image: providers.linkedin.pictureUrl
      };
    }


  };

  /**
   * providerFilters object - the filter object with methods to extract user data
   * providers object - the stored user oauth provider data (google, facebook etc)
   * filterName string - the name of the providerFilters filter to apply to the providers object
   */
  var curriedApplyProviderFilter = R.curry(function (providerFilters, providers, filterName) {
    return providerFilters[filterName](providers);
  });
  // Function that requires a filterName
  var applyProviderFilter = curriedApplyProviderFilter(providerFilters, obj[0].providers);

  /**
   * applyProviderFilter Function - curried function that requires a filter name
   * name String - name of the filter to apply to the applyProviderFilter
   */
  var curriedApplyFilters = R.curry(function (applyProviderFilter, name) {
      var provider = Object.create({});
      provider[name] = applyProviderFilter(name);
      return provider;
    }
  );

  // Function that requires a filterName
  var applyFilters = curriedApplyFilters(applyProviderFilter);

  var filterUserProviders = R.compose(
    R.map(applyFilters),
    R.keys()
  );

  return {
    _id: obj[0]._id,
    providers: filterUserProviders(obj[0].providers)
  };

};
