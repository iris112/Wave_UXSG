(function () {
    'use strict';

    /**
     * @param Base
     * @param {app.utils} utils
     * @return {Password}
     */
    const controller = function (Base, utils) {

        class Loginpassword extends Base {

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

        return new Loginpassword();
    };

    controller.$inject = ['Base', 'utils'];

    angular.module('app.ui').component('wLoginpassword', {
        bindings: {
            onSubmit: '&',
            password: '=',
            name: '='
        },
        templateUrl: 'modules/ui/directives/loginpassword/loginpassword.html',
        transclude: true,
        controller
    });
})();
