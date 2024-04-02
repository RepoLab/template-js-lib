const G = require('../Graph/Graph.js')

function searchFunctionality (data, searchValue) {
  this.search_input.value = ''

  this.deepSearch(searchValue)
}

// resets deep search if user accepts the search results to open further nodes
function searchAlert () {
  if (this.deepSearchExpands.length > 0 || this.deepSearchExpandsFull.length > 0) {
    const result = confirm('Apply search results?')

    if (result) {
      // alert("You clicked 'Yes'!");
      this.search_input.value = ''
      this.deepSearchExpands = []
      this.deepSearchExpandsFull = []
      return true
    } else {
      // alert("You clicked 'No'!");
      return false
    }
  }

  return true
}

function searchItem (nodeId, fullGraph) {
  // if node id is not in the current graph
  if (!this.itemExists(nodeId)) {
    // get node from this.fullGraph
    const searchValue = fullGraph.nodes.get(nodeId)
    // get parent item from this.fullGraph of the given node id
    const parentItem = this.searchJSON(this.drawer.file, `${searchValue.path[1]}`)
    // get parent item id
    const parentItemId = `${parentItem[0].split('.')[1]}/${parentItem[0].split('.')[2]}`

    // if the parent item node is not in the current graph, go recursively back in the graph until you find a node that is in the current graph
    if (!this.itemExists(parentItemId)) {
      this.searchItem(parentItemId, fullGraph)
      this.expandNodesCleanedUp({ nodes: [parentItemId] })

      return
    }

    // if the parent item node is in the current graph, expand it
    this.expandNodesCleanedUp({ nodes: [parentItemId] })

    return
  }

  this.expandNodesCleanedUp({ nodes: [nodeId] })
}

function deepSearchExpandNodes (foundNode, fullGraph) {
  const path = foundNode.path
  const firstPath = `${path[0]}/${path[1]}`
  const firstPathExists = this.itemExists(firstPath)
  let currentID = firstPath

  // If the node is already open, don't expand it again but note the nodes that would have been expanded

  if (this.itemExists(foundNode.id)) {
    return
  }

  // if the path starting node is not open, open it
  if (!firstPathExists) {
    this.searchItem(firstPath, fullGraph)
    this.expandNodesCleanedUp({ nodes: [firstPath] })

    this.deepSearchExpandNodes(foundNode)

    return
  }

  // expand path if starting node is given
  for (let i = 2; i < path.length; i += 2) {
    if (path[i + 1] === undefined) {
      break
    }
    currentID += `/${path[i]}/${path[i + 1]}`

    if (this.itemExists(currentID) && !this.isNodeOpen(currentID)) {
      this.expandNodesCleanedUp({ nodes: [currentID] })
    }
  }
}

// collapses all nodes that were expanded during deep search
function collapseSearch () {
  // if the checkbox is not checked, collapse all nodes that were expanded during deep search
  if (!this.show_deep_search_expanded.checked) {
    // remove duplicates from the deep search expands array
    this.deepSearchExpandsFull = [...new Set(this.deepSearchExpandsFull)]

    this.deepSearchExpandsFull.forEach(node => {
      // if the node exists and is not the root node, collapse it
      if (this.itemExists(node) && /* node != this.drawer.rootId */ (!this.rootNodesArray.includes(node))) {
        if (this.isNodeOpen(node)) {
          this.expandNodesCleanedUp({ nodes: [node] })
          this.nodes.update(this.nodes.get(node))
        }
      }
    })

    // reset the deep search expands and clicked nodes arrays
    this.deepSearchExpands = []
    this.deepSearchExpandsFull = []
    this.clicked = {}
    this.legend_container.remove()
    this.createLegend()
  }
}

// colors the nodes and edges that were found during deep search
function deepSearchColorPath (foundNodes) {
  this.nodes.get().forEach(node => {
    // if the node is not expanded by deep search and is not in the found nodes, color it white
    if (!this.deepSearchExpands.includes(node.id) && !foundNodes.some(obj => obj.id === node.id) && !this.searchExpands.includes(node.id)) {
      if (node.group !== 'root') {
        node.color = '#ffffff'

        this.nodes.update(node)
      }
    }
  })

  this.edges.get().forEach(edge => {
    // if the edge is connected to colored nodes but not white nodes, color it black
    if (!(this.nodes.get(edge.from).color !== '#ffffff' && this.nodes.get(edge.to).color !== '#ffffff')) {
      edge.color = '#000000'

      this.edges.update(edge)
    }
  })
}

function expandNodesCleanedUp (params) {
  if (params.nodes.length > 0) {
    const node = this.nodes.get(params.nodes[0])

    if ('item' in node && (this.clicked[params.nodes[0]] === false || !('' + params.nodes[0] in this.clicked)) && (this.network.getConnectedNodes(params.nodes[0], 'to').length === 0)) {
      // expand node

      const args = {
        // file: config.file, not needed since drawer has own file
        lastId: node.id,
        recursionDepth: 1,
        recursionRootId: node.id,
        recurse: true,
        item: node.item,
        path: node.path,
        oldContext: '',
        lastDepth: node.depth,
        givenDepth: 1,
        mode: true,
        previousNode: node
      }

      this.drawer.createGraphNodesEdges(args)

      this.clicked[params.nodes[0]] = true
    } else {
      // collapse Nodes
      this.clicked[params.nodes[0]] = false

      this.deleteNodesChildren(params.nodes[0])
    }
  }
}

function deepSearch (searchValue) {
  if (this.handleCallbacks({ id: 'onBeforeDeepSearch', params: { graph: this, searchValue } })) {
    const fullGraph = this.fullGraph

    // if search value is empty, collapse all expanded nodes and return
    if (searchValue === '') {
      this.collapseSearch()
      this.recolorByProperty()

      return
    }

    // before searching, collapse all expanded nodes from previous search
    this.collapseSearch()

    // search for nodes with label containing search value
    let foundNodes = []

    if (this.search_select.value === 'search_node') {
      const lowercaseSearchValue = searchValue.toLowerCase()
      foundNodes = fullGraph.nodes.get().filter(node =>
        node.label.toLowerCase().includes(lowercaseSearchValue)
      )
    }

    if (this.search_select.value === 'search_edge') {
      // search for edges with label containing search value
      let foundEdges = []

      const lowercaseSearchValue = searchValue.toLowerCase()
      foundEdges = fullGraph.edges.get().filter(edge =>
        edge.label.toLowerCase().includes(lowercaseSearchValue)
      )

      for (let i = 0; i < foundEdges.length; i++) {
        foundNodes.push(this.fullGraph.nodes.get(foundEdges[i].to))
      }
    }

    if (foundNodes.length === 0) {
      this.collapseSearch()
      this.recolorByProperty()
      if (this.show_deep_search_expanded.checked) {
        this.setGraphColorsBlackAndWhite(this.nodes.get(), this.edges.get())
      }
      return
    }

    this.deepSearchExpands = []

    foundNodes.forEach(node => {
      // expand the paths to the found nodes
      this.deepSearchExpandNodes(node, fullGraph)

      const pathsToColor = []

      for (let i = 0; i < this.rootNodesArray.length; i++) {
        const tempPaths = this.findAllPaths(this.rootNodesArray[i], node.id)

        for (let j = 0; j < tempPaths.length; j++) {
          pathsToColor.push(tempPaths[j])
        }

        // pathsToColor = [...pathsToColor, ...tempPaths] //this.findAllPaths(this.drawer.rootId, node.id);
      }

      for (let i = 0; i < pathsToColor.length; i++) {
        for (let j = 0; j < pathsToColor[i].length; j++) {
          if (!this.deepSearchExpands.includes(pathsToColor[i][j])) {
            if (/* pathsToColor[i][j] != this.drawer.rootId */!this.rootNodesArray.includes(pathsToColor[i][j])) {
              this.deepSearchExpands.push(pathsToColor[i][j])
            }
          }
        }
      }
    })

    this.recolorByProperty()
    this.deepSearchColorPath(foundNodes)
    this.deepSearchExpandsFull = this.deepSearchExpandsFull.concat(this.deepSearchExpands)

    this.createLegend()
    this.repeatInvisibility(this.options)

    let maxDepthFULL = 0
    let maxDepthEXPANDS = 0

    for (let i = 0; i < fullGraph.nodes.get().length; i++) {
      if (fullGraph.nodes.get()[i].depth > maxDepthFULL) {
        maxDepthFULL = fullGraph.nodes.get()[i].depth
      }
    }

    for (let i = 0; i < this.nodes.get().length; i++) {
      if (this.nodes.get()[i].depth > maxDepthEXPANDS) {
        maxDepthEXPANDS = this.nodes.get()[i].depth
      }
    }

    if (maxDepthEXPANDS === maxDepthFULL) {
      this.fullGraphData.copiedConfig.root_node_objects.forEach((node) => {
        node.expansion_depth += 10

        this.rootNodesArray.push('jsondata/' + node.node_id)
      })

      const graphInstance = new G.Graph()
      this.fullGraph = graphInstance.createGraphByConfig(this.fullGraphData.file, this.fullGraphData.copiedConfig, true)
    }

    if (this.legendInvisibleGroups(this.options).length === 0) {
      this.resetNodesAndEdgesVisibility()
    }
  }
}

export {

  searchAlert,
  searchItem,
  deepSearchExpandNodes,
  collapseSearch,
  deepSearchColorPath,
  expandNodesCleanedUp,
  deepSearch,
  searchFunctionality
}
