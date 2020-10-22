const { MongoClient } = require('mongodb')
const csv = require('csvtojson')
const actions = require('./actionTypes')

const outputDirectory = './splittedFiles'

/*
  * class Application
  * Create a process.
*/
class Application {
  /**
    * convertFileToJson.
    * convert the csv file to json.
    * @param {String} filename.
  */
  async convertFileToJson(filename) {
    const datas = []
    const json = await csv().fromFile(`${outputDirectory}/${filename}`)
    while (json.length > 0) {
      datas.push(json.splice(0, 1000))
    }
    if (datas.length === 0) {
      this.sendFinish(filename)
    }
    MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
      if (err) {
        console.log(err)
      } else {
        let iterator = 0
        while (datas.length !== (iterator + 1)) {
          if (this.insertBulk(filename, datas[iterator], client, iterator + 1)) {
            iterator += 1
          }
        }
        if (datas.length === (iterator + 1)) {
          client.close()
          this.sendFinish(filename)
        }
      }
    })
  }

  /**
    * insertBulk.
    * insert datas in mongodb.
    * @param {String} filename.
    * @param {Array} data.
    * @param {Object} client.
    * @param {Number} index.
    * @return {Boolean}
  */
  insertBulk(filename, data, client, index) {
      //console.log(filename = "FILENAME OO");
    const db = client.db('bigdata')
    const collection = db.collection('stock'); console.log(collection + "KOLEKSYON");
    const bulk = collection.initializeOrderedBulkOp()
    let iterator = 0
    while (iterator !== (data.length - 1)) {
      bulk.insert(data[iterator])
      iterator += 1
    }
    bulk.execute().then(() => {
      console.log(`inserted lines : ${1000 * index}`)
      return true
    })
  }

  /**
    * listenEvents.
    * Listen for the messages comming from the parent process.
  */
  listenEvents() {
    process.on('message', (res) => {
      if (res !== 'shutdown') {
        const { filename } = res.data
        console.log(`file to insert : ${filename} `)
        this.convertFileToJson(filename)
      }
    })
    this.sendReady()
  }

  /**
    * sendDeleteLines.
    * send message to main process
    * deletes 1000 lines from current file.
    * @param {String} file.
  */
  sendDeleteLines(file) {
    process.send({
      type: 'process:msg',
      data: {
        type: actions.delete,
        file
      }
    })
  }

  /**
    * sendFinish.
    * send message to main process
    * deletes file and get new one.
    * @param {String} file.
  */
  sendFinish(file) {
    process.send({
      type: 'process:msg',
      data: {
        type: actions.finish,
        file
      }
    })
  }

  /**
    * sendReady.
    * send message to main process
    * tell main process he is ready.
    * @param {String} file.
  */
  sendReady(file = null) {
    process.send({
      type: 'process:msg',
      data: {
        type: actions.ready,
        file
      }
    })
  }
}

const application = new Application()
application.listenEvents()
