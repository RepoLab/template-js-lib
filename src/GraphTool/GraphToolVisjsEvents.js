const JSONEditors = require('jsoneditor/dist/jsoneditor') // this is the multi-mode editor https://github.com/josdejong/jsoneditor

function initVisjsCallbacks () {
  // set visjs network callbacks

  this.network.on('click', (params) => {
    this.visOnClick(params)
  })

  this.network.on('doubleClick', (params) => {
    this.keyObject.doubleclick(params) // TODO: implement central callback object
  })

  this.network.on('oncontext', (params) => {
    this.visOnContext(params) // TODO: implement right click, probably Property-List, but as callback function.
  })

  this.network.on('dragStart', (params) => {
    this.visOnDragStart(params)
  })

  this.network.on('dragEnd', (params) => {
    this.visOnDragEnd(params)
  })
}

function visOnDragEnd (params) {
  params.nodes.forEach((nodeId) => {
    const node = this.nodes.get(nodeId)
    const position = this.network.getPosition(nodeId)
    // setting the current position is necessary to prevent snap-back to initial position
    node.x = position.x
    node.y = position.y
    node.fixed = true
    this.nodes.update(node)
  })
  // show selection options if multiple nodes are selected i.e. not a single one was dragged
  if (this.network.getSelectedNodes().length > 0) {
    this.showSelectionOptions()
  }
}

function visOnDragStart (params) {
  if (params.nodes.length > 0) {
    const newNodeIds = []
    params.nodes.forEach((nodeId, index) => {
      const node = this.nodes.get(nodeId)
      const position = this.network.getPosition(nodeId) // setting the current position is necessary to prevent snap-back to initial position

      node.x = position.x
      node.y = position.y

      // duplicate Node if ctrl is pressed
      if (params.event.srcEvent.ctrlKey) {
        // now: duplicate node and connect to original one. TODO: check if this should create a new node as property of the original.
        const newNode = this.duplicateNode(node)

        // added node shall move with cursor until button is released
        newNode.fixed = false
        //newNode.id = this.graph.id // eslint-disable-line no-undef
        newNode.depth = this.nodes.get(this.network.getSelectedNodes()[index]).depth + 1
        //this.graph.id += 1 // eslint-disable-line no-undef

        this.copiedEdges = this.network.getSelectedEdges()

        const newEdge = {
          from: node.id,
          to: newNode.id,
          label: 'InitializedByCopyFrom', // this.edges.get(this.copiedEdges[index]).label,
          color: newNode.color,
          group: newNode.group
        }

        this.nodes.update(newNode)
        this.edges.update(newEdge) // {from: node.id, to: newNode.id}
        newNodeIds.push(newNode.id)
      } else {
        node.fixed = false
        this.nodes.update(node)
      }
    })
    if (params.event.srcEvent.ctrlKey) {
      this.network.setSelection({
        nodes: newNodeIds
      })
    }
  }
}

function visOnContext (params) {
  console.log('in this.network.on(oncontext)')
}

function visOnClick (params) {
  this.showSelectionOptions()
  // TODO: move definition of keyboard shortcuts to this.registerKeyboardShortcuts
  if (this.pressed_keys.includes('a')) {
    // add a node to position of mouse if a is pressed during click
    // let addNode = new NodeClasses.BaseNode(this)
    // addNode.x = params.pointer.canvas.x
    // addNode.y = params.pointer.canvas.y
    // this.nodes.update(addNode)
  }

  if (this.pressed_keys.includes('q')) {
    // show global JSON vis JSONeditor in options div

    const optionsDivId = this.options_container.id

    document.getElementById(optionsDivId).innerHTML = "<button id='" + this.prefix + "setButton'>set!</button><br><div id='" + this.prefix + "editor_div'></div>"
    // todo: implement changes
    const setButton = this.set_button//document.getElementById(this.prefix + 'setButton') // eslint-disable-line no-unused-vars

    const options = {
      mode: 'tree',
      modes: ['code', 'tree'] // ['code', 'form', 'text', 'tree', 'view', 'preview']}
    }

    const editorDiv = document.getElementById(this.prefix + 'editor_div', options)
    // create a JSONEdior in options div
    const editor = new JSONEditors(editorDiv) // TODO: Editor is currently not rendered. find error.

    editor.set({
      edges: this.edges.get(),
      nodes: this.nodes.get()
    })
  }
}

export {
  visOnDragEnd,
  visOnDragStart,
  visOnContext,
  visOnClick,
  initVisjsCallbacks

}
