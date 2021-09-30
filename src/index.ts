import { join } from "path";
import OSS from "ali-oss";
import globby from "globby";
import { getInput } from "@actions/core";

async function main() {
  const folder = getInput("folder");

  const store = new OSS({
    accessKeyId: getInput("access-key-id"),
    accessKeySecret: getInput("access-key-secret"),
    bucket: getInput("bucket"),
    endpoint: getInput("endpoint"),
  });

  const files = await globby("**/*", { cwd: folder });

  console.log(files);

  if (process.env.SKIP_PUT !== "true") {
    await Promise.all(files.map((file) => store.put(file, join(folder, file))));
  }

  console.log("done");
}

main();
