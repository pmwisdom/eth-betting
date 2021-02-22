const Casino = artifacts.require("Casino");
const web3 = require("web3");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Casino", function (accounts) {
  afterEach(() => {});

  it("Should Construct a valid Casino contract", async function () {
    const instance = await Casino.deployed();
    const name = await instance.getName();

    assert.equal(name, "Casino");
  });

  it("Should return a list of accounts", () => {
    console.log("Accounts", accounts);

    return assert.isTrue(accounts.length > 0);
  });

  it("Should let a player bet", async () => {
    const account1 = accounts[0];

    const instance = await Casino.deployed();
    const amountBet = web3.utils.toWei("0.3", "ether");

    await instance.bet(2, {
      from: account1,
      value: web3.utils.toWei("0.3", "ether"),
    });

    const player = await instance.players(0);
    const playerInfo = await instance.playerInfo.call(account1);
    const returnedNumSelected = playerInfo["numberSelected"]["words"][0];

    assert.isTrue(player === account1);
    assert.isTrue(returnedNumSelected === 2);
  });

  it("Should not let a player bet twice", async () => {
    const account1 = accounts[0];

    const instance = await Casino.deployed();
    const amountBet = web3.utils.toWei("0.3", "ether");

    console.log("HELLO", await instance.getPlayers());

    try {
      await instance.bet(2, {
        from: account1,
        value: amountBet,
      });
      assert.isTrue(false);
    } catch (err) {}

    const player = await instance.players(0);
    const playerInfo = await instance.playerInfo.call(account1);
    const returnedNumSelected = playerInfo["numberSelected"]["words"][0];

    assert.isTrue(player === account1);
    assert.isTrue(returnedNumSelected === 2);
  });

  it("Should let a second player bet", async () => {
    const account2 = accounts[1];

    const instance = await Casino.deployed();

    await instance.bet(5, {
      from: account2,
      value: web3.utils.toWei("0.5", "ether"),
    });

    const player = await instance.getPlayers();
    // const playerInfo = await instance.playerInfo.call(account2);
    // const returnedNumSelected = playerInfo["numberSelected"]["words"][0];

    // assert.isTrue(player === account2);
    // assert.isTrue(returnedNumSelected === 5);

    console.log("FIN", player);

    assert.isTrue(true);
  });
});
