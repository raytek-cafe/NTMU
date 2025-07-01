const DATESTR_LOCALE = "ja-JP"; // YYYY/MM/DD
const DATESTR_CONFIG = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric"
};

function dateStrFromUTC(dateStr)
{
    let date = new Date(dateStr + " UTC");
    let config = DATESTR_CONFIG;
    config.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return date.toLocaleString(DATESTR_LOCALE, config);
}

let page = {
    onHashChange()
    {
        let hash = location.hash.replace(/^#!\//, "");
        let parts = hash.split("/");
        this.navigate(parts);
    },

    async navigate(urlParts)
    {
        let pageContent = document.getElementById("page-content");
        let spinner = document.getElementById("spinner");

        pageContent.innerHTML = "";
        pageContent.hidden = true;
        spinner.hidden = false;

        let template = "404";
        let data = {};
        switch (urlParts[0])
        {
            case "":
            {
                template = "home";
                let packs = await (await fetch(`data/packs.json?t=${Date.now()}`)).json();
                for (let pack of packs)
                {
                    pack.date = dateStrFromUTC(pack.date);
                }
                data.packs = packs;
                break;
            }
            case "pack":
            {
                let id = urlParts[1];
                if (id === "" || id === undefined)
                    break;

                let r = await fetch(`data/${id}/pack.json?t=${Date.now()}`);
                if (r.status != 200)
                    break;

                let json;
                try
                {
                    json = await r.json();
                } catch (e) { break; }

                data.pack = json;
                data.pack.id = id;

                let rr = await fetch(`data/${id}/README.md?t=${Date.now()}`);
                if (rr.status == 200)
                {
                    let parser = new commonmark.Parser();
                    let renderer = new commonmark.HtmlRenderer();
                    let parsed = parser.parse(await rr.text());
                    data.pack.readme = renderer.render(parsed);
                }

                for (let version of data.pack.versions)
                {
                    version.date = dateStrFromUTC(version.date);
                }
    
                template = "pack";
                break;
            }
        }

        pageContent.innerHTML = nunjucks.render(template + ".html", data);
        pageContent.hidden = false;
        spinner.hidden = true;

        switch (urlParts[0])
        {
            case "packs":
                document.querySelector(`.filter-link[data-value="new"]`).classList.add("selected");
                sort("new");
                break;
        }
    },

    init()
    {
        nunjucks.configure("templates", {
            web: { useCache: true }
        });
        window.addEventListener("hashchange", this.onHashChange.bind(this));
        this.onHashChange();
    }
};

page.init();