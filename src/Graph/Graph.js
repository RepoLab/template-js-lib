const vis = require('vis-network/standalone/esm/index.js')

// const $ = require('jquery')

const GD = require('../GraphDrawer/GraphDrawer.js')
const GT = require('../GraphTool/GraphTool.js')

class Graph {
  constructor (container, file, configFile, onlyData) {
    if ((file || configFile) === undefined) {
      return
    }

    this.container = container
    this.file = file
    this.configFile = configFile
    this.graphtool // eslint-disable-line no-unused-expressions
    this.openPaths = []

    this.createGraphByConfig(container,file, configFile, onlyData)

    this.drawer // eslint-disable-line no-unused-expressions
  }

  isNodeLastInPath (node) {
    const edges = this.graphtool.edges.get()

    for (let i = 0; i < edges.length; i++) {
      if (edges[i].from === node) {
        return false
      }
    }

    return true
  }

  createGraphByConfig (container, file, configFile, onlyData) {
    // "positioning_function_object" / maybe given and/or will be saved in the config

    // "root_node_objects" / where to start expanding
    const options = {
      interaction: {
        hover: true,
        multiselect: true
      },
      manipulation: {
        enabled: true
      },
      physics: {
        stabilization: {
          enabled: true
        },
        barnesHut: {
          gravitationalConstant: -40000,
          centralGravity: 0,
          springLength: 0,
          springConstant: 0.5,
          damping: 1,
          avoidOverlap: 0
        },
        maxVelocity: 5
      },
      edges: {
        arrows: 'to'

      },
      groups: {
        useDefaultGroups: false
      }
    }

    // let drawer
    let tempNodes
    let tempEdges
    let tempColorObj
    let args
    const connections = []

    const drawerConfig = { lang: 'en', contractArrayPaths: true }

    console.log("configFile, configFile.root_node_objects",configFile, configFile.root_node_objects)
    for (let i = 0; i < configFile.root_node_objects.length; i++) {
      if (this.drawer === undefined) {
        tempNodes = []
        tempEdges = []
        tempColorObj = {}
      } else {
        tempNodes = this.drawer.nodes.get()
        tempEdges = this.drawer.edges.get()
        tempColorObj = this.drawer.colorObj

        this.drawer.edges.get().forEach((edge) => {
          if (edge.from === 'jsondata/' + configFile.root_node_objects[i].node_id || edge.to === 'jsondata/' + configFile.root_node_objects[i].node_id) {
            connections.push(edge)

            tempEdges = tempEdges.filter(obj => obj.id !== edge.id)
          }
        })

        tempNodes = tempNodes.filter(obj => obj.id !== 'jsondata/' + configFile.root_node_objects[i].node_id)
      }

      args = {
        file,
        depth: 1,
        mode: true,
        nodes: tempNodes,
        edges: tempEdges,
        rootItem: configFile.root_node_objects[i].node_id,
        recursionDepth: configFile.root_node_objects[i].expansion_depth,
        colorObj: tempColorObj,
        configFile
      }

      this.drawer = new GD.GraphDrawer(drawerConfig, args)
    }

    connections.forEach((edge) => {
      this.drawer.edges.update(edge)
    })

    if (onlyData) {
      return this.drawer
    }


    const config = {
      // nodes: nodes,
      // edges: edges,
      options,
      file, // eslint-disable-line no-undef
      drawer: this.drawer,
      configFile
    }

    this.graphtool = new GT.GraphTool(this.container, config)
   
  }

  unit () {
    return 'Graph'
  }

  getGraphToolInstance () {
    return this.graphtool
  }
}

export {

  Graph,
  GD,
  GT,
  vis

}
