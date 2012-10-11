

One23AdminApp.directive('modelonblur', ['OpenActionApi', function (openActionApi) {

    var linker = function ($scope, element, attr, ngModelCtrl) {
        $scope.emailExistsError = false;
        if (attr.type === 'radio' || attr.type === 'checkbox') return;

        if (attr.type === 'email') {
            element.unbind('input').unbind('keydown').unbind('change');
            element.bind('blur', function () {
                $scope.elevalue = element.val();
                ngModelCtrl.$setViewValue(element.val());

                openActionApi.validateEmail({ id: $scope.elevalue }, function (result) {
                    if (result.Success === true) {
                        $scope.emailExistsError = false;
                    } else {
                        $scope.emailExistsError = true;
                    }
                });

            });
        }
    };
    return {
        restrict: 'A',
        require: 'ngModel',
        link: linker
    };
}]);
One23AdminApp.directive('chosen', function () {
    var linker = function ($scope, element, attr) {
        $scope.$watch(attr.datasource, function () {
            element.trigger('liszt:updated');
        });
        element.chosen();
        //element.chosen({ allow_single_deselect: true });
    };

    return {
        restrict: 'A',
        link: linker
    }
});

