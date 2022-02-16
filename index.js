var version = "1.5";

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

  async function UpdatePage(json) {
    nextCursor = null;
    lastCursor = null;
    cursorToSearch = null;
    document.getElementById("Places").innerHTML = "";
    var data = json.data;
    var PIDs = "";
    var Places = [];
    nextCursor = json.nextPageCursor;
    lastCursor = json.previousPageCursor;

    document.getElementById("back").disabled = (lastCursor == null)
    document.getElementById("forward").disabled = (nextCursor == null)
    
    for (var i = 0; i < data.length; i++) {
      var Place = data[i];
      var PlaceData = Places[i] = [];
      var Place = data[i];

      PIDs = PIDs + "," + Place.id

      PlaceData.universeId = Place.id;
      PlaceData.id = Place.rootPlace.id;
      PlaceData.description = (Place.description == null) ? "<No Description>" : Place.description;
      PlaceData.name = Place.name;

      PlaceData.icon = false;
      PlaceData.visits = false;
      PlaceData.likes = false;
      PlaceData.playing = false;
      PlaceData.favorites = false;
    }

    HttpClientGet("https://thumbnails.roblox.com/v1/games/icons?universeIds=" + PIDs + "&size=150x150&format=Png&isCircular=false",
      function (json) {
        for (var i = 0; i < json.data.length; i++) {
          for (var j = 0; j < Places.length; j++) {
            if (Places[j].universeId == json.data[i].targetId) {
              Places[j].icon = json.data[i].imageUrl;
            }
          }
        }
      }
    );

    HttpClientGet("https://games.roblox.com/v1/games/votes?universeIds=" + PIDs,
      function (json) {
        for (var i = 0; i < json.data.length; i++) {
          for (var j = 0; j < Places.length; j++) {
            if (Places[j].universeId == json.data[i].id) {
              perc = json.data[i].upVotes/(json.data[i].upVotes+json.data[i].downVotes)*100
              Places[j].likes = (!Number.isNaN(perc) && (Math.floor(perc).toString() + "%") || "--");
            }
          }
        }
      }
    );

    HttpClientGet("https://games.roblox.com/v1/games?universeIds=" + PIDs,
      function (json) {
        for (var i = 0; i < json.data.length; i++) {
          for (var j = 0; j < Places.length; j++) {
            if (Places[j].universeId == json.data[i].id) {
              Places[j].playing = json.data[i].playing;
              Places[j].visits = json.data[i].visits;
              Places[j].favorites = json.data[i].favoritedCount;
              Places[j].uploadDate = new Date(json.data[i].created);
              Places[j].updateDate = new Date(json.data[i].updated);
            }
          }
        }
      }
    );

    var allGood = false
    do {
      for (var j = 0; j < Places.length; j++) {
        if (Places[j].icon === false || Places[j].likes === false || Places[j].playing === false) {
          allGood = false
          break
        } else {
          allGood = true
        }
      }
      await new Promise(resolve => setTimeout(resolve, 250)); // sleep for 250ms
    }
    while (allGood === false)

    Places.sort(function(a, b) {
      var SortType = document.getElementById('sort').options[document.getElementById('sort').selectedIndex].value;

      if (SortType == "favorites") {
        if (a.favorites < b.favorites) {
          return 1;
        }
        if (a.favorites > b.favorites) {
          return -1;
        }
      } else if (SortType == "visits") {
        if (a.visits < b.visits) {
          return 1;
        }
        if (a.visits > b.visits) {
          return -1;
        }
      } else if (SortType == "playing") {
        if (a.playing < b.playing) {
          return 1;
        }
        if (a.playing > b.playing) {
          return -1;
        }
      } else if (SortType == "updated") {
        if (a.updateDate < b.updateDate) {
          return 1;
        }
        if (a.updateDate > b.updateDate) {
          return -1;
        }
      } else if (SortType == "uploaded") {
        if (a.uploadDate < b.uploadDate) {
          return 1;
        }
        if (a.uploadDate > b.uploadDate) {
          return -1;
        }
      }

      return 0;
    });

    for (var i = 0; i < Places.length; i++) {
      var Place = Places[i];
      var div = document.getElementById("GameCard");

      clone = div.cloneNode(true); // true means clone all childNodes and all event handlers
      clone.id = Place.id;
      clone.href = "https://www.roblox.com/games/" + Place.id + "/";

      document.getElementById("Places").appendChild(clone);
      clone.innerHTML = `
      <span class="thumbnail-2d-container game-card-thumb-container">
        <img src="`+ (Place.icon == null) ? "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJ1bmFwcHJvdmVkXzFfIj48cGF0aCBpZD0iYmdfMl8iIGZpbGw9IiM2NTY2NjgiIGQ9Ik0wIDBoOTB2OTBIMHoiLz48ZyBpZD0idW5hcHByb3ZlZCIgb3BhY2l0eT0iLjMiPjxjaXJjbGUgY2xhc3M9InN0MiIgY3g9IjQ1IiBjeT0iNDguOCIgcj0iMTAiLz48cGF0aCBjbGFzcz0ic3QyIiBkPSJNMzggNDEuN2wxNCAxNC4xTTMyLjUgMjMuNWgtNHY0TTI4LjUgNjIuNXY0aDRNMjguNSAzMS44djZNMjguNSA0MnY2TTI4LjUgNTIuMnY2TTU3LjUgNjYuNWg0di00TTYxLjUgNTguMnYtNk02MS41IDQ4di02TTYxLjUgMzcuOHYtNE0zNi44IDY2LjVoNk00Ny4yIDY2LjVoNk0zNi44IDIzLjVoNk00Ny4yIDIzLjVoNE01MS40IDIzLjZsMy41IDMuNU01Ny45IDMwLjFsMy41IDMuNU01MS4yIDIzLjh2M001OC41IDMzLjhoM001MS4yIDMwLjJ2My42aDMuNiIvPjwvZz48L2c+PC9zdmc+" : Place.icon +`" alt="` +Place.description +`" width="150" height="150" title="` +Place.description +`">
      </span>
      <div class="game-card-name game-name-title" style="text-overflow: ellipsis;overflow: hidden;" title="` +Place.name +`">` +Place.name +`
      </div>
      <div class="game-card-info">
        <svg y="16" width="16" height="16">
         <use xlink:href="content/rating_small.svg#light_common_small"></use>
        </svg>
        <span class="info-label vote-percentage-label"`+ Place.universeId +`">`+Place.likes+`</span>
        <svg y="16" width="16" height="16">
          <use xlink:href="content/playing_small.svg#light_common_small"></use>
        </svg>
        <span class="info-label playing-counts-label`+ Place.universeId +`">`+Place.playing+`</span>
      </div>`;
    }
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
    
    HttpClientGet("https://games.roblox.com/v2/" + searchType + "/" + ID +"/games?limit=50&accessFilter=Public&cursor="+(cursorToSearch || ""), UpdatePage)
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

  document.getElementById("sort").oninput = function () {
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
