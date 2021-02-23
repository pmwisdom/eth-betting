const Casino = artifacts.require("Casino");
const Web3 = require("web3");

const etherBetAmount = web3.utils.toWei("0.3", "ether");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Casino", function (accounts) {
  let instance;
  const [ownerAccount, ...playerAccounts] = accounts;
  const accountsWithBets = playerAccounts.map((account, i) => ({
    from: account,
    value: etherBetAmount,
    number: i + 1,
  }));

  let web3;

  before(async () => {
    instance = await Casino.deployed();
    web3 = new Web3("http://127.0.0.1:8545");
  });

  it("Should Construct a valid Casino contract", async function () {
    const name = await instance.getName();

    assert.equal(name, "Casino");
  });

  it("Should return a list of accounts", () => {
    return assert.isTrue(accounts.length > 0);
  });

  it("Should let all players bet", async () => {
    // Speed this up by running in parallel
    for (betInfo of accountsWithBets) {
      const { number, ...rest } = betInfo;

      await instance.bet(number, rest);
    }

    const firstPlayer = playerAccounts[0];

    const player = await instance.players(0);
    const playerInfo = await instance.playerInfo.call(firstPlayer);
    const returnedNumSelected = playerInfo["numberSelected"]["words"][0];
    const allPlayingAccounts = await instance.getPlayers();

    assert.equal(player, firstPlayer);
    assert.equal(returnedNumSelected, 1);
    assert.equal(allPlayingAccounts.length, playerAccounts.length);
  });

  it("Should not let a player bet twice", async () => {
    const { number, ...rest } = accountsWithBets[0];

    try {
      await instance.bet(number, rest);
      assert.fail("Betting Player played twice");
    } catch (err) {
      assert.isOk(err, "Player could not bet");
    }
  });

  it("Should succesfully end the betting and give all money to the player that bet on 1", async () => {
    const winner = playerAccounts[0];
    const loser = playerAccounts[1];

    const winnerBalanceBefore = parseInt(await web3.eth.getBalance(winner), 0);
    const loserBalanceBefore = parseInt(await web3.eth.getBalance(loser), 0);

    await instance.setTestWinningNumber(1, { from: ownerAccount });
    await instance.completeBettingRound({ from: ownerAccount });

    const winnerBalanceAfter = parseInt(await web3.eth.getBalance(winner), 0);
    const loserBalanceAfter = parseInt(await web3.eth.getBalance(loser), 0);

    assert.isAbove(winnerBalanceAfter, winnerBalanceBefore);
    assert.equal(loserBalanceBefore, loserBalanceAfter);
  });
});
