import ts from 'typescript'

export function getExportsForSourceFile(sourceFile: ts.SourceFile) {
  const allExports: { type: string; name: string; text: string; parameters?: any[] }[] = []

  visitNode(sourceFile)

  function visitNode(node: ts.Node) {
    if (ts.isExportSpecifier(node)) {
      const name = node.name.getFullText()
      allExports.push({ type: 'specifier', name, text: node.getFullText() })
    } else if (node.kind === ts.SyntaxKind.ExportKeyword) {
      const parent = node.parent
      const text = parent.getFullText()

      if (ts.isFunctionDeclaration(parent)) {
        const name = parent?.name?.getFullText() ?? ''
        const parameters = parent.parameters.map((param) => {
          return {
            name: param.name.getFullText().trim(),
            text: param.getFullText().trim(),
            type: param.type?.getFullText().trim() ?? 'any',
          }
        })
        allExports.push({ type: 'function', name, text, parameters })
      } else if (ts.isVariableStatement(parent)) {
        parent.declarationList.declarations.forEach((declaration) => {
          const name = declaration.name.getFullText()
          const type = declaration.type?.getFullText().trim() ?? 'variable'
          allExports.push({ name, text, type })
        })
      } else if (ts.isClassDeclaration(parent)) {
        const name = parent.name?.getFullText() ?? ''
        const type =
          parent.heritageClauses
            ?.map((clause) => {
              return clause.types.map((type) => type.expression.getFullText())
            })
            .toString() ?? 'class'
        allExports.push({ name, text, type })
      } else if (ts.isTypeAliasDeclaration(parent)) {
        const name = parent.name?.getFullText() ?? ''
        const type = parent.type?.getFullText().trim() ?? 'type'
        allExports.push({ name, text, type })
      } else if (ts.isEnumDeclaration(parent)) {
        const name = parent.name?.getFullText() ?? ''
        allExports.push({ type: 'enum', name, text })
      } else if (ts.isModuleDeclaration(parent)) {
        const name = parent.name?.getFullText() ?? ''
        const type = parent.body?.getFullText() ?? 'module'
        allExports.push({ name, text, type })
      } else if (ts.isInterfaceDeclaration(parent)) {
        const name = parent.name?.getFullText() ?? ''
        allExports.push({ name, text, type: 'interface' })
      } else if (ts.isNamespaceExportDeclaration(parent)) {
        const name = parent.name.getFullText()
        allExports.push({ name, text, type: 'namespace' })
      }
    }

    ts.forEachChild(node, visitNode)
  }

  return { file: sourceFile.fileName, exports: allExports }
}
