// perhaps needed for simplicity: npm module
// require('typedarray-methods')
const reglM = require('regl')
// use this one for server side render
// const regl = require('regl')(require('gl')(256, 256))
// use this one for rendering inside a specific canvas/element
// var regl = require('regl')(canvasOrElement)
//import { default as render } from './rendering/render'
import { params as cameraDefaults } from '@usco/orbit-controls'
import camera from './utils/camera'

import { combine, merge, just, mergeArray, combineArray, from, fromEvent, never } from 'most'
import limitFlow from './utils/most/limitFlow'

// interactions
import controlsStream from './utils/controls/controlsStream'
// import pickStream from '../utils/picking/pickStream'

import { baseInteractionsFromEvents as interactionsFromEvents, pointerGestures } from 'most-gestures'

import { elementSize } from './utils/interactions/elementSizing'
import { dragEvents, dragAndDropEffect } from './sideEffects/dragDropDriver'
/* --------------------- */
import adressBarDriver from './sideEffects/adressBarDriver'

import { isObjectOutsideBounds } from '@usco/printing-utils'

import entityPrep from './entities/entityPrep'
import { makeEntitiesModel, makeMachineModel } from './state'
import { makeVisualState } from './visualState'

// basic api
import nativeApiDriver from './sideEffects/nativeApiDriver'
import appMetadataDriver from './sideEffects/appMetadataDriver'

import { combineDataSources } from './entities/combineDataSources'
//
const nativeApi = nativeApiDriver()
const appMetadata$ = appMetadataDriver()

const regl = reglM({
  extensions: [
    //  'oes_texture_float', // FIXME: for shadows, is it widely supported ?
    // 'EXT_disjoint_timer_query'// for gpu benchmarking only
  ],
  profile: true,
  attributes: {
    alpha: false
  }
})

const container = document.querySelector('canvas')
/* --------------------- */
// side effect : source
const glContextLost$ = fromEvent('webglcontextlost', container)
  .tap(event => event.preventDefault())
  .map(e => ({type: 'webglcontextlost', data: e}))

const modelUri$ = merge(
  adressBarDriver,
  nativeApi.modelUri$
)
  .flatMapError(function (error) {
    // console.log('error', error)
    modelLoaded(false) // error)
    return just(null)
  })
  .filter(x => x !== null)
  .multicast()

const setMachineParams$ = merge(
  nativeApi.machineParams$
)
  .flatMapError(function (error) {
    // console.log('error', error)
    //machineParamsLoaded(false) // error)
    return just(null)
  })
  .filter(x => x !== null)
  //.tap(e => machineParamsLoaded(true))
  .multicast()


const draggedItems$ = dragAndDropEffect(dragEvents(document))
  .flatMap(function (droppedData) {
    console.log('droppedData', droppedData)
    /*if (droppedData.type === 'file') {
      droppedData.data.forEach(function (file) {})
    }*/
    return from(droppedData.data) // droppedData.data.map(just))
  })
  .multicast()

const parsedModelData$ = combineDataSources(modelUri$, draggedItems$)
  .flatMapError(function (error) {
    modelLoaded(false) // error)
    console.error(`failed to load geometry ${error}`)
    return just(undefined)
  })
  .filter(x => x !== undefined)
  .multicast()

const render = require('./rendering/render')(regl)
const addEntities$ = entityPrep(parsedModelData$)
const setEntityBoundsStatus$ = merge(setMachineParams$, addEntities$.sample((x) => x, setMachineParams$))

const entities$ = makeEntitiesModel({addEntities: addEntities$, setEntityBoundsStatus: setEntityBoundsStatus$})
const machine$ = makeMachineModel({setMachineParams: setMachineParams$})

/*const appState$ = makeState(machine$, entities$)
  .forEach(x => x)*/


// interactions : camera controls etc
const baseInteractions$ = interactionsFromEvents(container)
const gestures = pointerGestures(baseInteractions$)
const focuses$ = never()/*addEntities$.map(function (nEntity) {
  const mid = nEntity.bounds.max.map(function (pos, idx) {
    return pos - nEntity.bounds.min[idx]
  })
  return mid
})*/

const entityFocuses$ = never()//addEntities$
const projection$ = elementSize(container)

const camState$ = controlsStream({gestures}, {settings: cameraDefaults, camera}, focuses$, entityFocuses$, projection$)

// final states
const visualState$ = makeVisualState(regl, machine$, entities$, camState$)
  .multicast()
  .flatMapError(function (error) {
    console.error('error in visualState', error)
    return just(null)
  })
  .filter(x => x !== null)

visualState$
  .thru(limitFlow(33))
  .tap(x => regl.poll())
  .tap(render)
  .flatMapError(function (error) {
    console.error('error in render', error)
    return just(null)
  })
  .forEach(x => x)


// OUTPUTS (sink side effects)
// boundsExceeded
/*
const objectFitsPrintableVolume$ = combine(function (entity, machineParams) {
  // console.log('objectFitsPrintableArea', entity, machineParams)
  return !isObjectOutsideBounds(machineParams, entity)
}, addEntities$, setMachineParams$)
  .tap(e => console.log('objectFitsPrintableVolume??', e))
  .multicast()
addEntities$.forEach(m => modelLoaded(true)) // side effect => dispatch to callback)
objectFitsPrintableVolume$.forEach(objectFitsPrintableVolume) // dispatch message to signify out of bounds or not
glContextLost$.forEach(x => modelLoaded(false))// handle gl context loss effect
appMetadata$.forEach(function (data) {// display app version, notify 'outside world the viewer is ready etc'
  viewerVersion(`'${data.version}'`)
  viewerReady()
  console.info(`Viewer version: ${data.version}`)
})*/


// for testing only
const machineParams = {
  'name': 'ultimaker3_extended',
  'machine_width': 215,
  'machine_depth': 215,
  'machine_height': 300,
  'printable_area': [200, 200]
}


console.log('testing')
// for testing
// informations about the active machine
window.nativeApi.setMachineParams(machineParams)
/*setTimeout(function () {
  window.nativeApi.setMachineParams(machineParams)
}, 2000)
setTimeout(function () {
  window.nativeApi.setModelUri( 'http://localhost:8080/data/sanguinololu_enclosure_full.stl')
}, 50)*/
