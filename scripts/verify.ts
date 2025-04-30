import { run } from "hardhat";

/**
 * Verifies contract source code on Etherscan
 * @param contractAddress The address of the deployed contract
 * @param constructorArguments The arguments passed to the contract constructor
 */
export async function verify(contractAddress: string, constructorArguments: any[]) {
  console.log(`Verifying contract at ${contractAddress}`);
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments,
    });
    console.log("Contract verified successfully");
  } catch (error: any) {
    if (error.message.includes("already verified")) {
      console.log("Contract already verified");
    } else {
      console.error("Error verifying contract:", error);
    }
  }
} 