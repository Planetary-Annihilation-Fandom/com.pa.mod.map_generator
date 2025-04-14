define(function () {
    return {
        generate_landing_zones: generate_landing_zones
    };
});

// const radius = 1;
// const nTeams = 4;
// const playersPerTeam = 3;
const teamDist = Math.PI / 3;
const playerDist = Math.PI / 10;
const rotationOffset = 0;
const triangleSharpness = 1.0;
const spiralCurve = 3.0;
const spacing = 0.05;
const formationName = 'circle';
// const teamDistributionShape = 'circle'; // i dont see any use in code

function generate_landing_zones(planet, teams_count, players_per_team) {
    var radius = planet.planet.radius;

    var centerVec = randomPointOnSphere(radius);
    var teamCenters = generateFairTeamSpawns(centerVec, teamDist, teams_count);

    var landing_zones = [];
    for (var i = 0; i < teamCenters.length; i++) {
        var teamPos = teamCenters[i];
        var team_landing_zones = generatePlayerSpawns(teamPos, centerVec, playerDist, players_per_team, rotationOffset, formationName, triangleSharpness, spiralCurve, spacing);
        landing_zones = landing_zones.concat(team_landing_zones);
    }

    console.log('Center Point:', centerVec);
    console.log('Team Centers:', teamCenters);
    console.log('Landing Zones:', landing_zones);
    return landing_zones;
}

function randomPointOnSphere(radius) {
    var theta = Math.random() * 2 * Math.PI;
    var phi = Math.random() * Math.PI;
    return createPoint(radius, theta, phi);
}

function createPoint(radius, theta, phi) {
    var x = radius * Math.sin(phi) * Math.cos(theta);
    var y = radius * Math.sin(phi) * Math.sin(theta);
    var z = radius * Math.cos(phi);
    return [x, y, z];
}

function normalize(vec) {
    var length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
    return [vec[0] / length, vec[1] / length, vec[2] / length];
}

function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function scale(vec, s) {
    return [vec[0] * s, vec[1] * s, vec[2] * s];
}

function add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function generateBasis(centerVec) {
    var n = normalize(centerVec);
    var ref = Math.abs(n[0]) < 0.99 ? [1, 0, 0] : [0, 1, 0];
    var t = normalize(cross(n, ref));
    var b = cross(n, t);
    return [t, n, b];
}

function rotateVector(v, axis, angle) {
    var k = normalize(axis);
    var cosA = Math.cos(angle);
    var sinA = Math.sin(angle);
    var dotKV = dot(k, v);

    var term1 = scale(v, cosA);
    var term2 = scale(cross(k, v), sinA);
    var term3 = scale(k, dotKV * (1 - cosA));
    return add(add(term1, term2), term3);
}

function generateFairTeamSpawns(centerVec, angularDistance, nTeams) {
    var basis = generateBasis(centerVec);
    var t = basis[0];
    var n = basis[1];
    var b = basis[2];

    var spawns = [];
    for (var i = 0; i < nTeams; i++) {
        var angle = 2 * Math.PI * i / nTeams;
        var dir = add(scale(t, Math.cos(angle)), scale(b, Math.sin(angle)));
        var point = rotateVector(centerVec, dir, angularDistance);
        spawns.push(point);
    }
    return spawns;
}

function generatePlayerSpawns(centerVec, globalCenter, angularDistance, nPlayers, rotationOffset, formation, triangleSharpness, spiralCurve, spacing) {
    if (formation === 'circle') {
        return formationCircle(centerVec, globalCenter, angularDistance, nPlayers, rotationOffset);
    } else if (formation === 'line') {
        return formationLine(centerVec, globalCenter, angularDistance, nPlayers, spacing, rotationOffset);
    } else if (formation === 'triangle') {
        return formationTriangle(centerVec, globalCenter, angularDistance, nPlayers, triangleSharpness, rotationOffset);
    } else if (formation === 'square') {
        return formationSquare(centerVec, globalCenter, angularDistance, nPlayers, rotationOffset);
    } else if (formation === 'spiral') {
        return formationSpiral(centerVec, globalCenter, angularDistance, nPlayers, rotationOffset, spacing, spiralCurve);
    }
    return formationCircle(centerVec, globalCenter, angularDistance, nPlayers, rotationOffset);
}

function formationCircle(centerVec, globalCenter, angularDistance, nPlayers, rotationOffset) {
    var axis = normalize(cross(globalCenter, centerVec));
    var direction = normalize(cross(axis, centerVec));
    var points = [];
    for (var i = 0; i < nPlayers; i++) {
        var angle = rotationOffset + (2 * Math.PI * i / nPlayers);
        var offsetDir = add(scale(direction, Math.cos(angle)), scale(cross(centerVec, direction), Math.sin(angle)));
        var point = rotateVector(centerVec, normalize(offsetDir), angularDistance);
        points.push(point);
    }
    return points;
}

function formationLine(centerVec, globalCenter, angularDistance, nPlayers, spacing, rotationOffset) {
    var axis = normalize(cross(centerVec, globalCenter));
    var direction = normalize(cross(axis, centerVec));
    var rotatedT = add(scale(direction, Math.cos(rotationOffset)), scale(cross(centerVec, direction), Math.sin(rotationOffset)));
    var midIndex = (nPlayers - 1) / 2;
    var points = [];
    for (var i = 0; i < nPlayers; i++) {
        var offset = (i - midIndex) * spacing;
        var rotated = rotateVector(centerVec, rotatedT, offset);
        points.push(rotated);
    }
    return points;
}

function formationTriangle(centerVec, globalCenter, angularDistance, nPlayers, triangleFactor, rotationOffset) {
    var top = [0, 1];
    var left = [-triangleFactor, -1];
    var right = [triangleFactor, -1];
    var base = [left, top, right];

    var pts2d = perimeterFromShape(nPlayers, base);

    var dirToRed = normalize([
        globalCenter[0] - centerVec[0],
        globalCenter[1] - centerVec[1],
        globalCenter[2] - centerVec[2]
    ]);

    var t = normalize(cross(centerVec, dirToRed));
    var b = cross(t, centerVec);

    var rotT = add(scale(t, Math.cos(rotationOffset)), scale(b, Math.sin(rotationOffset)));
    var rotB = add(scale(t, -Math.sin(rotationOffset)), scale(b, Math.cos(rotationOffset)));

    var result = [];
    for (var i = 0; i < pts2d.length; i++) {
        var x = pts2d[i][0];
        var y = pts2d[i][1];
        var offset = add(scale(rotT, x), scale(rotB, y));
        var point = rotateVector(centerVec, offset, angularDistance);
        result.push(normalize(point));
    }
    return result;
}

function formationSquare(centerVec, globalCenter, angularDistance, nPlayers, rotationOffset) {
    var axis = normalize(cross(centerVec, globalCenter));
    var baseT = normalize(cross(axis, centerVec));
    var baseB = cross(centerVec, baseT);
    var rotT = add(scale(baseT, Math.cos(rotationOffset)), scale(baseB, Math.sin(rotationOffset)));
    var rotB = add(scale(baseT, -Math.sin(rotationOffset)), scale(baseB, Math.cos(rotationOffset)));

    var square = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
    var pts2d = perimeterFromShape(nPlayers, square);

    var result = [];
    for (var i = 0; i < pts2d.length; i++) {
        var x = pts2d[i][0];
        var y = pts2d[i][1];
        var offset = add(scale(rotT, x), scale(rotB, y));
        var point = rotateVector(centerVec, offset, angularDistance);
        result.push(normalize(point));
    }
    return result;
}

function formationSpiral(centerVec, globalCenter, angularDistance, nPlayers, rotationOffset, spacing, curve) {
    var axis = normalize(cross(globalCenter, centerVec));
    var direction = normalize(cross(axis, centerVec));
    var points = [];
    for (var i = 0; i < nPlayers; i++) {
        var angle = rotationOffset + i * spacing * curve;
        var dist = angularDistance + i * spacing;
        var offsetDir = add(scale(direction, Math.cos(angle)), scale(cross(centerVec, direction), Math.sin(angle)));
        var point = rotateVector(centerVec, normalize(offsetDir), dist);
        points.push(point);
    }
    return points;
}

function perimeterFromShape(n, shape) {
    if (n <= shape.length) return shape.slice(0, n);

    var result = shape.slice();
    var remaining = n - shape.length;
    var perSide = [0, 0, 0, 0];

    for (var i = 0; i < remaining; i++) perSide[i % shape.length]++;

    for (var i = 0; i < shape.length; i++) {
        var p1 = shape[i];
        var p2 = shape[(i + 1) % shape.length];
        var count = perSide[i];
        for (var j = 1; j <= count; j++) {
            var alpha = j / (count + 1);
            var x = p1[0] + (p2[0] - p1[0]) * alpha;
            var y = p1[1] + (p2[1] - p1[1]) * alpha;
            result.push([x, y]);
        }
    }
    return result.slice(0, n);
}
