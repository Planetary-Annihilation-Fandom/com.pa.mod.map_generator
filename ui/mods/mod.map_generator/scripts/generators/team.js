// Main function that kicks off the simulation
// Generates spawn points for teams and players on a sphere
function main() {
    var radius = 1;
    var nTeams = 4;
    var playersPerTeam = 3;
    var teamDist = Math.PI / 3;
    var playerDist = Math.PI / 10;
    var rotationOffset = 0;
    var formationName = 'circle';
    var teamDistributionShape = 'circle';

    var centerVec = randomPointOnSphere(radius);
    var teamCenters = generateFairTeamSpawns(centerVec, teamDist, nTeams, teamDistributionShape);

    var allPlayers = [];
    for (var i = 0; i < teamCenters.length; i++) {
        var teamPos = teamCenters[i];
        var players = generatePlayerSpawns(teamPos, centerVec, playerDist, playersPerTeam, rotationOffset, formationName);
        allPlayers = allPlayers.concat(players);
    }

    console.log('Center Point:', centerVec);
    console.log('Team Centers:', teamCenters);
    console.log('Player Positions:', allPlayers);
}

// Generate a random point on a sphere given radius
function randomPointOnSphere(radius) {
    var theta = Math.random() * 2 * Math.PI;
    var phi = Math.random() * Math.PI;
    return createPoint(radius, theta, phi);
}

// Convert spherical coordinates to Cartesian
function createPoint(radius, theta, phi) {
    var x = radius * Math.sin(phi) * Math.cos(theta);
    var y = radius * Math.sin(phi) * Math.sin(theta);
    var z = radius * Math.cos(phi);
    return [x, y, z];
}

// Normalize a 3D vector
function normalize(vec) {
    var length = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1] + vec[2]*vec[2]);
    return [vec[0]/length, vec[1]/length, vec[2]/length];
}

// Cross product of two 3D vectors
function cross(a, b) {
    return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    ];
}

// Dot product of two 3D vectors
function dot(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

// Multiply vector by scalar
function scale(vec, s) {
    return [vec[0]*s, vec[1]*s, vec[2]*s];
}

// Add two vectors
function add(a, b) {
    return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
}

// Generate basis (tangent, normal, binormal) from a vector
function generateBasis(centerVec) {
    var n = normalize(centerVec);
    var ref = Math.abs(n[0]) < 0.99 ? [1, 0, 0] : [0, 1, 0];
    var t = normalize(cross(n, ref));
    var b = cross(n, t);
    return [t, n, b];
}

// Rotate a vector around an axis by an angle (Rodrigues' rotation formula)
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

// Generate evenly spaced team positions on sphere
function generateFairTeamSpawns(centerVec, angularDistance, nTeams, shape) {
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

// Generate player positions per team using formation type
function generatePlayerSpawns(centerVec, globalCenter, angularDistance, nPlayers, rotationOffset, formation) {
    if (formation === 'circle') {
        return formationCircle(centerVec, globalCenter, angularDistance, nPlayers, rotationOffset);
    }
    return formationCircle(centerVec, globalCenter, angularDistance, nPlayers, rotationOffset);
}

// Circle formation
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

// Run it
main();
