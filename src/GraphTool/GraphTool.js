const vis = require('vis-network/standalone/esm/index.js')
const utils = require('../utils.js')
const GTHelper = require('./GraphToolHelper.js')
// const NodeClasses = require("./NodeClasses.js")    // this causes firefox hanging.
// const RegExp = require('RegExp');
const G = require('../Graph/Graph.js')
const GTContainers = require('./GraphToolContainers.js')
const GTVisjsEvents = require('./GraphToolVisjsEvents.js')
const GTCopyPaste = require('./GraphToolCopyPaste.js')
const GTEventListeners = require('./GraphToolEventListeners.js')
const GTDragAndDrop = require('./GraphToolDragAndDrop.js')
const GTNodeOptions = require('./GraphToolNodeOptions.js')
const GTVisualSearch = require('./GraphToolVisualSearch.js')
const GTDeepSearch = require('./GraphToolDeepSearch.js')
const GTColoring = require('./GraphToolColoring.js')
const GTAlgorithms = require('./GraphToolAlgorithms.js')
const GTLegend = require('./GraphToolLegend.js')
const GTLoadSave = require('./GraphToolLoadSave.js')
const GTManipulation = require('./GraphToolManipulation.js')

class GraphTool {
  static instanceCount = 0

  constructor (container, config, callbackConfig) {
    if ((container || config) === undefined) {
      return
    }

    this.BindToClass(GTHelper, this)
    this.BindToClass(GTContainers, this)
    this.BindToClass(GTEventListeners, this)
    this.BindToClass(GTDragAndDrop, this)
    this.BindToClass(GTNodeOptions, this)
    this.BindToClass(GTDeepSearch, this)
    this.BindToClass(GTVisualSearch, this)
    this.BindToClass(GTAlgorithms, this)
    this.BindToClass(GTLegend, this)
    this.BindToClass(GTLoadSave, this)
    //this.BindToClass(GTManipulation, this)

    this.container = container
    this.graphContainerId = this.container.id

    this.prefix = 'Graph' + GraphTool.instanceCount + '_'

    GraphTool.instanceCount += 1

    const defaultConfig = {
      callbacks: {
        loadState: (e) => this.loadStateDefault(e),
        onBeforeSearchNodes: [(graph, searchString) => true],
        onBeforeRecolorByProperty: [(graph) => true],
        onBeforeColorByValue: [(graph, colorByValueArgs) => true],
        onBeforeInitGraphContainers: [(graph, divId) => true],
        onBeforeColorPicker: [(graph, colorPickerArgs) => true],
        onBeforeInitDeepSearch: [(graph, container) => true],
        onBeforeCopyNodesEdges: [(graph) => true],
        onBeforePasteNodesEdges: [(graph, copiedNodes, copiedEdges) => true],
        onBeforeDeepSearch: [(graph, searchValue) => true],
        onBeforeLegendFunctionality: [(graph, e) => true],
        onBeforeCreateLegend: [(graph) => true],
        onBeforeCreateSaveStateFunctionality: [(graph) => true],
        onBeforeCreateLoadStateFunctionality: [(graph) => true],
        onBeforeCreateSearchUI: [(graph, container) => true]

      }
    }

    this.config = utils.mergeDeep(defaultConfig, callbackConfig) // overwrite default config with user callbackConfig

    console.log("before initGraphContainers")
    this.initGraphContainers(this.container)
    this.drawer = config.drawer

    this.clicked = {} // object to store expanded nodes TODO: rename to expandedNodes

    this.keyObject = { // to be removed, was inteded for callback implementation
      doubleclick: (params) => {
        this.expandNodes(params)
      }
    }
    // create a visjs network and attatch it to div

    this.nodes = this.drawer.nodes // new vis.DataSet(config.nodes)

    this.edges = this.drawer.edges // new vis.DataSet(config.edges)
    this.data = {
      nodes: this.nodes,
      edges: this.edges
    }
    this.options = config.options
    this.options.manipulation.enabled = false    // must be disabled such that activation can be catched for specialized node addition
    this.options.manipulation.initiallyActive = false
    console.log("before building network:", this.vis_container)
    this.network = new vis.Network(this.vis_container, this.data, this.options)
    this.BindToClass(GTManipulation, this)
    this.setManipulationOptions(this.data)

    this.BindToClass(GTVisjsEvents, this)
    this.BindToClass(GTCopyPaste, this)

    this.rootNodesArray = []

    const copiedConfig = JSON.parse(JSON.stringify(config.configFile))

    copiedConfig.root_node_objects.forEach((node) => {
      node.expansion_depth = 100000

      this.rootNodesArray.push('jsondata/' + node.node_id)
    })

    const newInstanceOfGraphClass = new G.Graph()

    this.fullGraphData = {}
    this.fullGraphData.file = config.file
    this.fullGraphData.copiedConfig = copiedConfig
    console.log("before newInstanceOfGraphClass.createGraphByConfig")
    this.fullGraph = newInstanceOfGraphClass.createGraphByConfig(this.container, config.file, copiedConfig, true)

    this.BindToClass(GTColoring, this)

    this.recolorByProperty()

    // variables containing keyboard and mouse state
    this.pressed_keys = []
    this.mouseX = 0
    this.mouseY = 0

    // for copying function
    this.copiedNodes = []
    this.copiedEdges = []

    // for having different node classes.
    this.classRegistry = new Map() // maps from typeString to class
    this.classRegistry.register = (cls) => {
      this.classRegistry.set((new cls()).typeString, cls) // eslint-disable-line new-cap
    }
    // for (let cls of [NodeClasses.RocketBase, NodeClasses.RocketBase, NodeClasses.Fountain, NodeClasses.DelayNode, NodeClasses.TextSpeechNode, NodeClasses.VideoNode,
    //     NodeClasses.DrawNode,
    //     NodeClasses.CameraNode, NodeClasses.ImageNode, NodeClasses.CsvNode,
    //     NodeClasses.JSONNode, NodeClasses.JSONNode1, NodeClasses.JSONSchemaNode
    //   ]) {
    //   this.classRegistry.register(cls)
    // }

    // args to generate full graph

    // this.fullGraphArgs = {
    //   file: this.drawer.file,
    //   depth: this.drawer.depth,
    //   mode: this.drawer.mode,
    //   rootItem: this.drawer.rootItem,
    //   recursionDepth: 100000000000,
    //   nodes: this.drawer.nodes.get(),
    //   edges: this.drawer.edges.get(),
    // }

    // this.drawer_config  = {lang:"en",contractArrayPaths: true}

    // this.fullGraph = new isg.GraphDrawer(this.drawer_config, this.fullGraphArgs);

    // Initialize GUI for various functions acting on the graph.
    this.createLegend()
    this.oldNodeColors = {}
    this.oldEdgeColors = {}
    this.addKeyEventListeners()
    this.addContainerEventListeners(this.vis_container)
    this.dataFile = this.drawer.file
    this.idsToColor = []
    this.deepSearchExpands = []
    this.deepSearchExpandsFull = []
    this.searchExpands = []
    // this.fullGraph
    this.configFile = config.configFile

    this.colorsBeforeVisualSearch = {}
    this.initDeepSearch()

    this.initVisjsCallbacks()

    // Rectangular selection:
    this.vis_container.onmousemove = (event) => {
      this.mouseX = event.clientX
      this.mouseY = event.clientY - 30
    }

    // this.initRectangleSelection()
    this.initDragAndDrop()
    this.visibilityByVisiblePath = {}

    this.initPopUpHTML()
  }

  BindToClass (functionsObject, thisClass) {
    for (const [functionKey, functionValue] of Object.entries(functionsObject)) {
      thisClass[functionKey] = functionValue.bind(thisClass)
    }
  }

  handleCallbacks (params) {
    let result = true
    if (!this.config.callbacks[params.id]) return true
    for (const callback of this.config.callbacks[params.id]) {
      if (!callback(params.params)) {
        result = false
        break
      }
    }
    return result
  }

  // not used
  run_recursive (nodeId) {
    const node = this.nodes.get(nodeId)
    if ('run' in node) {
      node.run()
    } else {
      const connEdges = this.network.getConnectedEdges(node.id)

      connEdges.forEach(function (edgeId) {
        const edge = this.edges.get(edgeId)
        if (edge.from === nodeId) {
          const neighborNode = this.nodes.get(edge.to)

          if (neighborNode.run) {
            neighborNode.run()
          } else {
            window.setTimeout(function () {
              this.run_recursive(edge.to)
            }, 200)
          }
        }
      })
    }
  }

  // Object.filter = (obj, predicate) =>
  //   Object.keys(obj)
  //         .filter( key => predicate(obj[key]) )
  //         .reduce( (res, key) => (res[key] = obj[key], res), {} );

  // expands the object that is saved inside a node and on second doubleclick deletes nodes and edges that go out of the clicked node
  expandNodes (params) {
    if (!this.searchAlert()) {
      return
    }

    this.dataFile.jsondata['Item:SomePerson'] = {
      type: ['Category:Item'],
      label: [{ text: 'Max Mustermann', lang: 'en' }],
      some_property: 'Item:MyOtherItem'
    }

    this.searchNodes('')
    this.search_input.value = ''

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
        this.recolorByProperty()

        this.createLegend()

        if (this.color_method_select.value === 'setColorByValue') {
          this.colorByValue([this.color_method_select.value], this.nodes, this.edges, this.start_color_select.value, this.end_color_select.value)
        }
        this.clicked[params.nodes[0]] = true

        // this.network.body.data.nodes.update(nodes);
        // this.network.body.data.edges.update(edges);

        //  this.nodes.update(nodes);
        //  this.edges.update(edges);
      } else {
        // collapse Nodes
        this.clicked[params.nodes[0]] = false
        // let conEdges = this.network.getConnectedEdges(params.nodes[0], "from")
        this.deleteNodesChildren(params.nodes[0])
        this.createLegend()

        if (this.legendInvisibleGroups(this.options).length === 0) {
          // this.nodes.update(nodes);
          // this.edges.update(edges);
        }
      }
    }

    this.repeatInvisibility(this.options)

    if (this.legendInvisibleGroups(this.options).length === 0) {
      this.resetNodesAndEdgesVisibility()
    }

    // this.createLegend()
  }

  unit () {
    return 'GraphTool'
  }
}

export {

  GraphTool

}
