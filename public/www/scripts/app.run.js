angular.module('2017Web').run(['$rootScope', function ($rootScope) {
    $rootScope.storeId = '24';
    var domain = 'https://ostore.herokuapp.com';
    //var domain = 'http://127.0.0.1:3000';
    $rootScope.url = domain + '/apps' + $rootScope.storeId + '/store';
}]);
