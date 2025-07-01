var DATESTR_LOCALE = "ja-JP"; // YYYY/MM/DD
var DATESTR_CONFIG = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric"
};

function dateStrFromUTC(dateStr) {
    var date = new Date(dateStr + " UTC");
    // Fallback for date formatting in IE
    return date.getFullYear() + '/' + 
           ('0' + (date.getMonth() + 1)).slice(-2) + '/' + 
           ('0' + date.getDate()).slice(-2) + ' ' + 
           ('0' + date.getHours()).slice(-2) + ':' + 
           ('0' + date.getMinutes()).slice(-2);
}

var isIE = /MSIE|Trident/.test(window.navigator.userAgent);

var page = {
    onHashChange: function() {
        var hash = location.hash.replace(/^#!\//, "");
        var parts = hash.split("/");
        this.navigate(parts);
    },

    navigate: function(urlParts) {
        var pageContent = document.getElementById("page-content");
        var spinner = document.getElementById("spinner");

        pageContent.innerHTML = "";
        pageContent.hidden = true;
        spinner.hidden = false;

        var template = "404";
        var data = {};
        var self = this; // Preserve context for async functions

        switch (urlParts[0]) {
            case "":
                template = "home";
                this.loadData("data/packs.json?t=" + Date.now(), function(packs) {
                    for (var i = 0; i < packs.length; i++) {
                        packs[i].date = dateStrFromUTC(packs[i].date);
                    }
                    data.packs = packs;
                    self.renderTemplate(template, data);
                }, function() {
                    self.renderTemplate(template, data);
                });
                break;

            case "pack":
                var id = urlParts[1];
                if (id === "" || id === undefined) break;

                this.loadData("data/" + id + "/pack.json?t=" + Date.now(), function(json) {
                    data.pack = json;
                    data.pack.id = id;

                    self.loadText("data/" + id + "/README.md?t=" + Date.now(), function(text) {
                        if (!isIE) {
                            // Only use commonmark if not in IE
                            var parser = new commonmark.Parser();
                            var renderer = new commonmark.HtmlRenderer();
                            var parsed = parser.parse(text);
                            data.pack.readme = renderer.render(parsed);
                        } else {
                            // Fallback for IE: just use the raw text or a simple conversion
                            data.pack.readme = text.replace(/\n/g, "<br>"); // Simple line break conversion
                        }

                        for (var j = 0; j < data.pack.versions.length; j++) {
                            data.pack.versions[j].date = dateStrFromUTC(data.pack.versions[j].date);
                        }
                        template = "pack";
                        self.renderTemplate(template, data);
                    }, function() {
                        self.renderTemplate("404", {});
                    });
                }, function() {
                    self.renderTemplate("404", {});
                });
                break;
        }
    },

    loadData: function(url, successCallback, errorCallback) {
        if (isIE) {
            // Use XMLHttpRequest for IE
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    successCallback(JSON.parse(xhr.responseText));
                } else {
                    errorCallback();
                }
            };
            xhr.onerror = function() {
                errorCallback();
            };
            xhr.send();
        } else {
            // Use fetch for modern browsers
            fetch(url)
                .then(function(response) {
                    if (!response.ok) throw new Error("Network response was not ok");
                    return response.json();
                })
                .then(successCallback)
                .catch(errorCallback);
        }
    },

    loadText: function(url, successCallback, errorCallback) {
        if (isIE) {
            // Use XMLHttpRequest for IE
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    successCallback(xhr.responseText);
                } else {
                    errorCallback();
                }
            };
            xhr.onerror = function() {
                errorCallback();
            };
            xhr.send();
        } else {
            // Use fetch for modern browsers
            fetch(url)
                .then(function(response) {
                    if (!response.ok) throw new Error("Network response was not ok");
                    return response.text();
                })
                .then(successCallback)
                .catch(errorCallback);
        }
    },

    renderTemplate: function(template, data) {
        var pageContent = document.getElementById("page-content");
        var spinner = document.getElementById("spinner");

        pageContent.innerHTML = nunjucks.render(template + ".html", data);
        pageContent.hidden = false;
        spinner.hidden = true;

        if (data.packs) {
            var filterLink = document.querySelector('.filter-link[data-value="new"]');
            if (filterLink) {
                filterLink.classList.add("selected");
            }
            sort("new");
        }
    },

    init: function() {
        nunjucks.configure("templates", {
            web: { useCache: true }
        });
        window.addEventListener("hashchange", this.onHashChange.bind(this));
        this.onHashChange();
    }
};

// Initialize the page
page.init();
