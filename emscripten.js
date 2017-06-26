var Module = {
	preRun: [],
	postRun: (function() {FS.mkdir('/analysis')}),
	print: (function() {
		var element = document.getElementById('output');
		if (element) element.value = ''; // clear browser cache
		return function(text) {
			if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
			if (element) {
				element.value += text + "\n";
				element.style.visibility = 'visible';
    		}
  		};
	})(),
	printErr: function(text) {
		if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
		if (0) { // XXX disabled for safety typeof dump == 'function') {
			dump(text + '\n'); // fast, straight to the real console
  		} else {
  			console.error(text);
  		}
	},
	setStatus: function(text) {
		if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };	
		if (text === Module.setStatus.text) return;
		var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
		var now = Date.now();
		if (m && now - Date.now() < 30) return;
		if (m) {
			text = m[1];
			document.getElementById('spinner').hidden = false;
		} else {
			if (!text) document.getElementById('overlayscreen').hidden = true;
    		if (!text) document.getElementById('spinner').hidden = true;
			
		}
		document.getElementById('statusLabel').innerHTML = "Preparando Ambiente";
	},
	totalDependencies: 0,
  	monitorRunDependencies: function(left) {
  		this.totalDependencies = Math.max(this.totalDependencies, left);
  		//Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
	}
};
window.onerror = function(event) {
	Module.setStatus('Exception thrown, see JavaScript console');
	document.getElementById('spinner').style.display = 'none';
	Module.setStatus = function(text) {
		if (text) Module.printErr('[post-exception status] ' + text);
	};
};
