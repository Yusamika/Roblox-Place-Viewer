var version = "1.1.2"

var HttpClientGet = function (aUrl, aCallback) {
  let header = new Headers();
  header.append("Origin", window.location);
  fetch("https://cors-anywhere-sf.herokuapp.com/"+aUrl, {headers: header,})
    .then((response) => response.json())
    .then((json) => aCallback(json))
    .catch((error) => console.log("Request failed : " + error.message + "\nURL: https://cors-anywhere-sf.herokuapp.com/"+aUrl));
};

window.addEventListener("load", function () {
  var uid = document.getElementById("uid");
  var nextCursor = null;
  var lastCursor = null;
  var cursorToSearch = null;

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
      clone.innerHTML =`<span class="thumbnail-2d-container game-card-thumb-container"><img id = "img` +Place.id +`" class="" src="./content/cd.png" alt="` +Place.description +`" title="` +Place.name +`"></span><div class="game-card-name game-name-title" style="text-overflow: ellipsis;overflow: hidden;" title="` +Place.description +`">` +Place.name +`</div><div class="game-card-info"><img src="content/thumb.png" width="12" height="12"><span class="info-label vote-percentage-label" id = "like`+ Place.id +`">100%</span><img src="content/plr.png" width="12" height="12"><span class="info-label playing-counts-label" id = "plr`+ Place.id +`">0</span></div>`;
    }

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
    document.getElementById("pfp").src ="https://www.roblox.com/headshot-thumbnail/image?&width=150&height=150&format=png&userId=" +ID;
    HttpClientGet("https://games.roblox.com/v2/users/" + ID +"/games?limit=50&cursor="+(cursorToSearch || ""), UpdatePage)
    HttpClientGet("https://users.roblox.com/v1/users/" + ID,
      function (json) {
        document.getElementById("name").innerHTML = "<a href='https://www.roblox.com/users/"+ID+"/profile' style='text-decoration: none;'><i>"+json.name+"</i></a>" + "'s Places";
      }
    );
  }

  if (document.location.search.substr(0, 5) === "?uid=") {
    uid.value = document.location.search.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  }

  uid.oninput = function () {
    uid.value = uid.value.replace(/[^0-9]/g, "").replace(/(\..*)\./g, "$1");
  };

  document.getElementById("copy").onmousedown = function () {
    navigator.clipboard
      .writeText(window.location.hostname + window.location.pathname + "?uid=" + ((uid.value.length > 0 && uid.value) || uid.placeholder))
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
