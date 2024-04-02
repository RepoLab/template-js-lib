import panel as pn
import param
import requests


with open("panel_javascript/create_example_conf.js", "r") as f:
    create_example_config_script = f.read()

with open('node_modules/tabulator-tables/dist/css/tabulator.css', 'r') as f:
    tabulator_css = f.read()

css_files = ["https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"]
pn.extension(css_files=css_files)

class GraphToolPanel(pn.reactive.ReactiveHTML):

    _template = """
    <div class="container">
    <header><h1>GraphTool Test Panel</h1>
    </header>
    <div id="mynetwork"></div>
    </div>
    """### Actung! die id's aus dem Template werden beim Instanzieren verändert

    _scripts = {

        "render": create_example_config_script+"""
        console.log("from _script:", isg.Graph.Graph);
        configFile.graph_container_id = mynetwork.id,
        console.log("config file:", configFile);
        console.log("mynetwork", mynetwork);

        //let graph = new vis.Network(mynetwork )
        let container = mynetwork;
        let graph = new isg.Graph.Graph(container,new_json, configFile);
        """
    }

    __javascript__ = [
        #"https://unpkg.com/vis-network/standalone/umd/vis-network.min.js",
        #'https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.10.0/jsoneditor.min.js', ##jsoneditor
        'dist/isg.umd.js',
        'panel_javascript/create_example_conf.js',
      #  'node_modules/bootstrap/dist/js/bootstrap.bundle.js',
      # 'https://unpkg.com/tabulator-tables@4.3.0/dist/js/tabulator.min.js',
    ]
    _stylesheets = [
      'node_modules/tabulator-tables/dist/css/tabulator.css',
      'node_modules/jsoneditor/dist/jsoneditor.css',
      'node_modules/bootstrap/dist/css/bootstrap.min.css',
     # 'node_modules/@fortawesome/fontawesome-free/css/all.css' seems not to work => use cdn via pn.extension
      ]


col = pn.Column(GraphToolPanel(width = 1000, height = 400))


pn.serve(col)
