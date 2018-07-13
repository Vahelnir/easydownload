const StreamSpeed = require('streamspeed')
const {DownloadManager} = require('../src/')

// Creating the manager
const manager = new DownloadManager()
// Putting the number of file to download simultaneously
manager.simultaneousDownloads = 5 // DEFAULT: 1

// Adding files to the queue
manager.addToQueue('http://ovh.net/files/10Mio.dat', 'dl/10Mio.dat', 'ecf2a421f46ab33f277fa2aaaf141780')
manager.addToQueue('http://ovh.net/files/10Mio.dat', 'dl/10Mio-2.dat', 'ecf2a421f46ab33f277fa2aaaf141780')
manager.addToQueue('http://ovh.net/files/10Mio.dat', 'dl/10Mio-3.dat', 'ecf2a421f46ab33f277fa2aaaf141780')
manager.addToQueue('http://ovh.net/files/10Mio.dat', 'dl/10Mio-4.dat', 'ecf2a421f46ab33f277fa2aaaf141780')
manager.addToQueue('http://ovh.net/files/10Mio.dat', 'dl/10Mio-5.dat', 'ecf2a421f46ab33f277fa2aaaf141780')
manager.addToQueue('http://ovh.net/files/10Mio.dat', 'dl/10Mio-6.dat', 'ecf2a421f46ab33f277fa2aaaf141780')

// With custom headers
manager.addToQueue('http://yoururl/privateendpoint', 'dl/helloworld.txt')
  .withHeaders({'Authorization': `Basic ${Buffer.from('test:test').toString('base64')}`})

// Registering events
manager.on('start', _ => console.log('Started'))
manager.on('finish', _ => console.log('Finished'))
manager.on('download_retry', (dl, err) => console.log('[RETRY]', err, dl.path))
manager.on('download_error', err => console.error(err))
manager.on('speed', (speed, avg) => console.log(StreamSpeed.toHuman(avg)))

// Starting the download
manager.start()

