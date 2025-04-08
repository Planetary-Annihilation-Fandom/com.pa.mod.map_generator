define(function () {
    return {
        test_data: function () {
            console.log("data.js testing called");
        },
        create_empty: function () {
            return {
                options: []
            }
        },

        /**
         * Saves the modification data to local storage. This data is used to select the previously selected options
         * @param {Object} modification_data - The modification data to save. Should have a field "options" which is an array of objects.
         * The objects should have fields "group_id" and "option_value" for the group id and selected option value respectively.
         */
        save: function (modification_data) {
            localStorage.setItem('map_generator_data', JSON.stringify(modification_data));
        },

        /**
         * Loads the modification data from local storage and returns it. If the data does not exist in local storage, it returns undefined.
         * @returns {Object} The modification data or undefined if it does not exist in local storage.
         */
        load: function () {
            var modification_data = JSON.parse(localStorage.getItem('map_generator_data'));
            console.log(modification_data);
            return modification_data;
        },
        
        /**
        * Retrieves the current modification options from local storage. 
        * If no valid modification data is found, initializes and returns default options.
        * 
        * @returns {Array} The list of option objects, either from modification data or default options.
        */
        get_options: function () {
            const modification_data = this.load();
            if (modification_data == undefined || modification_data.options == undefined || modification_data.options.length == 0) {
                const default_modification_data = this.create_empty();
                default_modification_data.options = default_generation_options;
                this.save(default_modification_data);
                return default_modification_data.options;
            } else {
                return modification_data.options;
            }
        }
    }
});