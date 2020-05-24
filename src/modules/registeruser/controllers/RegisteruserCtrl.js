(function () {
    'use strict';

    /**
     * @return {UserLoginCtrl}
     */
    const controller = function (Base, $scope, $http, $window) {

        const PATH = 'modules/registeruser/templates';
        const ORDER_LIST = [
            'registeruserData'
        ];

        class RegisteruserCtrl extends Base {

            constructor() {
                super($scope);
                this.name = '';
                this.fname = '';
                this.lname = '';
                this.email = '';
                this.password = '';
            }

            getDataUrl() {
                return `${PATH}/registeruserData.html`;
            }

            registerUser() {
                let data = {
                    user: this.name,
                    fname: this.fname,
                    lname: this.lname,
                    email: this.email,
                    pwd: this.password
                };

                $http({
                    url: "http://localhost:8081/api/registeruser/",
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

        return new RegisteruserCtrl();
    };

    controller.$inject = ['Base', '$scope', '$http', '$window'];

    angular.module('app.registeruser').controller('RegisteruserCtrl', controller);
})();
