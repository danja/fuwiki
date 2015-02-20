/**
 * Functions associated with edit.html
 */



function setupPosting() {
    $('#cancel').click(function () {
        return flipToViewPage();
    });

    $('#submit').click(function () {
        storeEntry();
    });

    var storeEntry = function () {
   //     var entry = extractEntry(graphURI, uri);
        var entry = Entry.setId(graphURI, uri);
        entry = populateEntryFromHTML(entry);
        var data = sparqlTemplater(postPageSparqlTemplate, entry, true);

        //     var afterPostEntry = function () {

        //   }

        var postNewData = function () {
            $.ajax({
                type: "POST",
                url: sparqlUpdateEndpoint,
                data: ({
                    update: data
                })
            }).done(function () {
                var fliptoViewPage = function () {
                    window.location.href = window.location.href.replace("edit.html", "page.html");
                };
                submitOutlinks(graphURI, uri, entry.content);
                submitTags(graphURI, uri, fliptoViewPage);
                //   callback();
            });
        }
        deleteEntry(graphURI, uri, postNewData);
        return false;
    }

    var flipToViewPage = function () {
        window.location.href = window.location.href.replace("edit.html", "page.html");
        return false;
    }

    var fliptoIndexPage = function () {
        window.location.href = "index.html";
    };

    $('#delete').click(function () {
      //   console.log("HERW"+JSON.stringify(entry)); NOT DEFINED
        return deleteEntry(graphURI, uri, fliptoIndexPage);
    });
}

function populateEntryFromHTML(entry) {
    console.log("ENTRY = " + JSON.stringify(entry));
    /*
    var entry = {
        "graphURI": graphURI,
        "uri": uri,
        "date": (new Date()).toISOString(),
        "modified": (new Date()).toISOString()
    };
    */
  //  var entry = Entry.create();
  //  entry.setId(graphURI, uri);
    
    entry.title = $('#title').val(); /// can this lot use a convention, HTML id = entry field name??? idHtmlToJSON??
    entry.nick = $('#nick').val();
    entry.created = $('#created').text();
    entry.content = $('#content').val();
    entry.content = escapeXml(entry.content);
    entry.format = $('#format').val();

    return entry;
}

function deleteEntry(graphURI, uri, callback) {
    var entry = Entry.setId(graphURI, uri);
    var data = sparqlTemplater(deletePageSparqlTemplate, entry, true);
    $.ajax({
        type: "POST",
        url: sparqlUpdateEndpoint,
        data: ({
            update: data
        })
    }).done(function () {
        callback();
    });
    return false;
}

function submitOutlinks(graphURI, uri, content) {
    var matches = content.match(/\[([^\[]*)\]\(([^\)]*)\)/g);
    console.log("MATCHESreg=" + JSON.stringify(matches));
}

// TAGS ----------------------------------------------
function submitTags(graphURI, uri, callback) {

    var tagsCommas = $("#maintagscontainer").tagit("assignedTags");
    console.log("tagsCommas=" + tagsCommas);
    var tagStrings = tagsCommas; //.split(",");
    var tags = [];
    for (var i = 0; i < tagStrings.length; i++) {
        var tag = {
            "topicURI": "http://hyperdata.it/tags/" + tagStrings[i].toLowerCase(),
            "topicLabel": tagStrings[i].toLowerCase()
        };
        tags.push(tag);
    }

    var templateMap = {
        "graphURI": graphURI,
        "uri": uri,
        "tags": tags
    };

    //    console.log("templateMap=" + JSON.stringify(templateMap));
    var data = sparqlTemplater(postTagsSparqlTemplate, templateMap, true);
    //     console.log("postTagsSparqlTemplate=" + postTagsSparqlTemplate);
    //     console.log("DATA=" + data);

    $.ajax({
        type: "POST",
        url: sparqlUpdateEndpoint,
        data: ({
            update: data
        })
    }).done(function () {
        callback();
    });
}