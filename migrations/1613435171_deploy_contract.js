const Casino = artifacts.require("Casino");
const web3 = require("web3");

module.exports = function (_deployer) {
  // Use deployer to state migration tasks.
  // _deployer.deploy(Casino, web3.utils.toWei("0.1", "ether"));

  _deployer.deploy(Casino);
};
