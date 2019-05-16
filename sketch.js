// Authors: Dishen Zhao, Ning Shi

// TODO: Commenting and code cleanup

// Variables and setup -------------------------------------------------

// Global data variables
var displayMode = "gen",
    colorScheme = "none",
    years = "1516",
    stateFips = [],
    stateData = {},
    summaryData = {},
    firstActive = null,
    secondActive = null,
    disclaimer = "Data presented is taken from US tax return data. \
      Population is estimated from number of personal tax exemptions. \
      Average income is generalized from income per of tax returns. It \
      is unknown which state a tax payer earned their income. Migration \
      is shown by filing address changing from year to year on tax \
      return.";

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
var path = d3.geo.path().projection(projection);

// Build HTML and SVG elements -----------------------------------------

// Set up main canvas SVG (Scalable Vector Graphics)
var svg = d3.select("#canvas").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", function() {
      if (d3.event.defaultPrevented) d3.event.stopPropagation();
    }, true)
    .on("contextmenu", function() {
      d3.event.preventDefault();
      reset();
    });

// Draw SVG background
svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

// Create inner SVG element to apply transformations on
var g = svg.append("g");

// Text for display modes
var displayModeText = d3.select("#controls")
    .append("text")
    .attr("class", "controls-title")
    .text("Display Mode");

// Div box to contain display mode options
var displayModeDiv = d3.select("#controls")
    .append("div")
    .attr("id", "ops")
    .style("width", "100%")
    .style("height", "150px")
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
    .on("click", function() {onClickControls("genButton")})
);

// Text for inbound migration
displayModeTexts.push(displayModeSvg.append("text")
    .attr("x", 48)
    .attr("y", 80)
    .text("Immigration")
    .on("click", function() {onClickControls("outButton")})
);

// Text for outbound migration
displayModeTexts.push(displayModeSvg.append("text")
    .attr("x", 48)
    .attr("y", 117)
    .text("Emigration")
    .on("click", function() {onClickControls("outButton")})
);

// Button for general information
displayModeButtons.push(displayModeSvg.append("circle")
    .attr("id", "genButton")
    .attr("cx", 25)
    .attr("cy", 37)
    .attr("r", 12)
    .attr("class", "button")
    .classed("active", true)
    .on("click", function() {onClickControls("genButton")})
);

// Button for inbound migration
displayModeButtons.push(displayModeSvg.append("circle")
    .attr("id", "inButton")
    .attr("cx", 25)
    .attr("cy", 75)
    .attr("r", 12)
    .attr("class", "button")
    .on("click", function() {onClickControls("inButton")})
);

// Button for outbound migration
displayModeButtons.push(displayModeSvg.append("circle")
    .attr("id", "outButton")
    .attr("cx", 25)
    .attr("cy", 112)
    .attr("r", 12)
    .attr("class", "button")
    .on("click", function() {onClickControls("outButton")})
);

// Text for color scheme options 
var colorSchemeText = d3.select("#controls")
    .append("text")
    .attr("class", "controls-title")
    .text("Color Scheme");

// Div for color scheme
var colorSchemeDiv = d3.select("#controls")
    .append("div")
    .attr("id", "filters")
    .style("width", "100%")
    .style("height", "150px")
    .style("margin-top", "10px")
    .style("margin-bottom", "10px")
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
    .text("Basic")
    .on("click", function() {onClickControls("noneButton")})
);

// Text for population color scheme
colorSchemeTexts.push(colorSchemeSvg.append("text")
    .attr("x", 48)
    .attr("y", 62)
    .text("Population")
    .on("click", function() {onClickControls("popButton")})
);

// Text for migration delta color scheme
colorSchemeTexts.push(colorSchemeSvg.append("text")
    .attr("x", 48)
    .attr("y", 99)
    .text("Migration Delta")
    .on("click", function() {onClickControls("deltaButton")})
);

// Text for income color scheme
colorSchemeTexts.push(colorSchemeSvg.append("text")
    .attr("x", 48)
    .attr("y", 135)
    .text("Income")
    .on("click", function() {onClickControls("incomeButton")})
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
    .attr("class", "controls-title")
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
    .data(["2014-2015", "2013-2014"])
    .enter()
    .append("option")
        .text(function(d){return d;});

// Text for info box
var infoText = d3.select("#controls")
    .append("text")
    .attr("class", "controls-title")
    .text("Disclaimer");

// Div for info box left side
var infoDiv = d3.select("#controls")
    .append("div")
    .attr("id", "infoDiv")
    .style("width", "100%")
    .style("height", "250px")
    .style("overflow-y", "scroll")

// Div for info box left side
var infoTable = infoDiv.append("table")
        .attr("width", "100%")
        .attr("border", "1px")
        .style("border-collapse", "collapse");
var infoTableHeader = infoTable.append("thead"),
    infoTableBody = infoTable.append("tbody");

infoTableBody.append("tr").text(disclaimer);

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

// Pastel color scale
var noneColorScale = d3.scale.ordinal()
    .domain([1, 56])
    .range(colorbrewer.Pastel1[9]);

// Population color scale
var popColorScale = d3.scale.linear()
    .domain([500000, 35000000])
    .range(["#DFFBFF", "#006370"]);

// Population color gradient
var popGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "popGradient")
    .attr("x2", "0%")
    .attr("y1", "100%")
    .selectAll("stop")
      .data(scaleToGradient(popColorScale))
      .enter()
      .append("stop")
      .attr("offset", function(d){return d.offset})
      .attr("stop-color", function(d){return d.color});

// Migration delta color scale
var deltaColorScale = d3.scale.linear()
    .domain([-200000, 0, 200000])
    .range(["#C23B22", "#FDFD96", "#03C03C"]);

// Migration delta color gradient
var deltaGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "deltaGradient")
    .attr("x2", "0%")
    .attr("y1", "100%")
    .selectAll("stop")
      .data(scaleToGradient(deltaColorScale))
      .enter()
      .append("stop")
      .attr("offset", function(d){return d.offset})
      .attr("stop-color", function(d){return d.color});

// Income color scale
var incomeColorScale = d3.scale.linear()
    .domain([50000, 110000])
    .range(["#DFFFDF", "#008000"]);

// Income color gradient
var incomeGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "incomeGradient")
    .attr("x2", "0%")
    .attr("y1", "100%")
    .selectAll("stop")
      .data(scaleToGradient(incomeColorScale))
      .enter()
      .append("stop")
      .attr("offset", function(d){return d.offset})
      .attr("stop-color", function(d){return d.color});

// Define zoom behavior in function
var zoom = d3.behavior.zoom()
    .scaleExtent([1,8])
    .on("zoom", function(){
      g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    });    

// Turn zoom listener on, disable default double click zoom
svg.call(zoom).on("dblclick.zoom", null);
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
    var id = parseInt(data[i].fips);
    stateFips.push(id);
    stateData[id]["name"] = data[i].name;
    stateData[id]["abrev"] = data[i].abrev;
    stateData[id]["x"] = parseInt(data[i].x);
    stateData[id]["y"] = parseInt(data[i].y);
  }
});

// Load in bound migration data from CSV
d3.csv("stateinflow1415.csv", function(data) {
  summaryData["1415"] = {population:[], delta:[], income:[]};
  for (let i = 0; i < data.length; i++) {
    var s1 = parseInt(data[i].y1_statefips),
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
      if ("population" in stateData[s2]["1415"]) {
        stateData[s2]["1415"]["returns"] += n1;
        stateData[s2]["1415"]["population"] += n2;
        stateData[s2]["1415"]["agi"] += agi;
      }else {
        stateData[s2]["1415"]["returns"] = n1;
        stateData[s2]["1415"]["population"] = n2;
        stateData[s2]["1415"]["agi"] = agi;
      }
    }

    // Special case to avoid overwriting FIPS = 97 because both 
    // same state and overall US use same FIPS in data!
    if (s1 === 97 && "n1" in stateData[s2]["1415"]["in"][s1]) {
      s1 = 99;
      stateData[s2]["1415"]["in"][s1] = {};
    }

    stateData[s2]["1415"]["in"][s1]["n1"] = n1;
    stateData[s2]["1415"]["in"][s1]["n2"] = n2;
    stateData[s2]["1415"]["in"][s1]["agi"] = agi;
    stateData[s2]["1415"]["in"]["sorted"].push([s1, n1]);
  }
});

// Load out bound migration data from CSV
d3.csv("stateoutflow1415.csv", function(data) {
  for (let i = 0; i < data.length; i++) {
    var s1 = parseInt(data[i].y1_statefips),
        s2 = parseInt(data[i].y2_statefips),
        n1 = parseInt(data[i].n1);
        n2 = parseInt(data[i].n2);
        agi = parseInt(data[i].AGI);
    if (!(s2 in stateData[s1]["1415"]["out"])) {
      stateData[s1]["1415"]["out"][s2] = {};
    }

    // Special case to avoid overwriting FIPS = 97 because both 
    // same state and overall US use same FIPS in data!
    if (s2 === 97 && "n1" in stateData[s1]["1415"]["out"][s2]) {
      s2 = 99;
      stateData[s1]["1415"]["out"][s2] = {};
    }

    stateData[s1]["1415"]["out"][s2]["n1"] = n1;
    stateData[s1]["1415"]["out"][s2]["n2"] = n2;
    stateData[s1]["1415"]["out"][s2]["agi"] = agi;
    stateData[s1]["1415"]["out"]["sorted"].push([s2, n1]);
  }
});

// Load in bound migration data from CSV
d3.csv("stateinflow1516.csv", function(data) {
  summaryData["1516"] = {population:[], delta:[], income:[]};
  for (let i = 0; i < data.length; i++) {
    var s1 = parseInt(data[i].y1_statefips),
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
      if ("population" in stateData[s2]["1516"]) {
        stateData[s2]["1516"]["returns"] += n1;
        stateData[s2]["1516"]["population"] += n2;
        stateData[s2]["1516"]["agi"] += agi;
      }else {
        stateData[s2]["1516"]["returns"] = n1;
        stateData[s2]["1516"]["population"] = n2;
        stateData[s2]["1516"]["agi"] = agi;
      }
    }

    // Special case to avoid overwriting FIPS = 97 because both 
    // same state and overall US use same FIPS in data!
    if (s1 === 97 && "n1" in stateData[s2]["1516"]["in"][s1]) {
      s1 = 99;
      stateData[s2]["1516"]["in"][s1] = {};
    }

    stateData[s2]["1516"]["in"][s1]["n1"] = n1;
    stateData[s2]["1516"]["in"][s1]["n2"] = n2;
    stateData[s2]["1516"]["in"][s1]["agi"] = agi;
    stateData[s2]["1516"]["in"]["sorted"].push([s1, n1]);
  }
});

// Load out bound migration data from CSV
d3.csv("stateoutflow1516.csv", function(data) {
  for (let i = 0; i < data.length; i++) {
    var s1 = parseInt(data[i].y1_statefips),
        s2 = parseInt(data[i].y2_statefips),
        n1 = parseInt(data[i].n1);
        n2 = parseInt(data[i].n2);
        agi = parseInt(data[i].AGI);
    if (!(s2 in stateData[s1]["1516"]["out"])) {
      stateData[s1]["1516"]["out"][s2] = {};
    }

    // Special case to avoid overwriting FIPS = 97 because both 
    // same state and overall US use same FIPS in data!
    if (s2 === 97 && "n1" in stateData[s1]["1516"]["out"][s2]) {
      s2 = 99;
      stateData[s1]["1516"]["out"][s2] = {};
    }

    stateData[s1]["1516"]["out"][s2]["n1"] = n1;
    stateData[s1]["1516"]["out"][s2]["n2"] = n2;
    stateData[s1]["1516"]["out"][s2]["agi"] = agi;
    stateData[s1]["1516"]["out"]["sorted"].push([s2, n1]);
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
          var id = parseInt(d.id);
          return noneColorScale(id);
      })
      .on("click", onClickState);

  // Draw state text, make it clickable
  g.selectAll("text")
      .data(json.features)
      .enter().append("text")
      .attr("id", function(d){return "text"+parseInt(d.id)})
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
          var id = parseInt(d.id);
          return "translate(" + stateData[id]["x"] + ", " + stateData[id]["y"] + ")";
      })
      .text(function(d) {return stateData[parseInt(d.id)]["abrev"]})
      .on("mouseover", function() {d3.select(this).style("cursor", "pointer")})
      .on("click", function() {
        var id = "#path" + this.id.substring(4,6),
            state = g.select(id).node();
        onClickState.call(state);
      });

  // Draw box around alaska
  var alaska = path.bounds(g.select("#path2").data()[0]);
  g.append("rect")
      .attr("width", alaska[1][0] - alaska[0][0] + 10)
      .attr("height", alaska[1][1] - alaska[0][1] + 10)
      .attr("x", alaska[0][0] - 5)
      .attr("y", alaska[0][1] - 5)
      .style("stroke-width", 2)
      .style("stroke", "black")
      .style("fill", "none");

  // Draw box around hawaii
  var hawaii = path.bounds(g.select("#path15").data()[0]);
  g.append("rect")
      .attr("width", hawaii[1][0] - hawaii[0][0] + 10)
      .attr("height", hawaii[1][1] - hawaii[0][1] + 10)
      .attr("x", hawaii[0][0] - 5)
      .attr("y", hawaii[0][1] - 5)
      .style("stroke-width", 2)
      .style("stroke", "black")
      .style("fill", "none");
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
    // First state selected, now select second state
    if (secondActive !== null) {
      secondActive.classed("second", false);
      secondActive = null;
    }
    secondActive = d3.select(this).classed("second", true);
    moveToFront(parseInt(secondActive.data()[0].id));
    moveToFront(parseInt(firstActive.data()[0].id));
    
  }else if (firstActive !== null) {
    // Only allow one state to be selected, change selection
    firstActive.classed("first", false);
    firstActive = d3.select(this).classed("first", true);
    moveToFront(parseInt(firstActive.data()[0].id));

  }else {
    // Select first state
    firstActive = d3.select(this).classed("first", true);
    moveToFront(parseInt(firstActive.data()[0].id));
  }

  drawArrows();
  zoomToFocus();
  writeInfo();
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
    }else if (id === "inButton") {
      displayModeTexts[1].attr("font-weight", "bold");
      displayModeButtons[1].classed("active", true);
      displayMode = "in";
      if (secondActive !== null) {
        secondActive.classed("second", false);
        secondActive = null;
      }
    }else if (id === "outButton") {
      displayModeTexts[2].attr("font-weight", "bold");
      displayModeButtons[2].classed("active", true);
      displayMode = "out";
      if (secondActive !== null) {
        secondActive.classed("second", false);
        secondActive = null;
      }
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
    // Remove old legend
    svg.select("#legend").remove();
    // Set correct button on
    if (id === "noneButton") {
      colorSchemeTexts[0].attr("font-weight", "bold");
      colorSchemeButtons[0].classed("active", true);
      colorScheme = "none";
    }else if (id === "popButton") {
      colorSchemeTexts[1].attr("font-weight", "bold");
      colorSchemeButtons[1].classed("active", true);
      colorScheme = "pop";
      drawLegend(popColorScale, "popGradient");

    }else if (id === "deltaButton") {
      colorSchemeTexts[2].attr("font-weight", "bold");
      colorSchemeButtons[2].classed("active", true);
      colorScheme = "delta";
      drawLegend(deltaColorScale, "deltaGradient");

    }else if (id === "incomeButton") {
      colorSchemeTexts[3].attr("font-weight", "bold");
      colorSchemeButtons[3].classed("active", true);
      colorScheme = "income";
      drawLegend(incomeColorScale, "incomeGradient");
    }
    fillColors();
    writeInfo();
  }
}

// Change year selection
function onYearsSelect() {
  var selectedIndex = selectOptions.property("selectedIndex"),
      selectedYears = selectData[0][selectedIndex].__data__;
  if (selectedYears === "2014-2015") {
    years = "1516";
  }else if (selectedYears === "2013-2014") {
    years = "1415";
  }
  drawArrows();
  zoomToFocus();
  fillColors();
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
        .attr("marker-end", "url(#circleMarker)")
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
      var s2 = stateData[s1][years][displayMode]["sorted"][i][0],
          x1 = stateData[s1]["x"],
          y1 = stateData[s1]["y"],
          x2 = stateData[s2]["x"],
          y2 = stateData[s2]["y"];

      // Flip order depending on displayMode
      if (displayMode === "in") {
        x1 = stateData[s2]["x"];
        y1 = stateData[s2]["y"];
        x2 = stateData[s1]["x"];
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

// Draw color gradient legend
function drawLegend(scale, gradient) {
  // Prepare to calculate incremental tick values to print out
  var domain = scale.domain(),
      min = domain[0],
      max = domain[domain.length-1],
      delta = max - min;

  // Create new svg group
  legend = svg.append("g")
      .attr("id", "legend")
      .style("pointer-events", "none");

  // Legend background, low opacity
  legend.append("rect")
      .attr("x", 10)
      .attr("y", 490)
      .attr("width", 120)
      .attr("height", 220)
      .attr("fill", "#EEEEEE")
      .attr("opacity", 0.3)

  // Legend gradient, fill with previously created gradients
  legend.append("rect")
      .attr("x", 20)
      .attr("y", 500)
      .attr("width", 20)
      .attr("height", 200)
      .attr("fill", "url(#"+gradient+")")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

  // Top tick, maximum value
  legend.append("line")
      .attr("x1", 15)
      .attr("y1", 500)
      .attr("x2", 45)
      .attr("y2", 500)
      .attr("stroke", "black")
      .attr("stroke-width", 1);

  legend.append("text")
      .attr("x", 50)
      .attr("y", 505)
      .text(max.toLocaleString());

  // Second tick, 75% value
  legend.append("line")
      .attr("x1", 15)
      .attr("y1", 550)
      .attr("x2", 45)
      .attr("y2", 550)
      .attr("stroke", "black")
      .attr("stroke-width", 1);

  legend.append("text")
      .attr("x", 50)
      .attr("y", 555)
      .text((min + delta * 0.75).toLocaleString());

  // Third tick, 50% value
  legend.append("line")
      .attr("x1", 15)
      .attr("y1", 600)
      .attr("x2", 45)
      .attr("y2", 600)
      .attr("stroke", "black")
      .attr("stroke-width", 1);

  legend.append("text")
      .attr("x", 50)
      .attr("y", 605)
      .text((min + delta * 0.5).toLocaleString());

  // Fourth tick, 25% value
  legend.append("line")
      .attr("x1", 15)
      .attr("y1", 650)
      .attr("x2", 45)
      .attr("y2", 650)
      .attr("stroke", "black")
      .attr("stroke-width", 1);

  legend.append("text")
      .attr("x", 50)
      .attr("y", 655)
      .text((min + delta * 0.25).toLocaleString());

  // Bottom tick, minimum value
  legend.append("line")
      .attr("x1", 15)
      .attr("y1", 700)
      .attr("x2", 45)
      .attr("y2", 700)
      .attr("stroke", "black")
      .attr("stroke-width", 1);

  legend.append("text")
      .attr("x", 50)
      .attr("y", 705)
      .text(min.toLocaleString());
}

// Pan and zoom to current focused state(s)
function zoomToFocus() {
  if (firstActive === null) {
    // Return early if nothing is selected
    return;

  }else if (firstActive !== null && secondActive !== null) {
    // Two states selected
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
    // One state selected
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
      var s2 = stateData[s1][years][displayMode]["sorted"][i][0],
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
      var id = parseInt(d.id);
      return noneColorScale(id);
    }
  }else if (colorScheme === "pop") {
    fillFunction = function(d) {
      var id = parseInt(d.id),
          pop = stateData[id][years]["population"];
      return popColorScale(pop);
    }
  }else if (colorScheme === "delta") {
    fillFunction = function(d) {
      var id = parseInt(d.id),
          popIn = stateData[id][years]["in"][96]["n2"],
          popOut = stateData[id][years]["out"][96]["n2"];
      return deltaColorScale(popIn - popOut);
    }
  }else if (colorScheme === "income") {
    fillFunction = function(d) {
      var id = parseInt(d.id),
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

    infoText.text(name1 + " and " + name2);

    // Write column headers
    infoTableHeader.selectAll("tr")
        .data([["Comparison"], [abrev1, abrev2]])
        .enter()
        .append("tr")
            .selectAll("th")
            .data(function(d){return d})
            .enter()
            .append("th")
            .attr("colspan", function(){
              return 3 - d3.select(this.parentNode).datum().length;
            })
            .text(function(d) {return d});

    // Get all info needed for table rows
    var population = stateData[s1][years]["population"].toLocaleString("en"),
        population2 = stateData[s2][years]["population"].toLocaleString("en"),
        returns = stateData[s1][years]["returns"].toLocaleString("en"),
        returns2 = stateData[s2][years]["returns"].toLocaleString("en"),
        stateIn = stateData[s1][years]["in"][97]["n2"].toLocaleString("en"),
        stateIn2 = stateData[s2][years]["in"][97]["n2"].toLocaleString("en"),
        stateOut = stateData[s1][years]["out"][97]["n2"].toLocaleString("en"),
        stateOut2 = stateData[s2][years]["out"][97]["n2"].toLocaleString("en"),
        foreignIn = stateData[s1][years]["in"][98]["n2"].toLocaleString("en"),
        foreignIn2 = stateData[s2][years]["in"][98]["n2"].toLocaleString("en"),
        foreignOut = stateData[s1][years]["out"][98]["n2"].toLocaleString("en"),
        foreignOut2 = stateData[s2][years]["out"][98]["n2"].toLocaleString("en"),
        income = stateData[s1][years]["agi"]/stateData[s1][years]["returns"]*1000,
        income2 = stateData[s2][years]["agi"]/stateData[s2][years]["returns"]*1000,
        incomeString = "$"+Math.floor(income).toLocaleString("en"),
        incomeString2 = "$"+Math.floor(income2).toLocaleString("en"),
        popIn = stateData[s1][years]["in"][96]["n2"],
        popIn2 = stateData[s2][years]["in"][96]["n2"],
        popOut = stateData[s1][years]["out"][96]["n2"],
        popOut2 = stateData[s2][years]["out"][96]["n2"],
        delta = popIn - popOut,
        delta2 = popIn2 - popOut2,
        deltaString = delta > 0 ? 
                "+"+delta.toLocaleString("en") : 
                delta.toLocaleString("en"),
        deltaString2 = delta2 > 0 ? 
                "+"+delta2.toLocaleString("en") : 
                delta2.toLocaleString("en"),
        non = stateData[s1][years]["in"][s1]["n2"].toLocaleString("en"),
        non2 = stateData[s2][years]["in"][s2]["n2"].toLocaleString("en");

    // Put info a data list for D3 entry
    var compareInfoList = [
        ["FIPS Code"], 
        [s1, s2],
        ["Population"], 
        [population, population2],
        ["Tax Returns"], 
        [returns, returns2],
        ["Average Income"], 
        [incomeString, incomeString2],
        ["State Immigrants"], 
        [stateIn, stateIn2],
        ["State Emigrants"], 
        [stateOut, stateOut2],
        ["Foreign Immigrants"], 
        [foreignIn, foreignIn2],
        ["Foreign Emigrants"], 
        [foreignOut, foreignOut2],
        ["Population Change"], 
        [deltaString, deltaString2],
        ["Non-migrants"], 
        [non, non2]];

    // Write rows
    infoTableBody.selectAll("tr")
        .data(compareInfoList)
        .enter()
        .append("tr")
            .selectAll("td")
            .data(function(d){return d})
            .enter()
            .append("td")
            .attr("colspan", function(){
              return 3 - d3.select(this.parentNode).datum().length;
            })
            .text(function(d) {return d});

  }else if (firstActive !== null && displayMode === "gen") {
    // One state selected, general info

    // Get and set name text as title
    var id = parseInt(firstActive.data()[0].id),
        name = stateData[id]["name"];

    infoText.text(name);

    // Set table header
    infoTableHeader.append("tr")
        .append("th")
        .attr("colspan", 2)
        .text("General Info");
    
    // Get all info needed for table rows
    var population = stateData[id][years]["population"].toLocaleString("en"),
        returns = stateData[id][years]["returns"].toLocaleString("en"),
        stateIn = stateData[id][years]["in"][97]["n2"].toLocaleString("en"),
        stateOut = stateData[id][years]["out"][97]["n2"].toLocaleString("en"),
        foreignIn = stateData[id][years]["in"][98]["n2"].toLocaleString("en"),
        foreignOut = stateData[id][years]["out"][98]["n2"].toLocaleString("en"),
        income = stateData[id][years]["agi"]/stateData[id][years]["returns"]*1000,
        incomeString = "$"+Math.floor(income).toLocaleString("en"),
        popIn = stateData[id][years]["in"][96]["n2"],
        popOut = stateData[id][years]["out"][96]["n2"],
        delta = popIn - popOut,
        deltaString = delta > 0 ? "+"+delta.toLocaleString("en") : delta.toLocaleString("en"),
        non = stateData[id][years]["in"][id]["n2"].toLocaleString("en");
    
    // Put info a data list for D3 entry
    var genInfoList = [
        ["FIPS Code", id],
        ["Population", population],
        ["Tax Returns", returns],
        ["Average Income", incomeString],
        ["State Immigrants", stateIn],
        ["State Emigrants", stateOut],
        ["Foreign Immigrants", foreignIn],
        ["Foreign Emigrants", foreignOut],
        ["Population Change", deltaString],
        ["Non-migrants", non]];

    infoTableBody.selectAll("tr")
        .data(genInfoList)
        .enter()
        .append("tr")
        .selectAll("td")
            .data(function(d) {return d})
            .enter()
            .append("td")
            .text(function(d) {return d});

  }else if (firstActive !== null) {
    // One state selected, in or out
    // Get state id, name, and direction
    var s1 = parseInt(firstActive.data()[0].id),
        name = stateData[s1]["name"],
        direction = displayMode === "in" ? " Immigration" : " Emigration";

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

    // Write immi/emigration total
    var row = infoTableBody.append("tr");
    row.append("td").text("Total");
    row.append("td").text(stateData[s1][years][displayMode][97]["n2"].toLocaleString("en"));

    // Populate table rows
    for (let i = 0; i < stateData[s1][years][displayMode]["sorted"].length; i++) {

      // Skip non-state FIPS and skip self
      if (!(stateData[s1][years][displayMode]["sorted"][i][0] in stateFips) ||
        stateData[s1][years][displayMode]["sorted"][i][0] === s1) continue;

      // Get state name and migration total
      var name = stateData[stateData[s1][years][displayMode]["sorted"][i][0]]["name"],
          migrants = stateData[s1][years][displayMode]["sorted"][i][1];

      // No migrants, skip
      if (migrants < 0) continue;

      // Make row
      row = infoTableBody.append("tr");
      row.append("td").text(name);
      row.append("td").text(migrants.toLocaleString("en"));
    }

  }else if (colorScheme === "pop") {
    // No states selected, show population summary
    infoText.text("State Population");

    // Sort list of states by population descending
    var popSorted = [];
    for (let fips in stateData) {
      if (!stateFips.includes(parseInt(fips))) continue;
      var name = stateData[fips]["name"],
          pop = stateData[fips][years]["population"];
      popSorted.push([name, pop]);
    }

    popSorted.sort(function(a, b) {return b[1]-a[1]});

    // Table header
    infoTableHeader.append("tr")
        .selectAll("th")
        .data(["State", "Population"])
        .enter()
        .append("th")
        .text(function(d) {return d});

    // Enumerate list to table rows
    infoTableBody.selectAll("tr")
        .data(popSorted)
        .enter()
        .append("tr")
        .selectAll("td")
            .data(function(d) {return d})
            .enter()
            .append("td")
            .text(function(d) {return d.toLocaleString()});

  }else if (colorScheme === "delta") {
    // No states selected, show migration delta summary
    infoText.text("State Population Change");

    // Sort list of states by population descending
    var deltaSorted = [];
    for (let fips in stateData) {
      if (!stateFips.includes(parseInt(fips))) continue;
      var name = stateData[fips]["name"],
          popIn = stateData[fips][years]["in"][96]["n2"],
          popOut = stateData[fips][years]["out"][96]["n2"],
          delta = popIn - popOut;
      deltaSorted.push([name, delta]);
    }

    deltaSorted.sort(function(a, b) {return b[1]-a[1]});

    // Table header
    infoTableHeader.append("tr")
        .selectAll("th")
        .data(["State", "Delta"])
        .enter()
        .append("th")
        .text(function(d) {return d});

    // Enumerate list to table rows
    infoTableBody.selectAll("tr")
        .data(deltaSorted)
        .enter()
        .append("tr")
        .selectAll("td")
            .data(function(d) {return d})
            .enter()
            .append("td")
            .text(function(d) {
              if (typeof d === "number" && d > 0) {
                return "+"+d.toLocaleString();
              }else {
                return d.toLocaleString();
              }
            });

  }else if (colorScheme === "income") {
    // No states selected, show income summary
    infoText.text("State Average Income");
    // Sort list of states by population descending
    var incomeSorted = [];
    for (let fips in stateData) {
      if (!stateFips.includes(parseInt(fips))) continue;
      var name = stateData[fips]["name"],
          agi = stateData[fips][years]["agi"],
          returns = stateData[fips][years]["returns"],
          income = Math.floor(agi * 1000 / returns);
      incomeSorted.push([name, income]);
    }

    incomeSorted.sort(function(a, b) {return b[1]-a[1]});

    // Table header
    infoTableHeader.append("tr")
        .selectAll("th")
        .data(["State", "AGI"])
        .enter()
        .append("th")
        .text(function(d) {return d});

    // Enumerate list to table rows
    infoTableBody.selectAll("tr")
        .data(incomeSorted)
        .enter()
        .append("tr")
        .selectAll("td")
            .data(function(d) {return d})
            .enter()
            .append("td")
            .text(function(d) {
              if (typeof d === "number") {
                return "$"+d.toLocaleString();
              }else {
                return d.toLocaleString();
              }
            });

  }else if (displayMode === "in") {
    // No states selected, basic pastel color scheme, immigration
    infoText.text("State Immgration");
    // Sort list of states by immigrants descending
    var inSorted = [];
    for (let fips in stateData) {
      if (!stateFips.includes(parseInt(fips))) continue;
      var name = stateData[fips]["name"],
          popIn = stateData[fips][years]["in"][97]["n2"];
      inSorted.push([name, popIn]);
    }

    inSorted.sort(function(a, b) {return b[1]-a[1]});

    // Table header
    infoTableHeader.append("tr")
        .selectAll("th")
        .data(["State", "Immigrants"])
        .enter()
        .append("th")
        .text(function(d) {return d});

    // Enumerate list to table rows
    infoTableBody.selectAll("tr")
        .data(inSorted)
        .enter()
        .append("tr")
        .selectAll("td")
            .data(function(d) {return d})
            .enter()
            .append("td")
            .text(function(d) {return d.toLocaleString()});

  }else if (displayMode === "out") {
    // No states selected, basic pastel color scheme, emigration
    infoText.text("State Emigration");
    // Sort list of states by emigrants descending
    var outSorted = [];
    for (let fips in stateData) {
      if (!stateFips.includes(parseInt(fips))) continue;
      var name = stateData[fips]["name"],
          popOut = stateData[fips][years]["out"][97]["n2"];
      outSorted.push([name, popOut]);
    }

    outSorted.sort(function(a, b) {return b[1]-a[1]});

    // Table header
    infoTableHeader.append("tr")
        .selectAll("th")
        .data(["State", "Emigrants"])
        .enter()
        .append("th")
        .text(function(d) {return d});

    // Enumerate list to table rows
    infoTableBody.selectAll("tr")
        .data(outSorted)
        .enter()
        .append("tr")
        .selectAll("td")
            .data(function(d) {return d})
            .enter()
            .append("td")
            .text(function(d) {return d.toLocaleString()});
  }else if (displayMode === "gen") {
    // No states selected, basic pastel color scheme, general information
    // Show disclaimer
    infoText.text("Disclaimer");
    infoTableBody.append("tr")
        .text(disclaimer);
  }
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

// Get gradient data from a linear color scale
function scaleToGradient(scale) {
  // Get list of interval ticks from scale domain
  var ticks = scale.ticks();

  // Convert ticks to percentage and color list for gradient
  var ticksData = ticks.map(function(x) {
    var domain = scale.domain(),
        tick = x - domain[0],
        max = domain[domain.length-1] - domain[0],
        o = (tick * 100 / max).toFixed(0) + "%",
        c = scale(x);
    return {offset: o, color: c};
  });

  return ticksData;
}

function zoomToBounds(bounds) {
  // Compute scale and translate to focus on overall bounding box
  var dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.max(1, Math.min(2.5, 0.9 / Math.max(dx / width, dy / height))),
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

  // Update arrows and info table
  drawArrows();
  writeInfo();

  // Reset zoom
  svg.transition()
      .duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
}
