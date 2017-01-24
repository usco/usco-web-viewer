import mat4 from 'gl-mat4'

function sUUID () {
  return Math.random().toString(36).slice(-12)
}

export function assembleStuff2 (data) {
  console.log(data.transforms.scale)
  const rootScale = data.transforms.scale
  function lookup (id) {
    return data.objects[id]
  }
  function makeEntityComponent (type, data) {
  }

  let entities = []
  let entityComponents = {
    geometry: [],
    transforms: [],
    meta: []
  }

  function makeEntity (object, parent) {
    let matrix = mat4.create()
    mat4.scale(matrix, matrix, rootScale)
    if (object.transforms) { // if the current build item has transforms apply them
      mat4.multiply(matrix, matrix, object.transforms)
    }
    // make entities and components
    let entity = {uuid: sUUID(), id: object.objectid, components: []}

    let geometryComponent
    let transformsComponent
    let metaComponent
    if (object.geometry && object.geometry.positions.length > 0) {
      geometryComponent = Object.assign({ uuid: sUUID() }, object.geometry)
      entityComponents.geometry.push(geometryComponent)
      entity.components.push(geometryComponent.uuid)
    }

    transformsComponent = { uuid: sUUID(), matrix, parentUid: undefined }
    metaComponent = {uuid: sUUID(), name: object.name}

    entityComponents.transforms.push(transformsComponent)
    entityComponents.meta.push(metaComponent)

    entity.components.push(transformsComponent.uuid)
    entity.components.push(metaComponent.uuid)
    entities.push(entity)

    object.components.forEach(function (compo) {
      makeEntity(lookup(compo.objectid), entity)
    })
    return entity
  }

  data.build.forEach(function (item) {
    // console.log(item)
    /*let matrix = mat4.create()
    mat4.scale(matrix, matrix, rootScale)
    if (item.transforms) { // if the current build item has transforms apply them
      mat4.multiply(matrix, matrix, item.transforms)
    }*/
    let object = lookup(item.objectid)
    object.transforms = item.transforms
    // object = updateComponents(object, matrix, null)
    makeEntity(object)
  })
  const container = Object.assign({ uuid: sUUID() }, data.metadata)
  return {components: entityComponents, entities, container}
}

export function assembleStuff3 (data) {
  console.log('assembleStuff3', data)
  let entities = []
  const rootScale = data.transforms.scale
  function lookup (id) {
    return data.objects[id]
  }

  function makeEntity (object, parent) {
    let matrix = mat4.create()
    mat4.scale(matrix, matrix, rootScale)
    if (object.transforms) { // if the current build item has transforms apply them
      mat4.multiply(matrix, matrix, object.transforms)
    }
    // make entities and components
    let entity = {id: object.objectid}
    console.log('entity',entity, object)
    if (object.geometry && object.geometry.positions.length > 0) {
      entity.geometry = object.geometry
    }

    entity.transforms = {matrix, parent, sca: [1, 1, 1], pos: [0, 0, 0], rot: [0, 0, 0]} // FIXME !!! do correct scale, position, rotation computation
    entity.meta = {name: object.name}
    entity.visuals = {
      type: 'mesh',
      visible: true,
      color: [0.02, 0.7, 1, 1] // 07a9ff [1, 1, 0, 0.5],
    }
    entities.push(entity)

    object.components.forEach(function (compo) {
      makeEntity(lookup(compo.objectid), entity)
    })
    return entity
  }

  data.build.forEach(function (item) {
    let object = lookup(item.objectid)
    object.transforms = item.transforms
    makeEntity(object)
  })

  return entities
}
