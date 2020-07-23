class Entity {
  constructor (name, entityParams = {}, entityConfig = {}) {
    const idAttribute = entityConfig.idAttribute || 'id'
    this.name = name
    this.idAttribute = idAttribute
    this.init(entityParams)
  }

  /**
   * 初始化
   * @param {*} entityParams
   */
  init (entityParams) {
    if (!this.schema) {
      this.schema = {}
    }
    Object.keys(entityParams).forEach(key => {
      this.schema[key] = entityParams[key]
    })
  }

  /**
   * 获取实体的名字
   */
  getOwnName () {
    return this.name
  }

  getOwnId (val) {
    if (val) {
      const key = this.idAttribute
      return val[key]
    }
  }
}
/**
 * 导出实体类
 */
export const schema = {
  Entity
}
/**
 * 添加Entity的方法
 * @param {*} entities
 */
const addEntities = entities => (schema, data) => {
  const schemaName = schema.getOwnName()
  const id = schema.getOwnId(data)
  if (!(schemaName in entities)) {
    entities[schemaName] = {}
  }
  const currentEntity = entities[schemaName][id]
  if (currentEntity) {
    entities[schemaName][id] = Object.assign(currentEntity, data)
  } else {
    entities[schemaName][id] = data
  }
}
/**
 * 如果是schema实例 就执行这个方法
 */
const existSchema = (schema, data, flatten, addEntity) => {
  const currentSchema = schema
  const currentData = { ...data }
  Object.keys(currentSchema.schema).forEach(key => {
    const schema = currentSchema.schema[key] // 内部的schema
    const temp = flatten(schema, currentData[key], addEntity) // 递归
    currentData[key] = temp
  })
  addEntity(currentSchema, currentData)
  return currentSchema.getOwnId(data)
}
/**
 * 如果不是schema实例 就执行这个方法
 */
const unExistSchema = (schema, data, flatten, addEntity) => {
  // 可能是数组或者对象
  const currentObj = { ...data }
  const currentArr = []
  const flag = schema instanceof Array
  Object.keys(schema).forEach(key => {
    if (flag) {
      const currentSchema = schema[key]
      const temp = flatten(currentSchema, currentObj[key], addEntity)
      currentArr.push(temp)
    } else {
      const currentSchema = schema[key]
      const temp = flatten(currentSchema, currentObj[key], addEntity)
      currentObj[key] = temp
    }
  })
  if (flag) {
    return currentArr
  } else {
    return currentObj
  }
}

/**
 * 判断是否是schema实例
 */
const flatten = (schema, data, addEntity) => {
  if (typeof schema.getOwnName !== 'undefined') {
    return existSchema(schema, data, flatten, addEntity)
  } else {
    return unExistSchema(schema, data, flatten, addEntity)
  }
}

/**
 * 导出范式函数
 * @param {*} originalData
 * @param {*} schema
 */
export const normalize = (originalData, schema) => {
  const entities = {}
  const addEntity = addEntities(entities)
  const result = flatten(schema, originalData, addEntity)
  return { result, entities } // {result: '123', entities: {}}
}

const getEntities = (entities) => {
  return (data, schema) => {
    const schemaName = schema.getOwnName()
    if (typeof data === 'object' && data !== null) {
      return data
    }
    return entities[schemaName][data] // 取出里面的对象
  }
}

const unExistEntity = (schema, result, unflatten) => {
  const currentObj = { ...result }
  const currentArr = []
  const flag = schema instanceof Array
  Object.keys(schema).forEach(key => {
    if (flag) {
      if (currentObj[key]) {
        currentObj[key] = unflatten(currentObj[key], schema[key])
      }
      currentArr.push(unflatten(currentObj[key], schema[key]))
    } else {
      if (currentObj[key]) {
        currentObj[key] = unflatten(currentObj[key], schema[key])
      }
    }
  })
  if (flag) {
    return currentArr
  } else {
    return currentObj
  }
}

const ExistEntitiy = (schema, result, unflatten, store, getEntity) => {
  const entity = getEntity(result, schema)
  // console.log(entity)
  if (!(store[schema.getOwnName()])) {
    store[schema.getOwnName()] = {}
  }
  if (!(store[schema.getOwnName()][result])) {
    const entityCopy = { ...entity }
    Object.keys(schema.schema).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(entityCopy, key)) { // author comments
        const currentSchema = schema.schema[key] // 内部的schema 值
        entityCopy[key] = unflatten(entityCopy[key], currentSchema)
      }
    })
    store[schema.getOwnName()][result] = entityCopy
  }
  return store[schema.getOwnName()][result]
}

const getUnflatten = (entities) => {
  // 获取entity实例
  const getEntity = getEntities(entities)
  // 还原数据的对象
  const store = {}
  return function unflatten (result, schema) {
    if (typeof schema.getOwnName === 'undefined') {
      return unExistEntity(schema, result, unflatten)
    } else {
      return ExistEntitiy(schema, result, unflatten, store, getEntity)
    }
  }
}

/**
 * 导出反范式函数
 * @param {*} result
 * @param {*} schema
 * @param {*} entities
 */
export const denormalize = (result, schema, entities) => getUnflatten(entities)(result, schema)
