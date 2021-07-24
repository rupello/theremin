const LM = {
    WRIST: 0,
    THUMB_CMC: 1,
    THUMB_MCP: 2,
    THUMB_IP: 3,
    THUMB_TIP: 4,
    INDEX_MCP: 5,
    INDEX_PIP: 6,
    INDEX_DIP: 7,
    INDEX_TIP: 8,
    MIDDLE_MCP: 9,
    MIDDLE_PIP: 10,
    MIDDLE_DIP: 11,
    MIDDLE_TIP: 12,
    RING_MCP: 13,
    RING_PIP: 14,
    RING_DIP: 15,
    RING_TIP: 16,
    PINKY_MCP: 17,
    PINKY_PIP: 18,
    PINKY_DIP: 19,
    PINKY_TIP: 20
}

// delta of two points
function delta(p1, p2) {
    return {
        x: p1.x - p2.x,
        y: p1.y - p2.y,
        z: p1.z - p2.z,
    };
}

//  returns hand between lines (p1->p2) and (p3->p4) in radians
function hand(p1, p2, p3, p4) {
    a = delta(p1, p2);
    b = delta(p3, p4);
    return rad2deg(Math.acos((a.x * b.x + a.y * b.y + a.z * b.z) /
        (Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z) * Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z))));
}

function distance(p1, p2) {
    let d = delta(p1,p2)
    return Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z);
}

function rad2deg(radians) {
    return radians * 180.0 / Math.PI;
}

function indexFlex(landmarks) {
    return hand(landmarks[LM.INDEX_MCP], landmarks[LM.INDEX_PIP],
        landmarks[LM.INDEX_DIP], landmarks[LM.INDEX_TIP]);
}

function middleFlex(landmarks) {
    return hand(landmarks[LM.MIDDLE_MCP], landmarks[LM.MIDDLE_PIP],
        landmarks[LM.MIDDLE_DIP], landmarks[LM.MIDDLE_TIP]);
}

function ringFlex(landmarks) {
    return hand(landmarks[LM.RING_MCP], landmarks[LM.RING_PIP],
        landmarks[LM.RING_DIP], landmarks[LM.RING_TIP]);
}

function pinkyFlex(landmarks) {
    return hand(landmarks[LM.PINKY_MCP], landmarks[LM.PINKY_PIP],
        landmarks[LM.PINKY_DIP], landmarks[LM.PINKY_TIP]);
}

function abduction(landmarks) {
return hand(landmarks[LM.INDEX_MCP], landmarks[LM.INDEX_TIP],
    landmarks[LM.PINKY_MCP], landmarks[LM.PINKY_TIP]);
}

function fingerMeasurements(landmarks) {
    return {
        indexFlex: indexFlex(landmarks),
        middleFlex: middleFlex(landmarks),
        ringFlex: ringFlex(landmarks),
        pinkyFlex: pinkyFlex(landmarks),
        thumbIndexDist: distance(landmarks[LM.THUMB_TIP], landmarks[LM.INDEX_TIP]),
        abduction: abduction(landmarks)
    };
}

try {
    module.exports = {delta, angle: hand, rad2deg, fingerMeasurements: fingerMeasurements, distance};
} catch (e) {}

