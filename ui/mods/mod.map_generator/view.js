define(function (require) {
    
    var ViewModel = function () {
        var self = this;

        self.test_view_model = function () {
            console.log('test_view_model');
        }
    };

    return {
        html: require('text!./map_generator.html'),
        // assign view model constructor that need to be instantiated by caller
        view_model: new ViewModel()
    };
});