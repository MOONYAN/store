angular.module('2017Web').config(['$ionicConfigProvider', '$httpProvider', '$stateProvider', '$urlRouterProvider', function($ionicConfigProvider, $httpProvider, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/user');
    $stateProvider
        .state('user', {
            url: '/user',
            cache: false,
            templateUrl: 'views/user.html',
            controller: 'UserController',
            controllerAs: 'userCtrl'
        })
        .state('account', {
            url: '/account',
            cache: false,
            templateUrl: 'views/account.html',
            controller: 'AccountController',
            controllerAs: 'accountCtrl',
            params: {
                account: null
            }
        });
    $ionicConfigProvider.tabs.position('bottom');
    $httpProvider.interceptors.push('tokenInterceptor');
}]);
