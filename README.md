# Smart Contract Development for NFT Delegation System
This challenge consists of the implementation of a NFT delegation system. The full description can be found here: [Description of the assignment](assignment_description.md)
## Solution Approaches
To solve the challenge, I have researched three different approaches:
### 1. Delegation Registry
It consists of the implementation of a registry that keeps a record of which NFTs have been delegated to whom. It is the simplest solution and involves platforms and services wishing to support this delegation model to integrate checks against the NFTDelegationRegistry contract, explicitly checking the isDelegateeOf function to verify if a given address is the current delegatee of an NFT.
One decision I've made on this approach was to add a property called `expiry time` to ensure the delegation won't last forever.
#### Improvements
Some improvements that could be added to enhance the security and functionality are:
- To implement a mechanism to replace the usage of `block.timestamp` (which miners can manipulate) in the comparison made on the method isDelegateeOf. Offchian logic can be added to use the `block.number` or an oracle that provides a non-manipulable current timestamp.
- If desirable, add capabilities to prevent the owner of the NFT from using it while it is delegated.
### 2. Proxy Contracts
This approach involves creating a smart contract that acts as a "middleman" between the NFT owner and the delegatee. It would consider the following:
- **Proxy Ownership:** The NFT owner transfers their NFT to a proxy contract, which is programmed to obey commands from the original owner.
- **Delegation Logic:** The proxy contract contains logic that allows specific actions to be performed by the delegatee (as specified by the NFT owner in a granular way). This could include interacting with the NFT in specific ways that do not involve transferring it.
- **Direct Interaction:** The delegatee interacts with the NFT through the proxy contract, which checks if the delegatee is authorized for the requested action.
### 3. Wrapped NFTs
This method involves creating a new ERC721 token (a wrapped NFT) that represents the original NFT. Its implementation would consist of the following:
- **Wrap and Delegate:** The NFT is "wrapped" into a new ERC721 token, which is then transferred to the delegatee. The wrapping contract keeps a record of the original owner.
- **Use and Unwrap:** The delegatee can use the wrapped NFT as if it were the original, within the limitations set by the wrapper contract. The original owner can reclaim their NFT by unwrapping it.
## Extension and Scalability:
This solution could be extended to other types of tokens or assets by abstracting the functionality of delegate and revokeDelegation into a super smart contract and, for every type of token, implementing a concrete method for checking the delegation. For example, in the case of ERC-20 tokens, the delegation could allow the delegatee to spend X tokens or prove that it owns a certain amount.
In terms of efficiency and scalability, the implementation is straightforward to allow a full demonstration of these concepts. Still, the absence of for loops and the correct usage of mappings allow constant complexity to delegating, revoking, and checking delegations.
## Testing and Documentation:
The tests included consist of every possible path of execution and every error returned. There are also tests to check all the events that can be triggered. 
There are tests related to the ERC-721 implementation to ensure that future added functionalities don't break the ownership and transfer functionality.
To set up the project and execute the tests, run the following commands:
```shell
npm install
npx hardhat test
```
### Analyzers
Two static analyzers have been included to perform a basic initial audit on every change in the code.
#### Slither
You can find more info of this tools [here](https://github.com/crytic/slither)

To install this tool you should execute the following: `$ python3 -m pip install slither-analyzer` and to run it over this project you can run `npm run analyzer:slither`.
#### Mythril
You can find more info of this tools [here](https://github.com/Consensys/mythril)

To install this tool you should execute the following: `$ pip3 install mythril` and to run it over this project you can run `npm run analyzer:mythril`.
## Deployment
To deploy the NFTDelegationRegistry smart contract, a coupld of variables (`INFURA_API_KEY` and `MUMBAI_PRIVATE_KEY`) need to be created in the Hardhat environment as follows:
```shell
npx hardhat vars set INFURA_API_KEY
-> it will ask for the value
npx hardhat vars set MUMBAI_PRIVATE_KEY
-> it will ask for the value
```
Once those vars are configured `npm run deploy:mumbai` should be executed to perform a deploy to the Polygon Mumbai testnet. An example can be found [here](https://polygonscan.com/address/0x72fDc2F98E39a7d2aAa1db30e707212EDb3f0714)