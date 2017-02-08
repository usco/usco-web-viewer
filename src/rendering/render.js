import makeWrapperScope from 'usco-render-utils/dist/wrapperScope'

import { computeTMatrixFromTransforms as model } from 'usco-transform-utils'
import { drawGrid as prepareDrawGrid } from 'usco-render-utils'

module.exports = function render (regl, params) {
  const wrapperScope = makeWrapperScope(regl)
  let tick = 0

  // infine grid, always there
  // infinite grid
  const gridSize = [1220, 1200] // size of 'infinite grid'
  const drawInfiniGrid = prepareDrawGrid(regl, {size: gridSize, ticks: 10, infinite: true})
  const infiniGridOffset = model({pos: [0, 0, -1.8]})

  let command = (props) => {
    const {entities, machine, camera, view, background, outOfBoundsColor} = props

    wrapperScope(props, (context) => {
      regl.clear({
        color: background,
        depth: 1
      })
      //fogColor is dominant
      drawInfiniGrid({view, camera, color: [0, 0, 0, 0], fogColor: background, model: infiniGridOffset})

      const outOfBoundsEntities = entities
        .filter(entity => entity.bounds.outOfBounds)

      if (machine) {
        machine.draw({view, camera, outOfBoundsEntities: outOfBoundsEntities.length > 0})
      }

      entities
        .filter(entity => entity.hasOwnProperty('geometry'))
        .map(function (entity) {
          // use this for colors that change outside build area
          // const color = entity.visuals.color
          // const printableArea = machine ? machine.params.printable_area : [0, 0]
          // this one for single color for outside bounds
          const color = entity.bounds.outOfBounds ? outOfBoundsColor : entity.visuals.color
          const printableArea = undefined

          entity.visuals.draw({view, camera, color, model: entity.transforms.matrix, printableArea})
        })



    /*entities.map(function (entity) {
      const {pos} = entity.transforms
      const offset = pos[2]-entity.bounds.size[2]*0.5
      const model = _model({pos: [pos[0], pos[1], -0.1]})
      const headSize = [100,60]
      const width = entity.bounds.size[0]+headSize[0]
      const length = entity.bounds.size[1]+headSize[1]

      return makeDrawPrintheadShadow(regl, {width,length})({view, camera, model, color: [0.1, 0.1, 0.1, 0.15]})
    })*/
    })
  }

  return function render (data) {
    command(data)
    // boilerplate etc
    tick += 0.01
  // for stats, resizing etc
  // regl.poll()
  }
}
