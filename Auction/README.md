# Auction-on-EVM
An auction contract written in Vyper.
## Installation Instructions

### Vyper
Follow the installation instruction in the official docs : 
https://vyper.readthedocs.io/en/latest/installing-vyper.html 

### Truffle
npm install -g truffle

### Truper
Truffle doesn't support vyper contracts so we'll use truper to
convert Vyper contracts to json format.
https://github.com/maurelian/truper

After getting code.json file in ./build run 
truffle develop
migrate --reset

To check if contract has been deployed or not, we can run:
code.deployed()
