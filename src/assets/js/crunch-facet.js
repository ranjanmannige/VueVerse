// Just a filter.
// Example: ['a','a','a','b','b'].filter(onlyUnique)
// Should give you: ['a','b']
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

// Same as above, but sorts items correctly (i.e., [10,1,1,2], becomes [1,1,2,10] and not [1,1,10,2])
function sortNumber(a, b) {
  return a - b;
}

var first_time_load = true;

//DUPLICATE
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

function remove_element(a, val) {
  for (var i = a.length - 1; i >= 0; i--) {
    if (a[i] == val) {
      a.splice(i, 1);
    }
  }
}

function addParagraphs(term, buttonDiv) {
  div_to_toggle = $(buttonDiv);
  //var sources = paragraph_string.split(" ");
  var sources = term_to_sources_dict[term]; //.filter(onlyUnique);
  console.log(sources);
  //THIS FUNCTIONALITY DOES NOT YET EXIST. SO WE DISABLED IT.
  //TO ENABLE IT, we NEED TO DO SOME SET THEORY
  if (div_to_toggle.hasClass("termButtonOn")) {
    // Deleting the term from highlight_terms
    highlight_terms = highlight_terms.filter(x => x !== term);

    // Finding all paragraphs (sources) that are absent from our
    var all_sources_but_ours = [];
    $.each(highlight_terms, function(index, otherterm) {
      all_sources_but_ours = all_sources_but_ours.concat(
        term_to_sources_dict[otherterm]
      );
    });
    allowed_para_ids = all_sources_but_ours.filter(onlyUnique);
  } else {
    $.each(sources, function(index, source) {
      // Creating a new style (highlightX)
      allowed_para_ids.push(source);
    });
    if (already_highlighted.includes(term)) {
      // pass
    } else {
      highlight_terms.push(term);
    }
  }
  toggleTerm(div_to_toggle);
  limit_passages();
}

var term_color = 0;
function toggleTerm(div_to_toggle) {
  if (div_to_toggle.hasClass("termButtonOff")) {
    // Then our div off, so we make it on
    div_to_toggle.removeClass("termButtonOff");
    div_to_toggle.addClass("termButtonOn");
    //var current_colorid = colorIdx++ % colors.length;
    color_id = colorIdx++ % colors.length;
    div_to_toggle.css("background-color", colors[color_id]);
    /*
        term_color += 1;
        if(term_color >= colors.length){
            term_color = 0;
        }
        */
  } else {
    // Then we have a div that is on, and so we make it off
    div_to_toggle.removeClass("termButtonOn");
    div_to_toggle.addClass("termButtonOff");
    div_to_toggle.css("background-color", "white");
    color_id = colorIdx-- % colors.length;
  }
  //$(handle+'Svg').css('width',$(handle).height()+'px');
  //$(handle+'Svg').css('height',$(handle).height()+'px');
}

function collapseAll() {
  transitionSpeed = 500;

  collapseDivs = displayRadioValue("collapseOrNot");

  //var collapseDivs = $("#collapseAllButton").prop("checked");
  // console.log("$('.topicPanel').length",$('.topicPanel').length);
  $(".topicPanel").each(function(i, topicDiv) {
    //$(this).addClass('anotherclass');
    //termButtonDiv.removeClass('termButtonOn');
    var jqueryhandle = $(this);

    if (collapseDivs == "true") {
      if (jqueryhandle.hasClass("v")) {
        $(this).removeClass("v");
        $(this).hide(transitionSpeed);
      }
    } else {
      if (!jqueryhandle.hasClass("v")) {
        $(this).addClass("v");
        $(this).show(transitionSpeed);
      }
    }
  });
}
function toggleFacetSection(handle_base) {
  if ($(handle_base + "_panel").hasClass("v")) {
    // then this set is being shown already, we unshow it
    $(handle_base + "_panel").hide();
    $(handle_base + "_panel").removeClass("v");
  } else {
    $(handle_base + "_panel").show();
    $(handle_base + "_panel").addClass("v");
  }
}

function displayRadioValue(id) {
  var return_value = undefined;
  var ele = document.getElementsByName(id);
  for (i = 0; i < ele.length; i++) {
    if (ele[i].checked) {
      return_value = ele[i].value;
    }
  }
  return return_value;
}

//populate_terms();

$("#orderTopicsBy").change(function() {
  //populate_terms();
  load_docs();
});

$("#toggleGroupByButton").change(function() {
  var group_by = $("#toggleGroupByButton").prop("checked");
  load_docs();
});

$("#groupTopicsBy").change(function() {
  var group_by = displayRadioValue("groupTopicsBy");
  if (group_by == "none") {
    $("#collapseAllButton").prop("checked", false);
  }
  //populate_terms();
  load_docs();
});
$("#showTopicCounts").change(function() {
  //populate_terms();
  load_docs();
});
$("#collapseAllButton").change(function() {
  collapseAll();
});

$("#collapseOrNot").change(function() {
  collapseAll();
});
