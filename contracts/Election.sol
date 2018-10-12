pragma solidity ^0.4.24;

contract Election {
    struct Location {
      uint id;
      uint validAddressAmount;
      address[] validAddresses;
    }

    struct Party {
      uint id;
      string name;
      uint voteCount;
    }

    // Model a Candidate
    struct Candidate {
        uint id;
        uint partyId;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => uint) public votersParty;
    mapping(address => uint[]) public votersCandidates;
    mapping(address => uint) public votersCandidatesCount;
    mapping(address => bool) public voted;
    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;

    mapping (uint => Party) public parties;
    uint public partyCount;

    mapping (uint => Location) public locations;
    uint public locationCount;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );

    constructor() {
        address[] memory a = new address[](2);
        a[0] = 0x0260C4873d8C3d9ABe737450516D266dA391e2f5;
        a[1] = 0xa00e6969C7B59122B76c0fFcb8C87A1809FEfF3F;
        addLocation(a);
        addParty("SP.A");
        addParty("N-VA");
        addParty("CD&V");
        addCandidate("BEELS Jinnih",1);
        addCandidate("MEEUWS Tom",1);
        addCandidate("TURAN Güler",1);
        addCandidate("DE WEVER Bart",2);
        addCandidate("DE RIDDER Annick",2);
        addCandidate("AIT DAOUD Nabilla",2);
        addCandidate("PEETERS Kris",3);
        addCandidate("BASTIAENS Caroline",3);
        addCandidate("LANJRI Nahima",3);
    }

    function addCandidate (string _name, uint _partyId) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _partyId, _name, 0);
    }

    function addParty(string _name) {
        partyCount++;
        parties[partyCount] = Party(partyCount, _name, 0);
    }

    function addLocation(address[] _validAddresses) {
        locationCount++;
        locations[locationCount] = Location(locationCount, _validAddresses.length, _validAddresses);
    }

    function vote (uint _partyId, uint[] _candidateIds, uint _locationId) public {
        // require that they haven't voted before
        require(!voted[msg.sender]);

        bool found = false;
        for (uint j=0; j<locations[_locationId].validAddressAmount; j++) {
          if (locations[_locationId].validAddresses[j] == msg.sender) {
            found = true;
            break;
          }
        }

        require(found);

        // record that voter has voted
        voted[msg.sender] = true;

        parties[_partyId].voteCount++;

        // update candidate vote Count
        for (uint i=0; i<_candidateIds.length; i++) {
          uint id = _candidateIds[i];
          require(id > 0 && id <= candidatesCount && candidates[id].partyId == _partyId);
          candidates[id].voteCount ++;
          votersCandidates[msg.sender].push(id);
          votersCandidatesCount[msg.sender] = votersCandidatesCount[msg.sender] + 1;
        }

        votersParty[msg.sender] = _partyId;

        // trigger voted event
        emit votedEvent(_partyId);
    }
}
