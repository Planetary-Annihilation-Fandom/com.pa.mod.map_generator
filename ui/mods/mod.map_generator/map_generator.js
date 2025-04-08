
const style_option_selected = 'selected';
const planet_size_description_map = [
    {
        value: 1,
        description: 'small'
    },
    {
        value: 2,
        description: 'medium'
    },
    {
        value: 3,
        description: 'large'
    }
]
const metal_count_description_map = [
    {
        value: 1,
        description: 'poor'
    },
    {
        value: 2,
        description: 'normal'
    },
    {
        value: 3,
        description: 'rich'
    }
]
const biome_description_map = [
    {
        value: 1,
        description: 'moon'
    },
    {
        value: 2,
        description: 'asteroid'
    },
    {
        value: 3,
        description: 'desert'
    },
    {
        value: 4,
        description: 'forest'
    },
    {
        value: 5,
        description: 'lava'
    },
    {
        value: 6,
        description: 'metallic'
    },
    {
        value: 7,
        description: 'snow'
    },
    {
        value: 8,
        description: 'random'
    }
]

const option_groups_map = [
    {
        id: 'option-group-planet_size'
    },
    {
        id: 'option-group-metal'
    },
    {
        id: 'option-group-biome'
    }
]

const default_generation_options = [
    {
        group_id: 'option-group-planet_size',
        option_value: 2
    },
    {
        group_id: 'option-group-metal',
        option_value: 2
    },
    {
        group_id: 'option-group-biome',
        option_value: 8
    }
]

function MapGeneratorModel() {
    var self = this;
}

MapGeneratorModel = new MapGeneratorModel();

$(function () {
    // 3 sec delay jquery
    awake();
    return

    $('head').append('<link rel="stylesheet" href="coui://ui/mods/map-generator/map_generator.css" type="text/css" />');

    var root = $('.system-options');
    var templatesRoot = $('<div id="ap-controls" class="box_highlight" data-bind="visible: canChangeSettings"></div>');
    // insert our panel to system options

    root.append(templatesRoot);

    ko.applyBindings(model, templatesRoot[0]);

    var table = $('<table></table>');

    var lastRow;

    var addToTable = function (element) {
        var row = $('<tr></tr>');
        var data = $('<td class="td"></td>');
        data.append(element);
        row.append(data)
        table.append(row);

        lastRow = row;
    }
    // Not working correctly (binding)
    var addToTableRow = function (element) {
        var data = $('<td class="td"></td>');
        data.append(element);
        lastRow.append(data);
        console.log("row is")
        console.log(lastRow[0])
    }

    function applyBindingsToLastRow() {
        ko.applyBindings(model, lastRow[0]);
    }

    var createButton = function (name, method) {
        var button = $(
            '<div class="btn_std_gray" data-bind="click: ' + method + '">' +
            '<div class="btn_std_label">' + name + '</div>' +
            '</div>');

        // ko.applyBindings(model, button[0])
        return button;
    }


    // templatesRoot.append($('<hr/>'))
    templatesRoot.append($('<label class="section_title_main"><b>Generate Planet</b></label>'))
    templatesRoot.append(table);

    // addToTable(button);
    var duelContainer = $('<div></div>')
    var duelButton = createButton('Small', 'generateSmall');
    var duelButton2 = createButton('Medium', 'generateMedium');
    var duelButton3 = createButton('Large', 'generateLarge');
    duelContainer.append(duelButton);
    duelContainer.append(duelButton2);
    duelContainer.append(duelButton3);

    // var arenaContainer = $('<div></div>')
    // var arenaButton = createButton('Small', 'generateBerserk');
    // var arenaButton2 = createButton('Medium', 'generateArena');
    // var arenaButton3 = createButton('Large', 'generateBattlefield');
    // arenaContainer.append(arenaButton);
    // arenaContainer.append(arenaButton2);
    // arenaContainer.append(arenaButton3);

    var specificContainer = $('<div></div>')
    var comboxButton = createButton("Combox", "generateCombox")
    var wadiyaButton = createButton("Wadiya", "generateWadiya")
    var wateriyaButton = createButton("Wateriya", "generateWateriya")
    specificContainer.append(comboxButton)
    specificContainer.append(wadiyaButton)
    specificContainer.append(wateriyaButton)


    addToTable($('<label class="section_title_inner_duel"><b>Template:</b></label>'))
    addToTableRow(duelContainer)
    applyBindingsToLastRow()
    // addToTable($('<label class="section_title_inner_arena"><b>FFA:</b></label>'))
    // addToTable(arenaContainer)
    addToTable($('<label class="section_title_inner_wadiya"><b>Specific:</b></label>'))
    addToTableRow(specificContainer)
    applyBindingsToLastRow()

    //ko.applyBindings(model, duelContainer);
    // ko.applyBindings(model, arenaContainer);
    //ko.applyBindings(model, specificContainer);

})

function awake() {
    // APPEND HTML
    $.get("coui://ui/mods/mod.map_generator/map_generator.html", function (html) {
        $('#system').append(html);
    })
}

// called from initialized html
function start() {
    var modification_data = load_modification_data_from_localStore();
    if (modification_data == null) {
        modification_data = create_default_modification_data();
        save_modification_data_to_localStore(modification_data);
    }

    select_user_or_default_options(_.cloneDeep(modification_data));

    console.log(modification_data)
}

function select_user_or_default_options(modification_data) {
    $().ready(function () {
        for (var i = 0; i < option_groups_map.length; i++) {
            var option_group_id = option_groups_map[i].id;
            var what_to_select_data = undefined;

            if (modification_data != null) {
                what_to_select_data = _.find(modification_data.options, { group_id: option_group_id });
            }

            var default_option_value_for_group =
                _.find(default_generation_options, { group_id: option_group_id });

            if (default_option_value_for_group === undefined) {
                default_option_value_for_group = {
                    group_id: option_group_id,
                    option_value: 1
                }
            }

            if (what_to_select_data === undefined) {
                what_to_select_data = {
                    group_id: option_group_id,
                    option_value: default_option_value_for_group.option_value
                }
                modification_data.options.push(what_to_select_data)
            }

            // console.log(option_group_id)
            var option_group = $('#' + option_group_id);
            // console.log(option_group[0])
            // console.log($(option_group).find("#option-group-header")[0])
            var option_set = $(option_group).find("#option-set");
            // console.log(option_set[0])
            // console.log(what_to_select_data)
            option_set.children("#option-control").each(function (index, option_control) {
                // im using "option_value - 1" cause buttons values and index correspond to each other
                if (index === what_to_select_data.option_value - 1) {
                    var option_button_element = $(option_control).find("#option-control-button")[0];
                    console.log("selecting " + option_group_id + " " + what_to_select_data.option_value);
                    selectOption(option_group_id, option_button_element, what_to_select_data.option_value);
                }
                // console.log(index)
                // console.log(jquery_element);
            })
        }

        save_modification_data_to_localStore(modification_data)
    })
}

function selectOption(option_group_id, option_button, option_value) {
    $().ready(function () {
        var option_group = $('#' + option_group_id);
        //console.log(group_element);

        var option_set = option_group.find("#option-set");

        // console.log(option_button);
        // console.log("option set");
        // console.log(option_set[0]);
        option_set.children("#option-control").each(function (index, jquery_element) {
            // console.log(element);
            // element is $(this)
            var button = $(jquery_element).find("#option-control-button");
            var highlight = $(jquery_element).find("#option-control-highlight");

            // add highlight or remove
            // im using button[0] because button is a jquery object and the first element is the vanilla button
            // console.log(button[0]);
            if (button[0] === option_button) {
                // console.log("found");
                $(button).addClass(style_option_selected).blur();
                $(button).children('img').addClass(style_option_selected);
                $(highlight).addClass(style_option_selected);

                update_modification_data_options(option_group_id, option_value);
            } else {
                // console.log("not found");
                $(button).removeClass(style_option_selected).blur();
                $(button).children('img').removeClass(style_option_selected);
                $(highlight).removeClass(style_option_selected);
            }
        })

        var option_data = handle_option(option_group_id, option_value);
        var option_group_description = $(option_group).find("#option-group-description");
        // console.log(option_data);
        if (option_data !== undefined) {
            option_group_description.html(option_data.description);
        }
    })
}

/**
 * Updates the option value for a specified option group in the modification data.
 * 
 * @param {string} options_group_id - The ID of the option group to update.
 * @param {number} option_value - The new value to set for the option group.
 */

function update_modification_data_options(options_group_id, option_value) {
    var modification_data = load_modification_data_from_localStore();
    var option_group_data = _.find(modification_data.options, { group_id: options_group_id });
    option_group_data.option_value = option_value;
    save_modification_data_to_localStore(modification_data)
}

function handle_option(option_group_id, option_value) {
    if (option_group_id == "option-group-planet_size") {
        return handle_planet_size_option(option_value);
    }
    if (option_group_id == "option-group-metal") {
        return handle_metal_count_option(option_value);
    }
    if (option_group_id == "option-group-biome") {
        return handle_biome_option(option_value);
    }

    return undefined
}

function handle_planet_size_option(option_value) {
    var option_description = _.find(planet_size_description_map, { value: option_value }).description;

    return {
        description: option_description
    }
}
function handle_metal_count_option(option_value) {
    var option_description = _.find(metal_count_description_map, { value: option_value }).description;

    return {
        description: option_description
    }
}
function handle_biome_option(option_value) {
    var option_description = _.find(biome_description_map, { value: option_value }).description;
    // console.log(option_value+" "+option_description)
    return {
        description: option_description
    }
}


function getRandomSeed() {
    return Math.floor(65536 * Math.random());
}

// min and max is inclusive (tatarstan)
function get_random_integer(min, max) {

    if (min == max)
        return max;

    min = Math.ceil(min);
    max++; // make max inclusive (tatarstan)
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive (stackoverflow)
}

function get_random_index_by_length(length) {
    return Math.floor(Math.random() * length);
}

function getRandomWeightedIndex(weights) {
    var index;
    for (index = 0; index < weights.length; index++)
        weights[index] += weights[index - 1] || 0;

    const random = Math.random() * weights[weights.length - 1];

    for (index = 0; index < weights.length; index++)
        if (weights[index] > random)
            break;

    // console.log('weighted random ' + index + ' : ' + random + ' : ' + weights)
    return index;
}
// TEMPLATES
// function generateSmall() {
//     console.log("fuck")
//     getRandomSystem('Small', [400, 500], getRandomBiome(), [30, 30]).then(function (system) {
//         model.system(system);
//         model.updateSystem(model.system());
//         model.changeSettings();
//         model.requestUpdateCheatConfig();
//     });
// }
// function generateMedium() {
//     getRandomSystem('Medium', [500, 700], getRandomBiome(), [30, 40]).then(function (system) {
//         model.system(system);
//         model.updateSystem(model.system());
//         model.changeSettings();
//         model.requestUpdateCheatConfig();
//     });
// }
// function generateLarge() {
//     getRandomSystem('Large', [700, 1300], getRandomBiome(), [40, 50]).then(function (system) {
//         model.system(system);
//         model.updateSystem(model.system());
//         model.changeSettings();
//         model.requestUpdateCheatConfig();
//     });
// }


// function generateCombox() {
//     getRandomSystem('Combox', [150, 350], getRandomBiome(), [100, 100],
//         createGenerationOptions(undefined, undefined, getRandomInt(40, 70))).then(function (system) {
//             model.system(system);
//             model.updateSystem(model.system());
//             model.changeSettings();
//             model.requestUpdateCheatConfig();
//         })
// }
// function generateWadiya() {
//     getRandomSystem('Wadiya', [600, 800], moonBiome, [80, 100],
//         createGenerationOptions(undefined, 0, undefined)).then(function (system) {
//             model.system(system);
//             model.updateSystem(model.system());
//             model.changeSettings();
//             model.requestUpdateCheatConfig();
//         })
// }
// function generateWateriya() {
//     getRandomSystem('Wateriya', [600, 800], getRandomBiome([earthBiome, tropicalBiome]), [80, 100],
//         createGenerationOptions(undefined, 70, undefined)).then(function (system) {
//             model.system(system);
//             model.updateSystem(model.system());
//             model.changeSettings();
//             model.requestUpdateCheatConfig();
//         })
// }
// // TEMPLATES END

// PLANET GENERATION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// PLANET GENERATION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// PLANET GENERATION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

/**
 * List of all default biomes.
 * @type {Array<string>}
 */
const biomes_id_list = [
    "earth_lite", // Earth
    "desert_lite", // Desert
    "lava_lite", // Lava
    "tropical_lite", // Tropical
    "moon_lite", // Moon
    "asteroid", // Asteroid
    "sandbox" // Sandbox
];



function generate() {
    getRandomSystem('Generated', get_generation_size(), get_random_biome_id(), get_metal_density(),
        get_additional_surface_parameters(undefined, undefined, undefined)).then(function (system) {
            model.system(system);
            model.updateSystem(model.system());
            model.changeSettings();
            model.requestUpdateCheatConfig();
        })
}


function get_generation_size(value) {
    if (value != undefined) {
        if (value.constructor == Array) {
            return get_random_integer(value[0], value[1]);
        } else {
            return value
        }
    }

    const size_option = get_generation_size_option();
    if (size_option == undefined) {
        return 404
    } else {
        if (size_option == 1) {
            return get_random_integer(400, 500)
        } else if (size_option == 2) {
            return get_random_integer(500, 650)
        }
        else if (size_option == 3) {
            return get_random_integer(650, 900)
        }
    }
}


function get_biome_id(biomes) {
    if (biomes == undefined) {
        return get_random_biome_id()
    } else if (typeof biomes === 'string') {
        return biomes;
    } else if (biomes.constructor == Array) {
        return get_random_biome_id(biomes);
    }

    const biome_option = get_biome_option();
    if (biome_option == undefined) {
        return biomes[0];
    } else {
        return biomes[biome_option - 1];
    }


}

function get_random_biome_id(biomes) {
    if (biomes == undefined) {
        biomes = get_all_possible_biomes_list();
        return biomes[get_random_index_by_length(biomes.length)];
    } else if (biomes.constructor == Array) {
        return biomes[get_random_index_by_length(biomes.length)];
    }
    return biomes;
}

/**
 * Returns the default list of all possible biomes.
 * @returns {Array<string>} - List of all possible biome ids.
 */
function get_all_possible_biomes_list() {
    const biomes = biomes_id_list
    return biomes
}

/**
 * Determines the metal density based on the provided value or the current metal option setting.
 * If an array is provided, it returns a random integer between the specified range.
 * If a single value is provided, it returns that value.
 * If no value is provided, it retrieves the metal option setting and returns a corresponding random density value.
 * 
 * @param {Array<number>|number|undefined} value - Optional. An array specifying a range or a single number for metal density.
 * @returns {number} - The determined metal density.
 */
function get_metal_density(value) {
    if (value != undefined) {
        if (value.constructor == Array) {
            return get_random_integer(value[0], value[1]);
        } else {
            return value
        }
    }
    const metal_option = get_generation_metal_option();
    if (metal_option == undefined) {
        return 0
    } else {
        if (metal_option == 1) {
            return get_random_integer(15, 20)
        } else if (metal_option == 2) {
            return get_random_integer(20, 30)
        } else if (metal_option == 3) {
            return get_random_integer(30, 40)
        }
    }
}




const earthBiome = "earth_lite"
const desertBiome = "desert_lite"
const lavaBiome = "lava_lite"
const tropicalBiome = "tropical_lite"
const moonBiome = "moon_lite"

const metalBiome = "metal"
const asteroidBiome = "asteroid"
// Expansion biomes
//const greenhouseBiome = "greenhouse"

// api.mods.getMounted("client", true).then(function (mods) {
//     var modMounted = function (modIdentifier) {
//       return _.some(mods, { identifier: modIdentifier });
//     };
//     // Shared Systems for Galactic War
//     if (modMounted("com.wondible.pa.gw_shared_systems"))

/**
 * Gets one of the predefined water generation options.
 * @returns {number} Either 0 (no water), a random number between 20 and 40 (random amount of water) or a random number between 40 and 70 (much water).
 */
function get_random_water_percentage() {
    const types = ["random", "nowater", "muchwater"]

    // Test that the weights are correct
    // var i = 0;
    // var r = 0;
    // var n = 0;
    // var m = 0;
    // for (i = 0; i < 1000; i++) {
    //     var type = types[getRandomWeightedIndex([60, 20, 20])]

    //     switch (type) {
    //         case "random": r++; break;
    //         case "nowater": n++; break;
    //         case "muchwater": m++; break;
    //     }
    // }
    // console.log('rand-' + r + ' no-' + n + ' much-' + m)

    const type = types[getRandomWeightedIndex([70, 10, 20])]
    switch (type) {
        case "random": return get_random_integer(25, 40); break;
        case "nowater": return 0; break;
        case "muchwater": return get_random_integer(40, 70); break;
    }

    return 0
}


/**
 * Returns an object with three properties: temperature, waterDepth, and height.
 * If any of the parameters are undefined, it will generate a random value for them.
 * @param {number} [temperature_0_100=Random] - The temperature of the planet, between 0 and 100.
 * @param {number} [waterDepth_0_70=Random] - The water depth of the planet, between 0 and 70.
 * @param {number} [height_20_60=Random] - The height of the planet, between 20 and 60.
 * @returns {Object} - An object with the temperature, waterDepth, and height properties.
 */
function get_additional_surface_parameters(temperature_0_100, waterDepth_0_70, height_20_60) {
    if (temperature_0_100 == undefined)
        temperature_0_100 = get_random_integer(0, 100)
    if (waterDepth_0_70 == undefined)
        waterDepth_0_70 = get_random_water_percentage();
    if (height_20_60 == undefined)
        height_20_60 = get_random_integer(20, 60);
    return { temperature: temperature_0_100, waterDepth: waterDepth_0_70, height: height_20_60 }
}

function getRandomSystem(planet_title, planet_size, biomeName, base_metal_density,
    additional_surface_parameters) {

    const slots = model.slots() || 2;
    var slotFactor = 10 / slots;

    if (additional_surface_parameters == undefined)
        additional_surface_parameters = get_additional_surface_parameters(undefined, undefined, undefined)

    console.log(biomeName + ' passed to the generation')

    // Gameplay
    var seed = getRandomSeed();

    // Planet surface
    const temperature = additional_surface_parameters.temperature;
    const waterDepth = additional_surface_parameters.waterDepth;
    const height = additional_surface_parameters.height;

    // Orbit parameter, does nothing but need to initialize
    var mass = 10000;

    const metal_calculation = calculate_metal(base_metal_density);

    var landingZoneSize = planet_size / 10;

    console.log("making planet settings")
    var planet = {
        mass: mass,
        intended_radius: planet_size,
        position_x: 50000,
        position_y: 0,
        velocity_x: 0,
        velocity_y: 100,
        starting_planet: true,
        required_thrust_to_move: 0,
        metalEstimate: 1,
        planet: {
            seed: seed,
            biome: biomeName,
            radius: planet_size,
            heightRange: height,
            waterHeight: waterDepth,
            waterDepth: 50,
            temperature: temperature,
            // i dont know what biomeScale does
            biomeScale: get_random_integer(50, 100),
            metalDensity: metal_calculation.metalDensity,
            metalClusters: metal_calculation.metalClusters,
            landingZoneSize: landingZoneSize,
            landingZonesPerArmy: Math.floor(slotFactor),
            numArmies: slots,
            symmetricalMetal: true,
            symmetricalStarts: true,
            symmetryType: "none"
        }
    }

    console.log(planet);

    const minplayers = slots, maxplayers = slots;
    var rSystem = {
        name: planet_title + ' R' + planet_size + ' MC' + metal_calculation.metalClusters + ' MD' + metal_calculation.metalDensity + ' W' + waterDepth,
        isRandomlyGenerated: true,
        players: [minplayers, maxplayers]
    };

    var planets = [planet];

    // Generate asteroids
    const orbit_from_planet = get_random_integer(4000,7000)
    planets = generate_asteroids(planets, orbit_from_planet)

    var pgen = _.map(planets, function (plnt, index) {
        var biomeGet = $.getJSON('coui://pa/terrain/' + plnt.planet.biome + '.json')
            .then(function (data) {
                return data;
            });
        var nameGet = $.Deferred();
        api.game.getRandomPlanetName().then(function (name) { nameGet.resolve(name); });
        return $.when(biomeGet, nameGet).then(function (biomeInfo, name) {
            plnt.name = name;
            return plnt;
        });
    });

    return $.when.apply($, pgen).then(function () {
        rSystem.planets = Array.prototype.slice.call(arguments, 0);
        return rSystem;
    });


    function calculate_metal(base_metal_density) {
        // Define base metal density and cluster values
        const baseMetalDensity = base_metal_density;
        const baseMetalClusters = base_metal_density;

        // Define the maximum metal density and cluster values
        const maxMetalDensity = 60;
        const maxMetalClusters = 60;

        // Define the rapid factor, which controls the rate at which the metal density and clusters increase
        // A smaller value will result in a more rapid increase, while a larger value will result in a more gradual increase
        // Reference values:
        //  - 2: Very rapid increase (e.g., 2 players: 15, 3 players: 30, 4 players: 45)
        //  - 5: Moderate increase (e.g., 2 players: 15, 3 players: 21, 4 players: 27)
        //  - 10: Gradual increase (e.g., 2 players: 15, 3 players: 16.5, 4 players: 18)
        const increaseFactor = 5;

        // Calculate the scaling factor based on the number of players
        var numPlayers = model.slots() || 2;
        // Formula: scalingFactor = 1 + (numPlayers - 2) / rapidFactor
        // This formula scales the metal density and clusters based on the number of players.
        // The rapidFactor variable controls the rate at which the scaling factor increases.
        var scalingFactor = Math.min(1 + (numPlayers - 2) / increaseFactor, 3); // scales from 1 to 3 as numPlayers increases from 2 to 7+

        // Calculate metal density and clusters, capping at the maximum values
        var metalDensity = Math.min(baseMetalDensity * scalingFactor, maxMetalDensity);
        var metalClusters = Math.min(baseMetalClusters * scalingFactor, maxMetalClusters);

        return {
            metalDensity: metalDensity,
            metalClusters: metalClusters
        };
    }

    // Функция для генерации астероидов и добавления их в массив планет
    function generate_asteroids(planets, orbit_from_planet) {
        // Константы для генерации астероидов
        // Генерация случайного количества астероидов (0–4)
        const asteroid_count = get_random_integer(0, 4);
        const radius_min = 150;                // Минимальный радиус астероида
        const radius_max = 400;               // Максимальный радиус астероида
        const metalDensityMin = 2;          // Минимальная плотность металла
        const metalDensityMax = 10;          // Максимальная плотность металла
        const requiredThrustToMoveMin = 0;   // Минимальное значение required_thrust_to_move
        const requiredThrustToMoveMax = 2;   // Максимальное значение required_thrust_to_move
        const fixedMassAsteroid = 5000;      // Фиксированная масса астероида
        const G = 1;                         // Предполагаемая гравитационная постоянная

        // Цикл для создания каждого астероида
        for (var i = 0; i < asteroid_count; i++) {
            // Случайный угол для позиции астероида на орбите (0–2π)
            // var theta = (i * 2 * Math.PI) / asteroid_count;
            var theta = (i * 2 * Math.PI) / asteroid_count + (Math.PI / asteroid_count) - (radius_max / orbit_from_planet);
            console.log("theta: " + theta + " i*2*Math.PI: " + (i * 2 * Math.PI)
                + " asteroid_count: " + asteroid_count + 
                " divide: " + (i * 2 * Math.PI) / asteroid_count);

            // Генерация радиуса с меньшей вероятностью больших значений (логарифмическое распределение)
            var radius = Math.exp(Math.random() * Math.log(radius_max / radius_min)) * radius_min;
            
            // Случайная плотность металла в диапазоне [15, 30]
            var metal_density = get_random_integer(metalDensityMin, metalDensityMax);

            // Случайное значение required_thrust_to_move в диапазоне [0, 2]
            var requiredThrustToMove = get_random_integer(requiredThrustToMoveMin, requiredThrustToMoveMax);

            // Расчет орбитальной скорости для круговой орбиты: v = sqrt(G * M / d)
            var orbitalSpeed = Math.sqrt(G * planets[0].mass / orbit_from_planet);

            // Компоненты скорости относительно центральной планеты
            var vxRel = -orbitalSpeed * Math.sin(theta);
            var vyRel = orbitalSpeed * Math.cos(theta);

            // Абсолютные скорости с учетом скорости центральной планеты
            var velocityX = planets[0].velocity_x + vxRel;
            var velocityY = planets[0].velocity_y + vyRel;

            // Позиция астероида на орбите
            var positionX = planets[0].position_x + orbit_from_planet * Math.cos(theta);
            var positionY = planets[0].position_y + orbit_from_planet * Math.sin(theta);

            console.log("Asteroid " + (i + 1) + " position: (" + positionX + ", " + positionY + ")");

            var additional_surface_parameters = get_additional_surface_parameters()
            // Создание объекта астероида
            var asteroid = {
                name: "Asteroid " + (i + 1),              // Уникальное имя астероида
                mass: fixedMassAsteroid,                // Фиксированная масса
                position_x: positionX,                  // Позиция по X
                position_y: positionY,                  // Позиция по Y
                velocity_x: velocityX,                  // Скорость по X
                velocity_y: velocityY,                  // Скорость по Y
                required_thrust_to_move: requiredThrustToMove, // Количество "трастеров"
                starting_planet: false,                 // Запрет спавна на астероиде
                planet: {
                    biome: "asteroid",                  // Биом астероида
                    seed: Math.floor(Math.random() * 100000), // Случайный seed
                    radius: radius,                     // Радиус астероида
                    heightRange: additional_surface_parameters.height,                     // Без высотных перепадов
                    waterHeight: additional_surface_parameters.waterDepth,                     // Без воды
                    temperature: additional_surface_parameters.temperature,                     // Температура (не используется)
                    metalDensity: metal_density,         // Плотность металла
                    metalClusters: metal_density,                  // Количество металлических кластеров
                    biomeScale: 100                     // Масштаб биома
                }
            };

            // Добавление астероида в массив планет
            planets.push(asteroid);
        }

        return planets; // Возвращаем обновленный массив планет (опционально)
    }
}

// DATA MANAGEMENT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// DATA MANAGEMENT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// DATA MANAGEMENT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

//modification_data:
// [ structure
// {
//     group_id: 'option-group-planet_size',
//     option_value: 2
// },
// ...
//]

/**
 * Gets the current planet size option value from the stored modification data. If the stored modification data doesn't have this option, returns the default option value.
 * @returns {number} The planet size option value.
 */
function get_generation_size_option() {
    const size = _.find(get_options(), { group_id: 'option-group-planet_size' });
    if (size == undefined)
        return _.find(default_generation_options, { group_id: 'option-group-planet_size' }).option_value;
    else
        return size.option_value;
}


/**
 * Gets the current metal option value from the stored modification data. If the stored modification data doesn't have this option, returns the default option value.
 * @returns {number} The metal option value.
 */
function get_generation_metal_option() {
    const metal = _.find(get_options(), { group_id: 'option-group-metal' });
    if (metal == undefined)
        return _.find(default_generation_options, { group_id: 'option-group-metal' }).option_value;
    else
        return metal.option_value;
}

/**
 * Gets the current biome option value from the stored modification data. If the stored modification data doesn't have this option, returns the default option value.
 * @returns {number} The biome option value.
 */
function get_generation_biome_option() {
    const biome = _.find(get_options(), { group_id: 'option-group-biome' });
    if (biome == undefined)
        return _.find(default_generation_options, { group_id: 'option-group-biome' }).option_value;
    else
        return biome.option_value;
}

function save_modification_data_to_localStore(modification_data) {
    localStorage.setItem('map_generator_data', JSON.stringify(modification_data));
}

/**
 * Loads the modification data from local storage and returns it. If the data does not exist in local storage, it returns undefined.
 * @returns {Object} The modification data or undefined if it does not exist in local storage.
 */
function load_modification_data_from_localStore() {
    var modification_data = JSON.parse(localStorage.getItem('map_generator_data'));
    console.log(modification_data);
    return modification_data;
}

/**
 * Retrieves the current modification options from local storage. 
 * If no valid modification data is found, initializes and returns default options.
 * 
 * @returns {Array} The list of option objects, either from modification data or default options.
 */

function get_options() {
    const modification_data = load_modification_data_from_localStore();
    if (modification_data == undefined || modification_data.options == undefined || modification_data.options.length == 0) {
        const default_modification_data = create_default_modification_data();
        default_modification_data.options = default_generation_options;
        save_modification_data_to_localStore(default_modification_data);
        return default_modification_data.options;
    } else {
        return modification_data.options;
    }
}

function create_default_modification_data() {
    return {
        options: []
    }
}
