
var sbNoteService2  ={

	fontSize : 16,
	enabledHTMLView : false,

	init : function()
	{
		window.location.href.match(/\?id\=(\d{14})$/);
		var id = RegExp.$1;
		sbNoteService.sidebarContext = false;
		sbDataSource.init();
		sbNoteService.edit(sbCommonUtils.RDF.GetResource("urn:scrapbook:item" + id));
		sbNoteTemplate.init();
		this.initFontSize();
		if ( nsPreferences.getBoolPref("scrapbook.note.linefeed", true) )
		{
			document.getElementById("sbNoteToolbarL").setAttribute("checked", true);
		}
		if ( nsPreferences.getBoolPref("scrapbook.note.preview", false) ) this.initHTMLView();
	},

	refresh : function()
	{
		var icon = sbCommonUtils.getDefaultIcon("note");
		document.getElementById("sbNoteImage").setAttribute("src", icon);
		if ( !document.getElementById("sbNoteBrowser").hidden ) this.initHTMLView();
		var browser = sbCommonUtils.WINDOW.getMostRecentWindow("navigator:browser").getBrowser();
		try {
			if ( browser.selectedBrowser.contentWindow.sbNoteService.resource.Value == sbNoteService.resource.Value )
			{
				browser.selectedTab.label = sbDataSource.getProperty(sbNoteService.resource, "title");
				browser.selectedTab.setAttribute("image", icon);
			}
		} catch(ex) {
		}
	},

	finalize : function(exit)
	{
		window.onunload = "";
		sbNoteService.save(window);
		nsPreferences.setBoolPref("scrapbook.note.preview",  this.enabledHTMLView);
		nsPreferences.setIntPref("scrapbook.note.fontsize",  this.fontSize);
		nsPreferences.setBoolPref("scrapbook.note.linefeed", document.getElementById("sbNoteToolbarL").getAttribute("checked") ? true : false);
		if ( exit ) window.location.href = "about:blank";
	},

	initFontSize : function()
	{
		this.fontSize = nsPreferences.getIntPref("scrapbook.note.fontsize", 16);
		this.changeFontSize(this.fontSize);
		document.getElementById("sbNoteToolbarF" + this.fontSize).setAttribute("checked", true)
	},

	changeFontSize : function(aPixel)
	{
		this.fontSize = aPixel;
		var newStyle = "font-size: " + aPixel + "px; font-family: monospace;";
		sbNoteService.TEXTBOX.setAttribute("style", newStyle);
		sbNoteTemplate.TEXTBOX.setAttribute("style", newStyle);
	},


	initHTMLView : function()
	{
		sbNoteService.save();
		sbNoteTemplate.save();
		var source = sbNoteTemplate.getTemplate();
		if ( sbNoteService.TEXTBOX.value.match(/\n/) ) {
			var title   = RegExp.leftContext;
			var content = RegExp.rightContext;
		} else {
			var title   = sbNoteService.TEXTBOX.value;
			var content = "";
		}
		title = title.replace(/</g, "&lt;");
		title = title.replace(/>/g, "&gt;");
		title = title.replace(/\"/g, "&quot;");
		if ( document.getElementById("sbNoteToolbarL").getAttribute("checked") ) content = content.replace(/([^>])$/mg, "$1<br>");
		source = source.replace(/<%NOTE_TITLE%>/g,   title);
		source = source.replace(/<%NOTE_CONTENT%>/g, content);
		var htmlFile = sbCommonUtils.getScrapBookDir().clone();
		htmlFile.append("note.html");
		sbCommonUtils.writeFile(htmlFile, source, "UTF-8");
		this.toggleHTMLView(true);
		document.getElementById("sbNoteBrowser").loadURI(sbCommonUtils.convertFilePathToURL(htmlFile.path));
		this.enabledHTMLView = true;
	},

	toggleHTMLView : function(willShow)
	{
		document.getElementById("sbSplitter").hidden = !willShow;
		document.getElementById("sbNoteBrowser").hidden  = !willShow;
		document.getElementById("sbNoteHeader").lastChild.hidden = !willShow;
		document.getElementById("sbNoteToolbarN").disabled = !willShow;
		this.enabledHTMLView = willShow;
	},

};


var sbNoteTemplate = {

	get TEXTBOX() { return document.getElementById("sbNoteTemplateTextbox"); },

	enabled    : false,
	shouldSave : false,
	file       : null,

	init : function()
	{
		this.file = sbCommonUtils.getScrapBookDir().clone();
		this.file.append("note_template.html");
		if ( !this.file.exists() ) sbCommonUtils.saveTemplateFile("chrome://scrapbook/content/template.html", this.file);
	},

	show : function(willShow)
	{
		document.getElementById("sbNoteTemplate").hidden = !willShow;
		document.getElementById("sbNoteEditor").hidden   = willShow;
		this.enabled = willShow;
	},

	getTemplate : function()
	{
		var template = sbCommonUtils.readFile(this.file);
		template = sbCommonUtils.convertStringToUTF8(template);
		return template;
	},

	load : function()
	{
		this.save();
		this.show(true);
		this.TEXTBOX.value = this.getTemplate();
		this.TEXTBOX.focus();
	},

	save : function()
	{
		if ( !this.shouldSave ) return;
		var myCSS = sbCommonUtils.getScrapBookDir().clone();
		myCSS.append("note_template.html");
		sbCommonUtils.writeFile(myCSS, this.TEXTBOX.value, "UTF-8");
		this.change(false);
	},

	exit : function(checkOff)
	{
		this.save();
		this.show(false);
		if ( checkOff ) document.getElementById("sbNoteToolbarT").setAttribute("checked", false);
	},

	change : function(bool)
	{
		this.shouldSave = bool;
		document.getElementById("sbNoteToolbarS").disabled = !bool;
	},

};


