import yaml from "js-yaml";
import parseMarkdown from "mdast-util-from-markdown";
import visit from "unist-util-visit-parents";
import semverCompare from "semver/functions/compare";
import fetch from "node-fetch";
import type { Node } from "unist";

const MIN_VER = "10.0.0";

// https://github.com/nodejs/node/tree/master/doc/api
const modules = [
  "assert",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns",
  "domain",
  "events",
  "fs",
  "globals",
  "http",
  "http2",
  "https",
  "inspector",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "tls",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "wasi",
  "webcrypto",
  "worker_threads",
  "zlib",
] as const;
type Module = typeof modules[number];

function assertParsedMetadata(
  meta: string | number | object | null | undefined
): asserts meta is { added: string[] | string } & { [key: string]: string } {
  if (meta === undefined) {
    throw new Error(`Invalid meta: undefined`);
  }
  if (meta === null) {
    throw new Error(`Invalid meta: null`);
  }
  if (typeof meta === "string" || typeof meta === "number") {
    throw new Error(`Invalid meta: ${meta}`);
  }
  if (!("added" in meta)) {
    throw new Error(
      `Invalid meta, must have "added" property: ${JSON.stringify(meta)}`
    );
  }
}

function parseYamlComment(text: string) {
  const yamlContent = text
    .trim()
    .replace(/^<!-- YAML/, "")
    .replace(/-->$/, "");
  const meta = yaml.load(yamlContent);
  assertParsedMetadata(meta);
  return meta;
}

export type ApiRecord = {
  module: string;
  api: string;
  supported: string;
  backported: string[];
};

function rawMarkdownContentUrl(module: Module) {
  return `https://raw.githubusercontent.com/nodejs/node/master/doc/api/${module}.md`;
}

async function getModuleRecord(module: Module): Promise<ApiRecord[]> {
  const docUrl = rawMarkdownContentUrl(module);
  const response = await fetch(docUrl);
  if (!response.ok) {
    console.log(response);
    throw new Error(response.statusText);
  }
  const body = await response.text();

  const tree = parseMarkdown(body);

  const data: ApiRecord[] = [];

  visit(tree, "heading", (node, ancestors) => {
    if (node.depth !== 3) {
      return;
    }
    const parent = ancestors[0];
    const siblings = parent.children as Node[];
    const nodeIdx = siblings.findIndex((child) => child === node);
    const maybeYamlComment = siblings[nodeIdx + 1];
    if (maybeYamlComment.type !== "html") {
      return;
    }
    let meta;
    try {
      meta = parseYamlComment(maybeYamlComment.value as string);
    } catch {
      return;
    }
    if (meta.added == null) {
      return;
    }
    const added = typeof meta.added === "string" ? [meta.added] : meta.added;
    if (
      added.every((ver) => {
        try {
          const res = semverCompare(ver.substring(1), MIN_VER);
          return res === -1;
        } catch {
          return true;
        }
      })
    ) {
      return;
    }
    const sortedVersions = added.sort(
      (ver1, ver2) => -semverCompare(ver1.substring(1), ver2.substring(1))
    );
    const supported = sortedVersions[0];
    const backported: string[] =
      sortedVersions.length === 1 ? [] : sortedVersions.splice(1, 1);

    let maybeApiName: string = (node.children as Node[])[0].value as string;
    if (maybeApiName === "Class: " || maybeApiName === "Event: ") {
      maybeApiName += (node.children as Node[])[1].value;
    }

    data.push({ module, api: maybeApiName, supported, backported });
  });

  return data;
}

export async function getModuleRecords(): Promise<ApiRecord[]> {
  return (await Promise.all(modules.map(getModuleRecord))).flat();
}
