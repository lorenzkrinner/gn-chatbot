import fs from "fs";
import path from "path";

const instructionsPath = path.resolve(import.meta.dirname, "../../data/instructions.txt");

export function getInstructions() {
  return fs.readFileSync(instructionsPath, "utf8");
};