const path = require("path");
const fs = require("node:fs/promises");
const { exec } = require("node:child_process");

const Ulist = /^\s*- /gim;

const close = `</div></details>`;

const script = `<script>
let isOpen = false;
    function expandCollapse() {
        console.log(isOpen)
        document.querySelectorAll(".folder").forEach(folder => {
            if(isOpen) {
                folder.removeAttribute("open");
                document.getElementById("expand").innerText = '+';
            } else {
                folder.setAttribute("open", "open");
                document.getElementById("expand").innerText = '-';
            }
        })
        isOpen = !isOpen;
    }
</script>`;

function container() {
   
  return "<div class='container'><div id='expand' class='expand' onclick='expandCollapse()'>+</div>";
}

function para(data) {
  return `<p>${data}</p>`;
}

function folder(data, isOpen = false) {
  return `<details class='folder' ${
    isOpen && "open"
  }><summary>${data}</summary><div class="folder-sub">`;
}

// to convert markdown to html
function convert(data) {
  data = data.split("\n");
  let dataHtml = ``;
  let ini = true;
  let i = 0;
  let nested = 0;
  while (i < data.length) {
    if (ini) {
      const regReplaced = data[i].replace(Ulist, "");
      dataHtml += container();
      dataHtml += folder(regReplaced, ini);
      ini = false;
    } else {
      // calc tab space
      const padding = data[i].split("-")[0].length / 4;
      const regReplaced = data[i].replace(Ulist, "");

      if (i + 1 < data.length) {
        // calc tab space
        const successorPadding = data[i + 1].split("-")[0].length / 4;
        if (successorPadding > padding) {
          nested += 1;
          dataHtml += folder(regReplaced);
        } else if (successorPadding === padding) {
          dataHtml += para(regReplaced);
        } else {
          let level = padding - successorPadding;
          // console.log(regReplaced, level, padding, successorPadding);

          dataHtml += para(regReplaced);
          while (level > 0) {
            dataHtml += close;
            level--;
          }
          nested -= 1;
        }
      } else {
        dataHtml += para(regReplaced);
        while (nested > 0) {
          dataHtml += close;
          nested--;
        }
      }
    }
    i++;
  }
  dataHtml += `
   
    </div>
    </details>
   </div>`;
  return dataHtml;
}

async function readStyle() {
  const filePath = path.join(__dirname, `/tree.css`);
  const contents = await fs.readFile(filePath, { encoding: "utf8" });
  return `<style>${contents}</style>`;
}

async function read() {
  const filePath = path.join(__dirname, `/rithik.md`);
  const contents = await fs.readFile(filePath, { encoding: "utf8" });
  return convert(contents);
}

async function write(data) {
  const filePath = path.join(__dirname, `/rithik.html`);
  const style = await readStyle();
  await fs.writeFile(filePath, script + style + data);
}

// read and write
read().then((data) => {
  write(data);
});

// to open generated html in browser
exec("open rithik.html", (error) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
});
