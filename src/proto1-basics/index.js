const reglM = require('regl')
// use this one for server side render
// const regl = require('regl')(require('gl')(256, 256))
// use this one for rendering inside a specific canvas/element
// var regl = require('regl')(canvasOrElement)
import { bunnyData, bunnyData2, bunnyData3, sceneData } from '../common/data'
import { draw as _draw, makeDrawCalls } from './drawCommands/alternative/draw'//'./draw'
import { params as cameraDefaults } from '../common/controls/orbitControls'
import camera from '../common/camera'


const regl = reglM({
  extensions: [
    'oes_texture_float',// FIXME: for shadows, is it widely supported ?
    // 'EXT_disjoint_timer_query'// for gpu benchmarking only
  ],

  profile: true
})
/*canvas: container,
  drawingBufferWidth: container.offsetWidth,
  drawingBufferHeight: container.offsetHeight})*/ //for editor
const container = document.querySelector('canvas')
//const container = document.querySelector('#drawHere')

const {frame, clear} = regl
//const drawModel = _drawModel.bind(null, regl)
const draw = _draw.bind(null, regl)

import controlsStream from '../common/controls/controlsStream'
import pickStream from '../common/picking/pickStream'

import most from 'most'

import { interactionsFromEvents, pointerGestures } from '../common/interactions/pointerGestures'
import {injectNormals, injectTMatrix, injectBounds} from './prepPipeline'
/* --------------------- */

import makeGrid from './grid'
import makeShadowPlane from './shadowPlane'
import makeTransformGizmo from './transformsGizmo'

const grid = makeGrid(160, 1)
const gizmo = makeTransformGizmo()
const shadowPlane = makeShadowPlane(160)

/* --------------------- */

/* Pipeline:
  - data => process (normals computation, color format conversion) => (drawCall generation) => drawCall
  - every object with a fundamentall different 'look' (beyond what can be done with shader parameters) => different (VS) & PS
  - even if regl can 'combine' various uniforms, attributes, props etc, the rule above still applies
*/

function flatten (arr) {
  return arr.reduce(function (a, b) {
    return a.concat(b)
  }, [])
}

let fullData = {
  scene: sceneData,
  entities: flatten([bunnyData, bunnyData2, bunnyData3, grid, shadowPlane, ])//gizmo])
}

// apply all changes
fullData.entities = fullData.entities
  .map(injectBounds)
  .map(injectTMatrix)
  .map(injectNormals)

//inject bactching/rendering data
const {hashStore, entities} = makeDrawCalls(regl, fullData)
fullData.entities = entities
/* ============================================ */
// main render function: data in, rendered frame out
function render (data) {
  draw(hashStore, data)
}

// render one frame
// render(fullData)

// interactions : camera controls
const baseInteractions$ = interactionsFromEvents(container)
const gestures = pointerGestures(baseInteractions$)
const camState$ = controlsStream({gestures}, {settings: cameraDefaults, camera}, fullData)

// interactions : picking
const picks$ = pickStream({gestures}, fullData)
  .tap(e=>console.log('picks', e))

const selections$ = most.just(fullData.entities)
  .map(function(x){
    return x.filter(x=>'meta' in x).filter(x=>x.meta.selected)
  })
  .startWith([])
  .merge(picks$)
  .scan((acc,cur)=>{

  },[])
  .filter(x=>x !== undefined)
  .forEach(e=>console.log('selections',e))

function upsertCameraState (cameraState) {
  let data = fullData
  data.camera = cameraState
  return data
}

//FIXME ! this is a hack, just for testing, also , imperative

function setSelection ({entity}) {
  console.log('setting seletion')
  entity.meta.selected = !entity.meta.selected
  return entity
}

const stateWithCameraState$ = camState$
  .map(upsertCameraState)

const stateWithSelectionState$ = picks$
  .map(x=>x.map(setSelection))
  .map(e => fullData)

// merge all the things that should trigger a re-render
most.merge(
  stateWithCameraState$,
  stateWithSelectionState$
)
  .forEach(render)
