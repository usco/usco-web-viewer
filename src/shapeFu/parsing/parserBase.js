import { evaluateModule } from './evaluators'

function geometryLookup () {
}

function evaluate (node) {
  switch (node.type) {
    case expression:
      break
  }
}

function exec (parser, input, rootName = 'root' , callBack, options = {}) {
  console.log('attempting to parse', input)

  let result = {}
  let curModule = { children: [], name: rootName, level: 0}

  const {glslify} = options

  parser.yy.settings = {
    processModule: function (yy) {
      let lines = []
      if (glslify) {
        lines.push(`#pragma glslify: sdBox = require('../primitives/box.frag')`)
        lines.push(`#pragma glslify: sdConeSection = require('../primitives/coneSection.frag')`)
        lines.push(`#pragma glslify: opS = require('../operations/subtract.frag')`)
        lines.push(`#pragma glslify: opU = require('../operations/union.frag')`)
      }

      lines.push(`float ${curModule.name}(vec3 pos){`)
      lines.push(evaluateModule(curModule))
      lines.push('}')

      if (glslify) {
        lines.push(`#pragma glslify: export(${curModule.name})`)
      }
      const res = lines.join('\n')

      if (callBack) {
        callBack(res)
      }
    },

    addModuleChild: function (child) {
      // console.log('adding child to module', JSON.stringify(child))
      curModule.children.push(child)
    }
  }
  parser.parse(input)
}

export { exec as exec }
