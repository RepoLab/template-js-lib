let new_json = {"jsonschema": {
  "Category:Entity": {
      "@context": {
          "label": "Property:HasLabel"
      }
  },
  "Category:Item": {
      "@context": [
          "Category:Entity",
          {
              "member": {"@id": "Property:HasMember", "@type": "@id"},
              "other": {"@id": "Property:HasOther", "@type": "@id"},
              "budget": {"@id": "Property:HasBudget", "@type": "@id"},
              "some_property": {"@id": "Property:HasSomeItem", "@type": "@id"},
              "some_literal": "Property:HasSomeLiteral"
          }
          ],
      "properties": {
          "label": [{
              "type": "array",
              "title": "Labels",
              "items": {
                  "type": "object",
                  "title": "Label",
                  "properties": {
                      "text": {},
                      "lang": {}
                  }
              }
          }],
          "member": {
              "type": "string",
              "title": "Member"
          },
          "budget": {
              "type": "array",
              "title": "Budgets",
              "items": {
                  "type": "object",
                  "title": "Budget",
                  "properties": {
                      "year": {"title": "Year"},
                      "value": {"title": "BudgetValue"}
                  }
              }
          }
      }
  }

  },
"jsondata": {
  "Item:MyProject": {
      "type": ["Category:Item"],
      "label": [{"text": "My Project", "lang": "en"}, {"text": "Projekt", "lang": "de"}],
      "member": ["Item:SomePerson", "Item:SomePerson"], //"Item:MyOtherItem"
      "other": ["Item:SomePerson"],
      "some_literal": ["Some string","Some","string",],
      "not_in_context": "Not in Context",
      "budget": [{
          "year": "2000",
          "value": "10000",
          "budget":[{
            "year": "2023",
            "value": "10",
            "other":["Item:MySecondItem"]}, {
              "year": "2022",
              "value": "20"}]
      },{
        "year": "2001",
        "value": "20000"
    },{
      "year": "2002",
      "value": "30000"
  },{
    "year": "2003",
    "value": ["40000","50000"]
}]
  },
  // "Item:SomePerson": {
  //     "type": ["Category:Item"],
  //     "label": [{"text": "Max Mustermann", "lang": "en"}],
  //     "some_property": "Item:MyOtherItem"
  // },
  // "Property:HasMember": {
  //     "type": ["Category:Property"],
  //     "label": [{"text": "Has Member", "lang": "en"}]
  // },
  // "Item:MyOtherItem": {
  //   "type": ["Category:Item"],
  //   "label": [{"text": "My Other", "lang": "en"}],
  //   "member": ["Item:MyNewItem"],
  //   "some_literal": "Some string",
  //   "not_in_context": "Not in Context",
  //   "budget":[{
  //           "year": "2022",
  //           "value": "10"}, {
  //             "year": "2022",
  //             "value": "20"}]

  // },
  // "Item:MyNewItem": {
  //   "type": ["Category:Item"],
  //   "label": [{"text": "My New Other", "lang": "en"}],
  //   "other":["Item:MySecondItem"]

  // },
  // "Item:MySecondItem": {
  //   "type": ["Category:Item"],
  //   "label": [{"text": "My Second Other", "lang": "en"}]

  // },

}};

let configFile =
{
    "type": [
      "Category:OSWaf511685f7c044e49bcdc5e32e58b19a"
    ],
    "graph_container_id": "mynetwork",
    "root_node_objects": [
      {
        "node_id": "Item:MyProject",
        "expansion_depth": 1,
        "properties": [
          "property1"
        ],
        "expansion_path": "path.path.path"
      },
      {
        "node_id": "Item:MyOtherItem",
        "expansion_depth": 1,
        "properties": [
          "property2"
        ],
        "expansion_path": "path.path.path.path"
      }
    ],
    "uuid": "c70c0a9a-dc29-4d92-92d6-043c5ec760ea",
    "label": [
      {
        "text": "config1",
        "lang": "en"
      }
    ],
    "expanded_paths": [
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/some_literal/0"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/some_literal/1"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/some_literal/2"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/not_in_context"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:SomePerson",
        "jsondata/Item:MyOtherItem",
        "jsondata/Item:MyNewItem"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:SomePerson",
        "jsondata/Item:MyOtherItem",
        "jsondata/Item:MyOtherItem/some_literal"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:SomePerson",
        "jsondata/Item:MyOtherItem",
        "jsondata/Item:MyOtherItem/not_in_context"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:SomePerson",
        "jsondata/Item:MyOtherItem",
        "jsondata/Item:MyOtherItem/budget/0",
        "jsondata/Item:MyOtherItem/budget/0/year"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:SomePerson",
        "jsondata/Item:MyOtherItem",
        "jsondata/Item:MyOtherItem/budget/0",
        "jsondata/Item:MyOtherItem/budget/0/value"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:SomePerson",
        "jsondata/Item:MyOtherItem",
        "jsondata/Item:MyOtherItem/budget/1",
        "jsondata/Item:MyOtherItem/budget/1/year"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:SomePerson",
        "jsondata/Item:MyOtherItem",
        "jsondata/Item:MyOtherItem/budget/1",
        "jsondata/Item:MyOtherItem/budget/1/value"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/0",
        "jsondata/Item:MyProject/budget/0/year"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/0",
        "jsondata/Item:MyProject/budget/0/value"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/0",
        "jsondata/Item:MyProject/budget/0/budget/0",
        "jsondata/Item:MyProject/budget/0/budget/0/year"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/0",
        "jsondata/Item:MyProject/budget/0/budget/0",
        "jsondata/Item:MyProject/budget/0/budget/0/value"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/0",
        "jsondata/Item:MyProject/budget/0/budget/1",
        "jsondata/Item:MyProject/budget/0/budget/1/year"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/0",
        "jsondata/Item:MyProject/budget/0/budget/1",
        "jsondata/Item:MyProject/budget/0/budget/1/value"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/1",
        "jsondata/Item:MyProject/budget/1/year"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/1",
        "jsondata/Item:MyProject/budget/1/value"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/2",
        "jsondata/Item:MyProject/budget/2/year"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/2",
        "jsondata/Item:MyProject/budget/2/value"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/3",
        "jsondata/Item:MyProject/budget/3/year"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/3",
        "jsondata/Item:MyProject/budget/3/value/0"
    ],
    [
        "jsondata/Item:MyProject",
        "jsondata/Item:MyProject/budget/3",
        "jsondata/Item:MyProject/budget/3/value/1"
    ]
],
    "expanded_nodes": [
      {
        "node_id": "item:test",
        "expansion_depth": 1,
        "properties": [
          "property 1"
        ],
        "expansion_path": "path.path"
      }
    ],
    "coloring_function_object": {
      "function_name": "colorByValue",
      "path": "value",
      "start_color": "orangered",
      "end_color": "limegreen"
    },
    "positioning_function_object": {
      "test": null
    },
    "visual_search_function_object": {
      "search_string": "budget",
      "search_on": "nodes"
    },
    "dataset_search_function_object": {
      "search_string": "20",
      "search_on": "nodes",
      "keep_expanded": true
    },
    "visual_nodes_edges_object": {
      "nodes": [
        [
          "node 1",
          "node 2"
        ]
      ],
      "edges": [
        [
          "edge 1",
          "edge 2"
        ]
      ]
    },
    "initial_dataset": {
      "jsondata": {
        "jsondata_old": {}
      },
      "jsonschema": {
        "jsonschema_old": {}
      }
    },
    "data_format": [
      "format"
    ],
    "dataset_schema": [
      "schema"
    ],
    "item_prefix_separator":":",
    "name": "Config1"
  }

    container = document.getElementById("mynetwork")

    let graph = new isg.Graph.Graph(container ,new_json, configFile);

    // configFile.graph_container_id = "mynetwork2";

    // let graph2 = new isg.Graph.Graph(new_json, configFile);
