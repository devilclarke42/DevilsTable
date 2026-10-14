import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "./helpers.js";
import { releaseContract, INSTALLER_MANIFEST } from "../tools/release-contract.mjs";
const manifest=await readJson("module.json");
test("installer manifest and download track one versioned alpha artifact",()=>{
 const contract=releaseContract(manifest);assert.equal(contract.manifest,INSTALLER_MANIFEST);
 assert.ok(contract.download.includes(`/v${manifest.version}/`));assert.equal(contract.filename,`devils-table-v${manifest.version}.zip`);
 for(const patch of [{download:"https://github.com/wrong/archive.zip"},{manifest:"https://github.com/example/module.json"},{compatibility:{minimum:"14",maximum:"14"}}])assert.throws(()=>releaseContract({...manifest,...patch}));
});
