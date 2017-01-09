import create from '@most/create'
import fileReaderStream from 'filereader-stream'
import {default as makeStlStream, concatStream } from 'usco-stl-parser'
var concat = require('concat-stream')

export default function fileAsStream (data) {
  console.log('data in fileAsStream', data)
  return create((add, end, error) => {
    const streamErrorHandler = (err) => error(err)

    fileReaderStream(data)
      .on('error', streamErrorHandler)
      .pipe(makeStlStream({useWorker: true}))
      .on('data',function(data){
        //console.log('data', data)
        add(data)
        end()
      })
      //.pipe(concatStream(data => add(data)))
      //.on('error', streamErrorHandler)
  })
}
