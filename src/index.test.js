import {
  schema,
  normalize,
  denormalize
} from './shopeelize.js'

// 测试用例
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

// 范式化结果
const normalizedData = {
  result: '123',
  entities: {
    articles: {
      123: {
        author: '1',
        comments: {
          total: 100,
          result: ['324']
        },
        id: '123',
        title: 'My awesome blog post'
      }
    },
    comments: {
      324: {
        commenter: '2',
        id: '324'
      }
    },
    users: {
      1: {
        uid: '1',
        name: 'Paul'
      },
      2: {
        uid: '2',
        name: 'Nicole'
      }
    }
  }
}
// 测试normalize函数
test('Original To Normalize', () => {
  // Define a users schema
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })

  // Define your comments schema
  const comment = new schema.Entity('comments', {
    commenter: user
  })

  // Define your article
  const article = new schema.Entity('articles', {
    author: user,
    comments: {
      result: [comment]
    }
  })

  const testData = normalize(originalData, article)
  expect(testData).toEqual(normalizedData)
})

// 测试denormalize函数
test('Normalize To Original', () => {
  // Define a users schema
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })

  // Define your comments schema
  const comment = new schema.Entity('comments', {
    commenter: user
  })

  // Define your article
  const article = new schema.Entity('articles', {
    author: user,
    comments: {
      result: [comment]
    }
  })
  const {
    result,
    entities
  } = normalizedData
  const denormalizedData = denormalize(result, article, entities)
  expect(denormalizedData).toEqual(originalData)
})
