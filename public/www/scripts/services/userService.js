angular.module('2017Web').service('UserService', ['$rootScope', '$http', function ($rootScope, $http) {
    var self = this;

    self.register = function (user, onSuccess){
        $http.post($rootScope.istoreUrl + '/user', user).
            success(function (data, status, headers, config) {
                (onSuccess || angular.noop)(data);
            }).error(function (data, status, headers, config) {
                alert("Error - Data:" + data + " status:" + status);
            });
    }

    self.login = function (user, onSuccess) {
        $http.post($rootScope.istoreUrl + '/user/login', user).
            success(function (data, status, headers, config) {
                (onSuccess || angular.noop)(data);
            }).error(function (data, status, headers, config) {
                alert("Error - Data:" + data + " status:" + status);
            });
    };
}]);