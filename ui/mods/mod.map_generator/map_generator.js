// Посмотреть premade_systems.js Там описаны все свойства планет, которые можно определить при генерации.
// ____________________________________________________________________
// We need to load the other modules (files) in the context of
// `tatapstar_map_generator` instead of `main` so that we can use relative
// paths to the other files.
//
// The context is automatically set to `main` when the game is loaded, and
// all scripts are loaded in the context of `main`.
//
// We need to load `math.js` in the context of `tatapstar_map_generator` so
// that we can use relative paths to load the other files.
const require_other_files = require.config({
    context: "tatapstar_map_generator",
    waitSeconds: 0,
    baseUrl: 'coui://ui/mods/mod.map_generator'
});

// modules
var _math;
var _data;

const style_option_selected = 'selected';
const planet_size_description_map = [
    {
        value: 1,
        name: 'small'
    },
    {
        value: 2,
        name: 'medium'
    },
    {
        value: 3,
        name: 'large'
    }
]
const metal_count_description_map = [
    {
        value: 1,
        name: 'poor'
    },
    {
        value: 2,
        name: 'normal'
    },
    {
        value: 3,
        name: 'rich'
    }
]
const biome_map = [
    {
        value: 1,
        name: 'moon'
    },
    {
        value: 2,
        name: 'asteroid'
    },
    {
        value: 3,
        name: 'desert'
    },
    {
        value: 4,
        name: 'forest'
    },
    {
        value: 5,
        name: 'lava'
    },
    {
        value: 6,
        name: 'metallic'
    },
    {
        value: 7,
        name: 'snow'
    },
    {
        value: 8,
        name: 'random'
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

$(function () {
    awake();
    return
})

function awake() {
    // loading modules first to ensure they are loaded
    require_other_files(['./math', './data'], function (math, data) {
        _math = math;
        _data = data;

        // APPEND HTML
        $.get("coui://ui/mods/mod.map_generator/map_generator.html", function (html) {
            $('#system').append(html);
        })
    })
}

// called from initialized html
function start() {
    var modification_data = _data.load();
    if (modification_data == null) {
        modification_data = _data.create_empty();
        _data.save(modification_data);
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

        _data.save(modification_data)
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
            option_group_description.html(option_data.name);
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
    var modification_data = _data.load();
    var option_group_data = _.find(modification_data.options, { group_id: options_group_id });
    option_group_data.option_value = option_value;
    _data.save(modification_data)
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
    var option_description = _.find(planet_size_description_map, { value: option_value }).name;

    return {
        name: option_description
    }
}
function handle_metal_count_option(option_value) {
    var option_description = _.find(metal_count_description_map, { value: option_value }).name;

    return {
        name: option_description
    }
}
function handle_biome_option(option_value) {
    var option_description = _.find(biome_map, { value: option_value }).name;
    // console.log(option_value+" "+option_description)
    return {
        name: option_description
    }
}

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
    "sandbox", // Sandbox
    "metal"
];



function generate() {

    // TODO: use biome generation option
    const biome = get_generation_biome();
    var biome_id;
    var temperature;

    switch (biome.name) {
        case 'moon':
            // Handle moon biome
            biome_id = 'moon_lite';
            break;
        case 'asteroid':
            // Handle asteroid biome
            biome_id = 'asteroid';
            break;
        case 'desert':
            // Handle desert biome
            biome_id = 'desert_lite';
            break;
        case 'forest':
            // Handle forest biome
            temperature = _math.random_integer(35, 65)
            if (temperature < 50) {
                biome_id = 'earth_lite';
            } else {
                biome_id = 'tropical_lite';
            }
            break;
        case 'lava':
            // Handle lava biome
            biome_id = 'lava_lite';
            break;
        case 'metallic':
            // Handle metallic biome
            biome_id = 'metal';
            break;
        case 'snow':
            // Handle snow biome
            biome_id = 'earth_lite';
            temperature = _math.random_integer(0, 0)
            break;
        case 'random':
            // Handle random biome
            biome_id = get_random_biome_id();
            break;
        default:
            // Handle unknown biome
            biome_id = get_random_biome_id();
            break;
    }

    console.log(biome);
    console.log(biome_id);

    getRandomSystem('Generated', get_generation_size(), biome_id, get_metal_density(),
        get_additional_surface_parameters(temperature, undefined, undefined)).then(function (system) {
            model.system(system);
            model.updateSystem(model.system());
            model.changeSettings();
            model.requestUpdateCheatConfig();
        })
}


function get_generation_size(value) {
    if (value != undefined) {
        if (value.constructor == Array) {
            return _math.random_integer(value[0], value[1]);
        } else {
            return value
        }
    }

    const size_option = get_generation_size_option();
    if (size_option == undefined) {
        return 404
    } else {
        if (size_option == 1) {
            return _math.random_integer(400, 500)
        } else if (size_option == 2) {
            return _math.random_integer(500, 650)
        }
        else if (size_option == 3) {
            return _math.random_integer(650, 900)
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
        return biomes[_math.random_index(biomes.length)];
    } else if (biomes.constructor == Array) {
        return biomes[_math.random_index(biomes.length)];
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
            return _math.random_integer(value[0], value[1]);
        } else {
            return value
        }
    }
    const metal_option = get_generation_metal_option();
    if (metal_option == undefined) {
        return 0
    } else {
        if (metal_option == 1) {
            return _math.random_integer(15, 20)
        } else if (metal_option == 2) {
            return _math.random_integer(20, 30)
        } else if (metal_option == 3) {
            return _math.random_integer(30, 40)
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

    const type = types[_math.random_weighted_index([70, 10, 20])]
    switch (type) {
        case "random": return _math.random_integer(25, 40); break;
        case "nowater": return 0; break;
        case "muchwater": return _math.random_integer(40, 70); break;
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
        temperature_0_100 = _math.random_integer(0, 100)
    if (waterDepth_0_70 == undefined)
        waterDepth_0_70 = get_random_water_percentage();
    if (height_20_60 == undefined)
        height_20_60 = _math.random_integer(20, 60);
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
    var seed = _math.new_seed();

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
            biomeScale: _math.random_integer(50, 100),
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
    const orbit_from_planet = _math.random_integer(4000, 7000)
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
        const asteroid_count = _math.random_integer(0, 4);
        const radius_min = 150;                // Минимальный радиус астероида
        const radius_max = 400;               // Максимальный радиус астероида
        const metalDensityMin = 2;          // Минимальная плотность металла
        const metalDensityMax = 10;          // Максимальная плотность металла
        const requiredThrustToMoveMin = 0;   // Минимальное значение required_thrust_to_move
        const requiredThrustToMoveMax = 2;   // Максимальное значение required_thrust_to_move
        const fixedMassAsteroid = 5000;      // Фиксированная масса астероида
        const G = 1;                         // Предполагаемая гравитационная постоянная

        const theta_derivation_degrees = 45;

        // Цикл для создания каждого астероида
        for (var i = 0; i < asteroid_count; i++) {

            /**
             * Calculate the angle theta for asteroid positioning.
             * 
             * The angle is calculated based on the index of the asteroid, 
             * the total count of asteroids, and a random deviation in degrees.
             * This ensures asteroids are evenly spaced with some variation.
             *
             * @param {number} i - The index of the current asteroid.
             * @param {number} asteroid_count - The total number of asteroids.
             * @param {number} theta_derivation_degrees - The degree deviation for randomness.
             * @returns {number} theta - The calculated angle in radians.
             */
            var theta =
                (i * 2 * Math.PI) / asteroid_count + // Base angle for even spacing
                (_math.random_integer(0, theta_derivation_degrees) * _math.random_sign() * Math.PI / 180); // Add random deviation

            console.log("theta: " + theta + " i*2*Math.PI: " + (i * 2 * Math.PI)
                + " asteroid_count: " + asteroid_count +
                " divide: " + (i * 2 * Math.PI) / asteroid_count);

            // Генерация радиуса с меньшей вероятностью больших значений (логарифмическое распределение)
            var radius = Math.exp(Math.random() * Math.log(radius_max / radius_min)) * radius_min;

            // Случайная плотность металла в диапазоне [15, 30]
            var metal_density = _math.random_integer(metalDensityMin, metalDensityMax);

            // Случайное значение required_thrust_to_move в диапазоне [0, 2]
            var requiredThrustToMove = _math.random_integer(requiredThrustToMoveMin, requiredThrustToMoveMax);

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
    const size = _.find(_data.get_options(), { group_id: 'option-group-planet_size' });
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
    const metal = _.find(_data.get_options(), { group_id: 'option-group-metal' });
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
    const biome = _.find(_data.get_options(), { group_id: 'option-group-biome' });
    if (biome == undefined)
        return _.find(default_generation_options, { group_id: 'option-group-biome' }).option_value;
    else
        return biome.option_value;
}

function get_generation_biome() {
    const selected_option_number = get_generation_biome_option();
    const selected_option_name = _.find(biome_map, { value: selected_option_number }).name;

    return {
        name: selected_option_name,
        value: selected_option_number
    }
}

