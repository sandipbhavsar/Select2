'use strict';

/* Services */
angular.module('One23AdminApp.services', ['ngResource'])
    .factory('OpenApi', function ($resource) {

        var openApi = $resource(
            '/api/:controller/:id',
            [],
            {
                postLogOn: { method: 'POST', params: { controller: 'Account' } },
                postCustomer: { method: 'POST', params: { controller: 'Employee' } },
                getTrace: { method: 'GET', params: { controller: 'Trace' } },
                getInsightDatabase: { method: 'GET', params: { controller: 'InsightDBInfo' }, isArray: true },
                getEmployee: { method: 'GET', params: { controller: 'Employee' }, isArray: true },
                postDatabase: { method: 'POST', params: { controller: 'Database' } },
                getDatabase: { method: 'GET', params: { controller: 'Database' }, isArray: true },
                UpdateDatabase: { method: 'PUT', params: { controller: 'Database' }, isArray: true },
                UpdateEmployee: { method: 'PUT', params: { controller: 'Employee' }, isArray: true }
            }
        );
        return openApi;
    })
 .factory('OpenActionApi', function ($resource) {

     var openApi = $resource(
         '/api/:controller/:action/:id',
         {id:'@id'},
         {
             validateEmail: { method: 'POST', params: { controller: 'Employee', action: 'ValidateEmail' } }
         }
        );
     return openApi;
 })

.factory('TokenHandler', ['$http', '$rootScope', function (http, $rootScope) {

    var tokenHandler = {};
    var token = "none";

    // load token from web-storage. if found set it using .set() method else return false.
    tokenHandler.loadToken = function () {
        var authTokenText = sessionStorage.getItem('_123InsightToken');
        var authToken;
        if (authTokenText) {
            authToken = JSON.parse(authTokenText);
        } else {
            authTokenText = localStorage.getItem('_123InsightToken');
            if (authTokenText) {
                try {
                    authToken = JSON.parse(authTokenText);
                } catch (ex) {
                    console.log(authTokenText);
                    console.log(ex);
                }
            }
        }
        if (authToken) {
            tokenHandler.set(authToken);
            return true;
        }
        return false;
    };
    // will be called from Logoff.
    tokenHandler.unLoadToken = function () {
        console.log('unLoadToken called.');
        sessionStorage.removeItem('_123InsightToken');
        localStorage.removeItem('_123InsightToken');
        http.defaults.headers.common['Authorization-Token'] = null;
        $rootScope.IsSuperAdminRole = function () { return false; };
        $rootScope.IsAdminRole = function () { return false; };
        token = 'none';
        console.log('unLoadToken called.1');
    };
    
    // set token to local variable. set token to webStorage. Sets token to hTTP defaults. set token to rootScope which is used while loading menu.
    tokenHandler.set = function (success) {
        token = success.EncryptedToken;
        // ** following line will cause token to go in all subsequent http requests **
        http.defaults.headers.common['Authorization-Token'] = token;

        var userInfoText = JSON.stringify(success);
        sessionStorage.setItem('_123InsightToken', userInfoText);
        if (success.RememberMe === true) {
            console.log("storing in localstorage");
            localStorage.setItem('_123InsightToken', userInfoText);
        }
        if (success.Role === 'SuperAdmin') {
            $rootScope.IsSuperAdminRole = function () { return true; };
        } else {
            $rootScope.IsSuperAdminRole = function () { return false; };
        }
        if (success.Role === 'Admin') {
            $rootScope.IsAdminRole = function () { return true; };
        } else {
            $rootScope.IsAdminRole = function () { return false; };
        }
    };

    tokenHandler.get = function () {
        return token;
    };

    // wrap given actions of a resource to send auth token with every
    // request
    tokenHandler.wrapActions = function (resource, actions) {
        // copy original resource
        var wrappedResource = resource;
        for (var i = 0; i < actions.length; i++) {
            tokenWrapper(wrappedResource, actions[i]);
        };
        // return modified copy of resource
        return wrappedResource;
    };

    // wraps resource action to send request with auth token
    var tokenWrapper = function (resource, action) {
        // copy original action
        resource['_' + action] = resource[action];
        // create new action wrapping the original and sending token
        resource[action] = function (data, success, error) {
            return resource['_' + action](
              angular.extend({}, data || {}, { AuthToken: tokenHandler.get() }),
              success,
              error
            );
        };
    };
    return tokenHandler;
}])
   .factory('SecureApi', ['$resource', 'TokenHandler', function (res, tokHandler) {
       var secureApi = res(
        '/api/:controller/:action/:id',
        [],
        {
            getCustomerList: { method: 'GET', params: { controller: 'One23Customer', action: 'One23CustomerList' }, isArray: true },
            getInsightCustomer: { method: 'GET', params: { controller: 'One23Customer', action: "GetCustomerDetail" } },
            saveInsightCustomer: { method: 'POST', params: { controller: 'One23Customer' ,action: "Post"} },
            updateInsightCustomer: { method: 'PUT', params: { controller: 'One23Customer',action: "Put" } },
            saveSubscription: { method: 'POST', params: { controller: 'One23Customer', action: "SaveSubscription" } },
            updateSubscription: { method: 'PUT', params: { controller: 'One23Customer', action: "UpdateSubscription" } },
            getSubscription: { method: 'GET', params: { controller: 'One23Customer', action: "SubscribeCustomer" } }
            
        }
    );
       res = tokHandler.wrapActions(res, ["getInsightCustomer"], ["getCustomerList"]);

       return secureApi;
   }]);