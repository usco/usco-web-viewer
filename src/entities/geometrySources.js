// data inputs
import makeStlStream from 'usco-stl-parser'
import make3mfStream from 'usco-3mf-parser'

import xhrAsStream from '../xhrloader'
import fileAsStream from '../fileLoader'

import { getExtension } from '../utils/file'
import { just, mergeArray, from } from 'most'
import vec3 from 'gl-vec3'

export function geometrySources (modelUri$, modelFiles$) {
  const parsers = {
    'stl': makeStlStream,
    '3mf': make3mfStream
  }
  const parserParams = {useWorker: true}
  // carefull ! stream parser function is NOT reuseable ! cannot bind() etc
  const pickParser = (data) => parsers[data.ext]

  modelUri$ = modelUri$
    .map(x => ({type: 'uri', data: x, ext: getExtension(x)}))
    .flatMap(function (data) {
      const parser = pickParser(data)
      return xhrAsStream(parser(parserParams), data.data)
    })

  modelFiles$ = modelFiles$
    .map(x => ({type: 'file', data: x, ext: getExtension(x.name)}))
    .flatMap(function (data) {
      const parser = pickParser(data)
      return fileAsStream(parser(parserParams), data.data)
    })

  return mergeArray([modelUri$, modelFiles$])
    .flatMap(function (modelData) {
      // console.log(modelData)
      if (!modelData.hasOwnProperty('_finished')) {
        return just(modelData)
      }

      let entities = []

      const parts = modelData.build.map(function (item) {
        const {objectid} = item

        function transform (positions, translateMat) {
          for (var i = 0; i < positions.length; i += 3) {
            let newPos = vec3.fromValues(positions[i], positions[i + 1], positions[i + 2])
            vec3.transformMat4(newPos, newPos, translateMat)
            positions[i] = newPos[0]
            positions[i + 1] = newPos[1]
            positions[i + 2] = newPos[2]
          }
        }

        const geometry = modelData.objects[objectid]
        // transform(geometry.positions, item.transforms)

        return geometry
      })
      return from(parts)
    // .filter(x=>x.positions.length>0)
    })
    .tap(x => console.log('loaded model', x))
}
