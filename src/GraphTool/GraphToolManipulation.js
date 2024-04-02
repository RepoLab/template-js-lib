const $ = require('jquery')
const GDHelper = require('../GraphDrawer/GraphDrawerHelper.js')
const GDColoring = require('../GraphDrawer/GraphDrawerColoring.js')
const utils = require('../utils.js')

function multipleEdgesToSameNode (nodeID) {
  const edges = this.edges.get()
  let count = 0

  edges.forEach((edge) => {
    if (edge.to === nodeID) {
      count++
    }
  })

  if (count > 1) {
    return true
  } else {
    return false
  }
}

// Add Node popup
function editNode (data, cancelAction, callback, mainObject) {
  console.log("in editNode, this", this)
  var newNodeActive = true
  this.nodeCheckboxInput.addEventListener('click', function () {
    if (this.nodeCheckboxInput.checked) {
      this.nodeTypeInput.disabled = false
      //$('#node-type').removeAttr('disabled')
    } else {
      this.nodeTypeInput.disabled = true
      //$('#node-type').prop('disabled', true)
    }
  }.bind(this))
  this.nodeLabelInput.value = data.label
  console.log("in edit Node, data, callback:",data, callback)
  this.nodeSaveButton.onclick = this.saveNodeData.bind(
    this,
    data,
    callback
  )
  this.nodeCancelButton.onclick = cancelAction.bind(
    this,
    callback
  )
  // document.getElementById("node-popUp")
  this.container.addEventListener('click', function (e) {
    if (newNodeActive === true) {
      console.log("showing node popup")
      this.manipulation_popup_div.style.display = 'block'

      this.nodePopUp.style.top = e.pageY + "px"
      this.nodePopUp.style.left = e.pageX + "px"
      this.nodePopUp.style.display = 'block'
      this.nodePopUp.style.position =  'absolute'     
    }
    newNodeActive = false
  }.bind(this))
}

// addEdge popup
function editEdgeWithoutDrag (data, callback, newThis) {
  var newEdgeActive = true
  // filling in the popup DOM elements
  this.edgeLabelInput.value = data.label

  this.edgeSaveButton.onclick = this.saveEdgeData.bind(
    this,
    data,
    callback
  )
  this.edgeCancelButton.onclick = this.cancelEdgeEdit.bind(this,callback)

  this.container.addEventListener('click', function (e) {
    if (newEdgeActive === true) {
      this.manipulation_popup_div.style.display = 'block'

      this.edgePopUp.style.top = e.pageY + "px"
      this.edgePopUp.style.left = e.pageX + "px"
      this.edgePopUp.style.display = 'block'
      this.edgePopUp.style.position =  'absolute'
    }
    newEdgeActive = false
  }.bind(this))
  // document.getElementById("edge-popUp").style.display = "block";
}

function saveEdgeData (data, callback) {
  data.label = this.edgeLabelInput.value
  this.edgeLabelInput.value = ''
  this.clearEdgePopUp()
  data = addPropertyToJSON(data, this)
  console.log(this.dataFile.jsondata)
  // this.nodes.get(data.to).id = data.nodeID
  callback(data)
  console.log('in saveEdgeData, data:', data)
  if (data !== null) {
    this.nodes.update(this.nodes.get(data.to))
  }
  this.createLegend()
  if (data !== null) {
    if (this.nodes.get(data.to).manuallyAdded === true) {
      let newId = data.nodeID
      let oldNode = JSON.parse(JSON.stringify(this.nodes.get(data.to)))
      oldNode.id = newId
      this.nodes.remove(data.to)
      this.nodes.update(oldNode)
      let oldEdge = JSON.parse(JSON.stringify(this.edges.get(data.id)))
      oldEdge.to = newId
      this.edges.remove(data.id)
      this.edges.update(oldEdge)
    }
    delete data.nodeID
  }

  // if((this.nodes.get(data.to).path.length === 2 && this.nodes.get(data.to).key === undefined) || this.nodes.get(data.to).manuallyAdded === true ){}

  this.options.manipulation.enabled = !this.options.manipulation.enabled
  this.options.manipulation.initiallyActive = !this.options.manipulation.initiallyActive
  this.network.setOptions(this.options)
}

function setEdgeColor (data, mainObject) {
  if (mainObject.drawer.colorObj[data.label] !== undefined) {
    data.group = data.label
    data.color = mainObject.drawer.colorObj[data.label]
  }

  if (mainObject.drawer.colorObj[data.label] === undefined) {
    mainObject.drawer.colorObj[data.label] = GDColoring.randomHSL()
    data.group = data.label
    data.color = mainObject.drawer.colorObj[data.label]
  }

  return data
}

function createFullContextAndSetEdgeKey (data, mainObject, combine) {
  for (let key in mainObject.dataFile.jsonschema) {
    let context = GDHelper.getSchemaContextRecursive(mainObject.dataFile, key, [])

    for (let i = 0; i < context.length; i++) {
      combine = { ...combine, ...context[i] }
    }
  }

  for (let key in combine) {
    if ((combine[key]['@id'] !== undefined && combine[key]['@id'].split(':')[1] === data.label)) {
      data.objectKey = key
    }

    if (combine[key]['@id'] === undefined && combine[key].split(':')[1] === data.label) {
      data.objectKey = key
    }
  }
  data.context = combine
  return data
}

function addPropertyToJSON (data, mainObject) {
  // set edge id
  data.id = data.from + '=' + data.label + '=>' + data.to

  // check if edge already exists
  if (mainObject.edges.get(data.id)) {
    data = null
    return data
  }

  // set edge color and group
  data = setEdgeColor(data, mainObject)

  // set edge key
  let context = {}
  data = createFullContextAndSetEdgeKey(data, mainObject, context)
  context = data.context
  delete data.context

  let fromNode = mainObject.nodes.get(data.from)
  let finalPlace = mainObject.dataFile

  if (mainObject.nodes.get(data.from).manuallyAdded === true || mainObject.network.getConnectedEdges(data.to).length > 0 && mainObject.nodes.get(data.to).path.length > 2) {
    data = null
    return data
  }

  // go down the "from" nodes path to add the new node to the correct place in the JSON
  for (let i = 0; i < fromNode.path.length; i++) {
    finalPlace = finalPlace[fromNode.path[i]]
  }

  if (typeof finalPlace === 'string' && mainObject.dataFile[fromNode.path[fromNode.path.length - 1]] === undefined || mainObject.nodes.get(data.from).manuallyAdded === true) {
    data = null
    return data
  }

  if (mainObject.nodes.get(data.to).path === undefined) {
    mainObject.nodes.get(data.to).path = ''
  }
  // finalPlace is the object where the new node will be added to the JSON
  // key is in context
  if (data.objectKey) {
    // key is in context and is not in finalPlace
    if (finalPlace[data.objectKey] === undefined) {
      if (mainObject.nodes.get(data.to).path.length === 2) {
        finalPlace[data.objectKey] = [mainObject.nodes.get(data.to).path[1]]
      } else if (mainObject.nodes.get(data.to).manuallyAdded === true) {
        finalPlace[data.objectKey] = [mainObject.nodes.get(data.to).label]
        data.nodeID = mainObject.nodes.get(data.from).id + '/' + data.objectKey
      } else {
        data = null
        return data
      }
    } else {// key is in context and is in finalPlace
      // key is in context and is in finalPlace and is an array
      if (Array.isArray(finalPlace[data.objectKey])) {
        if (mainObject.nodes.get(data.to).path.length === 2) {
          finalPlace[data.objectKey].push(mainObject.nodes.get(data.to).path[1])
        } else if (mainObject.nodes.get(data.to).manuallyAdded === true) {
          finalPlace[data.objectKey].push(mainObject.nodes.get(data.to).label)
          data.nodeID = mainObject.nodes.get(data.from).id + '/' + data.objectKey + '/' + finalPlace[data.objectKey].length-1
        } else {
          data = null
          return data
        }
      } else { // key is in context and is in finalPlace and is not an array
        if (mainObject.nodes.get(data.to).path.length === 2) {
          finalPlace[data.objectKey] = [finalPlace[data.objectKey], mainObject.nodes.get(data.to).path[1]]
        } else if (mainObject.nodes.get(data.to).manuallyAdded === true) {
          finalPlace[data.objectKey] = [finalPlace[data.objectKey], mainObject.nodes.get(data.to).label]
          data.nodeID = mainObject.nodes.get(data.from).id + '/' + data.objectKey + '/' + finalPlace[data.objectKey].length - 1
        } else {
          data = null
          return data
        }
      }
    }
  } else { // key is not in context
    // key is not in context so it gets added as statements
    // statements exists
    if (finalPlace['statements']) {
      if (mainObject.nodes.get(data.to).path.length === 2) {
        finalPlace['statements'].push({
          uuid: utils.uuidv4(),
          predicate: data.label,
          object: mainObject.nodes.get(data.to).path[1]
        })
      } else if (mainObject.nodes.get(data.to).manuallyAdded === true) {
        finalPlace['statements'].push({
          uuid: utils.uuidv4(),
          predicate: data.label,
          object: mainObject.nodes.get(data.to).label
        })

        data.nodeID = mainObject.nodes.get(data.from).id + '/' + data.label + '/' + finalPlace['statements'].length - 1
      } else {
        data = null
        return data
      }
    } else {
      // statements does not exist
      finalPlace['statements'] = []
      if (mainObject.nodes.get(data.to).path.length === 2) {
        finalPlace['statements'].push({
          uuid: utils.uuidv4(),
          predicate: data.label,
          object: mainObject.nodes.get(data.to).path[1]
        })
      } else if (mainObject.nodes.get(data.to).manuallyAdded === true) {
        finalPlace['statements'].push({
          uuid: utils.uuidv4(),
          predicate: data.label,
          object: mainObject.nodes.get(data.to).label
        })
        data.nodeID = mainObject.nodes.get(data.from).id + '/' + data.label
      } else {
        data = null
        return data
      }
    }
  }

  if (mainObject.nodes.get(data.to).incomingLabels) {
    let node = mainObject.nodes.get(data.to)

    node.incomingLabels.push(data.label)
  }

  // inherit keys from edge to node
  if (mainObject.nodes.get(data.to).key === undefined) {
    let node = mainObject.nodes.get(data.to)

    node.key = data.objectKey
    node.item = mainObject.nodes.get(data.from).item
    let incomingLabels = [data.label]

    mainObject.edges.forEach((edge) => {
      if (edge.to === node.id) {
        incomingLabels.push(edge.label)
      }
    })

    node.incomingLabels = incomingLabels

    node.context = context

    node.depth = mainObject.nodes.get(data.from).depth + 1

    let item = mainObject.nodes.get(data.from).item
    let depth = mainObject.nodes.get(data.from).depth + 1

    node.depthObject = {}
    node.depthObject['' + item] = depth

    node.color = data.color

    node.group = data.group

    if (mainObject.nodes.get(data.to).path === '') {
      node.path = mainObject.nodes.get(data.from).path
    }
  }

  return data
}

function clearEdgePopUp () {
  this.edgeSaveButton.onclick = null
  this.edgeCancelButton.onclick = null
  this.edgePopUp.style.display = 'none'
  console.log("finished clearEdgePopUp")
}

function cancelEdgeEdit (callback) {
  console.log(" in cancelEdgeEdit")
  this.clearEdgePopUp()
  callback(null)
  this.options.manipulation.enabled = !this.options.manipulation.enabled
  this.options.manipulation.initiallyActive = !this.options.manipulation.initiallyActive
  this.network.setOptions(this.options)
}

function initPopUpHTML () {
  // HTML for the manipulation popups
  /*var editHtml = '' +
                    '<div id="node-popUp" style="background-color: #fff; border: 1px solid lightgrey; padding: 0 0.75rem 0.75rem 0.5rem; border-radius: 0.375rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">' +
                    '  <div id="node-operation" style="cursor: move; font-weight: bold; margin: 0 -0.75rem 0.75rem -0.5rem; padding: 0.5rem; background: rgb(220, 236, 251)">node</div>' +
                    '  <table style="margin: auto">' +
                    '    <tbody>' +
                    '      <tr>' +
                    '        <td style="font-weight: bold; font-size: 13px;">Label</td>' +
                    '      </tr>' +
                    '      <tr>' +
                    '        <td><input id="node-label" value="" /></td>' +
                    '      </tr>' +
                    '      <tr>' +
                    '        <td><input type="checkbox" style="margin: 8px 4px 8px 0;" id="node_checkbox"><label>Create new Wikipage</label></td>'+
                    '      </tr>' +
                    '      <tr>' +
                    '        <td style="font-weight: bold; font-size: 13px;">Type</td>' +
                    '      </tr>' +
                    '      <tr>' +
                    '        <td><input id="node-type" value="" /></td>' +
                    '      </tr>' +
                    '    </tbody>' +
                    '  </table>' +
                    '<div style="display:flex; justify-content:flex-end; margin-top: 1rem;">' +
                    '  <input type="button" style="background-color: #3366cc; color: #fff; border: none; border-radius: 4px; padding: 0 8px 0 8px; margin-right: 8px;" value="OK" id="node-saveButton" />' +
                    '  <input type="button" value="Cancel" id="node-cancelButton" />' +
                    '</div>' +
                    '</div>' +
                    '' +
                    '<div id="edge-popUp" style="background-color: #fff; padding: 0.5rem; border: 1px solid lightgrey; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">' +
                    '  <span id="edge-operation" style="cursor: move; font-weight: bold;">edge</span> <br />' +
                    '  <table style="margin: auto">' +
                    '    <tbody>' +
                    '      <tr>' +
                    '        <td>Label</td>' +
                    '       </tr>' +
                    '       <tr>' +
                    '        <td><input id="edge-label" value="" /></td>' +
                    '      </tr>' +
                    '    </tbody>' +
                    '  </table>' +
                    '<div style="display:flex; justify-content:flex-end; margin-top: 1rem;">' +
                    '  <input type="button" style="background-color: #3366cc; color: #fff; border: none; border-radius: 4px; padding: 0 8px 0 8px; margin-right: 8px;" value="OK" id="edge-saveButton" />' +
                    '  <input type="button" style="margin-right: 0.5rem;" value="Cancel" id="edge-cancelButton" />' +
                    '</div>' +
                    '</div>' +
                    ''
  var editHtmlDiv = document.createElement('div')
  editHtmlDiv.style.display = 'none'
  editHtmlDiv.id = 'manipulation_div'
  editHtmlDiv.innerHTML = editHtml*/
  //document.body.appendChild(editHtmlDiv)

  // Erstelle das node-Popup
this.nodePopUp = document.createElement('div');
this.nodePopUp.id = "node-popUp";
this.nodePopUp.style.backgroundColor = "#fff";
this.nodePopUp.style.border = "1px solid lightgrey";
this.nodePopUp.style.padding = "0 0.75rem 0.75rem 0.5rem";
this.nodePopUp.style.borderRadius = "0.375rem";
this.nodePopUp.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
this.nodePopUp.style.display = "none"

this.nodeOperation = document.createElement('div');
this.nodeOperation.id = "node-operation";
this.nodeOperation.style.cursor = "move";
this.nodeOperation.style.fontWeight = "bold";
this.nodeOperation.style.margin = "0 -0.75rem 0.75rem -0.5rem";
this.nodeOperation.style.padding = "0.5rem";
this.nodeOperation.style.background = "rgb(220, 236, 251)";
this.nodeOperation.innerHTML = "node";
this.nodePopUp.appendChild(this.nodeOperation);

let nodeTable = document.createElement('table');
nodeTable.style.margin = "auto";

let nodeTableBody = document.createElement('tbody');
let nodeTableRow1 = document.createElement('tr');
let nodeTableLabelCell = document.createElement('td');
nodeTableLabelCell.style.fontWeight = "bold";
nodeTableLabelCell.style.fontSize = "13px";
nodeTableLabelCell.innerHTML = "Label";
nodeTableRow1.appendChild(nodeTableLabelCell);
nodeTableBody.appendChild(nodeTableRow1);

let nodeTableRow2 = document.createElement('tr');
let nodeTableInputCell = document.createElement('td');
this.nodeLabelInput = document.createElement('input');
this.nodeLabelInput.id = "node-label";
nodeTableInputCell.appendChild(this.nodeLabelInput);
nodeTableRow2.appendChild(nodeTableInputCell);
nodeTableBody.appendChild(nodeTableRow2);

let nodeTableRow3 = document.createElement('tr');
let nodeTableCheckboxCell = document.createElement('td');
this.nodeCheckboxInput = document.createElement('input');
this.nodeCheckboxInput.type = "checkbox";
this.nodeCheckboxInput.style.margin = "8px 4px 8px 0";
this.nodeCheckboxInput.id = "node_checkbox";
let nodeCheckboxLabel = document.createElement('label');
nodeCheckboxLabel.innerHTML = "Create new Wikipage";
nodeTableCheckboxCell.appendChild(this.nodeCheckboxInput);
nodeTableCheckboxCell.appendChild(nodeCheckboxLabel);
nodeTableRow3.appendChild(nodeTableCheckboxCell);
nodeTableBody.appendChild(nodeTableRow3);

let nodeTableRow4 = document.createElement('tr');
let nodeTableTypeCell = document.createElement('td');
nodeTableTypeCell.style.fontWeight = "bold";
nodeTableTypeCell.style.fontSize = "13px";
nodeTableTypeCell.innerHTML = "Type";
nodeTableRow4.appendChild(nodeTableTypeCell);
nodeTableBody.appendChild(nodeTableRow4);

let nodeTableRow5 = document.createElement('tr');
let nodeTableTypeInputCell = document.createElement('td');
this.nodeTypeInput  = document.createElement('input');
this.nodeTypeInput.id = "node-type";
nodeTableTypeInputCell.appendChild(this.nodeTypeInput);
nodeTableRow5.appendChild(nodeTableTypeInputCell);
nodeTableBody.appendChild(nodeTableRow5);

nodeTable.appendChild(nodeTableBody);
this.nodePopUp.appendChild(nodeTable);

let nodeButtonContainer = document.createElement('div');
nodeButtonContainer.style.display = "flex";
nodeButtonContainer.style.justifyContent = "flex-end";
nodeButtonContainer.style.marginTop = "1rem";

this.nodeSaveButton = document.createElement('input');
this.nodeSaveButton.type = "button";
this.nodeSaveButton.style.backgroundColor = "#3366cc";
this.nodeSaveButton.style.color = "#fff";
this.nodeSaveButton.style.border = "none";
this.nodeSaveButton.style.borderRadius = "4px";
this.nodeSaveButton.style.padding = "0 8px 0 8px";
this.nodeSaveButton.style.marginRight = "8px";
this.nodeSaveButton.value = "OK";
this.nodeSaveButton.id = "node-saveButton";
nodeButtonContainer.appendChild(this.nodeSaveButton);

this.nodeCancelButton = document.createElement('input');
this.nodeCancelButton.type = "button";
this.nodeCancelButton.value = "Cancel";
this.nodeCancelButton.id = "node-cancelButton";
nodeButtonContainer.appendChild(this.nodeCancelButton);

this.nodePopUp.appendChild(nodeButtonContainer);

  // Erstelle das edge-Popup
  this.edgePopUp = document.createElement('div');
  this.edgePopUp.id = "edge-popUp";
  this.edgePopUp.style.backgroundColor = "#fff";
  this.edgePopUp.style.padding = "0.5rem";
  this.edgePopUp.style.border = "1px solid lightgrey";
  this.edgePopUp.style.borderRadius = "12px";
  this.edgePopUp.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
  this.edgePopUp.style.display = "none"

  this.edgeOperation = document.createElement('span');
  this.edgeOperation.id = "edge-operation";
  this.edgeOperation.style.cursor = "move";
  this.edgeOperation.style.fontWeight = "bold";
  this.edgeOperation.innerHTML = "edge";
  this.edgePopUp.appendChild(this.edgeOperation);

  let edgeTable = document.createElement('table');
  edgeTable.style.margin = "auto";

  let edgeTableBody = document.createElement('tbody');
  let edgeTableRow1 = document.createElement('tr');
  let edgeTableLabelCell = document.createElement('td');
  edgeTableLabelCell.innerHTML = "Label";
  edgeTableRow1.appendChild(edgeTableLabelCell);
  edgeTableBody.appendChild(edgeTableRow1);

  let edgeTableRow2 = document.createElement('tr');
  let edgeTableInputCell = document.createElement('td');
  this.edgeLabelInput = document.createElement('input');
  this.edgeLabelInput.id = "edge-label";
  edgeTableInputCell.appendChild(this.edgeLabelInput);
  edgeTableRow2.appendChild(edgeTableInputCell);
  edgeTableBody.appendChild(edgeTableRow2);

  edgeTable.appendChild(edgeTableBody);
  this.edgePopUp.appendChild(edgeTable);

  let edgeButtonContainer = document.createElement('div');
  edgeButtonContainer.style.display = "flex";
  edgeButtonContainer.style.justifyContent = "flex-end";
  edgeButtonContainer.style.marginTop = "1rem";

  this.edgeSaveButton = document.createElement('input');
  this.edgeSaveButton.type = "button";
  this.edgeSaveButton.style.backgroundColor = "#3366cc";
  this.edgeSaveButton.style.color = "#fff";
  this.edgeSaveButton.style.border = "none";
  this.edgeSaveButton.style.borderRadius = "4px";
  this.edgeSaveButton.style.padding = "0 8px 0 8px";
  this.edgeSaveButton.style.marginRight = "8px";
  this.edgeSaveButton.value = "OK";
  this.edgeSaveButton.id = "edge-saveButton";
  edgeButtonContainer.appendChild(this.edgeSaveButton);

  this.edgeCancelButton = document.createElement('input');
  this.edgeCancelButton.type = "button";
  this.edgeCancelButton.style.marginRight = "0.5rem";
  this.edgeCancelButton.value = "Cancel";
  this.edgeCancelButton.id = "edge-cancelButton";
  edgeButtonContainer.appendChild(this.edgeCancelButton);

  this.edgePopUp.appendChild(edgeButtonContainer);

  // Füge die Popups zum Dokument hinzu

  this.manipulation_popup_div = document.createElement('div')
  this.manipulation_popup_div.appendChild(this.nodePopUp);
  this.manipulation_popup_div.appendChild(this.edgePopUp);

  this.manipulation_popup_div.style.display = 'none'
  this.container.appendChild(this.manipulation_popup_div)
  //this.container.appendChild(this.manipulation_popup_div)
}

function clearNodePopUp () {
  this.nodeSaveButton.onclick = null
  this.nodeCancelButton.onclick = null
  this.nodePopUp.style.display = 'none'
  this.nodeCheckboxInput.checked = false
  if (this) {
    this.options.manipulation.enabled = !this.options.manipulation.enabled
    this.options.manipulation.initiallyActive = !this.options.manipulation.initiallyActive
    this.network.setOptions(this.options)
  }
}

function saveNodeData (data, callback) {
  data = this.addItemToJSON(data, this)

  this.nodeLabelInput.value = ''
  this.nodeTypeInput.value = ''
  this.clearNodePopUp()

  console.log("in saveNodeData, data,callback: ",data,callback)
  this.nodes.update(data)
  //callback(data)  // does not work with panel

  this.options.manipulation.enabled = !this.options.manipulation.enabled
  this.options.manipulation.initiallyActive = !this.options.manipulation.initiallyActive
  this.network.setOptions(this.options)

  //  this.network.addEdgeMode();
}

function addItemToJSON (data, mainObject) {
  data.label = this.nodeLabelInput.value
  data.hidden = false
  data.physics = false
  console.log("")

  if (this.nodeCheckboxInput.checked) {
    let uuid = utils.uuidv4()

    data.id = 'jsondata/Item:' + uuid // + document.getElementById("node-label").value.replace(" ", ""); // uuid?
    data.type = this.nodeTypeInput.value
    data.path = ['jsondata', 'Item:' + uuid] // + document.getElementById("node-label").value.replace(" ", "")]

    mainObject.dataFile.jsondata['Item:' + uuid /* data.label.replace(' ', '') */] = {
      type: [data.type],
      label: [{ text: data.label, lang: 'en' }]
    }
  } else {
    data.manuallyAdded = true
  }

  return data
}

// function to make the manipulation popups draggable
function dragElement(elmnt){
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0
  if (elmnt) {
    // if present, the header is where you move the DIV from:
    this.nodeOperation.onmousedown = dragMouseDown
    this.edgeOperation.onmousedown = dragMouseDown
    //elmnt.edgeOperation.onmousedown = dragMouseDown
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown
  }

  function dragMouseDown (e) {
    e = e || window.event
    e.preventDefault()
    // get the mouse cursor position at startup:
    pos3 = e.clientX
    pos4 = e.clientY
    document.onmouseup = closeDragElement
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag
  }

  function elementDrag (e) {
    e = e || window.event
    e.preventDefault()
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX
    pos2 = pos4 - e.clientY
    pos3 = e.clientX
    pos4 = e.clientY
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + 'px'
    elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px'
  }

  function closeDragElement () {
    // stop moving when mouse button is released:
    document.onmouseup = null
    document.onmousemove = null
  }
}

function setManipulationOptions (data) {
  console.log("in set Manipulation Options", this)
  this.options.manipulation.deleteNode = function (data, callback) {
    data.edges.forEach((edge) => {
      this.edges.remove(edge)
    })

    let nodeGroup = this.nodes.get(data.nodes[0]).group

    this.deleteSelectedNode(data, callback)

    this.deleteOptionsGroup(nodeGroup)

    if (this.options.groups[nodeGroup] === undefined) {
      delete this.drawer.colorObj[nodeGroup]
      this.createLegend()
    }
  }.bind(this)

  this.options.manipulation.deleteEdge = function (data, callback) {
    let edge = this.edges.get(data.edges[0])

    let node = this.nodes.get(edge.to)

    if (node.group !== 'root' && !this.multipleEdgesToSameNode(node.id)) {
      let nodeGroup = node.group

      this.deleteSelectedNode({ nodes: [node.id] }, callback)

      this.deleteOptionsGroup(nodeGroup)

      if (this.options.groups[nodeGroup] === undefined) {
        delete this.drawer.colorObj[nodeGroup]
        this.createLegend()
      }
    }

    this.edges.remove(data.edges[0])

    // deleteSelectedEdge(data, callback)
  }.bind(this)

  this.options.manipulation.addNode = function (data, callback) {
    // filling in the popup DOM elements
    this.nodeOperation.innerText = 'Add Node'
    this.dragElement(this.nodePopUp)
    this.editNode(data, this.clearNodePopUp, callback, this)
  }.bind(this)

  this.options.manipulation.addEdge = function (data, callback) {
    if (data.from == data.to) {
      var r = confirm('Do you want to connect the node to itself?')
      if (r != true) {
        callback(null)
        return;
      }
    }
    this.edgeOperation.innerText = 'Add Edge'
    
    this.editEdgeWithoutDrag(data, callback, this)
    this.dragElement(this.edgePopUp)
    // this.createLegend()
  }.bind(this)
}

function deleteSelectedNode (data, callback) {
  this.deleteNodesChildren(data.nodes[0])
  this.nodes.remove(data.nodes[0])

  // for (var i = 0; i < contextCreatedProps.length; i++) {
  //     var noNodesInNetwork = true;
  //     for (var j = 0; j < nodes.getIds().length; j++) {
  //         if (contextCreatedProps[i] == nodes.get(nodes.getIds()[j]).group) {
  //             noNodesInNetwork = false;
  //         }
  //     }
  //     if (noNodesInNetwork === true) {
  //         givenDiv.querySelector('#' + contextCreatedProps[i]).remove();
  //         contextCreatedProps.splice(contextCreatedProps.indexOf(contextCreatedProps[i]), 1);
  //         i--;
  //     }
  // }

  // delete oldGroups["" + data.nodes[0]];
  // delete objClickedProps["" + data.nodes[0]];
  callback()
  this.createLegend()
  // document.querySelector('.vis-delete').remove();
  // editDeletedNodes["" + data.nodes[0]] = "";
  // delete newNodes["" + data.nodes[0]];
  // delete editNodes["" + data.nodes[0]];
  // // create_link();
}

function deleteInJson (data, obj) {
  for (let i = 0; i < data.edges.length; i++) {
    let finalPlace = this.dataFile
    let fromNode = this.nodes.get(this.edges.get(data.edges[i]).from)

    for (let i = 0; i < fromNode.path.length; i++) {
      finalPlace = finalPlace[fromNode.path[i]]
    }

    let key = this.edges.get(data.edges[i]).objectKey

    if (Array.isArray(finalPlace[key])) {
      finalPlace[key].splice(finalPlace[key].indexOf(this.edges.get(data.edges[i]).label), 1)
      if (finalPlace[key].length === 0) {
        delete finalPlace[key]
      }
    }
    if (!Array.isArray(finalPlace[key])) {
      delete finalPlace[key]
    }
  }
}

export {
  setManipulationOptions,
  deleteSelectedNode,
  multipleEdgesToSameNode,
  editNode,
  initPopUpHTML,
  saveNodeData,
  addItemToJSON,
  deleteInJson,
  clearNodePopUp,
  editEdgeWithoutDrag,
  cancelEdgeEdit,
  clearEdgePopUp,
  dragElement,
  saveEdgeData
}
