(function () {
    'use strict';

    /**
     * @param Base
     * @param {app.i18n} i18n
     * @param $attrs
     * @return {LeasingBlock}
     */
    const controller = function (Base, i18n, $attrs, $element) {

        class LeasingBlock extends Base {

            constructor() {
                super();
                this.titleLiteral = $attrs.titleLocale;
                i18n.translateField(this, 'titleLiteral', 'title', i18n.getNs($element));
            }

        }

        return new LeasingBlock();
    };

    controller.$inject = ['Base', 'i18n', '$attrs', '$element'];

    angular.module('app.wallet.meetup').component('wLeasingBlock', {
        bindings: {
            titleLocale: '@'
        },
        templateUrl: 'modules/wallet/modules/meetup/directives/meetupBlock/meetupBlock.html',
        transclude: true,
        controller
    });
})();
