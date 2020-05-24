(function () {
    'use strict';

    /**
     * @param Base
     * @param {app.utils} utils
     * @return {Password}
     */
    const controller = function (Base, utils) {

        class Registeruser extends Base {

            constructor() {
                super();
                this.create = null;
                this.valid = false;
                this.confirmPassword = '';
            }

            $postLink() {
                this.receive(utils.observe(this.create, '$valid'), this._onChangeFormValid, this);
            }

            _onChangeFormValid() {
                this.valid = this.create.$valid;
            }
        }

        return new Registeruser();
    };

    controller.$inject = ['Base', 'utils'];

    angular.module('app.ui').component('wRegisteruser', {
        bindings: {
            onSubmit: '&',
            name: '=',
            fname: '=',
            lname: '=',
            email: '=',
            password: '='
        },
        templateUrl: 'modules/ui/directives/registeruser/registeruser.html',
        transclude: true,
        controller
    });
})();
