// d3.js v5 compatible code
function startCirclePacking(values) {
  var divheight = Math.min($("#divPacking").height(), $("#divPacking").width());
  if (divheight > 20) {
    $("#divPackingSvg").empty();
    $("#divPacking").css("text-align", "center");
    $("#divPackingSvg").attr("height", divheight);
    $("#divPackingSvg").attr("width", divheight);

    var svg = d3.select("#divPackingSvg"),
      height = divheight,
      width = divheight,
      margin = 20,
      diameter = +svg.attr("width"),
      g = svg
        .append("g")
        .attr(
          "transform",
          "translate(" + diameter / 2 + "," + diameter / 2 + ")"
        );
    //
    var color = d3
      .scaleLinear()
      .domain([-1, 5])
      //.range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
      //.range(["hsl(20,80%,80%)", "hsl(228,30%,40%)"])
      .range(["#eec3ab", "#eb5300"])
      .interpolate(d3.interpolateHcl);

    var pack = d3
      .pack()
      .size([diameter - margin, diameter - margin])
      .padding(2);

    //var docs = jdocs; // global variable passed by the rendering html
    //var docfn = docs[0]["basefn"] + ".topics.json";
    var doc_id = 1;
    var docs = jdocs; // global variable passed by the rendering html
    var docfn = docs[doc_id]["basefn"] + ".topics.json";

    d3.json(docfn).then(function(root) {
      root = d3
        .hierarchy(root)
        .sum(function(d) {
          return d.size;
        })
        .sort(function(a, b) {
          return b.value - a.value;
        });

      var focus = root,
        nodes = pack(root).descendants(),
        view;

      var circle = g
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", function(d) {
          return d.parent
            ? d.children
              ? "node"
              : "node node--leaf"
            : "node node--root";
        })
        .style("fill", function(d) {
          return d.children ? color(d.depth) : null;
        })
        .on("rightclick", function(d) {
          if (focus !== d) zoom(d), d3.event.stopPropagation();
        })
        .on("click", function(d) {
          if (focus !== d) zoom(d), d3.event.stopPropagation();
        });
      //.on("click", function(d) { if (true) zoom(d), d3.event.stopPropagation(); });

      var text = g
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .style("fill-opacity", function(d) {
          return d.parent === root ? 1 : 0;
        })
        .style("display", function(d) {
          return d.parent === root ? "inline" : "none";
        })
        .text(function(d) {
          return d.data.name;
        });

      var node = g.selectAll("circle,text");

      svg.style("background", "white").on("click", function() {
        zoom(root);
      });
      zoomTo([root.x, root.y, root.r * 2 + margin]);
      function zoom(d) {
        if (d.children) {
          if (d.children.length == 1) {
            //var list_like_string = str().split(',');
            $.each(d.children[0].data["sources"], function(index, value) {
              // Creating a new style (highlightX)
              allowed_para_ids.push(doc_id + "_" + value);
            });
            if (already_highlighted.includes(d.data["name"])) {
              // pass
            } else {
              highlight_terms.push(d.data["name"]);
            }
            limit_passages();
          }
        }
        var focus0 = focus;
        focus = d;
        var transition = d3
          .transition()
          .duration(d3.event.altKey ? 7500 : 750)
          .tween("zoom", function(d) {
            var i = d3.interpolateZoom(view, [
              focus.x,
              focus.y,
              focus.r * 2 + margin
            ]);
            return function(t) {
              zoomTo(i(t));
            };
          });
        transition
          .selectAll("text")
          .filter(function(d) {
            return d.parent === focus || this.style.display === "inline";
          })
          .style("fill-opacity", function(d) {
            return d.parent === focus ? 1 : 0;
          })
          .on("start", function(d) {
            if (d.parent === focus) this.style.display = "inline";
          })
          .on("end", function(d) {
            if (d.parent !== focus) this.style.display = "none";
          });
      }
      function zoomTo(v) {
        var k = diameter / v[2];
        view = v;
        node.attr("transform", function(d) {
          return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
        });
        circle.attr("r", function(d) {
          return d.r * k;
        });
      }
    });
  }
}
