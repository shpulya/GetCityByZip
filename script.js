var taggedElement = -1;//id of tagged Element from list,  -1 - don't targed any city
let citiesList = [];
const ERROR_MSG = 'Incorrect zip code! <small><i>You can try 90002, 12301, 93458, 90003...</i></small>';
const SELECTED_CLASS = "selected";
const ZIP_ELEMENT = "zip";
const ONCLICK_ATTRIBUTE = "onclick";

function httpGet(theUrl, callback) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, false); // true for asynchronous
    xmlHttp.send(null);
    if (xmlHttp.status == 404) xmlHttp.onerror = showError(document.getElementById(ZIP_ELEMENT), ERROR_MSG);
}

function addNewItemToList(item) {
    $('#places').append('<li id="' + item.ZipCode + '">' +
        '<span onclick="pickListElement(' + item.ZipCode + ')">' + item.City + ', ' + item.State + '</span>' +
        '<span class="danger" onClick="removeListElement(' + item.ZipCode + ')">&#10007</span></li>');
}

function pickListElement(itemId) {
    if ($("#" + itemId + "").hasClass(SELECTED_CLASS)) {
        $("#" + itemId + "").removeClass(SELECTED_CLASS);
        document.forms[ZIP_ELEMENT].elements[ZIP_ELEMENT].value = '';
        taggedElement = -1;
    }
    else {
        if (taggedElement != -1) {
            $("#" + taggedElement + "").removeClass(SELECTED_CLASS);
        }
        $("#" + itemId + "").addClass(SELECTED_CLASS);
        document.forms[ZIP_ELEMENT].elements[ZIP_ELEMENT].value = itemId;
        taggedElement = itemId;
    }
}

function removeListElement(zipcode) {
    let element = document.getElementById(zipcode), searchedItem;
    element.parentNode.removeChild(element);
    for (const element of citiesList) {
        if (element.ZipCode == zipcode) searchedItem = element;
    }
    citiesList.splice(citiesList.indexOf(searchedItem), 1);
    if (taggedElement == searchedItem.zipcode) {
        taggedElement = -1
    }
}

function dataProcessingFromResponce(responceStr) {
    let responce = JSON.parse(responceStr);
    if (responce.Error || $.isEmptyObject(responce)) {

        showError(document.getElementById(ZIP_ELEMENT), ERROR_MSG);
        return;
    }
    let isCityExist = citiesList.some(function (item) {
        return item.City == responce.City
    });
    if (isCityExist) {
        updateItem(responce.City, responce.ZipCode);
    } else {
        addNewItemToList(responce);
        citiesList.push(responce);
    }
}

function updateItem(city, newZipcode) {
    let filter = citiesList.filter(function (item) {
        return item.City == city
    });
    let li = document.getElementById(filter[0].ZipCode);
    li.id = newZipcode;
    li.setAttribute(ONCLICK_ATTRIBUTE, "pickListElement(" + newZipcode + ")");
    taggedElement = newZipcode;
    filter[0].ZipCode = newZipcode;
}

function onClickMainButton() {
    resetError(document.getElementById(ZIP_ELEMENT));
    let zipcode = document.forms[ZIP_ELEMENT].elements[ZIP_ELEMENT].value;
    document.forms[ZIP_ELEMENT].elements[ZIP_ELEMENT].value = '';
    this.httpGet('https://api.zip-codes.com/ZipCodesAPI.svc/1.0/QuickGetZipCodeDetails/' + zipcode + '?key=DEMOAPIKEY', dataProcessingFromResponce);
}

function showError(container, errorMessage) {
    var msgElem = document.createElement('span');
    msgElem.className = "error-message";
    msgElem.innerHTML = errorMessage;
    container.appendChild(msgElem);
}

function resetError(container) {
    container.className = '';
    if (container.lastChild.className == "error-message") {
        container.removeChild(container.lastChild);
    }
}


