angular.module('2017Web').service('AlertService', ['$ionicPopup', function ($ionicPopup) {
    var self = this;
    self.alertPopup = function (title, alertMessage) {
        $ionicPopup.alert({
            title: title,
            template: alertMessage,
            buttons: [{
                text: '確定',
                type: 'button-dark',
            }]
        })
    }
}]);