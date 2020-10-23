const fs = require('fs')
const csvSplitStream = require('csv-split-stream')
const pm2 = require('pm2')
const actions = require('./actionTypes')

const sourceDirectory = './originalFile'
const outputDirectory = './splittedFiles'
const conf = {
  script: './insertDb.js',
  exec_mode: 'fork',
  instances: 8,
  max_memory_restart: '2G'
}
let files = []

/*
 * class Application
 * Create a process.
 */
class Application {
  /**
   * deletePm2.
   * Delete a pm2 process.
   * @param {Number} id.
   */
  deletePm2(id) {
    pm2.delete(id)
  }

  /**
   * filesNotEmpty.
   * Check if files array is empty or not.
   * return {Boolean}
   */
  filesNotEmpty() {
    return files.length > 0
  }

  /**
   * getMessages.
   * Listen for the messages of his child processes.
   */
  getMessages() {
    pm2.launchBus((err, bus) => {
      if (err) {
        console.log(err)
      }
      bus.on('process:msg', ({
        process: {
          pm_id: pmId
        },
        data: {
          type,
          file
        }
      }) => {
        console.log('message type recieve by the parent :', type)
        switch (type) {
          /**
           * When the child process is mounted, he send a rendy message.
           * Then we send him the first file in the files array
           */
          case actions.ready:
            if (this.filesNotEmpty()) {
              this.sendDataToProcessId(files[pmId - 1], pmId)
            } else {
              this.deletePm2(pmId)
            }
            break
            /**
             * When the child process finished, he send a finish message.
             * The treated file is deleted and an other file is sended
             */
          case actions.finish:
            files.splice(pmId - 1, 1)
            fs.unlink(`${outputDirectory}/${file}`, (error) => {
              if (error) console.log(error)
            })
            if (this.filesNotEmpty()) {
              this.sendDataToProcessId(files[pmId - 1], pmId)
            } else {
              this.deletePm2(pmId)
            }
            break
            /**
             * When the child process inserted 1000 lines, he send a delete message.
             * Then we delete the first 1000 lines of the treated file.
             */
          case actions.delete:
            fs.readFile(`${outputDirectory}/${file}`, 'utf8', (fileErr, fileContent) => {
              if (fileErr) {
                console.log(fileErr)
              }
              console.log(`deleting 1000 lines from ${file}`)
              const newFile = fileContent.split('\n').slice(1000).join('\n')
              fs.writeFile(`${outputDirectory}/${file}`, newFile, (errorWriteFile) => {
                if (errorWriteFile) {
                  console.log(errorWriteFile)
                }
              })
            })
            break
          default:
            console.log('no actions sended')
        }
      })
    })
  }

  /**
   * runApp.
   * Start the application.
   */
  runApp() {
    // Test if files are already splitted
    // If not, split them and then fill the files array
    this.splitFiles()
      // Then connect to PM2 and run the instances
      .then(() => this.runPm2())
  }

  /**
   * runPm2.
   * connect to pm2, start the child processes and listen for them messages.
   */
  runPm2() {
    pm2.connect((err) => {
      if (err) {
        console.error(err)
        process.exit(2)
      }

      pm2.start(conf, (errors) => {
        if (errors) {
          console.log(errors)
        }
        this.getMessages()
      })
    })
  }

  /**
   * sendDataToProcessId.
   * send data to a child process.
   * @param {String} file.
   * @param {Number} id.
   */
  sendDataToProcessId(file, id) {
    pm2.sendDataToProcessId(id, {
        type: 'process:msg',
        data: {
          filename: file
        },
        topic: 'my topic'
      },
      (err) => {
        if (err) console.log(err)
      })
  }

  /**
   * splitFiles.
   * Fill the files array by splitting the main csv file.
   * Or fille the files array by the existing files in
   * 'splittedFiles' directory
   * @param {String} file.
   * @param {Number} id.
   */
  splitFiles() {
    return new Promise((resolve) => {
      if (fs.readdirSync(outputDirectory).length === 0) {
        csvSplitStream.split(
            fs.createReadStream(`${sourceDirectory}/stock.csv`), {
              lineLimit: 275000
            },
            (index) => {
              console.log(`Splitted files : ${index}`)
              files.push(`out-${index}.csv`)
              return fs.createWriteStream(`${outputDirectory}/out-${index}.csv`)
            }
          )
          .then(() => resolve())
          .catch((err) => {
            if (err) console.log(err)
          })
      } else {
        files = fs.readdirSync(outputDirectory)
        console.log(`Splitted files : ${files.length}`)
        resolve()
      }
    })
  }
}

const application = new Application()
application.runApp()
