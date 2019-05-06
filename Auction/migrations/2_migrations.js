var Auction = artifacts.require("code");

module.exports = function(deployer) {
  deployer.deploy(Auction, 10, 5, 137);
};
