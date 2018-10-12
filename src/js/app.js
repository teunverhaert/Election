App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  parties: [],
  candidates: [],
  partyCount: 0,
  candidatesCount: 0,
  location: {
    id: 1,
    name: "Kerkstraat 5"
  },

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  getData: function() {
    /*var electionInstance;
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.partyCount();
    }).then(function(partyCount) {
      App.partyCount = partyCount;
      for (let i = 0; i<=partyCount; i++) {
        electionInstance.parties(i).then(function(party) {
          App.parties.push(party);
          App.checkData();
        })
      }
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      App.candidatesCount = candidatesCount;
      for (let i = 0; i<=candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          App.candidates.push(candidate);
          App.checkData();
        })
      }
    })*/
    App.parties = [{
      id: 1,
      name: "SP.A",
      voteCount: 0
    }, {
      id: 2,
      name: "N-VA",
      voteCount: 0
    }, {
      id: 3,
      name: "CD&V",
      voteCount: 0
    }];
    App.addCandidate(1, "BEELS Jinnih");
    App.addCandidate(1, "MEEUWS Tom");
    App.addCandidate(1, "TURAN Güler");
    App.addCandidate(2, "DE WEVER Bart");
    App.addCandidate(2, "DE RIDDER Annick");
    App.addCandidate(2, "AIT DAOUD Nabilla");
    App.addCandidate(3, "PEETERS Kris");
    App.addCandidate(3, "BASTIAENS Caroline");
    App.addCandidate(3, "LANJRI Nahima");
    console.log(App.parties);
    console.log(App.candidates);
  },

  addCandidate: function(partyId, name) {
    App.candidates.push({
      id: App.candidates.length+1,
      partyId: partyId,
      name: name,
      voteCount: 0
    })
  },

  checkData: function() {
    console.log(App.parties.length, "party length");
    console.log(App.partyCount, "party count");
    if (App.parties.length == App.partyCount && App.candidates.length == App.candidatesCount) {
      console.log(App.parties, "parties");
      console.log(App.candidates, "candidates");
    }
  },

  render: function() {
    getAllVotes();
    App.getData();
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    $('#location').html(App.location.name);

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      console.log(electionInstance);
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      console.log(candidatesCount, "candidatesCount");
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      for(let i=0;i<App.parties.length;i++) {
        var headerTemplate = "<tr><td><input type='checkbox' onclick='partyClick(value)'  value=" + i + " id='"+ i +"'></td><td></td><td>" + App.parties[i].name + "</td><td></td></tr>";
          candidatesResults.append(headerTemplate);
        for(let j=i*3;j<i*3+3;j++) {
          var template = "<tr><td><input type='checkbox' onclick='buttonClick(value)'  value=" + App.candidates[j].id + " id='can" + App.candidates[j].id +"'></td><td>" + App.candidates[j].id + "</td><td>" + App.candidates[j].name + "</td><td>" + App.parties[i].name +"</td></tr>";
            candidatesResults.append(template);
        }
        var divider = "<tr><td></td><td></td><td></td><td></td></tr>"
        candidatesResults.append(divider);
      }

      /*for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var partyId = candidate[1];
          var name = candidate[2];
          var voteCount = candidate[3];

          // Render candidate Result
          var candidateTemplate = "<tr><td><input type='checkbox' onclick='buttonClick(value)'  value=" + id + "></td><td>" + id + "</td><td>" + name + "</td><td>" + partyId +"</td><tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }*/
      return electionInstance.voted(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
      loader.hide();
      content.show();
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

function getVote() {
  var accountAddress = "0x"+$('#naam').val();
  var electionInstance;
  App.contracts.Election.deployed().then(function(instance) {
    electionInstance = instance;
    return instance.votersParty(accountAddress);
  }).then(function(partyId) {
    electionInstance.parties(partyId).then(function(party) {
      console.log(party);
      $("#partij").html(party[1]);
    })
  });
  App.contracts.Election.deployed().then(function(instance) {
    return instance.votersCandidatesCount(accountAddress);
  }).then(function(votedCount) {
    console.log(votedCount, "voted count");
    $("#partijLeden").empty();
    for (let i=0; i<votedCount; i++) {
      electionInstance.votersCandidates(accountAddress, i).then(function(res) {
        return electionInstance.candidates(res);
      }).then(function(candidate) {
        console.log(candidate);
        $("#partijLeden").append(candidate[2]+"<br>");
      })
    }
  });
}

var arr = [];
var selectedParty = -1;
function buttonClick(value) {
  value = Number(value);
  var selector = "#can" + value;
  console.log(selector);
  if (arr.includes(value)) {
    arr.splice(arr.indexOf(value), 1);
  } else {
    console.log(App.candidates[value-1].partyId, "candidate party id");
    if (arr.length > 0 && App.candidates[value-1].partyId != selectedParty) {
        $(selector).prop('checked', false);
        return;
    }
    arr.push(value);
    var str = '#'+(App.candidates[value-1].partyId-1);
    $(str).attr('checked','checked');
    selectedParty = App.candidates[value-1].partyId;
  }
  console.log(arr);
  console.log(selectedParty);
}

function partyClick(value) {
  selectedParty = value;
  console.log(value);
}

function castVote() {
  App.contracts.Election.deployed().then(function(instance) {
    console.log({
      party: selectedParty,
      candidates: arr,
      location: App.location.id
    });
    return instance.vote(selectedParty, arr, App.location.id, { from: App.account })
  }).then(function(result) {
    // Wait for votes to update
    $("#content").hide();
    $("#loader").show();
  }).catch(function(err) {
    console.error(err);
  });
}

var totalVotes = 0;
parties = [];
var dataChart = [];
chartLoaded = false;

function getAllVotes() {
  totalVotes = 0;
  var electionInstance;
  App.contracts.Election.deployed().then(function(instance) {
    electionInstance = instance;
    return instance.partyCount();
  }).then(function(partyCount) {
    for(let i=1;i<=partyCount;i++) {
      electionInstance.parties(i).then(function(party) {
        totalVotes += Number(party[2]);
        parties.push({
          name: party[1],
          votes: Number(party[2])
        })
        try {
          calcChart();
        } catch(e) {
          console.log(e);
        }
        console.log(parties);
      })
    }
  });
}

function calcChart() {
  if (chartLoaded) {
    return;
  }
  dataChart = [];
  for (let i =0;i<parties.length;i++) {
    dataChart.push({
      politicalParty: parties[i].name,
      votes: parties[i].votes / totalVotes * 100,
      color: getColor(parties[i].name)
    })
  }
  console.log(dataChart, "datachart");
  if (parties.length == 3) {
    chartLoaded = true;
  }
  try {
    createChart(dataChart);
  } catch(e) {
    console.log(e);
  }
}

function getColor(name) {
  if (name === "SP.A") {
    return "#e4010b";
  } else if (name==="N-VA") {
    return "#fbbc19";
  } else {
    return "#f79706";
  }
}
