'use strict';
//////////////////////////////////////////////////////////////*** logincontroller ***//////////////////////////////////////////////////////
function logincontroller($scope, OpenApi, SecureApi, TokenHandler, $location, $rootScope) {
    
    if ($location.path().indexOf('LogOff')) {
        console.log('logout called.');
        TokenHandler.unLoadToken();
        $location.path('/Login');
    }

    $scope.postLogon = function () {

        var rememberMe = $scope.logon.RememberMe;
        OpenApi.postLogOn({}, $scope.logon, function (success) {
            console.log("Value of remember me" + rememberMe);
            success.RememberMe = rememberMe;
            TokenHandler.set(success);
            if (success.Role === 'SuperAdmin') {
                $location.path('/InsightCustomerList');
            } else {
                $location.path('/Default');
            }

        }, function (error) {
            console.log(error);
            if (error.data === 'Incorrect Username' || error.data === 'Incorrect Password') {
                $scope.ErrorMessage = "Username or Password is incorrect";
            }
            console.log("Logon Unsuccessful");
        });
    };
}

logincontroller.$inject = ['$scope', 'OpenApi', 'SecureApi', 'TokenHandler', '$location', '$rootScope'];

//////////////////////////////////////////////////////////////*** SubscribeController ***//////////////////////////////////////////////////////
function SubscribeController($scope, secureApi, $location, $routeParams) {
    
    if ($routeParams.Id !== undefined) {
        secureApi.getSubscription({ id: $routeParams.Id }, function (result) {
            $scope.subscription = result;
        }, function (error) {
            console.log(error.data);
        });
    } else {
        $scope.subscription = { };
    }
    $scope.saveSubscription = function() {
        if ($scope.subscription.Id === undefined || $scope.subscription.Id === 0) {
            //create new.
            
            secureApi.saveSubscription({}, $scope.subscription, function (success) {
                console.log("successfully save subscription Detail");
                $location.path('/InsightCustomerList');
            }, function(error) {
                console.log(error);
            });
        } else {
            //update existing.
            secureApi.updateSubscription({ id: $scope.subscription.Id }, $scope.subscription, function (success) {
                console.log("successfully updated subscription Detail");
                $location.path('/InsightCustomerList');
            }, function(error) {
                console.log(error);
            });
        }
    };
}

SubscribeController.$inject = ['$scope', 'SecureApi', '$location', '$routeParams'];
//////////////////////////////////////////////////////////////*** SignupController ***//////////////////////////////////////////////////////
function SignupController($scope, OpenApi,OpenActionApi, $location) {
    $scope.signUpHelper = new SignUpHelper();
    $scope.IAddress1Error = false;
    
    $scope.addressHasError = function () {
        var errorMessage = false;
        
        if ($scope.customer.Address !== undefined) {
            if ($scope.signUpHelper.addressHasNoData($scope.customer.Address)) {
                $scope.customer.Address = undefined;
            } else if (!$scope.customer.Address.Line1) {
                errorMessage = $scope.IAddress1Error = true;
            }
        }
        return errorMessage;
    };

    $scope.saveCustomer = function () {
        if (!$scope.signUpHelper.validateCustomer() && $scope.addressHasError()) {
            $scope.ErrorMsgs = "Please correct form errors first.";
            //console.log("validateCustomer result" + $scope.signUpHelper.validateCustomer());
            //console.log("addressHasError result" + $scope.addressHasError());
            //console.log('inside saveCustomer after error');
            return $scope.ErrorMsgs;
        }
        OpenApi.postCustomer({}, $scope.customer, function (success) {
            $location.path('/Default');
        }, function (error) {
            console.log(error);
        });
    };
}

SignupController.$inject = ['$scope', 'OpenApi', 'OpenActionApi', '$location'];

//////////////////////////////////////////////////////////////*** DefaultController ***//////////////////////////////////////////////////////
function DefaultController($scope, OpenApi, SecureApi, TokenHandler) {


}
DefaultController.$inject = ['$scope', 'OpenApi', 'SecureApi', 'TokenHandler'];


//////////////////////////////////////////////////////////////*** InsightCustomerController & DetailController ***//////////////////////////////////////////////////////
function InsightCustomerController($scope, secureApi) {
        var data = secureApi.getCustomerList();
        $scope.customers = data;
}

InsightCustomerController.$inject = ['$scope', 'SecureApi'];

function InsightCustomerDetailController($scope, secureApi, $routeParams, $location) {
    $scope.signUpHelper = new SignUpHelper();
    if ($routeParams.Id !== undefined) {
        secureApi.getInsightCustomer({ id: $routeParams.Id }, function (result) {
            $scope.customer = result;
            $scope.customer.AdminEmployee.Email2 = $scope.customer.AdminEmployee.EmailId;
            $scope.customer.AdminUser.Password1 = $scope.customer.AdminUser.Password;


        }, function (error) {
            console.log(error.data);
        });
    } else {
        $scope.customer = { IsActive: true };
    }

    $scope.deliveryEqualInvoiceAdd = function () {
        if ($scope.customer.InvoiceAddress !== undefined) {
            $scope.customer.DeliveryAddress = $scope.customer.DeliveryAddress || {};
            angular.copy($scope.customer.InvoiceAddress, $scope.customer.DeliveryAddress);
        }
    };
    $scope.addressHasError = function () {
        var errorMessage = false;
        $scope.IAddress1Error = false;
        $scope.IDelivery1Error = false;
        $scope.ICEmpAddress1Error = false;

        if ($scope.customer.InvoiceAddress !== undefined) {
            if ($scope.signUpHelper.addressHasNoData($scope.customer.InvoiceAddress)) {
                $scope.customer.InvoiceAddress = undefined;
            } else if (!$scope.customer.InvoiceAddress.Line1) {
                errorMessage = $scope.IAddress1Error = true;
                //  $location.path("/InsightCustomerList#AddressDiv");
            }
        }


        if ($scope.customer.DeliveryAddress !== undefined) {
            if ($scope.signUpHelper.addressHasNoData($scope.customer.DeliveryAddress)) {
                $scope.customer.DeliveryAddress = undefined;
            } else if (!$scope.customer.DeliveryAddress.Line1) {
                errorMessage = $scope.IDelivery1Error = true;
                //   $location.path("/InsightCustomerList#AddressDiv");
            }
        }
        if ($scope.customer.AdminEmployee.Address !== undefined) {
            if ($scope.signUpHelper.addressHasNoData($scope.customer.AdminEmployee.Address)) {
                $scope.customer.AdminEmployee.Address = undefined;
            } else if (!$scope.customer.AdminEmployee.Address.Line1) {
                errorMessage = $scope.ICEmpAddress1Error = true;
            }
        }
        return errorMessage;
    };

    $scope.saveInsightCustomer = function () {
        var errorMsg = this.addressHasError();
        if (errorMsg) {
            $scope.AddressErrorText = errorMsg;
            console.log(errorMsg);
            return;
        }
        if ($scope.customer.Id === undefined) {
            //create new.
            secureApi.saveInsightCustomer({}, $scope.customer, function (success) {
                console.log("successfully save insightCustomer Detail");
                $location.path('/InsightCustomerList');
            }, function (error) {
                console.log(error);
            });
        } else {
            //update existing.
            secureApi.updateInsightCustomer({ id: $scope.customer.Id }, $scope.customer, function (success) {
                console.log("successfully updated insightCustomer Detail");
                $location.path('/InsightCustomerList');
            }, function (error) {
                console.log(error);
            });
        }

    };
}
InsightCustomerDetailController.$inject = ['$scope', 'SecureApi', '$routeParams', '$location'];

//////////////////////////////////////////////////////////////*** SignUpHelper ***//////////////////////////////////////////////////////

function SignUpHelper() {
    var pwdMismatchErrorText = 'Please enter matching password as above.';
    var emailMismatchErrorText = 'Please enter matching email address as above.';
    this.passwordMismatchError = '';
    this.emailMismatchError = '';

    this.addressHasNoData = function (address) {
        if (!address.Line1 && !address.Line2 && !address.Line3 && !address.City && !address.State && !address.Country && !address.PostalCode) {
            return true;
        }
        return false;
    };

    this.validateCustomer = function () {
        var finalFlag = true;

        if (!this.isUserEmailMatching()) {
            finalFlag = false;
        }
        if (!this.isUserPasswordMatching()) {
            finalFlag = false;
        }
        return finalFlag;
    };
    this.isUserEmailMatching = function (customer) {
      
        if (customer === undefined) {
            return true;
        }
        if (customer.EmailId === customer.Email2) {
            this.emailMismatchError = '';
            return true;
        }
        this.emailMismatchError = emailMismatchErrorText;

        return false;
    };
    this.isUserPasswordMatching = function (customer) {
        if (customer === undefined || customer.AdminUser === undefined)
            return true;
        if (customer.AdminUser.Password === customer.AdminUser.Password1) {
            this.passwordMismatchError = '';
            return true;
        }
        this.passwordMismatchError = pwdMismatchErrorText;
        return false;
    };
}

