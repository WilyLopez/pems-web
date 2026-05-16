const fs = require('fs')
const path = require('path')

const uiComponents = [
  ['alert-dialog', 'AlertDialog'],
  ['alertdialog', 'AlertDialog'],
  ['avatar', 'Avatar'],
  ['badge', 'Badge'],
  ['button', 'Button'],
  ['card', 'Card'],
  ['checkbox', 'Checkbox'],
  ['dialog', 'Dialog'],
  ['dropdown-menu', 'DropdownMenu'],
  ['dropdownmenu', 'DropdownMenu'],
  ['input', 'Input'],
  ['label', 'Label'],
  ['popover', 'Popover'],
  ['scroll-area', 'ScrollArea'],
  ['scrollarea', 'ScrollArea'],
  ['select', 'Select'],
  ['separator', 'Separator'],
  ['skeleton', 'Skeleton'],
  ['table', 'Table'],
  ['tabs', 'Tabs'],
  ['textarea', 'Textarea'],
  ['tooltip', 'Tooltip'],
]

const commonComponents = [
  ['EmptyState', 'Emptystate'],
  ['ErrorState', 'Errorstate'],
  ['StatusBadge', 'Statusbadge'],
  ['emptystate', 'Emptystate'],
  ['errorstate', 'Errorstate'],
  ['statusbadge', 'Statusbadge'],
  ['empty-state', 'Emptystate'],
  ['error-state', 'Errorstate'],
  ['status-badge', 'Statusbadge'],
  ['confirm-dialog', 'ConfirmDialog'],
  ['confirmdialog', 'ConfirmDialog'],
  ['page-header', 'PageHeader'],
  ['pageheader', 'PageHeader'],
]

const brandComponents = [['logo', 'Logo']]

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles)
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, '/', file))
      }
    }
  })

  return arrayOfFiles
}

const files = getAllFiles('.')
let modifiedFiles = []

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8')
  let originalContent = content

  uiComponents.forEach(([wrong, correct]) => {
    // Use a regex that matches exactly the component name after the path
    const regex = new RegExp(`(components/ui/)${wrong}(['"])`, 'g')
    content = content.replace(regex, `$1${correct}$2`)
  })

  commonComponents.forEach(([wrong, correct]) => {
    const regex = new RegExp(`(components/common/)${wrong}(['"])`, 'g')
    content = content.replace(regex, `$1${correct}$2`)
  })

  brandComponents.forEach(([wrong, correct]) => {
    const regex = new RegExp(`(components/brand/)${wrong}(['"])`, 'g')
    content = content.replace(regex, `$1${correct}$2`)
  })

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8')
    modifiedFiles.push(file)
  }
})

console.log('Modified files count:', modifiedFiles.length)
modifiedFiles.forEach((f) => console.log(f))
