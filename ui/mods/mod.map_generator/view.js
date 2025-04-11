define(function (require) {
    return {
        html: require('text!./map_generator.html'),
        view_model: {
            test_view_model: function () {
                console.log('test_view_model');
            }
        }
    };
});