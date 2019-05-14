// Authors: Dishen Zhao, Ning Shi

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

// Variables and setup -------------------------------------------------

// Global data variables
var displayMode = "gen",
    colorScheme = "none",
    years = "1516",
    stateFips = [],
    stateData = {},
    firstActive = null,
    secondActive = null;

// Canvas dimensions and transformation values
var width = 1080,
    height = 720,
    translate = [0, 0],
    scale = 1.0;

// albersUSA is one type of map projection to convert 3D GPS to 2D layout
var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

// Path will be the drawn graphics made from the projection
var path = d3.geo.path()
    .projection(projection);

// Build HTML and SVG elements -----------------------------------------

// Set up main canvas SVG (Scalable Vector Graphics)
var svg = d3.select("#canvas").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

// Draw SVG background
svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    //.style("fill", "rgb(196,238,252)")
    .on("click", reset);

// Create inner SVG element to apply transformations on
var g = svg.append("g");

// Text for display modes
var displayModeText = d3.select("#controls")
    .append("text")
    .style("font-size", "20px")
    //.style("margin", "20px")
    .text("Display Mode");

// Div box to contain display mode options
var displayModeDiv = d3.select("#controls")
    .append("div")
    .attr("id", "ops")
    .style("width", "100%")
    .style("height", "150px")
    //.style("margin-top", "10px")
    //.style("margin-bottom", "10px")
    //.style("border", "2px solid")
    .style("border-color", "green");

// Display mode SVG and element array
var displayModeSvg = displayModeDiv.append("svg"),
    displayModeTexts = [],
    displayModeButtons = [];

// Text for general information
displayModeTexts.push(displayModeSvg.append("text")
    .attr("x", 48)
    .attr("y", 42)
    .attr("font-weight", "bold")
    .text("General Information")
);

// Text for inbound migration
displayModeTexts.push(displayModeSvg.append("text")
    .attr("x", 48)
    .attr("y", 80)
    .text("Inbound Migration")
);

// Text for outbound migration
displayModeTexts.push(displayModeSvg.append("text")
    .attr("x", 48)
    .attr("y", 117)
    .text("Outbound Migration")
);

// Button for general information
displayModeButtons.push(displayModeSvg.append("circle")
    .attr("id", "genButton")
    .attr("cx", 25)
    .attr("cy", 37)
    .attr("r", 15)
    .attr("class", "button")
    .classed("active", true)
    .on("click", function() {onClickControls("genButton")})
);

// Button for inbound migration
displayModeButtons.push(displayModeSvg.append("circle")
    .attr("id", "inButton")
    .attr("cx", 25)
    .attr("cy", 75)
    .attr("r", 15)
    .attr("class", "button")
    .on("click", function() {onClickControls("inButton")})
);

// Button for outbound migration
displayModeButtons.push(displayModeSvg.append("circle")
    .attr("id", "outButton")
    .attr("cx", 25)
    .attr("cy", 112)
    .attr("r", 15)
    .attr("class", "button")
    .on("click", function() {onClickControls("outButton")})
);

// Text for color scheme options 
var colorSchemeText = d3.select("#controls")
    .append("text")
    .style("font-size", "20px")
    .text("Color Scheme");

// Div for color scheme
var colorSchemeDiv = d3.select("#controls")
    .append("div")
    .attr("id", "filters")
    .style("width", "100%")
    .style("height", "150px")
    .style("margin-top", "10px")
    .style("margin-bottom", "10px")
    //.style("border", "2px solid")
    .style("border-color", "red");

// Color scheme SVG and element array
var colorSchemeSvg = colorSchemeDiv.append("svg"),
    colorSchemeTexts = [],
    colorSchemeButtons = [];

// Text for none color scheme
colorSchemeTexts.push(colorSchemeSvg.append("text")
    .attr("x", 48)
    .attr("y", 25)
    .attr("font-weight", "bold")
    .text("None")
);

// Text for population color scheme
colorSchemeTexts.push(colorSchemeSvg.append("text")
    .attr("x", 48)
    .attr("y", 62)
    .text("Population")
);

// Text for migration delta color scheme
colorSchemeTexts.push(colorSchemeSvg.append("text")
    .attr("x", 48)
    .attr("y", 99)
    .text("Migration Delta")
);

// Text for income color scheme
colorSchemeTexts.push(colorSchemeSvg.append("text")
    .attr("x", 48)
    .attr("y", 135)
    .text("Income")
);

// Button for none color scheme
colorSchemeButtons.push(colorSchemeSvg.append("circle")
    .attr("id", "noneButton")
    .attr("cx", 25)
    .attr("cy", 20)
    .attr("r", 12)
    .attr("class", "button")
    .classed("active", true)
    .on("click", function() {onClickControls("noneButton")})
);

// Button for population color scheme
colorSchemeButtons.push(colorSchemeSvg.append("circle")
    .attr("id", "popButton")
    .attr("cx", 25)
    .attr("cy", 57)
    .attr("r", 12)
    .attr("class", "button")
    .on("click", function() {onClickControls("popButton")})
);

// Button for migration delta color scheme
colorSchemeButtons.push(colorSchemeSvg.append("circle")
    .attr("id", "deltaButton")
    .attr("cx", 25)
    .attr("cy", 94)
    .attr("r", 12)
    .attr("class", "button")
    .on("click", function() {onClickControls("deltaButton")})
);

// Button for income color scheme
colorSchemeButtons.push(colorSchemeSvg.append("circle")
    .attr("id", "incomeButton")
    .attr("cx", 25)
    .attr("cy", 130)
    .attr("r", 12)
    .attr("class", "button")
    .on("click", function() {onClickControls("incomeButton")})
);

// Drop down selector
var selectText = d3.select("#controls")
    .append("text")
    .style("font-size", "20px")
    .text("Year Select");

var selectDiv = d3.select("#controls")
    .append("div")
    .attr("id", "filters")
    .style("width", "100%")
    .style("height", "30px")
    .style("margin-top", "0px")
    .style("margin-bottom", "5px")

// Drop down selector
var selectOptions = selectDiv.append("select")
    .style("margin-top", "10px")
    .style("margin-bottom", "10px")
    .on("change", onYearsSelect);

// Options data
var selectData = selectOptions.selectAll("option")
    .data(["2015-2016", "2014-2015"])
    .enter()
    .append("option")
        .text(function(d){return d;});

// Text for info box
var infoText = d3.select("#controls")
    .append("text")
    .style("font-size", "20px")
    .text("");

// Div for info box left side
var infoDiv = d3.select("#controls")
    .append("div")
    .attr("id", "infoDiv")
    .style("width", "100%")
    .style("height", "250px")
    .style("overflow-y", "scroll")
    //.style("border-top", "2px solid");

// Div for info box left side
var infoTable = infoDiv.append("table")
        .attr("width", "100%")
        .attr("border", "1px")
        .style("border-collapse", "collapse");
var infoTableHeader = infoTable.append("thead"),
    infoTableBody = infoTable.append("tbody");


// Create dot marker
svg.append("defs").append("marker")
    .attr("id", "circleMarker")
    .attr("refX", 0)
    .attr("refY", 0)
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .attr("viewBox", "-6 -6 12 12")
    .append("path")
        .attr("d", "M0,0  m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0");

// Create arrow head marker
svg.append("defs").append("marker")
    .attr("id", "arrowMarker")
    .attr("refX", 4)
    .attr("refY", 2.5)
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .append("path")
        .attr("d", "M0,0 L5,2.5 L0,5 Z");

// Load data and more setup --------------------------------------------

// No color
var noneColorScale = d3.scale.ordinal()
    .domain([1, 56])
    .range(colorbrewer.Pastel1[9]);

// Population color scale
var popColorScale = d3.scale.linear()
    .domain([500000, 35000000])
    .range(["#DFFBFF", "#006370"]);

// Migration delta color scale
var deltaColorScale = d3.scale.linear()
    .domain([-200000, 0, 200000])
    .range(["#C23B22", "#FDFD96", "#03C03C"]);

// Income color scale
var incomeColorScale = d3.scale.linear()
    .domain([50000, 110000])
    .range(["#DFFFDF", "#008000"]);

// Define zoom behavior in function
var zoom = d3.behavior.zoom()
    .on("zoom", zoomed)
    //.extent([[-width,height],[width, height]]);
    .scaleExtent([0.8,10])
    //.translateExtent([[0,0],[width, height]]);


// Turn zoom listener on, disable default double click zoom
svg.call(zoom)
    .on("dblclick.zoom", null);
svg.call(zoom.event);

// Setup data object for all state information
for (let i = 1; i <= 56; i++) {
  stateData[i] = {};
  stateData[i]["1415"] = {in:{sorted:[]}, out:{sorted:[]}};
  stateData[i]["1516"] = {in:{sorted:[]}, out:{sorted:[]}};
}

// Load state FIPS codes and names
d3.csv("fips.csv", function(data) {
  for (let i = 0; i < data.length; i++) {
    let id = parseInt(data[i].fips);
    stateFips.push(id);
    stateData[id]["name"] = data[i].name;
    stateData[id]["abrev"] = data[i].abrev;
  }
});

// Load in bound migration data from CSV
d3.csv("stateinflow1415.csv", function(data) {
  for (let i = 0; i < data.length; i++) {
    let s1 = parseInt(data[i].y1_statefips),
        s2 = parseInt(data[i].y2_statefips),
        n1 = parseInt(data[i].n1);
        n2 = parseInt(data[i].n2);
        agi = parseInt(data[i].AGI);

    // Create new object for second state if not exists
    if (!(s1 in stateData[s2]["1415"]["in"])) {
      stateData[s2]["1415"]["in"][s1] = {};
    }

    // Special cases to calculate more statistics
    // Population
    if (s1 === s2 || s1 === 97 || s1 === 98) {
      if ("population" in stateData[s2]) {
        stateData[s2]["1415"]["returns"] += n1;
        stateData[s2]["1415"]["population"] += n2;
        stateData[s2]["1415"]["agi"] += agi;
      }else {
        stateData[s2]["1415"]["returns"] = n1;
        stateData[s2]["1415"]["population"] = n2;
        stateData[s2]["1415"]["agi"] = agi;
      }
    }

    // Special case to skip overwriting FIPS = 97 because both 
    // same state and overall US use same FIPS in data!
    if (s1 === 97 && "n1" in stateData[s2]["1415"]["in"][s1]) continue;

    stateData[s2]["1415"]["in"][s1]["n1"] = n1;
    stateData[s2]["1415"]["in"][s1]["n2"] = n2;
    stateData[s2]["1415"]["in"][s1]["agi"] = agi;
    stateData[s2]["1415"]["in"]["sorted"].push([s1, n1]);
    // TODO: Compute and add total income, migration summaries, etc
  }
});

// Load out bound migration data from CSV
d3.csv("stateoutflow1415.csv", function(data) {
  for (let i = 0; i < data.length; i++) {
    let s1 = parseInt(data[i].y1_statefips),
        s2 = parseInt(data[i].y2_statefips),
        n1 = parseInt(data[i].n1);
        n2 = parseInt(data[i].n2);
        agi = parseInt(data[i].AGI);
    if (!(s2 in stateData[s1]["1415"]["out"])) {
      stateData[s1]["1415"]["out"][s2] = {};
    }

    // Special cases to calculate more statistics
    // Population
    if (s2 === 96) {
      stateData[s1]["1415"]["population"] -= n2;
      stateData[s1]["1415"]["returns"] -= n1;
      stateData[s1]["1415"]["agi"] -= agi;
    }

    // Special case to skip overwriting FIPS = 97 because both 
    // same state and overall US use same FIPS in data!
    if (s2 === 97 && "n1" in stateData[s1]["1415"]["out"][s2]) continue;

    stateData[s1]["1415"]["out"][s2]["n1"] = n1;
    stateData[s1]["1415"]["out"][s2]["n2"] = n2;
    stateData[s1]["1415"]["out"][s2]["agi"] = agi;
    stateData[s1]["1415"]["out"]["sorted"].push([s2, n1]);
    // TODO: Compute and add total income, migration summaries, etc
  }
});

// Load in bound migration data from CSV
d3.csv("stateinflow1516.csv", function(data) {
  for (let i = 0; i < data.length; i++) {
    let s1 = parseInt(data[i].y1_statefips),
        s2 = parseInt(data[i].y2_statefips),
        n1 = parseInt(data[i].n1);
        n2 = parseInt(data[i].n2);
        agi = parseInt(data[i].AGI);

    // Create new object for second state if not exists
    if (!(s1 in stateData[s2]["1516"]["in"])) {
      stateData[s2]["1516"]["in"][s1] = {};
    }

    // Special cases to calculate more statistics
    // Population
    if (s1 === s2 || s1 === 97 || s1 === 98) {
      if ("population" in stateData[s2]) {
        stateData[s2]["1516"]["returns"] += n1;
        stateData[s2]["1516"]["population"] += n2;
        stateData[s2]["1516"]["agi"] += agi;
      }else {
        stateData[s2]["1516"]["returns"] = n1;
        stateData[s2]["1516"]["population"] = n2;
        stateData[s2]["1516"]["agi"] = agi;
      }
    }

    // Special case to skip overwriting FIPS = 97 because both 
    // same state and overall US use same FIPS in data!
    if (s1 === 97 && "n1" in stateData[s2]["1516"]["in"][s1]) continue;

    stateData[s2]["1516"]["in"][s1]["n1"] = n1;
    stateData[s2]["1516"]["in"][s1]["n2"] = n2;
    stateData[s2]["1516"]["in"][s1]["agi"] = agi;
    stateData[s2]["1516"]["in"]["sorted"].push([s1, n1]);
    // TODO: Compute and add total income, migration summaries, etc
  }
});

// Load out bound migration data from CSV
d3.csv("stateoutflow1516.csv", function(data) {
  for (let i = 0; i < data.length; i++) {
    let s1 = parseInt(data[i].y1_statefips),
        s2 = parseInt(data[i].y2_statefips),
        n1 = parseInt(data[i].n1);
        n2 = parseInt(data[i].n2);
        agi = parseInt(data[i].AGI);
    if (!(s2 in stateData[s1]["1516"]["out"])) {
      stateData[s1]["1516"]["out"][s2] = {};
    }

    // Special cases to calculate more statistics
    // Population
    if (s2 === 96) {
      stateData[s1]["1516"]["population"] -= n2;
      stateData[s1]["1516"]["returns"] -= n1;
      stateData[s1]["1516"]["agi"] -= agi;
    }

    // Special case to skip overwriting FIPS = 97 because both 
    // same state and overall US use same FIPS in data!
    if (s2 === 97 && "n1" in stateData[s1]["1516"]["out"][s2]) continue;

    stateData[s1]["1516"]["out"][s2]["n1"] = n1;
    stateData[s1]["1516"]["out"][s2]["n2"] = n2;
    stateData[s1]["1516"]["out"][s2]["agi"] = agi;
    stateData[s1]["1516"]["out"]["sorted"].push([s2, n1]);
    // TODO: Compute and add total income, migration summaries, etc
  }
});

// Load US GeoJSON to draw map path
d3.json("states.json", function(error, json) {
  if (error) throw error;

  // Draw state
  g.selectAll("path")
      .data(json.features)
      .enter().append("path")
      .attr("d", path)
      .attr("id", function(d){return "path"+parseInt(d.id)})
      .attr("class", "feature")
      .attr("fill", function(d){
          let id = parseInt(d.id);
          return noneColorScale(id);
      })
      .on("click", onClickState);

  // Draw state text
  g.selectAll("text")
      .data(json.features)
      .enter().append("text")
      .attr("id", function(d){return "text"+parseInt(d.id)})
      .attr("font-size", "12px")
      .attr("pointer-events", "none")
      .attr("transform", function(d) {
           // TODO: Manually fix label positions
          let id = parseInt(d.id),
              b = path.bounds(d),
              x = (b[0][0] + b[1][0]) / 2 * scale + translate[0],
              y = (b[0][1] + b[1][1]) / 2 * scale + translate[1];
          stateData[id]["x"] = x;
          stateData[id]["y"] = y;
          return "translate(" + (x-12) + ", " + y + ")";
      })
      .text(function(d) {return stateData[parseInt(d.id)]["abrev"]});
});

// Functions -----------------------------------------------------------

// Event handler for clicking within a state
function onClickState() {
  if (firstActive !== null && firstActive.node() === this) {
    // Reset fully if clicking first selected state
    if (secondActive !== null) {
      secondActive.classed("second", false);
      secondActive = null;
    }
    firstActive.classed("first", false);
    firstActive = null;

  }else if (secondActive !== null && secondActive.node() === this) {
    // Reset second state if clicking second selected state
    secondActive.classed("second", false);
    secondActive = null;

  }else if (firstActive !== null && displayMode === "gen") {
    // Only allow one state to be selected, change selection
    firstActive.classed("first", false);
    firstActive = d3.select(this).classed("first", true);
    moveToFront(parseInt(firstActive.data()[0].id));

  }else if (firstActive !== null) {
    // First state selected, now select second state
    if (secondActive !== null) {
      secondActive.classed("second", false);
      secondActive = null;
    }
    secondActive = d3.select(this).classed("second", true);
    moveToFront(parseInt(secondActive.data()[0].id));
    moveToFront(parseInt(firstActive.data()[0].id));

  }else {
    firstActive = d3.select(this).classed("first", true);
    moveToFront(parseInt(firstActive.data()[0].id));
  }

  drawArrows();
  zoomToFocus();
  writeInfo();
}

// Move state path and its text label to front
function moveToFront(id) {
  var state = g.select("#path" + id);
  state.each(function(){
    this.parentNode.appendChild(this);
  });
  var label = g.select("#text" + id);
  label.each(function(){
    this.parentNode.appendChild(this);
  });
}

// Event handler for control buttons
function onClickControls(id) {
  if (id === "genButton" || id === "inButton" || id === "outButton") {
    // Reset display mode buttons
    for (let i = 0; i < displayModeTexts.length; i++) {
      displayModeTexts[i].attr("font-weight", "normal");
      displayModeButtons[i].classed("active", false);
    }
    // Set correct button on
    if (id === "genButton") {
      displayModeTexts[0].attr("font-weight", "bold");
      displayModeButtons[0].classed("active", true);
      displayMode = "gen";
      if (secondActive !== null) {
        secondActive.classed("second", false);
        secondActive = null;
      }
    }else if (id === "inButton") {
      displayModeTexts[1].attr("font-weight", "bold");
      displayModeButtons[1].classed("active", true);
      displayMode = "in";
    }else if (id === "outButton") {
      displayModeTexts[2].attr("font-weight", "bold");
      displayModeButtons[2].classed("active", true);
      displayMode = "out";
    }
    drawArrows();
    zoomToFocus();
    writeInfo();
  }else if (id === "noneButton" || id === "popButton" || 
            id === "deltaButton" || id === "incomeButton") {
    // Reset color scheme buttons
    for (let i = 0; i < colorSchemeTexts.length; i++) {
      colorSchemeTexts[i].attr("font-weight", "normal");
      colorSchemeButtons[i].classed("active", false);
    }
    // Set correct button on
    if (id === "noneButton") {
      colorSchemeTexts[0].attr("font-weight", "bold");
      colorSchemeButtons[0].classed("active", true);
      colorScheme = "none";
    }else if (id === "popButton") {
      colorSchemeTexts[1].attr("font-weight", "bold");
      colorSchemeButtons[1].classed("active", true);
      colorScheme = "pop";
    }else if (id === "deltaButton") {
      colorSchemeTexts[2].attr("font-weight", "bold");
      colorSchemeButtons[2].classed("active", true);
      colorScheme = "delta";
    }else if (id === "incomeButton") {
      colorSchemeTexts[3].attr("font-weight", "bold");
      colorSchemeButtons[3].classed("active", true);
      colorScheme = "income";
    }
    fillColors();
  }
}

// Change year selection
function onYearsSelect() {
  var selectedIndex = selectOptions.property("selectedIndex"),
      selectedYears = selectData[0][selectedIndex].__data__;
  if (selectedYears === "2014-2015") {
    years = "1415";
  }else if (selectedYears === "2015-2016") {
    years = "1516";
  }
  drawArrows();
  zoomToFocus();
  fillColors();
  writeInfo();
}

// Draw any arrows depending on state selection
function drawArrows() {
  // Remove existing arrows
  g.selectAll("g").remove();

  if (firstActive === null) {
    // Return early if somehow nothing is selected
    return;
  }else if (firstActive !== null && secondActive !== null) {
    // Both selected, draw one arrow
    var s1 = parseInt(firstActive.data()[0].id),
        s2 = parseInt(secondActive.data()[0].id),
        x1 = stateData[s1]["x"],
        y1 = stateData[s1]["y"],
        x2 = stateData[s2]["x"],
        y2 = stateData[s2]["y"];

    // Flip order depending on displayMode
    if (displayMode === "in") {
      x1 = stateData[s2]["x"],
      y1 = stateData[s2]["y"],
      x2 = stateData[s1]["x"],
      y2 = stateData[s1]["y"];
    }

    // Draw arrow
    g.append("g").append("path")
        .attr("d", computeBezier(x1, y1, x2, y2))
        .attr("class", "arrow")
        .attr("opacity", 0)
        .attr("marker-start", "url(#circleMarker)")
        .attr("marker-end", "url(#arrowMarker)")
        .transition()
            .duration(500)
            .attr("opacity", 0.8);

  }else if (displayMode !== "gen") {
    // Only one state selected, not general display mode
    var k = 0,
        s1 = parseInt(firstActive.data()[0].id);
    for (let i = 0; i < stateData[s1][years][displayMode]["sorted"].length; i++) {
      // Break loop at 5 results
      if (k >= 5) break;

      // Skip non-state FIPS and skip self
      if (!(stateData[s1][years][displayMode]["sorted"][i][0] in stateFips) ||
        stateData[s1][years][displayMode]["sorted"][i][0] === s1) continue;

      // Get state centers 
      let s2 = stateData[s1][years][displayMode]["sorted"][i][0],
          x1 = stateData[s1]["x"],
          y1 = stateData[s1]["y"],
          x2 = stateData[s2]["x"],
          y2 = stateData[s2]["y"];

      // Flip order depending on displayMode
      if (displayMode === "in") {
        x1 = stateData[s2]["x"],
        y1 = stateData[s2]["y"],
        x2 = stateData[s1]["x"],
        y2 = stateData[s1]["y"];
      }

      // Draw lines
      g.append("g").append("path")
        .attr("d", computeBezier(x1, y1, x2, y2))
        .attr("class", "arrow")
        .attr("opacity", 0)
        .attr("marker-start", "url(#circleMarker)")
        .attr("marker-end", "url(#arrowMarker)")
        .transition()
            .duration(500)
            .attr("opacity", 0.8);
      
      // Increment results
      k++;
    }
  }
}

// Pan and zoom to current focus
function zoomToFocus() {
  var polygon = null;
  if (firstActive === null) {
    // Return early if somehow nothing is selected
    //return reset();

  }else if (firstActive !== null && secondActive !== null) {
    // Two states selected, draw arrow between first and second
    // Get bounding boxes for both states
    var bounds = path.bounds(firstActive.data()[0]),
        secondBounds = path.bounds(secondActive.data()[0]);

    // Get overall bounding box values
    bounds[0][0] = Math.min(bounds[0][0], secondBounds[0][0]);
    bounds[0][1] = Math.min(bounds[0][1], secondBounds[0][1]);
    bounds[1][0] = Math.max(bounds[1][0], secondBounds[1][0]);
    bounds[1][1] = Math.max(bounds[1][1], secondBounds[1][1]);

    zoomToBounds(bounds);

  }else if (displayMode !== "gen") {
    // One state selected, draw arrows to top 5 migrated states
    // Get first state bounding box and id to get top 5 migrated states
    var bounds = path.bounds(firstActive.data()[0]);
        s1 = parseInt(firstActive.data()[0].id);
        k = 0;

    for (let i = 0; i < stateData[s1][years][displayMode]["sorted"].length; i++) {
      // Break loop at 5 results
      if (k >= 5) break;

      // Skip non-state FIPS and skip self
      if (!(stateData[s1][years][displayMode]["sorted"][i][0] in stateFips) ||
        stateData[s1][years][displayMode]["sorted"][i][0] === s1) continue;

      // Get bounding box for second state
      let s2 = stateData[s1][years][displayMode]["sorted"][i][0],
          s2Feature = g.selectAll("path")
              .filter(function(d) {
                  if (d === undefined) return false;
                  return s2 == d.id;
              })
              .data()[0],
          s2Bounds = path.bounds(s2Feature);

      // Get overall bounding box values
      bounds[0][0] = Math.min(bounds[0][0], s2Bounds[0][0]);
      bounds[0][1] = Math.min(bounds[0][1], s2Bounds[0][1]);
      bounds[1][0] = Math.max(bounds[1][0], s2Bounds[1][0]);
      bounds[1][1] = Math.max(bounds[1][1], s2Bounds[1][1]);
        
      // Increment results
      k++;
    }
    zoomToBounds(bounds);
  }   
}

// Update color scheme
function fillColors() {
  var fillFunction = null;

  if (colorScheme === "none") {
    fillFunction = function(d) {
      let id = parseInt(d.id);
      return noneColorScale(id);
    }
  }else if (colorScheme === "pop") {
    fillFunction = function(d) {
      let id = parseInt(d.id),
          pop = stateData[id][years]["population"];
      return popColorScale(pop);
    }
  }else if (colorScheme === "delta") {
    fillFunction = function(d) {
      let id = parseInt(d.id),
          popIn = stateData[id][years]["in"][96]["n2"],
          popOut = stateData[id][years]["out"][96]["n2"];
          console.log(id + ": " + (popIn-popOut));
      return deltaColorScale(popIn - popOut);
    }
  }else if (colorScheme === "income") {
    fillFunction = function(d) {
      let id = parseInt(d.id),
          agi = stateData[id][years]["agi"],
          returns = stateData[id][years]["returns"];
      return incomeColorScale(agi / returns * 1000);
    }
  }

  g.selectAll(".feature")
      .attr("fill", fillFunction);
}

// Update information text box
function writeInfo() {
  // Remove old table rows
  infoTableHeader.selectAll("tr").remove();
  infoTableBody.selectAll("tr").remove();

  if (firstActive !== null && secondActive !== null) {
    // Both states selected
    // Get and set names text
    var s1 = parseInt(firstActive.data()[0].id),
        s2 = parseInt(secondActive.data()[0].id),
        name1 = stateData[s1]["name"],
        name2 = stateData[s2]["name"],
        abrev1 = stateData[s1]["abrev"],
        abrev2 = stateData[s2]["abrev"];

    if (displayMode === "in") {
      infoText.text(name2 + " to " + name1);
    }else if (displayMode === "out") {
      infoText.text(name1 + " to " + name2);
    }

    // Write column headers
    infoTableHeader.append("tr")
        .selectAll("th")
        .data(["", abrev1, abrev2])
        .enter()
        .append("th")
        .text(function(d) {return d});

    var row = infoTableBody.append("tr");
    row.append("td").text("FIPS");
    row.append("td").text(s1);
    row.append("td").text(s2);
    row = infoTableBody.append("tr");
    row.append("td").text("Pop.");
    row.append("td").text(stateData[s1][years]["population"].toLocaleString("en"));
    row.append("td").text(stateData[s2][years]["population"].toLocaleString("en"));

    // TODO: show comparisons between states

  }else if (firstActive !== null && displayMode === "gen") {
    // One state selected, general info

    // Get and set name text
    var id = parseInt(firstActive.data()[0].id),
        name = stateData[id]["name"];

    infoText.text(name);

    infoTableHeader.append("tr")
        .append("th")
        .attr("colspan", 2)
        .text("General Info");
    
    var id = parseInt(firstActive.data()[0].id);
    var row = infoTableBody.append("tr");
    row.append("td").text("FIPS code");
    row.append("td").text(id);
    row = infoTableBody.append("tr");
    row.append("td").text("Population");
    row.append("td").text(stateData[id][years]["population"].toLocaleString("en"));
    row = infoTableBody.append("tr");
    row.append("td").text("# of tax returns");
    row.append("td").text(stateData[id][years]["returns"].toLocaleString("en"));
    row = infoTableBody.append("tr");
    var income = stateData[id][years]["agi"]/stateData[id][years]["returns"]*1000;
    row.append("td").text("Avg. income per return");
    row.append("td").text("$"+Math.floor(income).toLocaleString("en"));
    row = infoTableBody.append("tr");
    row.append("td").text("Out migration");
    row.append("td").text(stateData[id][years]["out"][97]["n2"].toLocaleString("en"));
    row = infoTableBody.append("tr");
    row.append("td").text("In migration");
    row.append("td").text(stateData[id][years]["in"][97]["n2"].toLocaleString("en"));

    // TODO: show more state general info

  }else if (firstActive !== null) {
    // One state selected, in or out
    // Get state id, name, and direction
    var s1 = parseInt(firstActive.data()[0].id),
        name = stateData[s1]["name"],
        direction = displayMode === "in" ? " Inbound" : " Outbound";

    infoText.text(name + direction);

    // Choose column headers based on display mode
    var columns;
    if (displayMode === "in") {
      columns = ["Source", "# of people"];
    }else if (displayMode === "out") {
      columns = ["Destination", "# of people"];
    }

    // Write column headers
    infoTableHeader.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function(d) {return d});

    // Populate table rows
    for (let i = 0; i < stateData[s1][years][displayMode]["sorted"].length; i++) {

      // Skip non-state FIPS and skip self
      if (!(stateData[s1][years][displayMode]["sorted"][i][0] in stateFips) ||
        stateData[s1][years][displayMode]["sorted"][i][0] === s1) continue;

      // Get state name and migration total
      let name = stateData[stateData[s1][years][displayMode]["sorted"][i][0]]["name"],
          migrants = stateData[s1][years][displayMode]["sorted"][i][1];

      // No migrants, skip
      if (migrants < 0) continue;

      // Make row
      let row = infoTableBody.append("tr");
      row.append("td").text(name);
      row.append("td").text(migrants.toLocaleString("en"));
    }

  }else {
    // No states selected
    infoText.text("");
    // TODO: maybe print some summary info?
  }
}

function getStatePath(id) {
  // Get all paths with id
  var paths = g.selectAll("path")
      .filter(function(d) {
          if (d === undefined) return false;
          return id == d.id;
      });

  // Check for path found, return if none
  if (paths.length < 1) return undefined;
      
  // Return state path
  return paths[0];
}

function computeBezier(x1, y1, x2, y2) {
  // Decide curve distance based on points distance
  var dist = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)),
      r = dist / 10;

  // Compute line midpoint m
  var mx = x1 + (x2 - x1) / 2,
      my = y1 + (y2 - y1) / 2;

  // Compute control point for curve
  var dx = x2 - x1,
      dy = y2 - y1,
      angle = Math.atan(dy / dx),
      cosAngle = Math.cos(angle),
      sinAngle = Math.cos(angle),
      cx = mx - sinAngle * r;
      cy = my - cosAngle * r;

  // Return Bezier curve path string
  return "M" + x1 + "," + y1 +
         "Q" + cx + "," + cy +
         " " + x2 + "," + y2;
}

function zoomToBounds(bounds) {
  // Compute scale and translate to focus on overall bounding box
  var dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  // Translate and scale to zoom into state smoothly with duration
  svg.transition()
      .duration(750)
      .call(zoom.translate(translate).scale(scale).event);
}

// Turn off highlighting reset zoom
function reset() {
  if (firstActive !== null) {
    firstActive.classed("first", false);
    firstActive = null;
  }
  if (secondActive !== null) {
    secondActive.classed("second", false);
    secondActive = null;
  }

  // Delete all drawn arrows
  g.selectAll("g").remove();

  // Reset zoom
  svg.transition()
      .duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
}

// Zoom behavior
function zoomed() {
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

