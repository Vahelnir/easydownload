# easydownload
easydownload is a library that helps us:
 - Download multiple files
 - Get the download's speed
 - Parallel downloading
 
# Usage
**Single file**
```js
const {Download} = require('easydownload')

const download = new Download('some url', 'some local path')
download.on('finish', _ => console.log('download is finished'))

download.start()
```


**Multiple file**
```js
const {DownloadManager} = require('easydownload')

const manager = new DownloadManager

// Putting the number of file to download simultaneously
manager.simultaneousDownloads = 5 // DEFAULT: 1

manager.addToQueue('some url', 'some local path')
manager.addToQueue('some url', 'some local path')
manager.addToQueue('some url', 'some local path')

manager.on('speed', (speed, avg) => console.log(StreamSpeed.toHuman(avg)))
manager.on('finish', _ => console.log('download is finished'))

manager.start()
```

# API
## DownloadManager


### new DownloadManager()

Create the manager

### DownloadManager#start()

Starts the download

### DownloadManager#pause()

Pauses the download to get resumed

### Download#resume()

Resumes the download

### DownloadManager#addToQueue(url, localPath)

Add a download to the queue

### DownloadManager#simultaneousDownloads

Number of file to download at once

### Event: 'start'

### Event: 'finish'

### Event: 'download_start'
* `Download` - A Download instance

### Event: 'download_error'
* `Error` - A Download instance
* `Download` - A Download instance

### Event: 'speed'

* `Number` - Speed at which streams in the group are being read.
* `Number` - Average speed.

## Download

### new Download(url, localPath)

Represents a download

### Download#start()

Starts the download

### Download#pause()

Pauses the download to get resumed

### Download#resume()

Resumes the download

### Download#stop()

Stops the download, but keeps the file

### Download#destroy()

Destroys the download, and removes the file

### Event: 'start'
* `stream.Readable` - The received download stream

### Event: 'data'
* `Buffer` - chunk

### Event: 'state_change'
* `Download.STATES: Number` - The current state

### Event: 'pause'
### Event: 'resume'
### Event: 'stop'
### Event: 'destroy'
### Event: 'finish'

### Event: 'error'
* `Error` - the error
