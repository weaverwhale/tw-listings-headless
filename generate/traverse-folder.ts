import { readdirSync, lstatSync } from 'fs'

export const traverseFolder = (dirMain: string, func: any) => {
  const readDirMain = readdirSync(dirMain)

  try {
    readDirMain.forEach((dirNext) => {
      if (lstatSync(dirMain + '/' + dirNext).isDirectory()) {
        traverseFolder(dirMain + '/' + dirNext, func)
      } else {
        func(dirMain + '/' + dirNext)
      }
    })
  } catch (error) {
    throw error
  }
}
