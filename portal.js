var bigramaSorted;
var trigramaSorted;
var tags;
var lemmas;
var words;
var fileSize;
var numWords;
var numLines;
var sliderTag;
var sliderLemma;
var sliderUni;
var sliderBi;
var sliderTri;

//drag and drop dealt as shown in https://www.sitepoint.com/html5-file-drag-and-drop/
function initInput(){
	var inputF = document.getElementById('inputFile');
	var dragF = document.getElementById('dragFile');
	var send = document.getElementById('sendFile');

	inputF.addEventListener("input", loadFile, false);

	var xhr = new XMLHttpRequest();
	if (xhr.upload) {
		dragF.addEventListener("dragover", dragHover, false);
		dragF.addEventListener("dragleave", dragHover, false);
		dragF.addEventListener("drop", loadFile, false);
		dragF.style.display = "block";
		send.style.display = "none";
	}

	initSliders();
}

function dragHover(e) {
	e.stopPropagation();
	e.preventDefault();
	e.target.className = (e.type == "dragover" ? "hover" : "");
}

function initSliders() {
	sliderTag = document.getElementById('sliderTags');
	sliderLemma = document.getElementById('sliderLemmas');
	sliderUni = document.getElementById('sliderUni');
	sliderBi = document.getElementById('sliderBi');
	sliderTri = document.getElementById('sliderTri');

	noUiSlider.create(sliderTag, {
	start: [1, 10],
	connect: true,
	tooltips: true,
	margin: 2,
	step: 1,
	range: {'min': 1, 'max': 10},
	format: wNumb({decimals: 0})
	});

	noUiSlider.create(sliderLemma, {
	start: [1, 10],
	connect: true,
	tooltips: true,
	margin: 2,
	step: 1,
	range: {'min': 1, 'max': 10},
	format: wNumb({decimals: 0})
	});

	noUiSlider.create(sliderUni, {
	start: [1, 10],
	connect: true,
	tooltips: true,
	margin: 2,
	step: 1,
	range: {'min': 1, 'max': 10},
	format: wNumb({decimals: 0})
	});

	noUiSlider.create(sliderBi, {
	start: [1, 10],
	connect: true,
	tooltips: true,
	margin: 2,
	step: 1,
	range: {'min': 1, 'max': 10},
	format: wNumb({decimals: 0})
	});

	noUiSlider.create(sliderTri, {
	start: [1, 10],
	connect: true,
	tooltips: true,
	margin: 2,
	step: 1,
	range: {'min': 1, 'max': 10},
	format: wNumb({decimals: 0})
	});

	sliderTag.noUiSlider.on('change', showTags);
	sliderLemmas.noUiSlider.on('change', showLemmas);
	sliderUni.noUiSlider.on('change', showUnigram);
	sliderBi.noUiSlider.on('change', showBigram);
	sliderTri.noUiSlider.on('change', showTrigram);
}

function setWaiting(text){
	if (text) {
		document.getElementById('overlayscreen').hidden = false;
		document.getElementById('spinner').hidden = false;
	} else {
		document.getElementById('overlayscreen').hidden = true;
		document.getElementById('spinner').hidden = true;
	}
	document.getElementById('statusLabel').innerHTML = text;
}


function loadFile(e){
	setWaiting("Carregando Arquivo");
	dragHover(e);
	var file;
	if (e.dataTransfer)
		file = e.dataTransfer.files[0];
	else
		file = e.target.files[0];
	var reader = new FileReader();
	fileSize = file.size;
	reader.onload = function() {
		var dataview = new Uint8Array(reader.result);
		var stream = FS.open('/freeling/file.txt', 'w+');
		FS.write(stream, dataview, 0, dataview.length);
		FS.close(stream);

		setWaiting("Analisando");
		ngrams(dataview);
		processFile();	
	}
	reader.readAsArrayBuffer(file);
}

function processFile() {
	var stream = FS.open('/analysis/palavras.txt', 'w+');
	FS.close(stream);
	var stream = FS.open('/analysis/lemmas.txt', 'w+');
	FS.close(stream);
	var stream = FS.open('/analysis/tags.txt', 'w+');
	FS.close(stream);

	var instance = new Module.FreelingSetup();
	instance.doAnalysis('/freeling/file.txt');
	instance.delete();
	FS.unlink('/freeling/file.txt');
	
	setWaiting("Imprimindo Resultados");
	resultSetup();
}

function ngrams(array){
	var bigramas = {};
	var trigramas = {};
	var gram;
	numLines = 0;
	numWords = 0;
	var re = /([a-zA-Z\u00C0-\u017F ]|-?\d+([\.,]\d+)?%?)/gu;
	var text = "";
	for (var i = 0; i < array.length; i++)
            text += String.fromCharCode(array[i]);
	text = decodeURIComponent(escape(text));
	var lines = text.toLowerCase().split(/\r\n|\r|\n/);
	for(var i = 0; i < lines.length; i++) {
		if (lines[i] != ""){
			numLines += 1;
			var line = lines[i].match(re).join("");
			var words = line.split(" ");
			if (words.length > 0) {
				numWords += words.length;
				for (var j = 0; j < words.length-1; j++){
					gram = words.slice(j,j+2).join(" ");
					if (bigramas.hasOwnProperty(gram))
						bigramas[gram] += 1;
					else
						bigramas[gram] = 1;
				}
				for (var j = 0; j < words.length-2; j++){
					gram = words.slice(j,j+3).join(" ");
					if (trigramas.hasOwnProperty(gram))
						trigramas[gram] += 1;
					else
						trigramas[gram] = 1;
				}
			}
		}
	}

	bigramaSorted = Object.keys(bigramas).map(function(key) {return [key, bigramas[key]]});
	bigramaSorted.sort(function(a, b) { return b[1] - a[1];});
	
	trigramaSorted = Object.keys(trigramas).map(function(key) {return [key, trigramas[key]]});
	trigramaSorted.sort(function(a, b) { return b[1] - a[1];});
}

function resultSetup(){
	words = FS.readFile('/analysis/palavras.txt', {encoding:'utf8'}).split(/\r?\n/);
	lemmas = FS.readFile('/analysis/lemmas.txt', {encoding:'utf8'}).split(/\r?\n/);
	tags = FS.readFile('/analysis/tags.txt', {encoding:'utf8'}).split(/\r?\n/);
	words.splice(words.length-1, 1);
	lemmas.splice(lemmas.length-1, 1);
	tags.splice(tags.length-1, 1);

	document.getElementById("tagLabel").innerHTML = "Etiquetas ("+tags.length+")";
	document.getElementById("lemmaLabel").innerHTML = "Lemas ("+lemmas.length+")";
	document.getElementById("uniLabel").innerHTML = "Unigramas ("+words.length+")";
	document.getElementById("biLabel").innerHTML = "Bigramas ("+bigramaSorted.length+")";
	document.getElementById("triLabel").innerHTML = "Trigramas ("+trigramaSorted.length+")";

	sliderTag.noUiSlider.updateOptions({
		range: {
			'min': 1,
			'max': tags.length
		}
	});
	sliderTag.noUiSlider.set([1, 10]);

	sliderLemma.noUiSlider.updateOptions({
		range: {
			'min': 1,
			'max': lemmas.length
		}
	});
	sliderLemma.noUiSlider.set([1, 10]);

	sliderUni.noUiSlider.updateOptions({
		range: {
			'min': 1,
			'max': words.length
		}
	});	
	sliderUni.noUiSlider.set([1, 10]);
	
	sliderBi.noUiSlider.updateOptions({
		range: {
			'min': 1,
			'max': bigramaSorted.length
		}
	});
	sliderBi.noUiSlider.set([1, 10]);

	sliderTri.noUiSlider.updateOptions({
		range: {
			'min': 1,
			'max': trigramaSorted.length
		}
	});
	sliderTri.noUiSlider.set([1, 10]);
	
	showResults();
}

function showResults(){
	document.getElementById('info').innerHTML = "Número de palavras: " +numWords+ " | Número de linhas: " +numLines+ " | Tamanho do arquivo: " +fileSize + "bytes";
	
	showTags(document.getElementById("sliderTags").noUiSlider.get());
	showLemmas(document.getElementById("sliderLemmas").noUiSlider.get());
	showUnigram(document.getElementById("sliderUni").noUiSlider.get());
	showBigram(document.getElementById("sliderBi").noUiSlider.get());
	showTrigram(document.getElementById("sliderTri").noUiSlider.get());

	document.getElementById('box').style.visibility = 'visible';
	document.getElementById('info').style.visibility = 'visible';
	setWaiting();
}


function showTrigram(values){
	var text = "";
	for (var i = parseInt(values[0])-1; i < parseInt(values[1]); i++)
		text += trigramaSorted[i].join(":") + "<br>";
	document.getElementById('trigramasText').innerHTML = text;
}

function showBigram(values){
	var text = "";
	for (var i = parseInt(values[0])-1; i < parseInt(values[1]); i++)
		text += bigramaSorted[i].join(":") + "<br>";
	document.getElementById('bigramasText').innerHTML = text;
}

function showUnigram(values){
	var text = "";
	for (var i = parseInt(values[0])-1; i < parseInt(values[1]); i++)
		text += words[i] + "<br>";
	document.getElementById('wordsText').innerHTML = text;
}

function showLemmas(values){
	var text = "";
	for (var i = parseInt(values[0])-1; i < parseInt(values[1]); i++)
		text += lemmas[i] + "<br>";
	document.getElementById('lemmasText').innerHTML = text;
}

function showTags(values){
	var text = "";
	for (var i = parseInt(values[0])-1; i < parseInt(values[1]); i++)
		text += tags[i] + "<br>";
	document.getElementById('tagsText').innerHTML = text;
}

function searchTags(value){
	var text = "";
	for (var i = 0; i < tags.length; i++)
		if (tags[i].toLowerCase().indexOf(value.toLowerCase()) !== -1)
			text += tags[i] + "<br>";
	document.getElementById('tagsText').innerHTML = text;		
}

function searchLemmas(value){
	var text = "";
	for (var i = 0; i < lemmas.length; i++)
		if (lemmas[i].toLowerCase().indexOf(value.toLowerCase()) !== -1)
			text += lemmas[i] + "<br>";
	document.getElementById('lemmasText').innerHTML = text;		
}

function searchUnigram(value){
	var text = "";
	for (var i = 0; i < words.length; i++)
		if (words[i].toLowerCase().indexOf(value.toLowerCase()) !== -1)
			text += words[i] + "<br>";
	document.getElementById('wordsText').innerHTML = text;		
}

function searchBigram(value){
	var text = "";
	for (var i = 0; i < bigramaSorted.length; i++)
		if (bigramaSorted[i][0].toLowerCase().indexOf(value.toLowerCase()) !== -1)
			text += bigramaSorted[i].join(":") + "<br>";
	document.getElementById('bigramasText').innerHTML = text;		
}

function searchTrigram(value){
	var text = "";
	for (var i = 0; i < trigramaSorted.length; i++)
		if (trigramaSorted[i][0].toLowerCase().indexOf(value.toLowerCase()) !== -1)
			text += trigramaSorted[i].join(":") + "<br>";
	document.getElementById('trigramasText').innerHTML = text;		
}

function downloadTags(){
	var hiddenElement = document.createElement('a');
	var content = "";
	for (var i in tags)
		content += tags[i].replace(":", ", ") + "\r\n";
	hiddenElement.href = 'data:text/plain,' + encodeURIComponent(content);
	hiddenElement.download = "tags.txt";
	hiddenElement.target = "_blank";
	document.body.appendChild(hiddenElement);
	hiddenElement.click();
	document.body.removeChild(hiddenElement);	
}

function downloadLemmas(){
	var hiddenElement = document.createElement('a');
	var content = "";
	for (var i in lemmas)
		content += lemmas[i].replace(":", ", ") + "\r\n";
	hiddenElement.href = 'data:text/plain,' + encodeURIComponent(content);
	hiddenElement.download = "lemas.txt";
	hiddenElement.target = "_blank";
	document.body.appendChild(hiddenElement);
	hiddenElement.click();
	document.body.removeChild(hiddenElement);	
}

function downloadUnigrams(){
	var hiddenElement = document.createElement('a');
	var content = "";
	for (var i in words)
		content += words[i].replace(":", ", ") + "\r\n";
	hiddenElement.href = 'data:text/plain,' + encodeURIComponent(content);
	hiddenElement.download = "unigramas.txt";
	hiddenElement.target = "_blank";
	document.body.appendChild(hiddenElement);
	hiddenElement.click();
	document.body.removeChild(hiddenElement);	
}

function downloadBigrams(){
	var hiddenElement = document.createElement('a');
	var content = "";
	for (var i in bigramaSorted)
		content += bigramaSorted[i][0] + ", " +bigramaSorted[i][1] + "\r\n";
	hiddenElement.href = 'data:text/plain,' + encodeURIComponent(content);
	hiddenElement.download = "bigramas.txt";
	hiddenElement.target = "_blank";
	document.body.appendChild(hiddenElement);
	hiddenElement.click();
	document.body.removeChild(hiddenElement);	
}

function downloadTrigrams(){
	var hiddenElement = document.createElement('a');
	var content = "";
	for (var i in trigramaSorted)
		content += trigramaSorted[i][0] + ", " +trigramaSorted[i][1] + "\r\n";
	hiddenElement.href = 'data:text/plain,' + encodeURIComponent(content);
	hiddenElement.download = "trigramas.txt";
	hiddenElement.target = "_blank";
	document.body.appendChild(hiddenElement);
	hiddenElement.click();
	document.body.removeChild(hiddenElement);	
}
