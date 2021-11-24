import { join, posix } from "path";
import OSS from "ali-oss";
import globby from "globby";
import pRetry from "p-retry";
import { getInput } from "@actions/core";

async function main() {
  const prefix = getInput("prefix");
  const folder = getInput("folder");

  const store = new OSS({
    accessKeyId: getInput("access-key-id"),
    accessKeySecret: getInput("access-key-secret"),
    bucket: getInput("bucket"),
    endpoint: getInput("endpoint"),
  });

  const files = await globby(getInput("patterns").split(","), { cwd: folder });

  console.log(files.map((file) => posix.join(prefix, file)));

  if (process.env.SKIP_PUT !== "true") {
    await Promise.all(
      files.map((file) =>
        pRetry(
          () =>
            store
              // .put(posix.join(prefix, file), join(folder, file))
              .multipartUpload(posix.join(prefix, file), join(folder, file), {})
              .catch((err) => {
                console.error(err);
                throw new Error("Failed to fetch");
              }),
          {
            retries: 5,
          }
        )
      )
    );
  }

  console.log("done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
