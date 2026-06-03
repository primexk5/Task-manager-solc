require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("Deploying TaskManager contract...");

  const TaskManager = await hre.ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy();

  await taskManager.waitForDeployment();

  const address = await taskManager.getAddress();
  console.log(`TaskManager deployed to: ${address}`);

  console.log(`\nVerify with: npx hardhat verify --network sepolia ${address}`);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
