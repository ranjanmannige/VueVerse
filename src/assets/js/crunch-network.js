/*
Cobbled from a combination of the following code:

Tom Roth’s Block 4438752bb93f45dc5ad5214efaa12e4a, "Zoomable Force Directed Graph d3v4", Updated March 10, 2018
https://bl.ocks.org/puzzler10/4438752bb93f45dc5ad5214efaa12e4a

heybignick’s Block 3faf257bbbbc7743bb72310d03b86ee8, "D3.js v4 Force Directed Graph with Labels", Updated November 7, 2019
https://bl.ocks.org/heybignick/3faf257bbbbc7743bb72310d03b86ee8
*/

function startNetwork() {
  //var divheight = Math.min($("#divGraph").height(), $("#divGraph").width());
  $("#divGraph").css("text-align", "center");
  $("#graphSvg").empty();
  $("#graphSvg").attr("height", $("#divGraph").height());
  $("#graphSvg").attr("width", $("#divGraph").width());

  var svg = d3.select("#graphSvg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  console.log("width", width, "height", height);
  console.log(svg.attr("width"), svg.attr("height"));

  //var color = d3.scaleOrdinal(d3.schemeCategory20);
  var color = d3.scaleOrdinal(d3.schemeTableau10); //d3.schemeAccent);
  //var color = d3.scaleSequential(d3.interpolatePiYG);

  var simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3.forceLink().id(function(d) {
        return d.id;
      })
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  //add encompassing group for the zoom
  var g = svg.append("g").attr("class", "everything");

  var docfn = "static/miserables.json";
  d3.json(docfn).then(function(graph) {
    //d3.json("miserables.json", function(error, graph) {
    //if (error) throw error;

    /*
    var link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter()
      .append("line")
      .attr("stroke-width", function(d) {
        return Math.sqrt(d.value);
      });
    */

    //draw lines for the links
    var link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter()
      .append("line")
      .attr("stroke-width", function(d) {
        return Math.sqrt(d.value);
      });

    /*
    var node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(graph.nodes)
      .enter()
      .append("g");
    */

    //draw circles for the nodes
    var node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter()
      .append("g");

    var circles = node
      .append("circle")
      .attr("r", 5)
      .attr("fill", function(d) {
        return color(d.group);
      });

    var lables = node
      .append("text")
      .text(function(d) {
        return d.id;
      })
      .attr("x", 6)
      .attr("y", 3);

    node.append("title").text(function(d) {
      return d.id;
    });

    //add zoom capabilities

    //Zoom functions

    simulation.nodes(graph.nodes).on("tick", ticked);

    simulation.force("link").links(graph.links);

    function ticked() {
      link
        .attr("x1", function(d) {
          return d.source.x;
        })
        .attr("y1", function(d) {
          return d.source.y;
        })
        .attr("x2", function(d) {
          return d.target.x;
        })
        .attr("y2", function(d) {
          return d.target.y;
        });

      node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }

    var zoom_handler = d3.zoom().on("zoom", zoom_actions);
    zoom_handler(svg);

    function zoom_actions() {
      g.attr("transform", d3.event.transform);
    }

    /*
    -----------------------------------------------------------------------------------
    -----------------------------------------------------------------------------------
    */
    var drag_handler = d3
      .drag()
      .on("start", drag_start)
      .on("drag", drag_drag)
      .on("end", drag_end);

    //same as using .call on the node variable as in https://bl.ocks.org/mbostock/4062045
    drag_handler(node);
    //drag handler
    //d is the node
    function drag_start(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function drag_drag(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    function drag_end(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = d.x;
      d.fy = d.y;
    }
    /*
    -----------------------------------------------------------------------------------
    -----------------------------------------------------------------------------------
    */
  });

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}
