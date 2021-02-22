pragma solidity 0.7.4;

contract Casino {
    address payable public owner;
    uint256 public minimumBet;
    uint256 public totalBet;
    uint256 public numberOfBets;
    uint256 public maxAmountOfBets = 2;
    address payable[] public players;

    string public name;

    struct Player {
        uint256 amountBet;
        uint256 numberSelected;
        bool doesExist;
    }
    // The address of the player and => the user info
    mapping(address => Player) public playerInfo;

    constructor() {
        owner = msg.sender;
        name = "Casino";
        minimumBet = 1;

        // if (_minimumBet != 0) minimumBet = _minimumBet;
    }

    function getName() public view returns (string memory) {
        return (name);
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function kill() public {
        if (msg.sender == owner) selfdestruct(owner);
    }

    function bet(uint256 numberSelected) public payable {
        require(!checkPlayerExists(msg.sender));
        require(numberSelected >= 1 && numberSelected <= 10);
        require(msg.value >= minimumBet);

        playerInfo[msg.sender].amountBet = msg.value;
        playerInfo[msg.sender].numberSelected = numberSelected;
        playerInfo[msg.sender].doesExist = true;

        numberOfBets++;
        players.push(msg.sender);
        totalBet += msg.value;

        if (numberOfBets >= maxAmountOfBets) generateNumberWinner();
    }

    function checkPlayerExists(address player) public view returns (bool) {
        // if (playerInfo[player].doesExist) {
        //     return true;
        // }

        // return false;

        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == player) return true;
        }
        return false;
    }

    function generateNumberWinner() public {
        uint256 numberGenerated = (block.number % 10) + 1; // This isn't secure
        distributePrizes(numberGenerated);
    }

    // Sends the corresponding ether to each winner depending on the total bets
    function distributePrizes(uint256 numberWinner) public {
        address payable[100] memory winners; // We have to create a temporary in memory array with fixed size
        uint256 count = 0; // This is the count for the array of winners

        for (uint256 i = 0; i < players.length; i++) {
            address payable playerAddress = players[i];
            if (playerInfo[playerAddress].numberSelected == numberWinner) {
                winners[count] = playerAddress;
                count++;
            }
            delete playerInfo[playerAddress]; // Delete all the players
        }

        delete players;

        uint256 winnerEtherAmount = totalBet / winners.length; // How much each winner gets
        for (uint256 i = 0; i < count; i++) {
            if (winners[i] != address(0))
                // Check that the address in this fixed array is not empty
                winners[i].transfer(winnerEtherAmount);
        }
    }
}
