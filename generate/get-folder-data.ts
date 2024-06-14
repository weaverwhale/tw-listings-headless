import { readFileSync } from 'fs'
import ts from 'typescript'
import { getExportsForSourceFile } from './get-exports-for-source-file'
import { traverseFolder } from './traverse-folder'

export function getFolderData(folderName: string) {
  const filesData: any[] = []

  traverseFolder(folderName, (fileName: any) => {
    // Parse a file
    const sourceFile = ts.createSourceFile(
      fileName,
      readFileSync(fileName).toString(),
      ts.ScriptTarget.ES2022,
      /*setParentNodes */ true,
    )

    const allExports = getExportsForSourceFile(sourceFile)
    filesData.push(allExports)
  })

  return filesData
}
