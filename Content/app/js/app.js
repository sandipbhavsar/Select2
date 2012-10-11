'use strict';

// giving content path is necessary becauseit is hosted with webAPI
var partialsDir = './partials/';

// Declare app level module which depends on filters, and services
var One23AdminApp = angular.module('One23AdminApp', ['One23AdminApp.services', 'ui']);
    //binding of controller, view and URL.
    
One23AdminApp.config(['$routeProvider', function ($routeProvider) {    
    $routeProvider.when('/Default', { templateUrl: partialsDir + 'Select2.html', controller: DatabaseController });
}]);

