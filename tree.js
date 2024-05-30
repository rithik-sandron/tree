import { green, blue } from "https://deno.land/std/fmt/colors.ts";

const SPACE = " ";
const LINE = "├── ";
const LINE_LAST = "└── ";
const NEW_LINE = "\n";
const DIR_SLASH = "/";

let tree = "";

function addPadding(pad, lvl) {
  const e = pad / lvl;
  for (let i = 0; i < lvl; i++) {
    if (pad > 0) {
      tree += "│";
      tree += SPACE.repeat(e);
    }
  }
}

async function show(dr) {
  tree += "\n" + green(dr) + "\n";
  await construct(0, dr, 0);
  return tree;
}

async function construct(pad, dr, lvl) {
  let iterator = await Deno.readDir(dr)[Symbol.asyncIterator]();
  let d = await iterator.next();
  while (!d.done) {
    d = d.value;
    const next = await iterator.next();
    if (d.isDirectory) {
      addPadding(pad, lvl);
      tree += (next.done ? LINE_LAST : LINE) + blue(d.name) + NEW_LINE;
      await construct(pad + 3, dr + DIR_SLASH + d.name, lvl + 1);
    } else if (d.isFile) {
      addPadding(pad, lvl);
      tree += (next.done ? LINE_LAST : LINE) + d.name + NEW_LINE;
    }
    d = next;
  }
}

const res = await show(Deno.args[0] ? Deno.args[0] : ".")
console.log(res);
