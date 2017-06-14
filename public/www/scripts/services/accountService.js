angular.module('2017Web').service('AccountService', ['$rootScope', '$http', function ($rootScope, $http) {
    var self = this;

    self.register = function (account, onSuccess){
        $http.post($rootScope.url + '/account', account).
            success(function (data, status, headers, config) {
                (onSuccess || angular.noop)(data);
            }).error(function (data, status, headers, config) {
                alert("Error - Data:" + data + " status:" + status);
            });
    }

    self.login = function (account, onSuccess) {
        $http.post($rootScope.url + '/account/login', account).
            success(function (data, status, headers, config) {
                (onSuccess || angular.noop)(data);
            }).error(function (data, status, headers, config) {
                alert("Error - Data:" + data + " status:" + status);
            });
    };
}]);