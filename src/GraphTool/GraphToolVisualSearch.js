function createSearchUI (container) {
  if (this.handleCallbacks({ id: 'onBeforeCreateSearchUI', params: { graph: this, container } })) {
    // create the container if not defined
    if (!container) container = document.createElement('div')

    // ------------- Working Code

    // create the input element
    // const inputField = document.createElement('input')
    // inputField.type = 'text'
    // inputField.id = this.prefix + 'search_input'
    // inputField.placeholder = 'Search'
    // inputField.style = 'padding-left: 8px; border-radius: 4px; margin-right: 4px;'

    // ------------ Bootstrap Input Element

    const inputGroupDiv = document.createElement('div')
    inputGroupDiv.classList.add('input-group', 'input-group-sm')

    const inputField = document.createElement('input')
    inputField.setAttribute('type', 'text')
    inputField.classList.add('form-control')
    inputField.setAttribute('placeholder', 'Search')
    inputField.setAttribute('aria-label', 'Search')
    inputField.setAttribute('aria-describedby', 'basic-addon2')
    inputField.id = this.prefix + 'search_input'

    const appendDiv = document.createElement('div')
    appendDiv.classList.add('input-group-append')

    // add the event listener to the input element
    let debounceTimer

    let firstInput = true
    inputField.addEventListener('input', () => {
      // Clear previous debounce timer
      clearTimeout(debounceTimer)
      // document.getElementById('input-field').value = "";

      // Set a new debounce timer
      debounceTimer = setTimeout(() => {
        if (firstInput && inputField.value.length > 0) {
          this.saveGraphColorsVisualSearch()

          firstInput = false
        }

        if (inputField.value.length === 0 && !firstInput) {
          // this.recolorByProperty();

          this.loadGraphColorsVisualSearch()

          firstInput = true

          return
        }

        // Execute the search after the debounce timeout
        this.searchNodes(inputField.value)
      }, 300) // Adjust the debounce timeout as needed (e.g., 300ms)
    })

    // --------------- Working code select button ---------------

    // // add the input field to the DOM
    // container.appendChild(inputField)

    // // create the select element
    // const selectElement = document.createElement('select')
    // selectElement.id = this.prefix + 'search_select'
    // selectElement.addEventListener('change', (event) => {
    //   // get the selected value
    //   document.getElementById(this.prefix + 'search_input').value = ''
    //   document.getElementById(this.prefix + 'input-field').value = ''
    //   this.collapseSearch()
    //   this.recolorByProperty()
    //   // this.searchNodes("");
    // })

    // // create the first option element
    // const optionElement1 = document.createElement('option')
    // optionElement1.value = 'search_node'
    // optionElement1.text = 'Node'

    // // create the second option element
    // const optionElement2 = document.createElement('option')
    // optionElement2.value = 'search_edge'
    // optionElement2.text = 'Edge'

    // // add the option elements to the select element
    // selectElement.add(optionElement1)
    // selectElement.add(optionElement2)

    // // add the select element to the DOM
    // container.appendChild(selectElement)

    // ----------Bootstrap select button

    this.search_select = document.createElement('select')
    this.search_select.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'dropdown-toggle')
    this.search_select.setAttribute('data-toggle', 'dropdown')
    this.search_select.setAttribute('aria-haspopup', 'true')
    this.search_select.setAttribute('aria-expanded', 'false')
    this.search_select.id = this.prefix + 'search_select'
    this.search_select.addEventListener('change', (event) => {
      // get the selected value
      this.search_input.value = ''
      this.collapseSearch()
      this.recolorByProperty()
      // this.searchNodes("");
    })

    const dropdownMenu = document.createElement('div')
    dropdownMenu.classList.add('dropdown-menu')

    const dropdownItems = [
      { text: 'Node', value: 'search_node' },
      { text: 'Edge', value: 'search_edge' }
    ]

    dropdownItems.forEach(item => {
      const optionItem = document.createElement('option')
      optionItem.text = item.text
      optionItem.value = item.value
      this.search_select.add(optionItem)
    })

    inputGroupDiv.appendChild(inputField)
    this.search_select.appendChild(dropdownMenu)
    appendDiv.appendChild(this.search_select)
    inputGroupDiv.appendChild(appendDiv)

    container.appendChild(inputGroupDiv)

    return container
  }
}

// saves colors of nodes and edges before visual search
function saveGraphColorsVisualSearch () {
  for (let i = 0; i < this.nodes.get().length; i++) {
    const node = this.nodes.get()[i]

    if (node.color) {
      this.colorsBeforeVisualSearch[node.id] = node.color
    }
  }

  for (let i = 0; i < this.edges.get().length; i++) {
    const edge = this.edges.get()[i]

    if (edge.color) {
      this.colorsBeforeVisualSearch[edge.id] = edge.color
    }
  }
}

// loads colors of nodes and edges after visual search
function loadGraphColorsVisualSearch () {
  for (let i = 0; i < this.nodes.get().length; i++) {
    const node = this.nodes.get()[i]

    if (node.color) {
      node.color = this.colorsBeforeVisualSearch[node.id]

      this.nodes.update(node)
    }
  }

  for (let i = 0; i < this.edges.get().length; i++) {
    const edge = this.edges.get()[i]

    if (edge.color) {
      edge.color = this.colorsBeforeVisualSearch[edge.id]

      this.edges.update(edge)
    }
  }
}

// visual search for nodes and edges
function searchNodes (searchString) {
  // this.updatePositions()

  if (this.handleCallbacks({ id: 'onBeforeSearchNodes', params: { graph: this, searchString } })) {
    this.recolorByProperty()
    this.searchExpands = []
    this.deepSearchExpands = []

    // searches for edges with the given search string
    if (this.search_select.value === 'search_edge') {
      this.edges.forEach((edge) => {
        if (edge.label.toLowerCase().includes(searchString.toLowerCase())) {
          // gets all paths from root to the node that the edge points to
          const paths = []

          for (let i = 0; i < this.rootNodesArray.length; i++) {
            const tempPaths = this.findAllPaths(this.rootNodesArray[i], edge.to)

            for (let j = 0; j < tempPaths.length; j++) {
              paths.push(tempPaths[j])
            }
          }

          // let paths = this.findAllPaths(this.drawer.rootId, edge.to);

          for (let i = 0; i < paths.length; i++) {
            for (let j = 0; j < paths[i].length; j++) {
              // pushes all nodes that get colored
              this.searchExpands.push(paths[i][j])
            }
          }
        }
      })
    }
    // searches for nodes with the given search string
    if (this.search_select.value === 'search_node') {
      this.nodes.forEach((node) => {
        if (node.label) {
          if (node.label.toLowerCase().includes(searchString.toLowerCase()) || node.group === 'root') {
            const paths = []

            for (let i = 0; i < this.rootNodesArray.length; i++) {
              const tempPaths = this.findAllPaths(this.rootNodesArray[i], node.id)

              for (let j = 0; j < tempPaths.length; j++) {
                paths.push(tempPaths[j])
              }
            }

            // let paths = this.findAllPaths(this.drawer.rootId, node.id);

            for (let i = 0; i < paths.length; i++) {
              for (let j = 0; j < paths[i].length; j++) {
                this.searchExpands.push(paths[i][j])
              }
            }
          }
        }
      })
    }
    // colors all nodes and edges that get found
    this.deepSearchColorPath([])
    return this.searchExpands
  }
}

export {

  createSearchUI,
  saveGraphColorsVisualSearch,
  loadGraphColorsVisualSearch,
  searchNodes
}
