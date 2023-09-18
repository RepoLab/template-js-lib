const vis = require("vis-network/standalone/esm/index.js")

const $ = require("jquery")

const GD = require("../GraphDrawer/GraphDrawer.js");
const GT = require("../GraphTool/GraphTool.js");




class Graph{

  constructor(file, configFile, onlyData) {

    if((file || configFile) === undefined) {

      return;

    }

    this.file = file;
    this.configFile = configFile;
    this.graphtool;
    this.openPaths = [];

    this.createGraphByConfig(file, configFile, onlyData);

  }

  isNodeLastInPath(node){
      
      let edges = this.graphtool.edges.get();
  
      for(let i = 0; i < edges.length; i++) {
  
        if(edges[i].from == node) {
          return false;
        }
  
      }
  
      return true;
  
  }

  createGraphByConfig(file, configFile, onlyData) {

 
  
    //"positioning_function_object" / maybe given and/or will be saved in the config
    
    //"root_node_objects" / where to start expanding
    let options = {
      interaction: {
        hover: true,
        multiselect: true,
      },
      manipulation: {
        enabled: true,
      },
      physics: {
        stabilization: {
          enabled: true,
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
        arrows: "to",
        
      },
      groups: {
        useDefaultGroups: false
      }
    }

    var drawer;
    let tempNodes;
    let tempEdges;
    let tempColorObj;
    let args;
    let connections = [];

    let drawer_config  = {lang:"en",contractArrayPaths: true}

    for(let i = 0; i < configFile.root_node_objects.length; i++) {

      if(drawer === undefined) {
        tempNodes = [];
        tempEdges = [];
        tempColorObj = {};
      }else{

        tempNodes = drawer.nodes.get();
        tempEdges = drawer.edges.get();
        tempColorObj = drawer.colorObj;

        drawer.edges.get().forEach((edge) => {

          if(edge.from == 'jsondata/' + configFile.root_node_objects[i].node_id || edge.to == 'jsondata/' + configFile.root_node_objects[i].node_id) {

            connections.push(edge);

            tempEdges = tempEdges.filter(obj => obj.id !== edge.id);
            

          }

        });

        tempNodes = tempNodes.filter(obj => obj.id !== 'jsondata/' + configFile.root_node_objects[i].node_id);
                                                                                                                                                           
      }

      args = {
        file: file,
        depth: 1,
        mode: true,
        nodes: tempNodes,
        edges: tempEdges,
        rootItem: configFile.root_node_objects[i].node_id,
        recursionDepth: configFile.root_node_objects[i].expansion_depth,
        colorObj: tempColorObj,
      }

      drawer = new GD.GraphDrawer(drawer_config, args);

    }

    connections.forEach((edge) => {

      drawer.edges.update(edge);

    });



    if(onlyData) {
      return drawer;
    }
   
    // let args = {
    //   file: file,
    //   depth: 1,
    //   mode: true,
    //  // nodes: nodes,
    //  // edges: edges,
    //   rootItem: configFile.root_node_objects[0].node_id,
    //   recursionDepth: configFile.root_node_objects[0].expansion_depth,
    // }
    
    // drawer = new isg.GraphDrawer(drawer_config, args);

    // args = {
    //   file: file,
    //   depth: 1,
    //   mode: true,
    //   nodes: drawer.nodes.get(),
    //   edges: drawer.edges.get(),
    //   rootItem: "Item:MyOtherItem",//configFile.root_node_objects[0].node_id,
    //   recursionDepth: configFile.root_node_objects[0].expansion_depth,
    //   colorObj: drawer.colorObj,
    // }
    
    // drawer = new isg.GraphDrawer(drawer_config, args);

    // console.log(drawer)
    let config = {
     // nodes: nodes,
     // edges: edges,
      options: options,
      file: new_json,
      drawer: drawer,
      configFile: configFile
    };
  
    this.graphtool = new GT.GraphTool(config.configFile.graph_container_id, config);
    //this.graphtool = new isg.GraphTool("mynetwork2", config);

    // //"coloring_function_object" / maybe given and/or will be saved in the config
    // if(configFile.coloring_function_object.function_name == "colorByValue"){
      
    //   let coloringDiv = document.getElementById("myDropdown");

    //   let dropdown = coloringDiv.querySelector("select");

    //   dropdown.value = "setColorByValue";

    //   let changeEvent = new Event('change');
    //   dropdown.dispatchEvent(changeEvent);

    //   let inputField = document.getElementById("setColorByValueInput");
    //   inputField.value = configFile.coloring_function_object.path;

    //   let startColor = document.getElementById("startColor");
    //   startColor.value = configFile.coloring_function_object.start_color;

    //   let endColor = document.getElementById("endColor");
    //   endColor.value = configFile.coloring_function_object.end_color;

    //   let submitButton = document.getElementById("setPath");
    //   submitButton.click();

    // }else if(configFile.coloring_function_object.function_name == "colorByProperty"){
        
    //     let coloringDiv = document.getElementById("myDropdown");
  
    //     let dropdown = coloringDiv.querySelector("select");
  
    //     dropdown.value = "setColorByProperty";
  
    //     let changeEvent = new Event('change');
    //     dropdown.dispatchEvent(changeEvent);
    
    // }

    // //"dataset_search_function_object" / deepsearch load save / saved in config
    // if(configFile.dataset_search_function_object.search_string != ""){

    //   let dropdown = document.getElementById("search_select");

    //   if(configFile.dataset_search_function_object.search_on == "nodes"){

    //     dropdown.value = "search_node";

    //   }else if (configFile.dataset_search_function_object.search_on == "edges"){
          
    //     dropdown.value = "search_edge";

    //   }

    //   let inputField = document.getElementById("input-field");
    //   inputField.value = configFile.dataset_search_function_object.search_string;

    //   var submitButton = document.getElementById("submit-button");
    //   submitButton.click();

    //   let checkBox = document.getElementById("myCheckbox");

    //   checkBox.checked = configFile.dataset_search_function_object.keep_expanded;

    // }

    // //"visual_search_function_object" / only for load save / saved in config  
    // if(configFile.visual_search_function_object.search_string != ""){

    //   let dropdown = document.getElementById("search_select");

    //   if(configFile.visual_search_function_object.search_on == "nodes"){

    //     dropdown.value = "search_node";

    //   }else{
          
    //       dropdown.value = "search_edge";

    //   }

    //   let inputField = document.getElementById("search_input");
    //   inputField.value = configFile.visual_search_function_object.search_string;

    //   var inputEvent = new Event('input');
    //   inputField.dispatchEvent(inputEvent);

    // }

    //"expanded_paths" / maybe given and/or will be saved in the config
  
    //"expanded_nodes" / maybe given and/or will be saved in the config
    // if(configFile.expanded_nodes.length > 0){

    //   for(let i = 0; i < configFile.expanded_paths.length; i++){

    //       configFile.expanded_paths[i].shift();
    //       configFile.expanded_paths[i].pop();


    //   }

    //   const nodesToExpand = Array.from(new Set(configFile.expanded_paths.map(JSON.stringify)), JSON.parse);


    //   for(let i = 0; i < nodesToExpand.length; i++){
    //     for(let j = 0; j < nodesToExpand[i].length; j++){

    //       if(this.isNodeLastInPath(nodesToExpand[i][j])){

    //         this.graphtool.expandNodes({ nodes: [nodesToExpand[i][j]] });

    //       }
  
    //     }
    //   }
    // }


  }

}

export {

    Graph,
    vis

}