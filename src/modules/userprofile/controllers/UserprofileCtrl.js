(function () {
    'use strict';

    /**
     * @return {UserLoginCtrl}
     */
    const controller = function (Base, $scope, $http, $window) {

        const PATH = 'modules/userprofile/templates';
        const ORDER_LIST = [
            'userprofileData'
        ];

        class UserprofileCtrl extends Base {

            constructor() {
                super($scope);
            }

            getDataUrl() {
                return `${PATH}/userprofileData.html`;
            }

            logout() {
                const token = JSON.parse($window.localStorage.getItem('user-session'));
                let data = {
                    token: token
                };

                $http({
                    url: "http://localhost:8081/api/userlogout/",
                    method: "POST",
                    data: data
                }).then(function successCallback(response) {
                        if (response.data['status'] == 'ok')
                            $window.location.href = 'http://localhost:8081/userlogin'
                        else
                            $window.alert(response.data['result']);
                    }, function errorCallback(response) {
                        $window.alert(response.statusText);
                });
            }
        }

        return new UserprofileCtrl();
    };

    controller.$inject = ['Base', '$scope', '$http', '$window'];

    angular.module('app.userprofile').controller('UserprofileCtrl', controller);
})();
