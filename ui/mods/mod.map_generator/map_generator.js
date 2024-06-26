
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

function MapGeneratorModel() {
    var self = this;
}

MapGeneratorModel = new MapGeneratorModel();

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

function update_modification_data_options(options_group_id, option_value) {
    var modification_data = load_modification_data_from_localStore();
    var option_group_data = _.find(modification_data.options, { group_id: options_group_id });
    option_group_data.option_value = option_value;
    save_modification_data_to_localStore(modification_data)
}

// option_data example
// {
//     description: "description"
// }

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
function getRandomInt(min, max) {

    if (min == max)
        return max;

    min = Math.ceil(min);
    max++; // make max inclusive (tatarstan)
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive (stackoverflow)
}

function getRandomIndex(length) {
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

// // FUNCTIONS
// // Default biomes
// const earthBiome = "earth_lite"
// const desertBiome = "desert_lite"
// const lavaBiome = "lava_lite"
// const tropicalBiome = "tropical_lite"
// const moonBiome = "moon_lite"

// const metalBiome = "metal"
// const asteroidBiome = "asteroid"
// // Expansion biomes
// //const greenhouseBiome = "greenhouse"

// // api.mods.getMounted("client", true).then(function (mods) {
// //     var modMounted = function (modIdentifier) {
// //       return _.some(mods, { identifier: modIdentifier });
// //     };
// //     // Shared Systems for Galactic War
// //     if (modMounted("com.wondible.pa.gw_shared_systems"))

// function getAllPossibleBiomes() {
//     const defaultBiomes = [earthBiome, desertBiome, lavaBiome, tropicalBiome, moonBiome, metalBiome, asteroidBiome]
//     //const expansionBiomes = [greenhouseBiome]
//     return defaultBiomes
// }

// function getRandomBiome(biomes) {
//     if (biomes == undefined)
//         biomes = getAllPossibleBiomes();

//     const random = getRandomIndex(biomes.length);
//     return biomes[random];
// }

// function getOneOfWaterGenerationOption() {
//     const types = ["random", "nowater", "muchwater"]

//     var i = 0;
//     var r = 0;
//     var n = 0;
//     var m = 0;
//     for (i = 0; i < 1000; i++) {
//         var type = types[getRandomWeightedIndex([60, 20, 20])]

//         switch (type) {
//             case "random": r++; break;
//             case "nowater": n++; break;
//             case "muchwater": m++; break;
//         }
//     }

//     switch (type) {
//         case "random": return getRandomInt(20, 40); break;
//         case "nowater": return 0; break;
//         case "muchwater": return getRandomInt(40, 70); break;
//     }
//     console.log('rand-' + r + ' no-' + n + ' much-' + m)
//     return 0
// }

// // Use undefined to get random value
// function createGenerationOptions(temperature, waterDepth, height) {
//     if (temperature == undefined)
//         temperature = getRandomInt(0, 100)
//     if (waterDepth == undefined)
//         waterDepth = getOneOfWaterGenerationOption();
//     if (height == undefined)
//         height = getRandomInt(20, 60);
//     return { temperature: temperature, waterDepth: waterDepth, height: height }
// }

// function getRandomSystem(planetTitle, planetRadiusRange, biomeName, metalDensityRange,
//     generationOptions) {

//     if (generationOptions == undefined)
//         generationOptions = createGenerationOptions(undefined, undefined, undefined)

//     console.log(biomeName + ' passed to the generation')

//     // Gameplay
//     var seed = getRandomSeed();
//     var radius = getRandomInt(planetRadiusRange[0], planetRadiusRange[1]);
//     var metalDensity = getRandomInt(metalDensityRange[0], metalDensityRange[1]);

//     // Planet surface
//     const temperature = generationOptions.temperature;
//     const waterDepth = generationOptions.waterDepth;
//     const height = generationOptions.height;

//     // Orbit parameter, does nothing but need to initialize
//     var mass = 10000;

//     // Players
//     var slots = model.slots() || 2;

//     // additional 50 metalDensity
//     var slotFactor = 10/slots;
//     var metalSlotsMultiplier = Math.floor(slotFactor * 10);

//     var metalDensityResult = metalDensity + metalSlotsMultiplier;
//     var metalClusters = 100*(1/slotFactor) + metalSlotsMultiplier;

//     var landingZoneSize = radius/10;

//     console.log("making planet settings")
//     var planet = {
//         mass: mass,
//         intended_radius: radius,
//         position_x: 50000,
//         position_y: 0,
//         velocity_x: 0,
//         velocity_y: 100,
//         starting_planet: true,
//         required_thrust_to_move: 0,
//         metalEstimate: 1,
//         planet: {
//             seed: seed,
//             biome: biomeName,
//             radius: radius,
//             heightRange: height,
//             waterHeight: waterDepth,
//             waterDepth: 50,
//             temperature: temperature,
//             // i dont know what biomeScale does
//             biomeScale: getRandomInt(50,100),
//             metalDensity: metalDensityResult,
//             metalClusters: metalClusters,
//             landingZoneSize: landingZoneSize,
//             landingZonesPerArmy: Math.floor(slotFactor),
//             numArmies: slots,
//             symmetricalMetal: true,
//             symmetricalStarts: true,
//             symmetryType: "none"
//         }
//     }

//     console.log(planet);

//     var rSystem = {
//         name: planetTitle + ' C' + metalClusters + ' D' + metalDensityResult + ' W'+ waterDepth,
//         isRandomlyGenerated: true,
//         players: [slots, slots]
//     };

//     var planets = [planet];

//     var pgen = _.map(planets, function (plnt, index) {
//         var biomeGet = $.getJSON('coui://pa/terrain/' + plnt.planet.biome + '.json')
//             .then(function (data) {
//                 return data;
//             });
//         var nameGet = $.Deferred();
//         api.game.getRandomPlanetName().then(function (name) { nameGet.resolve(name); });
//         return $.when(biomeGet, nameGet).then(function (biomeInfo, name) {
//             plnt.name = name;
//             return plnt;
//         });
//     });

//     return $.when.apply($, pgen).then(function () {
//         rSystem.planets = Array.prototype.slice.call(arguments, 0);
//         return rSystem;
//     });
// }

function save_modification_data_to_localStore(modification_data) {
    localStorage.setItem('map_generator_data', JSON.stringify(modification_data));
}

function load_modification_data_from_localStore() {
    var modification_data = JSON.parse(localStorage.getItem('map_generator_data'));
    return modification_data;
}

function create_default_modification_data() {
    return {
        options: []
    }
}
