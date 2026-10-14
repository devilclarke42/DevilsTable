import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { releaseContract, REPOSITORY } from "./release-contract.mjs";

const manifest=JSON.parse(readFileSync("module.json","utf8")), contract=releaseContract(manifest);
const commit=process.env.GITHUB_SHA;
if(process.env.GITHUB_REPOSITORY!==REPOSITORY || process.env.GITHUB_REF!=="refs/heads/main" || !/^[a-f0-9]{40}$/.test(commit??"")) throw Error("Publishing requires the main branch of the official repository.");
const gh=(args,input)=>{
  const result=spawnSync("gh",args,{input,encoding:"utf8",env:{...process.env,GH_REPO:REPOSITORY}});
  if(result.status!==0)throw Error(result.stderr || "GitHub release command failed.");
  return result.stdout;
};
const api=(path,method="GET",body)=>JSON.parse(gh(["api",`repos/${REPOSITORY}/${path}`,"--method",method,...(body?["--input","-"]:[])],body?JSON.stringify(body):undefined));
const zip=resolve("dist",contract.filename);
const digest=file=>createHash("sha256").update(readFileSync(file)).digest("hex");
// A repeat run never deletes/replaces a published version. Retry only a matching draft.
let release;
const existing=spawnSync("gh",["api",`repos/${REPOSITORY}/releases/tags/${contract.tag}`],{encoding:"utf8",env:process.env});
if(existing.status===0)release=JSON.parse(existing.stdout);
else if(!existing.stderr.includes("HTTP 404"))throw Error(existing.stderr);
if(release && release.target_commitish!==commit)throw Error("This version already belongs to another source commit. Bump the version.");
if(!release)release=api("releases","POST",{tag_name:contract.tag,target_commitish:commit,name:`Devil's Table ${manifest.version}`,draft:true,prerelease:true,make_latest:"false",body:`Alpha installer release targeting Foundry V14 and D&D5e 5.3.3 (2014 rules).\n\nIncludes the completed merchant framework, corrected Fence stock generation and consolidated documentation. Foundry/system verified metadata reflects owner-reported target-world testing; broader live acceptance remains pending. Original project distribution licensing remains undecided; retained third-party notices still apply. This is not the public beta.\n\nSource commit: ${commit}\n\nInstaller manifest: ${contract.manifest}\n\n[Changelog](https://github.com/${REPOSITORY}/blob/${contract.tag}/CHANGELOG.md)`});
const assets=new Set(release.assets.map(a=>a.name));
if(release.draft){
  const upload=[zip,"module.json"].filter(file=>!assets.has(file.split(/[\\/]/).at(-1)));
  if(upload.length)gh(["release","upload",contract.tag,...upload]);
}
const temp=mkdtempSync(join(tmpdir(),"devils-table-release-"));
try {
  gh(["release","download",contract.tag,"--dir",temp,"--pattern",contract.filename,"--pattern","module.json"]);
  if(digest(join(temp,contract.filename))!==digest(zip)||digest(join(temp,"module.json"))!==digest("module.json"))throw Error("Uploaded assets differ from the validated package/manifest; publication stopped.");
} finally {rmSync(temp,{recursive:true,force:true});}
if(release.draft)gh(["release","edit",contract.tag,"--draft=false","--prerelease","--latest=false"]);
console.log(`Published verified alpha assets: https://github.com/${REPOSITORY}/releases/tag/${contract.tag}`);
