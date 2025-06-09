import fs from "fs";

export function getInstructions<String>() {
  return fs.readFileSync("../../data/instructions.txt", "utf8");
};