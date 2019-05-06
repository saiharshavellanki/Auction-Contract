var Auction = artifacts.require('Auction');
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
contract('Auction', accounts => {
	const auctioneer = accounts[0];
	describe('constructor', () => {
		describe('Success', () => {
			it('Auctioneer invokes the contract', async () => {
				try {
					const auction = await Auction.new(19,10,2, { from: auctioneer });
					var ad = await auction.Auctioneer.call();
					assert.equal(ad,auctioneer,"Auctioner couldnt invoke with valid arguments");
				} catch (err) {
					assert.isUndefined(err.message);
				}
			});
		});
		describe('Expected Failure case', () => {
			it('Auctioneer invokes the contract with invalid arguments', async () => {
				try {
					const auction = await Auction.new(50,10,2, { from: auctioneer });
				} catch (err) {
					assert.isUndefined(err.message,'Enter valid arguments');
				}
			});
		});
	});

	describe('Notaries Registration', () => {
		let auction;
		beforeEach(async () => {
			auction = await Auction.new(19,10,2, { from: auctioneer });
		});

		describe('Success', () => {
			it('Adding distinct notaries', async () => {
				try {
					await sleep(1000);
					await auction.RegisterNotary({ from: accounts[1] });
					await auction.RegisterNotary({ from: accounts[2] });
					await auction.RegisterNotary({ from: accounts[3] });
					await auction.RegisterNotary({ from: accounts[4] });
				} catch (err) {
					assert.isUndefined(err.message,'Distinct notaries cant be added');
				}
			});
		});
	});


	describe('Notaries Registration', () => {
		let auction;
		beforeEach(async () => {
			auction = await Auction.new(19,10,2, { from: auctioneer });
			await sleep(1000);
			await auction.RegisterNotary({from : accounts[1]});
		});

		describe('Expected Failure case', () => {
			it('Auctioneer tries to register as notary', async () => {
				try {
					await auction.RegisterNotary({ from: auctioneer });
				} catch (err) {
					assert.isUndefined(err.message,'Auctioneer cant be added as notary');
				}
			});
		});


		describe('Expected Failure case', () => {
			it('Same Notary tries to register twice', async () => {
				try {
					await auction.RegisterNotary({from : accounts[1]});
				} catch (err) {
					assert.equal(err.message,'Cannot register notary twice');
				}
			});
		});
	});

	describe('Bidders Registration', () => {
		let auction;
		beforeEach(async () => {
			auction = await Auction.new(19,10,2, { from: auctioneer });
			await sleep(1000);
			await auction.RegisterNotary({ from: accounts[1] });
			await auction.RegisterNotary({ from: accounts[2] });
			await auction.RegisterNotary({ from: accounts[3] });
			await auction.RegisterNotary({ from: accounts[4] });
		});
		
		describe('Expected Failure case', () => {
			it('Auctioneer tries to register as bidder', async () => {
				try {
					await auction.RegisterBidder([[1,2],[2,3]],[4,5],{from : auctioneer,value:web3.toWei(100,'wei')});
				} catch (err) {
					assert.equal(err.message,'Cannot register Auctioneer');
				}
			});
		});
		describe('Expected Failure case', () => {
			it('Bidder tries to register with invalid item', async () => {
				try {
					await auction.RegisterBidder([[1,2],[2,9]],[4,5],{from : auctioneer,value:web3.toWei(100,'wei')});
				} catch (err) {
					assert.equal(err.message,'An item is invalid');
				}
			});
		});

		describe('Expected Failure case', () => {
			it('Notary tries to register as Bidder', async () => {
				try {
					await auction.RegisterBidder([[1,2],[2,3]],[4,5],{from : accounts[2],value:web3.toWei(100,'wei')});
				} catch (err) {
					assert.equal(err.message,'Cannot register notary as bidder');
				}
			});
		});
	});
	describe('Bidders Registration', () => {
		let auction;
		beforeEach(async () => {
			auction = await Auction.new(19,10,2, { from: auctioneer });
			await sleep(1000);
			await auction.RegisterNotary({ from: accounts[1] });
			await auction.RegisterNotary({ from: accounts[2] });
			await auction.RegisterNotary({ from: accounts[3] });
			await auction.RegisterNotary({ from: accounts[4] });
			await auction.RegisterBidder([[13,10],[12,8]],[3,4],{ from: accounts[5],value:web3.toWei(100,'wei')});
		});
		describe('Expected Failure case', () => {
			it('Same Bidder tries to register', async () => {
				try {
					await auction.RegisterBidder([[1,2],[2,3]],[4,5],{from : accounts[5],value:web3.toWei(100,'wei')});

				} catch (err) {
					assert.equal(err.message,'cannot register bidder twice');
				}
			});
		});
		describe('Expected Failure case', () => {
			it('Bidder with less money tries to register', async () => {
				try {
					await auction.RegisterBidder([[1,2],[2,3]],[4,5],{from : accounts[6],value:web3.toWei(1,'wei')});
				} catch (err) {
					assert.equal(err.message,'Bidder has less money');
				}
			});
		});
		describe('Success', () => {
			it('Distinct bidders register', async () => {
				try {
					await auction.RegisterBidder([[7,1],[12,9],[11,11]],[4,6],{from : accounts[6],value:web3.toWei(100,'wei')});
					await auction.RegisterBidder([[12,9],[12,8]],[5,6],{from : accounts[7],value:web3.toWei(100,'wei')});
					var bd1 = await auction.bidder_addresses.call(0);
					var bd2 = await auction.bidder_addresses.call(1);
					var bd3 = await auction.bidder_addresses.call(2);
					assert.equal(bd1,accounts[5],"bidder1 not added properly");
					assert.equal(bd2,accounts[6],"bidder2 not added properly");
					assert.equal(bd3,accounts[7],"bidder3 not added properly");
				} catch (err) {
					assert.equal(err.message,'Distinct bidders couldnt be added');
				}
			});
		});
	});
	describe('Algorithm Verification', () => {
		let auction;
		beforeEach(async () => {
			auction = await Auction.new(19,10,2, { from: auctioneer });
			await sleep(1000);
			await auction.RegisterNotary({ from: accounts[1] });
			await auction.RegisterNotary({ from: accounts[2] });
			await auction.RegisterNotary({ from: accounts[3] });
			await auction.RegisterNotary({ from: accounts[4] });
			await auction.RegisterBidder([[13,10],[12,8]],[3,4],{ from: accounts[5], value:web3.toWei(100,'wei')});
			await auction.RegisterBidder([[7,1],[12,9],[11,11]],[4,6],{from : accounts[6], value:web3.toWei(100,'wei')});
			await auction.RegisterBidder([[12,9],[12,8]],[5,6],{from : accounts[7], value:web3.toWei(100,'wei')});
		});
		describe('Expected Failure case', () => {
			it('Person other than Auctioneer tries to call sort', async () => {
				try {
					await auction.insertion_sort({from : accounts[8]});
				}catch(err){
					assert.equal(err.message,'Only auctioneer need to call sort function');
				}
			});
		});
		describe('Success', () => {
			it('Auctioneer tries to call sort', async () => {
				try {
					await auction.insertion_sort({from : auctioneer});
					var bd1 = await auction.bidder_addresses.call(0);
					var bd2 = await auction.bidder_addresses.call(1);
					var bd3 = await auction.bidder_addresses.call(2);
					assert.equal(bd1,accounts[7],"bidder1 not added properly");
					assert.equal(bd2,accounts[6],"bidder2 not added properly");
					assert.equal(bd3,accounts[5],"bidder3 not added properly");

				}catch(err){
					assert.equal(err.message,'sort function not implemented properly');
				}
			});
		});
	});
	describe('Winners Selection', () => {
		let auction;
		beforeEach(async () => {
			auction = await Auction.new(19,10,2, { from: auctioneer });
			await sleep(1000);
			await auction.RegisterNotary({ from: accounts[1] });
			await auction.RegisterNotary({ from: accounts[2] });
			await auction.RegisterNotary({ from: accounts[3] });
			await auction.RegisterNotary({ from: accounts[4] });
			await auction.RegisterBidder([[13,10],[12,8]],[3,4],{ from: accounts[5], value:web3.toWei(100,'wei')});
			await auction.RegisterBidder([[7,1],[12,9],[11,11]],[4,6],{from : accounts[6], value:web3.toWei(100,'wei')});
			await auction.RegisterBidder([[12,9],[12,8]],[5,6],{from : accounts[7], value:web3.toWei(100,'wei')});
			await auction.insertion_sort({from : auctioneer});
		});
		describe('Expected Failure case', () => {
			it('Person other than Auctioneer tries to call winner selection', async () => {
				try {
					await auction.Winners_Selection({from : accounts[8]});
				}catch(err){
					assert.equal(err.message,'Only auctioneer need to call Winner_Selection function');
				}
			});
		});
		describe('Success', () => {
			it('Auctioneer tries to call winner selection', async () => {
				try {
					await auction.Winners_Selection({from : auctioneer});
					var winner = await auction.winners.call(0);
					assert.equal(winner,accounts[7],"mistake in winner algorithm");
				}catch(err){
					assert.equal(err.message,'Winners_Selection function not implemented properly');
				}
			});
		});
	});	
	describe('Winners Payment', () => {
		let auction;
		beforeEach(async () => {
			auction = await Auction.new(31,25,2, { from: auctioneer });
			await sleep(1000);
			await auction.RegisterNotary({ from: accounts[1] });
			await auction.RegisterNotary({ from: accounts[2] });
			await auction.RegisterNotary({ from: accounts[3] });
			await auction.RegisterNotary({ from: accounts[4] });
			await auction.RegisterBidder([[12,8],[12,9]],[5,6],{ from: accounts[5], value:web3.toWei(100,'wei')});
			await auction.RegisterBidder([[12,8],[12,7]],[3,4],{from : accounts[6], value:web3.toWei(100,'wei')});
			await auction.RegisterBidder([[12,7]],[2,3],{from : accounts[7], value:web3.toWei(100,'wei')});
			await auction.RegisterBidder([[12,5]],[1,3],{from : accounts[8], value:web3.toWei(100,'wei')});
			await auction.insertion_sort({from : auctioneer});
			await auction.Winners_Selection({from : auctioneer});
		});
		describe('Expected Failure case', () => {
			it('Person other than Auctioneer tries to call winner Payments', async () => {
				try {
					await auction.Winner_Payment({from : accounts[8]});
				}catch(err){
					assert.equal(err.message,'Only auctioneer need to call Winner_Payment function');
				}
			});
		});
		describe('Success', () => {
			it('Auctioneer tries to call winner Payments', async () => {
				try {
					await auction.Winner_Payment({from : auctioneer});
					var w1 = await auction.money.call(0);
					var w2 = await auction.money.call(1);
					var w3 = await auction.money.call(2);
					assert.equal(Number(w1),11,"Enough money not deducted from winner-1");
					assert.equal(Number(w2),0,"Enough money not deducted from winner-2");
					assert.equal(Number(w3),4,"Enough money not deducted from winner-3");
				}catch(err){
					assert.equal(err.message,'Error in Winner_Payment function');
				}
			});
		});
	});
});
