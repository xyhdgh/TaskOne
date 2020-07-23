import {
  schema,
  normalize,
  denormalize
} from './shopeelize.js'

const user = new schema.Entity('users', {}, {
  idAttribute: 'uid'
})

const comment = new schema.Entity('comments', {
  commenter: user
})

const article = new schema.Entity('articles', {
  author: user,
  comments: {
    result: [comment]
  }
})

const originalData = {
  id: '123',
  author: {
    uid: '1',
    name: 'Paul'
  },
  title: 'My awesome blog post',
  comments: {
    total: 100,
    result: [{
      id: '324',
      commenter: {
        uid: '2',
        name: 'Nicole'
      }
    }]
  }
}

const normalizeData = normalize(originalData, article)
console.log(normalizeData)

const { result, entities } = normalizeData
const denormalizedData = denormalize(result, article, entities)
console.log(denormalizedData)
