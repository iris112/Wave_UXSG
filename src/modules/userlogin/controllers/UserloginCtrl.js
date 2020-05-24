(function () {
    'use strict';

    /**
     * @return {UserLoginCtrl}
     */
    const controller = function (Base, $scope, $http, $window) {

        const PATH = 'modules/userlogin/templates';
        const ORDER_LIST = [
            'userloginData'
        ];

        class UserloginCtrl extends Base {

            constructor() {
                super($scope);
                this.name = '';
                this.password = '';
                this.isLogin = false;
            }

            getDataUrl() {
                return `${PATH}/userloginData.html`;
            }

            verifyuser() {
                const token = JSON.parse($window.localStorage.getItem('user-session'));
                let data = {
                    token: token
                };

                let obj = this;
                $http({
                    url: "http://localhost:8081/api/userverify/",
                    method: "POST",
                    data: data
                }).then(function successCallback(response) {
                        if (response.data['status'] == 'ok')
                            $window.location.href = 'http://localhost:8081/userprofile'
                        else
                            obj.isLogin = true;
                    }, function errorCallback(response) {
                        $window.alert(response.statusText);
                });

            }

            userLogin() {
                let data = {
                    user: this.name,
                    pwd: this.password
                };

                $http({
                    url: "http://localhost:8081/api/userlogin/",
                    method: "POST",
                    data: data
                }).then(function successCallback(response) {
                        if (response.data['status'] == 'ok') {
                            $window.location.href = 'http://localhost:8081/userprofile'
                            $window.localStorage.setItem('user-session', response.data['data']['session_id']);
                        }
                        else
                            $window.alert(response.data['result']);
                    }, function errorCallback(response) {
                        $window.alert(response.statusText);
                });
            }
        }

        return new UserloginCtrl();
    };

    controller.$inject = ['Base', '$scope', '$http', '$window'];

    angular.module('app.userlogin').controller('UserloginCtrl', controller);
})();
