import fs from 'fs'
import path from 'path'
import { getFolderData } from './get-folder-data'

const _path = '@tw'
const filename = `./src/${_path}.json`

console.log('Getting folder data...')
const data = getFolderData(`./${_path}`).filter(v => !JSON.stringify(v).includes('DS_Store'))
fs.writeFileSync(filename, JSON.stringify(data, null, 2))
console.log(`Folder data saved to ${filename}`)
