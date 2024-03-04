import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";

const INFURA_API_KEY = vars.get("INFURA_API_KEY");
const MUMBAI_PRIVATE_KEY = vars.get("MUMBAI_PRIVATE_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [MUMBAI_PRIVATE_KEY]
    },
  },
};

export default config;
