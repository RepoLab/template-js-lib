const G = require('../Graph/Graph.js')

// loads or saves the graph to a .txt file
function loadFunctionality (element) {
  // Todo: replace global ids with prefixed ids or class members to allow multiple instances on one page
  element.setAttribute('id', this.prefix + 'load')
  element.addEventListener('click', () => {
    this.createLoadStateFunctionality()
  })
}

function saveFunctionality (element) {
  // Todo: replace global ids with prefixed ids or class members to allow multiple instances on one page
  element.setAttribute('id', this.prefix + 'save')
  element.addEventListener('click', () => {
    this.createSaveStateFunctionality()
  })
}

function createSaveStateFunctionality () {
  if (this.handleCallbacks({ id: 'onBeforeCreateSaveStateFunctionality', params: { graph: this } })) {

    const dropdown = this.color_method_select.value

    if (dropdown.value === 'setColorByValue') {
      this.configFile.coloring_function_object.function_name = 'colorByValue'

      const inputField = this.setColorByValueInput
      this.configFile.coloring_function_object.path = inputField.value

      this.configFile.coloring_function_object.start_color = this.start_color_select.value

      
      this.configFile.coloring_function_object.end_color = this.end_color_select.value
    } else if (dropdown.value === 'setColorByProperty') {
      this.configFile.coloring_function_object.function_name = 'colorByProperty'

      this.configFile.coloring_function_object.path = ''

      this.configFile.coloring_function_object.start_color = ''

      this.configFile.coloring_function_object.end_color = ''
    }

    const deepSearchDropdown = this.search_select

    if (deepSearchDropdown.value === 'search_node') {
      this.configFile.dataset_search_function_object.search_on = 'nodes'
      this.configFile.visual_search_function_object.search_on = 'nodes'
    } else if (deepSearchDropdown.value === 'search_edge') {
      this.configFile.dataset_search_function_object.search_on = 'edges'
      this.configFile.visual_search_function_object.search_on = 'edges'
    }

    const inputField = this.search_input

    this.configFile.dataset_search_function_object.search_string = inputField.value

    const inputFieldVisual = this.search_input
    this.configFile.visual_search_function_object.search_string = inputFieldVisual.value


    this.configFile.dataset_search_function_object.keep_expanded = this.show_deep_search_expanded.checked

    const openPaths = []
    for (let i = 0; i < this.nodes.get().length; i++) {
      if (this.isNodeLastInPath(this.nodes.get()[i].id)) {
        const paths = this.findAllPaths('jsondata/' + this.configFile.root_node_objects[0].node_id, this.nodes.get()[i].id)

        for (let j = 0; j < paths.length; j++) {
          openPaths.push(paths[j])
        }
      }
    }

    this.configFile.expanded_paths = openPaths

    this.configFile.visual_nodes_edges_object.nodes = this.nodes.get()
    this.configFile.visual_nodes_edges_object.edges = this.edges.get()

    this.configFile.initial_dataset = this.drawer.file

    const files = { file: this.drawer.file, config: this.configFile }

    const json = files
    const filename = 'data.txt'
    const text = JSON.stringify(json)

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
    const objectKeys = []
    objectKeys.push(Object.keys(json.config))
    objectKeys.push(Object.keys(json.file))

    return objectKeys
  }
}

function createLoadStateFunctionality () {
  if (this.handleCallbacks({ id: 'onBeforeCreateLoadStateFunctionality', params: { graph: this } })) {
    const input = document.createElement('input')
    input.type = 'file'

    const loadState = this.config.callbacks.loadState
    input.addEventListener('change', (ev) => {
      loadState(ev)
    }) //, ()=> this.config.callbacks.loadState(input) );
    input.click()
  }
}

function loadStateDefault (input) {
  this.container.innerHTML = ''

  const reader = new FileReader()
  reader.onload = () => {
    const jsonData = JSON.parse(reader.result)

    const graph /* eslint-disable-line no-unused-vars */ = new G.Graph(this.container, jsonData.file, jsonData.config) // eslint-disable-line no-undef

    // document.getElementById("mynetwork").innerHTML = "";

    // document.getElementById('myDropdown').remove();
    // document.getElementById('save').remove();
    // document.getElementById('load').remove();
    // document.getElementById('search_input').remove();
    // document.getElementById('search_select').remove();

    // if (document.getElementById('setPath')) {
    //   document.getElementById('setPath').remove();
    // }
  }
  reader.readAsText(input.target.files[0])
}

export {

  loadFunctionality,
  saveFunctionality,
  createSaveStateFunctionality,
  createLoadStateFunctionality,
  loadStateDefault

}
