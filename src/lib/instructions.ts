import fs from "fs";

export function getInstructions() {
  return fs.readFileSync("../../data/instructions.txt", "utf8");
};