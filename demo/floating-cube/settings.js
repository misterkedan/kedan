import { Settings } from 'kedan';

export default new Settings({
  /*---------------------------------------------------------------------------/
    Infos
  /---------------------------------------------------------------------------*/

  id: 'kedan-demo', // localStorage identifier
  name: 'Floating Cube (Demo)',
  date: '2024',
  author: 'Kedan',
  homepage: 'https://kedan.fr',
  github: 'https://github.com/misterkedan/kedan',

  /*---------------------------------------------------------------------------/
    Stage
  /---------------------------------------------------------------------------*/

  background: '#ff7700',
  //background: {
  //	type: 'linear',
  //	color1: '#0055aa',
  //	color2: '#030030',
  //	angle: 90,
  //	dither: true,
  //},
  //background: {
  //	type: 'radial',
  //	color1: '#ff0000',
  //	color2: '#000000',
  //	dither: true,
  //	//radius: 0.75,
  //},
  //background: {
  //	type: 'simplex',
  //	color1: '#ff0000',
  //	color2: '#0000ff',
  //	color3: '#00cccc',
  //	color4: '#ffff00',
  //	noiseScale: 1,
  //	//dither: false,
  //},
  camera: {
    start: { x: 2, y: 2, z: 2 },
    lookAt: { x: 0, y: 0, z: 0 },
  },

  /*---------------------------------------------------------------------------/
    Controls
    (controls with options can be either true (for default options) or an 
    options object)
  /---------------------------------------------------------------------------*/

  //pointer: true,
  pointer: {
    margin: 0,
    enabled: true,
    debug: false,
  },
  cameraRig: {
    speed: 2,
    bounds: { x: 1, y: 5, z: 0 },
    lookAt: { x: 0, y: 0, z: 0 },
    intro: { x: 1, y: 1, z: 1 },
  },
  //orbit: {
  //  autoRotate: true,
  //  autoRotateSpeed: 10,
  //},
  projector: {
    width: 100,
    height: 100,
    speed: 0,
    cursorSize: 0.35,
    color: '#ffffff',
    opacity: 0,
    horizontal: true,
    autoRotate: false,
    enabled: true,
  },
  gui: true,
  keyboard: true,
  resizer: true,
  //wheel: true,
  //click: true,

  /*---------------------------------------------------------------------------/
    Effects
  /---------------------------------------------------------------------------*/

  //fxaa: true,
  //ssao: {
  //  kernelRadius: 8,
  //  minDistance: 0.005,
  //  maxDistance: 0.1,
  //  enabled: true,
  //},
  bloom: {
    strength: 0.9,
    radius: 0.3,
    threshold: 0.3,
    dither: true,
    //enabled: false,
  },
  //radialBlur: {
  //  strength: 0.4,
  //  dither: true,
  //  enabled: true,
  //},
  //output: true,

  /*---------------------------------------------------------------------------/
    Settings
  /---------------------------------------------------------------------------*/

  autoLoad: true,
  //autoSave: true,
});
