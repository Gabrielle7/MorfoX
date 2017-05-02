var bigramaSorted;
var trigramaSorted;
var tags;
var lemmas;
var words;

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
}

function dragHover(e) {
	e.stopPropagation();
	e.preventDefault();
	e.target.className = (e.type == "dragover" ? "hover" : "");
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
	var re = /([a-zA-Z\u00C0-\u017F ]|-?\d+([\.,]\d+)?%?)/gu;
	var text = decodeURIComponent(escape(String.fromCharCode.apply(null, array)));
	var lines = text.toLowerCase().split(/\r\n|\r|\n/);
	for(var i = 0; i < lines.length; i++) {
		if (lines[i] != ""){
			var line = lines[i].match(re).join("");
			var words = line.split(" ");
			if (words.length > 0) {
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

	document.getElementById("slideTags").max = tags.length-1;
	if ((tags.length-1) < 10)
		document.getElementById("slideTags").value = tags.length-1;
	else
		document.getElementById("slideTags").value = 10;
	document.getElementById('labelT').innerHTML = document.getElementById("slideTags").value + '/' + (tags.length-1);

	document.getElementById("slideLemmas").max = lemmas.length-1;
	if ((lemmas.length-1) < 10)
		document.getElementById("slideLemmas").value = lemmas.length-1;
	else
		document.getElementById("slideLemmas").value = 10;
	document.getElementById('labelL').innerHTML = document.getElementById("slideLemmas").value + '/' + (lemmas.length-1);

	document.getElementById("slideUni").max = words.length-1;
	if ((words.length-1) < 10)
		document.getElementById("slideUni").value = words.length-1;
	else
		document.getElementById("slideUni").value = 10;
	document.getElementById('labelU').innerHTML = document.getElementById("slideUni").value + '/' + (words.length-1);

	document.getElementById("slideBi").max = bigramaSorted.length;
	if (bigramaSorted.length-1 < 10)
		document.getElementById("slideBi").value = bigramaSorted.length;
	else
		document.getElementById("slideBi").value = 10;
	document.getElementById('labelB').innerHTML = (document.getElementById("slideBi").value + '/' + bigramaSorted.length);

	document.getElementById("slideTri").max = trigramaSorted.length;
	if (trigramaSorted.length-1 < 10)
		document.getElementById("slideTri").value = trigramaSorted.length;
	else
		document.getElementById("slideTri").value = 10;
	document.getElementById('labelTri').innerHTML = (document.getElementById("slideTri").value + '/' + trigramaSorted.length);
	
	showResults();
}

function showResults(){
	showLemmas(document.getElementById('slideLemmas').value);
	showTags(document.getElementById('slideTags').value);
	showWords(document.getElementById('slideUni').value);
	showBigram(document.getElementById('slideBi').value);
	showTrigram(document.getElementById('slideTri').value);

	document.getElementById('box').style.visibility = 'visible';
	setWaiting();
}

function showTrigram(value){
	var text = "";
	for (var i = 0; i < value && i < trigramaSorted.length; i++)
		text += trigramaSorted[i].join(":") + "<br>";
	document.getElementById('trigramasText').innerHTML = text;
}

function showBigram(value){
	var text = "";
	for (var i = 0; i < value && i < bigramaSorted.length; i++)
		text += bigramaSorted[i].join(":") + "<br>";
	document.getElementById('bigramasText').innerHTML = text;
}

function showWords(value){
	var text = "";
	for (var i = 0; i < value && i < words.length; i++)
		text += words[i] + "<br>";
	document.getElementById('wordsText').innerHTML = text;
}

function showLemmas(value){
	var text = "";
	for (var i = 0; i < value && i < lemmas.length; i++)
		text += lemmas[i] + "<br>";
	document.getElementById('lemmasText').innerHTML = text;
}

function showTags(value){
	var text = "";
	for (var i = 0; i < value && i < tags.length; i++)
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

function searchWords(value){
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

function downloadWords(){
	var hiddenElement = document.createElement('a');
	var content = "";
	for (var i in words)
		content += words[i].replace(":", ", ") + "\r\n";
	hiddenElement.href = 'data:text/plain,' + encodeURIComponent(content);
	hiddenElement.download = "palavras.txt";
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
