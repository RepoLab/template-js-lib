const JSONEditors = require('jsoneditor/dist/jsoneditor') // this is the multi-mode editor https://github.com/josdejong/jsoneditor
const Tabulator = require('tabulator-tables/dist/js/tabulator')

function showOptionsDefault (node, optionsDiv = this.optionsDiv) {
  

  this.set_button = document.createElement("button")
  this.set_button.id = this.prefix + "setButton"
  this.set_button.innerHTML = "set!"
  this.visual_options_editor_div = document.createElement("div")
  this.visual_options_editor_div.id = this.prefix + "visual_options_editor_div"
  this.data_editor_div = document.createElement("div")
  this.data_editor_div.id = this.prefix + "data_editor_div"
  optionsDiv.innerHTML = ""
  optionsDiv.append(this.set_button, this.visual_options_editor_div, this.data_editor_div)
  const schema = {
    /*
                "title": "Node Options",
                "description": "Node Options",
                "type": "object",
                "properties": {
                "id": {
                    "title": "ID",
                    "description": "The Id of the node",
                    "examples": [
                    "18a96389-de88-492f-95d5-af74f467f424"
                    ],
                    "anyOf": [{
                        "type": "string"
                    },
                    {
                        "type": "integer"
                    }
                    ]
                },
                "x": {
                    "title": "x",
                    "examples": [0],
                    "type": "number"
                },
                "y": {
                    "title": "y",
                    "examples": [0],
                    "type": "number"
                },
                "label": {
                    "title": "Label",
                    "examples": ["Label"],
                    "type": "string"
                },
                "color": {
                    "title": "color",
                    "examples": ["blue", "#ffffff"],
                    "type": "string"
                },
                "shape": {
                    "title": "shape",
                    "type": "string",
                    "enum": ["ellipse", "circle", "database", "box", "text", "image", "circularImage", "diamond", "dot", "star", "triangle", "triangleDown", "hexagon", "square", "icon"]
                }
                }, */
  }
  const options = {
    schema,
    // schemaRefs: {"job": job},
    mode: 'tree',
    modes: ['code', 'tree'] // ['code', 'form', 'text', 'tree', 'view', 'preview']}
  }
  const visualOptionsEditorDiv = this.visual_options_editor_div //document.getElementById(this.prefix + 'visual_options_editor_div')
  const visualOptionsEditor = new JSONEditors(visualOptionsEditorDiv, options)
  // make object of own properties

  visualOptionsEditor.set(node)
  visualOptionsEditor.onChange = (param) => {

  }
  this.set_button.addEventListener('click', () => {
    node = visualOptionsEditor.get()
    this.nodes.update(node)
  })
  const dataEditorDiv = this.data_editor_div
  const dataEditor = new JSONEditors(dataEditorDiv, options)

  dataEditor.set(this.drawer.getValueFromPathArray(node.path))
}

function showSelectionOptions () {
  const selNodes = this.network.getSelectedNodes()
  if (selNodes.length === 0) {
    // remove options
    if (!this.pressed_keys.includes('q')) {
      this.options_container.innerHTML = ''
    }
  } else if (selNodes.length === 1) {
    // show options of single node

    const node = this.nodes.get(selNodes[0])
    if (typeof node.showOptions === 'function') {
      const optionsId = this.options_container.id
      node.showOptions(optionsId)
    } else {
      this.showOptionsDefault(node, this.options_container)
    }
  } else {
    // show common properties
    /**/

    if (true) { // eslint-disable-line no-constant-condition
      // make options gui

      this.options_container.innerHTML = '<h3>comparison between nodes</h3>'
      this.comparison_container = document.createElement('div')
      this.comparison_container.setAttribute('id', this.prefix + 'comparison_container')
      this.options_container.append(this.comparison_container)
      this.options_container.append(document.createElement('H2').appendChild(document.createTextNode('common types')))

      this.set_for_all_container = document.createElement('div')
      this.set_for_all_container.setAttribute('id', this.prefix + 'set_for_all_container')
      this.options_container.append(this.set_for_all_container)

      // create table_data for comparison

      const tableData = []
      for (const nodeId of selNodes) {
        const node = this.nodes.get(nodeId)
        tableData.push({
          id: nodeId,
          color: JSON.stringify(node.color),
          x: node.x,
          y: node.y,
          typeString: node.typeString,
          fixed: node.fixed
        })
      }

      const fixedEdit = (cell) => {
        const node = this.nodes.get(cell._cell.row.data.id)
        const id = cell._cell.row.data.id // eslint-disable-line no-unused-vars
        node.fixed = Boolean(cell._cell.value)

        this.nodes.update(node)
      }

      const xEdit = (cell) => {
        const node = this.nodes.get(cell._cell.row.data.id)

        const id = cell._cell.row.data.id
        const x = cell._cell.value
        const y = node.y

        this.network.moveNode(id, x, y)
        this.nodes.update({
          id,
          x
        })
      }

      const yEdit = (cell) => {
        const node = this.nodes.get(cell._cell.row.data.id)

        const id = cell._cell.row.data.id
        const x = node.x
        const y = cell._cell.value

        this.network.moveNode(id, x, y)
        this.nodes.update({
          id,
          y
        })
      }

      const colorEdit = (cell) => {
        const node = this.nodes.get(cell._cell.row.data.id)

        const id = cell._cell.row.data.id // eslint-disable-line no-unused-vars

        node.color = JSON.parse(cell._cell.value)

        this.nodes.update(node)
      }

      const tabul /* eslint-disable-line no-unused-vars */ = new Tabulator(this.comparison_container, { // eslint-disable-line no-undef
        data: tableData,
        columns: [{
          title: 'id',
          field: 'id',
          editor: 'input'
        },
        {
          title: 'typeString',
          field: 'typeString'
        },
        {
          title: 'x',
          field: 'x',
          editor: 'input',
          cellEdited: xEdit
        },
        {
          title: 'y',
          field: 'y',
          editor: 'input',
          cellEdited: yEdit
        },
        {
          title: 'fixed',
          field: 'fixed',
          editor: true,
          formatter: 'tickCross',
          cellEdited: fixedEdit
        },
        {
          title: 'color',
          field: 'color',
          editor: 'input',
          cellEdited: colorEdit
        }
        ]
      })

      const allXEdit = (cell) => {
        for (const nodeId of this.network.getSelectedNodes()) {
          const node = this.nodes.get(nodeId)
          const id = nodeId
          const x = cell._cell.value
          const y = node.x
          this.network.moveNode(id, x, y)
          this.nodes.update({
            id,
            y
          })
        }
      }
      const allYEdit = (cell) => {
        for (const nodeId of this.network.getSelectedNodes()) {
          const node = this.nodes.get(nodeId)
          const id = nodeId
          const x = node.x
          const y = cell._cell.value

          this.network.moveNode(id, x, y)
          this.nodes.update({
            id,
            y
          })
        }
      }
      const allColorEdit = (cell) => {
        for (const nodeId of this.network.getSelectedNodes()) {
          const node = this.nodes.get(nodeId)
          node.color = JSON.parse(cell._cell.value)
          this.nodes.update(node)
        }
      }

      const allFixedEdit = (cell) => {
        for (const nodeId of this.network.getSelectedNodes()) {
          const node = this.nodes.get(nodeId)
          node.fixed = Boolean(cell._cell.value)

          this.nodes.update(node)
        }
      }

      const setForAllTable /* eslint-disable-line no-unused-vars */ = new Tabulator(this.set_for_all_container, { // eslint-disable-line no-undef
        data: [tableData[0]],
        columns: [{
          title: 'id',
          field: 'id',
          editor: 'input'
        },
        {
          title: 'typeString',
          field: 'typeString'
        },
        {
          title: 'x',
          field: 'x',
          editor: 'input',
          cellEdited: allXEdit
        },
        {
          title: 'y',
          field: 'y',
          editor: 'input',
          cellEdited: allYEdit
        },
        {
          title: 'fixed',
          field: 'fixed',
          editor: true,
          formatter: 'tickCross',
          cellEdited: allFixedEdit
        },
        {
          title: 'color',
          field: 'color',
          editor: 'input',
          cellEdited: allColorEdit
        }
        ]
      })
    } else {
      let content = '<h3>Node IDs</h3><br>'
      for (const nodeId of selNodes) {
        content += '<br>' + nodeId
      }
      this.options_container.innerHTML = content
    }
  }
}

export {

  showOptionsDefault,
  showSelectionOptions

}
