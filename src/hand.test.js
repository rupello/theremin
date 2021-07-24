const {angle, rad2deg, fingerMeasurements, distance} = require('./hand');

const landmarks = [
    {'x': 0.7974539995193481, 'y': 0.92890864610672, 'z': -4.69082806375809e-05},
    {'x': 0.7293185591697693, 'y': 0.8689514398574829, 'z': -0.050433382391929626},
    {'x': 0.6837429404258728, 'y': 0.7597440481185913, 'z': -0.0797049030661583},
    {'x': 0.6544496417045593, 'y': 0.6605980396270752, 'z': -0.10950426757335663},
    {'x': 0.6196582913398743, 'y': 0.5881657004356384, 'z': -0.14319050312042236},
    {'x': 0.7263122797012329, 'y': 0.5900354385375977, 'z': -0.03390217572450638},
    {'x': 0.708608865737915, 'y': 0.47911837697029114, 'z': -0.0641574114561081},
    {'x': 0.7025690078735352, 'y': 0.40891551971435547, 'z': -0.09693191200494766},
    {'x': 0.698942244052887, 'y': 0.33779534697532654, 'z': -0.12236453592777252},
    {'x': 0.7752833962440491, 'y': 0.5753895044326782, 'z': -0.03918064758181572},
    {'x': 0.7736191153526306, 'y': 0.445173442363739, 'z': -0.05667157471179962},
    {'x': 0.7720999121665955, 'y': 0.35918140411376953, 'z': -0.0979396179318428},
    {'x': 0.7708187103271484, 'y': 0.2791180908679962, 'z': -0.1336892545223236},
    {'x': 0.8213851451873779, 'y': 0.5968025922775269, 'z': -0.05134512111544609},
    {'x': 0.8290414214134216, 'y': 0.4649108648300171, 'z': -0.07600997388362885},
    {'x': 0.8324922323226929, 'y': 0.3815895617008209, 'z': -0.11746995896100998},
    {'x': 0.8353421092033386, 'y': 0.30320432782173157, 'z': -0.1492367386817932},
    {'x': 0.8683581352233887, 'y': 0.6477195024490356, 'z': -0.06838018447160721},
    {'x': 0.8900817632675171, 'y': 0.5461435317993164, 'z': -0.09774767607450485},
    {'x': 0.9022796154022217, 'y': 0.47817134857177734, 'z': -0.12533967196941376},
    {'x': 0.9142261743545532, 'y': 0.4064035415649414, 'z': -0.14626161754131317}
] ;


test('rads to degrees', () => {
   expect(rad2deg(2*Math.PI)).toBe(360.0);
});

test('landmarks.length==21', () => {
    expect(landmarks.length).toBe(21);
});

test('90 degrees', () => {
    let p0 = {x:0, y:0, z:0};
    let p1 = {x:1, y:0, z:0};
    let p2 = {x:0, y:1, z:0};
    expect(angle(p0,p1,p0,p2)).toBeCloseTo(90);
});

test('180 degrees', () => {
    let p0 = {x:0, y:0, z:0};
    let p1 = {x:1, y:0, z:0};
    let p2 = {x:-1, y:0, z:0};
    expect(angle(p0,p1,p0,p2)).toBeCloseTo(180);
});

test('parallel lines', () => {
    let p0 = {x:0, y:0, z:0};
    let p1 = {x:1, y:0, z:0};
    let p2 = {x:0, y:1, z:0};
    let p3 = {x:1, y:1, z:0};
    expect(angle(p0,p1,p2,p3)).toBeCloseTo(0);
});

test('non planar', () => {
    let p0 = {x:0, y:0, z:0};
    let p1 = {x:1, y:0, z:0};
    let p2 = {x:0, y:1, z:0};
    let p3 = {x:1, y:1, z:1};
    expect(angle(p0,p1,p2,p3)).toBeCloseTo(45);
});

test('finger angles', () => {
    expect(fingerMeasurements(landmarks).indexFlex).toBeCloseTo(7.441);
    expect(fingerMeasurements(landmarks).middleFlex).toBeCloseTo(16.410);
    expect(fingerMeasurements(landmarks).ringFlex).toBeCloseTo(11.534);
    expect(fingerMeasurements(landmarks).pinkyFlex).toBeCloseTo(2.533);
    expect(fingerMeasurements(landmarks).thumbIndexDist).toBeCloseTo(0.263);
    expect(fingerMeasurements(landmarks).abduction).toBeCloseTo(16.163);
});

test('distance', () => {
   expect(distance({x:0, y:0, z:0}, {x:1, y:1, z:0})).toBeCloseTo(Math.sqrt(2));
   expect(distance({x:0, y:0, z:0}, {x:1, y:1, z:1})).toBeCloseTo(Math.sqrt(3));
   expect(distance({x:-1, y:-1, z:-1}, {x:1, y:1, z:1})).toBeCloseTo(Math.sqrt(12));
    expect(distance({x:-1, y:-1, z:1}, {x:-2, y:-2, z:1})).toBeCloseTo(Math.sqrt(2));
});
