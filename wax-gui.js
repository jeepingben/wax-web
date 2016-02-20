var tempSlider = document.getElementById('tempSlider');
var tempCurDiv = document.getElementById("tempCurDiv");
var unitsF = document.getElementById("unitsF");
var unitsC = document.getElementById("unitsC");
var tempMaxLabel = document.getElementById("tempMaxLabel");
var conditionsForm = document.getElementById("conditionsForm");
var getWaxButton = document.getElementById("getWax");
var brandsDiv = document.getElementById("brandsDiv");
var resultsText = document.getElementById("resultsText");
var brandCheckboxes = [];

const remote = require('remote');
const waxRest = remote.require('./REST/wax-rest');
tempSlider.oninput = function() {
    tempCurDiv.innerHTML = this.value;
};

function fToC(degF) {
    var degC = ((5.0 / 9.0) * (degF - 32));
    return (degC);
}

function buildBrandCheckboxes() {

    buildBrandCheckbox("Swix");
    buildBrandCheckbox("Toko");
    buildBrandCheckbox("Toko_SportLine");
}

function buildBrandCheckbox(name) {
    var newCB = document.createElement('input');
    newCB.type = 'checkbox';
    newCB.name = name + 'Checkbox';
    newCB.value = name;
    newCB.checked = true;
    newCB.id = name + 'checkbox';

    brandCheckboxes.push(newCB);
    brandsDiv.appendChild(newCB);
    var newLabel = document.createElement('label');
    newLabel.for = name + "Checkbox";
    newLabel.innerHTML = "<span><span></span></span>" + name; //magic forstylized checkboxes
    brandsDiv.appendChild(newLabel);
}

conditionsForm.onsubmit = function() {
    var celsiusTemp = this.temperature.value;
    if (this.units.value == "Imperial") {

        celsiusTemp = fToC(this.temperature.value);
    }
    var brandString = "";
    for (i in brandCheckboxes) {
        var brand = brandCheckboxes[i];
        if (brand.checked === true) {
            if (brandString.length > 0) {
                brandString += ',';
            }
            brandString += brand.value;

        }
    }
   
    var req = {};
    
    var url = "http://localhost:12581/?" + "temperature=" + celsiusTemp + "&conditions=" + this.conditions.value + "&brands=" + brandString + "&callback=showWax";
	 req.url = url; 
	 var res = {};
     waxRest.getWax(req,res, showWax);
    console.log("called func" + res);
    //var script_element = document.createElement('script');

    // Set its source to the JSONP API
    //script_element.src = url;

    // Stick the script element in the page <head>
    //document.getElementsByTagName('head')[0].appendChild(script_element);
    //httpGetAsync(url, showWax);
    
    return false;
}

function showWax(wax) {
    resultsDiv.className = "visibleResult";
    
    if (wax.brand === 'none') {
    	resultsText.textContent = "No suitable wax found for these conditions";
    } else {
    	resultsText.textContent =  wax.brand + " " + wax.name;
    }
    if (!!wax.picture) {
        var waxImage = document.getElementById("waxImage");
        waxImage.src = 'images/' + wax.picture;
    }


}

function tempChange() {

    if (this.value == "Imperial") {
        tempMaxLabel.innerHTML = "40";
        tempSlider.max = 40;
    } else {
        tempMaxLabel.innerHTML = "15";
        tempSlider.max = 15;
    }

}
unitsC.onclick = tempChange;
unitsF.onclick = tempChange;


buildBrandCheckboxes();