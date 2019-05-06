const Auction = artifacts.require('code')
const assert = require('assert')
// const truffleAssert = require("truffle-assertions");

contract('Auction', accounts => {
    var address_array = new Array()
    const auctioneer = accounts[0];
    const firstBidder = accounts[1];
    const secondBidder = accounts[2];
    const thirdBidder = accounts[3];
    const firstNotary = accounts[4];
    const secondNotary = accounts[5];
    const thirdNotary = accounts[6];

    describe("Assert Contract is deployed", () => {
        let contractInstance;

        beforeEach(async () => {
            contractInstance = await Auction.new(100, 5, 137, { from: auctioneer });
        });

        it("should deploy this contract", async () => {

            var q = await contractInstance.q.call();
            var M = await contractInstance.M_items.call();

            assert.equal(q.toNumber(), 137, "prime no matched");
            assert.equal(M.toNumber(), 5, "no of bidding items matched");

        });
    });

    describe("Fail case", () => {
            it("should revert on invalid form address", async () => {
                try {
                    const instance = await Auction.new(19, 10, 123, {
                        from: "lol"
                    });
                    assert.fail(
                        "should have thrown an error in the above line"
                    );
                } catch (err) {
                    assert.equal(err.message, "invalid address");
                }
            });
    });

    describe("Tests for Notaries", () => {
        let contractInstance;

        beforeEach(async () => {
            contractInstance = await Auction.new(100, 5, 137, { from: auctioneer });
        });

        it("Check if one notary can register", async () => {
            var prevCount = await contractInstance.notary_registered.call();
            await contractInstance.register_notaries({ from: firstNotary });
            var notaryCount = await contractInstance.notary_registered.call();
            assert.equal( Number(notaryCount), Number(prevCount + 1), "num of notaries should be increased by 1" );
        });

        it("Check if multiple notaries can register", async () => {
            var prevCount = await contractInstance.notary_registered.call();
            await contractInstance.register_notaries({ from: firstNotary });
            await contractInstance.register_notaries({ from: secondNotary });
            await contractInstance.register_notaries({ from: thirdNotary });
            var notaryCount = await contractInstance.notary_registered.call();
            assert.equal( Number(notaryCount), Number(prevCount + 3), "3 more notaries should be registered" );
        });

        it("notary cannot register with auctioneer address", async () => {
            try {
                await contractInstance.register_notaries({ from: auctioneer });
            } catch (err) {
                assert.equal(
                    err.message,
                    "VM Exception while processing transaction: revert"
                );
            }
        });

        it("One notary can't register twice", async () => {
            await contractInstance.register_notaries({ from: firstNotary });
            try {
                await contractInstance.register_notaries({ from: firstNotary });
            } catch (err) {
                assert.equal(
                    err.message,
                    "VM Exception while processing transaction: revert"
                );
            }
        });
    });

    describe("Tests for Bidders", () => {
        let contractInstance;

        // since before registering bidders we have to have some notaries
        beforeEach(async () => {
            contractInstance = await Auction.new(100, 5, 137, { from: auctioneer });
            await contractInstance.register_notaries({ from: firstNotary });
            await contractInstance.register_notaries({ from: secondNotary });
            await contractInstance.register_notaries({ from: thirdNotary });
        });

        it("Check if a bidder can register", async () => {
            var prevCount = await contractInstance.bidder_registered.call();
            await contractInstance.register_bidders( [[1, 0], [2, 1]], [5, 6], 2,
                { from: firstBidder,
                    value: web3.toWei(1, "wei")
                }
            );
            // truffleAssert.eventEmitted(result, "bid");
            var bidderCount = await contractInstance.bidder_registered.call();
            assert.equal(Number(bidderCount), Number(prevCount + 1), "num of bidders should increase by 1" );
        });

        it("Check if multiple bidders can register", async () => {
            var prevCount = await contractInstance.bidder_registered.call();
            await contractInstance.register_bidders([[12, 8], [12, 9]], [5, 6], 2, {
                from: firstBidder,
                value: web3.toWei(1, "wei")
            });
            await contractInstance.register_bidders([[7, 1], [12, 9], [11,2]], [4, 6], 3, { 
                from: secondBidder,
                value: web3.toWei(1, "wei")
            });
            await contractInstance.register_bidders([[13, 10], [12, 8]], [3, 4], 2, {
                from: thirdBidder,
                value: web3.toWei(1, "wei")
            });
            var bidderCount = await contractInstance.bidder_registered.call();
            assert.equal( Number(bidderCount), 3, "num of bidders should increase by 3" );
        });

        it("One bidder can't register twice", async () => {
            await contractInstance.register_bidders( [[12, 8], [12, 9]], [5, 6], 2, 
                { from: firstBidder,
                    value: web3.toWei(1, "wei")
                });
            try {
                await contractInstance.register_bidders([[7, 1], [12, 9], [11, 11]], [4, 6], 3,
                    { from: firstBidder, 
                        value: web3.toWei(1, "wei")
                    });
            } catch (err) {
                assert.equal(
                    err.message,
                    "VM Exception while processing transaction: revert"
                );
            }
        });

        // it("bidder should deposit min value of w*sqrt(num_items) wei", async () => {
        //     try {
        //         await instance.register_bidders(
        //             [[12, 8], [12, 9]],
        //             [5, 6],
        //             2,
        //             {
        //                 from: accounts[5],
        //                 value: web3.toWei(1, "wei")
        //             }
        //         );
        //         assert.fail(
        //             "should have thrown an error in the above line"
        //         );
        //     } catch (err) {
        //         assert.equal(
        //             err.message,
        //             "VM Exception while processing transaction: revert"
        //         );
        //     }
        // });

        it("no notary should register as bidder", async () => {
            try {
                await contractInstance.register_bidders( [[12, 8], [12, 9]], [5, 6], 2,
                    {
                        from: firstNotary,
                        value: web3.toWei(1, "wei")
                    }
                );
                assert.fail( "should have thrown an error in the above line" );
            } catch (err) {
                assert.equal(
                    err.message,
                    "VM Exception while processing transaction: revert"
                );
            }
        });
    
    });
    
    describe("Tests for notary assigned", () => {
        let contractInstance;

        // since before registering bidders we have to have some notaries
        beforeEach(async () => {
            contractInstance = await Auction.new(100, 5, 137, { from: auctioneer });
            await contractInstance.register_notaries({ from: firstNotary });
            await contractInstance.register_notaries({ from: secondNotary });
            await contractInstance.register_notaries({ from: thirdNotary });
        });
        
        it("Check if one bidder is assigned a notary", async () => {
            await contractInstance.register_bidders([[13, 10], [12, 8]], [3, 4], 2, {from : firstBidder,
                value: web3.toWei(1, "wei")
            });
            var yes1 = contractInstance.check_mapping(firstNotary, firstBidder);
            var yes2 = contractInstance.check_mapping(secondNotary, firstBidder);
            var yes3 = contractInstance.check_mapping(thirdNotary, firstBidder);
            assert(Number(yes1 + yes2 + yes3), 1, "got mapped to one notary");
        });

        it("Check if multiple bidders are assigned notaries", async () => {
            await contractInstance.register_bidders([[13, 10], [12, 8]], [3, 4], 2, { from: firstBidder,
                value: web3.toWei(1, "wei")
             });
            await contractInstance.register_bidders([[7, 10], [12, 4]], [4, 6], 2, { from: secondBidder,
                value: web3.toWei(1, "wei")
             });
            var yes1 = contractInstance.check_mapping(firstNotary, firstBidder);
            var yes4 = contractInstance.check_mapping(firstNotary, secondBidder);
            var yes2 = contractInstance.check_mapping(secondNotary, firstBidder);
            var yes5 = contractInstance.check_mapping(secondNotary, secondBidder);
            var yes3 = contractInstance.check_mapping(thirdNotary, firstBidder);
            var yes6 = contractInstance.check_mapping(thirdNotary, secondBidder);
            assert(Number(yes1 + yes2 + yes3), 1, "got mapped to one notary");
            assert(Number(yes4 + yes5 + yes6), 1, "got mapped to one notary");
        });
    });

     describe("Tests related to Winners", () => {
        let contractInstance;
        beforeEach(async () => {
            instance = await Auction.new(100, 10, 19, { from: auctioneer });
            await contractInstance.register_notaries({ from: firstNotary });
            await contractInstance.register_notaries({ from: secondNotary });
            await contractInstance.register_notaries({ from: thirdNotary });

            await contractInstance.register_bidders([[12, 8], [12, 9]], [3, 6], 2, {
                from: firstBidder,
                value: web3.toWei(1, "wei")
            });

            await contractInstance.register_bidders([[7, 1], [12, 9], [11, 11]], [5, 7], 3, { 
                from: secondBidder, 
                value: web3.toWei(1, "wei") 
            });

            await contractInstance.register_bidders([[13, 10], [12, 8]], [5, 5], 2, {
                from: thirdBidder,
                value: web3.toWei(1, "wei")
            });
        });
        it("check sorted list", async () => {
            var result = await contractInstance.insertionSort();
            // console.log(result);
            assert(result[0] == secondBidder, "first one is second bidder");
            assert(result[1] == thirdBidder, "first one is second bidder");
            assert(result[2] == firstBidder, "first one is second bidder");
        });
    });

})