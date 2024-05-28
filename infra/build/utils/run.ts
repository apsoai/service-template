import { spawn, spawnSync } from "child_process";

export class Command {
  cmd: string;
  args: string[];

  constructor(cmd: string, args: string[]) {
    this.cmd = cmd;
    this.args = args;
  }
}

export const runSyncCommand = (
  command: Command,
  targetPath?: string
): string => {
  const spawnOptions: { cwd?: string } = {};
  if (targetPath) {
    spawnOptions["cwd"] = targetPath;
  }

  console.log(
    `Running command ${command.cmd} ${command.args} - ${JSON.stringify(
      spawnOptions
    )} }`
  );
  try {
    const result = spawnSync(command.cmd, command.args, spawnOptions);
    if (result.stderr) {
      console.log(result.stderr.toString());
    }
    if (result.stdout) {
      console.log(result.stdout.toString());
      return result.stdout.toString();
    }
    return "";
  } catch (err) {
    console.log("error running sync command", command.cmd, command.args, err);
    throw err;
  }
};

const handleNonZeroStatus = (
  status: number,
  command: Command,
  stackTrace: string
) => {
  console.log("OUTPUT:::: ", stackTrace);
  console.log(
    `'${command.cmd} ${command.args[0]}' failed with status ${status}`
  );
};

export const runCommand = async (
  command: Command,
  targetPath?: string
): Promise<string> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Promise((resolve: any, reject) => {
    const spawnOptions: { cwd?: string } = {};
    let stackTrace = "";
    if (targetPath) {
      spawnOptions["cwd"] = targetPath;
    }
    console.log(
      `Running command ${command.cmd} ${command.args} - ${JSON.stringify(
        spawnOptions
      )} }`
    );

    const proc = spawn(command.cmd, command.args, spawnOptions);

    proc.on("close", (status: number) => {
      if (status != 0) {
        handleNonZeroStatus(status, command, stackTrace);
        reject(
          JSON.stringify({
            command: `${command.cmd} ${command.args[0]} - ${status}`,
          })
        );
        return;
      }

      resolve(stackTrace);
    });

    proc.on("error", (error) => {
      console.log(`Caught error - ${error}`);
    });

    proc.stderr.on("data", (data) => {
      data = data.toString();
      // console.log("data", data);
      stackTrace += data;
    });
  });
};
