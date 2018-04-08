const packager = require('electron-packager')

const options = {
  platform: ['win32', 'linux'],
  arch: 'x64',
  name: 'imgurSnap',
  icon: './view/images/imgurSnap',
  dir: '.',
  ignore: ['build'],
  out: './build/releases',
  overwrite: true,
  asar: true,
  prune: true
}

packager(options, (error, path) => {
  if (error) {
    return (
      console.log(`Error: ${error}`)
    )
  }

  console.log(`Package created, path: ${path}`)
})
