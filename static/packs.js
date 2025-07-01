function sort(sort) {
    var sortFn = null;
    switch (sort) {
        case "new":
            sortFn = function(a, b) {
                var dateA = new Date(a.dataset.date);
                var dateB = new Date(b.dataset.date);
                return dateB.getTime() - dateA.getTime();
            };
            break;
        case "old":
            sortFn = function(a, b) {
                var dateA = new Date(a.dataset.date);
                var dateB = new Date(b.dataset.date);
                return dateA.getTime() - dateB.getTime();
            };
            break;
        case "az":
            sortFn = function(a, b) {
                var titleA = a.querySelector(".pack-title").textContent.toLowerCase();
                var titleB = b.querySelector(".pack-title").textContent.toLowerCase();
                if (titleA < titleB) return -1;
                if (titleA > titleB) return 1;
                return 0;
            };
            break;
        case "za":
            sortFn = function(a, b) {
                var titleA = a.querySelector(".pack-title").textContent.toLowerCase();
                var titleB = b.querySelector(".pack-title").textContent.toLowerCase();
                if (titleA < titleB) return 1;
                if (titleA > titleB) return -1;
                return 0;
            };
            break;
    }

    var content = document.getElementById("packs-content");
    var packs = Array.prototype.slice.call(content.querySelectorAll(".pack"));
    packs.sort(sortFn);

    for (var i = 0; i < packs.length; i++) {
        content.appendChild(packs[i]); // Use appendChild instead of insertAdjacentElement
    }
}

document.addEventListener("click", function(e) {
    if (e.target.id == "pack-search-submit") {
        var query = document.getElementById("pack-search-input").value.toLowerCase();
        var packs = document.querySelectorAll("#packs-content > .pack");
        for (var i = 0; i < packs.length; i++) {
            var pack = packs[i];
            pack.hidden = (pack.querySelector(".pack-title").textContent.toLowerCase().indexOf(query) == -1);
        }
    } else if (e.target.classList.contains("filter-link")) {
        var sel = document.querySelector(".filter-link.selected");
        if (sel) sel.classList.remove("selected");
        e.target.classList.add("selected");
        sort(e.target.dataset.value);
    }
});

function waitForElement(query, callback) {
    var checkExist = setInterval(function() {
        if (document.querySelector(query) !== null) {
            clearInterval(checkExist);
            callback(document.querySelector(query));
        }
    }, 100); // Check every 100ms
}
