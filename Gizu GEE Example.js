//// 1. Snazzy Maps JSON into a variable. Credit to Sarah Frisk for the basemap
var snazzyStyle = [
    // ... your JSON content is here ...
    {"featureType":"all","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"all","elementType":"labels","stylers":[{"visibility":"off"},{"saturation":"-100"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40},{"visibility":"off"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"off"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#4d6059"}]},{"featureType":"landscape","elementType":"geometry.stroke","stylers":[{"color":"#4d6059"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"color":"#4d6059"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"lightness":21}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#4d6059"}]},{"featureType":"poi","elementType":"geometry.stroke","stylers":[{"color":"#4d6059"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#7f8d89"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#7f8d89"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#7f8d89"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#7f8d89"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#7f8d89"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#7f8d89"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#7f8d89"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#7f8d89"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#2b3638"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#2b3638"},{"lightness":17}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#24282b"}]},{"featureType":"water","elementType":"geometry.stroke","stylers":[{"color":"#24282b"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.icon","stylers":[{"visibility":"off"}]}
];

//// 2. Apply the style to the map
Map.setOptions('Sudan', {
  'Sudan': snazzyStyle
});

//// 3. Navigate to area of interest 
var sudan = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017").filter(ee.Filter.eq('country_na', 'Sudan')); Map.centerObject(sudan, 5);


//// 4. Add Sudan's border to the map (as a faint outline)
var borderStyle = {
  color: 'cccccc',      // The border color (gray), or 'FFBF00' for amber
  width: 2,             // The thickness of the line
  fillColor: '00000000' // The "Secret Code" for 100% transparent
};

Map.addLayer(sudan.style(borderStyle), {}, 'Sudan Outline'); // Adds Sudan layer, then uses .style function to call the borderStyle variable. So then we leave the {} empty since we aren't styling it here (it was already styled in the variable)

//// 5. Add a sidebar for metrics 

var sidebar = ui.Panel({
  style: {width: '350px', padding: '10px'}
});

ui.root.insert(0,sidebar); // Add the sidebar to the app window - ui.root.add(sidebar) would send it to the right. This puts it on the left

// Add a title and a short description to the sidebar
sidebar.add(ui.Label('Click below to explore the Gizu Region', {
  fontSize: '24px', 
  color: 'white', 
  backgroundColor: '#333333', // Match the sidebar color
  fontWeight: 'bold'}));
  
sidebar.add(ui.Label('This application leverages high-resolution Sentinel-2 satellite imagery to monitor vegetation health across Sudan’s Gizu region, providing real-time NDVI time-series analysis to track rangeland seasonality. By integrating automated cloud-masking and interactive geospatial charting, it offers a reproducible framework for analyzing how climate and conflict-driven shifts impact pastoralist migration patterns.', {
  color: 'white', 
  backgroundColor: '#333333', })); // Match the sidebar color 

// Change the background color to dark grey
sidebar.style().set('backgroundColor', '#333333');

// Add a subtle border for the sidebar
sidebar.style().set('border', '2px solid #555555');

//// 6. Import and Process Datasets (Sentinel-2)

// Define the Gizu region of interest
var gizuROI = ee.Geometry.Polygon([
  [[24.5, 17.5], [28.5, 17.5], [28.5, 15.0], [24.5, 15.0]]
]);
Map.centerObject(gizuROI, 6);

// Function to mask clouds & scale data
function maskS2clouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).divide(10000)
    .copyProperties(image, ["system:time_start"]); // Force-carry the timestamp
}

// Load Sentinel-2 Collection
var s2Col = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(gizuROI)
  .filterDate('2023-01-01', '2025-12-31') // Adjusting for recent data
  .map(maskS2clouds)
  .map(function(img){
    var ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI');
    return img.addBands(ndvi);
  });

// Create a Median Composite for initial visualization
var ndviViz = {
  min: 0.03,
  max: 0.3,
  palette: [
   '#4d6059', // Background match (dark grey-green)
    '#a6bddb', // Sparse/Dry vegetation (blue-grey)
    '#31a354', // Healthy seasonal grass (green)
    '#00441b'  // Peak biomass (dark green)
    ]
};

// Updated Composite: Use a 'Quality Mosaic' instead of 'Median'
// This picks the greenest pixel from the whole year, which "finds" the vegetation
// even if it only grew for two weeks.
var greenestNDVI = s2Col.select('NDVI').qualityMosaic('NDVI').clip(gizuROI);

Map.addLayer(greenestNDVI, ndviViz, 'Peak Vegetation (Greenest Pixel)');

//// 7. Interactive Charting Logic

sidebar.add(ui.Label('Vegetation Dynamics (NDVI)', {
  fontSize: '18px', fontWeight: 'bold', color: '#88d8b0', backgroundColor: '#333333'}));

var chartPanel = ui.Panel({style: {backgroundColor: '#333333'}});
sidebar.add(chartPanel);

var helpText = ui.Label('Click on a grazing area to view phenology trends.', {
  color: '#cccccc', backgroundColor: '#333333', fontSize: '12px', fontStyle: 'italic'});
chartPanel.add(helpText);

// Register a callback for map clicks
Map.onClick(function(coords) {
  chartPanel.clear();
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  
  // Add a dot to the map
  var dot = ui.Map.Layer(point, {color: 'red'}, 'Selected Site');
  Map.layers().set(2, dot);

  // Generate the Time-Series Chart with the fix
  var chart = ui.Chart.image.series({
    imageCollection: s2Col.select('NDVI'),
    region: point,
    reducer: ee.Reducer.mean(),
    scale: 20
  }).setOptions({
    title: 'NDVI Seasonality (Sentinel-2)',
    hAxis: {title: 'Date', textStyle: {color: 'white'}, titleTextStyle: {color: 'white'}},
    vAxis: {title: 'NDVI', textStyle: {color: 'white'}, titleTextStyle: {color: 'white'}},
    colors: ['#88d8b0'],
    backgroundColor: '#333333',
    legend: {position: 'none'},
    trendlines: { 0: {color: 'white', lineWidth: 1, opacity: 0.3} } // Added a trendline for "pizazz"
  });

  chartPanel.add(chart);
});

//// 8. Legend Construction
var legend = ui.Panel({
  style: {position: 'bottom-right', padding: '8px 15px', backgroundColor: 'rgba(51, 51, 51, 0.8)'}
});
var legendTitle = ui.Label('NDVI Intensity', {fontWeight: 'bold', color: 'white', backgroundColor: 'rgba(0,0,0,0)'});
legend.add(legendTitle);

var makeRow = function(color, name) {
  var colorBox = ui.Label({style: {backgroundColor: color, padding: '8px', margin: '0 0 4px 0'}});
  var description = ui.Label({value: name, style: {margin: '0 0 4px 6px', color: 'white', backgroundColor: 'rgba(0,0,0,0)'}});
  return ui.Panel({widgets: [colorBox, description], layout: ui.Panel.Layout.Flow('horizontal'), style: {backgroundColor: 'rgba(0,0,0,0)'}});
};

legend.add(makeRow('#00441b', 'High Density Rangeland'));
legend.add(makeRow('#a6bddb', 'Sparse/Seasonal Veg'));
legend.add(makeRow('#ece7f2', 'Barren/Sand'));
Map.add(legend);
