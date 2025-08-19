/*
FOR PASSAGE EXPLORER
*/
var available_para_ids = []; // The global variable
var allowed_para_ids = [];
var highlight_terms = [];
var already_highlighted = [];
var color_id = 0;

var topic_to_term_dict = {};
var term_to_sources_dict = {};

/*
$(document).ready(function() {
  // Add smooth scrolling to all links in navbar + footer link
  $(".navbar a, footer a[href='#myPage']").on("click", function(event) {
    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (900) specifies the number of milliseconds it takes to scroll to the specified area
      $("html, body").animate(
        {
          scrollTop: $(hash).offset().top
        },
        900,
        function() {
          // Add hash (#) to URL when done scrolling (default click behavior)
          window.location.hash = hash;
        }
      );
    } // End if
  });

  $(window).scroll(function() {
    $(".slideanim").each(function() {
      var pos = $(this).offset().top;

      var winTop = $(window).scrollTop();
      if (pos < winTop + 600) {
        $(this).addClass("slide");
      }
    });
  });
});
*/

//$("#bubbleChart").hide();
//$("#divPassage").hide();
function toggleme(handle, base_class) {
  div_to_toggle = $(handle);
  menu_button_div = $(handle + "Button");
  if (menu_button_div.hasClass("item-menu-on") == true) {
    // Then our div IS in visible, so we make it visible
    div_to_toggle.show(0, function() {
      // we need to recalculate the circle packing because of change in dimensions
      // This exists here because 'startCirclePacking' needs the dimensions of the div, which changes
      // as the 400 miliseconds pass
      startCirclePacking();
    });
    menu_button_div.removeClass("item-menu-on");
    menu_button_div.addClass("item-menu-off");
  } else {
    // Then our div IS NOT visible, so we make it visible
    div_to_toggle.hide(0, function() {
      // we need to recalculate the circle packing because of change in dimensions
      // This exists here because 'startCirclePacking' needs the dimensions of the div, which changes
      // as the 400 miliseconds pass
      startCirclePacking();
    });
    menu_button_div.removeClass("item-menu-off");
    menu_button_div.addClass("item-menu-on");
  }
  //$(handle+'Svg').css('width',$(handle).height()+'px');
  //$(handle+'Svg').css('height',$(handle).height()+'px');
}

//$("#bubbleChart").hide();
//$("#divPassage").hide();
function toggleDiv(handle, base_class) {
  if (base_class === undefined) {
    base_class = "card";
  }

  div_to_toggle = $(handle);
  menu_button_div = $(handle + "Button");
  if (menu_button_div.hasClass("item-menu-on") == true) {
    // Then our div IS in visible, so we make it visible
    div_to_toggle.show(0, function() {
      // we need to recalculate the circle packing because of change in dimensions
      // This exists here because 'startCirclePacking' needs the dimensions of the div, which changes
      // as the 400 miliseconds pass
      startCirclePacking();
    });
    menu_button_div.removeClass("item-menu-on");
    menu_button_div.addClass("item-menu-off");
  } else {
    // Then our div IS NOT visible, so we make it visible
    div_to_toggle.hide(0, function() {
      // we need to recalculate the circle packing because of change in dimensions
      // This exists here because 'startCirclePacking' needs the dimensions of the div, which changes
      // as the 400 miliseconds pass
      startCirclePacking();
    });
    menu_button_div.removeClass("item-menu-off");
    menu_button_div.addClass("item-menu-on");
  }
  //$(handle+'Svg').css('width',$(handle).height()+'px');
  //$(handle+'Svg').css('height',$(handle).height()+'px');
}

// Opens a new page (in tab name "passageexplore") that loads a PDF to the right page
// and shows the selected text to the left
function get_raw(pagenumber, current_div) {
  var p = encodeURIComponent(pagenumber);
  var v = encodeURIComponent($(current_div + "clean").html());

  var docid = current_div.match(RegExp("\\d+", "g"))[0];
  var link = "/pdf?docid=" + docid + "&pdfpage=" + p + "&passage=" + v;
  var tabname = "passageexplore";
  var win = window.open(link, tabname);

  if (win) {
    //Browser has allowed it to be opened
    win.focus();
  } else {
    alert("Please allow popups for this website");
    //Browser has blocked it
  }
}

// Load the top or bottom 5 passages based on whether how="up" or not
function move(current_div, how) {
  var matched_numbers = current_div.match(/\d+/g); // Expecting something like '1_p21'... should get ['1','21'] back
  var doc_number = matched_numbers[0];
  var raw_para_number = matched_numbers[1];
  //
  var current_para_number = parseInt(raw_para_number);
  //
  console.log("how", how, how == "up");
  console.log(current_div, current_para_number);
  //
  if (how == "up") {
    for (i = 0; i < 5; i += 1) {
      passage_number_to_show = current_para_number - i;
      $("#" + doc_number + "_p" + passage_number_to_show).show("slow");
    }
    current_passage_number = -1;
  } else {
    for (i = 0; i < 5; i += 1) {
      passage_number_to_show = current_para_number + i;
      $("#" + doc_number + "_p" + passage_number_to_show).show("slow");
    }
  }
}

/*
// Now using `then`
function getJsonFromDoc(docId) {
  var jsonfn = jdocs[docId]["basefn"] + ".passages.json";
  return $.getJSON(jsonfn).then(function(data) {
    return {
      data: data,
      id: docId
    };
  });
}
*/

var docs = jdocs; // global variable passed by the rendering html

//$.each(docs, function(key1, doc) {

// getting promises for our possibly multiple (and asynchronous) json requests
function return_passage_promises(docId) {
  var jsonfn = jdocs[docId]["basefn"] + ".passages.json";
  return $.getJSON(jsonfn).then(function(data) {
    return {
      data: data,
      id: docId
    };
  });
}

function toggle_tooltip(basename) {
  $("#" + basename + "_tooltip").toggle();
  $("#" + basename + "_tooltip_content").toggle();
  console.log($("#" + basename + "_tooltip_content"));
}

function populate_passages(values) {
  var html_block = "";
  $.each(values, function(key, packet) {
    for (_ix in packet.data) {
      var val = packet.data[_ix];
      var paraId = packet.id + "_" + val["para_ID"];
      //
      available_para_ids.push(paraId);
      //raw_packets.push(packet.data[_ix]);
      //
      raw_text = val["raw"];
      pdf_page = val["pdfpage"];
      tooltip_id = "tooltipcontent_" + paraId;
      //t += "<div class='passage' id='"+passage_id+"'\">";
      var t = "";
      t +=
        "<div class='passage doccolor" +
        packet.id +
        "' style='overflow:auto;' id='" +
        paraId +
        "'>";
      t +=
        "<div style='float: right; cursor:pointer; padding:5px; font-size:90%;'>";
      t +=
        "<div id='" +
        paraId +
        "_tooltip' onmouseover='toggle_tooltip(\"" +
        paraId +
        "\")'><i class='fas fa-chevron-left'></i></div>";

      t += "<div  id='" + paraId + "_tooltip_content' hidden>";
      t +=
        "<i onclick=\"toggle_tooltip('" +
        paraId +
        '\')" style="cursor:pointer;" class="fas fa-chevron-right"></i>';
      t +=
        " <a href='#' style='text-decoration: none; color: #f4511e;' onclick=\"toggleme('#" +
        paraId +
        "')\">REMOVE</a>";
      t +=
        " | SHOW <a href='#' style='text-decoration: none; color: #f4511e;' onclick=\"move('#" +
        paraId +
        "', 'up')\">&#9652;</a>";

      t +=
        "   <a href='#' style='text-decoration: none; color: #f4511e;' onclick=\"move('#" +
        paraId +
        "', 'down')\">&#9662;</a>";
      t +=
        " | <a href='#' style='text-decoration: none; color: #f4511e;' onclick=\"get_raw('" +
        pdf_page +
        "','#" +
        paraId +
        "')\">SOURCE</a>";
      t +=
        " <i onclick=\"toggle_tooltip('" +
        paraId +
        '\')" style="cursor:pointer;" class="fas fa-chevron-right">--</i>';
      t += "</div>";

      t += "</div>";

      t += "<div id='" + paraId + "clean' style='color:rgba(0,0,0,0.8);'>";
      t += raw_text;
      //t += '<b>Q.</b> ';
      //t += val["q"];
      //t += '<br><b>A.</b> ';
      //t += val["a"];
      t += "</div>";
      //t += '<br>';
      t += "</div>";
      //t += '</div>';
      html_block += t;
    }
  });
  // Writing to HTML div
  var passage_content = $("#divPassageContent");
  passage_content.empty(); // Empty the area which will contain the passages
  passage_content.append(html_block); //
}

//var raw_packets = [];
function populate_terms(values) {
  topic_to_term_dict = {};
  term_to_sources_dict = {};
  var mainTermsContent = ""; // this will be the HTML content of the div
  var mainTermsDiv = $("#divTermsContent"); // .any()? // The div to which to write to
  //
  $.each(values, function(key, packet) {
    for (_ix in packet.data) {
      var val = packet.data[_ix];
      var paraId = packet.id + "_" + val["para_ID"];

      //
      //var paraID = val["para_ID"];
      //var docID = val["doc_ID"];
      //
      if (val["body_flag"] == 0) {
        //pass
      } else {
        //
        var topic_record = JSON.parse(val["topics"]);
        //
        $.each(topic_record, function(key, topic) {
          var term_text = topic["term"];
          var topic_text = topic["topic"];

          if (term_text in term_to_sources_dict) {
            // pass
          } else {
            term_to_sources_dict[term_text] = [];
          }
          term_to_sources_dict[term_text].push(paraId);

          if (topic_text in topic_to_term_dict) {
            // pass
          } else {
            topic_to_term_dict[topic_text] = [];
          }
          topic_to_term_dict[topic_text].push(term_text);
        });
      }
    }
  });
  for (term in term_to_sources_dict) {
    term_to_sources_dict[term] = term_to_sources_dict[term].filter(onlyUnique);
  }

  var group_by = $("#groupTopicsBy").val();
  if (group_by === false) {
    new_topic_to_term_dict = { ALL: [] };
    terms = [];
    for (topic in topic_to_term_dict) {
      $.each(topic_to_term_dict[topic], function(term_ix, term) {
        new_topic_to_term_dict["ALL"].push(term);
      });
    }
    topic_to_term_dict = new_topic_to_term_dict;
  }

  //var order_by = $('#orderTopicsBy').val();
  var order_by = displayRadioValue("orderTopicsBy");

  //var group_by = $('#groupTopicsBy').val();
  var group_by = $("#toggleGroupByButton").prop("checked");

  if (group_by === false) {
    new_topic_to_term_dict = { ALL: [] };
    terms = [];
    for (topic in topic_to_term_dict) {
      $.each(topic_to_term_dict[topic], function(term_ix, term) {
        new_topic_to_term_dict["ALL"].push(term);
      });
    }
    topic_to_term_dict = new_topic_to_term_dict;
  }
  var showCounts = showTopicCounts;

  var term_id = 0;
  var ordered_topics = Object.keys(topic_to_term_dict).sort();
  //for( var topic in ordered_topics ) {
  $.each(ordered_topics, function(topic_ix, topic) {
    var t = "";
    t +=
      '<div class="topicHeader" style="cursor: pointer;" onclick=\'toggleFacetSection("#topic' +
      topic_ix +
      '")\' id="topic' +
      topic_ix +
      '_header">';
    t += topic;
    t += "</div>";
    t += '<div class="topicPanel v" id="topic' + topic_ix + '_panel">';
    var all_terms = topic_to_term_dict[topic].sort();
    var unique_terms = topic_to_term_dict[topic].filter(onlyUnique).sort();

    // Getting all term counts within topic
    var term_to_count = {};
    for (i = 0; i < unique_terms.length; i++) {
      var term = unique_terms[i];
      var termCount = 0;
      $.each(all_terms, function(index, value) {
        if (value == term) {
          termCount++;
        }
      });
      term_to_count[term] = termCount;
    }

    if (order_by == "popular") {
      var to_sort_by = Object.values(term_to_count)
        .filter(onlyUnique)
        .sort(sortNumber)
        .reverse();
      var result = [];
      $.each(to_sort_by, function(ax, tCount) {
        $.each(unique_terms, function(ix, term) {
          if (term_to_count[term] == tCount) {
            result.push(term);
          }
        });
      });
      unique_terms = result;
    }

    for (i = 0; i < unique_terms.length; i++) {
      term_id += 1;
      var term = unique_terms[i];
      //var paragraphs = term_to_sources_dict[term].filter(onlyUnique).join(" ");
      t +=
        '<div class="termButton termButtonOff" id="term' +
        term_id +
        '" onclick="addParagraphs(\'' +
        term.replace("'", "\\'").replace('"', '\\"') +
        "', '#term" +
        term_id +
        "')\">";
      t += term;
      if (showCounts != false) {
        t += '<font class="countfont"> | ' + term_to_count[term] + "</font>";
      }
      t += "</div>";
    }
    t += "</div>";
    //
    mainTermsContent += t;
  });

  // Erasing existing contents of #divTermsContent
  mainTermsDiv.empty();
  // Adding the new content
  mainTermsDiv.append(mainTermsContent);

  // Ensuring that the terms are not collapsed within the topics
  if (true) {
    //first_time_load == true){
    collapseAll(0);
    first_time_load = false;
  }
}

//var raw_packets = [];
//function load_passages() {
function load_docs() {
  available_para_ids = []; // Resetting global variable
  //raw_packets = [];
  //
  var promise_list = []; //all json calls will be stored as promices (used later by Promise.all())
  var selected_docs = getSelectedDocs(); // collect the doc IDs that are listed
  //
  // Collecting JSON promises, based on selected doc IDs
  for (docIdIx in selected_docs) {
    docId = selected_docs[docIdIx];
    promise_list.push(return_passage_promises(docId));
  }

  Promise.all(promise_list).then(function(values) {
    populate_passages(values);
    populate_terms(values);
  });
}

// STOPPED HERE

function clear_annotations() {
  allowed_para_ids = [];
  highlight_terms = [];
  already_highlighted = [];

  $(".termButtonOn").each(function(i, termButtonDiv) {
    //$(this).addClass('anotherclass');
    //termButtonDiv.removeClass('termButtonOn');
    var jqueryhandle = $(this);
    if (!jqueryhandle.hasClass("termButtonOff")) {
      $(this).addClass("termButtonOff");
      $(this).css("background-color", "white");
    }
    //
    if (jqueryhandle.hasClass("termButtonOn")) {
      $(this).removeClass("termButtonOn");
    }
    //
  });

  // $("#divPassage").unmark();
  var divHandle = new Mark(document.querySelector("#divPassageContent"));
  divHandle.unmark();

  var identifier = "#";
  $.each(available_para_ids, function(index, value) {
    $(identifier + value).show();
  });
}

function search_passages() {
  var exact_match = false;
  //console.log('exact_match',exact_match);
  if ($("#exact_match").prop("checked") == true) {
    exact_match = true;
  }
  allowed_para_ids = [];
  highlight_terms = [];
  already_highlighted = [];

  // $("#divPassage").unmark();
  var divHandle = new Mark(document.querySelector("#divPassageContent"));
  divHandle.unmark();

  var value = $("#searchValue").val();
  var text_values = [];
  if (value[0] == '"') {
    text_values.push(value.replace(/\"/g, ""));
  } else {
    text_values = value.split(/[ ]+/); // splitting by whitespaces
  }

  var identifier = "#";
  $.each(available_para_ids, function(index, value) {
    var para_text = $(identifier + value).text();
    var show_para = false;
    $.each(text_values, function(index2, match_string) {
      if (para_text.includes(match_string)) {
        // then we show these one
        show_para = true;
      }
    });
    if (show_para === true) {
      $(identifier + value).show();
    } else {
      // else we hide them
      $(identifier + value).hide();
    }
  });

  $.each(text_values, function(index, value) {
    if (already_highlighted.includes(value)) {
      // pass
    } else {
      color_id = colorIdx++ % colors.length;
      var current_highlight_color = colors[color_id];
      var mark_name = "mark" + color_id;

      already_highlighted.push(value);
      $("#markstyles").append(
        "." +
          mark_name +
          "{ background: " +
          current_highlight_color +
          "; color: black; }"
      );

      var divHandle = new Mark(document.querySelector("#divPassageContent"));
      divHandle.mark(value, {
        accuracy: "partially", // "exactly", //"complementary",
        iframes: false,
        className: mark_name,
        caseSensitive: false
      });
    }
  });
}

function limit_passages(exact_match) {
  if (allowed_para_ids.length == 0) {
    console.log("we have nothing!");
    clear_annotations();
  } else {
    var identifier = "#";
    $.each(available_para_ids, function(index, value) {
      if (allowed_para_ids.includes(value)) {
        // then we show these one
        $(identifier + value).show();
      } else {
        // else we hide them
        $(identifier + value).hide();
      }
    });

    $.each(highlight_terms, function(index, value) {
      // Creating a new style (highlightX)

      if (already_highlighted.includes(value)) {
        // pass
      } else {
        //color_id = colorIdx % colors.length;
        var current_highlight_color = colors[color_id];
        var mark_name = "mark" + color_id;

        //console.log([value,mark_name,current_highlight_color]);
        already_highlighted.push(value);
        $("#markstyles").append(
          "." +
            mark_name +
            "{ background: " +
            current_highlight_color +
            "; color: black; border-radius: 4px; padding:4px; border:1px solid black;}"
        );

        //console.log($("#markstyles").html());
        //var divHandle = $("#divPassage");
        var divHandle = new Mark(document.querySelector("#divPassageContent"));
        divHandle.mark(value, {
          accuracy: "complementary", //"complementary", //"partially", //"exactly", //
          iframes: false,
          className: mark_name,
          caseSensitive: false,
          separateWordSearch: false
        });
      }
    });
  }
}

//var instance = new Mark("#divPassage");
//
