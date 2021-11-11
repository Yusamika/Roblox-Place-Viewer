var version = "1.3.2"

var HttpClientGet = function (aUrl, aCallback, onError) {
  let header = new Headers();
  var Proxy = "https://cors-anywhere-sf.herokuapp.com/";
  header.append("Origin", window.location);
  onError = onError || console.log;

  fetch(Proxy+aUrl, {headers: header,})
    .then((response) => response.json())
    .then((json) => aCallback(json))
    .catch((error) => onError(error))
};

window.addEventListener("load", function () {
  document.getElementById("GameCard").innerHTML = ""
  var uid = document.getElementById("uid");
  var nextCursor = null;
  var lastCursor = null;
  var cursorToSearch = null;
  var searchType = "users"

  function UpdatePage(json) {
    nextCursor = null;
    lastCursor = null;
    cursorToSearch = null;
    document.getElementById("Places").innerHTML = "";
    var data = json.data;
    var PIDs = "";
    nextCursor = json.nextPageCursor;
    lastCursor = json.previousPageCursor;

    document.getElementById("back").disabled = (lastCursor == null)
    document.getElementById("forward").disabled = (nextCursor == null)

    for (var i = 0; i < data.length; i++) {
      var Place = data[i];
      var div = document.getElementById("GameCard");

      PIDs = PIDs + "," + Place.id;

      clone = div.cloneNode(true); // true means clone all childNodes and all event handlers
      clone.id = Place.rootPlace.id;
      clone.href = "https://www.roblox.com/games/" + Place.rootPlace.id;

      document.getElementById("Places").appendChild(clone);
      clone.innerHTML = `
      <span class="thumbnail-2d-container game-card-thumb-container">
        <img id = "img` +Place.id +`" class="" src="./content/cd.png" alt="` +Place.description +`" width="150" height="150" title="` +Place.name +`">
      </span>
      <div class="game-card-name game-name-title" style="text-overflow: ellipsis;overflow: hidden;" title="` +Place.description +`">` +Place.name +`
      </div>
      <div class="game-card-info">
        <svg y="16" width="16" height="16">
         <use xlink:href="content/playing_small.svg#light_common_small"></use>
        </svg>
        <span class="info-label vote-percentage-label" id = "like`+ Place.id +`">100%</span>
        <svg y="16" width="16" height="16">
          <use xlink:href="content/rating_small.svg#light_common_small"></use>
        </svg>
        <span class="info-label playing-counts-label" id = "plr`+ Place.id +`">0</span>
      </div>`;
    }
    if (PIDs.length < 1) { return };
    HttpClientGet("https://thumbnails.roblox.com/v1/games/icons?universeIds=" + PIDs.substr(1) + "&size=150x150&format=Png&isCircular=false",
      function (json) {
        for (var i = 0; i < json.data.length; i++) {
          document.getElementById("img" + json.data[i].targetId).src = json.data[i].imageUrl || "./content/cd.png";
        }
      }
    );
    HttpClientGet("https://games.roblox.com/v1/games?universeIds=" + PIDs.substr(1),
      function (json) {
        for (var i = 0; i < json.data.length; i++) {
          document.getElementById("plr" + json.data[i].id).innerHTML = json.data[i].playing;
        }
      }
    );
    HttpClientGet("https://games.roblox.com/v1/games/votes?universeIds=" + PIDs.substr(1),
      function (json) {
        for (var i = 0; i < json.data.length; i++) {
          perc = json.data[i].upVotes/(json.data[i].upVotes+json.data[i].downVotes)*100
          document.getElementById("like" + json.data[i].id).innerHTML = (!Number.isNaN(perc) && (Math.floor(perc).toString() + "%") || "--");
        }
      }
    );
  } 

  function dostuff() {

    var ID = (uid.value.length > 0 && uid.value) || uid.placeholder;
    if (searchType == "users") {
      document.getElementById("pfp").src = "https://www.roblox.com/headshot-thumbnail/image?&width=150&height=150&format=png&userId=" + ID;
    }else{
      HttpClientGet("https://thumbnails.roblox.com/v1/groups/icons?size=150x150&format=Png&isCircular=false&groupIds=" + ID, 
        function(json){
          document.getElementById("pfp").src = json.data[0].imageUrl
        }
      )
    }
    HttpClientGet("https://games.roblox.com/v2/" + searchType + "/" + ID +"/games?limit=50&cursor="+(cursorToSearch || ""), UpdatePage)
    HttpClientGet("https://"+searchType+".roblox.com/v1/" + searchType + "/" + ID,
      function (json) {
        if (json.name != null) {
          document.getElementById("name").innerHTML = "<a href='https://www.roblox.com/"+searchType+"/"+ID+"' style='text-decoration: none;'><i>"+json.name+"</i></a>" + "'s Places";
        } else {
          document.getElementById("name").innerHTML = "Unknown User!";
        }
      }
    );
  }

  document.getElementById("group").oninput = function () {
    searchType = searchType === "groups" && "users" || "groups";
    dostuff();
  }

  if (document.location.search.substr(0, 5) === "?uid=") {
    uid.value = document.location.search.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  }

  if (document.location.search.substr(-6) === "groups") {
    searchType = "groups";
    document.getElementById("group").checked = true
  }

  uid.oninput = function () {
    uid.value = uid.value.replace(/[^0-9]/g, "").replace(/(\..*)\./g, "$1");
  };

  document.getElementById("copy").onmousedown = function () {
    navigator.clipboard
      .writeText(window.location.hostname + window.location.pathname + "?uid=" + ((uid.value.length > 0 && uid.value) || uid.placeholder) + "?searchtype=" + searchType)
      .then(function () {
        window.alert("Copied link to clipboard!");
      });
  };

  document.getElementById("search").onmousedown = dostuff;

  document.getElementById("forward").onmousedown = function () {
    cursorToSearch = nextCursor;
    dostuff();
  };

  document.getElementById("back").onmousedown = function () {
    cursorToSearch = lastCursor;
    dostuff();
  };

  uid.addEventListener("keyup", function(event) { // https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      dostuff()
    }
  });

  dostuff();
  
  document.getElementById("version").innerHTML = "v"+version;
});
