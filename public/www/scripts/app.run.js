angular.module('2017Web').run(['$rootScope', function ($rootScope) {
    $rootScope.storeId = '24';
    var domain = 'https://ostore.herokuapp.com';
    //var domain = 'http://192.168.50.86:3024';
    $rootScope.url = domain + '/apps' + $rootScope.storeId + '/store';
}]);
